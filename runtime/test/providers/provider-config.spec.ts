import { describe, expect, it } from 'vitest';
import {
  DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS,
  buildAnthropicReasoningParams,
  buildOpenAIChatCompletionTokenParams,
  resolveMaxOutputTokens,
} from '../../src/providers/config.js';

describe('provider config', () => {
  it('uses positive configured max output values', () => {
    expect(resolveMaxOutputTokens(16384, DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS)).toBe(16384);
  });

  it('falls back for unset or invalid max output values', () => {
    expect(resolveMaxOutputTokens(undefined, DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS)).toBe(8192);
    expect(resolveMaxOutputTokens(0, DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS)).toBe(8192);
    expect(resolveMaxOutputTokens(-1, DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS)).toBe(8192);
    expect(resolveMaxOutputTokens(12.5, DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS)).toBe(8192);
  });

  it('uses native OpenAI chat reasoning parameters', () => {
    expect(buildOpenAIChatCompletionTokenParams({ mode: 'openai-chat', effort: 'medium' }, 4096)).toEqual({
      max_completion_tokens: 4096,
      reasoning_effort: 'medium',
    });
  });

  it('uses max_tokens for OpenAI chat completions when reasoning is disabled', () => {
    expect(buildOpenAIChatCompletionTokenParams({ mode: 'disabled' }, 4096)).toEqual({
      max_tokens: 4096,
    });
  });

  it('rejects Anthropic reasoning modes for OpenAI chat completions', () => {
    expect(() => buildOpenAIChatCompletionTokenParams({
      mode: 'anthropic-adaptive',
      effort: 'medium',
      display: 'omitted',
    }, 4096)).toThrow(/not valid for OpenAI-compatible/);
  });

  it('merges custom OpenAI-compatible reasoning body and selected token parameter', () => {
    expect(buildOpenAIChatCompletionTokenParams({
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
    }, 8192)).toEqual({
      thinking: { type: 'enabled' },
      reasoning_effort: 'high',
      max_tokens: 8192,
    });
  });

  it('rejects reserved custom OpenAI-compatible extra body keys', () => {
    expect(() => buildOpenAIChatCompletionTokenParams({
      mode: 'custom-openai-compatible',
      request: {
        tokenLimitParam: 'max_tokens',
        extraBody: { messages: [] },
      },
    }, 8192)).toThrow(/reserved request keys/);
  });

  it('uses native Anthropic adaptive thinking and effort parameters', () => {
    expect(buildAnthropicReasoningParams({
      mode: 'anthropic-adaptive',
      effort: 'medium',
      display: 'omitted',
    }, 8192)).toEqual({
      thinking: { type: 'adaptive', display: 'omitted' },
      output_config: { effort: 'medium' },
    });
  });

  it('omits Anthropic adaptive output_config when effort is none', () => {
    expect(buildAnthropicReasoningParams({
      mode: 'anthropic-adaptive',
      effort: 'none',
      display: 'omitted',
    }, 8192)).toEqual({
      thinking: { type: 'adaptive', display: 'omitted' },
    });
  });

  it('omits Anthropic manual output_config when effort is none', () => {
    expect(buildAnthropicReasoningParams({
      mode: 'anthropic-manual',
      effort: 'none',
      display: 'omitted',
      budgetTokens: 2048,
    }, 8192)).toEqual({
      thinking: { type: 'enabled', budget_tokens: 2048, display: 'omitted' },
    });
  });

  it('validates Anthropic manual thinking budget before building parameters', () => {
    expect(() => buildAnthropicReasoningParams({
      mode: 'anthropic-manual',
      effort: 'medium',
      display: 'omitted',
      budgetTokens: 4096,
    }, 4096)).toThrow(/less than max output tokens/);
  });

  it('rejects OpenAI reasoning modes for Anthropic requests', () => {
    expect(() => buildAnthropicReasoningParams({ mode: 'openai-chat', effort: 'medium' }, 4096))
      .toThrow(/not valid for Anthropic/);
  });
});
