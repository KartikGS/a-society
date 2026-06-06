import assert from 'node:assert';
import { OpenAICompatibleProvider } from '../../src/providers/openai-compatible.js';
import type { ModelReasoningConfig } from '../../src/common/model-reasoning.js';
import type { OperatorEvent, OperatorRenderSink, ToolDefinition } from '../../src/common/types.js';

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

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
  chunks: Array<Record<string, unknown>>
): void {
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

await test('streams custom OpenAI-compatible reasoning deltas into provider reasoning feed events', async () => {
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

  assert.deepStrictEqual(result, { type: 'text', text: 'Done.', contextUsage: 12 });
  assert.deepStrictEqual(emitted, [
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

await test('does not drop assistant text when reasoning and content arrive as separate choices', async () => {
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

  assert.deepStrictEqual(result, {
    type: 'text',
    text: 'Understood — I need to check this.',
    contextUsage: undefined,
  });
  assert.deepStrictEqual(streamedText, ['Under', 'stood — I need to check this.']);
  assert.deepStrictEqual(emitted, [{
    kind: 'provider.reasoning_trace',
    role: 'owner',
    label: 'DeepSeek reasoning',
    text: 'Reasoning before answer. ',
    display: 'collapsed',
  }]);
});

await test('keeps the first assistant text token when a router emits it as a message chunk', async () => {
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

  assert.strictEqual(result.type, 'tool_calls');
  assert.deepStrictEqual(streamedText, ['Good', '. Now let me write the directive.']);
  assert.strictEqual(result.continuationMessages[0]?.role, 'assistant_tool_calls');
  assert.strictEqual(result.continuationMessages[0]?.text, 'Good. Now let me write the directive.');
});

await test('keeps accumulated custom reasoning for tool-call replay while streaming deltas', async () => {
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

  assert.strictEqual(result.type, 'tool_calls');
  assert.deepStrictEqual(result.calls, [{
    id: 'call_1',
    name: 'read_file',
    input: { path: 'notes.md' },
    parseError: undefined,
  }]);
  assert.deepStrictEqual(result.continuationMessages, [{
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
  assert.deepStrictEqual(emitted, [{
    kind: 'provider.reasoning_trace',
    role: 'owner',
    label: 'DeepSeek reasoning',
    text: 'Before tool. ',
    display: 'collapsed',
  }]);
});

await test('does not emit hidden custom reasoning deltas', async () => {
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

  assert.deepStrictEqual(emitted, []);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
