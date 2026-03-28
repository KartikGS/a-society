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

export interface RuntimeMessageParam {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMProvider {
  executeTurn(systemPrompt: string, messages: RuntimeMessageParam[]): Promise<string>;
}

export class LLMGatewayError extends Error {
  constructor(public readonly type: 'AUTH_ERROR' | 'RATE_LIMIT' | 'PROVIDER_MALFORMED' | 'UNKNOWN', message: string) {
    super(message);
    this.name = 'LLMGatewayError';
  }
}
