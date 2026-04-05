import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Get the current directory of this module, then resolve up to runtime/.state
const __dirname = path.dirname(fileURLToPath(import.meta.url));
function getStateDir() {
    if (process.env.A_SOCIETY_STATE_DIR) {
        return path.resolve(process.env.A_SOCIETY_STATE_DIR);
    }
    return path.resolve(__dirname, '../../runtime/.state');
}
function getSessionsDir(stateDir) { return path.join(stateDir, 'sessions'); }
function getTurnsDir(stateDir) { return path.join(stateDir, 'turns'); }
function getTriggersDir(stateDir) { return path.join(stateDir, 'triggers'); }
export class SessionStore {
    static init() {
        const stateDir = getStateDir();
        [stateDir, getSessionsDir(stateDir), getTurnsDir(stateDir), getTriggersDir(stateDir)].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    static saveFlowRun(flow) {
        fs.writeFileSync(path.join(getStateDir(), 'flow.json'), JSON.stringify(flow, null, 2));
    }
    static loadFlowRun() {
        const p = path.join(getStateDir(), 'flow.json');
        if (!fs.existsSync(p))
            return null;
        const flow = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (!flow.stateVersion) {
            // State version absent — pre-versioning state ("1"). Compatible with current schema.
            // improvementPhase will be undefined (correct initial state). No data loss.
            flow.stateVersion = '1';
        }
        return flow;
    }
    static saveRoleSession(session) {
        const sessionsDir = getSessionsDir(getStateDir());
        fs.writeFileSync(path.join(sessionsDir, `${session.logicalSessionId}.json`), JSON.stringify(session, null, 2));
    }
    static loadRoleSession(logicalSessionId) {
        const sessionsDir = getSessionsDir(getStateDir());
        const p = path.join(sessionsDir, `${logicalSessionId}.json`);
        if (!fs.existsSync(p))
            return null;
        return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
    static saveTurnRecord(logicalSessionId, turn) {
        const turnsDir = getTurnsDir(getStateDir());
        const sessionTurnsDir = path.join(turnsDir, logicalSessionId);
        if (!fs.existsSync(sessionTurnsDir)) {
            fs.mkdirSync(sessionTurnsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(sessionTurnsDir, `${turn.turnNumber}.json`), JSON.stringify(turn, null, 2));
    }
    static saveTriggerRecord(flowRunId, trigger) {
        const triggersDir = getTriggersDir(getStateDir());
        const flowTriggersDir = path.join(triggersDir, flowRunId);
        if (!fs.existsSync(flowTriggersDir)) {
            fs.mkdirSync(flowTriggersDir, { recursive: true });
        }
        const ts = Date.now();
        fs.writeFileSync(path.join(flowTriggersDir, `${ts}-${trigger.toolComponent.replace(/\s+/g, '-')}.json`), JSON.stringify(trigger, null, 2));
    }
}
