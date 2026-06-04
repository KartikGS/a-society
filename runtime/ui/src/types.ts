import type {
  ModelReasoningConfig,
  AnthropicEffort,
  AnthropicThinkingDisplay,
  OpenAICompatibleTokenLimitParam,
  OpenAIReasoningEffort,
  ProviderReasoningDisplay,
  ProviderReasoningReplayPolicy,
} from '../../src/common/model-reasoning.js';
import type {
  AwaitingHumanReason,
  AssistantFeedSegment,
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
import type {
  CLIENT_MESSAGE_TYPE,
  ProtocolFeedbackConsentDecision,
  ProtocolImprovementChoiceMode,
} from '../../src/common/protocol-constants.js';

export type {
  AwaitingHumanReason,
  AssistantFeedSegment,
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
export type {
  AnthropicEffort,
  AnthropicThinkingDisplay,
  ModelReasoningConfig,
  OpenAICompatibleTokenLimitParam,
  OpenAIReasoningEffort,
  ProviderReasoningDisplay,
  ProviderReasoningReplayPolicy,
};

export interface ModelConfig {
  id: string;
  displayName: string;
  providerType: ProviderType;
  providerBaseUrl: string;
  modelId: string;
  contextWindow: number;
  maxOutputTokens: number;
  reasoning: ModelReasoningConfig;
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

export interface FeedSettings {
  historyLimit: number;
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
  | { type: typeof CLIENT_MESSAGE_TYPE.OPEN_FLOW; flowRef: FlowRef }
  | { type: typeof CLIENT_MESSAGE_TYPE.RESUME_FLOW; flowRef: FlowRef }
  | { type: typeof CLIENT_MESSAGE_TYPE.START_INITIALIZED_FLOW; projectNamespace: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.START_TAKEOVER_INITIALIZATION; projectNamespace: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.START_GREENFIELD_INITIALIZATION; projectNamespace: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.STOP_ACTIVE_TURN; flowRef: FlowRef; nodeId?: string; role?: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.COMPACT_CONTEXT; flowRef: FlowRef; role: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.HUMAN_INPUT; flowRef: FlowRef; text: string; nodeId?: string; role?: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.IMPROVEMENT_HUMAN_INPUT; flowRef: FlowRef; role: string; text: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.IMPROVEMENT_CHOICE; flowRef: FlowRef; mode: ProtocolImprovementChoiceMode }
  | { type: typeof CLIENT_MESSAGE_TYPE.FEEDBACK_CONSENT_CHOICE; flowRef: FlowRef; decision: ProtocolFeedbackConsentDecision }
  | { type: typeof CLIENT_MESSAGE_TYPE.CONSENT_RESPONSE; flowRef: FlowRef; decision: ConsentResponseDecision; role: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.CONSENT_MODE; flowRef: FlowRef; mode: ConsentMode };

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
  nodes: Array<{ id: string; role: string; step_type?: 'meta-analysis' | 'feedback' }>;
  edges: Array<{ from: string; to: string }>;
}
