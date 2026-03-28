import Anthropic from '@anthropic-ai/sdk';
import { LLMGatewayError } from '../types.js';
import type { LLMProvider, RuntimeMessageParam, ToolDefinition, ProviderTurnResult } from '../types.js';

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    });
    this.model = process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022';
  }

  async executeTurn(
    systemPrompt: string,
    messages: RuntimeMessageParam[],
    tools?: ToolDefinition[]
  ): Promise<ProviderTurnResult> {
    try {
      const nativeMessages: Anthropic.MessageParam[] = messages.map(m => {
        if (m.role === 'user') return { role: 'user', content: m.content };
        if (m.role === 'assistant') return { role: 'assistant', content: m.content };
        if (m.role === 'assistant_tool_calls') {
          return {
            role: 'assistant',
            content: [
              ...(m.text ? [{ type: 'text' as const, text: m.text }] : []),
              ...m.calls.map(c => ({
                type: 'tool_use' as const,
                id: c.id,
                name: c.name,
                input: c.input
              }))
            ]
          };
        }
        if (m.role === 'tool_result') {
          return {
            role: 'user',
            content: [{
              type: 'tool_result' as const,
              tool_use_id: m.callId,
              content: m.content,
              is_error: m.isError
            }]
          };
        }
        throw new Error('Unknown message type');
      });

      if (tools && tools.length > 0) {
        const nativeTools: Anthropic.Tool[] = tools.map((def: any) => ({
          name: def.name,
          description: def.description,
          input_schema: def.inputSchema
        }));

        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: 8192,
          system: systemPrompt,
          messages: nativeMessages,
          tools: nativeTools,
          stream: false
        });

        if (response.stop_reason === 'tool_use') {
          const calls = response.content.filter((c: any) => c.type === 'tool_use').map((c: any) => ({
            id: c.id,
            name: c.name,
            input: c.input as Record<string, unknown>
          }));
          const textBlock: any = response.content.find((c: any) => c.type === 'text');
          const text = textBlock ? textBlock.text : undefined;
          return {
            type: 'tool_calls',
            calls,
            continuationMessages: [{ role: 'assistant_tool_calls', calls, text }]
          };
        }

        if (response.stop_reason === 'end_turn') {
          const textBlock: any = response.content.find((c: any) => c.type === 'text');
          const text = textBlock ? textBlock.text : '';
          process.stdout.write(text);
          return { type: 'text', text };
        }

        throw new LLMGatewayError('PROVIDER_MALFORMED', `Unexpected stop_reason from Anthropic provider: ${response.stop_reason}`);
      } else {
        const stream = await this.client.messages.create({
          model: this.model,
          max_tokens: 8192,
          system: systemPrompt,
          messages: nativeMessages,
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
        return { type: 'text', text: fullResponse };
      }
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
