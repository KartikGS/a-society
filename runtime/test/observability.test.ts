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
import { HandoffInterpreter } from '../src/handoff.js';
import { LLMGateway } from '../src/llm.js';
import { ToolTriggerEngine } from '../src/triggers.js';
import { ImprovementOrchestrator } from '../src/improvement.js';
import { runInteractiveSession } from '../src/orient.js';
import { SessionStore } from '../src/store.js';

import type { 
  LLMProvider, 
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
  
  // registry.ts buildRoleContext(roleKey, workspaceRoot)
  // For roleKey "a-society__curator", it looks for:
  // [workspaceRoot]/a-society/a-docs/roles/required-readings.yaml
  // This is because the namespace is prepended.
  const namespaceDir = path.join(tmpDir, 'a-society');
  const rolesDir = path.join(namespaceDir, 'a-docs', 'roles');
  fs.mkdirSync(rolesDir, { recursive: true });
  fs.writeFileSync(path.join(rolesDir, 'required-readings.yaml'), 'universal: []\nroles: { curator: [] }');
  fs.writeFileSync(path.join(rolesDir, 'curator.md'), '---\nrole: Curator\n---\nHello');

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
        await runInteractiveSession(
            tmpDir, 
            'a-society__curator', 
            'System prompt', 
            [{ role: 'user', content: 'Who are you?' }], 
            undefined, output, 
            true
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

  await test('Scenario: Handoff parse failure in autonomous orient.ts (REAL CODE)', async () => {
    clearTestSpans();
    clearTestMetrics();
    const mockProvider = new MockProvider([
      { type: 'text', text: 'I broke the handoff. ```handoff\nrole:\n```' }
    ]);

    const originalExecuteTurn = LLMGateway.prototype.executeTurn;
    LLMGateway.prototype.executeTurn = async function(sys, hist, opts) {
      return originalExecuteTurn.call(new LLMGateway(tmpDir, mockProvider), sys, hist, opts);
    };

    try {
      const result = await runInteractiveSession(
        tmpDir,
        'a-society__curator',
        'System prompt',
        [{ role: 'user', content: 'Produce a handoff.' }],
        undefined, undefined,
        true
      );
      assert.strictEqual(result, null);
    } finally {
      LLMGateway.prototype.executeTurn = originalExecuteTurn;
    }

    await flushTestTelemetry();

    const parseSpan = getSpan('handoff.parse');
    assert.strictEqual(parseSpan.attributes['handoff.parse.success'], false);

    const turnSpan = getSpan('session.turn');
    assert.strictEqual(turnSpan.attributes['session.turn.outcome'], undefined);
    assert.ok(getEvents(turnSpan).find(e => e.name === 'session.turn.parse_failed'));

    const points = getMetricDataPoints('a_society.handoff.parse_failure');
    const parseFailurePoint = points.find(point => point.attributes['role_key'] === 'a-society__curator');
    assert.ok(parseFailurePoint);
    assert.strictEqual(parseFailurePoint?.value, 1);
  });

  await test('Scenario: ToolTriggerEngine.evaluateAndTrigger (REAL CODE)', async () => {
    clearTestSpans();
    clearTestMetrics();
    const workflowsDir = path.join(tmpDir, 'record');
    fs.mkdirSync(workflowsDir, { recursive: true });
    const workflowPath = path.join(workflowsDir, 'workflow.md');
    fs.writeFileSync(workflowPath, '---\nworkflow:\n  name: Test Workflow\n  nodes:\n    - id: node_1\n      role: Owner\n  edges: []\n---');

    const flowRun: any = {
      flowId: 'test-flow',
      projectRoot: tmpDir,
      recordFolderPath: workflowsDir,
      activeNodes: ['node_1']
    };
    
    await ToolTriggerEngine.evaluateAndTrigger(flowRun, 'START', { workflowDocumentPath: workflowPath });

    const triggerSpan = getSpan('tool_trigger.execute');
    assert.ok(triggerSpan);
    assert.strictEqual(triggerSpan.attributes['flow.id'], 'test-flow');
    assert.strictEqual(triggerSpan.attributes['trigger.event'], 'START');
    assert.strictEqual(triggerSpan.attributes['trigger.component'], 'Workflow Graph Schema Validator');
    assert.strictEqual(triggerSpan.attributes['trigger.success'], true);
    assert.strictEqual(
      triggerSpan.attributes['trigger.result_summary'],
      `Component 3 execution success: Validated format at ${workflowPath}`
    );
  });

  await test('Scenario: ImprovementOrchestrator closure (REAL CODE)', async () => {
    clearTestSpans();
    clearTestMetrics();
    process.env.A_SOCIETY_STATE_DIR = path.join(tmpDir, '.state');
    SessionStore.init();
    
    const flowRun: any = {
      flowId: 'test-flow',
      projectRoot: tmpDir,
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
      output
    );

    const impSpan = getSpan('improvement.orchestrate');
    assert.ok(impSpan);
    assert.strictEqual(impSpan.attributes['flow.id'], 'test-flow');
    assert.strictEqual(impSpan.attributes['improvement.record_folder'], tmpDir);
    assert.strictEqual(impSpan.attributes['improvement.mode'], 'none');
    assert.ok(getEvents(impSpan).find(e => e.name === 'improvement.mode_selected' && e.attributes['mode'] === 'none'));
    assert.ok(getEvents(impSpan).find(e => e.name === 'store.flow_saved' && e.attributes['stage'] === 'improvement_skipped'));
  });

  console.log(`\n  ${passed} passed, ${failed} failed\n`);
  
  await TelemetryManager.shutdown();
  fs.rmSync(tmpDir, { recursive: true, force: true });
  
  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
