import type { AnthropicEffort, ModelReasoningConfig } from '../common/model-reasoning.js';
import type { PromptCacheTtl } from '../common/types.js';
import { getCustomOpenAICompatibleReservedBodyKeys } from '../common/model-reasoning.js';

export const DEFAULT_ANTHROPIC_MAX_OUTPUT_TOKENS = 4096;
export const DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS = 8192;
export const ATTR_GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS = 'gen_ai.usage.cache_read.input_tokens';
export const ATTR_GEN_AI_USAGE_CACHE_CREATION_INPUT_TOKENS = 'gen_ai.usage.cache_creation.input_tokens';

export interface ProviderRuntimeConfig {
  maxOutputTokens?: number;
  reasoning?: ModelReasoningConfig;
  cacheTtl?: PromptCacheTtl;
}

export function resolveMaxOutputTokens(value: number | undefined, fallback: number): number {
  if (Number.isInteger(value) && value !== undefined && value > 0) {
    return value;
  }
  return fallback;
}

export function buildOpenAIChatCompletionTokenParams(
  reasoning: ModelReasoningConfig | undefined,
  maxOutputTokens: number
): Record<string, unknown> {
  if (reasoning?.mode === 'openai-chat') {
    return {
      max_completion_tokens: maxOutputTokens,
      reasoning_effort: reasoning.effort,
    };
  }
  if (reasoning?.mode === 'custom-openai-compatible') {
    const reservedKeys = getCustomOpenAICompatibleReservedBodyKeys(reasoning.request.extraBody);
    if (reservedKeys.length > 0) {
      throw new Error(`Custom OpenAI-compatible reasoning extraBody cannot override reserved request keys: ${reservedKeys.join(', ')}.`);
    }
    return {
      ...reasoning.request.extraBody,
      [reasoning.request.tokenLimitParam]: maxOutputTokens,
    };
  }
  if (reasoning && reasoning.mode !== 'disabled') {
    throw new Error(`Reasoning mode "${reasoning.mode}" is not valid for OpenAI-compatible chat completions.`);
  }

  return { max_tokens: maxOutputTokens };
}

function buildAnthropicEffortParams(effort: AnthropicEffort): Record<string, unknown> {
  return effort === 'none' ? {} : { output_config: { effort } };
}

export function buildAnthropicReasoningParams(
  reasoning: ModelReasoningConfig | undefined,
  maxOutputTokens: number
): Record<string, unknown> {
  if (!reasoning || reasoning.mode === 'disabled') {
    return {};
  }

  if (reasoning.mode === 'anthropic-adaptive') {
    return {
      thinking: {
        type: 'adaptive',
        display: reasoning.display,
      },
      ...buildAnthropicEffortParams(reasoning.effort),
    };
  }

  if (reasoning.mode === 'anthropic-manual') {
    if (!Number.isInteger(reasoning.budgetTokens) || reasoning.budgetTokens <= 0) {
      throw new Error('Anthropic manual thinking requires a positive thinking token budget.');
    }
    if (reasoning.budgetTokens >= maxOutputTokens) {
      throw new Error('Anthropic manual thinking budget must be less than max output tokens.');
    }

    return {
      thinking: {
        type: 'enabled',
        budget_tokens: reasoning.budgetTokens,
        display: reasoning.display,
      },
      ...buildAnthropicEffortParams(reasoning.effort),
    };
  }

  if (reasoning.mode === 'openai-chat') {
    throw new Error('Reasoning mode "openai-chat" is not valid for Anthropic messages.');
  }

  return {};
}
