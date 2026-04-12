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
    const flowToSave = { ...flow } as FlowRun & {
      projectRoot?: string;
      completedNodeArtifacts?: Record<string, string>;
    };
    delete flowToSave.projectRoot;
    delete flowToSave.completedNodeArtifacts;
    fs.writeFileSync(path.join(getStateDir(), 'flow.json'), JSON.stringify(flowToSave, null, 2));
  }

  static loadFlowRun(): FlowRun | null {
    const p = path.join(getStateDir(), 'flow.json');
    if (!fs.existsSync(p)) return null;
    const flow = JSON.parse(fs.readFileSync(p, 'utf8')) as FlowRun & {
      projectRoot?: string;
      completedNodeArtifacts?: Record<string, string>;
    };
    if (!flow.stateVersion) {
      // State version absent — pre-versioning state ("1"). Compatible with current schema.
      // improvementPhase will be undefined (correct initial state). No data loss.
      flow.stateVersion = '1';
    }

    if (!flow.workspaceRoot && flow.projectRoot) {
      flow.workspaceRoot = flow.projectRoot;
    }

    if (!flow.completedEdgeArtifacts || typeof flow.completedEdgeArtifacts !== 'object') {
      flow.completedEdgeArtifacts = {};
    }
    delete flow.completedNodeArtifacts;

    // Silently migrate v1-v4 state to v5:
    // - initialize empty role-continuity ledger when absent
    // - initialize empty edge-artifact ledger when absent
    // - rename projectRoot -> workspaceRoot
    // Node-keyed session transcripts remain valid and unchanged.
    if (flow.stateVersion === '1' || flow.stateVersion === '2' || flow.stateVersion === '3' || flow.stateVersion === '4') {
      const migratedContinuity: NonNullable<FlowRun['roleContinuity']> = {};
      for (const [storedKey, storedState] of Object.entries(flow.roleContinuity ?? {})) {
        const rawState = storedState as { roleName?: string; completedNodes?: any[] };
        const roleName = rawState.roleName ?? storedKey;
        migratedContinuity[roleName] = {
          roleName,
          completedNodes: Array.isArray(rawState.completedNodes) ? rawState.completedNodes : []
        };
      }
      flow.roleContinuity = migratedContinuity;
      flow.stateVersion = '5';
      delete flow.projectRoot;
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
