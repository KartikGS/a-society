import OpenAI from 'openai';
import { LLMGatewayError } from '../types.js';
import type { LLMProvider, RuntimeMessageParam } from '../types.js';

export class OpenAICompatibleProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    const baseURL = process.env.OPENAI_COMPAT_BASE_URL;
    if (!baseURL) {
      throw new LLMGatewayError('UNKNOWN', 'LLM_PROVIDER=openai-compatible requires OPENAI_COMPAT_BASE_URL to be set.');
    }

    this.client = new OpenAI({
      baseURL: baseURL,
      apiKey: process.env.OPENAI_COMPAT_API_KEY || ''
    });
    this.model = process.env.OPENAI_COMPAT_MODEL ?? 'mistralai/Mistral-7B-Instruct-v0.3';
  }

  async executeTurn(systemPrompt: string, messages: RuntimeMessageParam[]): Promise<string> {
    try {
      const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      ];

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: openAIMessages,
        stream: true,
        max_tokens: 8192
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? '';
        if (text) {
          process.stdout.write(text);
          fullResponse += text;
        }
      }

      process.stdout.write('\n');
      return fullResponse;

    } catch (err: any) {
      if (err instanceof OpenAI.AuthenticationError) {
        throw new LLMGatewayError('AUTH_ERROR', 'Authentication failed: check OPENAI_COMPAT_API_KEY');
      }
      if (err instanceof OpenAI.RateLimitError || err instanceof OpenAI.APIConnectionError) {
        throw new LLMGatewayError('RATE_LIMIT', 'Transient network or rate limit error');
      }
      if (err instanceof OpenAI.APIError) {
        throw new LLMGatewayError('PROVIDER_MALFORMED', `Provider API error: ${err.message}`);
      }

      throw new LLMGatewayError('UNKNOWN', `Unexpected provider error: ${err?.message || err}`);
    }
  }
}
