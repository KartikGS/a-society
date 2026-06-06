export const OPENAI_REASONING_EFFORTS = ['none', 'minimal', 'low', 'medium', 'high', 'xhigh'] as const;
export type OpenAIReasoningEffort = typeof OPENAI_REASONING_EFFORTS[number];

export const ANTHROPIC_EFFORTS = ['none', 'low', 'medium', 'high', 'xhigh', 'max'] as const;
export type AnthropicEffort = typeof ANTHROPIC_EFFORTS[number];

export const ANTHROPIC_THINKING_DISPLAYS = ['omitted', 'summarized'] as const;
export type AnthropicThinkingDisplay = typeof ANTHROPIC_THINKING_DISPLAYS[number];

export const OPENAI_COMPATIBLE_TOKEN_LIMIT_PARAMS = ['max_tokens', 'max_completion_tokens'] as const;
export type OpenAICompatibleTokenLimitParam = typeof OPENAI_COMPATIBLE_TOKEN_LIMIT_PARAMS[number];

export const PROVIDER_REASONING_REPLAY_POLICIES = ['never', 'tool-calls-only', 'always'] as const;
export type ProviderReasoningReplayPolicy = typeof PROVIDER_REASONING_REPLAY_POLICIES[number];

export const PROVIDER_REASONING_DISPLAYS = ['hidden', 'collapsed', 'expanded'] as const;
export type ProviderReasoningDisplay = typeof PROVIDER_REASONING_DISPLAYS[number];

const CUSTOM_OPENAI_COMPATIBLE_RESERVED_BODY_KEYS = new Set([
  'model',
  'messages',
  'stream',
  'stream_options',
  'tools',
  'max_tokens',
  'max_completion_tokens',
]);

export interface CustomOpenAICompatibleReasoningTraceConfig {
  responseDeltaField: string;
  requestMessageField: string;
  replay: ProviderReasoningReplayPolicy;
  display: ProviderReasoningDisplay;
  label: string;
}

export interface CustomOpenAICompatibleReasoningRequestConfig {
  tokenLimitParam: OpenAICompatibleTokenLimitParam;
  extraBody: Record<string, unknown>;
}

export type ModelReasoningConfig =
  | { mode: 'disabled' }
  | { mode: 'openai-chat'; effort: OpenAIReasoningEffort }
  | {
      mode: 'custom-openai-compatible';
      request: CustomOpenAICompatibleReasoningRequestConfig;
      trace?: CustomOpenAICompatibleReasoningTraceConfig;
    }
  | { mode: 'anthropic-adaptive'; effort: AnthropicEffort; display: AnthropicThinkingDisplay }
  | { mode: 'anthropic-manual'; effort: AnthropicEffort; display: AnthropicThinkingDisplay; budgetTokens: number };

export type ReasoningProviderType = 'anthropic' | 'openai-compatible';

export const DISABLED_REASONING: ModelReasoningConfig = { mode: 'disabled' };

function isOpenAIReasoningEffort(value: unknown): value is OpenAIReasoningEffort {
  return typeof value === 'string' && (OPENAI_REASONING_EFFORTS as readonly string[]).includes(value);
}

function isAnthropicEffort(value: unknown): value is AnthropicEffort {
  return typeof value === 'string' && (ANTHROPIC_EFFORTS as readonly string[]).includes(value);
}

function isAnthropicThinkingDisplay(value: unknown): value is AnthropicThinkingDisplay {
  return typeof value === 'string' && (ANTHROPIC_THINKING_DISPLAYS as readonly string[]).includes(value);
}

function isOpenAICompatibleTokenLimitParam(value: unknown): value is OpenAICompatibleTokenLimitParam {
  return typeof value === 'string' && (OPENAI_COMPATIBLE_TOKEN_LIMIT_PARAMS as readonly string[]).includes(value);
}

function isProviderReasoningReplayPolicy(value: unknown): value is ProviderReasoningReplayPolicy {
  return typeof value === 'string' && (PROVIDER_REASONING_REPLAY_POLICIES as readonly string[]).includes(value);
}

function isProviderReasoningDisplay(value: unknown): value is ProviderReasoningDisplay {
  return typeof value === 'string' && (PROVIDER_REASONING_DISPLAYS as readonly string[]).includes(value);
}

function normalizeObjectRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function normalizeFieldName(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeModelReasoningConfig(value: unknown): ModelReasoningConfig {
  if (!value || typeof value !== 'object') {
    return DISABLED_REASONING;
  }

  const raw = value as Record<string, unknown>;
  switch (raw.mode) {
    case 'openai-chat':
      return {
        mode: 'openai-chat',
        effort: isOpenAIReasoningEffort(raw.effort) ? raw.effort : 'medium',
      };
    case 'custom-openai-compatible': {
      const request = normalizeObjectRecord(raw.request);
      const trace = normalizeObjectRecord(raw.trace);
      const responseDeltaField = normalizeFieldName(trace.responseDeltaField);
      const requestMessageField = normalizeFieldName(trace.requestMessageField);
      return {
        mode: 'custom-openai-compatible',
        request: {
          tokenLimitParam: isOpenAICompatibleTokenLimitParam(request.tokenLimitParam)
            ? request.tokenLimitParam
            : 'max_tokens',
          extraBody: normalizeObjectRecord(request.extraBody),
        },
        trace: responseDeltaField && requestMessageField
          ? {
              responseDeltaField,
              requestMessageField,
              replay: isProviderReasoningReplayPolicy(trace.replay) ? trace.replay : 'tool-calls-only',
              display: isProviderReasoningDisplay(trace.display) ? trace.display : 'collapsed',
              label: normalizeFieldName(trace.label) || 'Provider reasoning trace',
            }
          : undefined,
      };
    }
    case 'anthropic-adaptive':
      return {
        mode: 'anthropic-adaptive',
        effort: isAnthropicEffort(raw.effort) ? raw.effort : 'medium',
        display: isAnthropicThinkingDisplay(raw.display) ? raw.display : 'omitted',
      };
    case 'anthropic-manual': {
      const budgetTokens = Number(raw.budgetTokens);
      return {
        mode: 'anthropic-manual',
        effort: isAnthropicEffort(raw.effort) ? raw.effort : 'medium',
        display: isAnthropicThinkingDisplay(raw.display) ? raw.display : 'omitted',
        budgetTokens: Number.isInteger(budgetTokens) && budgetTokens > 0 ? budgetTokens : 0,
      };
    }
    default:
      return DISABLED_REASONING;
  }
}

export function isReasoningCompatibleWithProvider(
  providerType: ReasoningProviderType,
  reasoning: ModelReasoningConfig
): boolean {
  if (reasoning.mode === 'disabled') return true;
  if (providerType === 'openai-compatible') {
    return reasoning.mode === 'openai-chat' || reasoning.mode === 'custom-openai-compatible';
  }
  return reasoning.mode === 'anthropic-adaptive' || reasoning.mode === 'anthropic-manual';
}

export function defaultReasoningForProvider(providerType: ReasoningProviderType): ModelReasoningConfig {
  return providerType === 'anthropic'
    ? { mode: 'anthropic-adaptive', effort: 'medium', display: 'omitted' }
    : { mode: 'openai-chat', effort: 'medium' };
}

export function reasoningLabel(reasoning: ModelReasoningConfig): string | null {
  switch (reasoning.mode) {
    case 'openai-chat':
      return `Reasoning ${reasoning.effort}`;
    case 'custom-openai-compatible':
      return 'Custom reasoning';
    case 'anthropic-adaptive':
      return `Adaptive thinking ${reasoning.effort}`;
    case 'anthropic-manual':
      return `Manual thinking ${reasoning.budgetTokens.toLocaleString()} tokens`;
    case 'disabled':
      return null;
  }
}

export function getCustomOpenAICompatibleReservedBodyKeys(extraBody: Record<string, unknown>): string[] {
  return Object.keys(extraBody).filter((key) => CUSTOM_OPENAI_COMPATIBLE_RESERVED_BODY_KEYS.has(key));
}
