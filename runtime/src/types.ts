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
  | { kind: 'meta-analysis-complete'; findingsPath: string };

export interface ImprovementPhaseState {
  mode: 'graph-based' | 'parallel';
  currentStep: number;                         // index into BackwardPassPlan outer array
  completedRoles: string[];                    // role names that have produced findings or been attempted
  findingsProduced: Record<string, string>;    // roleName → findings file path (repo-relative)
}

export interface FlowRun {
  flowId: string;
  projectRoot: string;
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

export type ProviderTurnResult =
  | { type: 'text'; text: string }
  | { type: 'tool_calls'; calls: ToolCall[]; continuationMessages: RuntimeMessageParam[] };

export interface LLMProvider {
  executeTurn(
    systemPrompt: string,
    messages: RuntimeMessageParam[],
    tools?: ToolDefinition[]
  ): Promise<ProviderTurnResult>;
}

export class LLMGatewayError extends Error {
  constructor(public readonly type: 'AUTH_ERROR' | 'RATE_LIMIT' | 'PROVIDER_MALFORMED' | 'UNKNOWN', message: string) {
    super(message);
    this.name = 'LLMGatewayError';
  }
}
