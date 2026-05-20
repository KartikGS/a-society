import type {
  AwaitingHumanReason,
  ConsentMode,
  ConsentRequest,
  ConsentResponseDecision,
  ConsentState,
  FeedbackContext,
  FeedbackContextKind,
  FeedItem,
  FeedItemType,
  FlowRef,
  FlowRun,
  FlowSummary,
  ImprovementPhaseState,
  OperatorEvent,
} from '../../src/common/types.js';

export type {
  AwaitingHumanReason,
  ConsentMode,
  ConsentRequest,
  ConsentResponseDecision,
  ConsentState,
  FeedbackContext,
  FeedbackContextKind,
  FeedItem,
  FeedItemType,
  FlowRef,
  FlowRun,
  FlowSummary,
  ImprovementPhaseState,
  OperatorEvent,
};

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

export type ClientMessage =
  | { type: 'open_flow'; flowRef: FlowRef }
  | { type: 'resume_flow'; flowRef: FlowRef }
  | { type: 'start_initialized_flow'; projectNamespace: string }
  | { type: 'start_takeover_initialization'; projectNamespace: string }
  | { type: 'start_greenfield_initialization'; projectName: string }
  | { type: 'stop_active_turn'; flowRef: FlowRef; nodeId?: string; role?: string }
  | { type: 'compact_context'; flowRef: FlowRef; role: string }
  | { type: 'human_input'; flowRef: FlowRef; text: string; nodeId?: string; role?: string }
  | { type: 'improvement_choice'; flowRef: FlowRef; mode: 'graph-based' | 'parallel' | 'none' }
  | { type: 'feedback_consent_choice'; flowRef: FlowRef; decision: 'granted' | 'denied' }
  | { type: 'consent_response'; flowRef: FlowRef; decision: ConsentResponseDecision; role: string }
  | { type: 'consent_mode'; flowRef: FlowRef; mode: ConsentMode };

export type ServerMessage =
  | { type: 'init'; projects: ProjectDiscovery }
  | { type: 'flow_summaries'; projectNamespace: string; flows: FlowSummary[] }
  | { type: 'feed_replay'; flowRef: FlowRef; roleFeeds: Record<string, FeedItem[]> }
  | { type: 'operator_event'; flowRef: FlowRef; event: OperatorEvent }
  | { type: 'request_sent'; flowRef: FlowRef; role: string; provider: string; model: string }
  | { type: 'receiving_response'; flowRef: FlowRef; role: string }
  | { type: 'response_end'; flowRef: FlowRef; role: string }
  | { type: 'output_text'; flowRef: FlowRef; role: string; text: string }
  | { type: 'input_text'; flowRef: FlowRef; role?: string; text: string }
  | { type: 'flow_state'; flowRef: FlowRef; flowRun: FlowRun; backwardActive: string[]; hasActiveSession: boolean; contextUsageByRole: Record<string, number> }
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
