import { defaultConsentState } from '../common/types.js';
import type {
  ConsentClass,
  ConsentDecision,
  ConsentGate,
  ConsentMode,
  ConsentState,
  OperatorRenderSink,
} from '../common/types.js';

const TOOL_CLASS_MAP: Record<string, ConsentClass> = {
  edit_file: 'file-writes',
  write_file: 'file-writes',
  run_command: 'shell-network',
  web_search: 'shell-network',
};

function classDecisionKey(cls: ConsentClass): 'fileWrites' | 'shellNetwork' {
  return cls === 'file-writes' ? 'fileWrites' : 'shellNetwork';
}

interface QueueEntry {
  toolName: string;
  toolClass: ConsentClass;
  resolve: (result: 'proceed' | 'deny') => void;
}

export class ConsentGateImpl implements ConsentGate {
  private state: ConsentState;
  private queue: QueueEntry[] = [];
  private inFlight: QueueEntry | null = null;
  private operatorRenderer: OperatorRenderSink | null;

  constructor(
    initial: ConsentState = defaultConsentState(),
    operatorRenderer: OperatorRenderSink | null = null
  ) {
    this.state = { ...initial };
    this.operatorRenderer = operatorRenderer;
  }

  getState(): ConsentState {
    return { ...this.state };
  }

  getInFlightRequest(): { toolClass: ConsentClass; toolName: string } | null {
    if (!this.inFlight) return null;
    return { toolClass: this.inFlight.toolClass, toolName: this.inFlight.toolName };
  }

  setOperatorRenderer(renderer: OperatorRenderSink): void {
    this.operatorRenderer = renderer;
  }

  async check(toolName: string, signal?: AbortSignal): Promise<'proceed' | 'deny'> {
    const toolClass = TOOL_CLASS_MAP[toolName];
    if (!toolClass) {
      // Read tools and unknown tools pass through without consent
      return 'proceed';
    }

    if (this.state.mode === 'full-access') {
      return 'proceed';
    }

    const key = classDecisionKey(toolClass);
    if (this.state[key] === 'granted') {
      return 'proceed';
    }
    if (this.state[key] === 'denied') {
      return 'deny';
    }

    // pending — enqueue a consent request
    return new Promise<'proceed' | 'deny'>((resolve) => {
      const entry: QueueEntry = { toolName, toolClass, resolve };

      if (signal?.aborted) {
        resolve('deny');
        return;
      }

      signal?.addEventListener('abort', () => {
        this._abortEntry(entry);
      }, { once: true });

      this.queue.push(entry);
      this._drain();
    });
  }

  respond(decision: 'granted' | 'denied'): void {
    if (!this.inFlight) return;
    const entry = this.inFlight;
    this.inFlight = null;

    const key = classDecisionKey(entry.toolClass);
    (this.state[key] as ConsentDecision) = decision;

    this.operatorRenderer?.emit({
      kind: 'consent.resolved',
      toolClass: entry.toolClass,
      decision,
    });

    entry.resolve(decision === 'granted' ? 'proceed' : 'deny');

    // Drain remaining queue entries for the same class (they now have a decision)
    this._drainResolved(entry.toolClass, decision);
    this._drain();
  }

  setMode(mode: ConsentMode): void {
    if (this.state.mode === mode) return;
    this.state.mode = mode;

    this.operatorRenderer?.emit({ kind: 'consent.mode_changed', mode });

    if (mode === 'full-access') {
      // Grant both classes and resolve anything in-flight or queued
      this.state.fileWrites = 'granted';
      this.state.shellNetwork = 'granted';

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
  }

  private _drain(): void {
    if (this.inFlight || this.queue.length === 0) return;

    const entry = this.queue.shift()!;

    // Re-check: the decision may have been set while this entry was queued
    const key = classDecisionKey(entry.toolClass);
    const current = this.state[key];
    if (current === 'granted') {
      entry.resolve('proceed');
      this._drain();
      return;
    }
    if (current === 'denied') {
      entry.resolve('deny');
      this._drain();
      return;
    }

    this.inFlight = entry;
    this.operatorRenderer?.emit({
      kind: 'consent.requested',
      toolClass: entry.toolClass,
      toolName: entry.toolName,
    });
  }

  private _drainResolved(toolClass: ConsentClass, decision: 'granted' | 'denied'): void {
    const result: 'proceed' | 'deny' = decision === 'granted' ? 'proceed' : 'deny';
    const remaining: QueueEntry[] = [];
    for (const entry of this.queue) {
      if (entry.toolClass === toolClass) {
        entry.resolve(result);
      } else {
        remaining.push(entry);
      }
    }
    this.queue = remaining;
  }

  private _abortEntry(entry: QueueEntry): void {
    if (this.inFlight === entry) {
      this.inFlight = null;
      entry.resolve('deny');
      this._drain();
      return;
    }
    const idx = this.queue.indexOf(entry);
    if (idx !== -1) {
      this.queue.splice(idx, 1);
      entry.resolve('deny');
    }
  }

  /** Called when the WebSocket for this flow closes mid-request */
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
