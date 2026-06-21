import type {
  ProtocolFeedbackConsentDecision,
  ProtocolHandoffApprovalDecision,
  ProtocolImprovementChoiceMode,
  CLIENT_MESSAGE_TYPE,
} from './protocol-constants.js';
import type {
  ConsentMode,
  ConsentResponseDecision,
  FeedItem,
  FlowRef,
  FlowRun,
  FlowSummary,
  OperatorEvent,
  OperatorFeedMessage,
} from './types.js';

export type ClientMessage =
  | { type: typeof CLIENT_MESSAGE_TYPE.OPEN_FLOW; flowRef: FlowRef }
  | { type: typeof CLIENT_MESSAGE_TYPE.RESUME_FLOW; flowRef: FlowRef }
  | { type: typeof CLIENT_MESSAGE_TYPE.START_INITIALIZED_FLOW; projectNamespace: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.START_TAKEOVER_INITIALIZATION; projectNamespace: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.START_GREENFIELD_INITIALIZATION; projectNamespace: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.START_UPDATE_FLOW; projectNamespace: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.STOP_ACTIVE_TURN; flowRef: FlowRef; nodeId?: string; role?: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.COMPACT_CONTEXT; flowRef: FlowRef; role: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.HUMAN_INPUT; flowRef: FlowRef; text: string; nodeId?: string; role?: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.HANDOFF_APPROVAL; flowRef: FlowRef; nodeId: string; decision: ProtocolHandoffApprovalDecision }
  | { type: typeof CLIENT_MESSAGE_TYPE.IMPROVEMENT_HUMAN_INPUT; flowRef: FlowRef; role: string; text: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.IMPROVEMENT_CHOICE; flowRef: FlowRef; mode: ProtocolImprovementChoiceMode }
  | { type: typeof CLIENT_MESSAGE_TYPE.FEEDBACK_CONSENT_CHOICE; flowRef: FlowRef; decision: ProtocolFeedbackConsentDecision }
  | { type: typeof CLIENT_MESSAGE_TYPE.CONSENT_RESPONSE; flowRef: FlowRef; decision: ConsentResponseDecision; role: string }
  | { type: typeof CLIENT_MESSAGE_TYPE.CONSENT_MODE; flowRef: FlowRef; mode: ConsentMode }
  | { type: typeof CLIENT_MESSAGE_TYPE.ROLE_CONFIGURATION; flowRef: FlowRef; nodeId: string; modelConfigId?: string; skills: string[]; mcpServers: string[] };

/** Which configuration dimensions a role-configuration node still needs the operator to pick. */
export interface RoleConfigurationPending {
  pendingModel: boolean;
  pendingSkills: boolean;
  pendingMcp: boolean;
}

export type RuntimeServerMessage =
  | { type: 'operator_event'; event: OperatorEvent }
  | { type: 'request_sent'; role: string; provider: string; model: string }
  | { type: 'receiving_response'; role: string }
  | { type: 'response_end'; role: string }
  | { type: 'error'; message: string };

export type FlowStateMessage = {
  type: 'flow_state';
  flowRef: FlowRef;
  flowRun: FlowRun;
  backwardActive: string[];
  hasActiveSession: boolean;
  contextUsageByRole: Record<string, number>;
  contextWindowByRole: Record<string, number>;
  /** Per-node pending dimensions for nodes awaiting role configuration (keyed by node id). */
  roleConfigurations: Record<string, RoleConfigurationPending>;
};

export type HistoricalMessage = OperatorFeedMessage;

export type FlowScopedHistoricalMessage = HistoricalMessage & { flowRef: FlowRef };

export type FeedReplayMessage = { type: 'feed_replay'; flowRef: FlowRef; roleFeeds: Record<string, FeedItem[]> };

export type ServerMessage =
  | { type: 'flow_summaries'; projectNamespace: string; flows: FlowSummary[] }
  | FeedReplayMessage
  | FlowStateMessage
  | FlowScopedHistoricalMessage
  | (RuntimeServerMessage & { flowRef: FlowRef });
