import { parseRoleIdentity } from '../../common/role-id.js';
import { AWAITING_HUMAN_REASON } from '../../common/protocol-constants.js';
import type { FlowRun } from '../../common/types.js';

type WorkflowLike = {
  nodes?: Array<{ id?: unknown; role?: unknown }>;
};

interface ResolvedHumanInputTarget {
  nodeId: string;
  role?: string;
}

export function isAwaitingHumanReply(reason: FlowRun['awaitingHumanNodes'][string]['reason']): boolean {
  return reason !== AWAITING_HUMAN_REASON.CONSENT && reason !== AWAITING_HUMAN_REASON.ROLE_CONFIGURATION;
}

function workflowRoleForNode(workflow: WorkflowLike | null | undefined, nodeId: string): string | undefined {
  const node = workflow?.nodes?.find((candidate) => candidate.id === nodeId);
  return typeof node?.role === 'string' ? node.role : undefined;
}

function humanInputTargets(flowRun: FlowRun, workflow?: WorkflowLike | null): ResolvedHumanInputTarget[] {
  const targets: ResolvedHumanInputTarget[] = [];

  for (const [nodeId, state] of Object.entries(flowRun.awaitingHumanNodes)) {
    if (isAwaitingHumanReply(state.reason)) targets.push({ nodeId, role: state.role });
  }

  for (const nodeId of flowRun.awaitingHandoff) {
    targets.push({ nodeId, role: workflowRoleForNode(workflow, nodeId) });
  }

  return targets;
}

export function hasHumanInputTargets(flowRun: FlowRun): boolean {
  return (
    Object.values(flowRun.awaitingHumanNodes).some((state) => isAwaitingHumanReply(state.reason)) ||
    flowRun.awaitingHandoff.length > 0
  );
}

export function resolveHumanInputTarget(
  flowRun: FlowRun,
  workflow: WorkflowLike | null | undefined,
  target?: { nodeId?: string; role?: string }
): ResolvedHumanInputTarget {
  const targets = humanInputTargets(flowRun, workflow);

  if (target?.nodeId) {
    const awaitingState = flowRun.awaitingHumanNodes[target.nodeId];
    if (awaitingState) {
      if (!isAwaitingHumanReply(awaitingState.reason)) {
        const waitKind = awaitingState.reason === AWAITING_HUMAN_REASON.ROLE_CONFIGURATION
          ? 'role configuration'
          : 'consent';
        throw new Error(`Node '${target.nodeId}' is awaiting ${waitKind}, not a text reply.`);
      }
      return { nodeId: target.nodeId, role: awaitingState.role };
    }
    if (flowRun.awaitingHandoff.includes(target.nodeId)) {
      return { nodeId: target.nodeId, role: workflowRoleForNode(workflow, target.nodeId) ?? target.role };
    }
    throw new Error(`Node '${target.nodeId}' is not accepting human input.`);
  }

  if (target?.role) {
    const roleKey = parseRoleIdentity(target.role).instanceRoleId;
    const matches = targets.filter((candidate) =>
      candidate.role && parseRoleIdentity(candidate.role).instanceRoleId === roleKey
    );
    if (matches.length === 1) return matches[0];
    if (matches.length === 0) {
      throw new Error(`Role '${target.role}' is not accepting human input.`);
    }
    throw new Error(`Role '${target.role}' has multiple nodes accepting human input. Specify nodeId.`);
  }

  if (targets.length === 1) {
    return targets[0];
  }

  throw new Error('Multiple nodes are accepting human input. Specify nodeId or role.');
}
