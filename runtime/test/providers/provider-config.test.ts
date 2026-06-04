import assert from 'node:assert';
import {
  DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS,
  buildAnthropicReasoningParams,
  buildOpenAIChatCompletionTokenParams,
  resolveMaxOutputTokens,
} from '../../src/providers/config.js';

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

test('OpenAI chat reasoning uses native reasoning parameters', () => {
  assert.deepStrictEqual(
    buildOpenAIChatCompletionTokenParams({ mode: 'openai-chat', effort: 'medium' }, 4096),
    { max_completion_tokens: 4096, reasoning_effort: 'medium' }
  );
});

test('OpenAI chat completion falls back to max_tokens when reasoning is disabled', () => {
  assert.deepStrictEqual(
    buildOpenAIChatCompletionTokenParams({ mode: 'disabled' }, 4096),
    { max_tokens: 4096 }
  );
});

test('OpenAI chat completion rejects Anthropic reasoning modes', () => {
  assert.throws(
    () => buildOpenAIChatCompletionTokenParams({
      mode: 'anthropic-adaptive',
      effort: 'medium',
      display: 'omitted',
    }, 4096),
    /not valid for OpenAI-compatible/
  );
});

test('custom OpenAI-compatible reasoning merges extra body and selected token parameter', () => {
  assert.deepStrictEqual(
    buildOpenAIChatCompletionTokenParams({
      mode: 'custom-openai-compatible',
      request: {
        tokenLimitParam: 'max_tokens',
        extraBody: {
          thinking: { type: 'enabled' },
          reasoning_effort: 'high',
        },
      },
      trace: {
        responseDeltaField: 'reasoning_content',
        requestMessageField: 'reasoning_content',
        replay: 'tool-calls-only',
        display: 'collapsed',
        label: 'Provider reasoning trace',
      },
    }, 8192),
    {
      thinking: { type: 'enabled' },
      reasoning_effort: 'high',
      max_tokens: 8192,
    }
  );
});

test('custom OpenAI-compatible reasoning rejects reserved extra body keys', () => {
  assert.throws(
    () => buildOpenAIChatCompletionTokenParams({
      mode: 'custom-openai-compatible',
      request: {
        tokenLimitParam: 'max_tokens',
        extraBody: { messages: [] },
      },
    }, 8192),
    /reserved request keys/
  );
});

test('Anthropic adaptive thinking uses native thinking and effort parameters', () => {
  assert.deepStrictEqual(
    buildAnthropicReasoningParams({ mode: 'anthropic-adaptive', effort: 'medium', display: 'omitted' }, 8192),
    {
      thinking: { type: 'adaptive', display: 'omitted' },
      output_config: { effort: 'medium' },
    }
  );
});

test('Anthropic manual thinking validates budget before building parameters', () => {
  assert.throws(
    () => buildAnthropicReasoningParams({
      mode: 'anthropic-manual',
      effort: 'medium',
      display: 'omitted',
      budgetTokens: 4096,
    }, 4096),
    /less than max output tokens/
  );
});

test('Anthropic reasoning rejects OpenAI reasoning modes', () => {
  assert.throws(
    () => buildAnthropicReasoningParams({ mode: 'openai-chat', effort: 'medium' }, 4096),
    /not valid for Anthropic/
  );
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
