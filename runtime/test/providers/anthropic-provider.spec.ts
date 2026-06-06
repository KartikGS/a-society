import { describe, expect, it } from 'vitest';
import type { OperatorEvent, OperatorRenderSink } from '../../src/common/types.js';
import { AnthropicProvider } from '../../src/providers/anthropic.js';

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
