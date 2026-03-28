import OpenAI from 'openai';
import { LLMGatewayError } from '../types.js';
import type { LLMProvider, RuntimeMessageParam, ToolDefinition, ProviderTurnResult } from '../types.js';

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

  async executeTurn(
    systemPrompt: string,
    messages: RuntimeMessageParam[],
    tools?: ToolDefinition[]
  ): Promise<ProviderTurnResult> {
    try {
      const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(m => {
          if (m.role === 'user') return { role: 'user' as const, content: m.content };
          if (m.role === 'assistant') return { role: 'assistant' as const, content: m.content };
          if (m.role === 'assistant_tool_calls') return {
            role: 'assistant' as const,
            content: m.text || null,
            tool_calls: m.calls.map(c => ({
              id: c.id,
              type: 'function' as const,
              function: { name: c.name, arguments: JSON.stringify(c.input) }
            }))
          };
          if (m.role === 'tool_result') return {
            role: 'tool' as const,
            content: m.content,
            tool_call_id: m.callId
          };
          throw new Error('Unknown message type');
        })
      ];

      if (tools && tools.length > 0) {
        const nativeTools: OpenAI.Chat.ChatCompletionTool[] = tools.map((def: any) => ({
          type: 'function',
          function: {
            name: def.name,
            description: def.description,
            parameters: def.inputSchema
          }
        }));

        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: openAIMessages,
          tools: nativeTools,
          stream: false,
          max_tokens: 8192
        });

        if (!response.choices || response.choices.length === 0 || !response.choices[0].message) {
          throw new LLMGatewayError('PROVIDER_MALFORMED', 'OpenAI-compatible provider returned empty choices.');
        }

        const message = response.choices[0].message;

        if (message.tool_calls && message.tool_calls.length > 0) {
          const calls = message.tool_calls.map(c => {
            let input: Record<string, unknown>;
            let parseError: string | undefined;
            try {
              input = JSON.parse(c.function.arguments);
            } catch (e) {
              input = {};
              parseError = c.function.arguments;
            }
            return { id: c.id, name: c.function.name, input, parseError };
          });
          const text = message.content || undefined;
          return { type: 'tool_calls', calls, continuationMessages: [{ role: 'assistant_tool_calls', calls, text }] };
        }

        const textResult = message.content ?? '';
        process.stdout.write(textResult);
        return { type: 'text', text: textResult };
      } else {
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
        return { type: 'text', text: fullResponse };
      }

    } catch (err: any) {
      if (err instanceof LLMGatewayError) throw err;
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
