export type FlowStatus =
  | 'running'
  | 'awaiting_improvement_choice'
  | 'awaiting_feedback_consent'
  | 'completed';

export type ConsentMode = 'no-access' | 'partial-access' | 'full-access';
export type ConsentRequestKind = 'file-write' | 'bash-command';
export type ConsentResponseDecision = 'allow_once' | 'allow_flow' | 'deny';
export type AwaitingHumanReason = 'prompt-human' | 'autonomous-abort' | 'consent' | 'consent-denied';

export type ConsentRequest =
  | { kind: 'file-write'; toolName: string; path: string; nodeId: string; role: string }
  | { kind: 'bash-command'; toolName: 'run_command'; command: string; nodeId: string; role: string };

export interface ConsentCheckRequest {
  toolName: string;
  input?: Record<string, unknown>;
  nodeId: string;
  role: string;
}

export interface ConsentState {
  mode: ConsentMode;
  bash: {
    allowedCommands: Record<string, { command: string; grantedAt: string }>;
  };
}

export type FeedbackContextKind = 'standard' | 'initialization' | 'update-application';

export interface FeedbackContext {
  kind: FeedbackContextKind;
  initializationMode?: 'takeover' | 'greenfield';
  updateReportPaths?: string[];
}

export function defaultConsentState(): ConsentState {
  return {
    mode: 'no-access',
    bash: {
      allowedCommands: {},
    },
  };
}

export function normalizeConsentState(raw: unknown): ConsentState {
  const fallback = defaultConsentState();
  if (!raw || typeof raw !== 'object') return fallback;

  const source = raw as Record<string, any>;
  const mode: ConsentMode =
    source.mode === 'partial-access' || source.mode === 'full-access' || source.mode === 'no-access'
      ? source.mode
      : source.mode === 'ask'
        ? 'no-access'
        : fallback.mode;

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

  return {
    mode,
    bash: { allowedCommands },
  };
}

export interface ConsentGate {
  check(request: ConsentCheckRequest, signal?: AbortSignal): Promise<'proceed' | 'deny'>;
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
  | { kind: 'forward-pass-closed'; recordFolderPath: string; artifactPath: string }
  | { kind: 'meta-analysis-complete'; findingsPath: string }
  | { kind: 'backward-pass-complete'; artifactPath: string }
  | { kind: 'awaiting_human' };

export interface ImprovementPhaseState {
  status: 'awaiting_choice' | 'running' | 'awaiting_feedback_consent' | 'completed' | 'skipped';
  mode?: 'graph-based' | 'parallel' | 'none';
  currentStep: number;                         // index into BackwardPassPlan outer array
  completedRoles: string[];                    // role names that have produced findings or been attempted
  findingsProduced: Record<string, string>;    // roleName → findings file path (repo-relative)
  improvementWorkflowPath?: string;            // repo-relative path to runtime-generated improvement.yaml
  activeNodeIds?: string[];                    // improvement graph node ids currently running
  completedNodeIds?: string[];                 // improvement graph node ids that completed
  feedbackArtifactPath?: string;               // repo-relative path assigned for optional upstream feedback
  feedbackConsent?: 'pending' | 'granted' | 'denied';
  singleRole?: boolean;                        // true when the workflow has only one unique base role
  forwardPassClosure: {
    recordFolderPath: string;
    artifactPath: string;
  };
}

export interface FlowRun {
  flowId: string;
  workspaceRoot: string;
  projectNamespace: string;            // project subfolder name (e.g. "a-society")
  recordFolderPath: string;
  recordName?: string;
  recordSummary?: string;
  readyNodes: string[];                           // node IDs eligible to execute
  runningNodes: string[];                         // node IDs claimed by a live runtime turn
  awaitingHumanNodes: Record<string, { role: string; reason: AwaitingHumanReason }>;
  completedNodes: string[];                       // node IDs that have finished
  visitedNodeIds?: string[];                      // node IDs whose first-entry workflow guidance has already been delivered
  completedEdgeArtifacts: Record<string, string>; // `${from}=>${to}` → artifact_path carried on that handoff
  pendingNodeArtifacts: Record<string, string[]>; // nodeId → list of input artifacts waiting for it
  status: FlowStatus;
  stateVersion: string;                        // Persistence version: "7" for the current runtime schema
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
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  parseError?: string;
}

export type RuntimeMessageParam =
  | { role: 'user';                content: string }
  | { role: 'assistant';           content: string }
  | { role: 'assistant_tool_calls'; calls: ToolCall[]; text?: string }
  | { role: 'tool_result';         callId: string; toolName: string; content: string; isError: boolean };

export interface RoleTurnResult {
  handoff: HandoffResult;
  contextUsage?: number;
  awaitingHumanReason?: AwaitingHumanReason;
}

export type OperatorEvent =
  | { kind: 'flow.resumed'; flowId: string; activeNodeCount: number }
  | { kind: 'role.active'; nodeId: string; role: string; artifactCount: number }
  | { kind: 'activity.tool_call'; role: string; toolName: string; path?: string; command?: string }
  | { kind: 'activity.tool_result'; role: string; toolName: string; isError: boolean }
  | { kind: 'handoff.applied'; fromNodeId: string; fromRole: string; targets: Array<{ nodeId: string; role: string; artifactBasename?: string }> }
  | { kind: 'repair.requested'; scope: 'node' | 'improvement'; code: string; summary: string; role?: string; nodeId?: string }
  | { kind: 'human.awaiting_input'; nodeId: string; role: string; reason: AwaitingHumanReason }
  | { kind: 'human.resumed'; nodeId: string; role: string }
  | { kind: 'usage.turn_summary'; role?: string; contextUsage?: number }
  | { kind: 'session.compaction_started'; role: string; trigger: 'manual' | 'auto' }
  | { kind: 'session.compaction_failed'; role: string; trigger: 'manual' | 'auto'; reason: string }
  | { kind: 'session.compacted'; role: string; nodeId: string; trigger: 'manual' | 'auto'; archiveId: string }
  | { kind: 'flow.forward_pass_closed'; recordFolderPath: string; artifactBasename: string }
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
  | 'repair'
  | 'tool'
  | 'tool-success'
  | 'tool-error'
  | 'activation';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  label: string;
  text: string;
}

export interface TurnOptions {
  signal?: AbortSignal;
  outputStream?: NodeJS.WritableStream;
  operatorRenderer?: OperatorRenderSink;
  consentGate?: ConsentGate;
  role?: string;
  nodeId?: string;
  onConversationMessages?: (messages: RuntimeMessageParam[]) => void | Promise<void>;
  onAssistantTextDelta?: (text: string) => void;
}

export interface GatewayTurnResult {
  text: string;
  contextUsage?: number;
}

export type ProviderTurnResult =
  | { type: 'text';       text: string;                                                   contextUsage?: number }
  | { type: 'tool_calls'; calls: ToolCall[]; continuationMessages: RuntimeMessageParam[]; contextUsage?: number };

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
