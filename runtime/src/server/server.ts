import express, { type Express } from 'express';
import path from 'node:path';
import http from 'node:http';
import { WebSocketServer } from 'ws';
import { TelemetryManager } from '../observability/observability.js';
import { SessionStore } from '../orchestration/store.js';
import { discoverProjects } from '../projects/project-discovery.js';
import * as SettingsStore from '../settings/settings-store.js';
import { createFlowReadModel } from './flow-read-model.js';
import { registerFlowRoutes } from './flow-routes.js';
import { parseClientMessage } from './protocol.js';
import { createRuntimeSessionManager } from './runtime-session-manager.js';
import { registerSettingsRoutes } from './settings-routes.js';
import { SocketHub } from './socket-hub.js';
import { registerStaticUi } from './static-ui.js';

function buildServer(workspaceRoot: string) {
  SessionStore.init(workspaceRoot);
  SettingsStore.configureSettingsStore(workspaceRoot);

  const app = express();
  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ server: httpServer });
  const socketHub = new SocketHub();
  const flowReadModel = createFlowReadModel(workspaceRoot);
  const runtimeSessions = createRuntimeSessionManager({ workspaceRoot, socketHub, flowReadModel });

  registerFlowRoutes(app, {
    workspaceRoot,
    flowReadModel,
    onFlowDeleted(projectNamespace) {
      runtimeSessions.refreshProjectFlows(projectNamespace);
    }
  });
  registerSettingsRoutes(app);
  registerStaticUi(app);

  wss.on('connection', (socket) => {
    socketHub.add(socket);

    runtimeSessions.sendToSocket(socket, {
      type: 'init',
      projects: discoverProjects(workspaceRoot),
    });

    socket.on('message', (raw) => {
      const message = parseClientMessage(String(raw));
      if (!message) {
        runtimeSessions.sendToSocket(socket, {
          type: 'error',
          flowRef: { projectNamespace: '__system__', flowId: '__system__' },
          message: 'Malformed WebSocket message.'
        });
        return;
      }

      if (message.type === 'open_flow') {
        runtimeSessions.openFlow(socket, message.flowRef);
        return;
      }

      if (message.type === 'resume_flow') {
        void runtimeSessions.resumeFlow(socket, message.flowRef).catch((error: any) => {
          runtimeSessions.sendToSocket(socket, {
            type: 'error',
            flowRef: message.flowRef,
            message: error instanceof Error ? error.message : String(error)
          });
        });
        return;
      }

      if (message.type === 'start_initialized_flow') {
        const projectExists = discoverProjects(workspaceRoot).withADocs.some(
          (project) => project.folderName === message.projectNamespace
        );
        if (!projectExists) {
          runtimeSessions.sendToSocket(socket, {
            type: 'error',
            flowRef: { projectNamespace: message.projectNamespace, flowId: '__new__' },
            message: `Project "${message.projectNamespace}" with a-docs was not found in the workspace.`
          });
          return;
        }

        runtimeSessions.startFreshFlow(socket, message.projectNamespace);
        return;
      }

      if (message.type === 'start_takeover_initialization') {
        const projectExists = discoverProjects(workspaceRoot).withoutADocs.some(
          (project) => project.folderName === message.projectNamespace
        );
        if (!projectExists) {
          runtimeSessions.sendToSocket(socket, {
            type: 'error',
            flowRef: { projectNamespace: message.projectNamespace, flowId: '__new__' },
            message: `Project "${message.projectNamespace}" without a-docs was not found in the workspace.`
          });
          return;
        }

        try {
          runtimeSessions.startInitializationFlow(socket, message.projectNamespace, 'takeover');
        } catch (error: any) {
          runtimeSessions.sendToSocket(socket, {
            type: 'error',
            flowRef: { projectNamespace: message.projectNamespace, flowId: '__new__' },
            message: error instanceof Error ? error.message : String(error)
          });
        }
        return;
      }

      if (message.type === 'start_greenfield_initialization') {
        try {
          runtimeSessions.startInitializationFlow(socket, message.projectName, 'greenfield');
        } catch (error: any) {
          runtimeSessions.sendToSocket(socket, {
            type: 'error',
            flowRef: { projectNamespace: message.projectName, flowId: '__new__' },
            message: error instanceof Error ? error.message : String(error)
          });
        }
        return;
      }

      if (message.type === 'stop_active_turn') {
        runtimeSessions.handleStopActiveTurn(message.flowRef, { nodeId: message.nodeId, role: message.role });
        return;
      }

      if (message.type === 'compact_context') {
        runtimeSessions.handleCompactContext(message.flowRef, message.role);
        return;
      }

      if (message.type === 'improvement_choice') {
        runtimeSessions.handleImprovementChoice(message.flowRef, message.mode);
        return;
      }

      if (message.type === 'feedback_consent_choice') {
        runtimeSessions.handleFeedbackConsentChoice(message.flowRef, message.decision);
        return;
      }

      if (message.type === 'consent_response') {
        runtimeSessions.handleConsentResponse(message.flowRef, message.decision, message.role);
        return;
      }

      if (message.type === 'consent_mode') {
        runtimeSessions.handleConsentMode(message.flowRef, message.mode);
        return;
      }

      void runtimeSessions.handleHumanInput(
        message.flowRef,
        message.text,
        { nodeId: message.nodeId, role: message.role }
      ).catch((error: any) => {
        runtimeSessions.sendToSocket(socket, {
          type: 'error',
          flowRef: message.flowRef,
          message: error instanceof Error ? error.message : String(error)
        });
      });
    });

    socket.on('close', () => {
      socketHub.remove(socket);
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
