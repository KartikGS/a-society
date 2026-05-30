import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Writable } from 'node:stream';
import {
  FEEDBACK_CONSENT_STATUS,
  IMPROVEMENT_CHOICE_MODE,
} from '../../src/common/protocol-constants.js';
import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
import {
  setupTestTelemetry,
  clearTestSpans,
  clearTestMetrics,
  flushTestTelemetry,
  getSpan,
  getSpansByName,
  getEvents,
  getMetricDataPoints
} from '../telemetry-test-helper.js';
import { TelemetryManager } from '../../src/observability/observability.js';
import { HandoffParseError } from '../../src/orchestration/handoff.js';
import { LLMGateway } from '../../src/providers/llm.js';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { validateWorkflowFile } from '../../src/framework-services/workflow-graph-validator.js';
import { deterministicFindingsFilePath } from '../../src/framework-services/backward-pass-orderer.js';
import { ImprovementOrchestrator } from '../../src/improvement/improvement.js';
import { runRoleTurn } from '../../src/orchestration/orient.js';
import { SessionStore } from '../../src/orchestration/store.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import { seedTestModelSettings } from '../integration/settings-test-utils.js';

import type { 
  LLMProvider, 
  OperatorEvent,
  OperatorRenderSink,
  RuntimeMessageParam, 
  ProviderTurnResult, 
  ToolDefinition,
  TurnOptions
} from '../../src/common/types.js';

// --- Mocks ---

class MockProvider implements LLMProvider {
  private responses: ProviderTurnResult[];
  private callCount = 0;

  constructor(responses: ProviderTurnResult[]) {
    this.responses = responses;
  }

  async executeTurn(_system: string, messages: RuntimeMessageParam[], tools?: ToolDefinition[], options?: TurnOptions): Promise<ProviderTurnResult> {
    const tracer = TelemetryManager.getTracer();
    return tracer.startActiveSpan('provider.execute_turn', {
      kind: 1, // CLIENT
      attributes: {
        'gen_ai.system': 'mock',
        'gen_ai.operation.name': 'chat',
        'gen_ai.request.model': 'mock-model',
        'provider.tools_count': tools?.length ?? 0,
        'provider.message_count': messages.length
      }
    }, async (span) => {
      const res = this.responses[this.callCount % this.responses.length];
      this.callCount++;
      if (res.contextUsage !== undefined) span.setAttribute('gen_ai.usage.input_tokens', res.contextUsage);
      span.setAttribute('provider.result_type', res.type);
      if (res.type === 'text') {
        options?.outputStream?.write(res.text);
        options?.onAssistantTextDelta?.(res.text);
      }
      span.end();
      return res;
    });
  }
}

class CaptureRenderer implements OperatorRenderSink {
  public events: OperatorEvent[] = [];

  emit(event: OperatorEvent): void {
    this.events.push(event);
  }

  requestSent(_role: string, _provider: string, _model: string): void {}
  receivingResponse(_role: string): void {}
  responseEnd(_role: string): void {}
  sendError(_message: string): void {}
}

// --- Test Harness ---

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    // console.error(err.stack);
    failed++;
  }
}

async function run() {
  await setupTestTelemetry();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-test-'));
  const stateDir = path.join(tmpDir, '.state');
  const settingsDir = path.join(tmpDir, '.settings');
  const directRunRecordFolderPath = getFlowRecordDir(tmpDir, { projectNamespace: 'a-society', flowId: 'direct-run-role-turn' });
  const projectGateway = (provider: MockProvider): LLMGateway => new LLMGateway({
    mode: 'project',
    workspaceRoot: tmpDir,
    projectNamespace: 'a-society',
    recordFolderPath: getFlowRecordDir(tmpDir, { projectNamespace: 'a-society', flowId: 'observability-gateway' }),
    provider,
  });
  
  // registry.ts buildRoleContext(projectNamespace, roleInstanceId, workspaceRoot)
  // For projectNamespace "a-society" and roleInstanceId "curator", it looks for:
  // [workspaceRoot]/a-society/a-docs/roles/curator/required-readings.yaml
  // This is because the namespace selects the project folder under the workspace.
  const namespaceDir = path.join(tmpDir, 'a-society');
  const rolesDir = path.join(namespaceDir, 'a-docs', 'roles');
  fs.mkdirSync(rolesDir, { recursive: true });
  fs.mkdirSync(path.join(rolesDir, 'curator'), { recursive: true });
  fs.mkdirSync(path.join(rolesDir, 'owner'), { recursive: true });
  fs.writeFileSync(path.join(rolesDir, 'curator', 'required-readings.yaml'), 'role: curator\nrequired_readings: []\n');
  fs.writeFileSync(path.join(rolesDir, 'curator', 'main.md'), '---\nrole: curator\n---\nHello');
  fs.writeFileSync(path.join(rolesDir, 'curator', 'ownership.yaml'), 'role: curator\nsurfaces: []\n');
  fs.writeFileSync(path.join(rolesDir, 'owner', 'required-readings.yaml'), 'role: owner\nrequired_readings: []\n');
  fs.writeFileSync(path.join(rolesDir, 'owner', 'main.md'), '---\nrole: owner\n---\nHello');
  fs.writeFileSync(path.join(rolesDir, 'owner', 'ownership.yaml'), 'role: owner\nsurfaces: []\n');

  process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE = 'true';
  process.env.A_SOCIETY_SETTINGS_DIR = settingsDir;
  seedTestModelSettings(settingsDir, { providerBaseUrl: 'http://127.0.0.1:1/v1' });

  console.log('\nobservability-foundation integration corrections (Pass 2)');

  await test('Scenario: LLMGateway.executeTurn with tool rounds (REAL CODE)', async () => {
    clearTestSpans();
    clearTestMetrics();
    const mockProvider = new MockProvider([
      { 
        type: 'tool_calls', 
        calls: [{ id: 'call_1', name: 'read_file', input: { path: 'nonexistent.txt' } }], 
        continuationMessages: [{ role: 'assistant_tool_calls', calls: [{ id: 'call_1', name: 'read_file', input: { path: 'nonexistent.txt' } }] }],
        contextUsage: 30
      },
      { 
        type: 'text', 
        text: 'File not found.',
        contextUsage: 20
      }
    ]);

    const gateway = projectGateway(mockProvider);
    await gateway.executeTurn('You are a tester.', [{ role: 'user', content: 'test tool calls' }]);

    const gatewaySpan = getSpan('llm.gateway.execute_turn');
    assert.strictEqual(gatewaySpan.attributes['llm.tools_enabled'], true);
    assert.ok(getEvents(gatewaySpan).find(e => e.name === 'llm.tool_round' && e.attributes['round_index'] === 0));

    const providerSpans = getSpansByName('provider.execute_turn');
    assert.strictEqual(providerSpans.length, 2);
    assert.strictEqual(providerSpans[0].attributes['gen_ai.usage.input_tokens'], 30);
    assert.strictEqual(providerSpans[0].attributes['provider.result_type'], 'tool_calls');
  });

  await test('Scenario: runRoleTurn with empty history returns null (no auto-seed)', async () => {
    clearTestSpans();
    clearTestMetrics();

    const output = new Writable({ write(_c, _e, cb) { cb(); } });

    const result = await runRoleTurn(
      tmpDir,
      'a-society',
      'curator',
      'System prompt',
      [],
      output,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      directRunRecordFolderPath
    );

    // With no user message in history, orient.ts must return null rather than injecting a prompt.
    assert.strictEqual(result, null);
  });

  await test('Scenario: Prompt-human suspension in orient.ts (REAL CODE)', async () => {
    clearTestSpans();
    clearTestMetrics();
    const mockProvider = new MockProvider([
      { type: 'text', text: 'I need clarification. ```handoff\ntype: prompt-human\n```' }
    ]);
    let capturedOutput = '';
    const output = new Writable({
      write(chunk, _encoding, callback) {
        capturedOutput += chunk.toString();
        callback();
      }
    });
    
    // Patch LLMGateway constructor to return a gateway with our mock provider
    const originalExecuteTurn = LLMGateway.prototype.executeTurn;
    LLMGateway.prototype.executeTurn = async function(sys, hist, opts) {
        return originalExecuteTurn.call(projectGateway(mockProvider), sys, hist, opts);
    };

    try {
        await runRoleTurn(
            tmpDir,
            'a-society',
            'curator',
            'System prompt', 
            [{ role: 'user', content: 'Who are you?' }], 
            output,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            directRunRecordFolderPath
        );
    } finally {
        LLMGateway.prototype.executeTurn = originalExecuteTurn;
    }

    assert.ok(capturedOutput.includes('I need clarification.'));
  });

  await test('Scenario: successful handoff returns usage but does not emit it from orient.ts', async () => {
    clearTestSpans();
    clearTestMetrics();
    const mockProvider = new MockProvider([
      {
        type: 'text',
        text: 'I need clarification. ```handoff\ntype: prompt-human\n```',
        contextUsage: 46
      }
    ]);
    const sequence: string[] = [];
    const renderer = new CaptureRenderer();
    const output = new Writable({
      write(chunk, _encoding, callback) {
        sequence.push(`assistant:${chunk.toString()}`);
        callback();
      }
    });

    const originalExecuteTurn = LLMGateway.prototype.executeTurn;
    LLMGateway.prototype.executeTurn = async function(sys, hist, opts) {
      return originalExecuteTurn.call(projectGateway(mockProvider), sys, hist, opts);
    };

    const originalEmit = renderer.emit.bind(renderer);
    renderer.emit = (event: OperatorEvent) => {
      sequence.push(`event:${event.kind}`);
      originalEmit(event);
    };

    try {
      const result = await runRoleTurn(
        tmpDir,
        'a-society',
        'curator',
        'System prompt',
        [{ role: 'user', content: 'Who are you?' }],
        output,
        undefined,
        renderer,
        undefined,
        undefined,
        undefined,
        undefined,
        directRunRecordFolderPath
      );
      assert.deepStrictEqual(result, {
        handoff: { kind: 'awaiting_human' },
        contextUsage: 46
      });
    } finally {
      LLMGateway.prototype.executeTurn = originalExecuteTurn;
    }

    assert.deepStrictEqual(sequence, [
      'assistant:I need clarification. ```handoff\ntype: prompt-human\n```'
    ]);
    assert.deepStrictEqual(renderer.events, []);
  });

  await test('Scenario: Handoff parse failure in orient.ts requests repair (REAL CODE)', async () => {
    clearTestSpans();
    clearTestMetrics();
    const mockProvider = new MockProvider([
      { type: 'text', text: 'I broke the handoff. ```handoff\ntarget_node_id:\n```' }
    ]);

    const originalExecuteTurn = LLMGateway.prototype.executeTurn;
    LLMGateway.prototype.executeTurn = async function(sys, hist, opts) {
      return originalExecuteTurn.call(projectGateway(mockProvider), sys, hist, opts);
    };

    try {
      await runRoleTurn(
        tmpDir,
        'a-society',
        'curator',
        'System prompt',
        [{ role: 'user', content: 'Produce a handoff.' }],
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        directRunRecordFolderPath
      );
      assert.fail('Expected parse failure to propagate as HandoffParseError.');
    } catch (error: any) {
      assert.ok(error instanceof HandoffParseError);
    } finally {
      LLMGateway.prototype.executeTurn = originalExecuteTurn;
    }

    await flushTestTelemetry();

    const points = getMetricDataPoints('a_society.handoff.parse_failure');
    const parseFailurePoint = points.find(point =>
      point.attributes['project_namespace'] === 'a-society' &&
      point.attributes['role_name'] === 'curator'
    );
    assert.ok(parseFailurePoint);
    assert.strictEqual(parseFailurePoint?.value, 1);
  });

  await test('Scenario: parse failure in orient.ts does not emit usage summary', async () => {
    clearTestSpans();
    clearTestMetrics();
    const mockProvider = new MockProvider([
      {
        type: 'text',
        text: 'I broke the handoff. ```handoff\ntarget_node_id:\n```',
        contextUsage: 29
      }
    ]);
    const renderer = new CaptureRenderer();
    const originalExecuteTurn = LLMGateway.prototype.executeTurn;
    LLMGateway.prototype.executeTurn = async function(sys, hist, opts) {
      return originalExecuteTurn.call(projectGateway(mockProvider), sys, hist, opts);
    };

    try {
      await runRoleTurn(
        tmpDir,
        'a-society',
        'curator',
        'System prompt',
        [{ role: 'user', content: 'Produce a handoff.' }],
        undefined,
        undefined,
        renderer,
        undefined,
        undefined,
        undefined,
        undefined,
        directRunRecordFolderPath
      );
      assert.fail('Expected parse failure to propagate as HandoffParseError.');
    } catch (error: any) {
      assert.ok(error instanceof HandoffParseError);
    } finally {
      LLMGateway.prototype.executeTurn = originalExecuteTurn;
    }

    assert.deepStrictEqual(renderer.events, []);
  });

  await test('Scenario: Orchestrator emits usage only after accepted handoff and before handoff notice', async () => {
    clearTestSpans();
    clearTestMetrics();
    process.env.A_SOCIETY_STATE_DIR = stateDir;
    SessionStore.init();

    const recordDir = getFlowRecordDir(tmpDir, { projectNamespace: 'a-society', flowId: 'accepted-handoff-flow' });
    fs.mkdirSync(recordDir, { recursive: true });
    fs.writeFileSync(
      path.join(recordDir, 'workflow.yaml'),
      'workflow:\n  name: Accepted Handoff Test\n  nodes:\n    - id: start\n      role: curator\n    - id: next\n      role: owner\n  edges:\n    - from: start\n      to: next\n'
    );
    fs.writeFileSync(path.join(tmpDir, 'accepted-output.md'), 'Accepted artifact content.');

    const flowRun: any = {
      flowId: 'accepted-handoff-flow',
      workspaceRoot: tmpDir,
      projectNamespace: 'a-society',
      recordFolderPath: recordDir,
      runningNodes: ['start'],
      awaitingHumanNodes: {},
      pendingHumanInputs: {},
      completedNodes: [],
      completedHandoffs: [],
      status: 'running',
      stateVersion: CURRENT_FLOW_STATE_VERSION
    };
    SessionStore.saveFlowRun(flowRun);

    const mockProvider = new MockProvider([
      {
        type: 'text',
        text: "Accepted. ```handoff\ntarget_node_id: 'next'\nartifact_path: 'accepted-output.md'\n```",
        contextUsage: 68
      }
    ]);
    const renderer = new CaptureRenderer();

    const originalExecuteTurn = LLMGateway.prototype.executeTurn;
    LLMGateway.prototype.executeTurn = async function(sys, hist, opts) {
      return originalExecuteTurn.call(projectGateway(mockProvider), sys, hist, opts);
    };

    try {
      const orchestrator = new FlowOrchestrator(renderer as any);
      await orchestrator.advanceFlow(flowRun, 'start');
    } finally {
      LLMGateway.prototype.executeTurn = originalExecuteTurn;
    }

    const eventKinds = renderer.events.map(event => event.kind);
    assert.deepStrictEqual(eventKinds, [
      'role.active',
      'usage.turn_summary',
      'handoff.applied'
    ]);
    const usageEvent = renderer.events[1];
    assert.strictEqual(usageEvent.kind, 'usage.turn_summary');
    assert.deepStrictEqual(
      usageEvent,
      { kind: 'usage.turn_summary', role: 'curator', contextUsage: 68 }
    );

    const storedSession = SessionStore.loadRoleSession(
      'curator',
      { projectNamespace: 'a-society', flowId: 'accepted-handoff-flow' },
      tmpDir
    );
    assert.strictEqual(storedSession?.latestContextUsage, 68);
  });

  await test('Scenario: validateWorkflowFile (REAL CODE)', async () => {
    clearTestSpans();
    clearTestMetrics();
    const workflowsDir = path.join(tmpDir, 'record');
    fs.mkdirSync(workflowsDir, { recursive: true });
    const workflowPath = path.join(workflowsDir, 'workflow.yaml');
    fs.writeFileSync(workflowPath, 'workflow:\n  name: Test Workflow\n  nodes:\n    - id: node_1\n      role: owner\n  edges: []\n');

    const result = validateWorkflowFile(workflowPath);
    assert.ok(result.valid);
  });

  await test('Scenario: ImprovementOrchestrator closure (REAL CODE)', async () => {
    clearTestSpans();
    clearTestMetrics();
    process.env.A_SOCIETY_STATE_DIR = stateDir;
    SessionStore.init();
    
    const flowRun: any = {
      flowId: 'test-flow',
      workspaceRoot: tmpDir,
      projectNamespace: path.basename(tmpDir),
      recordFolderPath: getFlowRecordDir(tmpDir, { projectNamespace: path.basename(tmpDir), flowId: 'test-flow' }),
      runningNodes: [],
      awaitingHumanNodes: {},
      pendingHumanInputs: {},
      completedNodes: [],
      completedHandoffs: [],
      receivingHandoff: {},
      historyHandoff: {},
      awaitingHandoff: [],
      status: 'running',
      stateVersion: CURRENT_FLOW_STATE_VERSION,
      improvementPhase: null
    };

    fs.mkdirSync(flowRun.recordFolderPath, { recursive: true });

    ImprovementOrchestrator.markAwaitingChoice(flowRun);
    SessionStore.saveFlowRun(flowRun, SessionStore.flowRef(flowRun), tmpDir);
    await ImprovementOrchestrator.skipImprovement(flowRun);

    assert.strictEqual(flowRun.status, 'completed');
    assert.strictEqual(flowRun.improvementPhase.status, 'skipped');
    assert.strictEqual(flowRun.improvementPhase.mode, IMPROVEMENT_CHOICE_MODE.NONE);
  });

  await test('Scenario: ImprovementOrchestrator repairs feedback until terminal handoff (REAL CODE)', async () => {
    clearTestSpans();
    clearTestMetrics();
    process.env.A_SOCIETY_STATE_DIR = stateDir;
    SessionStore.init();

    const derivedNamespaceDir = path.join(tmpDir, path.basename(tmpDir), 'a-docs', 'roles');
    const projectRoot = path.join(tmpDir, path.basename(tmpDir));
    const aDocsRoot = path.join(projectRoot, 'a-docs');
    fs.mkdirSync(derivedNamespaceDir, { recursive: true });
    fs.mkdirSync(path.join(derivedNamespaceDir, 'owner'), { recursive: true });
    fs.mkdirSync(path.join(derivedNamespaceDir, 'curator'), { recursive: true });
    fs.writeFileSync(path.join(derivedNamespaceDir, 'owner', 'required-readings.yaml'), 'role: owner\nrequired_readings: []\n');
    fs.writeFileSync(path.join(derivedNamespaceDir, 'owner', 'main.md'), '---\nrole: owner\n---\nHello');
    fs.writeFileSync(path.join(derivedNamespaceDir, 'owner', 'ownership.yaml'), 'role: owner\nsurfaces: []\n');
    fs.writeFileSync(path.join(derivedNamespaceDir, 'curator', 'required-readings.yaml'), 'role: curator\nrequired_readings: []\n');
    fs.writeFileSync(path.join(derivedNamespaceDir, 'curator', 'main.md'), '---\nrole: curator\n---\nHello');
    fs.writeFileSync(path.join(derivedNamespaceDir, 'curator', 'ownership.yaml'), 'role: curator\nsurfaces: []\n');

    // Use the same namespace as derivedNamespaceDir so the fixture matches the live FlowRun contract:
    // workspaceRoot = workspace root, projectNamespace = project folder name.
    const improvementNamespace = path.basename(tmpDir);
    const recordDir = getFlowRecordDir(tmpDir, { projectNamespace: improvementNamespace, flowId: 'repair-flow' });
    const runtimeContractsRoot = path.join(tmpDir, 'a-society', 'runtime', 'contracts');
    fs.mkdirSync(recordDir, { recursive: true });
    fs.mkdirSync(runtimeContractsRoot, { recursive: true });
    fs.mkdirSync(path.join(aDocsRoot, 'improvement'), { recursive: true });
    fs.mkdirSync(path.join(aDocsRoot, 'indexes'), { recursive: true });
    fs.mkdirSync(path.join(aDocsRoot, 'workflow'), { recursive: true });
    fs.writeFileSync(path.join(aDocsRoot, 'improvement', 'meta-analysis.md'), 'Meta-analysis instructions');
    fs.writeFileSync(path.join(aDocsRoot, 'improvement', 'feedback.md'), 'Feedback instructions');
    fs.writeFileSync(path.join(runtimeContractsRoot, 'feedback.md'), 'Runtime feedback instructions');
    fs.writeFileSync(path.join(aDocsRoot, 'indexes', 'main.md'), '');
    fs.writeFileSync(
      path.join(aDocsRoot, 'workflow', 'main.yaml'),
      'workflow:\n  name: Canonical Improvement Workflow\n  nodes:\n    - id: owner-feedback\n      role: owner\n  edges: []\n'
    );
    fs.writeFileSync(
      path.join(recordDir, 'workflow.yaml'),
      'workflow:\n  name: Test Workflow\n  nodes:\n    - id: curator\n      role: curator\n  edges: []\n'
    );
    const assignedFindingsPath = deterministicFindingsFilePath(recordDir, 'curator');
    fs.mkdirSync(path.dirname(assignedFindingsPath), { recursive: true });
    fs.writeFileSync(assignedFindingsPath, 'Existing findings');

    const findingsPath = path.relative(tmpDir, assignedFindingsPath);
    const feedbackArtifactPath = path.join(
      'a-society',
      'feedback',
      `${path.basename(tmpDir).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-flow-repair-flow.md`
    );
    const assignedFeedbackFilePath = path.join(tmpDir, feedbackArtifactPath);
    fs.mkdirSync(path.dirname(assignedFeedbackFilePath), { recursive: true });
    fs.writeFileSync(assignedFeedbackFilePath, 'Existing feedback target', 'utf8');
    const flowRun: any = {
      flowId: 'repair-flow',
      workspaceRoot: tmpDir,
      projectNamespace: improvementNamespace,
      runningNodes: [],
      awaitingHumanNodes: {},
      pendingHumanInputs: {},
      completedNodes: [],
      completedHandoffs: [],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
      status: 'running',
      stateVersion: CURRENT_FLOW_STATE_VERSION,
      improvementPhase: null,
      recordFolderPath: recordDir,
      feedbackContext: {
        kind: 'standard'
      }
    };

    SessionStore.saveRoleSession({
      roleName: 'curator',
      logicalSessionId: 'repair-flow__curator',
      transcriptHistory: [
        { role: 'user', content: 'Forward-pass curator assignment.' },
        { role: 'assistant', content: 'Forward-pass curator output.' }
      ],
      isActive: false,
      currentNodeId: 'curator'
    }, SessionStore.flowRef(flowRun), tmpDir);

    const mockProvider = new MockProvider([
      { type: 'text', text: `Saved findings. \`\`\`handoff\ntype: meta-analysis-complete\nfindings_path: ${findingsPath}\n\`\`\`` },
      { type: 'text', text: 'Need clarification. ```handoff\ntype: prompt-human\n```' },
      { type: 'text', text: `Feedback complete. \`\`\`handoff\ntype: backward-pass-complete\nartifact_path: ${feedbackArtifactPath}\n\`\`\`` }
    ]);

    const originalExecuteTurn = LLMGateway.prototype.executeTurn;
    const observedHistories: RuntimeMessageParam[][] = [];
    LLMGateway.prototype.executeTurn = async function(sys, hist, opts) {
      observedHistories.push((hist as RuntimeMessageParam[]).map(message => ({ ...message })));
      const result = await originalExecuteTurn.call(projectGateway(mockProvider), sys, hist, opts);
      if (result.text.includes('type: meta-analysis-complete')) {
        fs.mkdirSync(path.dirname(assignedFindingsPath), { recursive: true });
        fs.writeFileSync(assignedFindingsPath, 'Generated findings', 'utf8');
      }
      if (result.text.includes('type: backward-pass-complete')) {
        fs.writeFileSync(assignedFeedbackFilePath, 'Generated feedback', 'utf8');
      }
      return result;
    };

    const repairSummaries: string[] = [];
    const renderer = {
      emit(event: any) {
        if (event?.kind === 'repair.requested') {
          repairSummaries.push(String(event.summary));
          if (repairSummaries.length > 5) {
            throw new Error(`repair loop: ${repairSummaries.join(' || ')}`);
          }
        }
      },
      requestSent() {},
      receivingResponse() {},
      responseEnd() {},
      sendError() {}
    };
    let finalFlowRun: any;

    try {
      ImprovementOrchestrator.markAwaitingChoice(flowRun);
      SessionStore.saveFlowRun(flowRun, SessionStore.flowRef(flowRun), tmpDir);
      const improvementOrchestrator = new ImprovementOrchestrator();
      await improvementOrchestrator.runImprovement(
        flowRun,
        IMPROVEMENT_CHOICE_MODE.GRAPH_BASED,
        renderer
      );
      const afterMetaAnalysis = SessionStore.loadFlowRun(SessionStore.flowRef(flowRun), tmpDir)!;
      assert.strictEqual(afterMetaAnalysis.status, 'awaiting_feedback_consent');
      assert.strictEqual(afterMetaAnalysis.improvementPhase?.status, 'awaiting_feedback_consent');
      assert.deepStrictEqual(afterMetaAnalysis.improvementPhase?.completedNodeIds, [
        'curator-meta-analysis'
      ]);
      await improvementOrchestrator.runFeedback(
        afterMetaAnalysis,
        renderer
      );
      finalFlowRun = SessionStore.loadFlowRun(SessionStore.flowRef(flowRun), tmpDir)!;
    } finally {
      LLMGateway.prototype.executeTurn = originalExecuteTurn;
    }

    assert.strictEqual(finalFlowRun.status, 'completed');
    assert.strictEqual(finalFlowRun.stateVersion, CURRENT_FLOW_STATE_VERSION, 'improvement initialization must keep the latest state version');
    assert.ok(fs.existsSync(path.join(recordDir, 'improvement.yaml')), 'improvement run should persist improvement.yaml');
    assert.strictEqual(finalFlowRun.improvementPhase?.improvementWorkflowPath, path.relative(tmpDir, path.join(recordDir, 'improvement.yaml')));
    assert.deepStrictEqual(finalFlowRun.improvementPhase?.activeNodeIds, []);
    assert.deepStrictEqual(finalFlowRun.improvementPhase?.completedNodeIds, [
      'curator-meta-analysis',
      'a-society-feedback-feedback'
    ]);
    assert.strictEqual(finalFlowRun.improvementPhase?.feedbackArtifactPath, feedbackArtifactPath);
    assert.strictEqual(finalFlowRun.improvementPhase?.feedbackConsent, FEEDBACK_CONSENT_STATUS.GRANTED);
    const metaUserMessage = observedHistories[0][0];
    const metaAssistantMessage = observedHistories[0][1];
    const metaImprovementMessage = observedHistories[0][2];
    const feedbackMessage = observedHistories[1][0];
    assert.ok('content' in metaUserMessage);
    assert.ok('content' in metaAssistantMessage);
    assert.ok('content' in metaImprovementMessage);
    assert.ok('content' in feedbackMessage);
    assert.strictEqual(metaUserMessage.content, 'Forward-pass curator assignment.');
    assert.strictEqual(metaAssistantMessage.content, 'Forward-pass curator output.');
    assert.ok(metaImprovementMessage.role === 'user' && metaImprovementMessage.content.includes('Backward pass meta-analysis.'));
    assert.ok(metaImprovementMessage.role === 'user' && metaImprovementMessage.content.includes(`runtime-assigned path: ${findingsPath}`));
    assert.ok(feedbackMessage.content.includes('[FILE: a-society/runtime/contracts/feedback.md]'));
    assert.ok(feedbackMessage.content.includes(`[FILE: ${findingsPath}]`));
    assert.ok(feedbackMessage.content.includes('Runtime feedback instructions'));
    assert.ok(feedbackMessage.content.includes(`Source flow ID: repair-flow`));
    assert.ok(feedbackMessage.content.includes(`Flow kind: standard`));
    assert.ok(feedbackMessage.content.includes(`runtime-assigned path: ${feedbackArtifactPath}`));
    assert.ok(repairSummaries.includes('a-society-feedback emitted prompt-human during backward pass feedback'));
  });

  console.log(`\n  ${passed} passed, ${failed} failed\n`);
  
  await TelemetryManager.shutdown();
  delete process.env.A_SOCIETY_STATE_DIR;
  delete process.env.A_SOCIETY_SETTINGS_DIR;
  fs.rmSync(tmpDir, { recursive: true, force: true });
  
  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
