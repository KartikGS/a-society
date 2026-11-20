import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import * as SessionStore from '../../src/orchestration/store.js';
import { setWorkspaceRoot } from '../../src/common/workspace.js';
import { scaffoldFromManifestFile } from '../../src/framework-services/scaffolding-system.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import { createRuntimeSessionCommands } from '../../src/server/runtime-session/commands.js';
import { AWAITING_HUMAN_REASON, HANDOFF_APPROVAL_DECISION } from '../../shared/protocol-constants.js';
import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
import type { FlowRef, FlowRun } from '../../src/common/types.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import { listenOnLocalhost, seedTestModelSettings } from './settings-test-utils.js';

/**
 * A last owner node flagged `human-colab: true` must not close the forward pass on its
 * own: a valid closure is staged for the operator, and `flow.forward_pass_closed` is
 * emitted only when the operator approves it.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frameworkRoot = path.resolve(__dirname, '../../..');
const projectNamespace = 'test-project';
const flowId = 'closure-gate-flow';
const ref = { projectNamespace, flowId };

const CLOSE = '```handoff\ntype: forward-pass-closed\nartifact_path: closure.md\n```';
const PROMPT_HUMAN = '```handoff\ntype: prompt-human\n```';

interface Fixture {
  tmpBase: string;
  workspaceRoot: string;
  server: http.Server;
  /** Replies for successive model requests; the last one repeats. */
  replies: string[];
  requests: number;
}

const fixtures: Fixture[] = [];

afterEach(() => {
  for (const fixture of fixtures.splice(0)) {
    fixture.server.close();
    fs.rmSync(fixture.tmpBase, { recursive: true, force: true });
  }
});

async function setupFixture(humanColab: boolean, replies: string[]): Promise<Fixture> {
  const fixture = { replies, requests: 0 } as Fixture;
  fixture.server = http.createServer((_req, res) => {
    const reply = fixture.replies[Math.min(fixture.requests, fixture.replies.length - 1)];
    fixture.requests += 1;
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: `Done. ${reply}` } }] })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  });
  const port = await listenOnLocalhost(fixture.server);

  fixture.tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'human-colab-closure-gate-'));
  const workspaceRoot = fixture.workspaceRoot = fixture.tmpBase;
  setWorkspaceRoot(workspaceRoot);
  const testDir = path.join(workspaceRoot, projectNamespace);
  fs.mkdirSync(testDir);
  fs.mkdirSync(path.join(workspaceRoot, '.a-society', 'state'), { recursive: true });
  const aSocietyRoot = path.join(workspaceRoot, 'a-society');
  fs.symlinkSync(frameworkRoot, aSocietyRoot, 'dir');
  const scaffold = scaffoldFromManifestFile(
    testDir,
    projectNamespace,
    aSocietyRoot,
    path.join(aSocietyRoot, 'runtime', 'contracts', 'a-docs-manifest.yaml')
  );
  if (scaffold.failed.length > 0) throw new Error('Failed to scaffold fixture a-docs.');
  seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: `http://127.0.0.1:${port}/v1` });

  const recordPath = getFlowRecordDir(ref);
  fs.mkdirSync(recordPath, { recursive: true });
  const aDocs = path.join(testDir, 'a-docs');
  const ownerDir = path.join(aDocs, 'roles', 'owner');
  for (const dir of [ownerDir, path.join(aDocs, 'indexes'), path.join(aDocs, 'workflow'), path.join(aDocs, 'improvement')]) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(ownerDir, 'required-readings.yaml'), 'role: owner\nrequired_readings:\n  - $A_SOCIETY_AGENTS\n  - $TEST_PROJECT_OWNER_ROLE\n');
  fs.writeFileSync(path.join(ownerDir, 'main.md'), 'Owner Role Doc');
  fs.writeFileSync(path.join(ownerDir, 'ownership.yaml'), 'role: owner\nsurfaces: []\n');
  fs.writeFileSync(path.join(aDocs, 'agents.md'), 'Hello Agents');
  fs.writeFileSync(path.join(aDocs, 'indexes', 'main.md'),
    '| `$A_SOCIETY_AGENTS` | `a-docs/agents.md` |\n| `$TEST_PROJECT_OWNER_ROLE` | `a-docs/roles/owner/main.md` |\n');
  fs.writeFileSync(path.join(aDocs, 'a-society-version.md'), '---\na_society_version: "0.2.0"\n---\n# A-Society Version Record\n');
  fs.writeFileSync(path.join(aDocs, 'improvement', 'meta-analysis.md'), 'Meta-analysis instructions');
  fs.writeFileSync(path.join(aDocs, 'improvement', 'feedback.md'), 'Feedback instructions');
  const workflowGraph = `workflow:
  name: closure-gate-flow
  nodes:
    - id: start
      role: 'owner'${humanColab ? '\n      human-colab: true' : ''}
  edges: []
`;
  fs.writeFileSync(path.join(aDocs, 'workflow', 'main.yaml'), workflowGraph);
  fs.writeFileSync(path.join(recordPath, 'workflow.yaml'), workflowGraph);
  fs.writeFileSync(path.join(recordPath, 'closure.md'), 'Closure artifact.');

  SessionStore.init();
  SessionStore.saveFlowRun({
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordPath,
    runningNodes: ['start'],
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
  });
  fixtures.push(fixture);
  return fixture;
}

function flow(): FlowRun {
  return SessionStore.loadFlowRun(ref)!;
}

async function waitUntil(predicate: () => boolean, timeoutMs = 5_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error(`Timed out waiting for flow state: ${JSON.stringify(flow()?.awaitingHumanNodes)}`);
    await new Promise<void>((resolve) => setTimeout(resolve, 5));
  }
}

/** Runs the stored flow in the background; `stop` ends the runner without changing the flow's resulting state. */
function startRunner(orchestrator: FlowOrchestrator) {
  const run = orchestrator.runStoredFlow(projectNamespace, flowId);
  return {
    run,
    async stop(): Promise<void> {
      const before = flow().status;
      if (before === 'running') {
        await SessionStore.updateFlowRun((latest) => { latest.status = 'completed'; }, ref);
      }
      orchestrator.wake();
      await run;
      if (before === 'running') {
        await SessionStore.updateFlowRun((latest) => { latest.status = 'running'; }, ref);
      }
    },
  };
}

const isStaged = () => flow().awaitingHumanNodes['start']?.reason === AWAITING_HUMAN_REASON.CLOSURE_APPROVAL;

function closedEvents(sink: RecordingOperatorSink) {
  return sink.events.filter((event) => event.kind === 'flow.forward_pass_closed');
}

function commandsFor(orchestrator: FlowOrchestrator) {
  const errors: string[] = [];
  const activeSessions = new Map<string, any>([[`${projectNamespace}/${flowId}`, { flowRef: ref, orchestrator, finished: false }]]);
  const commands = createRuntimeSessionCommands({
    activeSessions,
    readFlowRun: (flowRef: FlowRef) => SessionStore.loadFlowRun(flowRef),
    resolveWorkflow: () => null,
    emitFlowState: () => {},
    broadcastToFlow: (_ref: FlowRef, message: { type: string; message?: string }) => {
      if (message.type === 'error') errors.push(message.message ?? '');
    },
  } as any);
  return { commands, errors };
}

describe('human-colab closure gate', () => {
  it('stages a valid closure and closes the forward pass once on approval', async () => {
    await setupFixture(true, [CLOSE]);
    const sink = new RecordingOperatorSink();
    const orchestrator = new FlowOrchestrator(sink);
    const runner = startRunner(orchestrator);
    try {
      await waitUntil(isStaged);
      const staged = flow();
      expect(staged.status).toBe('running');
      expect(staged.improvementPhase).toBeUndefined();
      expect(staged.runningNodes).toEqual([]);
      expect(staged.pendingClosureApproval).toMatchObject({ nodeId: 'start', artifactPath: 'closure.md' });
      expect(closedEvents(sink)).toHaveLength(0);
      expect(sink.events.filter((event) => event.kind === 'human.awaiting_input' && event.reason === AWAITING_HUMAN_REASON.CLOSURE_APPROVAL))
        .toHaveLength(1);

      await orchestrator.approveForwardPassClosure(staged, 'start');
      orchestrator.wake();
      await runner.run;

      const closed = flow();
      expect(closed.status).toBe('awaiting_improvement_choice');
      expect(closed.pendingClosureApproval).toBeUndefined();
      expect(closed.awaitingHumanNodes).toEqual({});
      expect(closedEvents(sink)).toHaveLength(1);
    } finally {
      await runner.stop();
    }
  });

  it('parks a declined closure for guidance, and the Owner closes again into a new staged closure', async () => {
    const fixture = await setupFixture(true, [CLOSE]);
    const sink = new RecordingOperatorSink();
    const orchestrator = new FlowOrchestrator(sink);
    const runner = startRunner(orchestrator);
    try {
      await waitUntil(isStaged);
      const { commands, errors } = commandsFor(orchestrator);
      await commands.handleHandoffApproval(ref, 'start', HANDOFF_APPROVAL_DECISION.DECLINE);
      expect(errors).toEqual([]);
      const declined = flow();
      expect(declined.awaitingHumanNodes['start']).toEqual({ role: 'owner', reason: AWAITING_HUMAN_REASON.PROMPT_HUMAN });
      expect(declined.pendingClosureApproval).toBeUndefined();
      expect(fixture.requests).toBe(1);

      await SessionStore.updateFlowRun((latest) => {
        latest.pendingHumanInputs['start'] = { text: 'Add a risks section first.', receivedAt: new Date().toISOString() };
      }, ref);
      orchestrator.wake();
      await waitUntil(() => isStaged() && fixture.requests === 2);
      expect(flow().pendingClosureApproval).toMatchObject({ nodeId: 'start', artifactPath: 'closure.md' });
      expect(closedEvents(sink)).toHaveLength(0);
    } finally {
      await runner.stop();
    }
  });

  it('closes immediately without staging when the node is not human-colab', async () => {
    await setupFixture(false, [CLOSE]);
    const sink = new RecordingOperatorSink();
    await new FlowOrchestrator(sink).runStoredFlow(projectNamespace, flowId);
    const closed = flow();
    expect(closed.status).toBe('awaiting_improvement_choice');
    expect(closed.pendingClosureApproval).toBeUndefined();
    expect(closedEvents(sink)).toHaveLength(1);
    expect(sink.events.some((event) => event.kind === 'human.awaiting_input')).toBe(false);
  });

  it('sends an invalid closure back to the role without staging it', async () => {
    const fixture = await setupFixture(true, [CLOSE, PROMPT_HUMAN]);
    fs.rmSync(path.join(fixture.workspaceRoot, projectNamespace, 'a-docs', 'agents.md'));
    const sink = new RecordingOperatorSink();
    const orchestrator = new FlowOrchestrator(sink);
    const runner = startRunner(orchestrator);
    try {
      await waitUntil(() => flow().awaitingHumanNodes['start']?.reason === AWAITING_HUMAN_REASON.PROMPT_HUMAN);
      expect(sink.events.some((event) => event.kind === 'repair.requested' && event.code === 'runtime_health')).toBe(true);
      expect(flow().pendingClosureApproval).toBeUndefined();
      expect(sink.events.some((event) => event.kind === 'human.awaiting_input' && event.reason === AWAITING_HUMAN_REASON.CLOSURE_APPROVAL))
        .toBe(false);
    } finally {
      await runner.stop();
    }
  });

  it('keeps a staged closure across a restart and approves it through the new orchestrator', async () => {
    const fixture = await setupFixture(true, [CLOSE]);
    const first = startRunner(new FlowOrchestrator(new RecordingOperatorSink()));
    await waitUntil(isStaged);
    await first.stop();
    const before = flow();

    const sink = new RecordingOperatorSink();
    const restarted = new FlowOrchestrator(sink);
    const runner = startRunner(restarted);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
      const idle = flow();
      expect(idle.awaitingHumanNodes).toEqual(before.awaitingHumanNodes);
      expect(idle.pendingClosureApproval).toEqual(before.pendingClosureApproval);
      expect(idle.runningNodes).toEqual([]);
      expect(fixture.requests).toBe(1);

      await restarted.approveForwardPassClosure(idle, 'start');
      restarted.wake();
      await runner.run;
      expect(flow().status).toBe('awaiting_improvement_choice');
      expect(closedEvents(sink)).toHaveLength(1);
    } finally {
      await runner.stop();
    }
  });

  it('refuses approval and keeps the closure staged when health checks now fail', async () => {
    const fixture = await setupFixture(true, [CLOSE]);
    const sink = new RecordingOperatorSink();
    const orchestrator = new FlowOrchestrator(sink);
    const runner = startRunner(orchestrator);
    try {
      await waitUntil(isStaged);
      const staged = flow();
      fs.rmSync(path.join(fixture.workspaceRoot, projectNamespace, 'a-docs', 'agents.md'));

      await expect(orchestrator.approveForwardPassClosure(staged, 'start'))
        .rejects.toThrow(/^The forward pass can no longer close because runtime health checks fail: .+\. Fix the project and approve again, or decline the closure and send the Owner guidance\.$/);
      const after = flow();
      expect(after.awaitingHumanNodes).toEqual(staged.awaitingHumanNodes);
      expect(after.pendingClosureApproval).toEqual(staged.pendingClosureApproval);
      expect(after.status).toBe('running');
      expect(closedEvents(sink)).toHaveLength(0);
    } finally {
      await runner.stop();
    }
  });
});
