import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FlowRun, RoleSession } from './types.js';
import { repairMovedRecordFolder } from './draft-flow.js';
import { syncRecordMetadataFromWorkflow } from './record-metadata.js';

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
  private static flowUpdateLock: Promise<void> = Promise.resolve();

  static init() {
    const stateDir = getStateDir();
    [stateDir, getSessionsDir(stateDir)].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  static saveFlowRun(flow: FlowRun) {
    const { recordName: _recordName, recordSummary: _recordSummary, ...persisted } = flow;
    fs.writeFileSync(path.join(getStateDir(), 'flow.json'), JSON.stringify(persisted, null, 2));
  }

  static async updateFlowRun(mutator: (flow: FlowRun) => FlowRun | void | Promise<FlowRun | void>): Promise<FlowRun> {
    const previous = SessionStore.flowUpdateLock;
    let release!: () => void;
    SessionStore.flowUpdateLock = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previous;
    try {
      const flow = SessionStore.loadFlowRun();
      if (!flow) {
        throw new Error('No active flow state found.');
      }

      const mutated = await mutator(flow);
      const nextFlow = mutated ?? flow;
      SessionStore.saveFlowRun(nextFlow);
      return nextFlow;
    } finally {
      release();
    }
  }

  static loadFlowRun(): FlowRun | null {
    const p = path.join(getStateDir(), 'flow.json');
    if (!fs.existsSync(p)) return null;
    const flow = JSON.parse(fs.readFileSync(p, 'utf8')) as FlowRun;

    if (flow.stateVersion !== '7') {
      throw new Error(
        `Unsupported persisted flow state version "${String((flow as any).stateVersion ?? 'missing')}". ` +
        'This runtime only supports flow state version "7".'
      );
    }

    if (!flow.workspaceRoot || !flow.recordFolderPath) {
      throw new Error('Persisted flow state is missing required workspaceRoot or recordFolderPath fields.');
    }
    const repairedRecordFolderPath = repairMovedRecordFolder(flow);
    if (repairedRecordFolderPath && repairedRecordFolderPath !== flow.recordFolderPath) {
      flow.recordFolderPath = repairedRecordFolderPath;
      SessionStore.saveFlowRun(flow);
    }
    if (fs.existsSync(flow.recordFolderPath)) {
      const metadata = syncRecordMetadataFromWorkflow(flow.recordFolderPath, flow.flowId);
      if (metadata.name) {
        flow.recordName = metadata.name;
      } else {
        delete flow.recordName;
      }
      if (metadata.summary) {
        flow.recordSummary = metadata.summary;
      } else {
        delete flow.recordSummary;
      }
    }
    if (!Array.isArray(flow.readyNodes)) {
      throw new Error('Persisted flow state is missing readyNodes.');
    }
    if (!Array.isArray(flow.runningNodes)) {
      throw new Error('Persisted flow state is missing runningNodes.');
    }
    if (!flow.awaitingHumanNodes || typeof flow.awaitingHumanNodes !== 'object') {
      throw new Error('Persisted flow state is missing awaitingHumanNodes.');
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
