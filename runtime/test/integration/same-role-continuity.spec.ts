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

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, expect, it } from 'vitest';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import { SessionStore } from '../../src/orchestration/store.js';
import { ContextInjectionService } from '../../src/context/injection.js';
import { LLMGateway } from '../../src/providers/llm.js';
import { AWAITING_HUMAN_REASON } from '../../src/common/protocol-constants.js';
import type { FlowRun, ProviderTurnResult, RuntimeMessageParam, ToolDefinition, LLMProvider, TurnOptions } from '../../src/common/types.js';
import { seedTestModelSettings } from './settings-test-utils.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';

import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
// ---- Harness setup ----

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-same-role-'));
afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }));
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
    visitedNodeIds: [],
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
    visitedNodeIds: [],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
    ...overrides
  };
}

it('Context bundle uses RUNTIME-LOADED framing, not MANDATORY CONTEXT LOADING', async () => {
    const { bundleContent } = ContextInjectionService.buildContextBundle(
      projectNamespace,
      'owner',
      workspaceRoot,
      recordDir,
      { projectNamespace, flowId: 'same-role-flow' }
    );

    expect(bundleContent.includes('RUNTIME-LOADED REQUIRED READING')).toBeTruthy();
    expect(bundleContent.includes('These files are already loaded into this session by the runtime.')).toBeTruthy();
    expect(bundleContent.includes('MANDATORY CONTEXT LOADING')).toBeFalsy();
  });

  it('Same-node resume: role-scoped session transcript is preserved intact', async () => {
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
    expect(loadedSession !== null).toBeTruthy();
    expect(loadedSession!.logicalSessionId).toBe(sessionId);
    expect(loadedSession!.transcriptHistory.length).toBe(2);
    expect((loadedSession!.transcriptHistory[0] as any).content).toBe('original node entry message');
    expect(loadedSession!.currentNodeId).toBe('owner-intake');
  });

  it('Store: loading an incompatible flow is rejected but it remains listable for deletion', async () => {
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

    expect(() => SessionStore.loadFlowRun(flowRef('v5-flow'), workspaceRoot))
      .toThrow(new RegExp(`only supports flow state version "${CURRENT_FLOW_STATE_VERSION}"`));

    expect(SessionStore.listFlowSummaries(workspaceRoot, projectNamespace)).toEqual([{
        projectNamespace,
        flowId: 'v5-flow',
        status: 'completed',
        recordFolderPath: recordDir,
        openable: false,
        stateVersion: '5',
        recordName: undefined,
        recordSummary: undefined,
        updatedAt: fs.statSync(path.join(v5FlowDir, 'flow.json')).mtime.toISOString(),
      }]);
  });

  it('Orchestrator: streamed assistant text is persisted before the turn completes', async () => {
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
      await runStoredFlowUntil(orchestrator, flowRun.flowId, () =>
        !!SessionStore.loadFlowRun(flowRef(), workspaceRoot)?.awaitingHumanNodes['owner-intake']
      );
    } finally {
      unpatch();
    }

    expect(partialObserved).toBeTruthy();
    const session = SessionStore.loadRoleSession('owner', flowRef(), workspaceRoot);
    expect(session !== null).toBeTruthy();
    const lastMessage = session!.transcriptHistory[session!.transcriptHistory.length - 1] as Extract<RuntimeMessageParam, { role: 'assistant' }>;
    expect(lastMessage.role).toBe('assistant');
    expect(lastMessage.content).toBe(finalText);
  });

  it('Orchestrator: queued human input is consumed by the stored-flow scheduler', async () => {
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
    expect(updated.pendingHumanInputs).toEqual({});
    expect(updated.awaitingHumanNodes['owner-intake']).toBeTruthy();
    expect(
      sink.events.some((event) => event.kind === 'human.resumed' && event.nodeId === 'owner-intake'),
      'queued input should resume the suspended node through the scheduler'
    ).toBeTruthy();
    expect(
      session.transcriptHistory.some((message: any) => message.role === 'user' && message.content.includes('Optimize for correctness first.')),
      'queued human input should be appended to the resumed transcript'
    ).toBeTruthy();
  });

  it('Orchestrator: interrupted same-node resume appends continuation prompt', async () => {
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
      await runStoredFlowUntil(orchestrator, flowRun.flowId, () =>
        !!SessionStore.loadFlowRun(flowRef(), workspaceRoot)?.awaitingHumanNodes['owner-intake']
      );
    } finally {
      unpatch();
    }

    const interruptedAssistant = seenMessages[seenMessages.length - 2] as any;
    const continuationMessage = seenMessages[seenMessages.length - 1] as any;
    expect(interruptedAssistant.role).toBe('assistant');
    expect(interruptedAssistant.content).toBe('Partial streamed answer before server shutdown.');
    expect(continuationMessage.role).toBe('user');
    expect(
      continuationMessage.content.includes('previous assistant response was interrupted'),
      'expected the resume turn to ask the role to continue'
    ).toBeTruthy();
    expect(
      !sink.events.some(event => event.kind === 'role.active' && event.nodeId === 'owner-intake'),
      'same active node resume should not emit a fresh role.active activation'
    ).toBeTruthy();
    expect(
      sink.events.some(event => event.kind === 'role.resumed' && event.nodeId === 'owner-intake' && event.reason === 'interrupted-turn'),
      'interrupted same-node resume should emit a visible resume boundary'
    ).toBeTruthy();
  });

  it('Orchestrator: later same-role node reuses role-scoped session and appends transition packet', async () => {
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
      await runStoredFlowUntil(orchestrator, flowRun.flowId, () =>
        !!SessionStore.loadFlowRun(flowRef(), workspaceRoot)?.awaitingHumanNodes['owner-gate']
      );
    } finally {
      unpatch();
    }

    const session = SessionStore.loadRoleSession('owner', flowRef(), workspaceRoot);
    expect(session !== null).toBeTruthy();
    expect((session!.transcriptHistory[0] as any).content).toBe('owner-intake entry message');

    const transitionMessage = (session!.transcriptHistory as any[])
      .find(message => message.role === 'user' && typeof message.content === 'string' &&
        message.content.includes('Node owner-gate started at:'));

    expect(transitionMessage).toBeTruthy();
    expect(transitionMessage.content.includes('Handoffs received:')).toBeTruthy();
    expect(transitionMessage.content.includes('From predecessor ta:')).toBeTruthy();
    expect(transitionMessage.content.includes('TA design content.')).toBeTruthy();
    expect(session!.currentNodeId).toBe('owner-gate');
  });

  it('Orchestrator: reopened same-role node keeps prior session and appends reopened packet', async () => {
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
      await runStoredFlowUntil(orchestrator, flowRun.flowId, () =>
        !!SessionStore.loadFlowRun(flowRef(), workspaceRoot)?.awaitingHumanNodes['owner-intake']
      );
    } finally {
      unpatch();
    }

    const session = SessionStore.loadRoleSession('owner', flowRef(), workspaceRoot);
    expect(session !== null).toBeTruthy();

    const reopenedMessage = (session!.transcriptHistory as any[])
      .find(message => message.role === 'user' && typeof message.content === 'string' &&
        message.content.includes('Node owner-intake resumed at:'));

    expect(reopenedMessage).toBeTruthy();
    expect(reopenedMessage.content.includes('Handoffs received:')).toBeTruthy();
    expect(reopenedMessage.content.includes('From successor ta (please take necessary action so the successor can complete its work):')).toBeTruthy();
    expect(reopenedMessage.content.includes('Reviewer requests revision to the Owner brief.')).toBeTruthy();
    expect(session!.currentNodeId).toBe('owner-intake');
  });

  it('Orchestrator: inbound handoff wakes an awaiting-human node without a queued human reply', async () => {
    resetState();

    SessionStore.saveRoleSession({
      roleName: 'owner',
      logicalSessionId: ownerSessionId(),
      transcriptHistory: [
        { role: 'user', content: 'owner-intake entry message' },
        { role: 'assistant', content: 'I need a human answer before closing.' }
      ],
      currentNodeContext: {
        nodeId: 'owner-intake',
        exchanges: [
          { role: 'user', content: 'Human-side closure discussion worth preserving.' },
          { role: 'assistant', content: 'I need a human answer before closing.' }
        ],
      },
      isActive: true,
      currentNodeId: 'owner-intake'
    }, flowRef(), workspaceRoot);

    const flowRun = makeFlowRun({
      runningNodes: [],
      awaitingHumanNodes: {
        'owner-intake': { role: 'owner', reason: AWAITING_HUMAN_REASON.PROMPT_HUMAN }
      },
      pendingHumanInputs: {},
      visitedNodeIds: ['owner-intake', 'ta'],
      completedHandoffs: ['owner-intake=>ta'],
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
      { type: 'text', text: 'Subagent result received. ```handoff\ntype: prompt-human\n```' }
    ]));

    const sink = new RecordingOperatorSink();
    const orchestrator = new FlowOrchestrator(sink);
    try {
      await runStoredFlowUntil(orchestrator, flowRun.flowId, () => {
        const updated = SessionStore.loadFlowRun(flowRef(), workspaceRoot);
        return Boolean(
          updated &&
          !updated.receivingHandoff['ta=>owner-intake'] &&
          updated.awaitingHumanNodes['owner-intake']
        );
      });
    } finally {
      unpatch();
    }

    const updated = SessionStore.loadFlowRun(flowRef(), workspaceRoot)!;
    expect(updated.receivingHandoff['ta=>owner-intake']).toBeUndefined();
    expect(updated.awaitingHumanNodes['owner-intake']).toBeTruthy();
    expect(
      sink.events.some(event => event.kind === 'role.active' && event.nodeId === 'owner-intake'),
      'handoff wake should emit a fresh role.active activation'
    ).toBeTruthy();

    const session = SessionStore.loadRoleSession('owner', flowRef(), workspaceRoot);
    expect(session !== null).toBeTruthy();
    expect(
      session!.currentNodeContext?.exchanges.some(message =>
        message.role === 'user' &&
        typeof message.content === 'string' &&
        message.content.includes('Human-side closure discussion worth preserving.')
      )
    ).toBeTruthy();
    const reopenedMessage = (session!.transcriptHistory as any[])
      .find(message => message.role === 'user' && typeof message.content === 'string' &&
        message.content.includes('Node owner-intake resumed at:'));
    const reopenedCurrentNodeMessage = session!.currentNodeContext?.exchanges
      .find(message => message.role === 'user' && typeof message.content === 'string' &&
        message.content.includes('Node owner-intake resumed at:'));

    expect(reopenedMessage).toBeTruthy();
    expect(reopenedCurrentNodeMessage).toBeTruthy();
    expect(reopenedMessage.content.includes('Handoffs received:')).toBeTruthy();
    expect(reopenedMessage.content.includes('From successor ta (please take necessary action so the successor can complete its work):')).toBeTruthy();
    expect(reopenedMessage.content.includes('Reviewer requests revision to the Owner brief.')).toBeTruthy();
  });

  it('Orchestrator: backward re-entry to an earlier node is framed as reopened even after the role visited another node', async () => {
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
      await runStoredFlowUntil(orchestrator, flowRun.flowId, () =>
        !!SessionStore.loadFlowRun(flowRef(), workspaceRoot)?.awaitingHumanNodes['owner-intake']
      );
    } finally {
      unpatch();
    }

    const session = SessionStore.loadRoleSession('owner', flowRef(), workspaceRoot);
    expect(session !== null).toBeTruthy();

    const reopenedMessage = (session!.transcriptHistory as any[])
      .find(message => message.role === 'user' && typeof message.content === 'string' &&
        message.content.includes('Node owner-intake resumed at:'));

    expect(reopenedMessage).toBeTruthy();
    expect(reopenedMessage.content.includes('Node owner-gate started at:')).toBeFalsy();
    expect(reopenedMessage.content.includes('Handoffs received:')).toBeTruthy();
    expect(reopenedMessage.content.includes('From successor ta (please take necessary action so the successor can complete its work):')).toBeTruthy();
    expect(reopenedMessage.content.includes('Reviewer requests revision to the Owner brief.')).toBeTruthy();
    expect(session!.currentNodeId).toBe('owner-intake');
    expect(
      sink.events.some(event => event.kind === 'role.active' && event.nodeId === 'owner-intake'),
      'backward re-entry should emit a fresh role.active activation'
    ).toBeTruthy();
  });

  it('Orchestrator: role instances with the same base role use separate sessions', async () => {
    resetState();

    const flowRun = makeInstanceFlowRun({ runningNodes: ['owner-one', 'owner-two'] });
    SessionStore.saveFlowRun(flowRun);

    const unpatch = patchLLM(new MockProvider([
      { type: 'text', text: 'Owner one pauses. ```handoff\ntype: prompt-human\n```' },
      { type: 'text', text: 'Owner two pauses. ```handoff\ntype: prompt-human\n```' }
    ]));

    const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
    try {
      await runStoredFlowUntil(orchestrator, flowRun.flowId, () => {
        const updated = SessionStore.loadFlowRun(flowRef('instance-flow-id'), workspaceRoot);
        return Boolean(updated?.awaitingHumanNodes['owner-one'] && updated?.awaitingHumanNodes['owner-two']);
      });
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

    expect(ownerOneSession !== null).toBeTruthy();
    expect(ownerTwoSession !== null).toBeTruthy();
    expect(ownerOneSession!.roleName).toBe('owner_1');
    expect(ownerTwoSession!.roleName).toBe('owner_2');
    expect(ownerOneSession!.logicalSessionId).toBe(ownerInstanceSessionId(1));
    expect(ownerTwoSession!.logicalSessionId).toBe(ownerInstanceSessionId(2));
    expect(ownerOneSession!.transcriptHistory).not.toEqual(ownerTwoSession!.transcriptHistory);
    expect((ownerOneSession!.systemPrompt ?? '').includes('Loaded from base role owner.')).toBeTruthy();
    expect((ownerTwoSession!.systemPrompt ?? '').includes('Loaded from base role owner.')).toBeTruthy();
  });

  it('Orchestrator: multiple queued human replies resume distinct role instances in one scheduler pass', async () => {
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
    expect(resumedNodeIds).toEqual(['owner-one', 'owner-two']);

    const updated = SessionStore.loadFlowRun(flowRef('instance-flow-id'), workspaceRoot)!;
    expect(updated.pendingHumanInputs).toEqual({});
    expect(updated.awaitingHumanNodes['owner-one']).toBeTruthy();
    expect(updated.awaitingHumanNodes['owner-two']).toBeTruthy();
  });

  it('Orchestrator: awaiting-handoff node wakes on inbound successor handoff', async () => {
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
    expect(updated.awaitingHandoff.includes('owner-intake')).toBeFalsy();
    expect(updated.awaitingHumanNodes['owner-intake']).toBeTruthy();
  });

  it('Orchestrator: queued human input wakes awaiting-handoff before inbound handoff', async () => {
    resetState();

    SessionStore.saveRoleSession({
      roleName: 'owner',
      logicalSessionId: ownerSessionId(),
      transcriptHistory: [
        { role: 'user', content: 'owner-intake entry message' },
        { role: 'assistant', content: 'Waiting for the subagent handoff.' }
      ],
      currentNodeContext: {
        nodeId: 'owner-intake',
        exchanges: [
          { role: 'user', content: 'owner-intake entry message' },
          { role: 'assistant', content: 'Waiting for the subagent handoff.' }
        ],
      },
      isActive: false,
      currentNodeId: 'owner-intake'
    }, flowRef(), workspaceRoot);

    const flowRun = makeFlowRun({
      runningNodes: [],
      awaitingHumanNodes: {},
      pendingHumanInputs: {
        'owner-intake': {
          text: 'Proceed with the human override before reading the subagent result.',
          receivedAt: '2026-06-11T00:00:00.000Z',
        },
      },
      visitedNodeIds: ['owner-intake', 'ta'],
      completedHandoffs: ['owner-intake=>ta'],
      receivingHandoff: {
        'ta=>owner-intake': [reviewFeedbackArtifactRel]
      },
      historyHandoff: {
        'owner-intake=>ta': [ownerArtifact1Rel],
        'ta=>owner-intake': [reviewFeedbackArtifactRel]
      },
      awaitingHandoff: ['owner-intake']
    });
    SessionStore.saveFlowRun(flowRun);

    let firstModelInputText = '';
    let modelCallCount = 0;
    const unpatch = patchLLM(new MockProvider([
      (messages) => {
        modelCallCount++;
        if (!firstModelInputText) {
          firstModelInputText = messages
            .map((message) => typeof (message as any).content === 'string' ? (message as any).content : '')
            .join('\n');
        }
        return { type: 'text', text: 'Human override handled. ```handoff\ntype: prompt-human\n```' };
      }
    ]));

    const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
    try {
      await runStoredFlowUntil(orchestrator, flowRun.flowId, () => {
        const updated = SessionStore.loadFlowRun(flowRef(), workspaceRoot);
        return Boolean(
          updated &&
          modelCallCount > 0 &&
          !updated.awaitingHandoff.includes('owner-intake') &&
          Object.keys(updated.pendingHumanInputs).length === 0
        );
      });
    } finally {
      unpatch();
    }

    const updated = SessionStore.loadFlowRun(flowRef(), workspaceRoot)!;
    expect(updated.pendingHumanInputs).toEqual({});
    expect(updated.awaitingHandoff.includes('owner-intake')).toBeFalsy();
    expect(modelCallCount).toBeGreaterThan(0);
    expect(firstModelInputText).toContain('Proceed with the human override before reading the subagent result.');
    expect(firstModelInputText).not.toContain('Handoffs received:');
    expect(firstModelInputText).not.toContain('Reviewer requests revision to the Owner brief.');
  });

  it('Orchestrator: same-role received handoffs are claimed in graph order', async () => {
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
    expect(updated.awaitingHumanNodes['owner-intake']).toBeTruthy();
    expect(updated.runningNodes.includes('owner-gate')).toBeFalsy();
    expect(updated.receivingHandoff['ta=>owner-gate']).toEqual([path.relative(workspaceRoot, taArtifact)]);
  });

  it('Orchestrator: same-role-instance initial running nodes are serialized by the scheduler', async () => {
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
    expect(updated.runningNodes.includes('owner-gate')).toBeFalsy();
    expect(updated.awaitingHumanNodes['owner-intake']).toBeTruthy();
  });

  it('Orchestrator: handoff to busy same-role target is accepted and left ready', async () => {
    resetState();

    const flowRun = makeFlowRun({
      runningNodes: ['ta'],
      awaitingHumanNodes: { 'owner-intake': { role: 'owner', reason: 'prompt-human' } },
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
      await runStoredFlowUntil(orchestrator, flowRun.flowId, () =>
        SessionStore.loadFlowRun(flowRef(), workspaceRoot)?.completedHandoffs.includes('ta=>owner-gate') ?? false
      );
    } finally {
      unpatch();
    }

    const updated = SessionStore.loadFlowRun({ projectNamespace, flowId: flowRun.flowId }, workspaceRoot)!;
    expect(updated.completedHandoffs.includes('ta=>owner-gate')).toBeTruthy();
    expect(updated.receivingHandoff['ta=>owner-gate']).toEqual([handoffArtifact]);
    expect(updated.awaitingHumanNodes['owner-intake']).toBeTruthy();
    expect(updated.runningNodes.includes('owner-gate')).toBeFalsy();
    expect(sink.events.some(event => event.kind === 'repair.requested')).toBeFalsy();
  });
