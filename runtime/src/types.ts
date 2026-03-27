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
