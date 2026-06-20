import type { FlowRef } from '../common/types.js';
import {
  CLIENT_MESSAGE_TYPE,
  CONSENT_MODES,
  CONSENT_RESPONSE_DECISIONS,
  FEEDBACK_CONSENT_DECISIONS,
  FLOW_REF_ONLY_CLIENT_MESSAGE_TYPES,
  HANDOFF_APPROVAL_DECISIONS,
  IMPROVEMENT_CHOICE_MODES,
  PROJECT_NAMESPACE_CLIENT_MESSAGE_TYPES,
} from '../../shared/protocol-constants.js';
import type { ClientMessage } from '../../shared/operator-protocol.js';

export type {
  ClientMessage,
  FeedReplayMessage,
  FlowScopedHistoricalMessage,
  FlowStateMessage,
  HistoricalMessage,
  RoleConfigurationPending,
  ServerMessage,
} from '../../shared/operator-protocol.js';

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
      parsed.type === CLIENT_MESSAGE_TYPE.HANDOFF_APPROVAL &&
      hasFlowRef(parsed.flowRef) &&
      typeof parsed.nodeId === 'string' &&
      isOneOf(parsed.decision, HANDOFF_APPROVAL_DECISIONS)
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

    if (
      parsed.type === CLIENT_MESSAGE_TYPE.ROLE_CONFIGURATION &&
      hasFlowRef(parsed.flowRef) &&
      typeof parsed.nodeId === 'string' &&
      hasOptionalString(parsed, 'modelConfigId') &&
      Array.isArray(parsed.skills) &&
      parsed.skills.every((entry) => typeof entry === 'string') &&
      Array.isArray(parsed.mcpServers) &&
      parsed.mcpServers.every((entry) => typeof entry === 'string')
    ) {
      return parsed as ClientMessage;
    }

    return null;
  } catch {
    return null;
  }
}
