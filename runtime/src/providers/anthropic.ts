import Anthropic from '@anthropic-ai/sdk';
import { LLMGatewayError } from '../types.js';
import type { LLMProvider, RuntimeMessageParam } from '../types.js';

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    });
    this.model = process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022';
  }

  async executeTurn(systemPrompt: string, messages: RuntimeMessageParam[]): Promise<string> {
    try {
      const stream = await this.client.messages.create({
        model: this.model,
        max_tokens: 8192,
        system: systemPrompt,
        messages: messages,
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
