export type ProviderType = 'anthropic' | 'openai-compatible';
export type InputModality = 'image' | 'audio' | 'video';

export interface ModelConfig {
  id: string;
  displayName: string;
  providerType: ProviderType;
  providerBaseUrl: string;
  modelId: string;
  contextWindow: number;
  maxOutputTokens: number;
  supportsThinking: boolean;
  supportedInputTypes: InputModality[];
  active: boolean;
}

export interface SettingsStatus {
  hasConfiguredModel: boolean;
  modelCount: number;
}

export interface WebSearchToolSettings {
  enabled: boolean;
  hasApiKey: boolean;
}

export interface ToolSettings {
  webSearch: WebSearchToolSettings;
}

export interface ProjectSummary {
  displayName: string;
  folderName: string;
}

export interface ProjectDiscovery {
  withADocs: ProjectSummary[];
  withoutADocs: ProjectSummary[];
}

export interface FlowRun {
  flowId: string;
  workspaceRoot: string;
  projectNamespace: string;
  recordFolderPath: string;
  recordName?: string;
  recordSummary?: string;
  readyNodes: string[];
  runningNodes: string[];
  awaitingHumanNodes: Record<string, { role: string; reason: 'prompt-human' | 'autonomous-abort' }>;
  completedNodes: string[];
  visitedNodeIds?: string[];
  completedEdgeArtifacts: Record<string, string>;
  pendingNodeArtifacts: Record<string, string[]>;
  status: 'initialized' | 'running' | 'awaiting_human' | 'awaiting_improvement_choice' | 'awaiting_feedback_consent' | 'awaiting_retry' | 'completed' | 'failed';
  stateVersion: string;
  improvementPhase?: ImprovementPhaseState;
  feedbackContext?: FeedbackContext;
  consentState?: ConsentState;
}

export type FeedbackContextKind = 'standard' | 'initialization' | 'update-application';

export interface FeedbackContext {
  kind: FeedbackContextKind;
  initializationMode?: 'takeover' | 'greenfield';
  updateReportPaths?: string[];
}

export interface ImprovementPhaseState {
  status: 'awaiting_choice' | 'running' | 'awaiting_feedback_consent' | 'completed' | 'skipped';
  mode?: 'graph-based' | 'parallel' | 'none';
  currentStep: number;
  completedRoles: string[];
  findingsProduced: Record<string, string>;
  improvementWorkflowPath?: string;
  activeNodeIds?: string[];
  completedNodeIds?: string[];
  feedbackArtifactPath?: string;
  feedbackConsent?: 'pending' | 'granted' | 'denied';
  forwardPassClosure: {
    recordFolderPath: string;
    artifactPath: string;
  };
}

export interface FlowRef {
  projectNamespace: string;
  flowId: string;
}

export interface FlowSummary extends FlowRef {
  status: FlowRun['status'];
  recordFolderPath: string;
  recordName?: string;
  recordSummary?: string;
  updatedAt?: string;
}

export type ConsentClass = 'file-writes' | 'shell-network';
export type ConsentMode = 'ask' | 'full-access';
export type ConsentDecision = 'pending' | 'granted' | 'denied';

export interface ConsentState {
  mode: ConsentMode;
  fileWrites: ConsentDecision;
  shellNetwork: ConsentDecision;
}

export type OperatorEvent =
  | { kind: 'flow.resumed'; flowId: string; activeNodeCount: number }
  | { kind: 'role.active'; nodeId: string; role: string; artifactCount: number; artifactBasename?: string; activationSource?: 'node-start' | 'handoff' | 'runtime' }
  | { kind: 'activity.tool_call'; toolName: string; path?: string; command?: string }
  | { kind: 'handoff.applied'; fromNodeId: string; fromRole: string; targets: Array<{ nodeId: string; role: string; artifactBasename?: string }> }
  | { kind: 'repair.requested'; scope: 'node' | 'improvement'; code: string; summary: string }
  | { kind: 'human.awaiting_input'; nodeId: string; role: string; reason: 'prompt-human' | 'autonomous-abort' }
  | { kind: 'human.resumed'; nodeId: string; role: string }
  | { kind: 'parallel.active_set'; activeNodes: Array<{ nodeId: string; role: string }> }
  | { kind: 'parallel.join_waiting'; nodeId: string; role: string; waitingFor: string[] }
  | { kind: 'usage.turn_summary'; role?: string; availability: 'full' | 'input-unavailable' | 'output-unavailable' | 'both-unavailable'; inputTokens?: number; outputTokens?: number }
  | { kind: 'flow.forward_pass_closed'; recordFolderPath: string; artifactBasename: string }
  | { kind: 'flow.completed' }
  | { kind: 'consent.requested'; toolClass: ConsentClass; toolName: string }
  | { kind: 'consent.resolved'; toolClass: ConsentClass; decision: 'granted' | 'denied' }
  | { kind: 'consent.mode_changed'; mode: ConsentMode };

export type ClientMessage =
  | { type: 'open_flow'; flowRef: FlowRef }
  | { type: 'resume_flow'; flowRef: FlowRef }
  | { type: 'start_initialized_flow'; projectNamespace: string }
  | { type: 'start_takeover_initialization'; projectNamespace: string }
  | { type: 'start_greenfield_initialization'; projectName: string }
  | { type: 'stop_active_turn'; flowRef: FlowRef; nodeId?: string; role?: string }
  | { type: 'human_input'; flowRef: FlowRef; text: string; nodeId?: string; role?: string }
  | { type: 'improvement_choice'; flowRef: FlowRef; mode: 'graph-based' | 'parallel' | 'none' }
  | { type: 'feedback_consent_choice'; flowRef: FlowRef; decision: 'granted' | 'denied' }
  | { type: 'consent_response'; flowRef: FlowRef; decision: 'granted' | 'denied' }
  | { type: 'consent_mode'; flowRef: FlowRef; mode: ConsentMode };

export type ServerMessage =
  | { type: 'init'; projects: ProjectDiscovery }
  | { type: 'flow_summaries'; projectNamespace: string; flows: FlowSummary[] }
  | { type: 'feed_reset'; flowRef: FlowRef }
  | { type: 'operator_event'; flowRef: FlowRef; event: OperatorEvent }
  | { type: 'wait_start'; flowRef: FlowRef; role: string; provider: string; model: string }
  | { type: 'wait_stop'; flowRef: FlowRef; role: string }
  | { type: 'output_text'; flowRef: FlowRef; role: string; text: string }
  | { type: 'input_text'; flowRef: FlowRef; role?: string; text: string }
  | { type: 'flow_state'; flowRef: FlowRef; flowRun: FlowRun; backwardActive: string[]; hasActiveSession: boolean; inputTokensByRole: Record<string, number> }
  | { type: 'error'; flowRef: FlowRef; message: string }
;

export interface WorkflowGraph {
  name?: string;
  summary?: string;
  nodes: Array<{ id: string; role: string; step_index?: number; step_type?: 'meta-analysis' | 'feedback' }>;
  edges: Array<{ from: string; to: string }>;
}

export interface TranscriptPayload {
  nodeId: string;
  role: string;
  transcript: unknown[];
}
