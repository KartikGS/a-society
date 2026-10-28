/**
 * Integration test: forward-pass role turns on a host agent (agent mode).
 *
 * Drives the production orchestrator path against the fake `claude` CLI, with no
 * model configured. Covers:
 *
 *  1. Linear handoff: one host conversation per role, prompt by stdin, bundle by file
 *  2. prompt-human resume (new orchestrator, cold): same conversation, only the reply is sent
 *  3. Handoff repair loop: the repair message is the only text sent on the retry
 *  4. workflow.yaml left invalid after a turn: repair before the handoff is applied
 *  5. Permission denial: granted → retry with the new grant; denied → node parks
 *  6. Stop mid-turn, then resume: delivered messages are never re-sent
 *  7. Lost host conversation: a new conversation seeded with the runtime transcript
 *  8. Readiness: an unsupported host version refuses the turn
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import * as SessionStore from '../../src/orchestration/store.js';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { getFlowRecordDir, getRoleStateFilePath } from '../../src/orchestration/state-paths.js';
import { updateAgentModeSettings } from '../../src/settings/settings-store.js';
import { clearProbeCache } from '../../src/providers/host-agents/version.js';
import { HOST_RECOVERY_PREAMBLE, HOST_SYSTEM_PROMPT_FILE } from '../../src/common/host-role-turn.js';
import { CONSENT_CHECK_RESULT, CURRENT_FLOW_STATE_VERSION, defaultConsentState } from '../../src/common/types.js';
import type { ConsentCheckRequest, ConsentCheckResult, ConsentGate, FlowRun } from '../../src/common/types.js';
import { AWAITING_HUMAN_REASON } from '../../shared/protocol-constants.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';

const FAKE_CLAUDE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../providers/host-agents/fake-claude.mjs');
const projectNamespace = 'host-proj';
const flowId = 'host-flow';
const ref = { projectNamespace, flowId };

const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-agent-mode-'));
const projectRoot = path.join(workspaceRoot, projectNamespace);
const fakeState = path.join(workspaceRoot, 'fake-claude-state');
const scriptFile = path.join(workspaceRoot, 'fake-claude-script.json');
const savedEnv = { ...process.env };

const workflow = `workflow:
  name: host-flow
  nodes:
    - id: owner-intake
      role: owner
    - id: ta
      role: ta
  edges:
    - from: owner-intake
      to: ta
`;

let recordDir: string;
let artifact: string;
let artifactRel: string;

function handoffTo(target: string, artifactPath: string): string {
  return `Done.\n\`\`\`handoff\ntarget_node_id: '${target}'\nartifact_path: '${artifactPath}'\n\`\`\``;
}

const PROMPT_HUMAN = 'Need input.\n```handoff\ntype: prompt-human\n```';

function seedProject(): void {
  const rolesDir = path.join(projectRoot, 'a-docs', 'roles');
  for (const role of ['owner', 'ta']) {
    fs.mkdirSync(path.join(rolesDir, role), { recursive: true });
    fs.writeFileSync(path.join(rolesDir, role, 'required-readings.yaml'), `role: ${role}\nrequired_readings: []\n`);
    fs.writeFileSync(path.join(rolesDir, role, 'main.md'), `${role} role`);
    fs.writeFileSync(path.join(rolesDir, role, 'ownership.yaml'), `role: ${role}\nsurfaces: []\n`);
  }
  fs.mkdirSync(path.join(projectRoot, 'a-docs', 'indexes'), { recursive: true });
  fs.writeFileSync(path.join(projectRoot, 'a-docs', 'indexes', 'main.md'), '');
}

function writeScript(turns: unknown[]): void {
  fs.writeFileSync(scriptFile, JSON.stringify({ turns }));
}

interface Invocation { args: string[]; stdin: string; cwd: string }

function invocations(): Invocation[] {
  const file = path.join(fakeState, 'invocations.jsonl');
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line) as Invocation);
}

function flagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
}

function flagValues(args: string[], flag: string): string[] {
  const start = args.indexOf(flag) + 1;
  if (start === 0) return [];
  const end = args.findIndex((arg, index) => index >= start && arg.startsWith('--'));
  return args.slice(start, end === -1 ? undefined : end);
}

function conversationOf(invocation: Invocation): string | undefined {
  return flagValue(invocation.args, '--resume') ?? flagValue(invocation.args, '--session-id');
}

function saveFlow(overrides: Partial<FlowRun> = {}): void {
  SessionStore.saveFlowRun({
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordDir,
    runningNodes: ['owner-intake'],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    pendingHandoffApprovals: {},
    completedHandoffs: [],
    visitedNodeIds: [],
    receivingHandoff: {},
    historyHandoff: {},
    awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
    turnBackend: { kind: 'host', agentId: 'claude-code' },
    ...overrides,
  });
}

async function waitUntil(predicate: () => boolean, timeoutMs = 15_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() >= deadline) {
      const flow = SessionStore.loadFlowRun(ref);
      throw new Error(`Timed out waiting for flow state: ${JSON.stringify({ awaiting: flow?.awaitingHumanNodes, running: flow?.runningNodes, hostCalls: invocations().length })}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

async function runUntil(
  predicate: (flow: FlowRun) => boolean,
  options: { orchestrator?: FlowOrchestrator; consentGate?: ConsentGate; whileRunning?: (o: FlowOrchestrator) => Promise<void> } = {}
): Promise<{ sink: RecordingOperatorSink; flow: FlowRun }> {
  const sink = new RecordingOperatorSink();
  const orchestrator = options.orchestrator ?? new FlowOrchestrator(sink);
  const run = orchestrator.runStoredFlow(projectNamespace, flowId, undefined, options.consentGate);
  try {
    if (options.whileRunning) await options.whileRunning(orchestrator);
    await waitUntil(() => predicate(SessionStore.loadFlowRun(ref)!));
  } finally {
    // Completing the flow ends the run loop; restore it so a later run can resume the flow.
    await SessionStore.updateFlowRun((flow) => { flow.status = 'completed'; }, ref);
    orchestrator.wake();
    await run;
    await SessionStore.updateFlowRun((flow) => { flow.status = 'running'; }, ref);
  }
  return { sink, flow: SessionStore.loadFlowRun(ref)! };
}

const awaiting = (nodeId: string) => (flow: FlowRun) => Boolean(flow.awaitingHumanNodes[nodeId]);

function session(role: string) {
  return SessionStore.loadRoleSession(role, ref)!;
}

class RecordingConsentGate implements ConsentGate {
  readonly requests: ConsentCheckRequest[] = [];
  constructor(private readonly decision: ConsentCheckResult) {}
  async check(request: ConsentCheckRequest): Promise<ConsentCheckResult> {
    this.requests.push(request);
    return this.decision;
  }
  respond(): void {}
  setMode(): void {}
  getState() { return defaultConsentState(); }
  getInFlightRequests() { return []; }
}

beforeEach(() => {
  setWorkspaceRoot(workspaceRoot);
  fs.rmSync(path.join(workspaceRoot, '.a-society'), { recursive: true, force: true });
  fs.rmSync(fakeState, { recursive: true, force: true });
  fs.rmSync(projectRoot, { recursive: true, force: true });
  seedProject();
  updateAgentModeSettings({ mode: 'host', hostAgentId: 'claude-code', executablePath: FAKE_CLAUDE });
  clearProbeCache();
  SessionStore.init();
  recordDir = getFlowRecordDir(ref);
  fs.mkdirSync(recordDir, { recursive: true });
  fs.writeFileSync(path.join(recordDir, 'workflow.yaml'), workflow);
  artifact = path.join(recordDir, '01-owner-brief.md');
  artifactRel = path.relative(workspaceRoot, artifact);
  process.env.FAKE_CLAUDE_STATE = fakeState;
  process.env.FAKE_CLAUDE_SCRIPT = scriptFile;
  delete process.env.FAKE_CLAUDE_VERSION;
});

afterEach(() => {
  process.env = { ...savedEnv };
});

afterAll(() => {
  fs.rmSync(workspaceRoot, { recursive: true, force: true });
  clearWorkspaceRoot();
});

describe('agent mode forward pass', { timeout: 30_000 }, () => {
  it('hands off between roles, one host conversation per role, with no model configured', async () => {
    writeScript([
      { reply: handoffTo('ta', artifactRel), writeFiles: [{ path: artifact, content: 'Brief.' }] },
      { reply: PROMPT_HUMAN },
    ]);
    saveFlow();

    const { flow, sink } = await runUntil(awaiting('ta'), { consentGate: new RecordingConsentGate(CONSENT_CHECK_RESULT.PROCEED) });

    expect(flow.completedHandoffs).toContain('owner-intake=>ta');
    const [owner, ta] = invocations();
    expect(invocations()).toHaveLength(2);

    expect(owner.args).toContain('--session-id');
    expect(fs.realpathSync(owner.cwd)).toBe(fs.realpathSync(projectRoot));
    expect(flagValues(owner.args, '--add-dir')).toEqual([path.resolve(recordDir)]);
    expect(flagValues(owner.args, '--allowedTools')).toEqual([`Read(/${workspaceRoot}/**)`]);
    expect(flagValue(owner.args, '--permission-mode')).toBe('default');

    const promptFile = getRoleStateFilePath(ref, 'owner', HOST_SYSTEM_PROMPT_FILE);
    expect(flagValue(owner.args, '--append-system-prompt-file')).toBe(promptFile);
    expect(fs.readFileSync(promptFile, 'utf8')).toBe(session('owner').systemPrompt);
    expect(owner.args.join(' ')).not.toContain(owner.stdin);

    expect(conversationOf(ta)).not.toBe(conversationOf(owner));
    expect(session('owner').hostSession?.conversationId).toBe(conversationOf(owner));
    expect(session('owner').transcriptHistory.at(-1)).toEqual({ role: 'assistant', content: handoffTo('ta', artifactRel) });
    expect(sink.events).toContainEqual({ kind: 'usage.host_rate_limit', role: 'owner', fiveHour: 0.1, sevenDay: 0.05 });
  });

  it('resumes the same conversation after prompt-human, sending only the reply, from a fresh orchestrator', async () => {
    writeScript([
      { reply: PROMPT_HUMAN },
      { reply: handoffTo('ta', artifactRel), writeFiles: [{ path: artifact, content: 'Brief.' }] },
      { reply: PROMPT_HUMAN },
    ]);
    saveFlow();
    await runUntil(awaiting('owner-intake'));

    await SessionStore.updateFlowRun((flow) => {
      flow.pendingHumanInputs['owner-intake'] = { text: 'Use the short format.', receivedAt: new Date().toISOString() };
    }, ref);
    await runUntil(awaiting('ta'));

    const [first, second] = invocations();
    expect(second.args).toContain('--resume');
    expect(conversationOf(second)).toBe(conversationOf(first));
    expect(second.stdin).toBe('Use the short format.');
    expect(flagValue(second.args, '--append-system-prompt-file')).toBe(flagValue(first.args, '--append-system-prompt-file'));
  });

  it('sends only the repair message when the reply has no handoff', async () => {
    writeScript([
      { reply: 'I forgot the handoff block.' },
      { reply: handoffTo('ta', artifactRel), writeFiles: [{ path: artifact, content: 'Brief.' }] },
      { reply: PROMPT_HUMAN },
    ]);
    saveFlow();

    const { sink } = await runUntil(awaiting('ta'));

    const [first, repair] = invocations();
    expect(conversationOf(repair)).toBe(conversationOf(first));
    expect(repair.stdin).not.toContain(first.stdin);
    expect(repair.stdin.length).toBeGreaterThan(0);
    expect(sink.events.some((event) => event.kind === 'repair.requested' && event.nodeId === 'owner-intake')).toBe(true);
  });

  it('asks for a workflow repair when a turn leaves workflow.yaml invalid', async () => {
    const workflowPath = path.join(recordDir, 'workflow.yaml');
    writeScript([
      { reply: handoffTo('ta', artifactRel), writeFiles: [{ path: workflowPath, content: 'workflow: [' }, { path: artifact, content: 'Brief.' }] },
      { match: 'invalid', reply: handoffTo('ta', artifactRel), writeFiles: [{ path: workflowPath, content: workflow }] },
      { reply: PROMPT_HUMAN },
    ]);
    saveFlow();

    const { sink, flow } = await runUntil(awaiting('ta'));

    const [, repair] = invocations();
    expect(repair.stdin).toContain(`Your changes left ${workflowPath} invalid:`);
    expect(repair.stdin).toContain('YAML parse error');
    expect(sink.events.some((event) => event.kind === 'repair.requested' && event.code === 'workflow_validation')).toBe(true);
    expect(flow.completedHandoffs).toContain('owner-intake=>ta');
  });

  it('retries with the granted permission after a host denial', async () => {
    const target = path.join(projectRoot, 'notes.md');
    writeScript([
      { reply: 'Could not write.', denials: [{ tool_name: 'Write', tool_input: { file_path: target, content: 'x' } }, { tool_name: 'Read', tool_input: { file_path: '/etc/hosts' } }] },
      { match: 'granted permission', reply: handoffTo('ta', artifactRel), writeFiles: [{ path: artifact, content: 'Brief.' }] },
      { reply: PROMPT_HUMAN },
    ]);
    saveFlow();
    const gate = new RecordingConsentGate(CONSENT_CHECK_RESULT.PROCEED);

    await runUntil(awaiting('ta'), { consentGate: gate });

    expect(gate.requests).toEqual([{ toolName: 'write_file', input: { path: path.relative(workspaceRoot, target) }, nodeId: 'owner-intake', role: 'owner' }]);
    const [, retry] = invocations();
    expect(retry.stdin).toContain(`The operator granted permission for: write ${path.relative(workspaceRoot, target)}.`);
    expect(retry.stdin).toContain('updated permissions');
    expect(flagValues(retry.args, '--allowedTools')).toContain(`Edit(/${target})`);
  });

  it('parks the node when the operator denies the permission', async () => {
    writeScript([
      { reply: 'Blocked.', denials: [{ tool_name: 'Bash', tool_input: { command: 'npm test' } }] },
    ]);
    saveFlow();
    const gate = new RecordingConsentGate(CONSENT_CHECK_RESULT.DENY);

    const { flow } = await runUntil(awaiting('owner-intake'), { consentGate: gate });

    expect(flow.awaitingHumanNodes['owner-intake'].reason).toBe(AWAITING_HUMAN_REASON.CONSENT_DENIED);
    expect(invocations()).toHaveLength(1);
  });

  it('never re-sends delivered messages after a stop', async () => {
    writeScript([
      { hang: true },
      { reply: PROMPT_HUMAN },
    ]);
    saveFlow();

    await runUntil(awaiting('owner-intake'), {
      whileRunning: async (orchestrator) => {
        await waitUntil(() => invocations().length === 1 && orchestrator.hasActiveTurn({ nodeId: 'owner-intake' }));
        orchestrator.abortActiveTurn({ nodeId: 'owner-intake' });
      },
    });
    expect(session('owner').hostSession?.deliveredCount).toBe(1);

    await SessionStore.updateFlowRun((flow) => {
      flow.pendingHumanInputs['owner-intake'] = { text: 'Please continue.', receivedAt: new Date().toISOString() };
    }, ref);
    await runUntil((flow) => invocations().length === 2 && Boolean(flow.awaitingHumanNodes['owner-intake']) && !flow.pendingHumanInputs['owner-intake']);

    const [first, second] = invocations();
    expect(conversationOf(second)).toBe(conversationOf(first));
    // The human reply merges into the already-delivered entry message; only the new text is sent.
    expect(second.stdin).toBe('Please continue.');
  });

  it('starts a new conversation seeded with the transcript when the host lost the old one', async () => {
    writeScript([{ reply: PROMPT_HUMAN }]);
    saveFlow({ runningNodes: [], awaitingHumanNodes: { 'owner-intake': { role: 'owner', reason: 'prompt-human' } }, visitedNodeIds: ['owner-intake'] });
    const lostId = '33333333-3333-4333-8333-333333333333';
    SessionStore.saveRoleSession({
      roleName: 'owner',
      logicalSessionId: `${flowId}__owner`,
      transcriptHistory: [
        { role: 'user', content: 'Original entry message.' },
        { role: 'assistant', content: 'Earlier reply.' },
      ],
      isActive: true,
      currentNodeId: 'owner-intake',
      hostSession: { agentId: 'claude-code', conversationId: lostId, deliveredCount: 2, deliveredTailLength: 14, startedAt: '2026-10-01T00:00:00.000Z' },
    }, ref);
    await SessionStore.updateFlowRun((flow) => {
      flow.pendingHumanInputs['owner-intake'] = { text: 'Here is the answer.', receivedAt: new Date().toISOString() };
    }, ref);

    await runUntil((flow) => invocations().length === 2 && Boolean(flow.awaitingHumanNodes['owner-intake']) && !flow.pendingHumanInputs['owner-intake']);

    const [lost, fresh] = invocations();
    expect(flagValue(lost.args, '--resume')).toBe(lostId);
    expect(fresh.args).toContain('--session-id');
    expect(conversationOf(fresh)).not.toBe(lostId);
    expect(fresh.stdin.startsWith(HOST_RECOVERY_PREAMBLE)).toBe(true);
    expect(fresh.stdin).toContain('--- user ---\nOriginal entry message.');
    expect(fresh.stdin).toContain('--- assistant ---\nEarlier reply.');
    expect(fresh.stdin.endsWith('Here is the answer.')).toBe(true);
    expect(session('owner').hostSession?.conversationId).toBe(conversationOf(fresh));
  });

  it('refuses the turn when the installed host version is unsupported', async () => {
    process.env.FAKE_CLAUDE_VERSION = '2.2.0';
    writeScript([{ reply: PROMPT_HUMAN }]);
    saveFlow();

    const { sink, flow } = await runUntil(awaiting('owner-intake'));

    expect(invocations()).toHaveLength(0);
    expect(flow.awaitingHumanNodes['owner-intake'].reason).toBe(AWAITING_HUMAN_REASON.AUTONOMOUS_ABORT);
    expect(sink.errors.some((message) => message.includes('outside the supported range'))).toBe(true);
  });
});
