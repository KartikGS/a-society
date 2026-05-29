import type { WebSocket } from 'ws';
import { flowKey, flowRefFromRun } from '../../common/flow-ref.js';
import { defaultConsentState, normalizeConsentState } from '../../common/types.js';
import type {
  FeedItem,
  FlowRef,
  FlowRun,
} from '../../common/types.js';
import { ConsentGateImpl } from '../../improvement/consent-gate.js';
import { ImprovementOrchestrator } from '../../improvement/improvement.js';
import { FlowOrchestrator } from '../../orchestration/orchestrator.js';
import { SessionStore } from '../../orchestration/store.js';
import { bootstrapInitializationFlow } from '../../projects/initialization-bootstrap.js';
import { initializeDraftFlow } from '../../projects/draft-flow.js';
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
  const { workspaceRoot, socketHub, flowReadModel } = options;
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
      flows: SessionStore.listFlowSummaries(workspaceRoot, projectNamespace),
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
    rememberMessage(session, message, workspaceRoot);
    broadcastToFlow(session.flowRef, { ...message, flowRef: session.flowRef } as FlowScopedHistoricalMessage);
  }

  function emitTransientMessage(session: ActiveSession, message: RuntimeServerMessage): void {
    broadcastToFlow(session.flowRef, { ...message, flowRef: session.flowRef } as ServerMessage);
  }

  function readFlowStateMessage(session: ActiveSession | null, ref: FlowRef) {
    return buildFlowStateMessage(session, ref, readFlowRun, workspaceRoot);
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
    workspaceRoot,
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

    const roleFeedHistory = SessionStore.loadAllRoleFeeds(flowRef, workspaceRoot);
    const roleFeedSequence = recoverRoleFeedSequence(roleFeedHistory);
    const latestContextUsageByRole = loadLatestContextUsageByRole(flowRef, roleFeedHistory, workspaceRoot);

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
    };

    activeSessions.set(flowKey(flowRef), session);
    return session;
  }

  function startFlowRunner(session: ActiveSession, projectNamespace: string): void {
    void attachSessionTask(session, () =>
      session.orchestrator.runStoredFlow(
        workspaceRoot,
        projectNamespace,
        session.flowRef.flowId,
        (role) => createRoleOutputStream(session, role, emitHistoricalMessage),
        session.consentGate
      )
    ).catch(() => {});
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
      .finally(() => {
        const currentFlow = readFlowRun(session.flowRef);
        if (currentFlow?.status === 'completed') {
          session.finished = true;
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
    const feedHistory = session?.roleFeedHistory ?? SessionStore.loadAllRoleFeeds(ref, workspaceRoot);

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

    const flowRun = initializeDraftFlow(workspaceRoot, projectNamespace, 'owner');
    const flowRef = flowRefFromRun(flowRun);
    SessionStore.saveFlowRun(flowRun, flowRef, workspaceRoot);

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

    const { flowRun } = bootstrapInitializationFlow(workspaceRoot, projectNamespace, mode);
    const flowRef = flowRefFromRun(flowRun);
    SessionStore.saveFlowRun(flowRun, flowRef, workspaceRoot);

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
      sendFlowState(socket, ref);
      return;
    }

    if (!SettingsStore.hasUsableConfiguredModel()) {
      sendToSocket(socket, missingModelError(ref));
      return;
    }

    const normalizedFlowRun = await normalizeStaleConsentWaits(ref, readFlowRun, workspaceRoot);
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
        );
        if (readFlowRun(ref)?.status === 'completed') {
          session.sink.emit({ kind: 'flow.completed' });
        }
      }).catch(() => {});
    } else {
      startFlowRunner(session, flowRun.projectNamespace);
    }
  }

  const commands = createRuntimeSessionCommands({
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
  });

  return {
    sendToSocket,
    refreshProjectFlows,
    openFlow,
    startFreshFlow,
    startInitializationFlow,
    resumeFlow,
    handleHumanInput: commands.handleHumanInput,
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
