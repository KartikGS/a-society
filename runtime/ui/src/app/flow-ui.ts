import { AWAITING_HUMAN_REASON, IMPROVEMENT_CHOICE_MODE } from '../../../shared/protocol-constants.js';
import type { RoleConfigurationPending } from '../../../shared/operator-protocol.js';
import type { ConsentRequest, FeedItem, FlowRef, FlowRun, FlowSummary, OperatorEvent } from '../../../shared/types.js';
import type { WorkflowDefinition as WorkflowGraph } from '../../../shared/workflow-graph.js';
import { SYSTEM_ROLE_KEY } from './constants.js';
import { toRoleKey } from './roles.js';

export type GraphMode = 'flow' | 'improvement';

export interface FlowTab {
  key: string;
  ref: FlowRef;
  title: string;
}

export interface FlowUiState {
  flowRun: FlowRun | null;
  backwardActive: string[];
  lastHandoff: Extract<OperatorEvent, { kind: 'handoff.applied' }> | null;
  roleFeeds: Record<string, FeedItem[]>;
  selectedRole: string | null;
  selectedGraph: GraphMode;
  workflow: WorkflowGraph | null;
  composerValue: string;
  waitLabels: Record<string, string | null>;
  stopRequestedRoles: Record<string, boolean>;
  compactingRoles: Record<string, boolean>;
  consentRequests: Record<string, ConsentRequest>;
  latestContextUsageByRole: Record<string, number>;
  contextWindowByRole: Record<string, number>;
  roleConfigurations: Record<string, RoleConfigurationPending>;
  hasActiveSession: boolean;
}

export function createFlowUiState(flowRun: FlowRun | null = null): FlowUiState {
  return {
    flowRun,
    backwardActive: [],
    lastHandoff: null,
    roleFeeds: {},
    selectedRole: null,
    selectedGraph: 'flow',
    workflow: null,
    composerValue: '',
    waitLabels: {},
    stopRequestedRoles: {},
    compactingRoles: {},
    consentRequests: {},
    latestContextUsageByRole: {},
    contextWindowByRole: {},
    roleConfigurations: {},
    hasActiveSession: false,
  };
}

export function getAwaitingNodeIdForRole(flowRun: FlowRun | null, role: string | null): string | null {
  if (!flowRun || !role) return null;
  const targetKey = toRoleKey(role);
  if (!targetKey) return null;
  const match = Object.entries(flowRun.awaitingHumanNodes)
    .find(([, state]) =>
      state.reason !== AWAITING_HUMAN_REASON.CONSENT &&
      state.reason !== AWAITING_HUMAN_REASON.ROLE_CONFIGURATION &&
      state.reason !== AWAITING_HUMAN_REASON.HANDOFF_APPROVAL &&
      toRoleKey(state.role) === targetKey);
  return match?.[0] ?? null;
}

export function getRoleConfigurationNodeIdForRole(flowRun: FlowRun | null, role: string | null): string | null {
  if (!flowRun || !role) return null;
  const targetKey = toRoleKey(role);
  if (!targetKey) return null;
  const match = Object.entries(flowRun.awaitingHumanNodes)
    .find(([, state]) =>
      state.reason === AWAITING_HUMAN_REASON.ROLE_CONFIGURATION &&
      toRoleKey(state.role) === targetKey);
  return match?.[0] ?? null;
}

export function getHandoffApprovalNodeIdForRole(flowRun: FlowRun | null, role: string | null): string | null {
  if (!flowRun || !role) return null;
  const targetKey = toRoleKey(role);
  if (!targetKey) return null;
  const match = Object.entries(flowRun.awaitingHumanNodes)
    .find(([, state]) =>
      state.reason === AWAITING_HUMAN_REASON.HANDOFF_APPROVAL &&
      toRoleKey(state.role) === targetKey);
  return match?.[0] ?? null;
}

export function getAwaitingHandoffNodeIdForRole(
  flowRun: FlowRun | null,
  workflow: WorkflowGraph | null,
  role: string | null
): string | null {
  if (!flowRun || !workflow || !role) return null;
  const targetKey = toRoleKey(role);
  if (!targetKey) return null;
  const match = flowRun.awaitingHandoff.find((nodeId) => {
    const node = workflow.nodes.find((candidate) => candidate.id === nodeId);
    return toRoleKey(node?.role) === targetKey;
  });
  return match ?? null;
}

export function getImprovementAwaitingRoleName(flowRun: FlowRun | null, role: string | null): string | null {
  if (!flowRun || !role) return null;
  const targetKey = toRoleKey(role);
  if (!targetKey) return null;
  const awaitingRoles = flowRun.improvementPhase?.awaitingHumanRoles;
  if (!awaitingRoles) return null;
  const match = Object.entries(awaitingRoles).find(
    ([roleName, state]) => state.reason !== AWAITING_HUMAN_REASON.CONSENT && toRoleKey(roleName) === targetKey
  );
  return match?.[0] ?? null;
}

export function getConsentRequestRoleKey(request: ConsentRequest | null | undefined): string | null {
  return toRoleKey(request?.role);
}

export function collectSelectableRoles(roleFeeds: Record<string, FeedItem[]>, workflow: WorkflowGraph | null): string[] {
  const roleSet = new Set<string>();
  if (workflow) {
    for (const node of workflow.nodes) {
      const key = toRoleKey(node.role);
      if (key && key !== SYSTEM_ROLE_KEY) roleSet.add(key);
    }
  }
  for (const role of Object.keys(roleFeeds)) {
    if (role !== SYSTEM_ROLE_KEY) roleSet.add(role);
  }
  return [...roleSet];
}

export function titleForFlow(flowRun: FlowRun | FlowSummary | FlowRef): string {
  if ('recordName' in flowRun && flowRun.recordName) return flowRun.recordName;
  return flowRun.flowId;
}

export function hasImprovementGraph(flowRun: FlowRun | null): boolean {
  return (
    flowRun?.improvementPhase?.mode === IMPROVEMENT_CHOICE_MODE.GRAPH_BASED ||
    flowRun?.improvementPhase?.mode === IMPROVEMENT_CHOICE_MODE.PARALLEL
  );
}
