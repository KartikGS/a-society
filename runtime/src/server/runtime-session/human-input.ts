import { parseRoleIdentity } from '../../common/role-id.js';
import type { FlowRun } from '../../common/types.js';

export function isAwaitingHumanReply(reason: FlowRun['awaitingHumanNodes'][string]['reason']): boolean {
  return reason !== 'consent';
}

export function hasAwaitingHumanNodes(flowRun: FlowRun): boolean {
  return Object.values(flowRun.awaitingHumanNodes).some((state) => isAwaitingHumanReply(state.reason));
}

export function resolveAwaitingHumanNode(flowRun: FlowRun, target?: { nodeId?: string; role?: string }): string {
  const awaitingNodeIds = Object.keys(flowRun.awaitingHumanNodes)
    .filter((nodeId) => isAwaitingHumanReply(flowRun.awaitingHumanNodes[nodeId].reason));
  if (target?.nodeId) {
    const awaitingState = flowRun.awaitingHumanNodes[target.nodeId];
    if (!awaitingState) {
      throw new Error(`Node '${target.nodeId}' is not awaiting human input.`);
    }
    if (!isAwaitingHumanReply(awaitingState.reason)) {
      throw new Error(`Node '${target.nodeId}' is awaiting consent, not a text reply.`);
    }
    return target.nodeId;
  }

  if (target?.role) {
    const roleKey = parseRoleIdentity(target.role).instanceRoleId;
    const matches = awaitingNodeIds.filter((nodeId) =>
      parseRoleIdentity(flowRun.awaitingHumanNodes[nodeId].role).instanceRoleId === roleKey
    );
    if (matches.length === 1) return matches[0];
    if (matches.length === 0) {
      throw new Error(`Role '${target.role}' is not awaiting human input.`);
    }
    throw new Error(`Role '${target.role}' has multiple awaiting nodes. Specify nodeId.`);
  }

  if (awaitingNodeIds.length === 1) {
    return awaitingNodeIds[0];
  }

  throw new Error('Multiple nodes are awaiting human input. Specify nodeId or role.');
}
