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

      const nativeTools = tools && tools.length > 0
        ? tools.map((def: any) => ({
            type: 'function' as const,
            function: {
              name: def.name,
              description: def.description,
              parameters: def.inputSchema
            }
          }))
        : undefined;

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: openAIMessages,
        stream: true,
        max_tokens: 8192,
        ...(nativeTools ? { tools: nativeTools } : {})
      });

      let fullText = '';
      let finishReason: string | null = null;
      const toolCallAcc = new Map<number, { id: string; name: string; args: string }>();

      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (!choice) continue;
        if (choice.finish_reason) finishReason = choice.finish_reason;
        const delta = choice.delta;
        if (!delta) continue;
        if (delta.content) {
          process.stdout.write(delta.content);
          fullText += delta.content;
        }
        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            if (!toolCallAcc.has(tc.index)) {
              toolCallAcc.set(tc.index, { id: '', name: '', args: '' });
            }
            const acc = toolCallAcc.get(tc.index)!;
            if (tc.id) acc.id = tc.id;
            if (tc.function?.name) acc.name = acc.name || tc.function.name;
            if (tc.function?.arguments) acc.args += tc.function.arguments;
          }
        }
      }

      if (fullText) process.stdout.write('\n');
      if (finishReason === 'length') {
        process.stderr.write(`[Warning] Response truncated: model hit max_tokens limit (finish_reason=length). The response may be incomplete.\n`);
      }

      if (toolCallAcc.size > 0) {
        const calls = Array.from(toolCallAcc.values()).map(acc => {
          let input: Record<string, unknown>;
          let parseError: string | undefined;
          try { input = JSON.parse(acc.args); }
          catch { input = {}; parseError = acc.args; }
          return { id: acc.id, name: acc.name, input, parseError };
        });
        return {
          type: 'tool_calls',
          calls,
          continuationMessages: [{ role: 'assistant_tool_calls', calls, text: fullText || undefined }]
        };
      }

      return { type: 'text', text: fullText };

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
