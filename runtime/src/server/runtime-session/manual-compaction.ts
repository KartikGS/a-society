import type { FlowRef, FlowRun, OperatorRenderSink, RuntimeMessageParam } from '../../common/types.js';
import {
  compactRoleSession,
  type CompactionTrigger,
  type RoleSessionCompactionResult,
} from '../../orchestration/compaction.js';
import { resolveRoleModel } from '../../orchestration/role-model.js';
import { SessionStore } from '../../orchestration/store.js';

export async function compactPersistedRoleContext(options: {
  flowRun: FlowRun;
  flowRef: FlowRef;
  workspaceRoot: string;
  roleName: string;
  roleInstanceId: string;
  trigger: CompactionTrigger;
  signal: AbortSignal;
  operatorRenderer: OperatorRenderSink;
}): Promise<RoleSessionCompactionResult> {
  const session = SessionStore.loadRoleSession(
    options.roleInstanceId,
    options.flowRef,
    options.workspaceRoot
  );
  if (!session) {
    const reason = `No persisted session found for role "${options.roleName}".`;
    options.operatorRenderer.emit({
      kind: 'session.compaction_failed',
      role: options.roleName,
      trigger: options.trigger,
      reason,
    });
    return { compacted: false, reason };
  }

  options.operatorRenderer.emit({
    kind: 'session.compaction_started',
    role: options.roleName,
    trigger: options.trigger,
  });

  const nodeId = session.currentNodeContext?.nodeId ?? session.currentNodeId ?? options.roleInstanceId;
  const exchanges = session.currentNodeContext?.exchanges?.length
    ? session.currentNodeContext.exchanges as RuntimeMessageParam[]
    : session.transcriptHistory as RuntimeMessageParam[];

  let result: RoleSessionCompactionResult;
  try {
    result = await compactRoleSession({
      session,
      flowRun: options.flowRun,
      roleName: options.roleName,
      trigger: options.trigger,
      signal: options.signal,
      operatorRenderer: options.operatorRenderer,
      nodeId,
      exchanges,
      model: resolveRoleModel(options.workspaceRoot, options.flowRef, options.roleInstanceId),
    });
  } catch (error) {
    if (options.signal.aborted) {
      const reason = 'Context compaction aborted by operator.';
      options.operatorRenderer.emit({
        kind: 'session.compaction_failed',
        role: options.roleName,
        trigger: options.trigger,
        reason,
      });
      return { compacted: false, aborted: true, reason };
    }
    const reason = error instanceof Error ? error.message : String(error);
    options.operatorRenderer.emit({
      kind: 'session.compaction_failed',
      role: options.roleName,
      trigger: options.trigger,
      reason,
    });
    throw error;
  }

  if (!result.compacted) {
    options.operatorRenderer.emit({
      kind: 'session.compaction_failed',
      role: options.roleName,
      trigger: options.trigger,
      reason: result.reason ?? 'No context was available to compact.',
    });
    return result;
  }

  SessionStore.saveRoleSession(session, options.flowRef, options.workspaceRoot);
  options.operatorRenderer.emit({
    kind: 'session.compacted',
    role: options.roleName,
    nodeId,
    trigger: options.trigger,
    archiveId: result.archiveId!,
  });

  return result;
}
