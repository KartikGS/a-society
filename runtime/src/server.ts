import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

import express, { type Express, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { PassThrough, Writable } from 'node:stream';
import { WebSocketServer, WebSocket } from 'ws';
import { TelemetryManager } from './observability.js';
import { SessionStore } from './store.js';
import { FlowOrchestrator } from './orchestrator.js';
import { ImprovementOrchestrator, type ImprovementMode } from './improvement.js';
import { parseRoleIdentity } from './role-id.js';
import { WebSocketOperatorSink, type RuntimeServerMessage } from './ws-operator-sink.js';
import { bootstrapInitializationFlow } from './initialization-bootstrap.js';
import { initializeDraftFlow } from './draft-flow.js';
import { discoverProjects, type ProjectDiscovery } from './project-discovery.js';
import * as SettingsStore from './settings-store.js';
import { findWorkflowFilePath, resolveFlowWorkflow } from './workflow-file.js';
import { readImprovementWorkflow } from './improvement-workflow.js';
import { defaultConsentState } from './types.js';
import type { FlowRef, FlowRun, FlowSummary, OperatorEvent, OperatorFeedMessage, ConsentMode } from './types.js';
import { ConsentGateImpl } from './consent-gate.js';

type ClientMessage =
  | { type: 'open_flow'; flowRef: FlowRef }
  | { type: 'resume_flow'; flowRef: FlowRef }
  | { type: 'start_initialized_flow'; projectNamespace: string }
  | { type: 'start_takeover_initialization'; projectNamespace: string }
  | { type: 'start_greenfield_initialization'; projectName: string }
  | { type: 'stop_active_turn'; flowRef: FlowRef; nodeId?: string; role?: string }
  | { type: 'human_input'; flowRef: FlowRef; text: string; nodeId?: string; role?: string }
  | { type: 'improvement_choice'; flowRef: FlowRef; mode: ImprovementMode | 'none' }
  | { type: 'feedback_consent_choice'; flowRef: FlowRef; decision: 'granted' | 'denied' }
  | { type: 'consent_response'; flowRef: FlowRef; decision: 'granted' | 'denied' }
  | { type: 'consent_mode'; flowRef: FlowRef; mode: ConsentMode };

type FlowStateMessage = {
  type: 'flow_state';
  flowRef: FlowRef;
  flowRun: FlowRun;
  backwardActive: string[];
  hasActiveSession: boolean;
};

type HistoricalMessage = OperatorFeedMessage;

type FlowScopedHistoricalMessage = HistoricalMessage & { flowRef: FlowRef };

type ServerMessage =
  | { type: 'init'; projects: ProjectDiscovery }
  | { type: 'flow_summaries'; projectNamespace: string; flows: FlowSummary[] }
  | { type: 'feed_reset'; flowRef: FlowRef }
  | FlowStateMessage
  | FlowScopedHistoricalMessage;

interface ActiveSession {
  flowRef: FlowRef;
  projectNamespace: string;
  inputBridge: PassThrough;
  outputBridge: PassThrough;
  sink: WebSocketOperatorSink;
  orchestrator: FlowOrchestrator;
  roleFeedHistory: Map<string, HistoricalMessage[]>;
  lastFlowState: FlowStateMessage | null;
  backwardActive: Set<string>;
  awaitingHumanInput: boolean;
  finished: boolean;
  task: Promise<void>;
  consentGate: ConsentGateImpl;
}

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const UI_DIST = path.resolve(
  MODULE_DIR,
  path.basename(MODULE_DIR) === 'src' ? '../dist/ui' : './ui'
);
const UI_INDEX = path.join(UI_DIST, 'index.html');
const HISTORY_LIMIT = 400;

function isDirectExecution(): boolean {
  if (!process.argv[1]) return false;
  return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

function parsePort(rawPort: string | undefined): number {
  const parsed = Number(rawPort ?? '3000');
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid A_SOCIETY_UI_PORT value "${rawPort}". Expected an integer between 1 and 65535.`);
  }
  return parsed;
}

function isPromptLine(text: string): boolean {
  return text === '\n> ' || text === '> ' || text === '\r\n> ';
}

function flowKey(ref: FlowRef): string {
  return `${ref.projectNamespace}/${ref.flowId}`;
}

function missingModelError(ref: FlowRef): ServerMessage {
  return {
    type: 'error',
    flowRef: ref,
    message: SettingsStore.MODEL_CONFIGURATION_REQUIRED_MESSAGE
  };
}

function flowRefFromRun(flowRun: FlowRun): FlowRef {
  return {
    projectNamespace: flowRun.projectNamespace,
    flowId: flowRun.flowId,
  };
}

function hasFlowRef(value: any): value is FlowRef {
  return (
    value &&
    typeof value.projectNamespace === 'string' &&
    typeof value.flowId === 'string'
  );
}

function getOpenNodeIds(flowRun: FlowRun): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const nodeId of [
    ...flowRun.readyNodes,
    ...flowRun.runningNodes,
    ...Object.keys(flowRun.awaitingHumanNodes)
  ]) {
    if (seen.has(nodeId)) continue;
    seen.add(nodeId);
    ids.push(nodeId);
  }
  return ids;
}

function resolveAwaitingHumanNode(flowRun: FlowRun, target?: { nodeId?: string; role?: string }): string {
  const awaitingNodeIds = Object.keys(flowRun.awaitingHumanNodes);
  if (target?.nodeId) {
    if (!flowRun.awaitingHumanNodes[target.nodeId]) {
      throw new Error(`Node '${target.nodeId}' is not awaiting human input.`);
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

function buildServer(workspaceRoot: string) {
  SessionStore.init(workspaceRoot);
  SettingsStore.configureSettingsStore(workspaceRoot);

  const app = express();
  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ server: httpServer });
  const clients = new Set<WebSocket>();
  const socketSubscriptions = new Map<WebSocket, string>();
  const activeSessions = new Map<string, ActiveSession>();

  function readFlowRun(ref: FlowRef): FlowRun | null {
    return SessionStore.loadFlowRun(ref, workspaceRoot);
  }

  function resolveWorkflow(flowRun: FlowRun | null): any | null {
    if (!flowRun) return null;
    const workflowPath = findWorkflowFilePath(flowRun.recordFolderPath);
    if (!workflowPath) return null;
    try {
      return resolveFlowWorkflow(flowRun.recordFolderPath, flowRun.workspaceRoot, flowRun.projectNamespace);
    } catch {
      return null;
    }
  }

  function resolveImprovementWorkflow(flowRun: FlowRun | null): any | null {
    if (!flowRun || flowRun.improvementPhase?.mode === undefined || flowRun.improvementPhase.mode === 'none') {
      return null;
    }

    return readImprovementWorkflow(flowRun.improvementPhase.forwardPassClosure.recordFolderPath);
  }

  function buildTranscriptPayload(flowRun: FlowRun, nodeId: string) {
    const workflow = resolveWorkflow(flowRun);
    const node = workflow?.nodes?.find((candidate: any) => candidate.id === nodeId);
    if (!node) {
      return null;
    }

    const flowRef = flowRefFromRun(flowRun);
    const roleKey = parseRoleIdentity(node.role).instanceRoleId;
    const session = SessionStore.loadRoleSession(roleKey, flowRef, workspaceRoot);
    if (!session) {
      return null;
    }

    return {
      nodeId,
      role: node.role,
      transcript: session.transcriptHistory
    };
  }

  function sendToSocket(socket: WebSocket, message: ServerMessage): void {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(message));
  }

  function broadcastToFlow(ref: FlowRef, message: ServerMessage): void {
    const key = flowKey(ref);
    for (const socket of clients) {
      if (socketSubscriptions.get(socket) === key) {
        sendToSocket(socket, message);
      }
    }
  }

  function sendProjectFlows(socket: WebSocket, projectNamespace: string): void {
    sendToSocket(socket, {
      type: 'flow_summaries',
      projectNamespace,
      flows: SessionStore.listFlowSummaries(workspaceRoot, projectNamespace),
    });
  }

  function getRoleFeedKey(message: HistoricalMessage): string | null {
    if (message.type === 'output_text' || message.type === 'wait_start' || message.type === 'wait_stop') {
      return parseRoleIdentity(message.role).instanceRoleId;
    }
    if (message.type === 'input_text') {
      return message.role ? parseRoleIdentity(message.role).instanceRoleId : null;
    }
    if (message.type === 'operator_event') {
      const event = message.event;
      if ('role' in event && typeof event.role === 'string') {
        return parseRoleIdentity(event.role).instanceRoleId;
      }
      if (event.kind === 'handoff.applied') {
        return parseRoleIdentity(event.fromRole).instanceRoleId;
      }
      return null;
    }
    return null;
  }

  function rememberMessage(session: ActiveSession, message: HistoricalMessage): void {
    const roleKey = getRoleFeedKey(message);
    if (!roleKey) return;
    const history = session.roleFeedHistory.get(roleKey) ?? [];

    const previous = history[history.length - 1];
    if (previous?.type === 'output_text' && message.type === 'output_text') {
      history[history.length - 1] = {
        type: 'output_text',
        role: (message as Extract<HistoricalMessage, { type: 'output_text' }>).role,
        text: (previous as Extract<HistoricalMessage, { type: 'output_text' }>).text +
              (message as Extract<HistoricalMessage, { type: 'output_text' }>).text,
      };
    } else {
      history.push(message);
    }
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
    broadcastToFlow(session.flowRef, { ...message, flowRef: session.flowRef } as FlowScopedHistoricalMessage);
  }

  function buildFlowStateMessage(session: ActiveSession | null, ref: FlowRef): FlowStateMessage | null {
    const flowRun = readFlowRun(ref);
    if (!flowRun) return null;
    const backwardActive = session
      ? Array.from(session.backwardActive).filter((nodeId) => getOpenNodeIds(flowRun).includes(nodeId))
      : [];
    return {
      type: 'flow_state',
      flowRef: ref,
      flowRun,
      backwardActive,
      hasActiveSession: session !== null && !session.finished,
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
      case 'wait_start':
        emitHistoricalMessage(session, message);
        return;
      case 'wait_stop':
        emitHistoricalMessage(session, message);
        return;
      case 'operator_event':
        if (message.event.kind === 'consent.requested') {
          emitTransientMessage(session, message);
          return;
        }

        if (message.event.kind === 'consent.resolved' || message.event.kind === 'consent.mode_changed') {
          void SessionStore.updateFlowRun((flow) => {
            flow.consentState = session.consentGate.getState();
          }, session.flowRef, workspaceRoot);
          emitHistoricalMessage(session, message);
          setImmediate(() => emitFlowState(session));
          return;
        }

        if (message.event.kind === 'human.awaiting_input') {
          session.awaitingHumanInput = true;
        }
        if (
          message.event.kind === 'human.resumed' ||
          message.event.kind === 'role.active' ||
          message.event.kind === 'flow.completed'
        ) {
          session.awaitingHumanInput = false;
        }

        updateBackwardTracking(session, message.event);
        if (
          message.event.kind === 'role.active' &&
          message.event.activationSource !== 'handoff' &&
          message.event.activationSource !== 'runtime'
        ) {
          emitTransientMessage(session, message);
        } else {
          emitHistoricalMessage(session, message);
        }

        if (
          message.event.kind === 'handoff.applied' ||
          message.event.kind === 'flow.completed' ||
          (message.event.kind === 'role.active' && message.event.activationSource === 'runtime')
        ) {
          setImmediate(() => emitFlowState(session));
        }

        if (message.event.kind === 'flow.completed') {
          session.finished = true;
          emitHistoricalMessage(session, { type: 'flow_complete' });
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
    const initialConsentState = readFlowRun(flowRef)?.consentState ?? defaultConsentState();
    const consentGate = new ConsentGateImpl(initialConsentState, sink);

    session = {
      flowRef,
      projectNamespace: flowRef.projectNamespace,
      inputBridge,
      outputBridge,
      sink,
      orchestrator,
      consentGate,
      roleFeedHistory: SessionStore.loadAllRoleFeeds(flowRef, workspaceRoot),
      lastFlowState: null,
      backwardActive: new Set<string>(),
      awaitingHumanInput: false,
      finished: false,
      task: Promise.resolve()
    };

    activeSessions.set(flowKey(flowRef), session);
    return session;
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
        session.awaitingHumanInput = false;
        emitFlowState(session);
      });

    return session.task;
  }

  function subscribeSocket(socket: WebSocket, ref: FlowRef): void {
    socketSubscriptions.set(socket, flowKey(ref));
  }

  function replaySessionState(socket: WebSocket, ref: FlowRef): void {
    const session = activeSessions.get(flowKey(ref));
    const feedHistory = session?.roleFeedHistory ?? SessionStore.loadAllRoleFeeds(ref, workspaceRoot);

    sendToSocket(socket, { type: 'feed_reset', flowRef: ref });

    for (const [, messages] of feedHistory) {
      for (const message of messages) {
        sendToSocket(socket, { ...message, flowRef: ref } as FlowScopedHistoricalMessage);
      }
    }

    if (session?.lastFlowState) {
      sendToSocket(socket, session.lastFlowState);
    } else {
      sendFlowState(socket, ref);
    }

    const inFlight = session?.consentGate?.getInFlightRequest();
    if (inFlight) {
      sendToSocket(socket, {
        type: 'operator_event',
        flowRef: ref,
        event: { kind: 'consent.requested', toolClass: inFlight.toolClass, toolName: inFlight.toolName }
      } as any);
    }
  }

  function openFlow(socket: WebSocket, ref: FlowRef): void {
    const flowRun = readFlowRun(ref);
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
    void attachSessionTask(session, () =>
      session.orchestrator.runStoredFlow(
        workspaceRoot,
        projectNamespace,
        'Owner',
        session.inputBridge,
        session.outputBridge,
        flowRef.flowId,
        (role) => createRoleOutputStream(session, role)
      )
    ).catch(() => {});
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
    void attachSessionTask(session, () =>
      session.orchestrator.runStoredFlow(
        workspaceRoot,
        flowRun.projectNamespace,
        'Owner',
        session.inputBridge,
        session.outputBridge,
        flowRef.flowId,
        (role) => createRoleOutputStream(session, role)
      )
    ).catch(() => {});
  }

  function resumeFlow(socket: WebSocket, ref: FlowRef): void {
    const flowRun = readFlowRun(ref);
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

    const session = createSession(ref);
    sendFlowState(socket, ref);
    void attachSessionTask(session, () =>
      session.orchestrator.runStoredFlow(
        workspaceRoot,
        flowRun.projectNamespace,
        'Owner',
        session.inputBridge,
        session.outputBridge,
        ref.flowId,
        (role) => createRoleOutputStream(session, role)
      )
    ).catch(() => {});
  }

  function resumeAwaitingHumanInput(ref: FlowRef, text: string, target?: { nodeId?: string; role?: string }): void {
    const flowRun = readFlowRun(ref);
    if (!flowRun || flowRun.status !== 'awaiting_human') {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'No suspended flow is waiting for operator input.' });
      return;
    }

    if (!SettingsStore.hasUsableConfiguredModel()) {
      broadcastToFlow(ref, missingModelError(ref));
      return;
    }

    let targetNodeId: string;
    try {
      targetNodeId = resolveAwaitingHumanNode(flowRun, target);
    } catch (error: any) {
      broadcastToFlow(ref, {
        type: 'error',
        flowRef: ref,
        message: error instanceof Error ? error.message : String(error)
      });
      return;
    }

    const session = createSession(ref);
    session.awaitingHumanInput = false;
    emitHistoricalMessage(session, {
      type: 'input_text',
      role: flowRun.awaitingHumanNodes[targetNodeId]?.role,
      text,
    });

    void attachSessionTask(session, async () => {
      let currentFlow = readFlowRun(ref);
      if (!currentFlow) {
        throw new Error('Suspended flow state disappeared before the resume step began.');
      }

      await session.orchestrator.advanceFlow(
        currentFlow,
        targetNodeId,
        undefined,
        text,
        session.inputBridge,
        session.outputBridge,
        session.consentGate,
        (role) => createRoleOutputStream(session, role)
      );

      await session.orchestrator.runStoredFlow(
        workspaceRoot,
        currentFlow.projectNamespace,
        'Owner',
        session.inputBridge,
        session.outputBridge,
        ref.flowId,
        (role) => createRoleOutputStream(session, role)
      );

      currentFlow = readFlowRun(ref);
      if (currentFlow?.status === 'completed') {
        session.sink.emit({ kind: 'flow.completed' });
      }
    }).catch(() => {});
  }

  function handleHumanInput(ref: FlowRef, text: string, target?: { nodeId?: string; role?: string }): void {
    const activeSession = activeSessions.get(flowKey(ref));
    if (activeSession && !activeSession.finished) {
      const flowRun = readFlowRun(ref);
      if (!flowRun || Object.keys(flowRun.awaitingHumanNodes).length === 0) {
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
      } catch (error: any) {
        broadcastToFlow(ref, { type: 'error', flowRef: ref, message: error instanceof Error ? error.message : String(error) });
        return;
      }

      activeSession.awaitingHumanInput = false;
      emitHistoricalMessage(activeSession, {
        type: 'input_text',
        role: flowRun.awaitingHumanNodes[targetNodeId]?.role,
        text,
      });
      void activeSession.orchestrator.advanceFlow(
        flowRun,
        targetNodeId,
        undefined,
        text,
        activeSession.inputBridge,
        activeSession.outputBridge,
        activeSession.consentGate,
        (role) => createRoleOutputStream(activeSession, role)
      ).then(() => activeSession.orchestrator.runStoredFlow(
        workspaceRoot,
        flowRun.projectNamespace,
        'Owner',
        activeSession.inputBridge,
        activeSession.outputBridge,
        ref.flowId,
        (role) => createRoleOutputStream(activeSession, role)
      )).catch((error: any) => {
        emitHistoricalMessage(activeSession, {
          type: 'error',
          message: error instanceof Error ? error.message : String(error)
        });
      });
      return;
    }

    const flowRun = readFlowRun(ref);
    if (flowRun?.status === 'awaiting_human') {
      resumeAwaitingHumanInput(ref, text, target);
      return;
    }

    broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'No active runtime session is waiting for human input.' });
  }

  function getOrCreateChoiceSession(ref: FlowRef): ActiveSession {
    const existing = activeSessions.get(flowKey(ref));
    if (existing && !existing.finished) {
      return existing;
    }
    return createSession(ref);
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

  function handleConsentResponse(ref: FlowRef, decision: 'granted' | 'denied'): void {
    const session = activeSessions.get(flowKey(ref));
    if (!session || session.finished) {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'No active session for consent response.' });
      return;
    }
    session.consentGate.respond(decision);
  }

  function handleConsentMode(ref: FlowRef, mode: ConsentMode): void {
    const session = activeSessions.get(flowKey(ref));
    if (session && !session.finished) {
      session.consentGate.setMode(mode);
      return;
    }
    // No active session — persist mode change directly to the flow state
    void SessionStore.updateFlowRun((flow) => {
      if (!flow.consentState) {
        flow.consentState = defaultConsentState();
      }
      flow.consentState.mode = mode;
      if (mode === 'full-access') {
        flow.consentState.fileWrites = 'granted';
        flow.consentState.shellNetwork = 'granted';
      }
    }, ref, workspaceRoot).then(() => {
      const flowRun = readFlowRun(ref);
      if (flowRun) {
        broadcastToFlow(ref, { type: 'flow_state', flowRef: ref, flowRun, backwardActive: [], hasActiveSession: activeSessions.has(flowKey(ref)) && !activeSessions.get(flowKey(ref))!.finished });
      }
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

  function parseClientMessage(raw: string): ClientMessage | null {
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.type === 'open_flow' && hasFlowRef(parsed.flowRef)) {
        return parsed;
      }
      if (parsed?.type === 'resume_flow' && hasFlowRef(parsed.flowRef)) {
        return parsed;
      }
      if (parsed?.type === 'start_initialized_flow' && typeof parsed.projectNamespace === 'string') {
        return parsed;
      }
      if (parsed?.type === 'start_takeover_initialization' && typeof parsed.projectNamespace === 'string') {
        return parsed;
      }
      if (parsed?.type === 'start_greenfield_initialization' && typeof parsed.projectName === 'string') {
        return parsed;
      }
      if (parsed?.type === 'stop_active_turn' && hasFlowRef(parsed.flowRef)) {
        return parsed;
      }
      if (parsed?.type === 'human_input' && hasFlowRef(parsed.flowRef) && typeof parsed.text === 'string') {
        return parsed;
      }
      if (
        parsed?.type === 'improvement_choice' &&
        hasFlowRef(parsed.flowRef) &&
        (parsed.mode === 'graph-based' || parsed.mode === 'parallel' || parsed.mode === 'none')
      ) {
        return parsed;
      }
      if (
        parsed?.type === 'feedback_consent_choice' &&
        hasFlowRef(parsed.flowRef) &&
        (parsed.decision === 'granted' || parsed.decision === 'denied')
      ) {
        return parsed;
      }
      if (
        parsed?.type === 'consent_response' &&
        hasFlowRef(parsed.flowRef) &&
        (parsed.decision === 'granted' || parsed.decision === 'denied')
      ) {
        return parsed;
      }
      if (
        parsed?.type === 'consent_mode' &&
        hasFlowRef(parsed.flowRef) &&
        (parsed.mode === 'ask' || parsed.mode === 'full-access')
      ) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  app.get('/api/projects', (_req: Request, res: Response) => {
    res.json(discoverProjects(workspaceRoot));
  });

  app.get('/api/projects/:projectNamespace/flows', (req: Request, res: Response) => {
    const projectNamespace = Array.isArray(req.params.projectNamespace)
      ? req.params.projectNamespace[0]
      : req.params.projectNamespace;
    res.json(SessionStore.listFlowSummaries(workspaceRoot, projectNamespace));
  });

  app.get('/api/flows/:projectNamespace/:flowId/state', (req: Request, res: Response) => {
    const ref = {
      projectNamespace: Array.isArray(req.params.projectNamespace) ? req.params.projectNamespace[0] : req.params.projectNamespace,
      flowId: Array.isArray(req.params.flowId) ? req.params.flowId[0] : req.params.flowId,
    };
    res.json(readFlowRun(ref));
  });

  app.get('/api/flows/:projectNamespace/:flowId/workflow', (req: Request, res: Response) => {
    const ref = {
      projectNamespace: Array.isArray(req.params.projectNamespace) ? req.params.projectNamespace[0] : req.params.projectNamespace,
      flowId: Array.isArray(req.params.flowId) ? req.params.flowId[0] : req.params.flowId,
    };
    const flowRun = readFlowRun(ref);
    if (!flowRun) {
      res.status(404).json({ message: 'No flow state found.' });
      return;
    }

    const workflow = resolveWorkflow(flowRun);
    if (!workflow) {
      res.status(404).json({ message: 'Workflow graph is unavailable for this flow.' });
      return;
    }

    res.json({
      name: typeof workflow.name === 'string' ? workflow.name : undefined,
      summary: typeof workflow.summary === 'string' ? workflow.summary : undefined,
      nodes: Array.isArray(workflow.nodes) ? workflow.nodes : [],
      edges: Array.isArray(workflow.edges) ? workflow.edges : []
    });
  });

  app.get('/api/flows/:projectNamespace/:flowId/improvement-workflow', (req: Request, res: Response) => {
    const ref = {
      projectNamespace: Array.isArray(req.params.projectNamespace) ? req.params.projectNamespace[0] : req.params.projectNamespace,
      flowId: Array.isArray(req.params.flowId) ? req.params.flowId[0] : req.params.flowId,
    };
    const flowRun = readFlowRun(ref);
    if (!flowRun) {
      res.status(404).json({ message: 'No flow state found.' });
      return;
    }

    const workflow = resolveImprovementWorkflow(flowRun);
    if (!workflow) {
      res.status(404).json({ message: 'Improvement graph is unavailable for this flow.' });
      return;
    }

    res.json({
      name: typeof workflow.name === 'string' ? workflow.name : undefined,
      summary: typeof workflow.summary === 'string' ? workflow.summary : undefined,
      nodes: Array.isArray(workflow.nodes) ? workflow.nodes : [],
      edges: Array.isArray(workflow.edges) ? workflow.edges : []
    });
  });

  app.delete('/api/flows/:projectNamespace/:flowId', (req: Request, res: Response) => {
    const ref = {
      projectNamespace: Array.isArray(req.params.projectNamespace) ? req.params.projectNamespace[0] : req.params.projectNamespace,
      flowId: Array.isArray(req.params.flowId) ? req.params.flowId[0] : req.params.flowId,
    };

    const { recordFolderPath } = SessionStore.deleteFlow(ref, workspaceRoot);
    if (recordFolderPath && fs.existsSync(recordFolderPath)) {
      fs.rmSync(recordFolderPath, { recursive: true, force: true });
    }

    for (const socket of clients) {
      sendProjectFlows(socket, ref.projectNamespace);
    }

    res.status(200).json({ ok: true });
  });

  app.get('/api/flows/:projectNamespace/:flowId/transcripts/:nodeId', (req: Request, res: Response) => {
    const ref = {
      projectNamespace: Array.isArray(req.params.projectNamespace) ? req.params.projectNamespace[0] : req.params.projectNamespace,
      flowId: Array.isArray(req.params.flowId) ? req.params.flowId[0] : req.params.flowId,
    };
    const flowRun = readFlowRun(ref);
    if (!flowRun) {
      res.status(404).json({ message: 'No flow state found.' });
      return;
    }

    const nodeId = Array.isArray(req.params.nodeId) ? req.params.nodeId[0] : req.params.nodeId;
    const payload = buildTranscriptPayload(flowRun, nodeId);
    if (!payload) {
      res.status(404).json({ message: `No transcript found for node "${nodeId}".` });
      return;
    }

    res.json(payload);
  });

  app.use(express.json());

  app.get('/api/settings/models', (_req: Request, res: Response) => {
    res.json(SettingsStore.listModels());
  });

  app.get('/api/settings/status', (_req: Request, res: Response) => {
    res.json({
      hasConfiguredModel: SettingsStore.hasUsableConfiguredModel(),
      modelCount: SettingsStore.listModels().length
    });
  });

  app.get('/api/settings/active-model/context-window', (_req: Request, res: Response) => {
    const model = SettingsStore.getActiveModelWithKey();
    res.json({ contextWindow: model?.contextWindow ?? null });
  });

  app.get('/api/settings/tools', (_req: Request, res: Response) => {
    res.json(SettingsStore.getToolSettings());
  });

  app.post('/api/settings/models', (req: Request, res: Response) => {
    const { apiKey, ...params } = req.body as any;
    if (!params.displayName || !params.providerType || !params.modelId) {
      res.status(400).json({ message: 'displayName, providerType, and modelId are required.' });
      return;
    }
    if (params.providerType === 'openai-compatible' && !params.providerBaseUrl) {
      res.status(400).json({ message: 'providerBaseUrl is required for openai-compatible provider.' });
      return;
    }
    const model = SettingsStore.createModel({
      displayName: String(params.displayName),
      providerType: params.providerType as 'anthropic' | 'openai-compatible',
      providerBaseUrl: String(params.providerBaseUrl ?? ''),
      modelId: String(params.modelId),
      contextWindow: Number(params.contextWindow) || 0,
      maxOutputTokens: Number(params.maxOutputTokens) || 0,
      supportsThinking: Boolean(params.supportsThinking),
      supportedInputTypes: Array.isArray(params.supportedInputTypes)
        ? params.supportedInputTypes
            .filter((value: unknown): value is 'image' | 'audio' | 'video' =>
              value === 'image' || value === 'audio' || value === 'video')
        : [],
    }, String(apiKey ?? ''));
    res.status(201).json(model);
  });

  app.put('/api/settings/models/:id', (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { apiKey, ...params } = req.body as any;
    if (!params.displayName || !params.providerType || !params.modelId) {
      res.status(400).json({ message: 'displayName, providerType, and modelId are required.' });
      return;
    }
    if (params.providerType === 'openai-compatible' && !params.providerBaseUrl) {
      res.status(400).json({ message: 'providerBaseUrl is required for openai-compatible provider.' });
      return;
    }

    try {
      const model = SettingsStore.updateModel(id, {
        displayName: String(params.displayName),
        providerType: params.providerType as 'anthropic' | 'openai-compatible',
        providerBaseUrl: String(params.providerBaseUrl ?? ''),
        modelId: String(params.modelId),
        contextWindow: Number(params.contextWindow) || 0,
        maxOutputTokens: Number(params.maxOutputTokens) || 0,
        supportsThinking: Boolean(params.supportsThinking),
        supportedInputTypes: Array.isArray(params.supportedInputTypes)
          ? params.supportedInputTypes
              .filter((value: unknown): value is 'image' | 'audio' | 'video' =>
                value === 'image' || value === 'audio' || value === 'video')
          : [],
      }, typeof apiKey === 'string' ? apiKey : undefined);
      res.json(model);
    } catch (err: any) {
      res.status(404).json({ message: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post('/api/settings/models/:id/activate', (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
      SettingsStore.activateModel(id);
      res.json({ ok: true });
    } catch (err: any) {
      res.status(404).json({ message: err instanceof Error ? err.message : String(err) });
    }
  });

  app.delete('/api/settings/models/:id', (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    SettingsStore.deleteModel(id);
    res.json({ ok: true });
  });

  app.put('/api/settings/tools/web-search', (req: Request, res: Response) => {
    const enabled = req.body?.enabled === true;
    const apiKey = typeof req.body?.apiKey === 'string' ? req.body.apiKey : undefined;

    try {
      res.json(SettingsStore.updateWebSearchToolSettings({ enabled, apiKey }));
    } catch (err: any) {
      res.status(400).json({ message: err instanceof Error ? err.message : String(err) });
    }
  });

  app.use(express.static(UI_DIST));
  app.get('*', (_req: Request, res: Response) => {
    if (!fs.existsSync(UI_INDEX)) {
      res.status(503).send('UI assets are not built. Run `npm run build:ui` in a-society/runtime/.');
      return;
    }
    res.sendFile(UI_INDEX);
  });

  wss.on('connection', (socket) => {
    clients.add(socket);

    sendToSocket(socket, {
      type: 'init',
      projects: discoverProjects(workspaceRoot),
    });

    socket.on('message', (raw) => {
      const message = parseClientMessage(String(raw));
      if (!message) {
        sendToSocket(socket, {
          type: 'error',
          flowRef: { projectNamespace: '__system__', flowId: '__system__' },
          message: 'Malformed WebSocket message.'
        });
        return;
      }

      if (message.type === 'open_flow') {
        openFlow(socket, message.flowRef);
        return;
      }

      if (message.type === 'resume_flow') {
        resumeFlow(socket, message.flowRef);
        return;
      }

      if (message.type === 'start_initialized_flow') {
        const projectExists = discoverProjects(workspaceRoot).withADocs.some(
          (project) => project.folderName === message.projectNamespace
        );
        if (!projectExists) {
          sendToSocket(socket, {
            type: 'error',
            flowRef: { projectNamespace: message.projectNamespace, flowId: '__new__' },
            message: `Project "${message.projectNamespace}" with a-docs was not found in the workspace.`
          });
          return;
        }

        startFreshFlow(socket, message.projectNamespace);
        return;
      }

      if (message.type === 'start_takeover_initialization') {
        const projectExists = discoverProjects(workspaceRoot).withoutADocs.some(
          (project) => project.folderName === message.projectNamespace
        );
        if (!projectExists) {
          sendToSocket(socket, {
            type: 'error',
            flowRef: { projectNamespace: message.projectNamespace, flowId: '__new__' },
            message: `Project "${message.projectNamespace}" without a-docs was not found in the workspace.`
          });
          return;
        }

        try {
          startInitializationFlow(socket, message.projectNamespace, 'takeover');
        } catch (error: any) {
          sendToSocket(socket, {
            type: 'error',
            flowRef: { projectNamespace: message.projectNamespace, flowId: '__new__' },
            message: error instanceof Error ? error.message : String(error)
          });
        }
        return;
      }

      if (message.type === 'start_greenfield_initialization') {
        try {
          startInitializationFlow(socket, message.projectName, 'greenfield');
        } catch (error: any) {
          sendToSocket(socket, {
            type: 'error',
            flowRef: { projectNamespace: message.projectName, flowId: '__new__' },
            message: error instanceof Error ? error.message : String(error)
          });
        }
        return;
      }

      if (message.type === 'stop_active_turn') {
        handleStopActiveTurn(message.flowRef, { nodeId: message.nodeId, role: message.role });
        return;
      }

      if (message.type === 'improvement_choice') {
        handleImprovementChoice(message.flowRef, message.mode);
        return;
      }

      if (message.type === 'feedback_consent_choice') {
        handleFeedbackConsentChoice(message.flowRef, message.decision);
        return;
      }

      if (message.type === 'consent_response') {
        handleConsentResponse(message.flowRef, message.decision);
        return;
      }

      if (message.type === 'consent_mode') {
        handleConsentMode(message.flowRef, message.mode);
        return;
      }

      handleHumanInput(message.flowRef, message.text, { nodeId: message.nodeId, role: message.role });
    });

    socket.on('close', () => {
      const subscribedKey = socketSubscriptions.get(socket);
      clients.delete(socket);
      socketSubscriptions.delete(socket);
      if (subscribedKey) {
        const hasOtherSubscribers = [...clients].some((c) => socketSubscriptions.get(c) === subscribedKey);
        if (!hasOtherSubscribers) {
          activeSessions.get(subscribedKey)?.consentGate?.abortInFlight();
        }
      }
    });
  });

  return { app, httpServer, wss };
}

export function createServer(workspaceRoot: string): { app: Express; wss: WebSocketServer } {
  const { app, wss } = buildServer(path.resolve(workspaceRoot));
  return { app, wss };
}

export async function startServer(workspaceRoot: string, port: number): Promise<void> {
  TelemetryManager.init();
  const { httpServer } = buildServer(path.resolve(workspaceRoot));

  await new Promise<void>((resolve, reject) => {
    const onError = (error: NodeJS.ErrnoException) => {
      httpServer.off('listening', onListening);
      if (error.code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} is already in use. Set A_SOCIETY_UI_PORT to a free port and retry.`));
        return;
      }
      reject(error);
    };

    const onListening = () => {
      httpServer.off('error', onError);
      resolve();
    };

    httpServer.once('error', onError);
    httpServer.once('listening', onListening);
    httpServer.listen(port, '0.0.0.0');
  });
}

async function main(): Promise<void> {
  const port = parsePort(process.env.A_SOCIETY_UI_PORT);
  await startServer(process.cwd(), port);
  process.stderr.write(`[runtime/server] UI available at http://localhost:${port}\n`);
}

if (isDirectExecution()) {
  main().catch(async (error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    await TelemetryManager.shutdown();
    process.exit(1);
  });
}
