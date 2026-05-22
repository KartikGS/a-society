import { IMPROVEMENT_CHOICE_MODE } from '../../../src/common/protocol-constants.js';
import type { FeedItem } from '../components/ChatInterface';
import type { GraphMode } from '../components/GraphView';
import type {
  ConsentRequest,
  FlowRef,
  FlowRun,
  FlowSummary,
  OperatorEvent,
  WorkflowGraph,
} from '../types';
import { SYSTEM_ROLE_KEY } from './constants';
import { toRoleKey } from './roles';

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
  consentRequests: Record<string, ConsentRequest>;
  latestContextUsageByRole: Record<string, number>;
  compactingRoles: Record<string, boolean>;
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
    consentRequests: {},
    latestContextUsageByRole: {},
    compactingRoles: {},
    hasActiveSession: false,
  };
}

export function getAwaitingNodeIdForRole(flowRun: FlowRun | null, role: string | null): string | null {
  if (!flowRun || !role) return null;
  const targetKey = toRoleKey(role);
  if (!targetKey) return null;
  const match = Object.entries(flowRun.awaitingHumanNodes)
    .find(([, state]) => state.reason !== 'consent' && toRoleKey(state.role) === targetKey);
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
