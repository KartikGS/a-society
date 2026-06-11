export const CLIENT_MESSAGE_TYPE = {
  OPEN_FLOW: 'open_flow',
  RESUME_FLOW: 'resume_flow',
  START_INITIALIZED_FLOW: 'start_initialized_flow',
  START_TAKEOVER_INITIALIZATION: 'start_takeover_initialization',
  START_GREENFIELD_INITIALIZATION: 'start_greenfield_initialization',
  STOP_ACTIVE_TURN: 'stop_active_turn',
  COMPACT_CONTEXT: 'compact_context',
  HUMAN_INPUT: 'human_input',
  IMPROVEMENT_HUMAN_INPUT: 'improvement_human_input',
  IMPROVEMENT_CHOICE: 'improvement_choice',
  FEEDBACK_CONSENT_CHOICE: 'feedback_consent_choice',
  CONSENT_RESPONSE: 'consent_response',
  CONSENT_MODE: 'consent_mode',
} as const;

type ValueOf<T> = T[keyof T];

export type ClientMessageType = ValueOf<typeof CLIENT_MESSAGE_TYPE>;

export const FLOW_REF_ONLY_CLIENT_MESSAGE_TYPES = [
  CLIENT_MESSAGE_TYPE.OPEN_FLOW,
  CLIENT_MESSAGE_TYPE.RESUME_FLOW,
  CLIENT_MESSAGE_TYPE.STOP_ACTIVE_TURN,
] as const;

export const PROJECT_NAMESPACE_CLIENT_MESSAGE_TYPES = [
  CLIENT_MESSAGE_TYPE.START_INITIALIZED_FLOW,
  CLIENT_MESSAGE_TYPE.START_TAKEOVER_INITIALIZATION,
  CLIENT_MESSAGE_TYPE.START_GREENFIELD_INITIALIZATION,
] as const;

export const OWNER_BASE_ROLE_ID = 'owner';

export const AWAITING_HUMAN_REASON = {
  PROMPT_HUMAN: 'prompt-human',
  AUTONOMOUS_ABORT: 'autonomous-abort',
  CONSENT: 'consent',
  CONSENT_DENIED: 'consent-denied',
} as const;

export type ProtocolAwaitingHumanReason = ValueOf<typeof AWAITING_HUMAN_REASON>;

export const AWAITING_HUMAN_REASONS = [
  AWAITING_HUMAN_REASON.PROMPT_HUMAN,
  AWAITING_HUMAN_REASON.AUTONOMOUS_ABORT,
  AWAITING_HUMAN_REASON.CONSENT,
  AWAITING_HUMAN_REASON.CONSENT_DENIED,
] as const;

export const IMPROVEMENT_CHOICE_MODE = {
  GRAPH_BASED: 'graph-based',
  PARALLEL: 'parallel',
  NONE: 'none',
} as const;

export type ProtocolImprovementChoiceMode = ValueOf<typeof IMPROVEMENT_CHOICE_MODE>;

export const IMPROVEMENT_CHOICE_MODES = [
  IMPROVEMENT_CHOICE_MODE.GRAPH_BASED,
  IMPROVEMENT_CHOICE_MODE.PARALLEL,
  IMPROVEMENT_CHOICE_MODE.NONE,
] as const;

export const FEEDBACK_CONSENT_DECISION = {
  GRANTED: 'granted',
  DENIED: 'denied',
} as const;

export type ProtocolFeedbackConsentDecision = ValueOf<typeof FEEDBACK_CONSENT_DECISION>;

export const FEEDBACK_CONSENT_DECISIONS = [
  FEEDBACK_CONSENT_DECISION.GRANTED,
  FEEDBACK_CONSENT_DECISION.DENIED,
] as const;

export const FEEDBACK_CONSENT_STATUS = {
  PENDING: 'pending',
  GRANTED: FEEDBACK_CONSENT_DECISION.GRANTED,
  DENIED: FEEDBACK_CONSENT_DECISION.DENIED,
} as const;

export type FeedbackConsentStatus = ValueOf<typeof FEEDBACK_CONSENT_STATUS>;

export const CONSENT_RESPONSE_DECISION = {
  ALLOW_ONCE: 'allow_once',
  ALLOW_FLOW: 'allow_flow',
  DENY: 'deny',
} as const;

export type ProtocolConsentResponseDecision = ValueOf<typeof CONSENT_RESPONSE_DECISION>;

export const CONSENT_RESPONSE_DECISIONS = [
  CONSENT_RESPONSE_DECISION.ALLOW_ONCE,
  CONSENT_RESPONSE_DECISION.ALLOW_FLOW,
  CONSENT_RESPONSE_DECISION.DENY,
] as const;

export const CONSENT_MODE = {
  NO_ACCESS: 'no-access',
  PARTIAL_ACCESS: 'partial-access',
  FULL_ACCESS: 'full-access',
} as const;

export type ProtocolConsentMode = ValueOf<typeof CONSENT_MODE>;

export const CONSENT_MODES = [
  CONSENT_MODE.NO_ACCESS,
  CONSENT_MODE.PARTIAL_ACCESS,
  CONSENT_MODE.FULL_ACCESS,
] as const;
