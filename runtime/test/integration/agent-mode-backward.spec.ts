/**
 * Integration test: backward pass and feedback on a host agent (agent mode).
 *
 * Covers:
 *  1. Meta-analysis resumes the role's own forward-pass host conversation and sends
 *     only the meta-analysis entry; the feedback folder is not writable there.
 *  2. Meta-analysis falls back to a new conversation, seeded with the transcript,
 *     when the host no longer has the forward-pass conversation.
 *  3. Feedback starts a fresh host conversation, and only that session gets the
 *     feedback folder as a writable directory.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FEEDBACK_CONSENT_STATUS, IMPROVEMENT_CHOICE_MODE } from '../../shared/protocol-constants.js';
import { HOST_RECOVERY_PREAMBLE } from '../../src/common/host-role-turn.js';
import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
import type { FlowRun, RoleSession } from '../../src/common/types.js';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { deterministicFindingsFilePath } from '../../src/framework-services/backward-pass-orderer.js';
import { ImprovementOrchestrator } from '../../src/improvement/improvement.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import * as SessionStore from '../../src/orchestration/store.js';
import { saveHostModelSelection } from '../../src/orchestration/host-role-model.js';
import { clearProbeCache } from '../../src/providers/host-agents/version.js';
import { updateAgentModeSettings } from '../../src/settings/settings-store.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';

const FAKE_CLAUDE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../providers/host-agents/fake-claude.mjs');
const projectNamespace = 'host-proj';
const flowId = 'host-backward-flow';
const ref = { projectNamespace, flowId };
const FORWARD_CONVERSATION = '44444444-4444-4444-8444-444444444444';

const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-agent-mode-backward-'));
const fakeState = path.join(workspaceRoot, 'fake-claude-state');
const scriptFile = path.join(workspaceRoot, 'fake-claude-script.json');
const feedbackDir = path.join(workspaceRoot, 'a-society', 'feedback');
const savedEnv = { ...process.env };

let recordDir: string;
let findingsFile: string;
let findingsRel: string;

interface Invocation { args: string[]; stdin: string }

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

function writeScript(turns: unknown[]): void {
  fs.writeFileSync(scriptFile, JSON.stringify({ turns }));
}

function baseFlow(overrides: Partial<FlowRun> = {}): FlowRun {
  return {
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordDir,
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    pendingHandoffApprovals: {},
    visitedNodeIds: ['curator-work'],
    completedHandoffs: [],
    receivingHandoff: {},
    historyHandoff: {},
    awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
    feedbackContext: { kind: 'standard' },
    turnBackend: { kind: 'host', agentId: 'claude-code' },
    ...overrides,
  };
}

/** The curator's forward-pass session, backed by a host conversation the fake host still has. */
function seedForwardSession(hostHasConversation: boolean): void {
  const transcript = [
    { role: 'user', content: 'Forward node entry.' },
    { role: 'assistant', content: 'Forward work done.' },
  ];
  const session: RoleSession = {
    roleName: 'curator',
    logicalSessionId: `${flowId}__curator`,
    transcriptHistory: transcript,
    isActive: false,
    currentNodeId: 'curator-work',
    systemPrompt: 'Curator bundle.',
    hostSession: {
      agentId: 'claude-code',
      conversationId: FORWARD_CONVERSATION,
      deliveredCount: 2,
      deliveredTailLength: 'Forward work done.'.length,
      startedAt: '2026-10-28T00:00:00.000Z',
    },
  };
  SessionStore.saveRoleSession(session, ref);
  if (hostHasConversation) {
    fs.mkdirSync(fakeState, { recursive: true });
    fs.writeFileSync(path.join(fakeState, `${FORWARD_CONVERSATION}.json`), JSON.stringify(transcript));
  }
}

function metaAnalysisTurn() {
  return {
    reply: `Findings saved.\n\`\`\`handoff\ntype: meta-analysis-complete\nfindings_path: ${findingsRel}\n\`\`\``,
    writeFiles: [{ path: findingsFile, content: 'Curator findings.' }],
  };
}

async function runMetaAnalysis(): Promise<RecordingOperatorSink> {
  const flow = baseFlow();
  ImprovementOrchestrator.markAwaitingChoice(flow, true);
  SessionStore.saveFlowRun(flow, ref);
  const sink = new RecordingOperatorSink();
  await new ImprovementOrchestrator().runImprovement(SessionStore.loadFlowRun(ref)!, IMPROVEMENT_CHOICE_MODE.GRAPH_BASED, sink);
  return sink;
}

beforeEach(() => {
  setWorkspaceRoot(workspaceRoot);
  for (const dir of ['.a-society', 'fake-claude-state', 'a-society', projectNamespace]) {
    fs.rmSync(path.join(workspaceRoot, dir), { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(workspaceRoot, projectNamespace, 'a-docs'), { recursive: true });
  fs.mkdirSync(path.join(workspaceRoot, 'a-society', 'runtime', 'contracts'), { recursive: true });
  fs.writeFileSync(path.join(workspaceRoot, 'a-society', 'runtime', 'contracts', 'feedback.md'), 'Runtime feedback instructions');
  updateAgentModeSettings({ mode: 'host', hostAgentId: 'claude-code', executablePath: FAKE_CLAUDE });
  clearProbeCache();
  SessionStore.init();
  recordDir = getFlowRecordDir(ref);
  fs.mkdirSync(recordDir, { recursive: true });
  fs.writeFileSync(
    path.join(recordDir, 'workflow.yaml'),
    'workflow:\n  name: Host backward\n  nodes:\n    - id: curator-work\n      role: curator\n  edges: []\n'
  );
  findingsFile = deterministicFindingsFilePath(recordDir, 'curator');
  findingsRel = path.relative(workspaceRoot, findingsFile);
  process.env.FAKE_CLAUDE_STATE = fakeState;
  process.env.FAKE_CLAUDE_SCRIPT = scriptFile;
});

afterEach(() => {
  process.env = { ...savedEnv };
});

afterAll(() => {
  fs.rmSync(workspaceRoot, { recursive: true, force: true });
  clearWorkspaceRoot();
});

describe('agent mode backward pass', { timeout: 30_000 }, () => {
  it('runs meta-analysis in the role\'s own forward-pass host conversation', async () => {
    seedForwardSession(true);
    writeScript([metaAnalysisTurn()]);

    await runMetaAnalysis();

    const flow = SessionStore.loadFlowRun(ref)!;
    expect(flow.improvementPhase?.completedRoles).toContain('curator');
    expect(flow.status).toBe('awaiting_feedback_consent');

    const [meta] = invocations();
    expect(invocations()).toHaveLength(1);
    expect(flagValue(meta.args, '--resume')).toBe(FORWARD_CONVERSATION);
    expect(meta.stdin).not.toContain('Forward node entry.');
    expect(meta.stdin).toContain(findingsRel);
    expect(flagValues(meta.args, '--add-dir')).toEqual([path.resolve(recordDir)]);
    expect(meta.args).not.toContain('--model');
  });

  it('runs meta-analysis with the role\'s persisted host model selection, without gating', async () => {
    seedForwardSession(true);
    saveHostModelSelection(ref, 'curator', { hostAgentId: 'claude-code', model: 'haiku', effort: 'low', selectedAt: new Date().toISOString() });
    writeScript([metaAnalysisTurn()]);

    const sink = await runMetaAnalysis();

    const [meta] = invocations();
    expect(flagValue(meta.args, '--model')).toBe('haiku');
    expect(flagValue(meta.args, '--effort')).toBe('low');
    expect(sink.requests).toContainEqual({ role: 'curator', provider: 'Claude Code', model: 'Haiku · effort low' });
  });

  it('falls back to a new conversation when the host lost the forward-pass one', async () => {
    seedForwardSession(false);
    writeScript([metaAnalysisTurn()]);

    await runMetaAnalysis();

    const [lost, fresh] = invocations();
    expect(flagValue(lost.args, '--resume')).toBe(FORWARD_CONVERSATION);
    expect(fresh.args).toContain('--session-id');
    expect(fresh.stdin.startsWith(HOST_RECOVERY_PREAMBLE)).toBe(true);
    expect(fresh.stdin).toContain('--- assistant ---\nForward work done.');
    expect(SessionStore.loadFlowRun(ref)!.improvementPhase?.completedRoles).toContain('curator');
  });

  it('runs feedback in a fresh conversation that alone can write the feedback folder', async () => {
    fs.mkdirSync(path.dirname(findingsFile), { recursive: true });
    fs.writeFileSync(findingsFile, 'Curator findings.');
    const feedbackRel = `a-society/feedback/${projectNamespace}-flow-${flowId}.md`;
    const flow = baseFlow({ status: 'awaiting_feedback_consent' });
    flow.improvementPhase = {
      status: 'awaiting_feedback_consent',
      mode: IMPROVEMENT_CHOICE_MODE.GRAPH_BASED,
      completedRoles: ['curator'],
      runningRoles: [],
      awaitingHumanRoles: {},
      pendingHumanInputs: {},
      findingsProduced: { curator: findingsRel },
      feedbackArtifactPath: feedbackRel,
      feedbackConsent: FEEDBACK_CONSENT_STATUS.PENDING,
    };
    SessionStore.saveFlowRun(flow, ref);
    writeScript([{
      reply: `Feedback written.\n\`\`\`handoff\ntype: backward-pass-complete\nartifact_path: ${feedbackRel}\n\`\`\``,
      writeFiles: [{ path: path.join(workspaceRoot, feedbackRel), content: 'Upstream feedback.' }],
    }]);

    await new ImprovementOrchestrator().runFeedback(SessionStore.loadFlowRun(ref)!, new RecordingOperatorSink());

    const finalFlow = SessionStore.loadFlowRun(ref)!;
    expect(finalFlow.status).toBe('completed');
    expect(finalFlow.improvementPhase?.completedRoles).toContain('a-society-feedback');

    const [feedback] = invocations();
    expect(feedback.args).toContain('--session-id');
    expect(flagValues(feedback.args, '--add-dir')).toEqual([path.resolve(recordDir), feedbackDir]);
    const feedbackSession = SessionStore.loadRoleSession('a-society-feedback', ref)!;
    expect(feedbackSession.hostSession?.conversationId).toBe(flagValue(feedback.args, '--session-id'));
  });
});
