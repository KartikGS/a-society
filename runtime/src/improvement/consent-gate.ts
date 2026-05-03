import {
  defaultConsentState,
  normalizeConsentState,
} from '../common/types.js';
import type {
  ConsentCheckRequest,
  ConsentMode,
  ConsentRequest,
  ConsentResponseDecision,
  ConsentState,
  OperatorRenderSink,
} from '../common/types.js';

const WRITE_TOOLS = new Set(['edit_file', 'write_file']);

interface QueueEntry {
  request: ConsentRequest;
  resolve: (result: 'proceed' | 'deny') => void;
}

function normalizeCommand(command: string): string {
  return command.trim();
}

function hasShellControlSyntax(command: string): boolean {
  return /[\n\r;&|<>`$(){}[\]]/.test(command);
}

function isSafeRelativeToken(token: string): boolean {
  if (!token || token.startsWith('-')) return true;
  if (token.startsWith('/') || token.includes('\\')) return false;
  return !token.split('/').some((part) => part === '..');
}

export function isAutoAllowedBashCommand(command: string): boolean {
  const normalized = normalizeCommand(command);
  if (!normalized || hasShellControlSyntax(normalized)) return false;
  const tokens = normalized.split(/\s+/);
  if (tokens.some((token) => token.includes('*') || token.includes('?'))) return false;

  const [binary, ...args] = tokens;
  if (binary === 'pwd') return args.length === 0;
  if (binary === 'ls') return args.every(isSafeRelativeToken);
  return false;
}

function buildConsentRequest(request: ConsentCheckRequest): ConsentRequest | null {
  if (WRITE_TOOLS.has(request.toolName)) {
    return {
      kind: 'file-write',
      toolName: request.toolName,
      path: typeof request.input?.path === 'string' ? request.input.path : '(missing path)',
    };
  }

  if (request.toolName === 'run_command') {
    return {
      kind: 'bash-command',
      toolName: 'run_command',
      command: typeof request.input?.command === 'string' ? normalizeCommand(request.input.command) : '',
    };
  }

  return null;
}

function commandKey(request: ConsentRequest): string | undefined {
  return request.kind === 'bash-command' ? normalizeCommand(request.command) : undefined;
}

export class ConsentGateImpl {
  private state: ConsentState;
  private queue: QueueEntry[] = [];
  private inFlight: QueueEntry | null = null;
  private operatorRenderer: OperatorRenderSink | null;

  constructor(
    initial: ConsentState = defaultConsentState(),
    operatorRenderer: OperatorRenderSink | null = null
  ) {
    this.state = normalizeConsentState(initial);
    this.operatorRenderer = operatorRenderer;
  }

  getState(): ConsentState {
    return normalizeConsentState(this.state);
  }

  getInFlightRequest(): ConsentRequest | null {
    return this.inFlight?.request ?? null;
  }

  setOperatorRenderer(renderer: OperatorRenderSink): void {
    this.operatorRenderer = renderer;
  }

  async check(rawRequest: ConsentCheckRequest, signal?: AbortSignal): Promise<'proceed' | 'deny'> {
    const request = buildConsentRequest(rawRequest);
    if (!request) return 'proceed';

    if (this.isGranted(request)) return 'proceed';

    return new Promise<'proceed' | 'deny'>((resolve) => {
      const entry: QueueEntry = { request, resolve };

      if (signal?.aborted) {
        resolve('deny');
        return;
      }

      signal?.addEventListener('abort', () => {
        this.abortEntry(entry);
      }, { once: true });

      this.queue.push(entry);
      this.drain();
    });
  }

  respond(decision: ConsentResponseDecision): void {
    if (!this.inFlight) return;
    const entry = this.inFlight;
    this.inFlight = null;

    if (decision === 'allow_flow') {
      this.state.mode = 'partial-access';
      this.grantForFlow(entry.request);
    }

    this.operatorRenderer?.emit({
      kind: 'consent.resolved',
      request: entry.request,
      decision,
    });

    entry.resolve(decision === 'deny' ? 'deny' : 'proceed');

    if (decision === 'allow_flow') {
      this.drainGranted();
    }
    this.drain();
  }

  setMode(mode: ConsentMode): void {
    if (this.state.mode === mode) return;
    this.state.mode = mode;

    if (mode === 'full-access') {
      if (this.inFlight) {
        const entry = this.inFlight;
        this.inFlight = null;
        entry.resolve('proceed');
      }

      const queued = this.queue.splice(0);
      for (const entry of queued) {
        entry.resolve('proceed');
      }
    }

    this.operatorRenderer?.emit({ kind: 'consent.mode_changed', mode });
  }

  private isGranted(request: ConsentRequest): boolean {
    if (request.kind === 'bash-command' && isAutoAllowedBashCommand(request.command)) {
      return true;
    }

    if (this.state.mode === 'full-access') return true;
    if (this.state.mode === 'no-access') return false;

    if (request.kind === 'file-write') {
      return this.state.fileWrites.allowAllEditsThisFlow;
    }

    const key = commandKey(request);
    return Boolean(key && this.state.bash.allowedCommands[key]);
  }

  private grantForFlow(request: ConsentRequest): void {
    if (request.kind === 'file-write') {
      this.state.fileWrites.allowAllEditsThisFlow = true;
      return;
    }

    const key = commandKey(request);
    if (!key) return;
    this.state.bash.allowedCommands[key] = {
      command: request.command,
      grantedAt: new Date().toISOString(),
    };
  }

  private drain(): void {
    if (this.inFlight || this.queue.length === 0) return;

    const entry = this.queue.shift()!;
    if (this.isGranted(entry.request)) {
      entry.resolve('proceed');
      this.drain();
      return;
    }

    this.inFlight = entry;
    this.operatorRenderer?.emit({
      kind: 'consent.requested',
      request: entry.request,
    });
  }

  private drainGranted(): void {
    const remaining: QueueEntry[] = [];
    for (const entry of this.queue) {
      if (this.isGranted(entry.request)) {
        entry.resolve('proceed');
      } else {
        remaining.push(entry);
      }
    }
    this.queue = remaining;
  }

  private abortEntry(entry: QueueEntry): void {
    if (this.inFlight === entry) {
      this.inFlight = null;
      entry.resolve('deny');
      this.drain();
      return;
    }
    const idx = this.queue.indexOf(entry);
    if (idx !== -1) {
      this.queue.splice(idx, 1);
      entry.resolve('deny');
    }
  }

  /** Called only for explicit runtime cancellation; reconnects replay the in-flight request. */
  abortInFlight(): void {
    if (!this.inFlight) return;
    const entry = this.inFlight;
    this.inFlight = null;
    entry.resolve('deny');

    const queued = this.queue.splice(0);
    for (const q of queued) {
      q.resolve('deny');
    }
  }
}
