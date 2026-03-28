export type FlowStatus = 
  | 'initialized' 
  | 'running' 
  | 'awaiting_human' 
  | 'awaiting_retry' 
  | 'completed' 
  | 'failed';

export interface FlowRun {
  flowId: string;
  projectRoot: string;
  workflowDocumentPath: string;
  recordFolderPath: string;
  currentNode: string;
  status: FlowStatus;
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
