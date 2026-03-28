import { AnthropicProvider } from './providers/anthropic.js';
import { OpenAICompatibleProvider } from './providers/openai-compatible.js';
import type { LLMProvider, RuntimeMessageParam } from './types.js';
import { LLMGatewayError } from './types.js';

export type { RuntimeMessageParam };
export { LLMGatewayError } from './types.js';

function createProvider(name: string): LLMProvider {
  switch (name) {
    case 'anthropic':        return new AnthropicProvider();
    case 'openai-compatible': return new OpenAICompatibleProvider();
    default:
      throw new LLMGatewayError(
        'UNKNOWN',
        `Unknown provider: "${name}". Supported: anthropic, openai-compatible.`
      );
  }
}

export class LLMGateway {
  private provider: LLMProvider;

  constructor(provider?: LLMProvider) {
    if (provider) {
      this.provider = provider;
    } else {
      this.provider = createProvider(process.env.LLM_PROVIDER ?? 'anthropic');
    }
  }

  async executeTurn(systemPrompt: string, messageHistory: RuntimeMessageParam[]): Promise<string> {
    return this.provider.executeTurn(systemPrompt, messageHistory);
  }
}
