import type { WebSocket } from 'ws';
import { flowKey, flowRefFromRun } from '../../../shared/flow-ref.js';
import { IMPROVEMENT_CHOICE_MODE } from '../../../shared/protocol-constants.js';
import { defaultConsentState, normalizeConsentState } from '../../common/types.js';
import type {
  FeedItem,
  FlowRef,
  FlowRun,
} from '../../common/types.js';
import { getWorkspaceRoot } from '../../common/workspace.js';
import { ConsentGateImpl } from '../../improvement/consent-gate.js';
import { ImprovementOrchestrator } from '../../improvement/improvement.js';
import { FlowOrchestrator } from '../../orchestration/orchestrator.js';
import * as SessionStore from '../../orchestration/store.js';
import { bootstrapInitializationFlow } from '../../projects/initialization-bootstrap.js';
import { bootstrapUpdateFlow } from '../../projects/update-bootstrap.js';
import { initializeDraftFlow } from '../../projects/draft-flow.js';
import { buildSeededConsentState, loadProjectSettings } from '../../projects/project-settings-store.js';
import * as SettingsStore from '../../settings/settings-store.js';
import type { FlowScopedHistoricalMessage, HistoricalMessage, ServerMessage } from '../protocol.js';
import { createRuntimeSessionCommands } from './commands.js';
import { createRuntimeSessionConsent } from './consent.js';
import { createRuntimeSessionEvents } from './events.js';
import {
  createRoleOutputStream,
  loadLatestContextUsageByRole,
  recoverRoleFeedSequence,
  rememberMessage,
} from './feed.js';
import { buildFlowStateMessage } from './flow-state.js';
import { normalizeStaleConsentWaits } from './stale-consent.js';
import type { ActiveSession, RuntimeSessionManagerOptions } from './types.js';
import { WebSocketOperatorSink, type RuntimeServerMessage } from '../ws-operator-sink.js';

export function createRuntimeSessionManager(options: RuntimeSessionManagerOptions) {
  const { socketHub, flowReadModel } = options;
  const activeSessions = new Map<string, ActiveSession>();
  const readFlowRun = flowReadModel.readFlowRun;
  const resolveWorkflow = flowReadModel.resolveWorkflow;

  function sendToSocket(socket: WebSocket, message: ServerMessage): void {
    socketHub.send(socket, message);
  }

  function broadcastToFlow(ref: FlowRef, message: ServerMessage): void {
    socketHub.broadcastToFlow(ref, message);
  }

  function sendProjectFlows(socket: WebSocket, projectNamespace: string): void {
    sendToSocket(socket, {
      type: 'flow_summaries',
      projectNamespace,
      flows: SessionStore.listFlowSummaries(projectNamespace),
    });
  }

  function refreshProjectFlows(projectNamespace: string): void {
    socketHub.forEachClient((socket) => {
      sendProjectFlows(socket, projectNamespace);
    });
  }

  function missingModelError(ref: FlowRef): ServerMessage {
    return {
      type: 'error',
      flowRef: ref,
      message: SettingsStore.MODEL_CONFIGURATION_REQUIRED_MESSAGE
    };
  }

  function emitHistoricalMessage(session: ActiveSession, message: HistoricalMessage): void {
    rememberMessage(session, message);
    broadcastToFlow(session.flowRef, { ...message, flowRef: session.flowRef } as FlowScopedHistoricalMessage);
  }

  function emitTransientMessage(session: ActiveSession, message: RuntimeServerMessage): void {
    broadcastToFlow(session.flowRef, { ...message, flowRef: session.flowRef } as ServerMessage);
  }

  function readFlowStateMessage(session: ActiveSession | null, ref: FlowRef) {
    return buildFlowStateMessage(session, ref, readFlowRun);
  }

  function sendFlowState(socket: WebSocket, ref: FlowRef): void {
    const session = activeSessions.get(flowKey(ref)) ?? null;
    const message = readFlowStateMessage(session, ref);
    if (!message) return;
    if (session) {
      session.lastFlowState = message;
    }
    sendToSocket(socket, message);
  }

  function emitFlowState(session: ActiveSession): void {
    const message = readFlowStateMessage(session, session.flowRef);
    if (!message) return;
    session.lastFlowState = message;
    broadcastToFlow(session.flowRef, message);
  }

  const consent = createRuntimeSessionConsent({
    activeSessions,
    emitFlowState,
    readFlowStateMessage,
    broadcastToFlow,
  });

  const events = createRuntimeSessionEvents({
    readFlowRun,
    resolveWorkflow,
    emitTransientMessage,
    emitHistoricalMessage,
    emitFlowState,
    consent,
  });

  function createSession(flowRef: FlowRef): ActiveSession {
    // The WebSocket sink closes over the session before the session object is assembled.
    // eslint-disable-next-line prefer-const
    let session!: ActiveSession;

    const sink = new WebSocketOperatorSink((message) => events.handleRuntimeMessage(session, message));
    const orchestrator = new FlowOrchestrator(sink);
    const improvementOrchestrator = new ImprovementOrchestrator();
    const initialConsentState = normalizeConsentState(readFlowRun(flowRef)?.consentState ?? defaultConsentState());
    const consentGate = new ConsentGateImpl(initialConsentState, sink);

    const roleFeedHistory = SessionStore.loadAllRoleFeeds(flowRef);
    const roleFeedSequence = recoverRoleFeedSequence(roleFeedHistory);
    const latestContextUsageByRole = loadLatestContextUsageByRole(flowRef, roleFeedHistory);

    session = {
      flowRef,
      projectNamespace: flowRef.projectNamespace,
      sink,
      orchestrator,
      improvementOrchestrator,
      consentGate,
      roleFeedHistory,
      roleFeedSequence,
      lastFlowState: null,
      backwardActive: new Set<string>(),
      finished: false,
      task: Promise.resolve(),
      latestContextUsageByRole,
      mcpManagers: new Map(),
      manualCompactionControllers: new Map<string, AbortController>(),
      manualCompactionSigintHandler: null,
    };

    activeSessions.set(flowKey(flowRef), session);
    return session;
  }

  function startFlowRunner(session: ActiveSession, projectNamespace: string): void {
    void attachSessionTask(session, async () => {
      await session.orchestrator.runStoredFlow(
        projectNamespace,
        session.flowRef.flowId,
        (role) => createRoleOutputStream(session, role, emitHistoricalMessage),
        session.consentGate,
        session.mcpManagers
      );
      await autoAdvanceProjectGates(session);
    }).catch(() => {});
  }

  /**
   * Auto-apply project-level improvement and feedback defaults so the end-of-flow
   * gates skip their modals. No-op when project settings are disabled or the
   * relevant default is unset. Graph/parallel improvement and feedback generation
   * require a usable model; when none is configured this returns early and the
   * existing manual modal takes over.
   */
  async function autoAdvanceProjectGates(session: ActiveSession): Promise<void> {
    const ref = session.flowRef;
    const settings = loadProjectSettings(session.projectNamespace);
    if (!settings.enabled) return;

    const improvementFlow = readFlowRun(ref);
    if (improvementFlow?.status === 'awaiting_improvement_choice' && settings.improvement) {
      const mode = settings.improvement;
      if (mode === IMPROVEMENT_CHOICE_MODE.NONE) {
        emitHistoricalMessage(session, { type: 'input_text', text: 'No improvement' });
        await ImprovementOrchestrator.skipImprovement(improvementFlow);
        session.sink.emit({ kind: 'flow.completed' });
      } else if (SettingsStore.hasUsableConfiguredModel()) {
        emitHistoricalMessage(session, {
          type: 'input_text',
          text: mode === IMPROVEMENT_CHOICE_MODE.GRAPH_BASED ? 'Graph-based improvement' : 'Parallel improvement',
        });
        await session.improvementOrchestrator.runImprovement(
          improvementFlow,
          mode,
          session.sink,
          (role) => createRoleOutputStream(session, role, emitHistoricalMessage),
          session.consentGate,
          session.mcpManagers,
        );
      } else {
        return;
      }
    }

    const feedbackFlow = readFlowRun(ref);
    if (feedbackFlow?.status === 'awaiting_feedback_consent' && settings.feedback !== undefined) {
      if (settings.feedback === false) {
        emitHistoricalMessage(session, { type: 'input_text', text: 'Skip upstream feedback' });
        await ImprovementOrchestrator.skipFeedback(feedbackFlow);
        session.sink.emit({ kind: 'flow.completed' });
      } else if (SettingsStore.hasUsableConfiguredModel()) {
        emitHistoricalMessage(session, { type: 'input_text', text: 'Generate upstream feedback' });
        await session.improvementOrchestrator.runFeedback(
          feedbackFlow,
          session.sink,
          (role) => createRoleOutputStream(session, role, emitHistoricalMessage),
          session.consentGate,
          session.mcpManagers,
        );
      }
    }
  }

  async function closeSessionMcpManagers(session: ActiveSession): Promise<void> {
    const managers = Array.from(session.mcpManagers.values());
    session.mcpManagers.clear();
    await Promise.allSettled(managers.map((manager) => manager.close()));
  }

  function attachSessionTask(session: ActiveSession, taskFactory: () => Promise<void>): Promise<void> {
    session.task = taskFactory()
      .catch((error: any) => {
        session.finished = true;
        emitHistoricalMessage(session, {
          type: 'error',
          message: error instanceof Error ? error.message : String(error)
        });
        throw error;
      })
      .finally(async () => {
        const currentFlow = readFlowRun(session.flowRef);
        if (currentFlow?.status === 'completed') {
          session.finished = true;
        }
        if (session.finished) {
          await closeSessionMcpManagers(session);
        }
        emitFlowState(session);
      });

    return session.task;
  }

  function subscribeSocket(socket: WebSocket, ref: FlowRef): void {
    socketHub.subscribe(socket, ref);
  }

  function replaySessionState(socket: WebSocket, ref: FlowRef): void {
    const session = activeSessions.get(flowKey(ref));
    const feedHistory = session?.roleFeedHistory ?? SessionStore.loadAllRoleFeeds(ref);

    const roleFeeds: Record<string, FeedItem[]> = {};
    for (const [roleKey, items] of feedHistory) {
      roleFeeds[roleKey] = items;
    }
    sendToSocket(socket, { type: 'feed_replay', flowRef: ref, roleFeeds });

    if (session?.lastFlowState) {
      sendToSocket(socket, session.lastFlowState);
    } else {
      sendFlowState(socket, ref);
    }

    const inFlightRequests = session?.consentGate?.getInFlightRequests() ?? [];
    for (const inFlight of inFlightRequests) {
      sendToSocket(socket, {
        type: 'operator_event',
        flowRef: ref,
        event: { kind: 'consent.requested', request: inFlight }
      } as any);
    }
  }

  function openFlow(socket: WebSocket, ref: FlowRef): void {
    let flowRun: FlowRun | null;
    try {
      flowRun = readFlowRun(ref);
    } catch (error: any) {
      sendToSocket(socket, {
        type: 'error',
        flowRef: ref,
        message: error instanceof Error ? error.message : String(error)
      });
      return;
    }

    if (!flowRun) {
      sendToSocket(socket, { type: 'error', flowRef: ref, message: `Flow "${flowKey(ref)}" was not found.` });
      return;
    }

    subscribeSocket(socket, ref);
    replaySessionState(socket, ref);
  }

  function startFreshFlow(socket: WebSocket, projectNamespace: string): void {
    if (!SettingsStore.hasUsableConfiguredModel()) {
      sendToSocket(socket, missingModelError({ projectNamespace, flowId: '__new__' }));
      return;
    }

    const flowRun = initializeDraftFlow(projectNamespace, 'owner');
    const seededConsent = buildSeededConsentState(projectNamespace);
    if (seededConsent) flowRun.consentState = seededConsent;
    const flowRef = flowRefFromRun(flowRun);
    SessionStore.saveFlowRun(flowRun, flowRef);

    subscribeSocket(socket, flowRef);
    sendProjectFlows(socket, projectNamespace);

    const session = createSession(flowRef);
    emitFlowState(session);
    startFlowRunner(session, projectNamespace);
  }

  function startInitializationFlow(socket: WebSocket, projectNamespace: string, mode: 'takeover' | 'greenfield'): void {
    if (!SettingsStore.hasUsableConfiguredModel()) {
      sendToSocket(socket, missingModelError({ projectNamespace, flowId: '__new__' }));
      return;
    }

    const { flowRun } = bootstrapInitializationFlow(getWorkspaceRoot(), projectNamespace, mode);
    const seededConsent = buildSeededConsentState(flowRun.projectNamespace);
    if (seededConsent) flowRun.consentState = seededConsent;
    const flowRef = flowRefFromRun(flowRun);
    SessionStore.saveFlowRun(flowRun, flowRef);

    subscribeSocket(socket, flowRef);
    sendProjectFlows(socket, projectNamespace);

    const session = createSession(flowRef);
    emitFlowState(session);
    startFlowRunner(session, flowRun.projectNamespace);
  }

  function startUpdateFlow(socket: WebSocket, projectNamespace: string): void {
    if (!SettingsStore.hasUsableConfiguredModel()) {
      sendToSocket(socket, missingModelError({ projectNamespace, flowId: '__new__' }));
      return;
    }

    const { flowRun } = bootstrapUpdateFlow(projectNamespace);
    const seededConsent = buildSeededConsentState(flowRun.projectNamespace);
    if (seededConsent) flowRun.consentState = seededConsent;
    const flowRef = flowRefFromRun(flowRun);
    SessionStore.saveFlowRun(flowRun, flowRef);

    subscribeSocket(socket, flowRef);
    sendProjectFlows(socket, projectNamespace);

    const session = createSession(flowRef);
    emitFlowState(session);
    startFlowRunner(session, flowRun.projectNamespace);
  }

  async function resumeFlow(socket: WebSocket, ref: FlowRef): Promise<void> {
    let flowRun = readFlowRun(ref);
    if (!flowRun) {
      sendToSocket(socket, { type: 'error', flowRef: ref, message: `Flow "${flowKey(ref)}" was not found.` });
      return;
    }

    subscribeSocket(socket, ref);

    const existing = activeSessions.get(flowKey(ref));
    if (existing && !existing.finished) {
      replaySessionState(socket, ref);
      return;
    }

    if (flowRun.status !== 'running') {
      // A flow parked at an end-of-flow gate auto-advances on resume when the
      // project preconfigures that decision; otherwise the operator's modal shows.
      // autoAdvanceProjectGates itself no-ops when the default is unset and falls
      // back to the modal when a model is required but none is usable.
      if (
        (flowRun.status === 'awaiting_improvement_choice' || flowRun.status === 'awaiting_feedback_consent') &&
        loadProjectSettings(ref.projectNamespace).enabled
      ) {
        const gateSession = createSession(ref);
        sendFlowState(socket, ref);
        void attachSessionTask(gateSession, () => autoAdvanceProjectGates(gateSession)).catch(() => {});
        return;
      }
      sendFlowState(socket, ref);
      return;
    }

    if (!SettingsStore.hasUsableConfiguredModel()) {
      sendToSocket(socket, missingModelError(ref));
      return;
    }

    const normalizedFlowRun = await normalizeStaleConsentWaits(ref, readFlowRun);
    if (normalizedFlowRun) {
      flowRun = normalizedFlowRun;
    }

    const session = createSession(ref);
    sendFlowState(socket, ref);

    if (flowRun.improvementPhase?.status === 'running') {
      void attachSessionTask(session, async () => {
        const latest = readFlowRun(ref);
        if (!latest) throw new Error('[improvement] Flow state disappeared before improvement could be resumed.');
        await session.improvementOrchestrator.resumeImprovement(
          latest,
          session.sink,
          (role) => createRoleOutputStream(session, role, emitHistoricalMessage),
          session.consentGate,
          session.mcpManagers,
        );
        await autoAdvanceProjectGates(session);
        if (readFlowRun(ref)?.status === 'completed') {
          session.sink.emit({ kind: 'flow.completed' });
        }
      }).catch(() => {});
    } else {
      startFlowRunner(session, flowRun.projectNamespace);
    }
  }

  const commands = createRuntimeSessionCommands({
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
  });

  return {
    sendToSocket,
    refreshProjectFlows,
    openFlow,
    startFreshFlow,
    startInitializationFlow,
    startUpdateFlow,
    resumeFlow,
    handleHumanInput: commands.handleHumanInput,
    handleHandoffApproval: commands.handleHandoffApproval,
    handleRoleConfiguration: commands.handleRoleConfiguration,
    handleImprovementChoice: commands.handleImprovementChoice,
    handleFeedbackConsentChoice: commands.handleFeedbackConsentChoice,
    handleImprovementHumanInput: commands.handleImprovementHumanInput,
    handleConsentResponse: commands.handleConsentResponse,
    handleConsentMode: commands.handleConsentMode,
    handleStopActiveTurn: commands.handleStopActiveTurn,
    handleCompactContext: commands.handleCompactContext,
  };
}

export type RuntimeSessionManager = ReturnType<typeof createRuntimeSessionManager>;
