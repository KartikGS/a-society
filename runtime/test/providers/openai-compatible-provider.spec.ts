import { describe, expect, it, vi } from 'vitest';
import OpenAI from 'openai';
import type { ModelReasoningConfig } from '../../src/common/model-reasoning.js';
import type { OperatorEvent, OperatorRenderSink, ToolDefinition } from '../../src/common/types.js';
import { LLMGatewayError } from '../../src/common/types.js';
import { OpenAICompatibleProvider } from '../../src/providers/openai-compatible.js';
import { MAX_NETWORK_RETRIES } from '../../src/providers/retry.js';

const customReasoning: ModelReasoningConfig = {
  mode: 'custom-openai-compatible',
  request: {
    tokenLimitParam: 'max_tokens',
    extraBody: {},
  },
  trace: {
    responseDeltaField: 'reasoning_content',
    requestMessageField: 'reasoning_content',
    replay: 'tool-calls-only',
    display: 'collapsed',
    label: 'DeepSeek reasoning',
  },
};

const readFileTool: ToolDefinition = {
  name: 'read_file',
  description: 'Read a file.',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Path to read.' },
    },
    required: ['path'],
  },
};

function createProvider(reasoning: ModelReasoningConfig = customReasoning): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider({
    baseURL: 'https://example.invalid/v1',
    apiKey: 'test-key',
    model: 'deepseek-test',
    maxOutputTokens: 1024,
    reasoning,
  });
}

function installFakeClient(
  provider: OpenAICompatibleProvider,
  chunks: Array<Record<string, unknown>>,
  onRequest?: (request: Record<string, unknown>) => void
): void {
  (provider as unknown as { client: unknown }).client = {
    chat: {
      completions: {
        create: async (request: Record<string, unknown>) => {
          onRequest?.(request);
          return {
          async *[Symbol.asyncIterator]() {
            for (const chunk of chunks) yield chunk;
          },
          };
        },
      },
    },
  };
}

function createRenderer(events: OperatorEvent[]): OperatorRenderSink {
  return {
    emit: (event) => events.push(event),
    requestSent: () => {},
    receivingResponse: () => {},
    responseEnd: () => {},
    sendError: () => {},
  };
}

function chunk(delta: Record<string, unknown>, finishReason: string | null = null): Record<string, unknown> {
  return {
    choices: [{
      delta,
      finish_reason: finishReason,
    }],
  };
}

function messageChunk(message: Record<string, unknown>, finishReason: string | null = null): Record<string, unknown> {
  return {
    choices: [{
      message,
      finish_reason: finishReason,
    }],
  };
}

function multiChoiceChunk(choices: Array<{ delta: Record<string, unknown>; finishReason?: string | null }>): Record<string, unknown> {
  return {
    choices: choices.map((choice) => ({
      delta: choice.delta,
      finish_reason: choice.finishReason ?? null,
    })),
  };
}

describe('OpenAICompatibleProvider', () => {
  it('passes nested JSON Schema tool parameters through unchanged', async () => {
    const provider = createProvider();
    const requests: Record<string, unknown>[] = [];
    const schema = {
      type: 'object',
      properties: {
        issue: {
          type: 'object',
          properties: {
            priority: { type: 'string', enum: ['low', 'high'] },
            labels: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      required: ['issue'],
    };
    installFakeClient(provider, [
      chunk({ content: 'Done.' }),
    ], (request) => requests.push(request));

    await provider.executeTurn(
      'system',
      [{ role: 'user', content: 'Prompt.' }],
      [{ name: 'mcp__linear__create_issue', description: 'Create issue.', inputSchema: schema }]
    );

    const tools = requests[0].tools as Array<{ function: { parameters: unknown } }>;
    expect(tools[0].function.parameters).toBe(schema);
  });

  it('streams custom OpenAI-compatible reasoning deltas into provider reasoning feed events', async () => {
    const provider = createProvider();
    const emitted: OperatorEvent[] = [];
    installFakeClient(provider, [
      chunk({ reasoning_content: 'Trace one. ' }),
      chunk({ content: 'Done.' }),
      chunk({ reasoning_content: 'Trace two.' }),
      { choices: [], usage: { prompt_tokens: 5, completion_tokens: 7 } },
    ]);

    const result = await provider.executeTurn(
      'system',
      [{ role: 'user', content: 'Prompt.' }],
      undefined,
      { operatorRenderer: createRenderer(emitted), roleInstanceId: 'owner' }
    );

    expect(result).toEqual({ type: 'text', text: 'Done.', contextUsage: 12 });
    expect(emitted).toEqual([
      {
        kind: 'provider.reasoning_trace',
        role: 'owner',
        label: 'DeepSeek reasoning',
        text: 'Trace one. ',
        display: 'collapsed',
      },
      {
        kind: 'provider.reasoning_trace',
        role: 'owner',
        label: 'DeepSeek reasoning',
        text: 'Trace two.',
        display: 'collapsed',
      },
    ]);
  });

  it('does not drop assistant text when reasoning and content arrive as separate choices', async () => {
    const provider = createProvider();
    const emitted: OperatorEvent[] = [];
    const streamedText: string[] = [];
    installFakeClient(provider, [
      multiChoiceChunk([
        { delta: { reasoning_content: 'Reasoning before answer. ' } },
        { delta: { content: 'Under' } },
      ]),
      chunk({ content: 'stood — I need to check this.' }),
    ]);

    const result = await provider.executeTurn(
      'system',
      [{ role: 'user', content: 'Prompt.' }],
      undefined,
      {
        operatorRenderer: createRenderer(emitted),
        roleInstanceId: 'owner',
        onAssistantTextDelta: (text) => streamedText.push(text),
      }
    );

    expect(result).toEqual({
      type: 'text',
      text: 'Understood — I need to check this.',
      contextUsage: undefined,
    });
    expect(streamedText).toEqual(['Under', 'stood — I need to check this.']);
    expect(emitted).toEqual([{
      kind: 'provider.reasoning_trace',
      role: 'owner',
      label: 'DeepSeek reasoning',
      text: 'Reasoning before answer. ',
      display: 'collapsed',
    }]);
  });

  it('keeps the first assistant text token when a router emits it as a message chunk', async () => {
    const provider = createProvider();
    const streamedText: string[] = [];
    installFakeClient(provider, [
      chunk({ reasoning_content: 'I need to write a directive.' }),
      messageChunk({ content: 'Good' }),
      chunk({ content: '. Now let me write the directive.' }),
      chunk({
        tool_calls: [{
          index: 0,
          id: 'call_1',
          function: { name: 'read_file', arguments: '{"path":"notes.md"}' },
        }],
      }, 'tool_calls'),
    ]);

    const result = await provider.executeTurn(
      'system',
      [{ role: 'user', content: 'Prompt.' }],
      [readFileTool],
      { onAssistantTextDelta: (text) => streamedText.push(text) }
    );

    expect(result.type).toBe('tool_calls');
    expect(streamedText).toEqual(['Good', '. Now let me write the directive.']);
    if (result.type !== 'tool_calls') throw new Error('Expected tool calls result.');
    const continuation = result.continuationMessages[0];
    expect(continuation?.role).toBe('assistant_tool_calls');
    if (continuation?.role !== 'assistant_tool_calls') throw new Error('Expected assistant tool-call continuation.');
    expect(continuation.text).toBe('Good. Now let me write the directive.');
  });

  it('keeps accumulated custom reasoning for tool-call replay while streaming deltas', async () => {
    const provider = createProvider();
    const emitted: OperatorEvent[] = [];
    installFakeClient(provider, [
      chunk({ reasoning_content: 'Before tool. ' }),
      chunk({
        tool_calls: [{
          index: 0,
          id: 'call_1',
          function: { name: 'read_file', arguments: '{"path":"notes.md"}' },
        }],
      }, 'tool_calls'),
    ]);

    const result = await provider.executeTurn(
      'system',
      [{ role: 'user', content: 'Prompt.' }],
      [readFileTool],
      { operatorRenderer: createRenderer(emitted), roleInstanceId: 'owner' }
    );

    expect(result.type).toBe('tool_calls');
    if (result.type !== 'tool_calls') throw new Error('Expected tool calls result.');
    expect(result.calls).toEqual([{
      id: 'call_1',
      name: 'read_file',
      input: { path: 'notes.md' },
      parseError: undefined,
    }]);
    expect(result.continuationMessages).toEqual([{
      role: 'assistant_tool_calls',
      calls: [{
        id: 'call_1',
        name: 'read_file',
        input: { path: 'notes.md' },
        parseError: undefined,
      }],
      text: undefined,
      providerReasoning: [{
        provider: 'openai-compatible',
        type: 'message-field',
        field: 'reasoning_content',
        content: 'Before tool. ',
        replay: 'tool-calls-only',
      }],
    }]);
    expect(emitted).toEqual([{
      kind: 'provider.reasoning_trace',
      role: 'owner',
      label: 'DeepSeek reasoning',
      text: 'Before tool. ',
      display: 'collapsed',
    }]);
  });

  it('does not emit hidden custom reasoning deltas', async () => {
    const provider = createProvider({
      ...customReasoning,
      trace: customReasoning.trace
        ? { ...customReasoning.trace, display: 'hidden' }
        : undefined,
    });
    const emitted: OperatorEvent[] = [];
    installFakeClient(provider, [
      chunk({ reasoning_content: 'Hidden trace.' }),
      chunk({ content: 'Done.' }),
    ]);

    await provider.executeTurn(
      'system',
      [{ role: 'user', content: 'Prompt.' }],
      undefined,
      { operatorRenderer: createRenderer(emitted), roleInstanceId: 'owner' }
    );

    expect(emitted).toEqual([]);
  });
});

type OpenAIAttempt = 'fail' | Array<Record<string, unknown>>;

function installSequencedOpenAIClient(provider: OpenAICompatibleProvider, attempts: OpenAIAttempt[]): () => number {
  let calls = 0;
  (provider as unknown as { client: unknown }).client = {
    chat: {
      completions: {
        create: async () => {
          const attempt = attempts[Math.min(calls, attempts.length - 1)];
          calls += 1;
          if (attempt === 'fail') throw new OpenAI.APIConnectionError({ message: 'connection refused' });
          const chunks = attempt;
          return {
            async *[Symbol.asyncIterator]() {
              for (const c of chunks) yield c;
            },
          };
        },
      },
    },
  };
  return () => calls;
}

function capturingRenderer(): { renderer: OperatorRenderSink; errors: string[] } {
  const errors: string[] = [];
  return {
    errors,
    renderer: {
      emit: () => {},
      requestSent: () => {},
      receivingResponse: () => {},
      responseEnd: () => {},
      sendError: (message) => errors.push(message),
    },
  };
}

describe('OpenAICompatibleProvider network-error retry', () => {
  it('retries a connection failure, notifies the operator, then succeeds', async () => {
    vi.useFakeTimers();
    try {
      const provider = createProvider();
      const callCount = installSequencedOpenAIClient(provider, ['fail', [chunk({ content: 'Recovered.' })]]);
      const { renderer, errors } = capturingRenderer();
      const promise = provider.executeTurn('system', [{ role: 'user', content: 'Prompt.' }], undefined, {
        operatorRenderer: renderer,
      });
      await vi.runAllTimersAsync();
      const result = await promise;
      expect(result).toMatchObject({ type: 'text', text: 'Recovered.' });
      expect(callCount()).toBe(2);
      expect(errors).toEqual([expect.stringContaining('(1/5)')]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('surfaces the error after exhausting the retry budget', async () => {
    vi.useFakeTimers();
    try {
      const provider = createProvider();
      const callCount = installSequencedOpenAIClient(provider, ['fail']);
      const settled = provider
        .executeTurn('system', [{ role: 'user', content: 'Prompt.' }])
        .then(() => 'resolved', (error: unknown) => error);
      await vi.runAllTimersAsync();
      const outcome = await settled;
      // The provider maps an exhausted connection error onto its typed gateway error.
      expect(outcome).toBeInstanceOf(LLMGatewayError);
      expect((outcome as LLMGatewayError).type).toBe('RATE_LIMIT');
      expect(callCount()).toBe(MAX_NETWORK_RETRIES + 1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not retry once output has streamed', async () => {
    const provider = createProvider();
    let calls = 0;
    (provider as unknown as { client: unknown }).client = {
      chat: {
        completions: {
          create: async () => {
            calls += 1;
            return {
              async *[Symbol.asyncIterator]() {
                yield chunk({ content: 'partial' });
                throw new OpenAI.APIConnectionError({ message: 'reset mid-stream' });
              },
            };
          },
        },
      },
    };
    const streamed: string[] = [];
    const outcome = await provider
      .executeTurn('system', [{ role: 'user', content: 'Prompt.' }], undefined, {
        onAssistantTextDelta: (text) => streamed.push(text),
      })
      .then(() => 'resolved', (error: unknown) => error);
    expect(outcome).toBeInstanceOf(LLMGatewayError);
    expect(calls).toBe(1);
    expect(streamed).toEqual(['partial']);
  });
});
