import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FlowRun, RoleSession } from './types.js';

// Get the current directory of this module, then resolve up to runtime/.state
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getStateDir() {
  if (process.env.A_SOCIETY_STATE_DIR) {
    return path.resolve(process.env.A_SOCIETY_STATE_DIR);
  }
  return path.resolve(__dirname, '../../runtime/.state');
}

function getSessionsDir(stateDir: string) { return path.join(stateDir, 'sessions'); }

export class SessionStore {
  static init() {
    const stateDir = getStateDir();
    [stateDir, getSessionsDir(stateDir)].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  static saveFlowRun(flow: FlowRun) {
    fs.writeFileSync(path.join(getStateDir(), 'flow.json'), JSON.stringify(flow, null, 2));
  }

  static loadFlowRun(): FlowRun | null {
    const p = path.join(getStateDir(), 'flow.json');
    if (!fs.existsSync(p)) return null;
    const flow = JSON.parse(fs.readFileSync(p, 'utf8')) as FlowRun;

    if (flow.stateVersion !== '6') {
      throw new Error(
        `Unsupported persisted flow state version "${String((flow as any).stateVersion ?? 'missing')}". ` +
        'This runtime only supports flow state version "6".'
      );
    }

    if (!flow.workspaceRoot || !flow.recordFolderPath) {
      throw new Error('Persisted flow state is missing required workspaceRoot or recordFolderPath fields.');
    }
    if (!flow.completedEdgeArtifacts || typeof flow.completedEdgeArtifacts !== 'object') {
      throw new Error('Persisted flow state is missing completedEdgeArtifacts.');
    }
    if (!flow.pendingNodeArtifacts || typeof flow.pendingNodeArtifacts !== 'object') {
      throw new Error('Persisted flow state is missing pendingNodeArtifacts.');
    }
    if (!Array.isArray(flow.visitedNodeIds)) {
      flow.visitedNodeIds = [];
    }

    return flow;
  }

  static saveRoleSession(session: RoleSession) {
    const sessionsDir = getSessionsDir(getStateDir());
    fs.writeFileSync(path.join(sessionsDir, `${session.logicalSessionId}.json`), JSON.stringify(session, null, 2));
  }

  static loadRoleSession(logicalSessionId: string): RoleSession | null {
    const sessionsDir = getSessionsDir(getStateDir());
    const p = path.join(sessionsDir, `${logicalSessionId}.json`);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8')) as RoleSession;
  }

  static deleteRoleSession(logicalSessionId: string) {
    const sessionsDir = getSessionsDir(getStateDir());
    const p = path.join(sessionsDir, `${logicalSessionId}.json`);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
    }
  }

}
