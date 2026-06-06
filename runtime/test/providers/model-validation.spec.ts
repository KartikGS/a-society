import { describe, expect, it, vi } from 'vitest';
import { LLMGatewayError, type LLMProvider, type RuntimeMessageParam, type ToolDefinition, type TurnOptions } from '../../src/common/types.js';
import { validateModelConfiguration, type ModelValidationConfig } from '../../src/providers/model-validation.js';

const baseConfig: ModelValidationConfig = {
  providerType: 'anthropic',
  providerBaseUrl: '',
  modelId: 'claude-test',
  apiKey: 'secret-validation-key',
  maxOutputTokens: 64,
  reasoning: { mode: 'disabled' },
};

describe('model validation', () => {
  it('sends a small sample request through the configured provider', async () => {
    const executeTurn = vi.fn<LLMProvider['executeTurn']>().mockResolvedValue({ type: 'text', text: 'OK' });

    await validateModelConfiguration(baseConfig, {
      createProvider: () => ({ executeTurn }),
    });

    expect(executeTurn).toHaveBeenCalledWith(
      expect.stringContaining('validating'),
      [{ role: 'user', content: 'Reply with OK.' }],
      undefined,
      expect.objectContaining({ roleInstanceId: '__settings_validation__' })
    );
  });

  it('redacts the API key from provider validation errors', async () => {
    const provider: LLMProvider = {
      async executeTurn() {
        throw new LLMGatewayError('AUTH_ERROR', 'Bad key secret-validation-key.');
      },
    };

    await expect(validateModelConfiguration(baseConfig, { createProvider: () => provider }))
      .rejects.toThrow(/Model validation failed \(AUTH_ERROR\).*Bad key \[redacted\]\./);
  });

  it('fails validation when the sample request times out', async () => {
    const provider: LLMProvider = {
      async executeTurn(
        _systemPrompt: string,
        _messages: RuntimeMessageParam[],
        _tools?: ToolDefinition[],
        options?: TurnOptions
      ) {
        return new Promise((resolve, reject) => {
          options?.signal?.addEventListener('abort', () => reject(new LLMGatewayError('ABORTED', 'aborted')));
          setTimeout(() => resolve({ type: 'text' as const, text: 'late' }), 50);
        });
      },
    };

    await expect(validateModelConfiguration(baseConfig, { createProvider: () => provider, timeoutMs: 1 }))
      .rejects.toThrow(/sample request timed out/);
  });
});
