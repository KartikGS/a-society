import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Writable } from 'node:stream';
import {
  setupTestTelemetry,
  clearTestSpans,
  clearTestMetrics,
  flushTestTelemetry,
  getSpan,
  getSpansByName,
  getEvents,
  getMetricDataPoints
} from './telemetry-test-helper.js';
import { TelemetryManager } from '../src/observability.js';
import { HandoffParseError } from '../src/handoff.js';
import { LLMGateway } from '../src/llm.js';
import { FlowOrchestrator } from '../src/orchestrator.js';
import { validateWorkflowFile } from '../src/framework-services/workflow-graph-validator.js';
import { ImprovementOrchestrator } from '../src/improvement.js';
import { runRoleTurn } from '../src/orient.js';
import { SessionStore } from '../src/store.js';

import type { 
  LLMProvider, 
  OperatorEvent,
  OperatorRenderSink,
  RuntimeMessageParam, 
  ProviderTurnResult, 
  ToolDefinition,
  TurnOptions
} from '../src/types.js';

// --- Mocks ---

class MockProvider implements LLMProvider {
  private responses: ProviderTurnResult[];
  private callCount = 0;

  constructor(responses: ProviderTurnResult[]) {
    this.responses = responses;
  }

  async executeTurn(_system: string, messages: RuntimeMessageParam[], tools?: ToolDefinition[], _options?: TurnOptions): Promise<ProviderTurnResult> {
    const tracer = TelemetryManager.getTracer();
    return tracer.startActiveSpan('provider.execute_turn', { 
      kind: 1, // CLIENT
      attributes: { 
        'provider.name': 'mock', 
        'provider.model': 'mock-model',
        'provider.tools_count': tools?.length ?? 0,
        'provider.message_count': messages.length
      } 
    }, async (span) => {
      const res = this.responses[this.callCount % this.responses.length];
      this.callCount++;
      if (res.usage) {
        if (res.usage.inputTokens !== undefined) span.setAttribute('provider.input_tokens', res.usage.inputTokens);
        if (res.usage.outputTokens !== undefined) span.setAttribute('provider.output_tokens', res.usage.outputTokens);
      }
      span.setAttribute('provider.result_type', res.type);
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

  startWait(_provider: string, _model: string): void {}
  stopWait(): void {}
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
  
  // registry.ts buildRoleContext(projectNamespace, roleName, workspaceRoot)
  // For projectNamespace "a-society" and roleName "curator", it looks for:
  // [workspaceRoot]/a-society/a-docs/roles/curator/required-readings.yaml
  // This is because the namespace selects the project folder under the workspace.
  const namespaceDir = path.join(tmpDir, 'a-society');
  const rolesDir = path.join(namespaceDir, 'a-docs', 'roles');
  fs.mkdirSync(rolesDir, { recursive: true });
  fs.mkdirSync(path.join(rolesDir, 'curator'), { recursive: true });
  fs.writeFileSync(path.join(rolesDir, 'curator', 'required-readings.yaml'), 'role: curator\nrequired_readings: []\n');
  fs.writeFileSync(path.join(rolesDir, 'curator', 'main.md'), '---\nrole: Curator\n---\nHello');

  process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE = 'true';

  console.log('\nobservability-foundation integration corrections (Pass 2)');

  await test('Scenario: LLMGateway.executeTurn with tool rounds (REAL CODE)', async () => {
    clearTestSpans();
    clearTestMetrics();
    const mockProvider = new MockProvider([
      { 
        type: 'tool_calls', 
        calls: [{ id: 'call_1', name: 'read_file', input: { path: 'nonexistent.txt' } }], 
        continuationMessages: [{ role: 'assistant_tool_calls', calls: [{ id: 'call_1', name: 'read_file', input: { path: 'nonexistent.txt' } }] }],
        usage: { inputTokens: 10, outputTokens: 20 }
      },
      { 
        type: 'text', 
        text: 'File not found.',
        usage: { inputTokens: 15, outputTokens: 5 }
      }
    ]);

    const gateway = new LLMGateway(tmpDir, mockProvider);
    await gateway.executeTurn('You are a tester.', [{ role: 'user', content: 'test tool calls' }]);

    const gatewaySpan = getSpan('llm.gateway.execute_turn');
    assert.strictEqual(gatewaySpan.attributes['llm.tools_enabled'], true);
    assert.ok(getEvents(gatewaySpan).find(e => e.name === 'llm.tool_round' && e.attributes['round_index'] === 0));

    const providerSpans = getSpansByName('provider.execute_turn');
    assert.strictEqual(providerSpans.length, 2);
    assert.strictEqual(providerSpans[0].attributes['provider.input_tokens'], 10);
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
      output
    );

    // With no user message in history, orient.ts must return null rather than injecting a prompt.
    assert.strictEqual(result, null);

    const intSpan = getSpan('session.interaction');
    assert.strictEqual(intSpan.attributes['session.interaction.outcome'], 'invalid_history');
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
        return originalExecuteTurn.call(new LLMGateway(tmpDir, mockProvider), sys, hist, opts);
    };

    try {
        await runRoleTurn(
            tmpDir,
            'a-society',
            'curator',
            'System prompt', 
            [{ role: 'user', content: 'Who are you?' }], 
            output
        );
    } finally {
        LLMGateway.prototype.executeTurn = originalExecuteTurn;
    }

    assert.ok(capturedOutput.includes('I need clarification.'));

    const intSpan = getSpan('session.interaction');
    assert.strictEqual(intSpan.attributes['session.interaction.outcome'], 'awaiting_human');

    const turnSpan = getSpan('session.turn');
    assert.strictEqual(turnSpan.attributes['session.turn.outcome'], 'handoff');
    assert.ok(getEvents(turnSpan).find(e => e.name === 'session.turn.handoff_detected' && e.attributes['handoff_kind'] === 'awaiting_human'));
  });

  await test('Scenario: successful handoff returns usage but does not emit it from orient.ts', async () => {
    clearTestSpans();
    clearTestMetrics();
    const mockProvider = new MockProvider([
      {
        type: 'text',
        text: 'I need clarification. ```handoff\ntype: prompt-human\n```',
        usage: { inputTokens: 12, outputTokens: 34 }
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
      return originalExecuteTurn.call(new LLMGateway(tmpDir, mockProvider), sys, hist, opts);
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
        renderer
      );
      assert.deepStrictEqual(result, {
        handoff: { kind: 'awaiting_human' },
        usage: { inputTokens: 12, outputTokens: 34 }
      });
    } finally {
      LLMGateway.prototype.executeTurn = originalExecuteTurn;
    }

    assert.deepStrictEqual(sequence, [
      'assistant:I need clarification. ```handoff\ntype: prompt-human\n```',
      'assistant:\n'
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
      return originalExecuteTurn.call(new LLMGateway(tmpDir, mockProvider), sys, hist, opts);
    };

    try {
      await runRoleTurn(
        tmpDir,
        'a-society',
        'curator',
        'System prompt',
        [{ role: 'user', content: 'Produce a handoff.' }],
        undefined
      );
      assert.fail('Expected parse failure to propagate as HandoffParseError.');
    } catch (error: any) {
      assert.ok(error instanceof HandoffParseError);
    } finally {
      LLMGateway.prototype.executeTurn = originalExecuteTurn;
    }

    await flushTestTelemetry();

    const parseSpan = getSpan('handoff.parse');
    assert.strictEqual(parseSpan.attributes['handoff.parse.success'], false);

    const turnSpan = getSpan('session.turn');
    assert.strictEqual(turnSpan.attributes['session.turn.outcome'], 'repair_requested');
    assert.ok(getEvents(turnSpan).find(e => e.name === 'session.turn.parse_failed'));

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
        usage: { inputTokens: 21, outputTokens: 8 }
      }
    ]);
    const renderer = new CaptureRenderer();
    const output = new Writable({ write(_chunk, _encoding, callback) { callback(); } });

    const originalExecuteTurn = LLMGateway.prototype.executeTurn;
    LLMGateway.prototype.executeTurn = async function(sys, hist, opts) {
      return originalExecuteTurn.call(new LLMGateway(tmpDir, mockProvider), sys, hist, opts);
    };

    try {
      await runRoleTurn(
        tmpDir,
        'a-society',
        'curator',
        'System prompt',
        [{ role: 'user', content: 'Produce a handoff.' }],
        output,
        undefined,
        renderer
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

    const recordDir = path.join(tmpDir, 'accepted-handoff-record');
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
      readyNodes: ['start'],
      runningNodes: [],
      awaitingHumanNodes: {},
      completedNodes: [],
      completedEdgeArtifacts: {},
      pendingNodeArtifacts: { start: [] },
      status: 'running',
      stateVersion: '7'
    };
    SessionStore.saveFlowRun(flowRun);

    const mockProvider = new MockProvider([
      {
        type: 'text',
        text: "Accepted. ```handoff\ntarget_node_id: 'next'\nartifact_path: 'accepted-output.md'\n```",
        usage: { inputTokens: 55, outputTokens: 13 }
      }
    ]);
    const renderer = new CaptureRenderer();
    const output = new Writable({ write(_chunk, _encoding, callback) { callback(); } });

    const originalExecuteTurn = LLMGateway.prototype.executeTurn;
    LLMGateway.prototype.executeTurn = async function(sys, hist, opts) {
      return originalExecuteTurn.call(new LLMGateway(tmpDir, mockProvider), sys, hist, opts);
    };

    try {
      const orchestrator = new FlowOrchestrator(renderer as any);
      await orchestrator.advanceFlow(flowRun, 'start', undefined, undefined, undefined, output);
    } finally {
      LLMGateway.prototype.executeTurn = originalExecuteTurn;
    }

    const eventKinds = renderer.events.map(event => event.kind);
    assert.deepStrictEqual(eventKinds, [
      'role.active',
      'usage.turn_summary',
      'handoff.applied',
      'role.active'
    ]);
    const usageEvent = renderer.events[1];
    assert.strictEqual(usageEvent.kind, 'usage.turn_summary');
    assert.deepStrictEqual(
      usageEvent,
      { kind: 'usage.turn_summary', availability: 'full', inputTokens: 55, outputTokens: 13 }
    );
  });

  await test('Scenario: validateWorkflowFile (REAL CODE)', async () => {
    clearTestSpans();
    clearTestMetrics();
    const workflowsDir = path.join(tmpDir, 'record');
    fs.mkdirSync(workflowsDir, { recursive: true });
    const workflowPath = path.join(workflowsDir, 'workflow.yaml');
    fs.writeFileSync(workflowPath, 'workflow:\n  name: Test Workflow\n  nodes:\n    - id: node_1\n      role: Owner\n  edges: []\n');

    const result = validateWorkflowFile(workflowPath, true);
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
      status: 'running',
      improvementPhase: null
    };

    const { Readable, Writable } = await import('node:stream');
    const input = new Readable();
    input.push('3\n');
    input.push(null);
    const output = new Writable({ write(_c, _e, cb) { cb(); } });

    await ImprovementOrchestrator.handleForwardPassClosure(
      flowRun,
      { recordFolderPath: tmpDir, artifactPath: 'test.md' },
      input,
      output,
      { emit: () => {}, startWait: () => {}, stopWait: () => {} }
    );

    const impSpan = getSpan('improvement.orchestrate');
    assert.ok(impSpan);
    assert.strictEqual(impSpan.attributes['flow.id'], 'test-flow');
    assert.strictEqual(impSpan.attributes['improvement.record_folder'], tmpDir);
    assert.strictEqual(impSpan.attributes['improvement.mode'], 'none');
    assert.ok(getEvents(impSpan).find(e => e.name === 'improvement.mode_selected' && e.attributes['mode'] === 'none'));
    assert.ok(getEvents(impSpan).find(e => e.name === 'store.flow_saved' && e.attributes['stage'] === 'improvement_skipped'));
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
    fs.writeFileSync(path.join(derivedNamespaceDir, 'owner', 'main.md'), '---\nrole: Owner\n---\nHello');
    fs.writeFileSync(path.join(derivedNamespaceDir, 'owner', 'ownership.yaml'), 'role: owner\nsurfaces: []\n');
    fs.writeFileSync(path.join(derivedNamespaceDir, 'curator', 'required-readings.yaml'), 'role: curator\nrequired_readings: []\n');
    fs.writeFileSync(path.join(derivedNamespaceDir, 'curator', 'main.md'), '---\nrole: Curator\n---\nHello');
    fs.writeFileSync(path.join(derivedNamespaceDir, 'curator', 'ownership.yaml'), 'role: curator\nsurfaces: []\n');

    const recordDir = path.join(aDocsRoot, 'records', 'repair-record');
    // Use the same namespace as derivedNamespaceDir so the fixture matches the live FlowRun contract:
    // workspaceRoot = workspace root, projectNamespace = project folder name.
    const improvementNamespace = path.basename(tmpDir);
    fs.mkdirSync(recordDir, { recursive: true });
    fs.mkdirSync(path.join(aDocsRoot, 'improvement'), { recursive: true });
    fs.mkdirSync(path.join(aDocsRoot, 'indexes'), { recursive: true });
    fs.mkdirSync(path.join(aDocsRoot, 'workflow'), { recursive: true });
    fs.writeFileSync(path.join(aDocsRoot, 'improvement', 'meta-analysis.md'), 'Meta-analysis instructions');
    fs.writeFileSync(path.join(aDocsRoot, 'improvement', 'feedback.md'), 'Feedback instructions');
    fs.writeFileSync(path.join(aDocsRoot, 'indexes', 'main.md'), '');
    fs.writeFileSync(
      path.join(aDocsRoot, 'workflow', 'main.yaml'),
      'workflow:\n  name: Canonical Improvement Workflow\n  nodes:\n    - id: owner-feedback\n      role: Owner\n  edges: []\n'
    );
    fs.writeFileSync(
      path.join(recordDir, 'workflow.yaml'),
      'workflow:\n  name: Test Workflow\n  nodes:\n    - id: curator\n      role: Curator\n  edges: []\n'
    );
    fs.writeFileSync(path.join(recordDir, '01-curator-findings.md'), 'Existing findings');

    const findingsPath = path.relative(tmpDir, path.join(recordDir, '01-curator-findings.md'));
    const feedbackArtifactPath = path.relative(tmpDir, path.join(recordDir, '02-owner-feedback.md'));
    const closureArtifactPath = path.relative(tmpDir, path.join(recordDir, '00-owner-closure.md'));

    const flowRun: any = {
      flowId: 'repair-flow',
      workspaceRoot: tmpDir,
      projectNamespace: improvementNamespace,
      readyNodes: [],
      runningNodes: [],
      awaitingHumanNodes: {},
      completedNodes: [],
      completedEdgeArtifacts: {},
      pendingNodeArtifacts: {},
      status: 'running',
      stateVersion: '7',
      improvementPhase: null,
      recordFolderPath: recordDir
    };

    const mockProvider = new MockProvider([
      { type: 'text', text: `Saved findings. \`\`\`handoff\ntype: meta-analysis-complete\nfindings_path: ${findingsPath}\n\`\`\`` },
      { type: 'text', text: 'Need clarification. ```handoff\ntype: prompt-human\n```' },
      { type: 'text', text: `Feedback complete. \`\`\`handoff\ntype: backward-pass-complete\nartifact_path: ${feedbackArtifactPath}\n\`\`\`` }
    ]);

    const originalExecuteTurn = LLMGateway.prototype.executeTurn;
    LLMGateway.prototype.executeTurn = async function(sys, hist, opts) {
      return originalExecuteTurn.call(new LLMGateway(tmpDir, mockProvider), sys, hist, opts);
    };

    let capturedOutput = '';
    const { Readable } = await import('node:stream');
    const input = new Readable();
    input.push('1\n');
    input.push(null);
    const output = new Writable({
      write(chunk, _encoding, callback) {
        capturedOutput += chunk.toString();
        callback();
      }
    });

    try {
      await ImprovementOrchestrator.handleForwardPassClosure(
        flowRun,
        { recordFolderPath: recordDir, artifactPath: closureArtifactPath },
        input,
        output,
        { emit: () => {}, startWait: () => {}, stopWait: () => {} }
      );
    } finally {
      LLMGateway.prototype.executeTurn = originalExecuteTurn;
    }

    assert.strictEqual(flowRun.status, 'completed');
    assert.strictEqual(flowRun.stateVersion, '7', 'improvement initialization must keep the latest state version');
    assert.ok(capturedOutput.includes('Owner emitted prompt-human during backward pass feedback. Requesting repair.'));
    assert.ok(capturedOutput.includes('[improvement] Improvement phase complete. Flow closed.'));
  });

  console.log(`\n  ${passed} passed, ${failed} failed\n`);
  
  await TelemetryManager.shutdown();
  delete process.env.A_SOCIETY_STATE_DIR;
  fs.rmSync(tmpDir, { recursive: true, force: true });
  
  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
