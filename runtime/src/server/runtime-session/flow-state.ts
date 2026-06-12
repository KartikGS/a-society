import { getActiveNodeIds } from '../../common/flow-state.js';
import type {
  FlowRef,
  FlowRun,
} from '../../common/types.js';
import { resolveRoleModel } from '../../orchestration/role-model.js';
import { SessionStore } from '../../orchestration/store.js';
import type { FlowStateMessage } from '../protocol.js';
import { latestContextUsageFromSession } from './feed.js';
import type { ActiveSession } from './types.js';

type ReadFlowRun = (ref: FlowRef) => FlowRun | null;

export function buildFlowStateMessage(
  session: ActiveSession | null,
  ref: FlowRef,
  readFlowRun: ReadFlowRun,
  workspaceRoot: string
): FlowStateMessage | null {
  const flowRun = readFlowRun(ref);
  if (!flowRun) return null;
  const backwardActive = session
    ? Array.from(session.backwardActive).filter((nodeId) => getActiveNodeIds(flowRun).includes(nodeId))
    : [];
  const contextUsageByRole: Record<string, number> = session
    ? { ...session.latestContextUsageByRole }
    : Object.fromEntries(
        SessionStore.listRoleKeys(ref, workspaceRoot)
          .map((roleKey) => {
            const roleSession = SessionStore.loadRoleSession(roleKey, ref, workspaceRoot);
            const contextUsage = latestContextUsageFromSession(roleSession);
            return contextUsage != null ? [roleKey, contextUsage] as const : null;
          })
          .filter((entry): entry is [string, number] => entry !== null)
      );
  // Context window of the model each role actually runs on: its persisted
  // per-flow selection when usable, otherwise the active model.
  const contextWindowByRole: Record<string, number> = Object.fromEntries(
    SessionStore.listRoleKeys(ref, workspaceRoot)
      .map((roleKey) => {
        const model = resolveRoleModel(workspaceRoot, ref, roleKey);
        return model ? [roleKey, model.contextWindow] as const : null;
      })
      .filter((entry): entry is [string, number] => entry !== null)
  );
  return {
    type: 'flow_state',
    flowRef: ref,
    flowRun,
    backwardActive,
    hasActiveSession: session !== null && !session.finished,
    contextUsageByRole,
    contextWindowByRole,
  };
}
