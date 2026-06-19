type ValueOf<T> = T[keyof T];

function protocolValues<const T extends Record<string, string>>(source: T): readonly ValueOf<T>[] {
  return Object.values(source) as Array<ValueOf<T>>;
}

function protocolValueSubset<
  const T extends Record<string, string>,
  const K extends readonly (keyof T)[]
>(
  source: T,
  keys: K
): { readonly [Index in keyof K]: K[Index] extends keyof T ? T[K[Index]] : never } {
  return keys.map((key) => source[key]) as {
    readonly [Index in keyof K]: K[Index] extends keyof T ? T[K[Index]] : never;
  };
}

export const CLIENT_MESSAGE_TYPE = {
  OPEN_FLOW: 'open_flow',
  RESUME_FLOW: 'resume_flow',
  START_INITIALIZED_FLOW: 'start_initialized_flow',
  START_TAKEOVER_INITIALIZATION: 'start_takeover_initialization',
  START_GREENFIELD_INITIALIZATION: 'start_greenfield_initialization',
  START_UPDATE_FLOW: 'start_update_flow',
  STOP_ACTIVE_TURN: 'stop_active_turn',
  COMPACT_CONTEXT: 'compact_context',
  HUMAN_INPUT: 'human_input',
  HANDOFF_APPROVAL: 'handoff_approval',
  IMPROVEMENT_HUMAN_INPUT: 'improvement_human_input',
  IMPROVEMENT_CHOICE: 'improvement_choice',
  FEEDBACK_CONSENT_CHOICE: 'feedback_consent_choice',
  CONSENT_RESPONSE: 'consent_response',
  CONSENT_MODE: 'consent_mode',
  ROLE_CONFIGURATION: 'role_configuration',
} as const;

export type ClientMessageType = ValueOf<typeof CLIENT_MESSAGE_TYPE>;

export const FLOW_REF_ONLY_CLIENT_MESSAGE_TYPES = protocolValueSubset(
  CLIENT_MESSAGE_TYPE,
  ['OPEN_FLOW', 'RESUME_FLOW', 'STOP_ACTIVE_TURN'] as const
);

export const PROJECT_NAMESPACE_CLIENT_MESSAGE_TYPES = protocolValueSubset(
  CLIENT_MESSAGE_TYPE,
  [
    'START_INITIALIZED_FLOW',
    'START_TAKEOVER_INITIALIZATION',
    'START_GREENFIELD_INITIALIZATION',
    'START_UPDATE_FLOW',
  ] as const
);

export const OWNER_BASE_ROLE_ID = 'owner';

export const AWAITING_HUMAN_REASON = {
  PROMPT_HUMAN: 'prompt-human',
  AUTONOMOUS_ABORT: 'autonomous-abort',
  CONSENT: 'consent',
  CONSENT_DENIED: 'consent-denied',
  ROLE_CONFIGURATION: 'role-configuration',
  HANDOFF_APPROVAL: 'handoff-approval',
} as const;

export type ProtocolAwaitingHumanReason = ValueOf<typeof AWAITING_HUMAN_REASON>;

export const AWAITING_HUMAN_REASONS = protocolValues(AWAITING_HUMAN_REASON);

export const HANDOFF_APPROVAL_DECISION = {
  APPROVE: 'approve',
  DECLINE: 'decline',
} as const;

export type ProtocolHandoffApprovalDecision = ValueOf<typeof HANDOFF_APPROVAL_DECISION>;

export const HANDOFF_APPROVAL_DECISIONS = protocolValues(HANDOFF_APPROVAL_DECISION);

export const IMPROVEMENT_CHOICE_MODE = {
  GRAPH_BASED: 'graph-based',
  PARALLEL: 'parallel',
  NONE: 'none',
} as const;

export type ProtocolImprovementChoiceMode = ValueOf<typeof IMPROVEMENT_CHOICE_MODE>;

export const IMPROVEMENT_CHOICE_MODES = protocolValues(IMPROVEMENT_CHOICE_MODE);

export const FEEDBACK_CONSENT_DECISION = {
  GRANTED: 'granted',
  DENIED: 'denied',
} as const;

export type ProtocolFeedbackConsentDecision = ValueOf<typeof FEEDBACK_CONSENT_DECISION>;

export const FEEDBACK_CONSENT_DECISIONS = protocolValues(FEEDBACK_CONSENT_DECISION);

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

export const CONSENT_RESPONSE_DECISIONS = protocolValues(CONSENT_RESPONSE_DECISION);

export const CONSENT_MODE = {
  NO_ACCESS: 'no-access',
  PARTIAL_ACCESS: 'partial-access',
  FULL_ACCESS: 'full-access',
} as const;

export type ProtocolConsentMode = ValueOf<typeof CONSENT_MODE>;

export const CONSENT_MODES = protocolValues(CONSENT_MODE);
