import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  LLMProvider,
  ProviderTurnResult,
  RuntimeMessageParam,
  ToolDefinition,
  TurnOptions,
} from '../../src/common/types.js';
import { runRoleTurn } from '../../src/common/role-turn.js';
import { HandoffParseError } from '../../src/orchestration/handoff.js';
import { TelemetryManager } from '../../src/observability/observability.js';
import { LLMGateway } from '../../src/providers/llm.js';
import {
  clearTestMetrics,
  clearTestSpans,
  flushTestTelemetry,
  getEvents,
  getMetricDataPoints,
  getSpan,
  getSpansByName,
  setupTestTelemetry,
} from '../telemetry-test-helper.js';
import { seedTestModelSettings } from '../integration/settings-test-utils.js';

class TelemetryProvider implements LLMProvider {
  private callCount = 0;

  constructor(private readonly responses: ProviderTurnResult[]) {}

  async executeTurn(
    _systemPrompt: string,
    messages: RuntimeMessageParam[],
    tools?: ToolDefinition[],
    options?: TurnOptions
  ): Promise<ProviderTurnResult> {
    const tracer = TelemetryManager.getTracer();
    return tracer.startActiveSpan('provider.execute_turn', {
      kind: 1,
      attributes: {
        'gen_ai.system': 'mock',
        'gen_ai.operation.name': 'chat',
        'gen_ai.request.model': 'mock-model',
        'provider.tools_count': tools?.length ?? 0,
        'provider.message_count': messages.length,
      },
    }, async (span) => {
      const result = this.responses[this.callCount % this.responses.length];
      this.callCount++;
      if (result.contextUsage !== undefined) {
        span.setAttribute('gen_ai.usage.input_tokens', result.contextUsage);
      }
      span.setAttribute('provider.result_type', result.type);
      if (result.type === 'text') {
        options?.outputStream?.write(result.text);
        options?.onAssistantTextDelta?.(result.text);
      }
      span.end();
      return result;
    });
  }
}

describe('observability', () => {
  let workspaceRoot = '';
  const flowRef = { projectNamespace: 'a-society', flowId: 'observability-flow' };

  beforeAll(async () => {
    await setupTestTelemetry();
    workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-observability-'));
    seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    clearTestSpans();
    clearTestMetrics();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    await TelemetryManager.shutdown();
    if (workspaceRoot) fs.rmSync(workspaceRoot, { recursive: true, force: true });
  });

  it('records gateway and provider spans across tool rounds', async () => {
    const provider = new TelemetryProvider([
      {
        type: 'tool_calls',
        calls: [{ id: 'call_1', name: 'read_file', input: { path: 'nonexistent.txt' } }],
        continuationMessages: [{
          role: 'assistant_tool_calls',
          calls: [{ id: 'call_1', name: 'read_file', input: { path: 'nonexistent.txt' } }],
        }],
        contextUsage: 30,
      },
      {
        type: 'text',
        text: 'File not found.',
        contextUsage: 20,
      },
    ]);
    const gateway = new LLMGateway({
      mode: 'project',
      workspaceRoot,
      flowRef,
      provider,
    });

    await gateway.executeTurn('You are a tester.', [{ role: 'user', content: 'test tool calls' }]);

    const gatewaySpan = getSpan('llm.gateway.execute_turn');
    expect(gatewaySpan.attributes['llm.tools_enabled']).toBe(true);
    expect(getEvents(gatewaySpan)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: 'llm.tool_round',
        attributes: expect.objectContaining({ round_index: 0 }),
      }),
    ]));

    const providerSpans = getSpansByName('provider.execute_turn');
    expect(providerSpans).toHaveLength(2);
    expect(providerSpans[0].attributes).toMatchObject({
      'gen_ai.usage.input_tokens': 30,
      'provider.result_type': 'tool_calls',
    });
  });

  it('records role-turn handoff parse failures as metrics', async () => {
    vi.spyOn(LLMGateway.prototype, 'executeTurn').mockResolvedValue({
      text: 'I broke the handoff. ```handoff\ntarget_node_id:\n```',
    });

    await expect(runRoleTurn({
      workspaceRoot,
      roleInstanceId: 'curator',
      providedSystemPrompt: 'System prompt',
      flowRef,
      providedHistory: [{ role: 'user', content: 'Produce a handoff.' }],
    })).rejects.toBeInstanceOf(HandoffParseError);

    await flushTestTelemetry();

    expect(getMetricDataPoints('a_society.handoff.parse_failure')).toEqual(expect.arrayContaining([
      expect.objectContaining({
        attributes: expect.objectContaining({
          project_namespace: 'a-society',
          role_name: 'curator',
        }),
        value: 1,
      }),
    ]));
  });
});
