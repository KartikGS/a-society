import {
  CONSENT_CHECK_RESULT,
  defaultConsentState,
  normalizeConsentState,
} from '../common/types.js';
import {
  CONSENT_MODE,
  CONSENT_RESPONSE_DECISION,
} from '../common/protocol-constants.js';
import { parseRoleIdentity } from '../common/role-id.js';
import type {
  ConsentCheckRequest,
  ConsentCheckResult,
  ConsentMode,
  ConsentRequest,
  ConsentResponseDecision,
  ConsentState,
  OperatorRenderSink,
} from '../common/types.js';

const WRITE_TOOLS = new Set(['edit_file', 'write_file']);
const GLOBAL_CONSENT_ROLE_KEY = '__global__';

interface InFlightEntry {
  request: ConsentRequest;
  resolve: (result: ConsentCheckResult) => void;
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

function parseMcpToolName(toolName: string): { serverName: string; toolDisplayName: string } | null {
  if (!toolName.startsWith('mcp__')) return null;
  const remainder = toolName.slice('mcp__'.length);
  const separatorIndex = remainder.indexOf('__');
  if (separatorIndex <= 0 || separatorIndex === remainder.length - 2) return null;
  return {
    serverName: remainder.slice(0, separatorIndex),
    toolDisplayName: remainder.slice(separatorIndex + 2),
  };
}

function buildArgsPreview(input: Record<string, unknown> | undefined): string {
  try {
    const serialized = JSON.stringify(input ?? {});
    return serialized.length > 240 ? `${serialized.slice(0, 237)}...` : serialized;
  } catch {
    return '[unserializable arguments]';
  }
}

function buildConsentRequest(request: ConsentCheckRequest): ConsentRequest | null {
  if (WRITE_TOOLS.has(request.toolName)) {
    return {
      kind: 'file-write',
      toolName: request.toolName,
      path: typeof request.input?.path === 'string' ? request.input.path : '(missing path)',
      nodeId: request.nodeId,
      role: request.role,
    };
  }

  if (request.toolName === 'run_command') {
    return {
      kind: 'bash-command',
      toolName: 'run_command',
      command: typeof request.input?.command === 'string' ? normalizeCommand(request.input.command) : '',
      nodeId: request.nodeId,
      role: request.role,
    };
  }

  const mcpTool = parseMcpToolName(request.toolName);
  if (mcpTool) {
    return {
      kind: 'mcp-tool',
      toolName: request.toolName,
      serverName: mcpTool.serverName,
      toolDisplayName: mcpTool.toolDisplayName,
      argsPreview: buildArgsPreview(request.input),
      nodeId: request.nodeId,
      role: request.role,
    };
  }

  return null;
}

function commandKey(request: ConsentRequest): string | undefined {
  return request.kind === 'bash-command' ? normalizeCommand(request.command) : undefined;
}

function mcpToolKey(request: ConsentRequest): string | undefined {
  return request.kind === 'mcp-tool' ? request.toolName : undefined;
}

function requestRoleKey(requestOrRole: ConsentRequest | string | undefined): string {
  const role = typeof requestOrRole === 'string' ? requestOrRole : requestOrRole?.role;
  return role ? parseRoleIdentity(role).instanceRoleId : GLOBAL_CONSENT_ROLE_KEY;
}

export class ConsentGateImpl {
  private state: ConsentState;
  private inFlightByRole = new Map<string, InFlightEntry>();
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

  getInFlightRequests(): ConsentRequest[] {
    return Array.from(this.inFlightByRole.values()).map((entry) => entry.request);
  }

  setOperatorRenderer(renderer: OperatorRenderSink): void {
    this.operatorRenderer = renderer;
  }

  async check(rawRequest: ConsentCheckRequest, signal?: AbortSignal): Promise<ConsentCheckResult> {
    const request = buildConsentRequest(rawRequest);
    if (!request) return CONSENT_CHECK_RESULT.PROCEED;

    if (this.isGranted(request)) return CONSENT_CHECK_RESULT.PROCEED;

    return new Promise<ConsentCheckResult>((resolve) => {
      if (signal?.aborted) {
        resolve(CONSENT_CHECK_RESULT.DENY);
        return;
      }

      const entry: InFlightEntry = { request, resolve };
      const roleKey = requestRoleKey(request);
      this.inFlightByRole.set(roleKey, entry);
      this.operatorRenderer?.emit({ kind: 'consent.requested', request: entry.request });

      signal?.addEventListener('abort', () => {
        this.abortEntry(entry);
      }, { once: true });
    });
  }

  respond(decision: ConsentResponseDecision, role: string): void {
    const entry = this.resolveInFlightEntry(role);
    if (!entry) return;

    if (decision === CONSENT_RESPONSE_DECISION.ALLOW_FLOW) {
      this.state.mode = CONSENT_MODE.PARTIAL_ACCESS;
      this.grantForFlow(entry.request);
    }

    this.operatorRenderer?.emit({
      kind: 'consent.resolved',
      request: entry.request,
      decision,
    });

    entry.resolve(decision === CONSENT_RESPONSE_DECISION.DENY
      ? CONSENT_CHECK_RESULT.DENY
      : CONSENT_CHECK_RESULT.PROCEED);

    if (decision === CONSENT_RESPONSE_DECISION.ALLOW_FLOW) {
      this.resolveGrantedInFlight(decision);
    }
  }

  setMode(mode: ConsentMode): void {
    if (this.state.mode === mode) return;
    this.state.mode = mode;

    if (mode === CONSENT_MODE.FULL_ACCESS) {
      const inFlight = Array.from(this.inFlightByRole.values());
      this.inFlightByRole.clear();
      for (const entry of inFlight) {
        entry.resolve(CONSENT_CHECK_RESULT.PROCEED);
      }
    }

    this.operatorRenderer?.emit({ kind: 'consent.mode_changed', mode });
  }

  private isGranted(request: ConsentRequest): boolean {
    if (request.kind === 'bash-command' && isAutoAllowedBashCommand(request.command)) {
      return true;
    }

    if (this.state.mode === CONSENT_MODE.FULL_ACCESS) return true;
    if (this.state.mode === CONSENT_MODE.NO_ACCESS) return false;

    // partial-access: file writes always allowed; bash/MCP only if previously approved
    if (request.kind === 'file-write') return true;

    const command = commandKey(request);
    if (command) return Boolean(this.state.bash.allowedCommands[command]);

    const mcpTool = mcpToolKey(request);
    return Boolean(mcpTool && this.state.mcp.allowedTools[mcpTool]);
  }

  private grantForFlow(request: ConsentRequest): void {
    if (request.kind === 'file-write') return;

    const command = commandKey(request);
    if (command && request.kind === 'bash-command') {
      this.state.bash.allowedCommands[command] = {
        command: request.command,
        grantedAt: new Date().toISOString(),
      };
      return;
    }

    const mcpTool = mcpToolKey(request);
    if (mcpTool) {
      this.state.mcp.allowedTools[mcpTool] = {
        toolName: request.toolName,
        grantedAt: new Date().toISOString(),
      };
    }
  }

  private resolveGrantedInFlight(decision: ConsentResponseDecision): void {
    for (const [roleKey, entry] of Array.from(this.inFlightByRole.entries())) {
      if (!this.isGranted(entry.request)) continue;
      this.inFlightByRole.delete(roleKey);
      this.operatorRenderer?.emit({
        kind: 'consent.resolved',
        request: entry.request,
        decision,
      });
      entry.resolve(CONSENT_CHECK_RESULT.PROCEED);
    }
  }

  private abortEntry(entry: InFlightEntry): void {
    const roleKey = requestRoleKey(entry.request);
    if (this.inFlightByRole.get(roleKey) === entry) {
      this.inFlightByRole.delete(roleKey);
      this.operatorRenderer?.emit({
        kind: 'consent.resolved',
        request: entry.request,
        decision: CONSENT_RESPONSE_DECISION.DENY,
      });
      entry.resolve(CONSENT_CHECK_RESULT.DENY);
    }
  }

  private resolveInFlightEntry(role: string): InFlightEntry | null {
    const roleKey = requestRoleKey(role);
    const entry = this.inFlightByRole.get(roleKey);
    if (!entry) return null;
    this.inFlightByRole.delete(roleKey);
    return entry;
  }

  /** Called only for explicit runtime cancellation; reconnects replay the in-flight requests. */
  abortInFlight(): void {
    const inFlight = Array.from(this.inFlightByRole.values());
    this.inFlightByRole.clear();
    for (const entry of inFlight) {
      this.operatorRenderer?.emit({
        kind: 'consent.resolved',
        request: entry.request,
        decision: CONSENT_RESPONSE_DECISION.DENY,
      });
      entry.resolve(CONSENT_CHECK_RESULT.DENY);
    }
  }
}
