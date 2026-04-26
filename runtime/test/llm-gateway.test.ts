import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { LLMGateway, LLMGatewayError } from '../src/llm.js';
import type { LLMProvider, ProviderTurnResult, RuntimeMessageParam, ToolDefinition, TurnOptions } from '../src/types.js';

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

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
