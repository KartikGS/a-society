import Anthropic from '@anthropic-ai/sdk';
import { LLMGatewayError } from '../types.js';
import type { LLMProvider, RuntimeMessageParam, ToolDefinition, ProviderTurnResult, TurnOptions, TurnUsage } from '../types.js';
import { Spinner } from '../spinner.js';

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
    tools?: ToolDefinition[],
    options?: TurnOptions
  ): Promise<ProviderTurnResult> {
    const spinner = new Spinner();
    spinner.start();
    let fullText = '';
    let inputTokens: number | undefined;
    let outputTokens: number | undefined;

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

      const nativeTools = tools && tools.length > 0
        ? tools.map((def: any) => ({
            name: def.name,
            description: def.description,
            input_schema: def.inputSchema
          }))
        : undefined;

      const stream = await this.client.messages.create(
        {
          model: this.model,
          max_tokens: 8192,
          system: systemPrompt,
          messages: nativeMessages,
          ...(nativeTools ? { tools: nativeTools } : {}),
          stream: true
        },
        { signal: options?.signal }
      );

      let stopReason: string | null = null;
      const toolUseBlocks = new Map<number, { id: string; name: string; inputJson: string }>();

      for await (const chunk of stream) {
        if (chunk.type === 'message_start') {
          inputTokens = (chunk as any).message?.usage?.input_tokens;
        } else if (chunk.type === 'message_delta') {
          if ((chunk.delta as any).stop_reason) {
            stopReason = (chunk.delta as any).stop_reason;
          }
          if ((chunk as any).usage?.output_tokens) {
            outputTokens = (chunk as any).usage?.output_tokens;
          }
        } else if (chunk.type === 'content_block_start') {
          const block = chunk.content_block as any;
          if (block.type === 'tool_use') {
            toolUseBlocks.set(chunk.index, { id: block.id, name: block.name, inputJson: '' });
          }
        } else if (chunk.type === 'content_block_delta') {
          const delta = chunk.delta as any;
          if (delta.type === 'text_delta') {
            if (fullText === '') spinner.stop();
            process.stdout.write(delta.text);
            fullText += delta.text;
          } else if (delta.type === 'input_json_delta') {
            const block = toolUseBlocks.get(chunk.index);
            if (block) block.inputJson += delta.partial_json;
          }
        }
      }

      spinner.stop();

      if (fullText) process.stdout.write('\n');
      if (stopReason === 'max_tokens') {
        process.stderr.write(`[Warning] Response truncated: model hit max_tokens limit (stop_reason=max_tokens). The response may be incomplete.\n`);
      }

      const usage: TurnUsage | undefined = (inputTokens !== undefined || outputTokens !== undefined)
        ? { inputTokens, outputTokens }
        : undefined;

      if (toolUseBlocks.size > 0) {
        const calls = Array.from(toolUseBlocks.values()).map(block => ({
          id: block.id,
          name: block.name,
          input: (() => { try { return JSON.parse(block.inputJson) as Record<string, unknown>; } catch { return {} as Record<string, unknown>; } })()
        }));
        return {
          type: 'tool_calls',
          calls,
          continuationMessages: [{ role: 'assistant_tool_calls', calls, text: fullText || undefined }],
          usage
        };
      }

      return { type: 'text', text: fullText, usage };
    } catch (err: any) {
      if (err?.name === 'AbortError' || options?.signal?.aborted) {
        spinner.stop();
        throw new LLMGatewayError('ABORTED', 'Turn aborted by operator', fullText || undefined);
      }
      spinner.stop();
      if (err instanceof LLMGatewayError) throw err;
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
