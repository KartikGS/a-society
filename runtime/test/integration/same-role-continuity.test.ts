/**
 * Integration test: repeated-role session behavior under role-scoped flow sessions.
 *
 * Uses a repeated-role workflow: Owner-intake -> TA -> Owner-gate
 * Covers:
 *
 *  1. Same-node prompt-human resume preserves the existing role-scoped transcript
 *  2. Later same-role node reuses the same role-scoped session and appends a node-transition packet
 *  3. Reopened same-role node keeps the prior role-scoped session and appends a reopen packet
 *  4. Same-role parallel activation is explicitly rejected for now
 */

import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable, Writable, PassThrough } from 'node:stream';
import { FlowOrchestrator, WorkflowError } from '../../src/orchestrator.js';
import { SessionStore } from '../../src/store.js';
import { ContextInjectionService } from '../../src/injection.js';
import { buildForwardNodeEntryMessage } from '../../src/session-entry.js';
import { LLMGateway } from '../../src/llm.js';
import type { FlowRun, ProviderTurnResult, RuntimeMessageParam, ToolDefinition, LLMProvider, TurnOptions } from '../../src/types.js';

// ---- Harness setup ----

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-same-role-'));
const stateDir = path.join(tmpDir, '.state');
const projectNamespace = 'test-proj';
const workspaceRoot = tmpDir;
const namespaceDir = path.join(workspaceRoot, projectNamespace);
const rolesDir = path.join(namespaceDir, 'a-docs', 'roles');
const indexDir = path.join(namespaceDir, 'a-docs', 'indexes');
const recordDir = path.join(namespaceDir, 'records', 'test-flow');

fs.mkdirSync(rolesDir, { recursive: true });
fs.mkdirSync(indexDir, { recursive: true });
fs.mkdirSync(recordDir, { recursive: true });
fs.mkdirSync(stateDir, { recursive: true });
fs.mkdirSync(path.join(rolesDir, 'owner'), { recursive: true });
fs.mkdirSync(path.join(rolesDir, 'ta'), { recursive: true });

fs.writeFileSync(
  path.join(rolesDir, 'owner', 'required-readings.yaml'),
  'role: owner\nrequired_readings: []\n'
);
fs.writeFileSync(
  path.join(rolesDir, 'ta', 'required-readings.yaml'),
  'role: ta\nrequired_readings: []\n'
);
fs.writeFileSync(path.join(rolesDir, 'owner', 'main.md'), 'Owner role');
fs.writeFileSync(path.join(rolesDir, 'ta', 'main.md'), 'TA role');
fs.writeFileSync(path.join(indexDir, 'main.md'), '');

// workflow: owner-intake -> ta -> owner-gate
const workflow = `workflow:
  name: test-flow
  nodes:
    - id: owner-intake
      role: owner
    - id: ta
      role: ta
    - id: owner-gate
      role: owner
  edges:
    - from: owner-intake
      to: ta
    - from: ta
      to: owner-gate
`;
fs.writeFileSync(path.join(recordDir, 'workflow.yaml'), workflow);

const ownerArtifact1 = path.join(recordDir, '01-owner-brief.md');
const taArtifact = path.join(recordDir, '02-ta-design.md');
const reviewFeedbackArtifact = path.join(recordDir, '03-review-feedback.md');
fs.writeFileSync(ownerArtifact1, 'Owner brief content.');
fs.writeFileSync(taArtifact, 'TA design content.');
fs.writeFileSync(reviewFeedbackArtifact, 'Reviewer requests revision to the Owner brief.');

process.env.A_SOCIETY_STATE_DIR = stateDir;

function resetState() {
  fs.rmSync(stateDir, { recursive: true, force: true });
  fs.mkdirSync(stateDir, { recursive: true });
  SessionStore.init();
}

// ---- Mock LLM provider ----

class MockProvider implements LLMProvider {
  private responses: ProviderTurnResult[];
  private callCount = 0;

  constructor(responses: ProviderTurnResult[]) {
    this.responses = responses;
  }

  async executeTurn(
    _system: string,
    _messages: RuntimeMessageParam[],
    _tools?: ToolDefinition[],
    _options?: TurnOptions
  ): Promise<ProviderTurnResult> {
    const res = this.responses[this.callCount % this.responses.length];
    this.callCount++;
    return res;
  }
}

function patchLLM(provider: MockProvider): () => void {
  const original = LLMGateway.prototype.executeTurn;
  LLMGateway.prototype.executeTurn = async function(sys, hist, opts) {
    return original.call(new LLMGateway(tmpDir, provider), sys, hist, opts);
  };
  return () => { LLMGateway.prototype.executeTurn = original; };
}

function ownerSessionId(flowId = 'test-flow-id') {
  return `${flowId}__owner`;
}

function makeFlowRun(overrides: Partial<FlowRun> = {}): FlowRun {
  return {
    flowId: 'test-flow-id',
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordDir,
    activeNodes: ['owner-intake'],
    completedNodes: [],
    completedEdgeArtifacts: {},
    pendingNodeArtifacts: { 'owner-intake': [path.relative(workspaceRoot, ownerArtifact1)] },
    status: 'running',
    stateVersion: '6',
    ...overrides
  };
}

// ---- Test runner ----

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(() => fn())
    .then(() => { console.log(`  ✓ ${name}`); passed++; })
    .catch((err: any) => { console.error(`  ✗ ${name}\n    ${err.message}`); failed++; });
}

async function run() {
  console.log('\nsame-role-continuity integration');

  await test('Context bundle uses RUNTIME-LOADED framing, not MANDATORY CONTEXT LOADING', async () => {
    const { bundleContent } = ContextInjectionService.buildContextBundle(
      projectNamespace,
      'owner',
      workspaceRoot
    );

    assert.ok(bundleContent.includes('RUNTIME-LOADED REQUIRED READING'));
    assert.ok(bundleContent.includes('These files are already loaded into this session by the runtime.'));
    assert.ok(!bundleContent.includes('MANDATORY CONTEXT LOADING'));
  });

  await test('Same-node resume: role-scoped session transcript is preserved intact', async () => {
    resetState();

    const sessionId = ownerSessionId();
    const priorHistory = [
      { role: 'user', content: 'original node entry message' },
      { role: 'assistant', content: 'I will proceed.' }
    ];
    SessionStore.saveRoleSession({
      roleName: 'owner',
      logicalSessionId: sessionId,
      transcriptHistory: priorHistory,
      isActive: true,
      currentNodeId: 'owner-intake'
    });

    const loadedSession = SessionStore.loadRoleSession(sessionId);
    assert.ok(loadedSession !== null, 'Session must be persisted before resume');
    assert.strictEqual(loadedSession!.transcriptHistory.length, 2);
    assert.strictEqual((loadedSession!.transcriptHistory[0] as any).content, 'original node entry message');
    assert.strictEqual(loadedSession!.currentNodeId, 'owner-intake');
  });

  await test('buildForwardNodeEntryMessage: later same-role entry includes transition framing and artifact', async () => {
    const msg = buildForwardNodeEntryMessage({
      nodeId: 'owner-gate',
      role: 'owner',
      workspaceRoot,
      projectNamespace,
      activeArtifacts: [path.relative(workspaceRoot, taArtifact)],
      entryMode: 'role-transition',
      previousNodeId: 'owner-intake'
    });

    assert.ok(msg.includes('continuing the same role-scoped flow session from workflow node owner-intake to owner-gate'));
    assert.ok(msg.includes('TA design content.'));
    assert.ok(!msg.includes('Role continuity from earlier nodes in this flow:'));
  });

  await test('buildForwardNodeEntryMessage: reopened node entry includes reopened framing and artifact', async () => {
    const msg = buildForwardNodeEntryMessage({
      nodeId: 'owner-intake',
      role: 'owner',
      workspaceRoot,
      projectNamespace,
      activeArtifacts: [
        path.relative(workspaceRoot, ownerArtifact1),
        path.relative(workspaceRoot, reviewFeedbackArtifact)
      ],
      entryMode: 'reopened-node',
      previousNodeId: 'owner-intake'
    });

    assert.ok(msg.includes('workflow node has been reopened in the same role-scoped flow session'));
    assert.ok(msg.includes('Owner brief content.'));
    assert.ok(msg.includes('Reviewer requests revision to the Owner brief.'));
  });

  await test('Store: loading a non-v6 flow is rejected', async () => {
    resetState();

    const v5Flow: any = {
      flowId: 'v5-flow',
      workspaceRoot,
      projectNamespace,
      recordFolderPath: recordDir,
      activeNodes: [],
      completedNodes: [],
      completedEdgeArtifacts: {},
      pendingNodeArtifacts: {},
      status: 'completed',
      stateVersion: '5',
    };
    fs.writeFileSync(path.join(stateDir, 'flow.json'), JSON.stringify(v5Flow, null, 2));

    assert.throws(
      () => SessionStore.loadFlowRun(),
      /only supports flow state version "6"/
    );
  });

  await test('Orchestrator: later same-role node reuses role-scoped session and appends transition packet', async () => {
    resetState();

    SessionStore.saveRoleSession({
      roleName: 'owner',
      logicalSessionId: ownerSessionId(),
      transcriptHistory: [
        { role: 'user', content: 'owner-intake entry message' },
        { role: 'assistant', content: 'Owner intake discussion' }
      ],
      isActive: false,
      currentNodeId: 'owner-intake'
    });

    const flowRun = makeFlowRun({
      activeNodes: ['owner-gate'],
      completedNodes: ['owner-intake', 'ta'],
      completedEdgeArtifacts: {
        'owner-intake=>ta': path.relative(workspaceRoot, ownerArtifact1),
        'ta=>owner-gate': path.relative(workspaceRoot, taArtifact)
      },
      pendingNodeArtifacts: {
        'owner-gate': [path.relative(workspaceRoot, taArtifact)]
      }
    });
    SessionStore.saveFlowRun(flowRun);

    const unpatch = patchLLM(new MockProvider([
      { type: 'text', text: 'Need clarification. ```handoff\ntype: prompt-human\n```' }
    ]));

    const orchestrator = new FlowOrchestrator();
    const input = new Readable({ read() {} });
    input.push(null);
    const output = new Writable({ write(_c, _e, cb) { cb(); } });

    try {
      await orchestrator.advanceFlow(flowRun, 'owner-gate', undefined, undefined, input, output);
    } finally {
      unpatch();
    }

    const session = SessionStore.loadRoleSession(ownerSessionId());
    assert.ok(session !== null, 'role-scoped Owner session must be preserved');
    assert.strictEqual((session!.transcriptHistory[0] as any).content, 'owner-intake entry message');

    const transitionMessage = (session!.transcriptHistory as any[])
      .find(message => message.role === 'user' && typeof message.content === 'string' &&
        message.content.includes('continuing the same role-scoped flow session from workflow node owner-intake to owner-gate'));

    assert.ok(transitionMessage, 'expected a role-transition packet in the reused Owner session');
    assert.ok(transitionMessage.content.includes('TA design content.'));
    assert.strictEqual(session!.currentNodeId, 'owner-gate');
  });

  await test('Orchestrator: reopened same-role node keeps prior session and appends reopened packet', async () => {
    resetState();

    SessionStore.saveRoleSession({
      roleName: 'owner',
      logicalSessionId: ownerSessionId(),
      transcriptHistory: [
        { role: 'user', content: 'owner-intake entry message' },
        { role: 'assistant', content: 'Initial owner proposal discussion' }
      ],
      isActive: false,
      currentNodeId: 'owner-intake'
    });

    const flowRun = makeFlowRun({
      activeNodes: ['owner-intake'],
      pendingNodeArtifacts: {
        'owner-intake': [
          path.relative(workspaceRoot, ownerArtifact1),
          path.relative(workspaceRoot, reviewFeedbackArtifact)
        ]
      }
    });
    SessionStore.saveFlowRun(flowRun);

    const unpatch = patchLLM(new MockProvider([
      { type: 'text', text: 'Need clarification. ```handoff\ntype: prompt-human\n```' }
    ]));

    const orchestrator = new FlowOrchestrator();
    const input = new Readable({ read() {} });
    input.push(null);
    const output = new Writable({ write(_c, _e, cb) { cb(); } });

    try {
      await orchestrator.advanceFlow(flowRun, 'owner-intake', undefined, undefined, input, output);
    } finally {
      unpatch();
    }

    const session = SessionStore.loadRoleSession(ownerSessionId());
    assert.ok(session !== null, 'reopened node should keep the prior role-scoped session');

    const reopenedMessage = (session!.transcriptHistory as any[])
      .find(message => message.role === 'user' && typeof message.content === 'string' &&
        message.content.includes('workflow node has been reopened in the same role-scoped flow session'));

    assert.ok(reopenedMessage, 'expected a reopened-node packet in the reused Owner session');
    assert.ok(reopenedMessage.content.includes('Reviewer requests revision to the Owner brief.'));
    assert.strictEqual(session!.currentNodeId, 'owner-intake');
  });

  await test('Orchestrator: same-role parallel activation is rejected', async () => {
    resetState();

    const flowRun = makeFlowRun({
      activeNodes: ['owner-intake', 'owner-gate'],
      pendingNodeArtifacts: {
        'owner-intake': [path.relative(workspaceRoot, ownerArtifact1)],
        'owner-gate': [path.relative(workspaceRoot, taArtifact)]
      }
    });
    SessionStore.saveFlowRun(flowRun);

    const orchestrator = new FlowOrchestrator();
    const input = new PassThrough();
    const output = new Writable({ write(_c, _e, cb) { cb(); } });

    await assert.rejects(
      () => orchestrator.advanceFlow(flowRun, 'owner-intake', undefined, undefined, input, output),
      (error: any) => {
        assert.ok(error instanceof WorkflowError);
        assert.ok(error.message.includes('Unsupported same-role parallel activation'));
        return true;
      }
    );
  });

  console.log(`\n  ${passed} passed, ${failed} failed\n`);

  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.A_SOCIETY_STATE_DIR;

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
