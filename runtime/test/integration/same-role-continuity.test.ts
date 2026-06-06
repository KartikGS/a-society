/**
 * Integration test: repeated-role and role-instance session behavior.
 *
 * Uses a repeated-role workflow: Owner-intake -> TA -> Owner-gate
 * Covers:
 *
 *  1. Same-node prompt-human resume preserves the existing role-scoped transcript
 *  2. Later same-role node reuses the same role-scoped session and appends a node-transition packet
 *  3. Reopened same-role node keeps the prior role-scoped session and appends a reopen packet
 *  4. Separate role instances with the same base role use separate sessions
 *  5. Same-role-instance runnable nodes are serialized by the scheduler
 */

import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import { SessionStore } from '../../src/orchestration/store.js';
import { ContextInjectionService } from '../../src/context/injection.js';
import { LLMGateway } from '../../src/providers/llm.js';
import type { FlowRun, ProviderTurnResult, RuntimeMessageParam, ToolDefinition, LLMProvider, TurnOptions } from '../../src/common/types.js';
import { seedTestModelSettings } from './settings-test-utils.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';

import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
// ---- Harness setup ----

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-same-role-'));
const stateDir = path.join(tmpDir, '.a-society', 'state');
const settingsDir = path.join(tmpDir, '.a-society');
const projectNamespace = 'test-proj';
const workspaceRoot = tmpDir;
const namespaceDir = path.join(workspaceRoot, projectNamespace);
const rolesDir = path.join(namespaceDir, 'a-docs', 'roles');
const indexDir = path.join(namespaceDir, 'a-docs', 'indexes');
const recordDir = getFlowRecordDir(workspaceRoot, { projectNamespace, flowId: 'test-flow-id' });
const instanceRecordDir = getFlowRecordDir(workspaceRoot, { projectNamespace, flowId: 'instance-flow-id' });

fs.mkdirSync(rolesDir, { recursive: true });
fs.mkdirSync(indexDir, { recursive: true });
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
fs.writeFileSync(path.join(rolesDir, 'owner', 'ownership.yaml'), 'role: owner\nsurfaces: []\n');
fs.writeFileSync(path.join(rolesDir, 'ta', 'ownership.yaml'), 'role: ta\nsurfaces: []\n');
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
const instanceWorkflow = `workflow:
  name: instance-flow
  nodes:
    - id: owner-one
      role: owner_1
    - id: owner-two
      role: owner_2
  edges: []
`;

const ownerArtifact1 = path.join(recordDir, '01-owner-brief.md');
const taArtifact = path.join(recordDir, '02-ta-design.md');
const reviewFeedbackArtifact = path.join(recordDir, '03-review-feedback.md');
const ownerInstanceArtifact = path.join(instanceRecordDir, '01-owner-instance-input.md');
const ownerArtifact1Rel = path.relative(workspaceRoot, ownerArtifact1);
const taArtifactRel = path.relative(workspaceRoot, taArtifact);
const reviewFeedbackArtifactRel = path.relative(workspaceRoot, reviewFeedbackArtifact);

function seedRecordFixtures() {
  fs.mkdirSync(recordDir, { recursive: true });
  fs.mkdirSync(instanceRecordDir, { recursive: true });
  fs.writeFileSync(path.join(recordDir, 'workflow.yaml'), workflow);
  fs.writeFileSync(path.join(instanceRecordDir, 'workflow.yaml'), instanceWorkflow);
  fs.writeFileSync(ownerArtifact1, 'Owner brief content.');
  fs.writeFileSync(taArtifact, 'TA design content.');
  fs.writeFileSync(reviewFeedbackArtifact, 'Reviewer requests revision to the Owner brief.');
  fs.writeFileSync(ownerInstanceArtifact, 'Role instance input.');
}

seedRecordFixtures();
seedTestModelSettings(settingsDir, { providerBaseUrl: 'http://127.0.0.1:1/v1' });

function resetState() {
  fs.rmSync(stateDir, { recursive: true, force: true });
  fs.mkdirSync(stateDir, { recursive: true });
  seedRecordFixtures();
  SessionStore.init(workspaceRoot);
}

// ---- Mock LLM provider ----

type MockResponse =
  | ProviderTurnResult
  | ((messages: RuntimeMessageParam[], options?: TurnOptions) => ProviderTurnResult | Promise<ProviderTurnResult>);

function streamMockText(options: TurnOptions | undefined, text: string): void {
  options?.outputStream?.write(text);
  options?.onAssistantTextDelta?.(text);
}

class MockProvider implements LLMProvider {
  private responses: MockResponse[];
  private callCount = 0;

  constructor(responses: MockResponse[]) {
    this.responses = responses;
  }

  async executeTurn(
    _system: string,
    messages: RuntimeMessageParam[],
    _tools?: ToolDefinition[],
    options?: TurnOptions
  ): Promise<ProviderTurnResult> {
    const res = this.responses[this.callCount % this.responses.length];
    this.callCount++;
    if (typeof res === 'function') return res(messages, options);
    if (res.type === 'text') streamMockText(options, res.text);
    return res;
  }
}

function patchLLM(provider: MockProvider): () => void {
  const original = LLMGateway.prototype.executeTurn;
  LLMGateway.prototype.executeTurn = async function(sys, hist, opts) {
    return original.call(new LLMGateway({
      mode: 'project',
      workspaceRoot: tmpDir,
      flowRef: { projectNamespace, flowId: 'test-flow-id' },
      provider,
    }), sys, hist, opts);
  };
  return () => { LLMGateway.prototype.executeTurn = original; };
}

function ownerSessionId(flowId = 'test-flow-id') {
  return `${flowId}__owner`;
}

function ownerInstanceSessionId(instanceNumber: number, flowId = 'instance-flow-id') {
  return `${flowId}__owner_${instanceNumber}`;
}

function flowRef(flowId = 'test-flow-id') {
  return { projectNamespace, flowId };
}

async function waitUntil(predicate: () => boolean, timeoutMs = 2_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() >= deadline) {
      throw new Error('Timed out waiting for scheduler state.');
    }
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
}

async function runStoredFlowUntil(
  orchestrator: FlowOrchestrator,
  flowId: string,
  predicate: () => boolean
): Promise<void> {
  const runPromise = orchestrator.runStoredFlow(workspaceRoot, projectNamespace, flowId);
  try {
    await waitUntil(predicate);
  } finally {
    await SessionStore.updateFlowRun((flow) => {
      flow.status = 'completed';
    }, flowRef(flowId), workspaceRoot);
    orchestrator.wake();
    await runPromise;
  }
}

function makeFlowRun(overrides: Partial<FlowRun> = {}): FlowRun {
  return {
    flowId: 'test-flow-id',
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordDir,
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    completedHandoffs: [],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
    ...overrides
  };
}

function makeInstanceFlowRun(overrides: Partial<FlowRun> = {}): FlowRun {
  return {
    flowId: 'instance-flow-id',
    workspaceRoot,
    projectNamespace,
    recordFolderPath: instanceRecordDir,
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    completedHandoffs: [],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
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
      workspaceRoot,
      recordDir
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
    }, flowRef(), workspaceRoot);

    const loadedSession = SessionStore.loadRoleSession('owner', flowRef(), workspaceRoot);
    assert.ok(loadedSession !== null, 'Session must be persisted before resume');
    assert.strictEqual(loadedSession!.logicalSessionId, sessionId);
    assert.strictEqual(loadedSession!.transcriptHistory.length, 2);
    assert.strictEqual((loadedSession!.transcriptHistory[0] as any).content, 'original node entry message');
    assert.strictEqual(loadedSession!.currentNodeId, 'owner-intake');
  });

  await test('Store: loading an incompatible flow is rejected but it remains listable for deletion', async () => {
    resetState();

    const v5Flow: any = {
      flowId: 'v5-flow',
      workspaceRoot,
      projectNamespace,
      recordFolderPath: recordDir,
      runningNodes: [],
      awaitingHumanNodes: {},
      pendingHumanInputs: {},
      completedHandoffs: [],
      status: 'completed',
      stateVersion: '5',
    };
    const v5FlowDir = path.join(stateDir, projectNamespace, 'v5-flow');
    fs.mkdirSync(v5FlowDir, { recursive: true });
    fs.writeFileSync(path.join(v5FlowDir, 'flow.json'), JSON.stringify(v5Flow, null, 2));

    assert.throws(
      () => SessionStore.loadFlowRun(flowRef('v5-flow'), workspaceRoot),
      new RegExp(`only supports flow state version "${CURRENT_FLOW_STATE_VERSION}"`)
    );

    assert.deepStrictEqual(
      SessionStore.listFlowSummaries(workspaceRoot, projectNamespace),
      [{
        projectNamespace,
        flowId: 'v5-flow',
        status: 'completed',
        recordFolderPath: recordDir,
        openable: false,
        stateVersion: '5',
        recordName: undefined,
        recordSummary: undefined,
        updatedAt: fs.statSync(path.join(v5FlowDir, 'flow.json')).mtime.toISOString(),
      }]
    );
  });

  await test('Orchestrator: streamed assistant text is persisted before the turn completes', async () => {
    resetState();

    const flowRun = makeFlowRun({ runningNodes: ['owner-intake'] });
    SessionStore.saveFlowRun(flowRun);
    const finalText = 'Partial paid output completed. ```handoff\ntype: prompt-human\n```';
    let partialObserved = false;

    const unpatch = patchLLM(new MockProvider([
      (_messages, options) => {
        streamMockText(options, 'Partial paid output');
        const liveSession = SessionStore.loadRoleSession('owner', flowRef(), workspaceRoot);
        const liveHistory = liveSession?.transcriptHistory as RuntimeMessageParam[] | undefined;
        partialObserved = liveHistory?.some(message =>
          message.role === 'assistant' && message.content === 'Partial paid output'
        ) ?? false;
        streamMockText(options, finalText.slice('Partial paid output'.length));
        return { type: 'text', text: finalText };
      }
    ]));

    const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
    try {
      await orchestrator.advanceFlow(flowRun, 'owner-intake');
    } finally {
      unpatch();
    }

    assert.ok(partialObserved, 'partial streamed text should be saved while the provider is still running');
    const session = SessionStore.loadRoleSession('owner', flowRef(), workspaceRoot);
    assert.ok(session !== null, 'role session should be saved');
    const lastMessage = session!.transcriptHistory[session!.transcriptHistory.length - 1] as RuntimeMessageParam;
    assert.strictEqual(lastMessage.role, 'assistant');
    assert.strictEqual(lastMessage.content, finalText);
  });

  await test('Orchestrator: queued human input is consumed by the stored-flow scheduler', async () => {
    resetState();

    SessionStore.saveRoleSession({
      roleName: 'owner',
      logicalSessionId: ownerSessionId(),
      transcriptHistory: [
        { role: 'user', content: 'owner-intake entry message' },
        { role: 'assistant', content: 'What should I optimize for?' }
      ],
      isActive: true,
      currentNodeId: 'owner-intake'
    }, flowRef(), workspaceRoot);

    const flowRun = makeFlowRun({
      awaitingHumanNodes: {
        'owner-intake': { role: 'owner', reason: 'prompt-human' }
      },
      pendingHumanInputs: {
        'owner-intake': {
          text: 'Optimize for correctness first.',
          receivedAt: '2026-05-17T00:00:00.000Z'
        }
      },
      visitedNodeIds: ['owner-intake']
    });
    SessionStore.saveFlowRun(flowRun);

    const unpatch = patchLLM(new MockProvider([
      { type: 'text', text: 'Understood. ```handoff\ntype: prompt-human\n```' }
    ]));

    const sink = new RecordingOperatorSink();
    const orchestrator = new FlowOrchestrator(sink);
    try {
      await runStoredFlowUntil(orchestrator, flowRun.flowId, () => {
        const updated = SessionStore.loadFlowRun(flowRef(), workspaceRoot);
        return Boolean(
          updated &&
          Object.keys(updated.pendingHumanInputs).length === 0 &&
          updated.awaitingHumanNodes['owner-intake']
        );
      });
    } finally {
      unpatch();
    }

    const updated = SessionStore.loadFlowRun(flowRef(), workspaceRoot)!;
    const session = SessionStore.loadRoleSession('owner', flowRef(), workspaceRoot)!;
    assert.deepStrictEqual(updated.pendingHumanInputs, {});
    assert.ok(updated.awaitingHumanNodes['owner-intake'], 'node should be waiting again after the mock turn re-prompts');
    assert.ok(
      sink.events.some((event) => event.kind === 'human.resumed' && event.nodeId === 'owner-intake'),
      'queued input should resume the suspended node through the scheduler'
    );
    assert.ok(
      session.transcriptHistory.some((message: any) => message.role === 'user' && message.content.includes('Optimize for correctness first.')),
      'queued human input should be appended to the resumed transcript'
    );
  });

  await test('Orchestrator: interrupted same-node resume appends continuation prompt', async () => {
    resetState();

    SessionStore.saveRoleSession({
      roleName: 'owner',
      logicalSessionId: ownerSessionId(),
      transcriptHistory: [
        { role: 'user', content: 'owner-intake entry message' },
        { role: 'assistant', content: 'Partial streamed answer before server shutdown.' }
      ],
      isActive: true,
      currentNodeId: 'owner-intake'
    }, flowRef(), workspaceRoot);

    const flowRun = makeFlowRun({
      runningNodes: ['owner-intake'],
      visitedNodeIds: ['owner-intake']
    });
    SessionStore.saveFlowRun(flowRun);
    let seenMessages: RuntimeMessageParam[] = [];

    const unpatch = patchLLM(new MockProvider([
      (messages, options) => {
        seenMessages = messages.map(message => ({ ...message }));
        const text = 'Continued answer. ```handoff\ntype: prompt-human\n```';
        streamMockText(options, text);
        return { type: 'text', text };
      }
    ]));

    const sink = new RecordingOperatorSink();
    const orchestrator = new FlowOrchestrator(sink);
    try {
      await orchestrator.advanceFlow(flowRun, 'owner-intake');
    } finally {
      unpatch();
    }

    const interruptedAssistant = seenMessages[seenMessages.length - 2] as any;
    const continuationMessage = seenMessages[seenMessages.length - 1] as any;
    assert.strictEqual(interruptedAssistant.role, 'assistant');
    assert.strictEqual(
      interruptedAssistant.content,
      'Partial streamed answer before server shutdown.'
    );
    assert.strictEqual(continuationMessage.role, 'user');
    assert.ok(
      continuationMessage.content.includes('previous assistant response was interrupted'),
      'expected the resume turn to ask the role to continue'
    );
    assert.ok(
      !sink.events.some(event => event.kind === 'role.active' && event.nodeId === 'owner-intake'),
      'same active node resume should not emit a fresh role.active activation'
    );
    assert.ok(
      sink.events.some(event => event.kind === 'role.resumed' && event.nodeId === 'owner-intake' && event.reason === 'interrupted-turn'),
      'interrupted same-node resume should emit a visible resume boundary'
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
    }, flowRef(), workspaceRoot);

    const flowRun = makeFlowRun({
      runningNodes: ['owner-gate'],
      awaitingHumanNodes: {},
      pendingHumanInputs: {},
      visitedNodeIds: ['owner-intake', 'ta'],
      completedHandoffs: ['owner-intake=>ta', 'ta=>owner-gate'],
      receivingHandoff: {
        'ta=>owner-gate': [taArtifactRel]
      },
      historyHandoff: {
        'owner-intake=>ta': [ownerArtifact1Rel],
        'ta=>owner-gate': [taArtifactRel]
      },
      awaitingHandoff: []
    });
    SessionStore.saveFlowRun(flowRun);

    const unpatch = patchLLM(new MockProvider([
      { type: 'text', text: 'Need clarification. ```handoff\ntype: prompt-human\n```' }
    ]));

    const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
    try {
      await orchestrator.advanceFlow(flowRun, 'owner-gate');
    } finally {
      unpatch();
    }

    const session = SessionStore.loadRoleSession('owner', flowRef(), workspaceRoot);
    assert.ok(session !== null, 'role-scoped Owner session must be preserved');
    assert.strictEqual((session!.transcriptHistory[0] as any).content, 'owner-intake entry message');

    const transitionMessage = (session!.transcriptHistory as any[])
      .find(message => message.role === 'user' && typeof message.content === 'string' &&
        message.content.includes('Node owner-gate started at:'));

    assert.ok(transitionMessage, 'expected a node-entry packet in the reused Owner session');
    assert.ok(transitionMessage.content.includes('Handoffs received:'));
    assert.ok(transitionMessage.content.includes('From predecessor ta:'));
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
    }, flowRef(), workspaceRoot);

    const flowRun = makeFlowRun({
      runningNodes: ['owner-intake'],
      awaitingHumanNodes: {},
      pendingHumanInputs: {},
      visitedNodeIds: ['owner-intake'],
      receivingHandoff: {
        'ta=>owner-intake': [reviewFeedbackArtifactRel]
      },
      historyHandoff: {
        'owner-intake=>ta': [ownerArtifact1Rel],
        'ta=>owner-intake': [reviewFeedbackArtifactRel]
      },
      awaitingHandoff: []
    });
    SessionStore.saveFlowRun(flowRun);

    const unpatch = patchLLM(new MockProvider([
      { type: 'text', text: 'Need clarification. ```handoff\ntype: prompt-human\n```' }
    ]));

    const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
    try {
      await orchestrator.advanceFlow(flowRun, 'owner-intake');
    } finally {
      unpatch();
    }

    const session = SessionStore.loadRoleSession('owner', flowRef(), workspaceRoot);
    assert.ok(session !== null, 'reopened node should keep the prior role-scoped session');

    const reopenedMessage = (session!.transcriptHistory as any[])
      .find(message => message.role === 'user' && typeof message.content === 'string' &&
        message.content.includes('Node owner-intake resumed at:'));

    assert.ok(reopenedMessage, 'expected a resumed node-entry packet in the reused Owner session');
    assert.ok(reopenedMessage.content.includes('Handoffs received:'));
    assert.ok(reopenedMessage.content.includes('From successor ta (please take necessary action so the successor can complete its work):'));
    assert.ok(reopenedMessage.content.includes('Reviewer requests revision to the Owner brief.'));
    assert.strictEqual(session!.currentNodeId, 'owner-intake');
  });

  await test('Orchestrator: backward re-entry to an earlier node is framed as reopened even after the role visited another node', async () => {
    resetState();

    SessionStore.saveRoleSession({
      roleName: 'owner',
      logicalSessionId: ownerSessionId(),
      transcriptHistory: [
        { role: 'user', content: 'owner-intake entry message' },
        { role: 'assistant', content: 'Owner moved on to a later node.' }
      ],
      isActive: false,
      currentNodeId: 'owner-gate'
    }, flowRef(), workspaceRoot);

    const flowRun = makeFlowRun({
      runningNodes: ['owner-intake'],
      awaitingHumanNodes: {},
      pendingHumanInputs: {},
      visitedNodeIds: ['owner-intake', 'owner-gate'],
      receivingHandoff: {
        'ta=>owner-intake': [reviewFeedbackArtifactRel]
      },
      historyHandoff: {
        'owner-intake=>ta': [ownerArtifact1Rel],
        'ta=>owner-intake': [reviewFeedbackArtifactRel]
      },
      awaitingHandoff: []
    });
    SessionStore.saveFlowRun(flowRun);

    const unpatch = patchLLM(new MockProvider([
      { type: 'text', text: 'Need clarification. ```handoff\ntype: prompt-human\n```' }
    ]));

    const sink = new RecordingOperatorSink();
    const orchestrator = new FlowOrchestrator(sink);
    try {
      await orchestrator.advanceFlow(flowRun, 'owner-intake');
    } finally {
      unpatch();
    }

    const session = SessionStore.loadRoleSession('owner', flowRef(), workspaceRoot);
    assert.ok(session !== null, 'backward re-entry should keep the prior role-scoped session');

    const reopenedMessage = (session!.transcriptHistory as any[])
      .find(message => message.role === 'user' && typeof message.content === 'string' &&
        message.content.includes('Node owner-intake resumed at:'));

    assert.ok(reopenedMessage, 'expected backward re-entry to use resumed node-entry framing');
    assert.ok(!reopenedMessage.content.includes('Node owner-gate started at:'));
    assert.ok(reopenedMessage.content.includes('Handoffs received:'));
    assert.ok(reopenedMessage.content.includes('From successor ta (please take necessary action so the successor can complete its work):'));
    assert.ok(reopenedMessage.content.includes('Reviewer requests revision to the Owner brief.'));
    assert.strictEqual(session!.currentNodeId, 'owner-intake');
    assert.ok(
      sink.events.some(event => event.kind === 'role.active' && event.nodeId === 'owner-intake'),
      'backward re-entry should emit a fresh role.active activation'
    );
  });

  await test('Orchestrator: role instances with the same base role use separate sessions', async () => {
    resetState();

    const flowRun = makeInstanceFlowRun({ runningNodes: ['owner-one'] });
    SessionStore.saveFlowRun(flowRun);

    const unpatch = patchLLM(new MockProvider([
      { type: 'text', text: 'Owner one pauses. ```handoff\ntype: prompt-human\n```' },
      { type: 'text', text: 'Owner two pauses. ```handoff\ntype: prompt-human\n```' }
    ]));

    const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
    try {
      await orchestrator.advanceFlow(flowRun, 'owner-one');
      const afterOwnerOne = SessionStore.loadFlowRun({ projectNamespace, flowId: 'instance-flow-id' }, workspaceRoot)!;
      afterOwnerOne.runningNodes = ['owner-two'];
      SessionStore.saveFlowRun(afterOwnerOne, flowRef('instance-flow-id'), workspaceRoot);
      await orchestrator.advanceFlow(afterOwnerOne, 'owner-two');
    } finally {
      unpatch();
    }

    const ownerOneSession = SessionStore.loadRoleSession(
      'owner_1',
      flowRef('instance-flow-id'),
      workspaceRoot
    );
    const ownerTwoSession = SessionStore.loadRoleSession(
      'owner_2',
      flowRef('instance-flow-id'),
      workspaceRoot
    );

    assert.ok(ownerOneSession !== null, 'owner_1 should have a separate session');
    assert.ok(ownerTwoSession !== null, 'owner_2 should have a separate session');
    assert.strictEqual(ownerOneSession!.roleName, 'owner_1');
    assert.strictEqual(ownerTwoSession!.roleName, 'owner_2');
    assert.strictEqual(ownerOneSession!.logicalSessionId, ownerInstanceSessionId(1));
    assert.strictEqual(ownerTwoSession!.logicalSessionId, ownerInstanceSessionId(2));
    assert.notDeepStrictEqual(ownerOneSession!.transcriptHistory, ownerTwoSession!.transcriptHistory);
    assert.ok((ownerOneSession!.systemPrompt ?? '').includes('Loaded from base role owner.'));
    assert.ok((ownerTwoSession!.systemPrompt ?? '').includes('Loaded from base role owner.'));
  });

  await test('Orchestrator: multiple queued human replies resume distinct role instances in one scheduler pass', async () => {
    resetState();

    SessionStore.saveRoleSession({
      roleName: 'owner_1',
      logicalSessionId: ownerInstanceSessionId(1),
      transcriptHistory: [
        { role: 'user', content: 'owner-one entry message' },
        { role: 'assistant', content: 'Owner one asks.' }
      ],
      isActive: true,
      currentNodeId: 'owner-one'
    }, flowRef('instance-flow-id'), workspaceRoot);
    SessionStore.saveRoleSession({
      roleName: 'owner_2',
      logicalSessionId: ownerInstanceSessionId(2),
      transcriptHistory: [
        { role: 'user', content: 'owner-two entry message' },
        { role: 'assistant', content: 'Owner two asks.' }
      ],
      isActive: true,
      currentNodeId: 'owner-two'
    }, flowRef('instance-flow-id'), workspaceRoot);

    const flowRun = makeInstanceFlowRun({
      awaitingHumanNodes: {
        'owner-one': { role: 'owner_1', reason: 'prompt-human' },
        'owner-two': { role: 'owner_2', reason: 'prompt-human' }
      },
      pendingHumanInputs: {
        'owner-one': { text: 'Answer one.', receivedAt: '2026-05-17T00:00:00.000Z' },
        'owner-two': { text: 'Answer two.', receivedAt: '2026-05-17T00:00:00.001Z' }
      },
      visitedNodeIds: ['owner-one', 'owner-two']
    });
    SessionStore.saveFlowRun(flowRun);

    const unpatch = patchLLM(new MockProvider([
      { type: 'text', text: 'Owner one continues. ```handoff\ntype: prompt-human\n```' },
      { type: 'text', text: 'Owner two continues. ```handoff\ntype: prompt-human\n```' }
    ]));

    const sink = new RecordingOperatorSink();
    const orchestrator = new FlowOrchestrator(sink);
    try {
      await runStoredFlowUntil(orchestrator, flowRun.flowId, () => {
        const updated = SessionStore.loadFlowRun(flowRef('instance-flow-id'), workspaceRoot);
        return Boolean(
          updated &&
          Object.keys(updated.pendingHumanInputs).length === 0 &&
          updated.awaitingHumanNodes['owner-one'] &&
          updated.awaitingHumanNodes['owner-two']
        );
      });
    } finally {
      unpatch();
    }

    const resumedNodeIds = sink.events
      .filter((event) => event.kind === 'human.resumed')
      .map((event: any) => event.nodeId)
      .sort();
    assert.deepStrictEqual(resumedNodeIds, ['owner-one', 'owner-two']);

    const updated = SessionStore.loadFlowRun(flowRef('instance-flow-id'), workspaceRoot)!;
    assert.deepStrictEqual(updated.pendingHumanInputs, {});
    assert.ok(updated.awaitingHumanNodes['owner-one']);
    assert.ok(updated.awaitingHumanNodes['owner-two']);
  });

  await test('Orchestrator: awaiting-handoff node wakes on inbound successor handoff', async () => {
    resetState();

    const flowRun = makeFlowRun({
      runningNodes: [],
      awaitingHumanNodes: {},
      visitedNodeIds: ['owner-intake', 'ta'],
      completedHandoffs: [],
      receivingHandoff: {
        'ta=>owner-intake': [path.relative(workspaceRoot, taArtifact)]
      },
      historyHandoff: {
        'owner-intake=>ta': [path.relative(workspaceRoot, ownerArtifact1)],
        'ta=>owner-intake': [path.relative(workspaceRoot, taArtifact)]
      },
      awaitingHandoff: ['owner-intake']
    });
    SessionStore.saveFlowRun(flowRun);

    const unpatch = patchLLM(new MockProvider([
      { type: 'text', text: 'Owner received successor return. ```handoff\ntype: prompt-human\n```' }
    ]));

    const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
    try {
      await runStoredFlowUntil(orchestrator, flowRun.flowId, () => {
        const updated = SessionStore.loadFlowRun(flowRef(), workspaceRoot);
        return Boolean(
          updated &&
          !updated.awaitingHandoff.includes('owner-intake') &&
          updated.awaitingHumanNodes['owner-intake']
        );
      });
    } finally {
      unpatch();
    }

    const updated = SessionStore.loadFlowRun(flowRef(), workspaceRoot)!;
    assert.ok(!updated.awaitingHandoff.includes('owner-intake'));
    assert.ok(updated.awaitingHumanNodes['owner-intake']);
  });

  await test('Orchestrator: same-role received handoffs are claimed in graph order', async () => {
    resetState();

    const flowRun = makeFlowRun({
      runningNodes: [],
      awaitingHumanNodes: {},
      pendingHumanInputs: {},
      receivingHandoff: {
        // Insert the later graph node first; graph order should still claim owner-intake.
        'ta=>owner-gate': [path.relative(workspaceRoot, taArtifact)],
        'ta=>owner-intake': [path.relative(workspaceRoot, reviewFeedbackArtifact)]
      },
      historyHandoff: {
        'ta=>owner-gate': [path.relative(workspaceRoot, taArtifact)],
        'ta=>owner-intake': [path.relative(workspaceRoot, reviewFeedbackArtifact)]
      },
      awaitingHandoff: []
    });
    SessionStore.saveFlowRun(flowRun);

    const unpatch = patchLLM(new MockProvider([
      { type: 'text', text: 'Owner intake receives first by graph order. ```handoff\ntype: prompt-human\n```' }
    ]));

    const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
    try {
      await runStoredFlowUntil(orchestrator, flowRun.flowId, () => {
        const updated = SessionStore.loadFlowRun(flowRef(), workspaceRoot);
        return Boolean(updated && updated.awaitingHumanNodes['owner-intake']);
      });
    } finally {
      unpatch();
    }

    const updated = SessionStore.loadFlowRun(flowRef(), workspaceRoot)!;
    assert.ok(updated.awaitingHumanNodes['owner-intake'], 'earlier graph node should claim the owner role first');
    assert.ok(!updated.runningNodes.includes('owner-gate'), 'later same-role node should not be claimed first');
    assert.deepStrictEqual(
      updated.receivingHandoff['ta=>owner-gate'],
      [path.relative(workspaceRoot, taArtifact)],
      'later same-role received handoff should remain ready for a later scheduler pass'
    );
  });

  await test('Orchestrator: same-role-instance initial running nodes are serialized by the scheduler', async () => {
    resetState();

    const flowRun = makeFlowRun({
      runningNodes: ['owner-intake', 'owner-gate'],
      awaitingHumanNodes: {},
      pendingHumanInputs: {},
      receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: []
    });
    SessionStore.saveFlowRun(flowRun);

    const unpatch = patchLLM(new MockProvider([
      { type: 'text', text: 'Owner intake pauses. ```handoff\ntype: prompt-human\n```' }
    ]));

    const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
    try {
      await runStoredFlowUntil(orchestrator, flowRun.flowId, () => {
        const updated = SessionStore.loadFlowRun({ projectNamespace, flowId: flowRun.flowId }, workspaceRoot);
        return Boolean(
          updated &&
          updated.awaitingHumanNodes['owner-intake']
        );
      });
    } finally {
      unpatch();
    }

    const updated = SessionStore.loadFlowRun({ projectNamespace, flowId: flowRun.flowId }, workspaceRoot)!;
    assert.ok(!updated.runningNodes.includes('owner-gate'), 'later same-role node should not be claimed while owner-intake is suspended');
    assert.ok(updated.awaitingHumanNodes['owner-intake'], 'first same-role node should be awaiting human input');
  });

  await test('Orchestrator: handoff to busy same-role target is accepted and left ready', async () => {
    resetState();

    const flowRun = makeFlowRun({
      runningNodes: ['owner-intake', 'ta'],
      awaitingHumanNodes: {},
      pendingHumanInputs: {},
      completedHandoffs: ['owner-intake=>ta'],
      receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: []
    });
    SessionStore.saveFlowRun(flowRun);

    const handoffArtifact = path.relative(workspaceRoot, taArtifact);
    const unpatch = patchLLM(new MockProvider([
      { type: 'text', text: `TA complete. \`\`\`handoff\ntarget_node_id: owner-gate\nartifact_path: ${handoffArtifact}\n\`\`\`` }
    ]));

    const sink = new RecordingOperatorSink();
    const orchestrator = new FlowOrchestrator(sink);
    try {
      await orchestrator.advanceFlow(flowRun, 'ta');
    } finally {
      unpatch();
    }

    const updated = SessionStore.loadFlowRun({ projectNamespace, flowId: flowRun.flowId }, workspaceRoot)!;
    assert.ok(updated.completedHandoffs.includes('ta=>owner-gate'), 'completed handoffs should include ta=>owner-gate');
    assert.deepStrictEqual(updated.receivingHandoff['ta=>owner-gate'], [handoffArtifact], 'busy same-role handoff target should receive the handoff');
    assert.ok(updated.runningNodes.includes('owner-intake'), 'existing same-role node should remain running');
    assert.ok(!updated.runningNodes.includes('owner-gate'), 'busy same-role target should not be claimed immediately');
    assert.ok(
      !sink.events.some(event => event.kind === 'repair.requested'),
      'busy same-role handoff should not request repair'
    );
  });

  console.log(`\n  ${passed} passed, ${failed} failed\n`);

  fs.rmSync(tmpDir, { recursive: true, force: true });

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
