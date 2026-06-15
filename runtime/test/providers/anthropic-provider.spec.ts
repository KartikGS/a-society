import { describe, expect, it, vi } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';
import type { OperatorEvent, OperatorRenderSink } from '../../src/common/types.js';
import { AnthropicProvider } from '../../src/providers/anthropic.js';
import { MAX_NETWORK_RETRIES } from '../../src/providers/retry.js';

class FakeAnthropicStream {
  private handlers: Array<(event: Record<string, unknown>) => void> = [];

  constructor(
    private readonly streamEvents: Record<string, unknown>[],
    private readonly finalResponse: Record<string, unknown>
  ) {}

  on(eventName: string, handler: (event: Record<string, unknown>) => void): FakeAnthropicStream {
    if (eventName === 'streamEvent') {
      this.handlers.push(handler);
    }
    return this;
  }

  async finalMessage(): Promise<Record<string, unknown>> {
    for (const event of this.streamEvents) {
      for (const handler of this.handlers) handler(event);
    }
    return this.finalResponse;
  }
}

function installFakeClient(
  provider: AnthropicProvider,
  streamEvents: Record<string, unknown>[],
  finalResponse: Record<string, unknown>,
  onRequest?: (request: Record<string, unknown>) => void
): void {
  (provider as unknown as { client: unknown }).client = {
    messages: {
      stream: (request: Record<string, unknown>) => {
        onRequest?.(request);
        return new FakeAnthropicStream(streamEvents, finalResponse);
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

function textDelta(text: string): Record<string, unknown> {
  return {
    type: 'content_block_delta',
    index: 1,
    delta: { type: 'text_delta', text },
  };
}

function thinkingDelta(thinking: string): Record<string, unknown> {
  return {
    type: 'content_block_delta',
    index: 0,
    delta: { type: 'thinking_delta', thinking },
  };
}

function signatureDelta(): Record<string, unknown> {
  return {
    type: 'content_block_delta',
    index: 0,
    delta: { type: 'signature_delta', signature: 'signed-thinking' },
  };
}

function finalMessage(thinking: string): Record<string, unknown> {
  return {
    usage: { input_tokens: 4, output_tokens: 8 },
    stop_reason: 'end_turn',
    content: [
      { type: 'thinking', thinking, signature: 'signed-thinking' },
      { type: 'text', text: 'Done.' },
    ],
  };
}

describe('AnthropicProvider', () => {
  it('passes nested JSON Schema tool input_schema through unchanged', async () => {
    const provider = new AnthropicProvider('test-key', 'claude-test', {
      maxOutputTokens: 1024,
      reasoning: { mode: 'disabled' },
    });
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
      textDelta('Done.'),
    ], finalMessage(''), (request) => requests.push(request));

    await provider.executeTurn(
      'system',
      [{ role: 'user', content: 'Prompt.' }],
      [{ name: 'mcp__linear__create_issue', description: 'Create issue.', inputSchema: schema }]
    );

    const tools = requests[0].tools as Array<{ input_schema: unknown }>;
    expect(tools[0].input_schema).toBe(schema);
  });

  it('streams Anthropic thinking summaries into provider reasoning feed events', async () => {
    const provider = new AnthropicProvider('test-key', 'claude-test', {
      maxOutputTokens: 1024,
      reasoning: { mode: 'anthropic-adaptive', effort: 'medium', display: 'summarized' },
    });
    const emitted: OperatorEvent[] = [];
    installFakeClient(provider, [
      thinkingDelta('First thought. '),
      thinkingDelta('Second thought.'),
      signatureDelta(),
      textDelta('Done.'),
    ], finalMessage('First thought. Second thought.'));

    const result = await provider.executeTurn(
      'system',
      [{ role: 'user', content: 'Prompt.' }],
      undefined,
      { operatorRenderer: createRenderer(emitted), roleInstanceId: 'owner' }
    );

    expect(result).toMatchObject({ type: 'text', text: 'Done.' });
    expect(emitted).toEqual([
      {
        kind: 'provider.reasoning_trace',
        role: 'owner',
        label: 'Anthropic thinking summary',
        text: 'First thought. ',
        display: 'collapsed',
      },
      {
        kind: 'provider.reasoning_trace',
        role: 'owner',
        label: 'Anthropic thinking summary',
        text: 'Second thought.',
        display: 'collapsed',
      },
    ]);
  });

  it('emits a final Anthropic thinking summary when no thinking deltas arrive', async () => {
    const provider = new AnthropicProvider('test-key', 'claude-test', {
      maxOutputTokens: 1024,
      reasoning: { mode: 'anthropic-adaptive', effort: 'medium', display: 'summarized' },
    });
    const emitted: OperatorEvent[] = [];
    installFakeClient(provider, [
      textDelta('Done.'),
    ], finalMessage('Final summary.'));

    await provider.executeTurn(
      'system',
      [{ role: 'user', content: 'Prompt.' }],
      undefined,
      { operatorRenderer: createRenderer(emitted), roleInstanceId: 'owner' }
    );

    expect(emitted).toEqual([{
      kind: 'provider.reasoning_trace',
      role: 'owner',
      label: 'Anthropic thinking summary',
      text: 'Final summary.',
      display: 'collapsed',
    }]);
  });

  it('does not show omitted Anthropic thinking in the feed', async () => {
    const provider = new AnthropicProvider('test-key', 'claude-test', {
      maxOutputTokens: 1024,
      reasoning: { mode: 'anthropic-adaptive', effort: 'medium', display: 'omitted' },
    });
    const emitted: OperatorEvent[] = [];
    installFakeClient(provider, [
      signatureDelta(),
      textDelta('Done.'),
    ], finalMessage(''));

    await provider.executeTurn(
      'system',
      [{ role: 'user', content: 'Prompt.' }],
      undefined,
      { operatorRenderer: createRenderer(emitted), roleInstanceId: 'owner' }
    );

    expect(emitted).toEqual([]);
  });

  it('does not replay empty Anthropic thinking blocks', async () => {
    const provider = new AnthropicProvider('test-key', 'claude-test', {
      maxOutputTokens: 1024,
      reasoning: { mode: 'anthropic-manual', effort: 'none', display: 'omitted', budgetTokens: 128 },
    });
    const requestPayloads: Record<string, unknown>[] = [];
    installFakeClient(provider, [
      textDelta('Done.'),
    ], finalMessage(''), (request) => {
      requestPayloads.push(request);
    });

    await provider.executeTurn(
      'system',
      [
        { role: 'user', content: 'Prompt.' },
        {
          role: 'assistant_tool_calls',
          text: 'Need tool.',
          calls: [{ id: 'toolu_1', name: 'read_file', input: { path: 'README.md' } }],
          providerReasoning: [{
            provider: 'anthropic',
            type: 'thinking',
            thinking: '',
            signature: 'signed-empty-thinking',
          }],
        },
        { role: 'tool_result', callId: 'toolu_1', toolName: 'read_file', content: 'file content', isError: false },
      ],
      undefined
    );

    const requestPayload = requestPayloads[0];
    expect(requestPayload).toBeDefined();
    const messages = requestPayload.messages as Array<{ role: string; content: unknown }>;
    const assistantMessage = messages.find((message) => message.role === 'assistant');
    expect(assistantMessage).toBeDefined();
    const content = assistantMessage?.content as Array<{ type: string }>;
    expect(content.every((block) => block.type !== 'thinking')).toBe(true);
  });
});

class FailingAnthropicStream {
  on(): FailingAnthropicStream {
    return this;
  }

  finalMessage(): Promise<never> {
    return Promise.reject(new Anthropic.APIConnectionError({ message: 'connection reset' }));
  }
}

class EmitThenFailAnthropicStream {
  private handlers: Array<(event: Record<string, unknown>) => void> = [];

  constructor(private readonly text: string) {}

  on(eventName: string, handler: (event: Record<string, unknown>) => void): EmitThenFailAnthropicStream {
    if (eventName === 'streamEvent') this.handlers.push(handler);
    return this;
  }

  finalMessage(): Promise<never> {
    for (const handler of this.handlers) handler(textDelta(this.text));
    return Promise.reject(new Anthropic.APIConnectionError({ message: 'reset mid-stream' }));
  }
}

type AnthropicAttempt = 'fail' | { events: Record<string, unknown>[]; final: Record<string, unknown> };

function installSequencedAnthropicClient(provider: AnthropicProvider, attempts: AnthropicAttempt[]): () => number {
  let calls = 0;
  (provider as unknown as { client: unknown }).client = {
    messages: {
      stream: () => {
        const attempt = attempts[Math.min(calls, attempts.length - 1)];
        calls += 1;
        if (attempt === 'fail') return new FailingAnthropicStream();
        return new FakeAnthropicStream(attempt.events, attempt.final);
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

describe('AnthropicProvider network-error retry', () => {
  function newProvider(): AnthropicProvider {
    return new AnthropicProvider('test-key', 'claude-test', {
      maxOutputTokens: 1024,
      reasoning: { mode: 'disabled' },
    });
  }

  it('retries a connection failure, notifies the operator, then succeeds', async () => {
    vi.useFakeTimers();
    try {
      const provider = newProvider();
      const callCount = installSequencedAnthropicClient(provider, [
        'fail',
        'fail',
        { events: [textDelta('Recovered.')], final: finalMessage('') },
      ]);
      const { renderer, errors } = capturingRenderer();
      const promise = provider.executeTurn('system', [{ role: 'user', content: 'Prompt.' }], undefined, {
        operatorRenderer: renderer,
      });
      await vi.runAllTimersAsync();
      const result = await promise;
      expect(result).toMatchObject({ type: 'text', text: 'Recovered.' });
      expect(callCount()).toBe(3);
      // One toast per retry, carrying the attempt count.
      expect(errors).toEqual([
        expect.stringContaining('(1/5)'),
        expect.stringContaining('(2/5)'),
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('surfaces the error after exhausting the retry budget', async () => {
    vi.useFakeTimers();
    try {
      const provider = newProvider();
      const callCount = installSequencedAnthropicClient(provider, ['fail']);
      const settled = provider
        .executeTurn('system', [{ role: 'user', content: 'Prompt.' }])
        .then(() => 'resolved', (error: unknown) => error);
      await vi.runAllTimersAsync();
      const outcome = await settled;
      expect(outcome).toBeInstanceOf(Anthropic.APIConnectionError);
      expect(callCount()).toBe(MAX_NETWORK_RETRIES + 1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not retry once output has streamed', async () => {
    const provider = newProvider();
    let calls = 0;
    (provider as unknown as { client: unknown }).client = {
      messages: {
        stream: () => {
          calls += 1;
          return new EmitThenFailAnthropicStream('partial');
        },
      },
    };
    const streamed: string[] = [];
    const outcome = await provider
      .executeTurn('system', [{ role: 'user', content: 'Prompt.' }], undefined, {
        onAssistantTextDelta: (text) => streamed.push(text),
      })
      .then(() => 'resolved', (error: unknown) => error);
    expect(outcome).toBeInstanceOf(Anthropic.APIConnectionError);
    expect(calls).toBe(1);
    expect(streamed).toEqual(['partial']);
  });
});
