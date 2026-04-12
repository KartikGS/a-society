/**
 * Integration test: same-role session continuity behaviors.
 *
 * Uses a repeated-role workflow: Owner-intake → TA → Owner-gate
 * Covers four behaviors from the approved Phase 0 design:
 *
 *  1. Fresh Owner bootstrap uses the explicit Owner message (not empty-history auto-seed)
 *  2. Same-node prompt-human resume preserves transcript continuity
 *  3. Later same-role node (Owner-gate) receives continuity summary + current task input
 *  4. Same-role parallel activation omits continuity summary (isolation preserved)
 *
 * The unit-level checks (tests 1-7) prove helper/store contracts.
 * The orchestrator-seam checks (tests 8-10) prove that the orchestrator wires
 * these contracts correctly by running advanceFlow against a mock LLM.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable, Writable, PassThrough } from 'node:stream';
import { FlowOrchestrator } from '../../src/orchestrator.js';
import { SessionStore } from '../../src/store.js';
import { ContextInjectionService } from '../../src/injection.js';
import { buildOwnerBootstrapMessage, buildForwardNodeEntryMessage } from '../../src/session-entry.js';
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

fs.writeFileSync(
  path.join(rolesDir, 'required-readings.yaml'),
  `universal: []\nroles:\n  owner: []\n  ta: []\n`
);
fs.writeFileSync(path.join(indexDir, 'main.md'), '');

// workflow: owner-intake -> ta -> owner-gate
const workflow = `---
workflow:
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
---
`;
fs.writeFileSync(path.join(recordDir, 'workflow.md'), workflow);

const ownerArtifact1 = path.join(recordDir, '01-owner-brief.md');
const taArtifact = path.join(recordDir, '02-ta-design.md');
fs.writeFileSync(ownerArtifact1, 'Owner brief content.');
fs.writeFileSync(taArtifact, 'TA design content.');

process.env.A_SOCIETY_STATE_DIR = stateDir;

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

// ---- Helper: build a flowRun at the specified node ----

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
    stateVersion: '5',
    roleContinuity: {},
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

  // ---- Unit-level helper and store contract tests ----

  await test('Fresh Owner bootstrap message matches approved text', async () => {
    const msg = buildOwnerBootstrapMessage();

    assert.ok(msg.includes('A fresh interactive Owner session has started.'));
    assert.ok(msg.includes('The runtime already loaded your required-reading authority files into context.'));
    assert.ok(msg.includes('type: prompt-human'));
    assert.ok(!msg.includes('Read the project log'));
    assert.ok(!msg.includes('Read $A_SOCIETY'));
  });

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

  await test('Same-node resume: existing session transcript is preserved intact', async () => {
    SessionStore.init();

    const sessionId = 'test-flow-id__owner-intake';
    const priorHistory = [
      { role: 'user', content: 'original node entry message' },
      { role: 'assistant', content: 'I will proceed.' }
    ];
    SessionStore.saveRoleSession({
      roleName: 'owner',
      logicalSessionId: sessionId,
      transcriptHistory: priorHistory,
      isActive: true
    });

    const loadedSession = SessionStore.loadRoleSession(sessionId);
    assert.ok(loadedSession !== null, 'Session must be persisted before resume');
    assert.strictEqual(loadedSession!.transcriptHistory.length, 2);

    const historyAfterLoad = [...(loadedSession!.transcriptHistory as any[])];
    assert.strictEqual((historyAfterLoad[0] as any).content, 'original node entry message');

    const sessFile = path.join(stateDir, 'sessions', `${sessionId}.json`);
    if (fs.existsSync(sessFile)) fs.unlinkSync(sessFile);
  });

  await test('buildForwardNodeEntryMessage: later same-role entry includes continuity and artifact', async () => {
    const msg = buildForwardNodeEntryMessage({
      nodeId: 'owner-gate',
      role: 'owner',
      workspaceRoot,
      activeArtifacts: [path.relative(workspaceRoot, taArtifact)],
      continuityEntries: [
        { nodeId: 'owner-intake', outputArtifactPath: path.relative(workspaceRoot, ownerArtifact1) }
      ]
    });

    assert.ok(msg.includes('This is a workflow node entry, not a fresh role-orientation session.'));
    assert.ok(msg.includes('Role continuity from earlier nodes in this flow:'));
    assert.ok(msg.includes('owner-intake ->'));
    assert.ok(msg.includes('TA design content.'));
    assert.ok(!msg.includes('A fresh interactive Owner session has started.'));
  });

  await test('buildForwardNodeEntryMessage: parallel same-role node — no continuity section when entries absent', async () => {
    const msg = buildForwardNodeEntryMessage({
      nodeId: 'owner-parallel-b',
      role: 'owner',
      workspaceRoot,
      activeArtifacts: [],
      continuityEntries: undefined
    });

    assert.ok(!msg.includes('Role continuity from earlier nodes in this flow:'));
    assert.ok(msg.includes('This is a workflow node entry, not a fresh role-orientation session.'));
  });

  await test('Store: roleContinuity persisted and reloaded correctly', async () => {
    SessionStore.init();

    const flowRun = makeFlowRun({ roleContinuity: {} });
    SessionStore.saveFlowRun(flowRun);

    const roleName = 'owner';
    if (!flowRun.roleContinuity) flowRun.roleContinuity = {};
    flowRun.roleContinuity[roleName] = {
      roleName,
      completedNodes: [{
        nodeId: 'owner-intake',
        outputArtifactPath: path.relative(workspaceRoot, ownerArtifact1),
        completedAt: new Date().toISOString()
      }]
    };
    SessionStore.saveFlowRun(flowRun);

    const reloaded = SessionStore.loadFlowRun();
    assert.ok(reloaded !== null);
    assert.ok(reloaded!.roleContinuity !== undefined);
    assert.ok(reloaded!.roleContinuity![roleName] !== undefined);
    assert.strictEqual(reloaded!.roleContinuity![roleName].completedNodes.length, 1);
    assert.strictEqual(reloaded!.roleContinuity![roleName].completedNodes[0].nodeId, 'owner-intake');
  });

  await test('Store: loading a v2 flow migrates it to v5 with empty roleContinuity and edge artifacts', async () => {
    const v2Flow: any = {
      flowId: 'v2-flow',
      projectRoot: workspaceRoot,
      projectNamespace,
      recordFolderPath: recordDir,
      activeNodes: [],
      completedNodes: [],
      pendingNodeArtifacts: {},
      status: 'completed',
      stateVersion: '2'
    };
    fs.writeFileSync(path.join(stateDir, 'flow.json'), JSON.stringify(v2Flow, null, 2));

    const loaded = SessionStore.loadFlowRun();
    assert.ok(loaded !== null);
    assert.strictEqual(loaded!.stateVersion, '5');
    assert.strictEqual(loaded!.workspaceRoot, workspaceRoot);
    assert.deepStrictEqual(loaded!.completedEdgeArtifacts, {});
    assert.deepStrictEqual(loaded!.roleContinuity, {});
  });

  // ---- Orchestrator-seam tests ----
  // These exercise the runtime wiring by calling advanceFlow with a mock LLM
  // and inspecting persisted session state afterward.

  await test('Orchestrator: successful targets handoff appends entry to roleContinuity ledger', async () => {
    SessionStore.init();

    // Clear any prior session for this node
    const sessionFile = path.join(stateDir, 'sessions', 'test-flow-id__owner-intake.json');
    if (fs.existsSync(sessionFile)) fs.unlinkSync(sessionFile);

    const flowRun = makeFlowRun({
      activeNodes: ['owner-intake'],
      roleContinuity: {}
    });
    SessionStore.saveFlowRun(flowRun);

    const artifactRelPath = path.relative(workspaceRoot, ownerArtifact1);
    const handoffText = `Done. \`\`\`handoff\nrole: 'ta'\nartifact_path: '${artifactRelPath}'\n\`\`\``;
    const unpatch = patchLLM(new MockProvider([
      { type: 'text', text: handoffText }
    ]));

    const orchestrator = new FlowOrchestrator();
    const input = new PassThrough();
    const output = new Writable({ write(_c, _e, cb) { cb(); } });

    try {
      await orchestrator.advanceFlow(flowRun, 'owner-intake', undefined, undefined, input, output);
    } finally {
      unpatch();
    }

    const updated = SessionStore.loadFlowRun()!;
    const roleName = 'owner';
    assert.ok(updated.roleContinuity !== undefined, 'roleContinuity must exist after handoff');
    assert.ok(updated.roleContinuity![roleName] !== undefined, `ledger entry for ${roleName} must exist`);
    assert.strictEqual(updated.roleContinuity![roleName].completedNodes.length, 1);
    assert.strictEqual(updated.roleContinuity![roleName].completedNodes[0].nodeId, 'owner-intake');
    assert.ok(updated.completedNodes.includes('owner-intake'), 'owner-intake must be in completedNodes');
  });

  await test('Orchestrator: later same-role node entry message contains continuity section', async () => {
    SessionStore.init();

    // Clear prior session for owner-gate
    const sessionFile = path.join(stateDir, 'sessions', 'test-flow-id__owner-gate.json');
    if (fs.existsSync(sessionFile)) fs.unlinkSync(sessionFile);

    // Pre-configure roleContinuity with owner-intake already completed
    const roleName = 'owner';
    const flowRun = makeFlowRun({
      activeNodes: ['owner-gate'],
      completedNodes: ['owner-intake', 'ta'],
      completedEdgeArtifacts: {
        'owner-intake=>ta': path.relative(workspaceRoot, ownerArtifact1),
        'ta=>owner-gate': path.relative(workspaceRoot, taArtifact)
      },
      pendingNodeArtifacts: {
        'owner-gate': [path.relative(workspaceRoot, taArtifact)]
      },
      roleContinuity: {
        [roleName]: {
          roleName,
          completedNodes: [{
            nodeId: 'owner-intake',
            outputArtifactPath: path.relative(workspaceRoot, ownerArtifact1),
            completedAt: '2026-04-11T00:00:00.000Z'
          }]
        }
      }
    });
    SessionStore.saveFlowRun(flowRun);

    // Mock returns prompt-human so the session is saved without completing the node;
    // this avoids triggering TERMINAL_FORWARD_PASS while still exercising node-entry assembly.
    const unpatch = patchLLM(new MockProvider([
      { type: 'text', text: 'Need clarification. ```handoff\ntype: prompt-human\n```' }
    ]));

    const orchestrator = new FlowOrchestrator();
    // Input stream ends immediately → readHumanInput returns null → session saved
    const input = new Readable({ read() {} });
    input.push(null);
    const output = new Writable({ write(_c, _e, cb) { cb(); } });

    try {
      await orchestrator.advanceFlow(flowRun, 'owner-gate', undefined, undefined, input, output);
    } finally {
      unpatch();
    }

    const session = SessionStore.loadRoleSession('test-flow-id__owner-gate');
    assert.ok(session !== null, 'session must be saved after prompt-human + null input');
    const firstMessage = (session!.transcriptHistory[0] as any).content as string;

    // Non-startup distinction
    assert.ok(
      firstMessage.includes('This is a workflow node entry, not a fresh role-orientation session.'),
      'node-entry message must include non-startup distinction line'
    );
    // Continuity section
    assert.ok(
      firstMessage.includes('Role continuity from earlier nodes in this flow:'),
      'node-entry message must include continuity section for later same-role node'
    );
    assert.ok(
      firstMessage.includes('owner-intake ->'),
      'continuity section must include the prior owner-intake node entry'
    );
    // Current task input
    assert.ok(
      firstMessage.includes('TA design content.'),
      'node-entry message must include current artifact content as task input'
    );
    // Must NOT be the bootstrap message
    assert.ok(
      !firstMessage.includes('A fresh interactive Owner session has started.'),
      'later same-role entry must not use the Owner bootstrap message'
    );
  });

  await test('Orchestrator: parallel same-role activation suppresses continuity in node-entry message', async () => {
    SessionStore.init();

    // Clear prior session for owner-intake
    const sessionFile = path.join(stateDir, 'sessions', 'test-flow-id__owner-intake.json');
    if (fs.existsSync(sessionFile)) fs.unlinkSync(sessionFile);

    const roleName = 'owner';
    // Both owner-intake and owner-gate are active simultaneously (same role)
    // roleContinuity has an entry that WOULD be injected if not suppressed
    const flowRun = makeFlowRun({
      activeNodes: ['owner-intake', 'owner-gate'],
      pendingNodeArtifacts: {
        'owner-intake': [path.relative(workspaceRoot, ownerArtifact1)],
        'owner-gate': [path.relative(workspaceRoot, taArtifact)]
      },
      roleContinuity: {
        [roleName]: {
          roleName,
          completedNodes: [{
            nodeId: 'some-prior-owner-node',
            outputArtifactPath: 'records/test-flow/prior.md',
            completedAt: '2026-04-11T00:00:00.000Z'
          }]
        }
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

    const session = SessionStore.loadRoleSession('test-flow-id__owner-intake');
    assert.ok(session !== null, 'session must be saved');
    const firstMessage = (session!.transcriptHistory[0] as any).content as string;

    // Continuity must be suppressed — the other active node shares the same role
    assert.ok(
      !firstMessage.includes('Role continuity from earlier nodes in this flow:'),
      'parallel same-role activation must suppress continuity section in node-entry message'
    );
    // But the node-entry framing must still be present
    assert.ok(
      firstMessage.includes('This is a workflow node entry, not a fresh role-orientation session.'),
      'node-entry framing must still be present even when continuity is suppressed'
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
