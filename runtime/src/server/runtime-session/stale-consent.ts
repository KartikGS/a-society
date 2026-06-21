import { parseRoleIdentity } from '../../../shared/role-id.js';
import { AWAITING_HUMAN_REASON } from '../../../shared/protocol-constants.js';
import type {
  FlowRef,
  FlowRun,
  RuntimeMessageParam,
} from '../../common/types.js';
import * as SessionStore from '../../orchestration/store.js';

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

function repairStaleConsentTranscript(ref: FlowRef, nodeId: string, role: string): void {
  const roleKey = parseRoleIdentity(role).instanceRoleId;
  const roleSession = SessionStore.loadRoleSession(roleKey, ref);
  if (!roleSession) return;

  let changed = appendStaleConsentToolResults(roleSession.transcriptHistory as RuntimeMessageParam[]);
  if (roleSession.currentNodeContext?.nodeId === nodeId) {
    changed = appendStaleConsentToolResults(roleSession.currentNodeContext.exchanges) || changed;
  }
  if (changed) {
    SessionStore.saveRoleSession(roleSession, ref);
  }
}

export async function normalizeStaleConsentWaits(
  ref: FlowRef,
  readFlowRun: ReadFlowRun
): Promise<FlowRun | null> {
  const flowRun = readFlowRun(ref);
  if (!flowRun) return null;

  const staleConsentNodes = Object.entries(flowRun.awaitingHumanNodes)
    .filter(([, state]) => state.reason === AWAITING_HUMAN_REASON.CONSENT);
  if (staleConsentNodes.length === 0) return flowRun;

  for (const [nodeId, state] of staleConsentNodes) {
    repairStaleConsentTranscript(ref, nodeId, state.role);
  }

  return SessionStore.updateFlowRun((flow) => {
    for (const [nodeId, state] of Object.entries(flow.awaitingHumanNodes)) {
      if (state.reason === AWAITING_HUMAN_REASON.CONSENT) {
        flow.awaitingHumanNodes[nodeId] = { role: state.role, reason: AWAITING_HUMAN_REASON.CONSENT_DENIED };
      }
    }
  }, ref);
}
