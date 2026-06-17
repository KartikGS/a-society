import {
  CONSENT_MODE,
  CONSENT_MODES,
} from './protocol-constants.js';
import type {
  ProtocolAwaitingHumanReason,
  ProtocolConsentMode,
  ProtocolConsentResponseDecision,
  FeedbackConsentStatus,
  ProtocolImprovementChoiceMode,
} from './protocol-constants.js';
import type {
  ProviderReasoningDisplay,
  ProviderReasoningReplayPolicy,
} from './model-reasoning.js';

export type FlowStatus =
  | 'running'
  | 'awaiting_improvement_choice'
  | 'awaiting_feedback_consent'
  | 'completed';

export const CURRENT_FLOW_STATE_VERSION = '11';

export type ConsentMode = ProtocolConsentMode;
export type ConsentRequestKind = 'file-write' | 'bash-command' | 'mcp-tool';
export type ConsentResponseDecision = ProtocolConsentResponseDecision;
export type AwaitingHumanReason = ProtocolAwaitingHumanReason;

export type ConsentRequest =
  | { kind: 'file-write'; toolName: string; path: string; nodeId: string; role: string }
  | { kind: 'bash-command'; toolName: 'run_command'; command: string; nodeId: string; role: string }
  | {
      kind: 'mcp-tool';
      toolName: string;
      serverName: string;
      toolDisplayName: string;
      argsPreview: string;
      nodeId: string;
      role: string;
    };

export interface ConsentCheckRequest {
  toolName: string;
  input?: Record<string, unknown>;
  nodeId: string;
  role: string;
}

export const CONSENT_CHECK_RESULT = {
  PROCEED: 'proceed',
  DENY: 'deny',
} as const;

export type ConsentCheckResult = typeof CONSENT_CHECK_RESULT[keyof typeof CONSENT_CHECK_RESULT];

export interface ConsentState {
  mode: ConsentMode;
  bash: {
    allowedCommands: Record<string, { command: string; grantedAt: string }>;
  };
  mcp: {
    allowedTools: Record<string, { toolName: string; grantedAt: string }>;
  };
}

export type FeedbackContextKind = 'standard' | 'initialization' | 'update';

export interface FeedbackContext {
  kind: FeedbackContextKind;
  initializationMode?: 'takeover' | 'greenfield';
  updateFromVersion?: string;        // version the project's a-docs were at when an update flow started
  updateToVersion?: string;          // canonical current version the update targets
}

export function defaultConsentState(): ConsentState {
  return {
    mode: CONSENT_MODE.NO_ACCESS,
    bash: {
      allowedCommands: {},
    },
    mcp: {
      allowedTools: {},
    },
  };
}

function isConsentMode(value: unknown): value is ConsentMode {
  return typeof value === 'string' && (CONSENT_MODES as readonly string[]).includes(value);
}

export function normalizeConsentState(raw: unknown): ConsentState {
  const fallback = defaultConsentState();
  if (!raw || typeof raw !== 'object') return fallback;

  const source = raw as Record<string, any>;
  const mode: ConsentMode = isConsentMode(source.mode) ? source.mode : fallback.mode;

  const allowedCommandsSource = source.bash?.allowedCommands;
  const allowedCommands: Record<string, { command: string; grantedAt: string }> = {};
  if (allowedCommandsSource && typeof allowedCommandsSource === 'object') {
    for (const [key, value] of Object.entries(allowedCommandsSource as Record<string, any>)) {
      if (!value || typeof value !== 'object' || typeof value.command !== 'string') continue;
      allowedCommands[key] = {
        command: value.command,
        grantedAt: typeof value.grantedAt === 'string' ? value.grantedAt : new Date(0).toISOString(),
      };
    }
  }

  const allowedToolsSource = source.mcp?.allowedTools;
  const allowedTools: Record<string, { toolName: string; grantedAt: string }> = {};
  if (allowedToolsSource && typeof allowedToolsSource === 'object') {
    for (const [key, value] of Object.entries(allowedToolsSource as Record<string, any>)) {
      if (!value || typeof value !== 'object' || typeof value.toolName !== 'string') continue;
      allowedTools[key] = {
        toolName: value.toolName,
        grantedAt: typeof value.grantedAt === 'string' ? value.grantedAt : new Date(0).toISOString(),
      };
    }
  }

  return {
    mode,
    bash: { allowedCommands },
    mcp: { allowedTools },
  };
}

export interface ConsentGate {
  check(request: ConsentCheckRequest, signal?: AbortSignal): Promise<ConsentCheckResult>;
  respond(decision: ConsentResponseDecision, role: string): void;
  setMode(mode: ConsentMode): void;
  getState(): ConsentState;
  getInFlightRequests(): ConsentRequest[];
}

export interface HandoffTarget {
  target_node_id: string;
  artifact_path: string | null;
}

export type HandoffResult =
  | { kind: 'targets'; targets: HandoffTarget[] }
  | { kind: 'forward-pass-closed' }
  | { kind: 'meta-analysis-complete'; findingsPath: string }
  | { kind: 'backward-pass-complete'; artifactPath: string }
  | { kind: 'awaiting_human' }
  | { kind: 'await-handoff' };

export interface ImprovementPhaseState {
  status: 'awaiting_choice' | 'running' | 'awaiting_feedback_consent' | 'completed' | 'skipped';
  mode?: ProtocolImprovementChoiceMode;
  completedRoles: string[];                    // role-instance ids that have finished their improvement session
  runningRoles: string[];                      // role-instance ids with context injected but not yet completed
  awaitingHumanRoles?: Record<string, { reason: AwaitingHumanReason }>; // role-instance ids blocked on human input
  pendingHumanInputs?: Record<string, { text: string; receivedAt: string }>; // human replies queued per role-instance id
  findingsProduced: Record<string, string>;    // role-instance id -> findings file path (repo-relative)
  improvementWorkflowPath?: string;            // repo-relative path to runtime-generated improvement.yaml
  feedbackArtifactPath?: string;               // repo-relative path assigned for optional upstream feedback
  feedbackConsent?: FeedbackConsentStatus;
  singleRole?: boolean;                        // true when the workflow has only one unique base role
}

export interface FlowRun {
  flowId: string;
  workspaceRoot: string;
  projectNamespace: string;            // project subfolder name (e.g. "a-society")
  recordFolderPath: string;
  recordName?: string;
  recordSummary?: string;
  runningNodes: string[];                         // node IDs claimed by a live runtime turn
  awaitingHumanNodes: Record<string, { role: string; reason: AwaitingHumanReason }>;
  pendingHumanInputs: Record<string, { text: string; receivedAt: string }>; // durable operator replies queued for scheduler consumption
  visitedNodeIds: string[];                       // node IDs whose first-entry workflow guidance has already been delivered
  completedHandoffs: string[];                     // `${from}=>${to}` edge keys for forward handoffs that have been made; removed on backward handoff
  receivingHandoff: Record<string, string[]>;      // `${from}=>${to}` → artifacts sent along that handoff (forward or backward), appended on each traversal
  historyHandoff: Record<string, string[]>;        // `${from}=>${to}` → all artifacts ever sent along that handoff (deduplicated); used to reject reuse
  awaitingHandoff: string[];                       // node IDs currently suspended waiting for an inbound handoff
  status: FlowStatus;
  stateVersion: string;                        // Persistence version; current writes use CURRENT_FLOW_STATE_VERSION
  improvementPhase?: ImprovementPhaseState;    // Present only when improvement is in progress
  feedbackContext?: FeedbackContext;           // Runtime-owned context for the optional upstream feedback step
  consentState?: ConsentState;
}

export interface FlowRef {
  projectNamespace: string;
  flowId: string;
}

export interface FlowSummary extends FlowRef {
  status: FlowStatus;
  recordFolderPath: string;
  openable: boolean;
  stateVersion: string;
  recordName?: string;
  recordSummary?: string;
  updatedAt?: string;
}

export interface RoleSession {
  roleName: string;
  logicalSessionId: string;
  transcriptHistory: unknown[];
  currentNodeContext?: {
    nodeId: string;
    exchanges: RuntimeMessageParam[];
  };
  compactionArchives?: Array<{
    id: string;
    trigger: 'manual' | 'auto';
    nodeId: string;
    compactedAt: string;
    archivedTranscriptHistory: RuntimeMessageParam[];
    replacementMessage: RuntimeMessageParam;
  }>;
  isActive: boolean;
  currentNodeId?: string;
  systemPrompt?: string;
  latestContextUsage?: number;
}


export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  parseError?: string;
}

export type ProviderReasoningBlock =
  | { provider: 'anthropic'; type: 'thinking'; thinking: string; signature: string }
  | {
      provider: 'openai-compatible';
      type: 'message-field';
      field: string;
      content: string;
      replay: ProviderReasoningReplayPolicy;
    };

export type RuntimeMessageParam =
  | { role: 'user';                content: string }
  | { role: 'assistant';           content: string }
  | { role: 'assistant_tool_calls'; calls: ToolCall[]; text?: string; providerReasoning?: ProviderReasoningBlock[] }
  | { role: 'tool_result';         callId: string; toolName: string; content: string; isError: boolean };

export interface RoleTurnResult {
  handoff: HandoffResult;
  contextUsage?: number;
  awaitingHumanReason?: AwaitingHumanReason;
}

export type OperatorEvent =
  | { kind: 'role.active'; nodeId: string; role: string }
  | { kind: 'role.resumed'; nodeId: string; role: string; reason: 'interrupted-turn' }
  | { kind: 'activity.tool_call'; role: string; toolName: string; path?: string; command?: string }
  | { kind: 'activity.tool_result'; role: string; toolName: string; isError: boolean }
  | { kind: 'handoff.applied'; fromNodeId: string; fromRole: string; targets: Array<{ nodeId: string; role: string }> }
  | { kind: 'repair.requested'; scope: 'node' | 'improvement'; code: string; summary: string; role?: string; nodeId?: string }
  | { kind: 'human.awaiting_input'; nodeId: string; role: string; reason: AwaitingHumanReason }
  | { kind: 'role.configured'; nodeId: string; role: string; modelDisplayName?: string; skillNames?: string[]; mcpServerNames?: string[] }
  | { kind: 'role.auto_selection_started'; nodeId: string; role: string }
  | { kind: 'role.auto_configured'; nodeId: string; role: string }
  | { kind: 'role.auto_selection_fell_back'; nodeId: string; role: string; dimensions: Array<'model' | 'skills' | 'mcp'>; reason: string }
  | { kind: 'human.resumed'; nodeId: string; role: string }
  | { kind: 'usage.turn_summary'; role?: string; contextUsage?: number }
  | { kind: 'session.compaction_started'; role: string; trigger: 'manual' | 'auto' }
  | { kind: 'session.compaction_failed'; role: string; trigger: 'manual' | 'auto'; reason: string }
  | { kind: 'session.compacted'; role: string; nodeId: string; trigger: 'manual' | 'auto'; archiveId: string }
  | { kind: 'mcp.server_unavailable'; role: string; nodeId: string; serverName: string; reason: string }
  | { kind: 'mcp.tool_unavailable'; role: string; nodeId: string; serverName: string; toolName: string; reason: string }
  | { kind: 'provider.reasoning_trace'; role: string; label: string; text: string; display: Exclude<ProviderReasoningDisplay, 'hidden'> }
  | { kind: 'flow.forward_pass_closed' }
  | { kind: 'flow.completed' }
  | { kind: 'consent.requested'; request: ConsentRequest }
  | { kind: 'consent.resolved'; request: ConsentRequest; decision: ConsentResponseDecision }
  | { kind: 'consent.mode_changed'; mode: ConsentMode };

export interface OperatorRenderSink {
  emit(event: OperatorEvent): void;
  requestSent(role: string, provider: string, model: string): void;
  receivingResponse(role: string): void;
  responseEnd(role: string): void;
  sendError(message: string): void;
}

export type OperatorFeedMessage =
  | { type: 'operator_event'; event: OperatorEvent }
  | { type: 'output_text'; role: string; text: string }
  | { type: 'input_text'; role?: string; text: string }
  | { type: 'error'; message: string };

export type FeedItemType =
  | 'assistant'
  | 'user'
  | 'event'
  | 'error'
  | 'handoff'
  | 'resume'
  | 'repair'
  | 'reasoning'
  | 'tool'
  | 'tool-success'
  | 'tool-error'
  | 'activation';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  label: string;
  text: string;
  reasoningDisplay?: Exclude<ProviderReasoningDisplay, 'hidden'>;
}

export interface TurnOptions {
  signal?: AbortSignal;
  outputStream?: NodeJS.WritableStream;
  operatorRenderer?: OperatorRenderSink;
  consentGate?: ConsentGate;
  roleInstanceId?: string;
  nodeId?: string;
  onConversationMessages?: (messages: RuntimeMessageParam[]) => void | Promise<void>;
  onAssistantTextDelta?: (text: string) => void;
}

export interface GatewayTurnResult {
  text: string;
  contextUsage?: number;
  finishReason?: string;
}

export type ProviderTurnResult =
  | { type: 'text';       text: string;                                                   contextUsage?: number; finishReason?: string }
  | { type: 'tool_calls'; calls: ToolCall[]; continuationMessages: RuntimeMessageParam[]; contextUsage?: number; finishReason?: string };

export interface LLMProvider {
  executeTurn(
    systemPrompt: string,
    messages: RuntimeMessageParam[],
    tools?: ToolDefinition[],
    options?: TurnOptions
  ): Promise<ProviderTurnResult>;
}

export class LLMGatewayError extends Error {
  constructor(
    public readonly type: 'AUTH_ERROR' | 'RATE_LIMIT' | 'PROVIDER_MALFORMED' | 'UNKNOWN' | 'ABORTED' | 'CONSENT_DENIED',
    message: string,
    public readonly partialText?: string
  ) {
    super(message);
    this.name = 'LLMGatewayError';
  }
}
