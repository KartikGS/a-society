import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

import express, { type Express, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { PassThrough } from 'node:stream';
import { WebSocketServer, WebSocket } from 'ws';
import { TelemetryManager } from './observability.js';
import { SessionStore } from './store.js';
import { FlowOrchestrator } from './orchestrator.js';
import { toKebabCaseRoleId } from './role-id.js';
import { WebSocketOperatorSink, type RuntimeServerMessage } from './ws-operator-sink.js';
import { bootstrapInitializationFlow } from './initialization-bootstrap.js';
import { initializeDraftFlow } from './draft-flow.js';
import { discoverProjects, type ProjectDiscovery } from './project-discovery.js';
import { findWorkflowFilePath, resolveFlowWorkflow } from './workflow-file.js';
import type { FlowRef, FlowRun, FlowSummary, OperatorEvent, OperatorFeedMessage } from './types.js';

type ClientMessage =
  | { type: 'open_flow'; flowRef: FlowRef }
  | { type: 'resume_flow'; flowRef: FlowRef }
  | { type: 'start_initialized_flow'; projectNamespace: string }
  | { type: 'start_takeover_initialization'; projectNamespace: string }
  | { type: 'start_greenfield_initialization'; projectName: string }
  | { type: 'stop_active_turn'; flowRef: FlowRef; nodeId?: string; role?: string }
  | { type: 'human_input'; flowRef: FlowRef; text: string; nodeId?: string; role?: string };

type FlowStateMessage = {
  type: 'flow_state';
  flowRef: FlowRef;
  flowRun: FlowRun;
  backwardActive: string[];
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
  messageHistory: HistoricalMessage[];
  lastFlowState: FlowStateMessage | null;
  backwardActive: Set<string>;
  awaitingHumanInput: boolean;
  finished: boolean;
  task: Promise<void>;
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
    const roleKey = toKebabCaseRoleId(target.role);
    const matches = awaitingNodeIds.filter((nodeId) =>
      toKebabCaseRoleId(flowRun.awaitingHumanNodes[nodeId].role) === roleKey
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

  function buildTranscriptPayload(flowRun: FlowRun, nodeId: string) {
    const workflow = resolveWorkflow(flowRun);
    const node = workflow?.nodes?.find((candidate: any) => candidate.id === nodeId);
    if (!node) {
      return null;
    }

    const flowRef = flowRefFromRun(flowRun);
    const logicalSessionId = `${flowRun.flowId}__${toKebabCaseRoleId(node.role)}`;
    const session = SessionStore.loadRoleSession(logicalSessionId, flowRef, workspaceRoot);
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

  function rememberMessage(session: ActiveSession, message: HistoricalMessage): void {
    const previous = session.messageHistory[session.messageHistory.length - 1];
    if (previous?.type === 'output_text' && message.type === 'output_text') {
      session.messageHistory[session.messageHistory.length - 1] = {
        type: 'output_text',
        text: previous.text + message.text,
      };
    } else {
      session.messageHistory.push(message);
    }
    if (session.messageHistory.length > HISTORY_LIMIT) {
      session.messageHistory.splice(0, session.messageHistory.length - HISTORY_LIMIT);
    }
    SessionStore.saveOperatorFeed(session.messageHistory, session.flowRef, workspaceRoot);
  }

  function emitHistoricalMessage(session: ActiveSession, message: HistoricalMessage): void {
    rememberMessage(session, message);
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
      backwardActive
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
        emitHistoricalMessage(session, message);

        if (message.event.kind === 'handoff.applied' || message.event.kind === 'flow.completed') {
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

    session = {
      flowRef,
      projectNamespace: flowRef.projectNamespace,
      inputBridge,
      outputBridge,
      sink,
      orchestrator,
      messageHistory: SessionStore.loadOperatorFeed(flowRef, workspaceRoot),
      lastFlowState: null,
      backwardActive: new Set<string>(),
      awaitingHumanInput: false,
      finished: false,
      task: Promise.resolve()
    };

    outputBridge.on('data', (chunk: string | Buffer) => {
      const text = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
      if (!text || isPromptLine(text)) return;
      emitHistoricalMessage(session, { type: 'output_text', text });
    });

    activeSessions.set(flowKey(flowRef), session);
    return session;
  }

  function getOrCreateSession(flowRef: FlowRef): ActiveSession {
    const existing = activeSessions.get(flowKey(flowRef));
    if (existing) return existing;
    return createSession(flowRef);
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
    const messageHistory = session?.messageHistory ?? SessionStore.loadOperatorFeed(ref, workspaceRoot);

    sendToSocket(socket, { type: 'feed_reset', flowRef: ref });
    for (const message of messageHistory) {
      sendToSocket(socket, { ...message, flowRef: ref } as FlowScopedHistoricalMessage);
    }

    if (session?.lastFlowState) {
      sendToSocket(socket, session.lastFlowState);
    } else {
      sendFlowState(socket, ref);
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
        flowRef.flowId
      )
    ).catch(() => {});
  }

  function startInitializationFlow(socket: WebSocket, projectNamespace: string, mode: 'takeover' | 'greenfield'): void {
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
        flowRef.flowId
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

    const session = createSession(ref);
    sendFlowState(socket, ref);
    void attachSessionTask(session, () =>
      session.orchestrator.runStoredFlow(
        workspaceRoot,
        flowRun.projectNamespace,
        'Owner',
        session.inputBridge,
        session.outputBridge,
        ref.flowId
      )
    ).catch(() => {});
  }

  function resumeAwaitingHumanInput(ref: FlowRef, text: string, target?: { nodeId?: string; role?: string }): void {
    const flowRun = readFlowRun(ref);
    if (!flowRun || flowRun.status !== 'awaiting_human') {
      broadcastToFlow(ref, { type: 'error', flowRef: ref, message: 'No suspended flow is waiting for operator input.' });
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
        session.outputBridge
      );

      await session.orchestrator.runStoredFlow(
        workspaceRoot,
        currentFlow.projectNamespace,
        'Owner',
        session.inputBridge,
        session.outputBridge,
        ref.flowId
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
        activeSession.outputBridge
      ).then(() => activeSession.orchestrator.runStoredFlow(
        workspaceRoot,
        flowRun.projectNamespace,
        'Owner',
        activeSession.inputBridge,
        activeSession.outputBridge,
        ref.flowId
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
      nodes: Array.isArray(workflow.nodes) ? workflow.nodes : [],
      edges: Array.isArray(workflow.edges) ? workflow.edges : []
    });
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

      handleHumanInput(message.flowRef, message.text, { nodeId: message.nodeId, role: message.role });
    });

    socket.on('close', () => {
      clients.delete(socket);
      socketSubscriptions.delete(socket);
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
