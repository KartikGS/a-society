import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FlowRun, RoleSession, TurnRecord, TriggerRecord } from './types.js';

// Get the current directory of this module, then resolve up to runtime/.state
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getStateDir() {
  if (process.env.A_SOCIETY_STATE_DIR) {
    return path.resolve(process.env.A_SOCIETY_STATE_DIR);
  }
  return path.resolve(__dirname, '../../runtime/.state');
}

function getSessionsDir(stateDir: string) { return path.join(stateDir, 'sessions'); }
function getTurnsDir(stateDir: string) { return path.join(stateDir, 'turns'); }
function getTriggersDir(stateDir: string) { return path.join(stateDir, 'triggers'); }

export class SessionStore {
  static init() {
    const stateDir = getStateDir();
    [stateDir, getSessionsDir(stateDir), getTurnsDir(stateDir), getTriggersDir(stateDir)].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  static saveFlowRun(flow: FlowRun) {
    const flowToSave = { ...flow } as FlowRun & { projectRoot?: string };
    delete flowToSave.projectRoot;
    fs.writeFileSync(path.join(getStateDir(), 'flow.json'), JSON.stringify(flowToSave, null, 2));
  }

  static loadFlowRun(): FlowRun | null {
    const p = path.join(getStateDir(), 'flow.json');
    if (!fs.existsSync(p)) return null;
    const flow = JSON.parse(fs.readFileSync(p, 'utf8')) as FlowRun & { projectRoot?: string };
    if (!flow.stateVersion) {
      // State version absent — pre-versioning state ("1"). Compatible with current schema.
      // improvementPhase will be undefined (correct initial state). No data loss.
      flow.stateVersion = '1';
    }

    if (!flow.workspaceRoot && flow.projectRoot) {
      flow.workspaceRoot = flow.projectRoot;
    }

    // Silently migrate v1-v3 state to v4:
    // - initialize empty role-continuity ledger when absent
    // - rename projectRoot -> workspaceRoot
    // Node-keyed session transcripts remain valid and unchanged.
    if (flow.stateVersion === '1' || flow.stateVersion === '2' || flow.stateVersion === '3') {
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
      flow.stateVersion = '4';
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

  static saveTurnRecord(logicalSessionId: string, turn: TurnRecord) {
    const turnsDir = getTurnsDir(getStateDir());
    const sessionTurnsDir = path.join(turnsDir, logicalSessionId);
    if (!fs.existsSync(sessionTurnsDir)) {
      fs.mkdirSync(sessionTurnsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(sessionTurnsDir, `${turn.turnNumber}.json`), JSON.stringify(turn, null, 2));
  }

  static saveTriggerRecord(flowRunId: string, trigger: TriggerRecord) {
    const triggersDir = getTriggersDir(getStateDir());
    const flowTriggersDir = path.join(triggersDir, flowRunId);
    if (!fs.existsSync(flowTriggersDir)) {
      fs.mkdirSync(flowTriggersDir, { recursive: true });
    }
    const ts = Date.now();
    fs.writeFileSync(path.join(flowTriggersDir, `${ts}-${trigger.toolComponent.replace(/\s+/g, '-')}.json`), JSON.stringify(trigger, null, 2));
  }
}
