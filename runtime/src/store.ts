import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FlowRun, RoleSession, TurnRecord, TriggerRecord } from './types.js';

// Get the current directory of this module, then resolve up to runtime/.state
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_DIR = path.resolve(__dirname, '../../runtime/.state');
const SESSIONS_DIR = path.join(STATE_DIR, 'sessions');
const TURNS_DIR = path.join(STATE_DIR, 'turns');
const TRIGGERS_DIR = path.join(STATE_DIR, 'triggers');

export class SessionStore {
  static init() {
    [STATE_DIR, SESSIONS_DIR, TURNS_DIR, TRIGGERS_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  static saveFlowRun(flow: FlowRun) {
    fs.writeFileSync(path.join(STATE_DIR, 'flow.json'), JSON.stringify(flow, null, 2));
  }

  static loadFlowRun(): FlowRun | null {
    const p = path.join(STATE_DIR, 'flow.json');
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8')) as FlowRun;
  }

  static saveRoleSession(session: RoleSession) {
    fs.writeFileSync(path.join(SESSIONS_DIR, `${session.logicalSessionId}.json`), JSON.stringify(session, null, 2));
  }

  static loadRoleSession(logicalSessionId: string): RoleSession | null {
    const p = path.join(SESSIONS_DIR, `${logicalSessionId}.json`);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8')) as RoleSession;
  }

  static saveTurnRecord(logicalSessionId: string, turn: TurnRecord) {
    const sessionTurnsDir = path.join(TURNS_DIR, logicalSessionId);
    if (!fs.existsSync(sessionTurnsDir)) {
      fs.mkdirSync(sessionTurnsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(sessionTurnsDir, `${turn.turnNumber}.json`), JSON.stringify(turn, null, 2));
  }

  static saveTriggerRecord(flowRunId: string, trigger: TriggerRecord) {
    const flowTriggersDir = path.join(TRIGGERS_DIR, flowRunId);
    if (!fs.existsSync(flowTriggersDir)) {
      fs.mkdirSync(flowTriggersDir, { recursive: true });
    }
    const ts = Date.now();
    fs.writeFileSync(path.join(flowTriggersDir, `${ts}-${trigger.toolComponent.replace(/\s+/g, '-')}.json`), JSON.stringify(trigger, null, 2));
  }
}
