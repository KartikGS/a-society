import { flowKey } from '../../common/flow-ref.js';
import {
  CONSENT_MODE,
  CONSENT_RESPONSE_DECISION,
  FEEDBACK_CONSENT_DECISION,
  IMPROVEMENT_CHOICE_MODE,
} from '../../common/protocol-constants.js';
import type {
  ProtocolFeedbackConsentDecision,
  ProtocolImprovementChoiceMode,
} from '../../common/protocol-constants.js';
import { parseRoleIdentity } from '../../common/role-id.js';
import type {
  ConsentMode,
  ConsentResponseDecision,
  FlowRef,
  FlowRun,
} from '../../common/types.js';
import { ImprovementOrchestrator } from '../../improvement/improvement.js';
import { SessionStore } from '../../orchestration/store.js';
import * as SettingsStore from '../../settings/settings-store.js';
import type { FlowReadModel } from '../flow-read-model.js';
import type { HistoricalMessage, ServerMessage } from '../protocol.js';
import type { RuntimeSessionConsent } from './consent.js';
import { createRoleOutputStream } from './feed.js';
import {
  hasAwaitingHumanNodes,
  isAwaitingHumanReply,
  resolveAwaitingHumanNode,
} from './human-input.js';
import type { ActiveSession } from './types.js';

type RuntimeSessionCommandsDeps = {
  workspaceRoot: string;
  activeSessions: Map<string, ActiveSession>;
  readFlowRun: (ref: FlowRef) => FlowRun | null;
  resolveWorkflow: FlowReadModel['resolveWorkflow'];
  createSession: (ref: FlowRef) => ActiveSession;
  startFlowRunner: (session: ActiveSession, projectNamespace: string) => void;
  attachSessionTask: (session: ActiveSession, taskFactory: () => Promise<void>) => Promise<void>;
  emitHistoricalMessage: (session: ActiveSession, message: HistoricalMessage) => void;
  emitFlowState: (session: ActiveSession) => void;
  broadcastToFlow: (ref: FlowRef, message: ServerMessage) => void;
  missingModelError: (ref: FlowRef) => ServerMessage;
  consent: RuntimeSessionConsent;
};

export function createRuntimeSessionCommands(deps: RuntimeSessionCommandsDeps) {
  const {
    workspaceRoot,
    activeSessions,
    readFlowRun,
    resolveWorkflow,
    createSession,
    startFlowRunner,
    attachSessionTask,
    emitHistoricalMessage,
    emitFlowState,
    broadcastToFlow,
    missingModelError,
    consent,
  } = deps;

  async function handleHumanInput(ref: FlowRef, text: string, target?: { nodeId?: string; role?: string }): Promise<void> {
    const flowRun = readFlowRun(ref);
    if (!flowRun || !hasAwaitingHumanNodes(flowRun)) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'The runtime is not currently waiting for human input.' });
      return;
    }

    if (!SettingsStore.hasUsableConfiguredModel()) {
      broadcastToFlow(ref, missingModelError(ref));
      return;
    }

    let targetNodeId: string;
    try {
      targetNodeId = resolveAwaitingHumanNode(flowRun, target);
      await SessionStore.updateFlowRun((latest) => {
        const awaitingState = latest.awaitingHumanNodes[targetNodeId];
        if (!awaitingState || !isAwaitingHumanReply(awaitingState.reason)) {
          throw new Error(`Node '${targetNodeId}' is no longer awaiting human input.`);
        }
        if (latest.pendingHumanInputs[targetNodeId]) {
          throw new Error(`Node '${targetNodeId}' already has queued human input.`);
        }
        latest.pendingHumanInputs[targetNodeId] = {
          text,
          receivedAt: new Date().toISOString(),
        };
      }, ref, workspaceRoot);
    } catch (error: any) {
      broadcastToFlow(ref, {
        type: 'error',
        flowRef: ref,
        message: error instanceof Error ? error.message : String(error)
      });
      return;
    }

    let session = activeSessions.get(flowKey(ref));
    if (!session || session.finished) {
      session = createSession(ref);
      startFlowRunner(session, flowRun.projectNamespace);
    }

    emitHistoricalMessage(session, {
      type: 'input_text',
      role: flowRun.awaitingHumanNodes[targetNodeId]?.role,
      text,
    });
    session.orchestrator.wake();
    emitFlowState(session);
  }

  function getOrCreateChoiceSession(ref: FlowRef): ActiveSession {
    const existing = activeSessions.get(flowKey(ref));
    if (existing && !existing.finished) {
      return existing;
    }
    return createSession(ref);
  }

  async function handleImprovementChoice(ref: FlowRef, mode: ProtocolImprovementChoiceMode): Promise<void> {
    const flowRun = readFlowRun(ref);
    if (!flowRun || flowRun.status !== 'awaiting_improvement_choice') {
      broadcastToFlow(ref, {
        type: 'error',
        flowRef: ref,
        message: 'The runtime is not currently waiting for an improvement mode selection.'
      });
      return;
    }

    const session = getOrCreateChoiceSession(ref);
    const label = mode === IMPROVEMENT_CHOICE_MODE.NONE
      ? 'No improvement'
      : mode === IMPROVEMENT_CHOICE_MODE.GRAPH_BASED
        ? 'Graph-based improvement'
        : 'Parallel improvement';
    emitHistoricalMessage(session, {
      type: 'input_text',
      text: label,
    });

    if (mode === IMPROVEMENT_CHOICE_MODE.NONE) {
      try {
        await ImprovementOrchestrator.skipImprovement(flowRun, session.outputBridge);
        session.sink.emit({ kind: 'flow.completed' });
      } catch (error: any) {
        emitHistoricalMessage(session, {
          type: 'error',
          message: error instanceof Error ? error.message : String(error)
        });
      }
      return;
    }

    if (!SettingsStore.hasUsableConfiguredModel()) {
      broadcastToFlow(ref, missingModelError(ref));
      return;
    }

    void attachSessionTask(session, async () => {
      const currentFlow = readFlowRun(ref);
      if (!currentFlow) {
        throw new Error('Flow state disappeared before the improvement phase began.');
      }

      await session.improvementOrchestrator.runImprovement(
        currentFlow,
        mode,
        session.outputBridge,
        session.sink,
        (roleName) => createRoleOutputStream(session, roleName, emitHistoricalMessage),
        session.consentGate,
      );

      const latestFlow = readFlowRun(ref);
      if (latestFlow?.status === 'completed') {
        session.sink.emit({ kind: 'flow.completed' });
      }
    }).catch(() => {});

    setImmediate(() => emitFlowState(session));
  }

  async function handleFeedbackConsentChoice(ref: FlowRef, decision: ProtocolFeedbackConsentDecision): Promise<void> {
    const flowRun = readFlowRun(ref);
    if (!flowRun || flowRun.status !== 'awaiting_feedback_consent') {
      broadcastToFlow(ref, {
        type: 'error',
        flowRef: ref,
        message: 'The runtime is not currently waiting for a feedback consent decision.'
      });
      return;
    }

    const session = getOrCreateChoiceSession(ref);
    const label = decision === FEEDBACK_CONSENT_DECISION.GRANTED ? 'Generate upstream feedback' : 'Skip upstream feedback';
    emitHistoricalMessage(session, {
      type: 'input_text',
      text: label,
    });

    if (decision === FEEDBACK_CONSENT_DECISION.DENIED) {
      try {
        await ImprovementOrchestrator.skipFeedback(flowRun, session.outputBridge);
        session.sink.emit({ kind: 'flow.completed' });
      } catch (error: any) {
        emitHistoricalMessage(session, {
          type: 'error',
          message: error instanceof Error ? error.message : String(error)
        });
      }
      return;
    }

    if (!SettingsStore.hasUsableConfiguredModel()) {
      broadcastToFlow(ref, missingModelError(ref));
      return;
    }

    void attachSessionTask(session, async () => {
      const currentFlow = readFlowRun(ref);
      if (!currentFlow) {
        throw new Error('Flow state disappeared before the feedback step began.');
      }

      await session.improvementOrchestrator.runFeedback(
        currentFlow,
        session.outputBridge,
        session.sink,
        (roleName) => createRoleOutputStream(session, roleName, emitHistoricalMessage),
        session.consentGate,
      );

      const latestFlow = readFlowRun(ref);
      if (latestFlow?.status === 'completed') {
        session.sink.emit({ kind: 'flow.completed' });
      }
    }).catch(() => {});

    setImmediate(() => emitFlowState(session));
  }

  function handleConsentResponse(ref: FlowRef, decision: ConsentResponseDecision, role: string): void {
    const session = activeSessions.get(flowKey(ref));
    if (!session || session.finished) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'No active session for consent response.' });
      return;
    }
    session.consentGate.respond(decision, role);
  }

  function handleConsentMode(ref: FlowRef, mode: ConsentMode): void {
    const session = activeSessions.get(flowKey(ref));
    if (session && !session.finished) {
      const inFlightRequests = session.consentGate.getInFlightRequests();
      session.consentGate.setMode(mode);
      if (mode === CONSENT_MODE.FULL_ACCESS) {
        for (const inFlight of inFlightRequests) {
          void consent.clearNodeAwaitingConsent(session, inFlight, CONSENT_RESPONSE_DECISION.ALLOW_FLOW);
        }
      }
      return;
    }
    consent.persistInactiveConsentMode(ref, mode);
  }

  function handleStopActiveTurn(ref: FlowRef, target?: { nodeId?: string; role?: string }): void {
    const activeSession = activeSessions.get(flowKey(ref));
    if (!activeSession || activeSession.finished) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'No active runtime session is currently running.' });
      return;
    }

    const stopped = activeSession.orchestrator.abortActiveTurn(target)
      || (!target?.nodeId && activeSession.improvementOrchestrator.abortActiveTurn(target?.role));
    if (!stopped) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'No active turn is currently stoppable.' });
    }
  }

  function resolveWorkflowRoleName(flowRun: FlowRun, role: string): string {
    const roleKey = role.trim();
    const workflow = resolveWorkflow(flowRun);
    const match = workflow?.nodes?.find((node: any) =>
      typeof node.role === 'string' &&
      parseRoleIdentity(node.role).instanceRoleId === roleKey
    );
    return typeof match?.role === 'string' ? match.role : role;
  }

  async function handleImprovementHumanInput(ref: FlowRef, role: string, text: string): Promise<void> {
    const flowRun = readFlowRun(ref);
    if (!flowRun?.improvementPhase) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'No active improvement phase for this flow.' });
      return;
    }

    const roleKey = parseRoleIdentity(role).instanceRoleId;
    const awaitingRoles = flowRun.improvementPhase.awaitingHumanRoles ?? {};
    if (!awaitingRoles[role]) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: `Role "${roleKey}" is not currently awaiting human input in the improvement phase.` });
      return;
    }

    try {
      await SessionStore.updateFlowRun((latest) => {
        if (!latest.improvementPhase) return;
        if (latest.improvementPhase.pendingHumanInputs?.[role]) {
          throw new Error(`Role "${roleKey}" already has queued human input.`);
        }
        if (!latest.improvementPhase.pendingHumanInputs) latest.improvementPhase.pendingHumanInputs = {};
        latest.improvementPhase.pendingHumanInputs[role] = { text, receivedAt: new Date().toISOString() };
      }, ref, workspaceRoot);
    } catch (error: any) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: error instanceof Error ? error.message : String(error) });
      return;
    }

    const session = activeSessions.get(flowKey(ref));
    if (session && !session.finished) {
      emitHistoricalMessage(session, { type: 'input_text', role, text });
      session.improvementOrchestrator.wake();
      emitFlowState(session);
    }
  }

  function handleCompactContext(ref: FlowRef, role: string): void {
    const flowRun = readFlowRun(ref);
    if (!flowRun) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: `Flow "${flowKey(ref)}" was not found.` });
      return;
    }

    const roleName = resolveWorkflowRoleName(flowRun, role);
    const roleKey = parseRoleIdentity(roleName).instanceRoleId;
    if (!SettingsStore.hasUsableConfiguredModel()) {
      broadcastToFlow(ref, {
        type: 'operator_event',
        flowRef: ref,
        event: {
          kind: 'session.compaction_failed',
          role: roleName,
          trigger: 'manual',
          reason: SettingsStore.MODEL_CONFIGURATION_REQUIRED_MESSAGE
        }
      });
      broadcastToFlow(ref, missingModelError(ref));
      return;
    }

    const activeSession = activeSessions.get(flowKey(ref));
    if (activeSession?.orchestrator.hasActiveTurn({ role: roleName })) {
      broadcastToFlow(ref, {
        type: 'operator_event',
        flowRef: ref,
        event: {
          kind: 'session.compaction_failed',
          role: roleName,
          trigger: 'manual',
          reason: 'Context cannot be compacted while that role is actively receiving a model response.'
        }
      });
      broadcastToFlow(ref, {
        type: 'error',
        flowRef: ref,
        message: 'Context cannot be compacted while that role is actively receiving a model response.'
      });
      return;
    }

    const createdForCompaction = !activeSession || activeSession.finished;
    const session = getOrCreateChoiceSession(ref);
    void session.orchestrator.compactRoleContext(flowRun, roleName, 'manual')
      .then((result) => {
        if (!result.compacted) {
          if (createdForCompaction) {
            session.finished = true;
          }
          broadcastToFlow(ref, {
            type: 'error',
            flowRef: ref,
            message: result.reason ?? 'No context was available to compact.'
          });
          return;
        }
        session.latestContextUsageByRole[roleKey] = 0;
        if (createdForCompaction) {
          session.finished = true;
        }
        emitFlowState(session);
      })
      .catch((error: any) => {
        if (createdForCompaction) {
          session.finished = true;
        }
        broadcastToFlow(ref, {
          type: 'error',
          flowRef: ref,
          message: error instanceof Error ? error.message : String(error)
        });
      });
  }

  return {
    handleHumanInput,
    handleImprovementChoice,
    handleFeedbackConsentChoice,
    handleImprovementHumanInput,
    handleConsentResponse,
    handleConsentMode,
    handleStopActiveTurn,
    handleCompactContext,
  };
}

export type RuntimeSessionCommands = ReturnType<typeof createRuntimeSessionCommands>;
