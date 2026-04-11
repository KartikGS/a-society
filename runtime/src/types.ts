export type FlowStatus = 
  | 'initialized' 
  | 'running' 
  | 'awaiting_human' 
  | 'awaiting_retry' 
  | 'completed' 
  | 'failed';

export interface HandoffTarget {
  role: string;
  artifact_path: string | null;
}

export type HandoffResult =
  | { kind: 'targets'; targets: HandoffTarget[] }
  | { kind: 'forward-pass-closed'; recordFolderPath: string; artifactPath: string }
  | { kind: 'meta-analysis-complete'; findingsPath: string }
  | { kind: 'awaiting_human' };

export interface ImprovementPhaseState {
  mode: 'graph-based' | 'parallel';
  currentStep: number;                         // index into BackwardPassPlan outer array
  completedRoles: string[];                    // role names that have produced findings or been attempted
  findingsProduced: Record<string, string>;    // roleName → findings file path (repo-relative)
}

export interface FlowRun {
  flowId: string;
  projectRoot: string;
  projectNamespace: string;            // project subfolder name (e.g. "a-society"); used to build role keys in advanceFlow
  recordFolderPath: string;
  activeNodes: string[];                          // node IDs currently executing
  completedNodes: string[];                       // node IDs that have finished
  completedNodeArtifacts: Record<string, string>; // nodeId → artifact_path of that node's output
  pendingNodeArtifacts: Record<string, string[]>; // nodeId → list of input artifacts waiting for it
  status: FlowStatus;
  stateVersion: string;                        // Persistence version: "2" for this schema; absent/old = "1"
  improvementPhase?: ImprovementPhaseState;    // Present only when improvement is in progress
}

export interface RoleSession {
  roleName: string;
  logicalSessionId: string;
  transcriptHistory: unknown[];
  isActive: boolean;
}

export interface TurnRecord {
  turnNumber: number;
  inputArtifactPath: string;
  injectedContextHash: string;
  assistantOutput: string;
  parsedHandoffResult: unknown | null;
}

export interface TriggerRecord {
  toolComponent: string;
  inputSummary: string;
  resultSummary: string;
  success: boolean;
  retryStatus: string;
}

export interface OrientSession {
  sessionId: string;
  workspaceRoot: string;
  roleKey: string;
  startedAt: string;
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

export interface TurnUsage {
  inputTokens?: number;
  outputTokens?: number;
}

export type OperatorEvent =
  | { kind: 'flow.bootstrap_started'; role: string }
  | { kind: 'flow.resumed'; flowId: string; activeNodeCount: number }
  | { kind: 'role.active'; nodeId: string; role: string; artifactCount: number; artifactBasename?: string }
  | { kind: 'activity.tool_call'; toolName: string; path?: string }
  | { kind: 'handoff.applied'; fromNodeId: string; fromRole: string; targets: Array<{ nodeId: string; role: string; artifactBasename?: string }> }
  | { kind: 'repair.requested'; scope: 'node' | 'bootstrap'; code: string; summary: string }
  | { kind: 'human.awaiting_input'; reason: 'prompt-human' | 'interactive-abort' | 'autonomous-abort'; mode: 'interactive' | 'autonomous' }
  | { kind: 'human.resumed'; nodeId: string; role: string }
  | { kind: 'parallel.active_set'; activeNodes: Array<{ nodeId: string; role: string }> }
  | { kind: 'parallel.join_waiting'; nodeId: string; role: string; waitingFor: string[] }
  | { kind: 'usage.turn_summary'; availability: 'full' | 'input-unavailable' | 'output-unavailable' | 'both-unavailable'; inputTokens?: number; outputTokens?: number }
  | { kind: 'flow.forward_pass_closed'; recordFolderPath: string; artifactBasename: string }
  | { kind: 'flow.completed' };

export interface OperatorRenderSink {
  emit(event: OperatorEvent): void;
  startWait(provider: string, model: string): void;
  stopWait(): void;
}

export interface TurnOptions {
  signal?: AbortSignal;
  outputStream?: NodeJS.WritableStream;
  operatorRenderer?: OperatorRenderSink;
}

export interface GatewayTurnResult {
  text: string;
  usage?: TurnUsage;
  displayedText?: boolean;
  /** Tool call/result messages accumulated during this turn, in conversation order, excluding the final assistant text message. */
  intermediateMessages?: RuntimeMessageParam[];
}

export type ProviderTurnResult =
  | { type: 'text';       text: string;                                                   usage?: TurnUsage; displayedText?: boolean }
  | { type: 'tool_calls'; calls: ToolCall[]; continuationMessages: RuntimeMessageParam[]; usage?: TurnUsage; displayedText?: boolean };

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
    public readonly type: 'AUTH_ERROR' | 'RATE_LIMIT' | 'PROVIDER_MALFORMED' | 'UNKNOWN' | 'ABORTED',
    message: string,
    public readonly partialText?: string
  ) {
    super(message);
    this.name = 'LLMGatewayError';
  }
}
