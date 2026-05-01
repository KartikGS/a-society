export const DEFAULT_ANTHROPIC_MAX_OUTPUT_TOKENS = 4096;
export const DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS = 8192;

const THINKING_SYSTEM_INSTRUCTION =
  'Runtime model setting: supportsThinking is enabled. Reason privately as needed, but do not reveal hidden chain-of-thought. Return only user-visible content, tool calls, and required handoff blocks.';

export interface ProviderRuntimeConfig {
  maxOutputTokens?: number;
  supportsThinking?: boolean;
}

export function resolveMaxOutputTokens(value: number | undefined, fallback: number): number {
  if (Number.isInteger(value) && value !== undefined && value > 0) {
    return value;
  }
  return fallback;
}

export function appendThinkingSystemInstruction(systemPrompt: string, supportsThinking: boolean): string {
  if (!supportsThinking || systemPrompt.includes(THINKING_SYSTEM_INSTRUCTION)) {
    return systemPrompt;
  }

  return `${systemPrompt.trimEnd()}\n\n${THINKING_SYSTEM_INSTRUCTION}`;
}
