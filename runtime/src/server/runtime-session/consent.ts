import { flowKey } from '../../common/flow-ref.js';
import { CONSENT_RESPONSE_DECISION } from '../../common/protocol-constants.js';
import { parseRoleIdentity } from '../../common/role-id.js';
import { defaultConsentState, normalizeConsentState } from '../../common/types.js';
import type {
  ConsentMode,
  ConsentRequest,
  ConsentResponseDecision,
  FlowRef,
} from '../../common/types.js';
import { SessionStore } from '../../orchestration/store.js';
import type { FlowStateMessage, ServerMessage } from '../protocol.js';
import type { ActiveSession } from './types.js';

type RuntimeSessionConsentDeps = {
  workspaceRoot: string;
  activeSessions: Map<string, ActiveSession>;
  emitFlowState: (session: ActiveSession) => void;
  readFlowStateMessage: (session: ActiveSession | null, ref: FlowRef) => FlowStateMessage | null;
  broadcastToFlow: (ref: FlowRef, message: ServerMessage) => void;
};

export function createRuntimeSessionConsent(deps: RuntimeSessionConsentDeps) {
  const {
    workspaceRoot,
    activeSessions,
    emitFlowState,
    readFlowStateMessage,
    broadcastToFlow,
  } = deps;

  async function markNodeAwaitingConsent(session: ActiveSession, request: ConsentRequest): Promise<void> {
    await SessionStore.updateFlowRun((flow) => {
      if (flow.improvementPhase?.status === 'running') {
        const roleInstanceId = parseRoleIdentity(request.role).instanceRoleId;
        if (!flow.improvementPhase.awaitingHumanRoles) flow.improvementPhase.awaitingHumanRoles = {};
        flow.improvementPhase.awaitingHumanRoles[roleInstanceId] = { reason: 'consent' };
        flow.improvementPhase.activeNodeIds = (flow.improvementPhase.activeNodeIds ?? []).filter(id => id !== request.nodeId);
        return;
      }
      flow.runningNodes = flow.runningNodes.filter((id) => id !== request.nodeId);
      flow.awaitingHumanNodes[request.nodeId] = { role: request.role, reason: 'consent' };
      flow.status = 'running';
    }, session.flowRef, workspaceRoot);
    emitFlowState(session);
  }

  async function clearNodeAwaitingConsent(
    session: ActiveSession,
    request: ConsentRequest,
    decision: ConsentResponseDecision
  ): Promise<void> {
    await SessionStore.updateFlowRun((flow) => {
      flow.consentState = session.consentGate.getState();

      if (flow.improvementPhase?.status === 'running') {
        const roleInstanceId = parseRoleIdentity(request.role).instanceRoleId;
        if (flow.improvementPhase.awaitingHumanRoles?.[roleInstanceId]?.reason !== 'consent') return;
        if (decision === CONSENT_RESPONSE_DECISION.DENY) {
          flow.improvementPhase.awaitingHumanRoles[roleInstanceId] = { reason: 'consent-denied' };
        } else {
          delete flow.improvementPhase.awaitingHumanRoles[roleInstanceId];
          if (!(flow.improvementPhase.activeNodeIds ?? []).includes(request.nodeId)) {
            flow.improvementPhase.activeNodeIds = [...(flow.improvementPhase.activeNodeIds ?? []), request.nodeId];
          }
        }
        return;
      }

      if (flow.awaitingHumanNodes[request.nodeId]?.reason !== 'consent') return;

      if (decision === CONSENT_RESPONSE_DECISION.DENY) {
        flow.awaitingHumanNodes[request.nodeId] = { role: request.role, reason: 'consent-denied' };
        flow.runningNodes = flow.runningNodes.filter((id) => id !== request.nodeId);
        flow.status = 'running';
        return;
      }

      delete flow.awaitingHumanNodes[request.nodeId];
      if (!flow.runningNodes.includes(request.nodeId)) {
        flow.runningNodes.push(request.nodeId);
      }
      flow.status = 'running';
    }, session.flowRef, workspaceRoot);
    emitFlowState(session);
  }

  function persistActiveSessionConsentState(session: ActiveSession): void {
    void SessionStore.updateFlowRun((flow) => {
      flow.consentState = session.consentGate.getState();
    }, session.flowRef, workspaceRoot).then(() => emitFlowState(session));
  }

  function persistInactiveConsentMode(ref: FlowRef, mode: ConsentMode): void {
    void SessionStore.updateFlowRun((flow) => {
      if (!flow.consentState) {
        flow.consentState = defaultConsentState();
      }
      flow.consentState = normalizeConsentState(flow.consentState);
      flow.consentState.mode = mode;
    }, ref, workspaceRoot).then(() => {
      const msg = readFlowStateMessage(activeSessions.get(flowKey(ref)) ?? null, ref);
      if (msg) broadcastToFlow(ref, msg);
    });
  }

  return {
    markNodeAwaitingConsent,
    clearNodeAwaitingConsent,
    persistActiveSessionConsentState,
    persistInactiveConsentMode,
  };
}

export type RuntimeSessionConsent = ReturnType<typeof createRuntimeSessionConsent>;
