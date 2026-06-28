import express from 'express';
import path from 'node:path';
import http from 'node:http';
import { WebSocketServer } from 'ws';
import { TelemetryManager } from '../observability/observability.js';
import * as SessionStore from '../orchestration/store.js';
import { CLIENT_MESSAGE_TYPE } from '../../shared/protocol-constants.js';
import { discoverProjects } from '../projects/project-discovery.js';
import { setWorkspaceRoot } from '../common/workspace.js';
import { createFlowReadModel } from './flow-read-model.js';
import { registerFlowRoutes } from './flow-routes.js';
import { parseClientMessage } from './protocol.js';
import { createRuntimeSessionManager } from './runtime-session/manager.js';
import { registerProjectSettingsRoutes } from './project-settings-routes.js';
import { registerSettingsRoutes } from './settings-routes.js';
import { SocketHub } from './socket-hub.js';
import { registerStaticUi } from './static-ui.js';

function buildServer() {
  SessionStore.init();

  const app = express();
  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ server: httpServer });
  const socketHub = new SocketHub();
  const flowReadModel = createFlowReadModel();
  const runtimeSessions = createRuntimeSessionManager({ socketHub, flowReadModel });

  registerFlowRoutes(app, {
    flowReadModel,
    onFlowDeleted(projectNamespace) {
      runtimeSessions.refreshProjectFlows(projectNamespace);
    },
    onProjectDeleted(projectNamespace) {
      runtimeSessions.refreshProjectFlows(projectNamespace);
    }
  });
  registerSettingsRoutes(app);
  registerProjectSettingsRoutes(app);
  registerStaticUi(app);

  wss.on('connection', (socket) => {
    socketHub.add(socket);

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

      if (message.type === CLIENT_MESSAGE_TYPE.OPEN_FLOW) {
        runtimeSessions.openFlow(socket, message.flowRef);
        return;
      }

      if (message.type === CLIENT_MESSAGE_TYPE.RESUME_FLOW) {
        void runtimeSessions.resumeFlow(socket, message.flowRef).catch((error: any) => {
          runtimeSessions.sendToSocket(socket, {
            type: 'error',
            flowRef: message.flowRef,
            message: error instanceof Error ? error.message : String(error)
          });
        });
        return;
      }

      if (message.type === CLIENT_MESSAGE_TYPE.START_INITIALIZED_FLOW) {
        const projectExists = discoverProjects().withADocs.some(
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

      if (message.type === CLIENT_MESSAGE_TYPE.START_TAKEOVER_INITIALIZATION) {
        const projectExists = discoverProjects().withoutADocs.some(
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

      if (message.type === CLIENT_MESSAGE_TYPE.START_GREENFIELD_INITIALIZATION) {
        try {
          runtimeSessions.startInitializationFlow(socket, message.projectNamespace, 'greenfield');
        } catch (error: any) {
          runtimeSessions.sendToSocket(socket, {
            type: 'error',
            flowRef: { projectNamespace: message.projectNamespace, flowId: '__new__' },
            message: error instanceof Error ? error.message : String(error)
          });
        }
        return;
      }

      if (message.type === CLIENT_MESSAGE_TYPE.START_UPDATE_FLOW) {
        const project = discoverProjects().withADocs.find(
          (candidate) => candidate.folderName === message.projectNamespace
        );
        if (!project || !project.updateAvailable) {
          runtimeSessions.sendToSocket(socket, {
            type: 'error',
            flowRef: { projectNamespace: message.projectNamespace, flowId: '__new__' },
            message: `Project "${message.projectNamespace}" has no available update.`
          });
          return;
        }

        try {
          runtimeSessions.startUpdateFlow(socket, message.projectNamespace);
        } catch (error: any) {
          runtimeSessions.sendToSocket(socket, {
            type: 'error',
            flowRef: { projectNamespace: message.projectNamespace, flowId: '__new__' },
            message: error instanceof Error ? error.message : String(error)
          });
        }
        return;
      }

      if (message.type === CLIENT_MESSAGE_TYPE.STOP_ACTIVE_TURN) {
        runtimeSessions.handleStopActiveTurn(message.flowRef, { nodeId: message.nodeId, role: message.role });
        return;
      }

      if (message.type === CLIENT_MESSAGE_TYPE.COMPACT_CONTEXT) {
        runtimeSessions.handleCompactContext(message.flowRef, message.role);
        return;
      }

      if (message.type === CLIENT_MESSAGE_TYPE.IMPROVEMENT_CHOICE) {
        void runtimeSessions.handleImprovementChoice(message.flowRef, message.mode);
        return;
      }

      if (message.type === CLIENT_MESSAGE_TYPE.IMPROVEMENT_HUMAN_INPUT) {
        void runtimeSessions.handleImprovementHumanInput(message.flowRef, message.role, message.text);
        return;
      }

      if (message.type === CLIENT_MESSAGE_TYPE.FEEDBACK_CONSENT_CHOICE) {
        void runtimeSessions.handleFeedbackConsentChoice(message.flowRef, message.decision);
        return;
      }

      if (message.type === CLIENT_MESSAGE_TYPE.CONSENT_RESPONSE) {
        runtimeSessions.handleConsentResponse(message.flowRef, message.decision, message.role);
        return;
      }

      if (message.type === CLIENT_MESSAGE_TYPE.CONSENT_MODE) {
        runtimeSessions.handleConsentMode(message.flowRef, message.mode);
        return;
      }

      if (message.type === CLIENT_MESSAGE_TYPE.ROLE_CONFIGURATION) {
        runtimeSessions.handleRoleConfiguration(message.flowRef, message.nodeId, {
          modelConfigId: message.modelConfigId,
          skills: message.skills,
          mcpServers: message.mcpServers,
        });
        return;
      }

      if (message.type === CLIENT_MESSAGE_TYPE.HANDOFF_APPROVAL) {
        void runtimeSessions.handleHandoffApproval(message.flowRef, message.nodeId, message.decision)
          .catch((error: any) => {
            runtimeSessions.sendToSocket(socket, {
              type: 'error',
              flowRef: message.flowRef,
              message: error instanceof Error ? error.message : String(error)
            });
          });
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

export async function startServer(workspaceRoot: string, port: number): Promise<void> {
  TelemetryManager.init();
  setWorkspaceRoot(path.resolve(workspaceRoot));
  const { httpServer } = buildServer();

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
    httpServer.listen(port, '127.0.0.1');
  });
}
