import Anthropic from '@anthropic-ai/sdk';
import { LLMGatewayError } from '../types.js';
import { TelemetryManager } from '../observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';
import {
  appendThinkingSystemInstruction,
  DEFAULT_ANTHROPIC_MAX_OUTPUT_TOKENS,
  resolveMaxOutputTokens,
  type ProviderRuntimeConfig
} from './config.js';

import type {
  LLMProvider,
  RuntimeMessageParam,
  ProviderTurnResult,
  ToolDefinition,
  TurnOptions
} from '../types.js';

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;
  private maxOutputTokens: number;
  private supportsThinking: boolean;

  constructor(apiKey: string, model: string, config: ProviderRuntimeConfig = {}) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
    this.maxOutputTokens = resolveMaxOutputTokens(
      config.maxOutputTokens,
      DEFAULT_ANTHROPIC_MAX_OUTPUT_TOKENS
    );
    this.supportsThinking = config.supportsThinking === true;
  }

  async executeTurn(
    systemPrompt: string,
    messages: RuntimeMessageParam[],
    tools?: ToolDefinition[],
    options?: TurnOptions
  ): Promise<ProviderTurnResult> {
    const tracer = TelemetryManager.getTracer();

    return tracer.startActiveSpan('provider.execute_turn', {
      kind: SpanKind.CLIENT,
      attributes: {
        'provider.name': 'anthropic',
        'provider.model': this.model,
        'provider.max_output_tokens': this.maxOutputTokens,
        'provider.supports_thinking': this.supportsThinking,
        'provider.tools_count': tools?.length ?? 0,
        'provider.message_count': messages.length
      }
    }, async (span) => {
      const renderer = options?.operatorRenderer;
      const outputStream = options?.outputStream ?? process.stdout;
      let displayedText = false;
      let fullText = '';

      try {
        renderer?.startWait(options?.role ?? '', 'anthropic', this.model);

        const anthropicMessages: any[] = messages.map(msg => {
          if (msg.role === 'user') return { role: 'user', content: msg.content };
          if (msg.role === 'assistant') return { role: 'assistant', content: msg.content };
          if (msg.role === 'assistant_tool_calls') {
            const content: any[] = [];
            if (msg.text) content.push({ type: 'text', text: msg.text });
            content.push(...msg.calls.map(c => ({
              type: 'tool_use',
              id: c.id,
              name: c.name,
              input: c.input
            })));
            return { role: 'assistant', content };
          }
          if (msg.role === 'tool_result') {
            return {
              role: 'user',
              content: [{
                type: 'tool_result',
                tool_use_id: msg.callId,
                content: msg.content,
                is_error: msg.isError
              }]
            };
          }
          return { role: 'user', content: (msg as any).content };
        });

        const stream = this.client.messages.stream({
          max_tokens: this.maxOutputTokens,
          system: appendThinkingSystemInstruction(systemPrompt, this.supportsThinking),
          messages: anthropicMessages,
          model: this.model,
          tools: tools?.map(t => ({
            name: t.name,
            description: t.description,
            input_schema: t.inputSchema
          }))
        }, {
          signal: options?.signal
        });

        const toolUseBlocks = new Map<number, { id: string, name: string, inputJson: string }>();

        stream.on('streamEvent', (event) => {
          if (event.type === 'content_block_start') {
            const chunk = event as any;
            const block = chunk.content_block as any;
            if (block.type === 'tool_use') {
              toolUseBlocks.set(chunk.index, { id: block.id, name: block.name, inputJson: '' });
              span.addEvent('provider.tool_use_block_received', { 'tool.name': block.name, 'tool.id': block.id });
              renderer?.stopWait(options?.role ?? '');
            }
          } else if (event.type === 'content_block_delta') {
            const chunk = event as any;
            const delta = chunk.delta as any;
            if (delta.type === 'text_delta') {
              if (fullText === '') renderer?.stopWait(options?.role ?? '');
              outputStream.write(delta.text);
              fullText += delta.text;
              displayedText = true;
            } else if (delta.type === 'input_json_delta') {
              const block = toolUseBlocks.get(chunk.index);
              if (block) block.inputJson += delta.partial_json;
            }
          }
        });

        const finalMsg = await stream.finalMessage();
        renderer?.stopWait(options?.role ?? '');

        const inputTokens = finalMsg.usage?.input_tokens;
        const outputTokens = finalMsg.usage?.output_tokens;
        const stopReason = finalMsg.stop_reason;

        const usage = (inputTokens !== undefined || outputTokens !== undefined)
          ? { inputTokens, outputTokens }
          : undefined;

        if (inputTokens !== undefined) span.setAttribute('provider.input_tokens', inputTokens);
        if (outputTokens !== undefined) span.setAttribute('provider.output_tokens', outputTokens);
        if (stopReason) span.setAttribute('provider.stop_reason', stopReason);

        if (toolUseBlocks.size > 0) {
          const calls = Array.from(toolUseBlocks.values()).map(b => {
            let input: any = {};
            try { input = JSON.parse(b.inputJson); } catch (_e) { /* ignore */ }
            return { id: b.id, name: b.name, input };
          });
          span.setAttribute('provider.result_type', 'tool_calls');
          return {
            type: 'tool_calls' as const,
            calls,
            continuationMessages: [{ role: 'assistant_tool_calls' as const, calls, text: fullText || undefined }],
            usage,
            displayedText
          };
        }

        span.setAttribute('provider.result_type', 'text');
        return { type: 'text' as const, text: fullText, usage, displayedText };

      } catch (error: any) {
        renderer?.stopWait(options?.role ?? '');
        if (error.name === 'AbortError' || error.type === 'aborted' || options?.signal?.aborted) {
          span.addEvent('provider.aborted');
          span.setStatus({ code: SpanStatusCode.OK });
          throw new LLMGatewayError('ABORTED', 'Turn aborted by operator', fullText || undefined);
        } else {
          span.recordException(error);
          span.setStatus({ code: SpanStatusCode.ERROR });
        }
        throw error;
      } finally {
        span.end();
      }
    });
  }
}
