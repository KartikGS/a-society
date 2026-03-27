import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages.mjs';
export type { MessageParam };

export class LLMGatewayError extends Error {
  constructor(public readonly type: 'AUTH_ERROR' | 'RATE_LIMIT' | 'PROVIDER_MALFORMED' | 'UNKNOWN', message: string) {
    super(message);
    this.name = 'LLMGatewayError';
  }
}

export class LLMGateway {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    });
  }

  /**
   * Sends the role turn to Authropic, streaming the output to the console 
   * and returning the fully assembled message for the orchestrator.
   */
  async executeTurn(systemPrompt: string, messageHistory: MessageParam[]): Promise<string> {
    try {
      const stream = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8192,
        system: systemPrompt,
        messages: messageHistory,
        stream: true
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          process.stdout.write(chunk.delta.text);
          fullResponse += chunk.delta.text;
        }
      }
      
      process.stdout.write('\n'); // newline after stream finishes
      return fullResponse;

    } catch (err: any) {
      if (err instanceof Anthropic.AuthenticationError) {
        throw new LLMGatewayError('AUTH_ERROR', 'Authentication failed check ANTHROPIC_API_KEY');
      }
      if (err instanceof Anthropic.RateLimitError || err instanceof Anthropic.APIConnectionError) {
        throw new LLMGatewayError('RATE_LIMIT', 'Transient network or rate limit error');
      }
      if (err instanceof Anthropic.APIError) {
        throw new LLMGatewayError('PROVIDER_MALFORMED', `Provider API error: ${err.message}`);
      }
      
      throw new LLMGatewayError('UNKNOWN', `Unexpected provider error: ${err?.message || err}`);
    }
  }
}
