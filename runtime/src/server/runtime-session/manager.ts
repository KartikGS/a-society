import { PassThrough } from 'node:stream';
import type { WebSocket } from 'ws';
import { flowKey, flowRefFromRun } from '../../common/flow-ref.js';
import { parseRoleIdentity } from '../../common/role-id.js';
import { defaultConsentState, normalizeConsentState } from '../../common/types.js';
import type {
  ConsentMode,
  ConsentRequest,
  ConsentResponseDecision,
  FeedItem,
  FlowRef,
  FlowRun,
  OperatorEvent,
} from '../../common/types.js';
import { ConsentGateImpl } from '../../improvement/consent-gate.js';
import { ImprovementOrchestrator, type ImprovementMode } from '../../improvement/improvement.js';
import { FlowOrchestrator } from '../../orchestration/orchestrator.js';
import { SessionStore } from '../../orchestration/store.js';
import { bootstrapInitializationFlow } from '../../projects/initialization-bootstrap.js';
import { initializeDraftFlow } from '../../projects/draft-flow.js';
import * as SettingsStore from '../../settings/settings-store.js';
import type { FlowScopedHistoricalMessage, HistoricalMessage, ServerMessage } from '../protocol.js';
import { isTransientOperatorEvent } from '../role-feed.js';
import {
  createRoleOutputStream,
  loadLatestContextUsageByRole,
  recoverRoleFeedSequence,
  rememberMessage,
} from './feed.js';
import { buildFlowStateMessage } from './flow-state.js';
import {
  hasAwaitingHumanNodes,
  isAwaitingHumanReply,
  resolveAwaitingHumanNode,
} from './human-input.js';
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

  function handleImprovementChoice(ref: FlowRef, mode: ImprovementMode | 'none'): void {
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
    const label = mode === 'none' ? 'No improvement' : mode === 'graph-based' ? 'Graph-based improvement' : 'Parallel improvement';
    emitHistoricalMessage(session, {
      type: 'input_text',
      text: label,
    });

    if (mode === 'none') {
      try {
        ImprovementOrchestrator.skipImprovement(flowRun, session.outputBridge);
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

      await ImprovementOrchestrator.runImprovement(
        currentFlow,
        mode,
        session.outputBridge,
        session.sink,
        (roleName) => createRoleOutputStream(session, roleName, emitHistoricalMessage)
      );

      const latestFlow = readFlowRun(ref);
      if (latestFlow?.status === 'completed') {
        session.sink.emit({ kind: 'flow.completed' });
      }
    }).catch(() => {});

    setImmediate(() => emitFlowState(session));
  }

  function handleFeedbackConsentChoice(ref: FlowRef, decision: 'granted' | 'denied'): void {
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
    const label = decision === 'granted' ? 'Generate upstream feedback' : 'Skip upstream feedback';
    emitHistoricalMessage(session, {
      type: 'input_text',
      text: label,
    });

    if (decision === 'denied') {
      try {
        ImprovementOrchestrator.skipFeedback(flowRun, session.outputBridge);
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

      await ImprovementOrchestrator.runFeedback(
        currentFlow,
        session.outputBridge,
        session.sink,
        (roleName) => createRoleOutputStream(session, roleName, emitHistoricalMessage)
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
      if (mode === 'full-access') {
        for (const inFlight of inFlightRequests) {
          void clearNodeAwaitingConsent(session, inFlight, 'allow_flow');
        }
      }
      return;
    }
    // No active session -- persist mode change directly to the flow state.
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

  function handleStopActiveTurn(ref: FlowRef, target?: { nodeId?: string; role?: string }): void {
    const activeSession = activeSessions.get(flowKey(ref));
    if (!activeSession || activeSession.finished) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'No active runtime session is currently running.' });
      return;
    }

    const stopped = activeSession.orchestrator.abortActiveTurn(target);
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
    sendToSocket,
    refreshProjectFlows,
    openFlow,
    startFreshFlow,
    startInitializationFlow,
    resumeFlow,
    handleHumanInput,
    handleImprovementChoice,
    handleFeedbackConsentChoice,
    handleConsentResponse,
    handleConsentMode,
    handleStopActiveTurn,
    handleCompactContext,
  };
}

export type RuntimeSessionManager = ReturnType<typeof createRuntimeSessionManager>;
