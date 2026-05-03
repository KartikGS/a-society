import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { LLMGateway, LLMGatewayError } from '../../src/providers/llm.js';
import { defaultConsentState } from '../../src/common/types.js';
import type {
  ConsentCheckRequest,
  ConsentGate,
  ConsentMode,
  ConsentRequest,
  ConsentResponseDecision,
  LLMProvider,
  ProviderTurnResult,
  RuntimeMessageParam,
  ToolDefinition,
  TurnOptions,
} from '../../src/common/types.js';

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

class LateAbortTextProvider implements LLMProvider {
  constructor(private readonly abort: () => void) {}

  async executeTurn(
    _systemPrompt: string,
    _messages: RuntimeMessageParam[],
    _tools?: ToolDefinition[],
    _options?: TurnOptions
  ): Promise<ProviderTurnResult> {
    this.abort();
    return {
      type: 'text',
      text: 'Partial answer without a handoff block',
      displayedText: true
    };
  }
}

class LateAbortToolCallProvider implements LLMProvider {
  constructor(private readonly abort: () => void) {}

  async executeTurn(
    _systemPrompt: string,
    _messages: RuntimeMessageParam[],
    _tools?: ToolDefinition[],
    _options?: TurnOptions
  ): Promise<ProviderTurnResult> {
    this.abort();
    return {
      type: 'tool_calls',
      calls: [{ id: 'call_1', name: 'write_file', input: { path: 'plan.md', content: 'draft' } }],
      continuationMessages: [{
        role: 'assistant_tool_calls',
        calls: [{ id: 'call_1', name: 'write_file', input: { path: 'plan.md', content: 'draft' } }],
        text: 'I will write the plan now.',
      }],
      displayedText: true,
    };
  }
}

class ToolCallThenTextProvider implements LLMProvider {
  public secondCallMessages: RuntimeMessageParam[] = [];
  private callCount = 0;

  async executeTurn(
    _systemPrompt: string,
    messages: RuntimeMessageParam[],
    _tools?: ToolDefinition[],
    _options?: TurnOptions
  ): Promise<ProviderTurnResult> {
    if (this.callCount === 0) {
      this.callCount++;
      return {
        type: 'tool_calls',
        calls: [{ id: 'call_1', name: 'write_file', input: { path: 'plan.md', content: 'draft' } }],
        continuationMessages: [{
          role: 'assistant_tool_calls',
          calls: [{ id: 'call_1', name: 'write_file', input: { path: 'plan.md', content: 'draft' } }],
          text: 'I will write the plan now.',
        }],
        displayedText: true,
      };
    }

    this.secondCallMessages = [...messages];
    return { type: 'text', text: 'Done.' };
  }
}

class BlockingConsentGate implements ConsentGate {
  public requests: ConsentCheckRequest[] = [];
  private checkedResolve!: () => void;
  private decisionResolve: ((result: 'proceed' | 'deny') => void) | null = null;

  public readonly checked = new Promise<void>((resolve) => {
    this.checkedResolve = resolve;
  });

  check(request: ConsentCheckRequest): Promise<'proceed' | 'deny'> {
    this.requests.push(request);
    this.checkedResolve();
    return new Promise<'proceed' | 'deny'>((resolve) => {
      this.decisionResolve = resolve;
    });
  }

  resolve(decision: 'proceed' | 'deny'): void {
    this.decisionResolve?.(decision);
  }

  respond(_decision: ConsentResponseDecision): void {}
  setMode(_mode: ConsentMode): void {}
  getState() { return defaultConsentState(); }
  getInFlightRequest(): ConsentRequest | null { return null; }
}

console.log('\nllm-gateway');

await test('late abort after streamed text returns is still treated as aborted', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-llm-gateway-'));
  const controller = new AbortController();
  const gateway = new LLMGateway(tmpDir, new LateAbortTextProvider(() => controller.abort()));

  await assert.rejects(
    () => gateway.executeTurn(
      'System prompt',
      [{ role: 'user', content: 'Please produce a handoff.' }],
      { signal: controller.signal }
    ),
    (error: unknown) => {
      assert.ok(error instanceof LLMGatewayError);
      assert.strictEqual(error.type, 'ABORTED');
      assert.strictEqual(error.partialText, 'Partial answer without a handoff block');
      return true;
    }
  );
});

await test('tool-call continuation is recorded before consent resolves', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-llm-gateway-'));
  const provider = new ToolCallThenTextProvider();
  const gateway = new LLMGateway(tmpDir, provider);
  const gate = new BlockingConsentGate();
  const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Please create the plan.' }];
  const persistedBatches: RuntimeMessageParam[][] = [];

  const pendingTurn = gateway.executeTurn('System prompt', history, {
    consentGate: gate,
    onConversationMessages: (messages) => {
      persistedBatches.push([...messages]);
    },
  });

  await gate.checked;

  assert.strictEqual(history.length, 2);
  assert.strictEqual(history[1].role, 'assistant_tool_calls');
  assert.strictEqual(history[1].text, 'I will write the plan now.');
  assert.strictEqual(persistedBatches.length, 1);
  assert.strictEqual(persistedBatches[0][0].role, 'assistant_tool_calls');

  gate.resolve('deny');
  const result = await pendingTurn;

  assert.strictEqual(result.text, 'Done.');
  assert.strictEqual(history.length, 3);
  assert.strictEqual(history[2].role, 'tool_result');
  assert.match(history[2].content, /denied/i);
  assert.deepStrictEqual(provider.secondCallMessages, history);
});

await test('late abort after streamed tool-call text keeps the attempted tool call in history', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-llm-gateway-'));
  const controller = new AbortController();
  const gateway = new LLMGateway(tmpDir, new LateAbortToolCallProvider(() => controller.abort()));
  const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Please create the plan.' }];

  await assert.rejects(
    () => gateway.executeTurn(
      'System prompt',
      history,
      { signal: controller.signal }
    ),
    (error: unknown) => {
      assert.ok(error instanceof LLMGatewayError);
      assert.strictEqual(error.type, 'ABORTED');
      return true;
    }
  );

  assert.strictEqual(history.length, 2);
  assert.strictEqual(history[1].role, 'assistant_tool_calls');
  assert.strictEqual(history[1].text, 'I will write the plan now.');
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
