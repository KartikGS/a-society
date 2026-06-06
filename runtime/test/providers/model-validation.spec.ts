import { afterEach, describe, expect, it, vi } from 'vitest';
import { LLMGatewayError } from '../../src/common/types.js';
import { AnthropicProvider } from '../../src/providers/anthropic.js';
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
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('sends a small sample request through the configured provider', async () => {
    const executeTurn = vi
      .spyOn(AnthropicProvider.prototype, 'executeTurn')
      .mockResolvedValue({ type: 'text', text: 'OK' });

    await validateModelConfiguration(baseConfig);

    expect(executeTurn).toHaveBeenCalledWith(
      expect.stringContaining('validating'),
      [{ role: 'user', content: 'Reply with OK.' }],
      undefined,
      expect.objectContaining({ roleInstanceId: '__settings_validation__' })
    );
  });

  it('redacts the API key from provider validation errors', async () => {
    vi.spyOn(AnthropicProvider.prototype, 'executeTurn')
      .mockRejectedValue(new LLMGatewayError('AUTH_ERROR', 'Bad key secret-validation-key.'));

    await expect(validateModelConfiguration(baseConfig))
      .rejects.toThrow(/Model validation failed \(AUTH_ERROR\).*Bad key \[redacted\]\./);
  });

  it('fails validation when the sample request times out', async () => {
    vi.useFakeTimers();
    vi.spyOn(AnthropicProvider.prototype, 'executeTurn').mockImplementation(
      (_systemPrompt, _messages, _tools, options) => new Promise((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => reject(new LLMGatewayError('ABORTED', 'aborted')));
      })
    );

    const validation = validateModelConfiguration(baseConfig);
    const assertion = expect(validation).rejects.toThrow(/sample request timed out after 20 seconds/);
    await vi.advanceTimersByTimeAsync(20_000);

    await assertion;
  });
});
