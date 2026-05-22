import { PassThrough, Writable } from 'node:stream';
import type { WebSocket } from 'ws';
import { flowKey, flowRefFromRun } from '../common/flow-ref.js';
import { getActiveNodeIds } from '../common/flow-state.js';
import { parseRoleIdentity } from '../common/role-id.js';
import { defaultConsentState, normalizeConsentState } from '../common/types.js';
import type {
  ConsentMode,
  ConsentRequest,
  ConsentResponseDecision,
  FeedItem,
  FlowRef,
  FlowRun,
  OperatorEvent,
  RoleSession,
  RuntimeMessageParam,
} from '../common/types.js';
import { ConsentGateImpl } from '../improvement/consent-gate.js';
import { ImprovementOrchestrator, type ImprovementMode } from '../improvement/improvement.js';
import { FlowOrchestrator } from '../orchestration/orchestrator.js';
import { SessionStore } from '../orchestration/store.js';
import { bootstrapInitializationFlow } from '../projects/initialization-bootstrap.js';
import { initializeDraftFlow } from '../projects/draft-flow.js';
import * as SettingsStore from '../settings/settings-store.js';
import type { FlowReadModel } from './flow-read-model.js';
import { getOperatorFeedRoleKey, isTransientOperatorEvent, projectMessageToFeedItem } from './role-feed.js';
import type { FlowScopedHistoricalMessage, FlowStateMessage, HistoricalMessage, ServerMessage } from './protocol.js';
import type { SocketHub } from './socket-hub.js';
import { WebSocketOperatorSink, type RuntimeServerMessage } from './ws-operator-sink.js';

interface ActiveSession {
  flowRef: FlowRef;
  projectNamespace: string;
  inputBridge: PassThrough;
  outputBridge: PassThrough;
  sink: WebSocketOperatorSink;
  orchestrator: FlowOrchestrator;
  roleFeedHistory: Map<string, FeedItem[]>;
  roleFeedSequence: Map<string, number>;
  lastFlowState: FlowStateMessage | null;
  backwardActive: Set<string>;
  finished: boolean;
  task: Promise<void>;
  consentGate: ConsentGateImpl;
  latestContextUsageByRole: Record<string, number>;
}

type RuntimeSessionManagerOptions = {
  workspaceRoot: string;
  socketHub: SocketHub;
  flowReadModel: FlowReadModel;
};

const HISTORY_LIMIT = 400;
const STALE_CONSENT_TOOL_RESULT =
  'Consent prompt was no longer available after runtime resume. The node is paused for operator guidance.';

function isPromptLine(text: string): boolean {
  return text === '\n> ' || text === '> ' || text === '\r\n> ';
}

function recoverRoleFeedSequence(roleFeedHistory: Map<string, FeedItem[]>): Map<string, number> {
  const sequence = new Map<string, number>();
  for (const [roleKey, items] of roleFeedHistory) {
    const prefix = `${roleKey}_`;
    let max = -1;
    for (const item of items) {
      if (!item.id.startsWith(prefix)) continue;
      const seq = parseInt(item.id.slice(prefix.length), 10);
      if (Number.isFinite(seq) && seq > max) max = seq;
    }
    sequence.set(roleKey, max + 1);
  }
  return sequence;
}

function latestContextUsageFromSession(session: RoleSession | null): number | null {
  return session?.latestContextUsage ?? null;
}

function isAwaitingHumanReply(reason: FlowRun['awaitingHumanNodes'][string]['reason']): boolean {
  return reason !== 'consent';
}

function hasAwaitingHumanNodes(flowRun: FlowRun): boolean {
  return Object.values(flowRun.awaitingHumanNodes).some((state) => isAwaitingHumanReply(state.reason));
}

function resolveAwaitingHumanNode(flowRun: FlowRun, target?: { nodeId?: string; role?: string }): string {
  const awaitingNodeIds = Object.keys(flowRun.awaitingHumanNodes)
    .filter((nodeId) => isAwaitingHumanReply(flowRun.awaitingHumanNodes[nodeId].reason));
  if (target?.nodeId) {
    const awaitingState = flowRun.awaitingHumanNodes[target.nodeId];
    if (!awaitingState) {
      throw new Error(`Node '${target.nodeId}' is not awaiting human input.`);
    }
    if (!isAwaitingHumanReply(awaitingState.reason)) {
      throw new Error(`Node '${target.nodeId}' is awaiting consent, not a text reply.`);
    }
    return target.nodeId;
  }

  if (target?.role) {
    const roleKey = parseRoleIdentity(target.role).instanceRoleId;
    const matches = awaitingNodeIds.filter((nodeId) =>
      parseRoleIdentity(flowRun.awaitingHumanNodes[nodeId].role).instanceRoleId === roleKey
    );
    if (matches.length === 1) return matches[0];
    if (matches.length === 0) {
      throw new Error(`Role '${target.role}' is not awaiting human input.`);
    }
    throw new Error(`Role '${target.role}' has multiple awaiting nodes. Specify nodeId.`);
  }

  if (awaitingNodeIds.length === 1) {
    return awaitingNodeIds[0];
  }

  throw new Error('Multiple nodes are awaiting human input. Specify nodeId or role.');
}

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

  function nextFeedItemId(session: ActiveSession, roleKey: string): string {
    const seq = session.roleFeedSequence.get(roleKey) ?? 0;
    session.roleFeedSequence.set(roleKey, seq + 1);
    return `${roleKey}_${seq}`;
  }

  function rememberMessage(session: ActiveSession, message: HistoricalMessage): void {
    const roleKey = getOperatorFeedRoleKey(message);
    if (!roleKey) return;
    const history = session.roleFeedHistory.get(roleKey) ?? [];

    if (message.type === 'operator_event' && message.event.kind === 'activity.tool_result') {
      const { toolName, isError } = message.event;
      const idx = [...history].reverse().findIndex(item => item.type === 'tool' && item.text.startsWith(toolName));
      if (idx !== -1) {
        const realIdx = history.length - 1 - idx;
        history[realIdx] = { ...history[realIdx], type: isError ? 'tool-error' : 'tool-success' };
        session.roleFeedHistory.set(roleKey, history);
        SessionStore.saveRoleFeed(history, session.flowRef, roleKey, workspaceRoot);
      }
      return;
    }

    const previous = history[history.length - 1];
    if (previous?.type === 'assistant' && message.type === 'output_text') {
      history[history.length - 1] = { ...previous, text: previous.text + message.text };
      session.roleFeedHistory.set(roleKey, history);
      SessionStore.saveRoleFeed(history, session.flowRef, roleKey, workspaceRoot);
      return;
    }

    const id = nextFeedItemId(session, roleKey);
    const item = projectMessageToFeedItem(message, id);
    if (!item) return;

    history.push(item);
    if (history.length > HISTORY_LIMIT) {
      history.splice(0, history.length - HISTORY_LIMIT);
    }
    session.roleFeedHistory.set(roleKey, history);
    SessionStore.saveRoleFeed(history, session.flowRef, roleKey, workspaceRoot);
  }

  function emitHistoricalMessage(session: ActiveSession, message: HistoricalMessage): void {
    rememberMessage(session, message);
    broadcastToFlow(session.flowRef, { ...message, flowRef: session.flowRef } as FlowScopedHistoricalMessage);
  }

  function emitTransientMessage(session: ActiveSession, message: RuntimeServerMessage): void {
    broadcastToFlow(session.flowRef, { ...message, flowRef: session.flowRef } as ServerMessage);
  }

  function buildFlowStateMessage(session: ActiveSession | null, ref: FlowRef): FlowStateMessage | null {
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
              const s = SessionStore.loadRoleSession(roleKey, ref, workspaceRoot);
              const contextUsage = latestContextUsageFromSession(s);
              return contextUsage != null ? [roleKey, contextUsage] as const : null;
            })
            .filter((e): e is [string, number] => e !== null)
        );
    return {
      type: 'flow_state',
      flowRef: ref,
      flowRun,
      backwardActive,
      hasActiveSession: session !== null && !session.finished,
      contextUsageByRole,
    };
  }

  function sendFlowState(socket: WebSocket, ref: FlowRef): void {
    const session = activeSessions.get(flowKey(ref)) ?? null;
    const message = buildFlowStateMessage(session, ref);
    if (!message) return;
    if (session) {
      session.lastFlowState = message;
    }
    sendToSocket(socket, message);
  }

  function emitFlowState(session: ActiveSession): void {
    const message = buildFlowStateMessage(session, session.flowRef);
    if (!message) return;
    session.lastFlowState = message;
    broadcastToFlow(session.flowRef, message);
  }

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

  async function normalizeStaleConsentWaits(ref: FlowRef): Promise<FlowRun | null> {
    const flowRun = readFlowRun(ref);
    if (!flowRun) return null;

    const staleConsentNodes = Object.entries(flowRun.awaitingHumanNodes)
      .filter(([, state]) => state.reason === 'consent');
    if (staleConsentNodes.length === 0) return flowRun;

    for (const [nodeId, state] of staleConsentNodes) {
      repairStaleConsentTranscript(ref, nodeId, state.role);
    }

    return SessionStore.updateFlowRun((flow) => {
      for (const [nodeId, state] of Object.entries(flow.awaitingHumanNodes)) {
        if (state.reason === 'consent') {
          flow.awaitingHumanNodes[nodeId] = { role: state.role, reason: 'consent-denied' };
        }
      }
    }, ref, workspaceRoot);
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
    const latestContextUsageByRole = Object.fromEntries(
      Array.from(roleFeedHistory.keys())
        .map((roleKey) => {
          const s = SessionStore.loadRoleSession(roleKey, flowRef, workspaceRoot);
          const contextUsage = latestContextUsageFromSession(s);
          return contextUsage != null ? [roleKey, contextUsage] as const : null;
        })
        .filter((e): e is [string, number] => e !== null)
    );

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

  function createRoleOutputStream(session: ActiveSession, role: string): NodeJS.WritableStream {
    return new Writable({
      write(chunk, _encoding, callback) {
        const text = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
        if (text && !isPromptLine(text)) {
          emitHistoricalMessage(session, { type: 'output_text', role, text });
        }
        callback();
      }
    });
  }

  function startFlowRunner(session: ActiveSession, projectNamespace: string): void {
    void attachSessionTask(session, () =>
      session.orchestrator.runStoredFlow(
        workspaceRoot,
        projectNamespace,
        session.outputBridge,
        session.flowRef.flowId,
        (role) => createRoleOutputStream(session, role),
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

    const normalizedFlowRun = await normalizeStaleConsentWaits(ref);
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
        (roleName) => createRoleOutputStream(session, roleName)
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
        (roleName) => createRoleOutputStream(session, roleName)
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
      const msg = buildFlowStateMessage(activeSessions.get(flowKey(ref)) ?? null, ref);
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
