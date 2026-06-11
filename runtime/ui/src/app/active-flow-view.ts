import { getActiveNodeIds } from '../../../src/common/flow-state.js';
import type { GraphMode } from '../components/GraphView';
import type { ConsentRequest, FeedItem, FlowRun, FlowSummary, WorkflowGraph } from '../types';
import { DEFAULT_SELECTED_ROLE_KEY, EMPTY_STRINGS, SYSTEM_ROLE_KEY } from './constants';
import { feedbackConsentCopy } from './feedback-copy';
import {
  collectSelectableRoles,
  getAwaitingHandoffNodeIdForRole,
  getAwaitingNodeIdForRole,
  getImprovementAwaitingRoleName,
  hasImprovementGraph,
  type FlowTab,
  type FlowUiState,
} from './flow-ui';
import { isBackwardHandoffSource } from './handoff-source.js';
import { toRoleKey } from './roles';

export interface ActiveFlowViewInput {
  tabs: FlowTab[];
  activeTabKey: string | null;
  flowUiByKey: Record<string, FlowUiState>;
  selectedProject: string | null;
  projectFlowsByProject: Record<string, FlowSummary[]>;
  socketOpen: boolean;
}

export interface ActiveFlowView {
  activeTab: FlowTab | null;
  activeUi: FlowUiState | null;
  flowRun: FlowRun | null;
  workflow: WorkflowGraph | null;
  backwardActive: string[];
  projectFlows: FlowSummary[];
  hasActiveFlowState: boolean;
  graphMode: GraphMode;
  improvementGraphAvailable: boolean;
  backwardSources: string[];
  roles: string[];
  activeRoles: string[];
  viewedRole: string | null;
  visibleFeed: FeedItem[];
  visibleConsentRequest: ConsentRequest | null;
  isAwaitingImprovementChoice: boolean;
  isAwaitingFeedbackConsent: boolean;
  feedbackPrompt: ReturnType<typeof feedbackConsentCopy>;
  visibleWaitLabel: string | null;
  hasActiveSession: boolean;
  inputDisabled: boolean;
  inputPlaceholder: string;
  improvementInputTargetRole: string | null;
  canStopViewedRole: boolean;
  stopRequestedForViewedRole: boolean;
  isViewedRoleCompacting: boolean;
  inputTargetRole: string;
  composerValue: string;
  latestContextUsage: number | null;
}

function resolveInputTargetRole(
  flowRun: FlowRun | null,
  workflow: WorkflowGraph | null,
  selectedRole: string | null,
): string {
  if (flowRun && selectedRole && getAwaitingNodeIdForRole(flowRun, selectedRole)) {
    return selectedRole;
  }
  if (flowRun && workflow && selectedRole && getAwaitingHandoffNodeIdForRole(flowRun, workflow, selectedRole)) {
    return selectedRole;
  }

  if (flowRun && workflow && getActiveNodeIds(flowRun).length === 1) {
    const activeNode = workflow.nodes.find((node) => node.id === getActiveNodeIds(flowRun)[0]);
    if (activeNode) return toRoleKey(activeNode.role) ?? SYSTEM_ROLE_KEY;
  }

  if (selectedRole) return selectedRole;
  return SYSTEM_ROLE_KEY;
}

function activeRoleKeys(flowRun: FlowRun | null, workflow: WorkflowGraph | null): string[] {
  if (!flowRun) return EMPTY_STRINGS;

  if (flowRun.improvementPhase?.status === 'running') {
    return [...new Set(
      (flowRun.improvementPhase.runningRoles ?? [])
        .map((role) => toRoleKey(role))
        .filter((role): role is string => role !== null)
    )];
  }

  if (!workflow) return EMPTY_STRINGS;
  return [...new Set(
    getActiveNodeIds(flowRun)
      .map((nodeId) => workflow.nodes.find((node) => node.id === nodeId)?.role)
      .map((role) => (role ? toRoleKey(role) : null))
      .filter((role): role is string => role !== null)
  )];
}

export function createActiveFlowView(input: ActiveFlowViewInput): ActiveFlowView {
  const activeTab = input.activeTabKey
    ? input.tabs.find((tab) => tab.key === input.activeTabKey) ?? null
    : null;
  const activeUi = input.activeTabKey ? input.flowUiByKey[input.activeTabKey] ?? null : null;
  const flowRun = activeUi?.flowRun ?? null;
  const workflow = activeUi?.workflow ?? null;
  const selectedRole = activeUi?.selectedRole ?? DEFAULT_SELECTED_ROLE_KEY;
  const selectedGraph = activeUi?.selectedGraph ?? 'flow';
  const lastHandoff = activeUi?.lastHandoff ?? null;
  const backwardActive = activeUi?.backwardActive ?? EMPTY_STRINGS;
  const projectFlows = input.selectedProject
    ? input.projectFlowsByProject[input.selectedProject] ?? []
    : [];
  const hasActiveFlowState = flowRun !== null;

  const activeNodeIds = flowRun ? getActiveNodeIds(flowRun) : undefined;
  const improvementGraphAvailable = hasImprovementGraph(flowRun);
  const graphMode = selectedGraph === 'improvement' && improvementGraphAvailable ? 'improvement' : 'flow';
  const lastHandoffFromNodeId = lastHandoff?.fromNodeId;
  const backwardSources =
    activeNodeIds &&
    lastHandoffFromNodeId &&
    activeNodeIds.includes(lastHandoffFromNodeId) &&
    isBackwardHandoffSource(workflow, lastHandoff)
      ? [lastHandoffFromNodeId]
      : EMPTY_STRINGS;

  const roleList = collectSelectableRoles(activeUi?.roleFeeds ?? {}, workflow);
  const roles = roleList.length > 0 ? roleList : EMPTY_STRINGS;
  const activeRoles = activeRoleKeys(flowRun, workflow);

  const viewedRole = selectedRole;
  const displayedFeed = viewedRole ? (activeUi?.roleFeeds[viewedRole] ?? []) : [];
  const visibleFeed = displayedFeed.length > 0 ? displayedFeed : (activeUi?.roleFeeds[SYSTEM_ROLE_KEY] ?? []);
  const visibleConsentRequest = viewedRole
    ? activeUi?.consentRequests[viewedRole] ?? null
    : null;
  const isViewedRoleActive = viewedRole ? activeRoles.includes(viewedRole) : false;
  const viewedRoleAwaitingNodeId = getAwaitingNodeIdForRole(flowRun, viewedRole);
  const viewedRoleAwaitingHandoffNodeId = getAwaitingHandoffNodeIdForRole(flowRun, workflow, viewedRole);
  const improvementInputTargetRole = getImprovementAwaitingRoleName(flowRun, viewedRole);
  const isAwaitingImprovementChoice = flowRun?.status === 'awaiting_improvement_choice';
  const isAwaitingFeedbackConsent = flowRun?.status === 'awaiting_feedback_consent';
  const feedbackPrompt = feedbackConsentCopy(flowRun);
  const visibleWaitLabel = viewedRole ? (activeUi?.waitLabels[viewedRole] ?? null) : null;
  const hasActiveSession = activeUi?.hasActiveSession ?? false;
  const inputDisabled = !hasActiveSession || (!viewedRoleAwaitingNodeId && !viewedRoleAwaitingHandoffNodeId && !improvementInputTargetRole);
  const inputPlaceholder = !hasActiveSession
    ? 'Resume the flow to reply.'
    : !inputDisabled
      ? 'Reply to the selected role.'
      : 'Select a role that is awaiting input or handoff.';
  const canStop =
    !!flowRun &&
    hasActiveSession &&
    input.socketOpen;
  const viewedRoleWaitLabel = viewedRole ? (activeUi?.waitLabels[viewedRole] ?? null) : null;
  const canStopViewedRole = canStop && (
    !!viewedRoleWaitLabel ||
    (isViewedRoleActive && !viewedRoleAwaitingNodeId && !viewedRoleAwaitingHandoffNodeId && !improvementInputTargetRole)
  );
  const stopRequestedForViewedRole = viewedRole ? Boolean(activeUi?.stopRequestedRoles[viewedRole]) : false;
  const isViewedRoleCompacting = viewedRole ? Boolean(activeUi?.compactingRoles[viewedRole]) : false;
  const latestContextUsage = viewedRole ? (activeUi?.latestContextUsageByRole[viewedRole] ?? null) : null;

  return {
    activeTab,
    activeUi,
    flowRun,
    workflow,
    backwardActive,
    projectFlows,
    hasActiveFlowState,
    graphMode,
    improvementGraphAvailable,
    backwardSources,
    roles,
    activeRoles,
    viewedRole,
    visibleFeed,
    visibleConsentRequest,
    isAwaitingImprovementChoice,
    isAwaitingFeedbackConsent,
    feedbackPrompt,
    visibleWaitLabel,
    hasActiveSession,
    inputDisabled,
    inputPlaceholder,
    improvementInputTargetRole,
    canStopViewedRole,
    stopRequestedForViewedRole,
    isViewedRoleCompacting,
    inputTargetRole: resolveInputTargetRole(flowRun, workflow, selectedRole),
    composerValue: activeUi?.composerValue ?? '',
    latestContextUsage,
  };
}
