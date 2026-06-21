import { getActiveNodeIds } from '../../../shared/flow-state.js';
import { AWAITING_HUMAN_REASON } from '../../../shared/protocol-constants.js';
import type {
  FlowRef,
  FlowRun,
} from '../../common/types.js';
import { resolveCapabilityGate } from '../../orchestration/capability-selection.js';
import { resolveRoleModel, resolveRoleModelGate } from '../../orchestration/role-model.js';
import * as SessionStore from '../../orchestration/store.js';
import type { FlowStateMessage, RoleConfigurationPending } from '../protocol.js';
import { latestContextUsageFromSession } from './feed.js';
import type { ActiveSession } from './types.js';

type ReadFlowRun = (ref: FlowRef) => FlowRun | null;

export function buildFlowStateMessage(
  session: ActiveSession | null,
  ref: FlowRef,
  readFlowRun: ReadFlowRun
): FlowStateMessage | null {
  const flowRun = readFlowRun(ref);
  if (!flowRun) return null;
  const backwardActive = session
    ? Array.from(session.backwardActive).filter((nodeId) => getActiveNodeIds(flowRun).includes(nodeId))
    : [];
  const contextUsageByRole: Record<string, number> = session
    ? { ...session.latestContextUsageByRole }
    : Object.fromEntries(
        SessionStore.listRoleKeys(ref)
          .map((roleKey) => {
            const roleSession = SessionStore.loadRoleSession(roleKey, ref);
            const contextUsage = latestContextUsageFromSession(roleSession);
            return contextUsage != null ? [roleKey, contextUsage] as const : null;
          })
          .filter((entry): entry is [string, number] => entry !== null)
      );
  // Context window of the model each role actually runs on: its persisted
  // per-flow selection when usable, otherwise the active model.
  const contextWindowByRole: Record<string, number> = Object.fromEntries(
    SessionStore.listRoleKeys(ref)
      .map((roleKey) => {
        const model = resolveRoleModel(ref, roleKey);
        return model ? [roleKey, model.contextWindow] as const : null;
      })
      .filter((entry): entry is [string, number] => entry !== null)
  );
  // Pending configuration dimensions per node awaiting role configuration, so the
  // UI prompts only for dimensions left manual (auto-resolved ones read as decided).
  const roleConfigurations: Record<string, RoleConfigurationPending> = {};
  for (const [awaitingNodeId, awaitingState] of Object.entries(flowRun.awaitingHumanNodes)) {
    if (awaitingState.reason !== AWAITING_HUMAN_REASON.ROLE_CONFIGURATION) continue;
    const modelGate = resolveRoleModelGate(ref, awaitingState.role);
    const capabilityGate = resolveCapabilityGate(ref, awaitingState.role);
    roleConfigurations[awaitingNodeId] = {
      pendingModel: modelGate.kind === 'selection-required',
      pendingSkills: capabilityGate.kind === 'selection-required' && capabilityGate.pendingSkills,
      pendingMcp: capabilityGate.kind === 'selection-required' && capabilityGate.pendingMcp,
    };
  }
  return {
    type: 'flow_state',
    flowRef: ref,
    flowRun,
    backwardActive,
    hasActiveSession: session !== null && !session.finished,
    contextUsageByRole,
    contextWindowByRole,
    roleConfigurations,
  };
}
