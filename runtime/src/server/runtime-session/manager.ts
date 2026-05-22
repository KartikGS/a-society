import { PassThrough } from 'node:stream';
import type { WebSocket } from 'ws';
import { flowKey, flowRefFromRun } from '../../common/flow-ref.js';
import { parseRoleIdentity } from '../../common/role-id.js';
import { defaultConsentState, normalizeConsentState } from '../../common/types.js';
import type {
  ConsentRequest,
  ConsentResponseDecision,
  FeedItem,
  FlowRef,
  FlowRun,
  OperatorEvent,
} from '../../common/types.js';
import { ConsentGateImpl } from '../../improvement/consent-gate.js';
import { FlowOrchestrator } from '../../orchestration/orchestrator.js';
import { SessionStore } from '../../orchestration/store.js';
import { bootstrapInitializationFlow } from '../../projects/initialization-bootstrap.js';
import { initializeDraftFlow } from '../../projects/draft-flow.js';
import * as SettingsStore from '../../settings/settings-store.js';
import type { FlowScopedHistoricalMessage, HistoricalMessage, ServerMessage } from '../protocol.js';
import { isTransientOperatorEvent } from '../role-feed.js';
import { createRuntimeSessionCommands } from './commands.js';
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

  async function markNodeAwaitingConsent(session: ActiveSession, request: ConsentRequest): Promise<void> {
    await SessionStore.updateFlowRun((flow) => {
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
      if (flow.awaitingHumanNodes[request.nodeId]?.reason !== 'consent') return;

      if (decision === 'deny') {
        flow.awaitingHumanNodes[request.nodeId] = { role: request.role, reason: 'consent-denied' };
        flow.runningNodes = flow.runningNodes.filter((id) => id !== request.nodeId);
        flow.status = 'running';
        return;
      }

      delete flow.awaitingHumanNodes[request.nodeId];
      if (
        !flow.completedNodes.includes(request.nodeId) &&
        !flow.runningNodes.includes(request.nodeId)
      ) {
        flow.runningNodes.push(request.nodeId);
      }
      flow.status = 'running';
    }, session.flowRef, workspaceRoot);
    emitFlowState(session);
  }

  function updateBackwardTracking(session: ActiveSession, event: OperatorEvent): void {
    if (event.kind !== 'handoff.applied') return;

    const flowRun = readFlowRun(session.flowRef);
    const workflow = resolveWorkflow(flowRun);
    if (!workflow) return;

    for (const target of event.targets) {
      const isBackwardTarget = (workflow.edges ?? []).some(
        (edge: any) => edge.from === target.nodeId && edge.to === event.fromNodeId
      );
      if (isBackwardTarget) {
        session.backwardActive.add(target.nodeId);
      }
    }
  }

  function handleRuntimeMessage(session: ActiveSession, message: RuntimeServerMessage): void {
    switch (message.type) {
      case 'request_sent':
        emitTransientMessage(session, message);
        return;
      case 'receiving_response':
        emitTransientMessage(session, message);
        return;
      case 'response_end':
        emitTransientMessage(session, message);
        return;
      case 'error':
        emitTransientMessage(session, message);
        return;
      case 'operator_event':
        if (message.event.kind === 'consent.requested') {
          void markNodeAwaitingConsent(session, message.event.request)
            .finally(() => emitTransientMessage(session, message));
          return;
        }

        if (message.event.kind === 'consent.resolved') {
          void clearNodeAwaitingConsent(session, message.event.request, message.event.decision)
            .finally(() => emitTransientMessage(session, message));
          return;
        }

        if (message.event.kind === 'consent.mode_changed') {
          void SessionStore.updateFlowRun((flow) => {
            flow.consentState = session.consentGate.getState();
          }, session.flowRef, workspaceRoot).then(() => emitFlowState(session));
          return;
        }

        if (message.event.kind === 'usage.turn_summary') {
          const { role, contextUsage } = message.event;
          if (role && contextUsage != null) {
            const roleKey = parseRoleIdentity(role).instanceRoleId;
            session.latestContextUsageByRole[roleKey] = contextUsage;
          }
          emitTransientMessage(session, message);
          return;
        }

        if (message.event.kind === 'session.compacted') {
          const roleKey = parseRoleIdentity(message.event.role).instanceRoleId;
          session.latestContextUsageByRole[roleKey] = 0;
        }

        if (isTransientOperatorEvent(message.event)) {
          return;
        }

        updateBackwardTracking(session, message.event);
        emitHistoricalMessage(session, message);

        if (
          message.event.kind === 'handoff.applied' ||
          message.event.kind === 'flow.completed' ||
          message.event.kind === 'role.active'
        ) {
          setImmediate(() => emitFlowState(session));
        }

        if (message.event.kind === 'flow.completed') {
          session.finished = true;
        }
        return;
    }
  }

  function createSession(flowRef: FlowRef): ActiveSession {
    // The WebSocket sink closes over the session before the session object is assembled.
    // eslint-disable-next-line prefer-const
    let session!: ActiveSession;

    const inputBridge = new PassThrough();
    const outputBridge = new PassThrough();
    outputBridge.setEncoding('utf8');

    const sink = new WebSocketOperatorSink((message) => handleRuntimeMessage(session, message));
    const orchestrator = new FlowOrchestrator(sink);
    const initialConsentState = normalizeConsentState(readFlowRun(flowRef)?.consentState ?? defaultConsentState());
    const consentGate = new ConsentGateImpl(initialConsentState, sink);

    const roleFeedHistory = SessionStore.loadAllRoleFeeds(flowRef, workspaceRoot);
    const roleFeedSequence = recoverRoleFeedSequence(roleFeedHistory);
    const latestContextUsageByRole = loadLatestContextUsageByRole(flowRef, roleFeedHistory, workspaceRoot);

    session = {
      flowRef,
      projectNamespace: flowRef.projectNamespace,
      inputBridge,
      outputBridge,
      sink,
      orchestrator,
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
        session.outputBridge,
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

    const flowRun = initializeDraftFlow(workspaceRoot, projectNamespace, 'Owner');
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
    startFlowRunner(session, flowRun.projectNamespace);
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
    clearNodeAwaitingConsent,
    readFlowStateMessage,
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
    handleConsentResponse: commands.handleConsentResponse,
    handleConsentMode: commands.handleConsentMode,
    handleStopActiveTurn: commands.handleStopActiveTurn,
    handleCompactContext: commands.handleCompactContext,
  };
}

export type RuntimeSessionManager = ReturnType<typeof createRuntimeSessionManager>;
