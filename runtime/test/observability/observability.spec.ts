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
import { AnthropicProvider } from '../../src/providers/anthropic.js';
import { OpenAICompatibleProvider } from '../../src/providers/openai-compatible.js';
import {
  ATTR_GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS,
  ATTR_GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS,
} from '../../src/providers/config.js';
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

class FakeAnthropicStream {
  private handlers: Array<(event: Record<string, unknown>) => void> = [];

  constructor(private readonly finalResponse: Record<string, unknown>) {}

  on(eventName: string, handler: (event: Record<string, unknown>) => void): FakeAnthropicStream {
    if (eventName === 'streamEvent') this.handlers.push(handler);
    return this;
  }

  async finalMessage(): Promise<Record<string, unknown>> {
    for (const handler of this.handlers) {
      handler({
        type: 'content_block_delta',
        index: 0,
        delta: { type: 'text_delta', text: 'Done.' },
      });
    }
    return this.finalResponse;
  }
}

function installFakeAnthropicClient(provider: AnthropicProvider, finalResponse: Record<string, unknown>): void {
  (provider as unknown as { client: unknown }).client = {
    messages: {
      stream: () => new FakeAnthropicStream(finalResponse),
    },
  };
}

function installFakeOpenAIClient(provider: OpenAICompatibleProvider, chunks: Array<Record<string, unknown>>): void {
  (provider as unknown as { client: unknown }).client = {
    chat: {
      completions: {
        create: async () => ({
          async *[Symbol.asyncIterator]() {
            for (const chunk of chunks) yield chunk;
          },
        }),
      },
    },
  };
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

  it('records Anthropic prompt-cache usage attributes from the provider span', async () => {
    const provider = new AnthropicProvider('test-key', 'claude-test', {
      maxOutputTokens: 1024,
      reasoning: { mode: 'disabled' },
    });
    installFakeAnthropicClient(provider, {
      usage: {
        input_tokens: 111,
        output_tokens: 7,
        cache_read_input_tokens: 23,
        cache_creation_input_tokens: 47,
      },
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Done.' }],
    });

    await provider.executeTurn('system', [{ role: 'user', content: 'Prompt.' }], undefined, { cacheTurn: true });
    await flushTestTelemetry();

    const span = getSpan('chat anthropic');
    expect(span.attributes).toMatchObject({
      'gen_ai.usage.input_tokens': 111,
      'gen_ai.usage.output_tokens': 7,
      [ATTR_GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS]: 23,
      [ATTR_GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS]: 47,
    });
  });

  it('records OpenAI-compatible cached input tokens when the provider reports them', async () => {
    const provider = new OpenAICompatibleProvider({
      baseURL: 'https://example.invalid/v1',
      apiKey: 'test-key',
      model: 'openai-compatible-test',
      maxOutputTokens: 1024,
      reasoning: { mode: 'disabled' },
    });
    installFakeOpenAIClient(provider, [
      { choices: [{ delta: { content: 'Done.' }, finish_reason: null }] },
      {
        choices: [],
        usage: {
          prompt_tokens: 111,
          completion_tokens: 7,
          prompt_tokens_details: { cached_tokens: 23 },
        },
      },
    ]);

    await provider.executeTurn('system', [{ role: 'user', content: 'Prompt.' }]);
    await flushTestTelemetry();

    const span = getSpan('chat openai');
    expect(span.attributes).toMatchObject({
      'gen_ai.usage.input_tokens': 111,
      'gen_ai.usage.output_tokens': 7,
      [ATTR_GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS]: 23,
    });
    expect(span.attributes).not.toHaveProperty(ATTR_GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS);
  });

  it('omits OpenAI-compatible cache attributes when cached-token usage is absent', async () => {
    clearTestSpans();
    const provider = new OpenAICompatibleProvider({
      baseURL: 'https://example.invalid/v1',
      apiKey: 'test-key',
      model: 'openai-compatible-test',
      maxOutputTokens: 1024,
      reasoning: { mode: 'disabled' },
    });
    installFakeOpenAIClient(provider, [
      { choices: [{ delta: { content: 'Done.' }, finish_reason: null }] },
      { choices: [], usage: { prompt_tokens: 111, completion_tokens: 7 } },
    ]);

    await provider.executeTurn('system', [{ role: 'user', content: 'Prompt.' }]);
    await flushTestTelemetry();

    const span = getSpan('chat openai');
    expect(span.attributes).not.toHaveProperty(ATTR_GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS);
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
