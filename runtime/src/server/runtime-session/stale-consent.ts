import { parseRoleIdentity } from '../../common/role-id.js';
import type {
  FlowRef,
  FlowRun,
  RuntimeMessageParam,
} from '../../common/types.js';
import { SessionStore } from '../../orchestration/store.js';

const STALE_CONSENT_TOOL_RESULT =
  'Consent prompt was no longer available after runtime resume. The node is paused for operator guidance.';

type ReadFlowRun = (ref: FlowRef) => FlowRun | null;

function appendStaleConsentToolResults(messages: RuntimeMessageParam[]): boolean {
  const last = messages[messages.length - 1];
  if (last?.role !== 'assistant_tool_calls') return false;

  for (const call of last.calls) {
    messages.push({
      role: 'tool_result',
      callId: call.id,
      toolName: call.name,
      content: STALE_CONSENT_TOOL_RESULT,
      isError: true,
    });
  }
  return last.calls.length > 0;
}

function repairStaleConsentTranscript(ref: FlowRef, nodeId: string, role: string, workspaceRoot: string): void {
  const roleKey = parseRoleIdentity(role).instanceRoleId;
  const roleSession = SessionStore.loadRoleSession(roleKey, ref, workspaceRoot);
  if (!roleSession) return;

  let changed = appendStaleConsentToolResults(roleSession.transcriptHistory as RuntimeMessageParam[]);
  if (roleSession.currentNodeContext?.nodeId === nodeId) {
    changed = appendStaleConsentToolResults(roleSession.currentNodeContext.exchanges) || changed;
  }
  if (changed) {
    SessionStore.saveRoleSession(roleSession, ref, workspaceRoot);
  }
}

export async function normalizeStaleConsentWaits(
  ref: FlowRef,
  readFlowRun: ReadFlowRun,
  workspaceRoot: string
): Promise<FlowRun | null> {
  const flowRun = readFlowRun(ref);
  if (!flowRun) return null;

  const staleConsentNodes = Object.entries(flowRun.awaitingHumanNodes)
    .filter(([, state]) => state.reason === 'consent');
  if (staleConsentNodes.length === 0) return flowRun;

  for (const [nodeId, state] of staleConsentNodes) {
    repairStaleConsentTranscript(ref, nodeId, state.role, workspaceRoot);
  }

  return SessionStore.updateFlowRun((flow) => {
    for (const [nodeId, state] of Object.entries(flow.awaitingHumanNodes)) {
      if (state.reason === 'consent') {
        flow.awaitingHumanNodes[nodeId] = { role: state.role, reason: 'consent-denied' };
      }
    }
  }, ref, workspaceRoot);
}
