import { flowKey } from '../../../src/common/flow-ref.js';
import { CONSENT_MODE } from '../../../src/common/protocol-constants.js';
import { areFlowRunsEqual, areStringArraysEqual } from '../equality';
import type { FlowRef, FlowSummary, OperatorEvent, ServerMessage } from '../types';
import { SYSTEM_ROLE_KEY } from './constants';
import { appendFeedItem, applyReasoningTraceToFeed, formatOperatorEvent, nextFeedId, resolveCompactionFeedItem, resolveToolFeedItem } from './feed';
import {
  getConsentRequestRoleKey,
  hasImprovementGraph,
  titleForFlow,
  type FlowUiState,
} from './flow-ui';
import { toRoleKey } from './roles';

type FlowUiUpdater = (state: FlowUiState) => FlowUiState;

export interface ServerMessageHandlers {
  updateFlowUi: (key: string, updater: FlowUiUpdater) => void;
  ensureTab: (ref: FlowRef, title: string) => void;
  setProjectFlows: (projectNamespace: string, flows: FlowSummary[]) => void;
  setSelectorError: (value: string | null) => void;
  refreshProjectFlows: (projectNamespace: string) => void;
  showToast: (message: string) => void;
}

function feedRoleForEvent(event: OperatorEvent): string | null {
  if (
    event.kind === 'human.resumed' ||
    event.kind === 'role.resumed' ||
    event.kind === 'activity.tool_call' ||
    event.kind === 'session.compaction_started'
  ) {
    return toRoleKey(event.role);
  }

  if (event.kind === 'handoff.applied') {
    return toRoleKey(event.fromRole);
  }

  if (event.kind === 'repair.requested') {
    return toRoleKey(event.role ?? null);
  }

  if (event.kind === 'session.compacted') {
    return toRoleKey(event.role);
  }

  return null;
}

function applyOperatorEvent(
  key: string,
  event: OperatorEvent,
  handlers: ServerMessageHandlers,
): void {
  if (event.kind === 'consent.requested') {
    handlers.updateFlowUi(key, (state) => ({
      ...state,
      consentRequests: {
        ...state.consentRequests,
        [getConsentRequestRoleKey(event.request) ?? SYSTEM_ROLE_KEY]: event.request,
      },
    }));
    return;
  }

  if (event.kind === 'consent.resolved') {
    handlers.updateFlowUi(key, (state) => {
      const roleKey = getConsentRequestRoleKey(event.request) ?? SYSTEM_ROLE_KEY;
      const nextConsentRequests = { ...state.consentRequests };
      delete nextConsentRequests[roleKey];
      return { ...state, consentRequests: nextConsentRequests };
    });
    return;
  }

  if (event.kind === 'consent.mode_changed') {
    handlers.updateFlowUi(key, (state) => ({
      ...state,
      consentRequests: event.mode === CONSENT_MODE.FULL_ACCESS ? {} : state.consentRequests,
    }));
    return;
  }

  if (event.kind === 'usage.turn_summary') {
    const contextUsage = event.contextUsage;
    if (contextUsage != null) {
      handlers.updateFlowUi(key, (state) => {
        const role = toRoleKey(event.role) ?? SYSTEM_ROLE_KEY;
        return {
          ...state,
          latestContextUsageByRole: { ...state.latestContextUsageByRole, [role]: contextUsage },
        };
      });
    }
    return;
  }

  if (event.kind === 'provider.reasoning_trace') {
    const roleKey = toRoleKey(event.role);
    if (roleKey) {
      handlers.updateFlowUi(key, (state) => ({
        ...state,
        roleFeeds: applyReasoningTraceToFeed(state.roleFeeds, roleKey, event),
      }));
    }
    return;
  }

  if (event.kind === 'role.active' || event.kind === 'human.awaiting_input') {
    handlers.updateFlowUi(key, (state) => {
      const item = formatOperatorEvent(event);
      const roleKey = toRoleKey(event.role);
      return {
        ...state,
        stopRequestedRoles: roleKey
          ? { ...state.stopRequestedRoles, [roleKey]: false }
          : state.stopRequestedRoles,
        roleFeeds: item && roleKey ? appendFeedItem(state.roleFeeds, roleKey, item) : state.roleFeeds,
      };
    });
    if (event.kind === 'role.active') {
      handlers.setSelectorError(null);
    }
    return;
  }

  if (event.kind === 'activity.tool_result') {
    const roleKey = toRoleKey(event.role);
    if (roleKey) {
      handlers.updateFlowUi(key, (state) => ({
        ...state,
        roleFeeds: resolveToolFeedItem(state.roleFeeds, roleKey, event.toolName, event.isError)
      }));
    }
    return;
  }

  if (event.kind === 'session.compaction_started') {
    const roleKey = toRoleKey(event.role);
    if (roleKey) {
      handlers.updateFlowUi(key, (state) => {
        const item = formatOperatorEvent(event);
        return {
          ...state,
          compactingRoles: { ...state.compactingRoles, [roleKey]: true },
          roleFeeds: item ? appendFeedItem(state.roleFeeds, roleKey, item) : state.roleFeeds,
        };
      });
    }
    return;
  }

  if (event.kind === 'session.compacted' || event.kind === 'session.compaction_failed') {
    const roleKey = toRoleKey(event.role);
    if (roleKey) {
      handlers.updateFlowUi(key, (state) => ({
        ...state,
        compactingRoles: { ...state.compactingRoles, [roleKey]: false },
        latestContextUsageByRole: event.kind === 'session.compacted'
          ? { ...state.latestContextUsageByRole, [roleKey]: 0 }
          : state.latestContextUsageByRole,
        roleFeeds: resolveCompactionFeedItem(state.roleFeeds, roleKey, event),
      }));
    }
    return;
  }

  handlers.updateFlowUi(key, (state) => {
    const item = formatOperatorEvent(event);
    const feedRole = feedRoleForEvent(event);
    const resumedRole = event.kind === 'human.resumed' || event.kind === 'role.resumed' ? toRoleKey(event.role) : null;
    return {
      ...state,
      stopRequestedRoles: event.kind === 'flow.completed'
        ? {}
        : resumedRole
          ? { ...state.stopRequestedRoles, [resumedRole]: false }
          : state.stopRequestedRoles,
      compactingRoles: event.kind === 'flow.completed' ? {} : state.compactingRoles,
      lastHandoff: event.kind === 'handoff.applied' ? event : state.lastHandoff,
      roleFeeds: item && feedRole ? appendFeedItem(state.roleFeeds, feedRole, item) : state.roleFeeds,
    };
  });
}

export function handleServerMessage(message: ServerMessage, handlers: ServerMessageHandlers): void {
  if (message.type === 'flow_summaries') {
    handlers.setProjectFlows(message.projectNamespace, message.flows);
    return;
  }

  const key = flowKey(message.flowRef);

  switch (message.type) {
    case 'feed_replay':
      handlers.updateFlowUi(key, (state) => ({
        ...state,
        roleFeeds: message.roleFeeds,
        lastHandoff: null,
        waitLabels: {},
        stopRequestedRoles: {},
        compactingRoles: {},
        latestContextUsageByRole: {},
        consentRequests: {},
      }));
      return;
    case 'operator_event':
      applyOperatorEvent(key, message.event, handlers);
      return;
    case 'request_sent': {
      const roleKey = toRoleKey(message.role);
      if (!roleKey) return;
      handlers.updateFlowUi(key, (state) => ({
        ...state,
        waitLabels: { ...state.waitLabels, [roleKey]: 'Waiting for model...' }
      }));
      return;
    }
    case 'receiving_response': {
      const roleKey = toRoleKey(message.role);
      if (!roleKey) return;
      handlers.updateFlowUi(key, (state) => ({
        ...state,
        waitLabels: { ...state.waitLabels, [roleKey]: 'Model is responding...' }
      }));
      return;
    }
    case 'response_end': {
      const roleKey = toRoleKey(message.role);
      if (!roleKey) return;
      handlers.updateFlowUi(key, (state) => ({
        ...state,
        waitLabels: { ...state.waitLabels, [roleKey]: null },
        stopRequestedRoles: { ...state.stopRequestedRoles, [roleKey]: false }
      }));
      return;
    }
    case 'output_text': {
      const roleKey = toRoleKey(message.role);
      if (!roleKey) return;
      handlers.updateFlowUi(key, (state) => ({
        ...state,
        waitLabels: state.waitLabels[roleKey] ? state.waitLabels : { ...state.waitLabels, [roleKey]: 'Model is responding...' },
        roleFeeds: appendFeedItem(state.roleFeeds, roleKey, {
          id: nextFeedId(),
          type: 'assistant',
          label: 'Assistant',
          text: message.text
        })
      }));
      return;
    }
    case 'input_text':
      handlers.updateFlowUi(key, (state) => {
        const roleKey = toRoleKey(message.role) ?? SYSTEM_ROLE_KEY;
        return {
          ...state,
          roleFeeds: appendFeedItem(state.roleFeeds, roleKey, {
            id: nextFeedId(),
            type: 'user',
            label: 'You',
            text: message.text
          })
        };
      });
      return;
    case 'flow_state':
      handlers.ensureTab(message.flowRef, titleForFlow(message.flowRun));
      handlers.updateFlowUi(key, (state) => {
        const improvementGraphAvailable = hasImprovementGraph(message.flowRun);
        const wasImprovementGraphAvailable = hasImprovementGraph(state.flowRun);
        return {
          ...state,
          flowRun: areFlowRunsEqual(state.flowRun, message.flowRun) ? state.flowRun : message.flowRun,
          backwardActive: areStringArraysEqual(state.backwardActive, message.backwardActive)
            ? state.backwardActive
            : message.backwardActive,
          selectedGraph: improvementGraphAvailable && !wasImprovementGraphAvailable && message.flowRun.improvementPhase?.status === 'running'
            ? 'improvement'
            : !improvementGraphAvailable && state.selectedGraph === 'improvement'
              ? 'flow'
              : state.selectedGraph,
          stopRequestedRoles: message.flowRun.status !== 'running' ? {} : state.stopRequestedRoles,
          compactingRoles: message.flowRun.status !== 'running' ? {} : state.compactingRoles,
          hasActiveSession: message.hasActiveSession,
          latestContextUsageByRole: { ...state.latestContextUsageByRole, ...message.contextUsageByRole },
        };
      });
      handlers.refreshProjectFlows(message.flowRef.projectNamespace);
      return;
    case 'error':
      handlers.updateFlowUi(key, (state) => ({ ...state, stopRequestedRoles: {}, compactingRoles: {} }));
      handlers.showToast(message.message);
      if (message.flowRef.flowId === '__new__' || message.flowRef.flowId === '__system__') {
        handlers.setSelectorError(message.message);
      }
      return;
  }
}
