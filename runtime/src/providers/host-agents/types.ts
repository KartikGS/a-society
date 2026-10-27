import type { HostAgentId } from '../../../shared/settings.js';

export type { HostAgentId };

/** Optional capabilities an adapter declares; shared code applies the fallback when one is absent. */
export interface HostCapabilities {
  systemPromptMode: 'append-file' | 'replace-file' | 'none';
  /** true: the runtime picks the conversation id before the first turn. */
  assignsConversationId: boolean;
  modelFlag: boolean;
  listModels: boolean;
  permissionDenialReport: boolean;
  extraDirs: boolean;
  liveEvents: boolean;
  rateLimitReport: boolean;
}

export interface HostProbe {
  installed: boolean;
  executablePath: string | null;
  version: string | null;
  versionSupported: boolean;
  /** null when the host cannot report it. */
  loggedIn: boolean | null;
  authMethod: string | null;
  subscriptionType: string | null;
}

export interface HostPermissionProfile {
  mode: 'read-only' | 'edits' | 'edits-and-commands';
  /** Exact commands the operator granted. */
  allowedCommands: string[];
  /** Fully qualified MCP tool names (mcp__server__tool). */
  allowedMcpTools: string[];
  /** Absolute directories the host may read but not write. */
  readOnlyRoots: string[];
}

export interface HostTurnRequest {
  conversationId: string;
  resume: boolean;
  systemPromptFile: string | null;
  /** Delivered on stdin, never as an argument. */
  message: string;
  cwd: string;
  extraWritableDirs: string[];
  permissions: HostPermissionProfile;
  /** null uses the host's default model. */
  model: string | null;
}

export type HostLiveEvent =
  /** One new assistant text block, delivered as a delta like the API path's text deltas. */
  | { kind: 'text'; text: string }
  | { kind: 'tool_call'; toolName: string; path?: string; command?: string }
  | { kind: 'tool_result'; toolName: string; isError: boolean }
  | { kind: 'rate_limit'; fiveHour?: number; sevenDay?: number };

export interface HostPermissionDenial {
  toolName: string;
  input: Record<string, unknown>;
}

export type HostTurnResult =
  | {
      kind: 'completed';
      text: string;
      conversationId: string;
      contextUsage?: number;
      finishReason?: string;
      permissionDenials: HostPermissionDenial[];
    }
  | { kind: 'conversation-missing' }
  | { kind: 'malformed'; detail: string; stderrTail: string };

export interface HostAgentAdapter {
  readonly id: HostAgentId;
  readonly displayName: string;
  /** Command name looked up on PATH when no executable path is configured. */
  readonly executableName: string;
  readonly supportedVersions: SupportedVersionRange;
  readonly capabilities: HostCapabilities;
  probe(executablePath: string | null): Promise<HostProbe>;
  /**
   * Runs one headless turn. Auth, rate-limit and abort conditions throw
   * `LLMGatewayError`; launch problems throw `HostAgentError`.
   */
  runTurn(
    req: HostTurnRequest,
    onEvent: (event: HostLiveEvent) => void,
    signal: AbortSignal,
    executablePath: string | null
  ): Promise<HostTurnResult>;
}

export interface SupportedVersionRange {
  min: string;
  maxExclusive: string;
}

export type HostAgentErrorType = 'NOT_INSTALLED' | 'UNSUPPORTED_VERSION' | 'UNSUPPORTED_HOST' | 'SPAWN_FAILED';

export class HostAgentError extends Error {
  constructor(
    public readonly type: HostAgentErrorType,
    message: string
  ) {
    super(message);
    this.name = 'HostAgentError';
  }
}
