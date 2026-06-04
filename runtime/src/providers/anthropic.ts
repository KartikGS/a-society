import Anthropic from '@anthropic-ai/sdk';
import { LLMGatewayError } from '../common/types.js';
import { TelemetryManager } from '../observability/observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';
import {
  ATTR_GEN_AI_PROVIDER_NAME,
  ATTR_GEN_AI_OPERATION_NAME,
  ATTR_GEN_AI_REQUEST_MODEL,
  ATTR_GEN_AI_REQUEST_MAX_TOKENS,
  ATTR_GEN_AI_USAGE_INPUT_TOKENS,
  ATTR_GEN_AI_USAGE_OUTPUT_TOKENS,
  ATTR_GEN_AI_RESPONSE_FINISH_REASONS,
  GEN_AI_PROVIDER_NAME_VALUE_ANTHROPIC,
  GEN_AI_OPERATION_NAME_VALUE_CHAT,
  METRIC_GEN_AI_CLIENT_OPERATION_DURATION,
} from '@opentelemetry/semantic-conventions/incubating';
import {
  buildAnthropicReasoningParams,
  DEFAULT_ANTHROPIC_MAX_OUTPUT_TOKENS,
  resolveMaxOutputTokens,
  type ProviderRuntimeConfig
} from './config.js';

import type {
  LLMProvider,
  ProviderReasoningBlock,
  RuntimeMessageParam,
  ProviderTurnResult,
  ToolDefinition,
  TurnOptions
} from '../common/types.js';
import type { ModelReasoningConfig } from '../common/model-reasoning.js';

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;
  private maxOutputTokens: number;
  private reasoning?: ModelReasoningConfig;

  constructor(apiKey: string, model: string, config: ProviderRuntimeConfig = {}) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
    this.maxOutputTokens = resolveMaxOutputTokens(
      config.maxOutputTokens,
      DEFAULT_ANTHROPIC_MAX_OUTPUT_TOKENS
    );
    this.reasoning = config.reasoning;
  }

  private formatAnthropicReasoningBlocks(blocks: ProviderReasoningBlock[] | undefined): any[] {
    if (!blocks?.length) return [];
    return blocks
      .filter((block) => block.provider === 'anthropic' && block.type === 'thinking')
      .map((block) => ({
        type: 'thinking',
        thinking: block.thinking,
        signature: block.signature,
      }));
  }

  private extractAnthropicReasoningBlocks(content: any[] | undefined): ProviderReasoningBlock[] {
    if (!Array.isArray(content)) return [];
    return content
      .filter((block) => block?.type === 'thinking' && typeof block.signature === 'string')
      .map((block) => ({
        provider: 'anthropic' as const,
        type: 'thinking' as const,
        thinking: typeof block.thinking === 'string' ? block.thinking : '',
        signature: block.signature,
      }));
  }

  private shouldEmitAnthropicThinkingSummary(): boolean {
    return (
      (this.reasoning?.mode === 'anthropic-adaptive' || this.reasoning?.mode === 'anthropic-manual') &&
      this.reasoning.display === 'summarized'
    );
  }

  private emitAnthropicThinkingSummary(text: string, options?: TurnOptions): void {
    if (!this.shouldEmitAnthropicThinkingSummary() || text === '') return;
    options?.operatorRenderer?.emit({
      kind: 'provider.reasoning_trace',
      role: options?.roleInstanceId ?? '__system__',
      label: 'Anthropic thinking summary',
      text,
      display: 'collapsed',
    });
  }

  private readableAnthropicThinkingSummary(content: any[] | undefined): string {
    if (!Array.isArray(content)) return '';
    return content
      .filter((block) => block?.type === 'thinking' && typeof block.thinking === 'string')
      .map((block) => block.thinking)
      .filter((thinking) => thinking !== '')
      .join('');
  }

  async executeTurn(
    systemPrompt: string,
    messages: RuntimeMessageParam[],
    tools?: ToolDefinition[],
    options?: TurnOptions
  ): Promise<ProviderTurnResult> {
    const tracer = TelemetryManager.getTracer();
    const meter = TelemetryManager.getMeter();
    const startTime = Date.now();

    return tracer.startActiveSpan(`${GEN_AI_OPERATION_NAME_VALUE_CHAT} ${GEN_AI_PROVIDER_NAME_VALUE_ANTHROPIC}`, {
      kind: SpanKind.CLIENT,
      attributes: {
        [ATTR_GEN_AI_PROVIDER_NAME]: GEN_AI_PROVIDER_NAME_VALUE_ANTHROPIC,
        [ATTR_GEN_AI_OPERATION_NAME]: GEN_AI_OPERATION_NAME_VALUE_CHAT,
        [ATTR_GEN_AI_REQUEST_MODEL]: this.model,
        [ATTR_GEN_AI_REQUEST_MAX_TOKENS]: this.maxOutputTokens,
        'provider.reasoning_mode': this.reasoning?.mode ?? 'disabled',
        'provider.tools_count': tools?.length ?? 0,
        'provider.message_count': messages.length
      }
    }, async (span) => {
      const renderer = options?.operatorRenderer;
      const outputStream = options?.outputStream;
      let fullText = '';
      let thinkingSummary = '';

      try {
        renderer?.requestSent(options?.roleInstanceId ?? '', 'anthropic', this.model);

        const anthropicMessages: any[] = messages.map(msg => {
          if (msg.role === 'user') return { role: 'user', content: msg.content };
          if (msg.role === 'assistant') return { role: 'assistant', content: msg.content };
          if (msg.role === 'assistant_tool_calls') {
            const content: any[] = this.formatAnthropicReasoningBlocks(msg.providerReasoning);
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
          system: systemPrompt,
          messages: anthropicMessages,
          model: this.model,
          tools: tools?.map(t => ({
            name: t.name,
            description: t.description,
            input_schema: t.inputSchema
          })),
          ...buildAnthropicReasoningParams(this.reasoning, this.maxOutputTokens),
        } as any, {
          signal: options?.signal
        });

        const toolUseBlocks = new Map<number, { id: string, name: string, inputJson: string }>();

        renderer?.receivingResponse(options?.roleInstanceId ?? '');

        stream.on('streamEvent', (event) => {
          if (event.type === 'content_block_start') {
            const chunk = event as any;
            const block = chunk.content_block as any;
            if (block.type === 'tool_use') {
              toolUseBlocks.set(chunk.index, { id: block.id, name: block.name, inputJson: '' });
              span.addEvent('provider.tool_use_block_received', { 'tool.name': block.name, 'tool.id': block.id });
            }
          } else if (event.type === 'content_block_delta') {
            const chunk = event as any;
            const delta = chunk.delta as any;
            if (delta.type === 'text_delta') {
              outputStream?.write(delta.text);
              options?.onAssistantTextDelta?.(delta.text);
              fullText += delta.text;
            } else if (delta.type === 'thinking_delta') {
              thinkingSummary += delta.thinking;
              this.emitAnthropicThinkingSummary(delta.thinking, options);
            } else if (delta.type === 'input_json_delta') {
              const block = toolUseBlocks.get(chunk.index);
              if (block) block.inputJson += delta.partial_json;
            }
          }
        });

        const finalMsg = await stream.finalMessage();

        const inputTokens = finalMsg.usage?.input_tokens;
        const outputTokens = finalMsg.usage?.output_tokens;
        const stopReason = finalMsg.stop_reason;

        const contextUsage = (inputTokens !== undefined || outputTokens !== undefined)
          ? (inputTokens ?? 0) + (outputTokens ?? 0)
          : undefined;

        if (inputTokens !== undefined) span.setAttribute(ATTR_GEN_AI_USAGE_INPUT_TOKENS, inputTokens);
        if (outputTokens !== undefined) span.setAttribute(ATTR_GEN_AI_USAGE_OUTPUT_TOKENS, outputTokens);
        if (stopReason) span.setAttribute(ATTR_GEN_AI_RESPONSE_FINISH_REASONS, [stopReason]);

        if (thinkingSummary === '') {
          thinkingSummary = this.readableAnthropicThinkingSummary(finalMsg.content as any[]);
          this.emitAnthropicThinkingSummary(thinkingSummary, options);
        }

        if (toolUseBlocks.size > 0) {
          const providerReasoning = this.extractAnthropicReasoningBlocks(finalMsg.content as any[]);
          const calls = Array.from(toolUseBlocks.values()).map(b => {
            let input: any = {};
            try { input = JSON.parse(b.inputJson); } catch (_e) { /* ignore */ }
            return { id: b.id, name: b.name, input };
          });
          span.setAttribute('provider.result_type', 'tool_calls');
          return {
            type: 'tool_calls' as const,
            calls,
            continuationMessages: [{
              role: 'assistant_tool_calls' as const,
              calls,
              text: fullText || undefined,
              providerReasoning: providerReasoning.length > 0 ? providerReasoning : undefined,
            }],
            contextUsage
          };
        }

        span.setAttribute('provider.result_type', 'text');
        return { type: 'text' as const, text: fullText, contextUsage };

      } catch (error: any) {
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
        meter.createHistogram(METRIC_GEN_AI_CLIENT_OPERATION_DURATION, { unit: 's' })
          .record((Date.now() - startTime) / 1000, {
            [ATTR_GEN_AI_PROVIDER_NAME]: GEN_AI_PROVIDER_NAME_VALUE_ANTHROPIC,
            [ATTR_GEN_AI_OPERATION_NAME]: GEN_AI_OPERATION_NAME_VALUE_CHAT,
            [ATTR_GEN_AI_REQUEST_MODEL]: this.model,
          });
        span.end();
      }
    });
  }
}
