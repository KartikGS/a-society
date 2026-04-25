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
import type { FlowRun, OperatorEvent } from './types.js';

type ClientMessage =
  | { type: 'start_initialized_flow'; projectNamespace: string }
  | { type: 'start_takeover_initialization'; projectNamespace: string }
  | { type: 'start_greenfield_initialization'; projectName: string }
  | { type: 'stop_active_turn'; nodeId?: string; role?: string }
  | { type: 'human_input'; text: string; nodeId?: string; role?: string };

type FlowStateMessage = {
  type: 'flow_state';
  flowRun: FlowRun;
  backwardActive: string[];
};

type ServerMessage =
  | { type: 'init'; projects: ProjectDiscovery; flowRun: FlowRun | null }
  | RuntimeServerMessage
  | { type: 'output_text'; text: string }
  | FlowStateMessage
  | { type: 'error'; message: string }
  | { type: 'flow_complete' };

type HistoricalMessage = Exclude<ServerMessage, { type: 'init' | 'flow_state' }>;

interface ActiveSession {
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

function readCurrentFlowRun(): FlowRun | null {
  SessionStore.init();
  return SessionStore.loadFlowRun();
}

  function resolveCurrentWorkflow(flowRun: FlowRun | null): any | null {
  if (!flowRun) return null;
  const workflowPath = findWorkflowFilePath(flowRun.recordFolderPath);
  if (!workflowPath) return null;
  try {
    return resolveFlowWorkflow(flowRun.recordFolderPath, flowRun.workspaceRoot, flowRun.projectNamespace);
  } catch {
    return null;
  }
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

function buildTranscriptPayload(flowRun: FlowRun, nodeId: string) {
  const workflow = resolveCurrentWorkflow(flowRun);
  const node = workflow?.nodes?.find((candidate: any) => candidate.id === nodeId);
  if (!node) {
    return null;
  }

  const logicalSessionId = `${flowRun.flowId}__${toKebabCaseRoleId(node.role)}`;
  const session = SessionStore.loadRoleSession(logicalSessionId);
  if (!session) {
    return null;
  }

  return {
    nodeId,
    role: node.role,
    transcript: session.transcriptHistory
  };
}

function buildServer(workspaceRoot: string) {
  SessionStore.init();

  const app = express();
  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ server: httpServer });
  const clients = new Set<WebSocket>();
  let activeSession: ActiveSession | null = null;

  function sendToSocket(socket: WebSocket, message: ServerMessage): void {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(message));
  }

  function broadcast(message: ServerMessage): void {
    for (const socket of clients) {
      sendToSocket(socket, message);
    }
  }

  function rememberMessage(session: ActiveSession, message: HistoricalMessage): void {
    session.messageHistory.push(message);
    if (session.messageHistory.length > HISTORY_LIMIT) {
      session.messageHistory.splice(0, session.messageHistory.length - HISTORY_LIMIT);
    }
  }

  function emitHistoricalMessage(session: ActiveSession, message: HistoricalMessage): void {
    rememberMessage(session, message);
    broadcast(message);
  }

  function buildFlowStateMessage(session: ActiveSession | null): FlowStateMessage | null {
    const flowRun = readCurrentFlowRun();
    if (!flowRun) return null;
    const backwardActive = session
      ? Array.from(session.backwardActive).filter((nodeId) => getOpenNodeIds(flowRun).includes(nodeId))
      : [];
    return {
      type: 'flow_state',
      flowRun,
      backwardActive
    };
  }

  function emitFlowState(session: ActiveSession | null): void {
    const message = buildFlowStateMessage(session);
    if (!message) return;
    if (session) {
      session.lastFlowState = message;
    }
    broadcast(message);
  }

  function updateBackwardTracking(session: ActiveSession, event: OperatorEvent): void {
    if (event.kind !== 'handoff.applied') return;

    const flowRun = readCurrentFlowRun();
    const workflow = resolveCurrentWorkflow(flowRun);
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

  function createSession(projectNamespace: string): ActiveSession {
    // The WebSocket sink closes over the session before the session object is assembled.
    // eslint-disable-next-line prefer-const
    let session!: ActiveSession;

    const inputBridge = new PassThrough();
    const outputBridge = new PassThrough();
    outputBridge.setEncoding('utf8');

    const sink = new WebSocketOperatorSink((message) => handleRuntimeMessage(session, message));
    const orchestrator = new FlowOrchestrator(sink);

    session = {
      projectNamespace,
      inputBridge,
      outputBridge,
      sink,
      orchestrator,
      messageHistory: [],
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

    activeSession = session;
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
        const currentFlow = readCurrentFlowRun();
        if (currentFlow?.status === 'completed') {
          session.finished = true;
        }
        session.awaitingHumanInput = false;
        emitFlowState(session);
      });

    return session.task;
  }

  function canStartFreshFlow(): string | null {
    if (activeSession && !activeSession.finished) {
      return 'A flow is already active. Resume it in the current UI session instead of starting a second flow.';
    }

    const flowRun = readCurrentFlowRun();
    if (!flowRun) return null;

    if (flowRun.status === 'completed') {
      return 'A completed flow state is still present in runtime state. Clear or archive that state before starting a new flow.';
    }

    return 'A flow is already present in runtime state. Resume it in the UI instead of starting a second flow.';
  }

  function startFreshFlow(projectNamespace: string): void {
    const startBlocker = canStartFreshFlow();
    if (startBlocker) {
      broadcast({ type: 'error', message: startBlocker });
      return;
    }

    const flowRun = initializeDraftFlow(workspaceRoot, projectNamespace, 'Owner');
    SessionStore.saveFlowRun(flowRun);

    const session = createSession(projectNamespace);
    emitFlowState(session);
    void attachSessionTask(session, () =>
      session.orchestrator.runStoredFlow(
        workspaceRoot,
        projectNamespace,
        'Owner',
        session.inputBridge,
        session.outputBridge
      )
    ).catch(() => {});
  }

  function startInitializationFlow(projectNamespace: string, mode: 'takeover' | 'greenfield'): void {
    const startBlocker = canStartFreshFlow();
    if (startBlocker) {
      broadcast({ type: 'error', message: startBlocker });
      return;
    }

    const { flowRun } = bootstrapInitializationFlow(workspaceRoot, projectNamespace, mode);
    SessionStore.saveFlowRun(flowRun);

    const session = createSession(projectNamespace);
    emitFlowState(session);
    void attachSessionTask(session, () =>
      session.orchestrator.runStoredFlow(
        workspaceRoot,
        projectNamespace,
        'Owner',
        session.inputBridge,
        session.outputBridge
      )
    ).catch(() => {});
  }

  function resumeRunningFlow(): void {
    const flowRun = readCurrentFlowRun();
    if (!flowRun || flowRun.status !== 'running') return;
    if (activeSession && !activeSession.finished) return;

    const session = createSession(flowRun.projectNamespace);
    void attachSessionTask(session, () =>
      session.orchestrator.runStoredFlow(
        workspaceRoot,
        flowRun.projectNamespace,
        'Owner',
        session.inputBridge,
        session.outputBridge
      )
    ).catch(() => {});
  }

  function resumeAwaitingHumanInput(text: string, target?: { nodeId?: string; role?: string }): void {
    const flowRun = readCurrentFlowRun();
    if (!flowRun || flowRun.status !== 'awaiting_human') {
      broadcast({ type: 'error', message: 'No suspended flow is waiting for operator input.' });
      return;
    }

    let targetNodeId: string;
    try {
      targetNodeId = resolveAwaitingHumanNode(flowRun, target);
    } catch (error: any) {
      broadcast({
        type: 'error',
        message: error instanceof Error ? error.message : String(error)
      });
      return;
    }

    if (activeSession && !activeSession.finished) {
      broadcast({ type: 'error', message: 'The runtime is already handling an active session.' });
      return;
    }

    const session = createSession(flowRun.projectNamespace);
    session.awaitingHumanInput = false;

    void attachSessionTask(session, async () => {
      let currentFlow = readCurrentFlowRun();
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
        session.outputBridge
      );

      currentFlow = readCurrentFlowRun();
      if (currentFlow?.status === 'completed') {
        session.sink.emit({ kind: 'flow.completed' });
      }
    }).catch(() => {});
  }

  function handleHumanInput(text: string, target?: { nodeId?: string; role?: string }): void {
    if (activeSession && !activeSession.finished) {
      const flowRun = readCurrentFlowRun();
      if (!flowRun || Object.keys(flowRun.awaitingHumanNodes).length === 0) {
        broadcast({ type: 'error', message: 'The runtime is not currently waiting for human input.' });
        return;
      }

      let targetNodeId: string;
      try {
        targetNodeId = resolveAwaitingHumanNode(flowRun, target);
      } catch (error: any) {
        broadcast({ type: 'error', message: error instanceof Error ? error.message : String(error) });
        return;
      }

      activeSession.awaitingHumanInput = false;
      void activeSession.orchestrator.advanceFlow(
        flowRun,
        targetNodeId,
        undefined,
        text,
        activeSession.inputBridge,
        activeSession.outputBridge
      ).then(() => activeSession?.orchestrator.runStoredFlow(
        workspaceRoot,
        flowRun.projectNamespace,
        'Owner',
        activeSession.inputBridge,
        activeSession.outputBridge
      )).catch((error: any) => {
        emitHistoricalMessage(activeSession!, {
          type: 'error',
          message: error instanceof Error ? error.message : String(error)
        });
      });
      return;
    }

    const flowRun = readCurrentFlowRun();
    if (flowRun?.status === 'awaiting_human') {
      resumeAwaitingHumanInput(text, target);
      return;
    }

    broadcast({ type: 'error', message: 'No active runtime session is waiting for human input.' });
  }

  function handleStopActiveTurn(target?: { nodeId?: string; role?: string }): void {
    if (!activeSession || activeSession.finished) {
      broadcast({ type: 'error', message: 'No active runtime session is currently running.' });
      return;
    }

    const stopped = activeSession.orchestrator.abortActiveTurn(target);
    if (!stopped) {
      broadcast({ type: 'error', message: 'No active turn is currently stoppable.' });
    }
  }

  function replaySessionState(socket: WebSocket): void {
    if (!activeSession) return;

    const flowRun = readCurrentFlowRun();
    if (flowRun?.status === 'completed') {
      return;
    }

    for (const message of activeSession.messageHistory) {
      sendToSocket(socket, message);
    }

    if (activeSession.lastFlowState) {
      sendToSocket(socket, activeSession.lastFlowState);
    }
  }

  function parseClientMessage(raw: string): ClientMessage | null {
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.type === 'start_initialized_flow' && typeof parsed.projectNamespace === 'string') {
        return parsed;
      }
      if (parsed?.type === 'start_takeover_initialization' && typeof parsed.projectNamespace === 'string') {
        return parsed;
      }
      if (parsed?.type === 'start_greenfield_initialization' && typeof parsed.projectName === 'string') {
        return parsed;
      }
      if (parsed?.type === 'stop_active_turn') {
        return parsed;
      }
      if (parsed?.type === 'human_input' && typeof parsed.text === 'string') {
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

  app.get('/api/flow-state', (_req: Request, res: Response) => {
    res.json(readCurrentFlowRun());
  });

  app.get('/api/workflow', (_req: Request, res: Response) => {
    const flowRun = readCurrentFlowRun();
    if (!flowRun) {
      res.status(404).json({ message: 'No active flow state found.' });
      return;
    }

    const workflow = resolveCurrentWorkflow(flowRun);
    if (!workflow) {
      res.status(404).json({ message: 'Workflow graph is unavailable for the current flow.' });
      return;
    }

    res.json({
      nodes: Array.isArray(workflow.nodes) ? workflow.nodes : [],
      edges: Array.isArray(workflow.edges) ? workflow.edges : []
    });
  });

  app.get('/api/transcripts/:nodeId', (req: Request, res: Response) => {
    const flowRun = readCurrentFlowRun();
    if (!flowRun) {
      res.status(404).json({ message: 'No active flow state found.' });
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
      flowRun: readCurrentFlowRun()
    });

    replaySessionState(socket);
    resumeRunningFlow();

    socket.on('message', (raw) => {
      const message = parseClientMessage(String(raw));
      if (!message) {
        sendToSocket(socket, { type: 'error', message: 'Malformed WebSocket message.' });
        return;
      }

      if (message.type === 'start_initialized_flow') {
        const projectExists = discoverProjects(workspaceRoot).withADocs.some(
          (project) => project.folderName === message.projectNamespace
        );
        if (!projectExists) {
          sendToSocket(socket, {
            type: 'error',
            message: `Project "${message.projectNamespace}" with a-docs was not found in the workspace.`
          });
          return;
        }

        startFreshFlow(message.projectNamespace);
        return;
      }

      if (message.type === 'start_takeover_initialization') {
        const projectExists = discoverProjects(workspaceRoot).withoutADocs.some(
          (project) => project.folderName === message.projectNamespace
        );
        if (!projectExists) {
          sendToSocket(socket, {
            type: 'error',
            message: `Project "${message.projectNamespace}" without a-docs was not found in the workspace.`
          });
          return;
        }

        try {
          startInitializationFlow(message.projectNamespace, 'takeover');
        } catch (error: any) {
          sendToSocket(socket, {
            type: 'error',
            message: error instanceof Error ? error.message : String(error)
          });
        }
        return;
      }

      if (message.type === 'start_greenfield_initialization') {
        try {
          startInitializationFlow(message.projectName, 'greenfield');
        } catch (error: any) {
          sendToSocket(socket, {
            type: 'error',
            message: error instanceof Error ? error.message : String(error)
          });
        }
        return;
      }

      if (message.type === 'stop_active_turn') {
        handleStopActiveTurn({ nodeId: message.nodeId, role: message.role });
        return;
      }

      handleHumanInput(message.text, { nodeId: message.nodeId, role: message.role });
    });

    socket.on('close', () => {
      clients.delete(socket);
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
