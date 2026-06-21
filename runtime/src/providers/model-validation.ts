import type { ModelReasoningConfig } from '../../shared/model-reasoning.js';
import { LLMGatewayError, type LLMProvider } from '../common/types.js';
import { AnthropicProvider } from './anthropic.js';
import { OpenAICompatibleProvider } from './openai-compatible.js';

const DEFAULT_VALIDATION_TIMEOUT_MS = 20_000;

export interface ModelValidationConfig {
  providerType: 'anthropic' | 'openai-compatible';
  providerBaseUrl: string;
  modelId: string;
  apiKey: string;
  maxOutputTokens: number;
  reasoning: ModelReasoningConfig;
}

function createProvider(config: ModelValidationConfig): LLMProvider {
  const providerRuntimeConfig = {
    maxOutputTokens: config.maxOutputTokens,
    reasoning: config.reasoning,
  };

  if (config.providerType === 'anthropic') {
    return new AnthropicProvider(config.apiKey, config.modelId, providerRuntimeConfig);
  }

  return new OpenAICompatibleProvider({
    baseURL: config.providerBaseUrl,
    apiKey: config.apiKey,
    model: config.modelId,
    ...providerRuntimeConfig,
  });
}

function sanitizeProviderMessage(message: string, apiKey: string): string {
  const trimmed = message.trim();
  if (!apiKey.trim()) return trimmed;
  return trimmed.split(apiKey).join('[redacted]');
}

function validationFailureMessage(
  error: unknown,
  config: ModelValidationConfig,
  timedOut: boolean,
  timeoutMs: number
): string {
  if (timedOut) {
    return `Model validation failed: sample request timed out after ${Math.ceil(timeoutMs / 1000)} seconds.`;
  }

  const providerMessage = error instanceof Error ? error.message : String(error);
  const cleanMessage = sanitizeProviderMessage(providerMessage, config.apiKey);
  if (error instanceof LLMGatewayError) {
    return `Model validation failed (${error.type}): ${cleanMessage}`;
  }
  return `Model validation failed: ${cleanMessage}`;
}

export async function validateModelConfiguration(config: ModelValidationConfig): Promise<void> {
  if (config.apiKey.trim() === '') {
    throw new Error('Model validation failed: API key is required.');
  }
  if (config.providerType === 'openai-compatible' && config.providerBaseUrl.trim() === '') {
    throw new Error('Model validation failed: provider base URL is required.');
  }

  const controller = new AbortController();
  let timedOut = false;
  const timeoutMs = DEFAULT_VALIDATION_TIMEOUT_MS;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const provider = createProvider(config);
    await provider.executeTurn(
      'You are validating a runtime model configuration. Reply with exactly OK.',
      [{ role: 'user', content: 'Reply with OK.' }],
      undefined,
      { signal: controller.signal, roleInstanceId: '__settings_validation__' }
    );
  } catch (error) {
    throw new Error(validationFailureMessage(error, config, timedOut, timeoutMs));
  } finally {
    clearTimeout(timeout);
  }
}
