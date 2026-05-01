import assert from 'node:assert';
import {
  appendThinkingSystemInstruction,
  DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS,
  resolveMaxOutputTokens,
} from '../src/providers/config.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

console.log('\nprovider-config');

test('resolveMaxOutputTokens uses positive configured values', () => {
  assert.strictEqual(resolveMaxOutputTokens(16384, DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS), 16384);
});

test('resolveMaxOutputTokens falls back for unset or invalid values', () => {
  assert.strictEqual(resolveMaxOutputTokens(undefined, DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS), 8192);
  assert.strictEqual(resolveMaxOutputTokens(0, DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS), 8192);
  assert.strictEqual(resolveMaxOutputTokens(-1, DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS), 8192);
  assert.strictEqual(resolveMaxOutputTokens(12.5, DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS), 8192);
});

test('appendThinkingSystemInstruction only changes prompts when enabled', () => {
  const prompt = 'Base system prompt.';

  assert.strictEqual(appendThinkingSystemInstruction(prompt, false), prompt);
  assert.match(appendThinkingSystemInstruction(prompt, true), /supportsThinking is enabled/);
});

test('appendThinkingSystemInstruction is idempotent', () => {
  const once = appendThinkingSystemInstruction('Base system prompt.', true);
  const twice = appendThinkingSystemInstruction(once, true);

  assert.strictEqual(twice, once);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
