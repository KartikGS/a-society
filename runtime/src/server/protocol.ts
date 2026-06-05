import type {
  ConsentMode,
  ConsentResponseDecision,
  FeedItem,
  FlowRef,
  FlowRun,
  FlowSummary,
  OperatorFeedMessage,
} from '../common/types.js';
import {
  CLIENT_MESSAGE_TYPE,
  CONSENT_MODES,
  CONSENT_RESPONSE_DECISIONS,
  FEEDBACK_CONSENT_DECISIONS,
  FLOW_REF_ONLY_CLIENT_MESSAGE_TYPES,
  IMPROVEMENT_CHOICE_MODES,
  PROJECT_NAMESPACE_CLIENT_MESSAGE_TYPES,
} from '../common/protocol-constants.js';
import type {
  ProtocolFeedbackConsentDecision,
  ProtocolImprovementChoiceMode,
} from '../common/protocol-constants.js';
import type { RuntimeServerMessage } from './ws-operator-sink.js';

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

export type FlowStateMessage = {
  type: 'flow_state';
  flowRef: FlowRef;
  flowRun: FlowRun;
  backwardActive: string[];
  hasActiveSession: boolean;
  contextUsageByRole: Record<string, number>;
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

export function hasFlowRef(value: unknown): value is FlowRef {
  return (
    Boolean(value) &&
    typeof (value as FlowRef).projectNamespace === 'string' &&
    typeof (value as FlowRef).flowId === 'string'
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

function hasOptionalString(value: Record<string, unknown>, key: string): boolean {
  return value[key] === undefined || typeof value[key] === 'string';
}

export function parseClientMessage(raw: string): ClientMessage | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isObject(parsed)) return null;

    if (
      isOneOf(parsed.type, FLOW_REF_ONLY_CLIENT_MESSAGE_TYPES) &&
      hasFlowRef(parsed.flowRef) &&
      hasOptionalString(parsed, 'nodeId') &&
      hasOptionalString(parsed, 'role')
    ) return parsed as ClientMessage;

    if (isOneOf(parsed.type, PROJECT_NAMESPACE_CLIENT_MESSAGE_TYPES) && typeof parsed.projectNamespace === 'string') {
      return parsed as ClientMessage;
    }

    if (parsed.type === CLIENT_MESSAGE_TYPE.COMPACT_CONTEXT && hasFlowRef(parsed.flowRef) && typeof parsed.role === 'string') {
      return parsed as ClientMessage;
    }

    if (
      parsed.type === CLIENT_MESSAGE_TYPE.HUMAN_INPUT &&
      hasFlowRef(parsed.flowRef) &&
      typeof parsed.text === 'string' &&
      hasOptionalString(parsed, 'nodeId') &&
      hasOptionalString(parsed, 'role')
    ) return parsed as ClientMessage;

    if (
      parsed.type === CLIENT_MESSAGE_TYPE.IMPROVEMENT_HUMAN_INPUT &&
      hasFlowRef(parsed.flowRef) &&
      typeof parsed.role === 'string' &&
      typeof parsed.text === 'string'
    ) return parsed as ClientMessage;

    if (
      parsed.type === CLIENT_MESSAGE_TYPE.IMPROVEMENT_CHOICE &&
      hasFlowRef(parsed.flowRef) &&
      isOneOf(parsed.mode, IMPROVEMENT_CHOICE_MODES)
    ) {
      return parsed as ClientMessage;
    }

    if (
      parsed.type === CLIENT_MESSAGE_TYPE.FEEDBACK_CONSENT_CHOICE &&
      hasFlowRef(parsed.flowRef) &&
      isOneOf(parsed.decision, FEEDBACK_CONSENT_DECISIONS)
    ) {
      return parsed as ClientMessage;
    }

    if (
      parsed.type === CLIENT_MESSAGE_TYPE.CONSENT_RESPONSE &&
      hasFlowRef(parsed.flowRef) &&
      isOneOf(parsed.decision, CONSENT_RESPONSE_DECISIONS) &&
      typeof parsed.role === 'string'
    ) {
      return parsed as ClientMessage;
    }

    if (
      parsed.type === CLIENT_MESSAGE_TYPE.CONSENT_MODE &&
      hasFlowRef(parsed.flowRef) &&
      isOneOf(parsed.mode, CONSENT_MODES)
    ) {
      return parsed as ClientMessage;
    }

    return null;
  } catch {
    return null;
  }
}
