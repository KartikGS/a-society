import OpenAI from 'openai';
import { LLMGatewayError } from '../common/types.js';
import type { LLMProvider, ProviderReasoningBlock, RuntimeMessageParam, ToolDefinition, ProviderTurnResult, TurnOptions } from '../common/types.js';
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
  GEN_AI_PROVIDER_NAME_VALUE_OPENAI,
  GEN_AI_OPERATION_NAME_VALUE_CHAT,
  METRIC_GEN_AI_CLIENT_OPERATION_DURATION,
} from '@opentelemetry/semantic-conventions/incubating';
import {
  buildOpenAIChatCompletionTokenParams,
  DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS,
  ATTR_GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS,
  resolveMaxOutputTokens,
  type ProviderRuntimeConfig
} from './config.js';
import type { ModelReasoningConfig } from '../../shared/model-reasoning.js';
import { withNetworkRetry, isLowLevelNetworkError, formatRetryNotice, MAX_NETWORK_RETRIES } from './retry.js';

export class OpenAICompatibleProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;
  private maxOutputTokens: number;
  private reasoning?: ModelReasoningConfig;

  constructor(config: { baseURL: string; apiKey: string; model: string } & ProviderRuntimeConfig) {
    // Retries are owned by withNetworkRetry; disable the SDK's own retry layer so the
    // backoff/max-attempt count are the single source of truth and each retry can be
    // surfaced to the operator.
    this.client = new OpenAI({ baseURL: config.baseURL, apiKey: config.apiKey, maxRetries: 0 });
    this.model = config.model;
    this.maxOutputTokens = resolveMaxOutputTokens(
      config.maxOutputTokens,
      DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS
    );
    this.reasoning = config.reasoning;
  }

  private formatProviderError(err: any, summary: string, suggestion?: string): string {
    const detail = typeof err?.message === 'string' && err.message.trim() !== ''
      ? ` Provider message: ${err.message}.`
      : '';
    const requestId = typeof err?.request_id === 'string' && err.request_id.trim() !== ''
      ? ` Request ID: ${err.request_id}.`
      : '';
    const nextStep = suggestion ? ` ${suggestion}` : '';
    return `${summary} Model: ${this.model}.${requestId}${detail}${nextStep}`;
  }

  private customReasoningTraceConfig() {
    return this.reasoning?.mode === 'custom-openai-compatible' ? this.reasoning.trace : undefined;
  }

  private readStringPath(source: unknown, fieldPath: string | undefined): string {
    if (!fieldPath || !source || typeof source !== 'object') return '';
    let current: unknown = source;
    for (const part of fieldPath.split('.')) {
      if (!part || !current || typeof current !== 'object') return '';
      current = (current as Record<string, unknown>)[part];
    }
    return typeof current === 'string' ? current : '';
  }

  private readStringField(source: unknown, fieldName: string): string {
    if (!source || typeof source !== 'object') return '';
    const value = (source as Record<string, unknown>)[fieldName];
    return typeof value === 'string' ? value : '';
  }

  private cumulativeStringDelta(text: string, accumulated: string): string {
    if (!text || !accumulated) return text;
    return text.startsWith(accumulated) ? text.slice(accumulated.length) : text;
  }

  private emitReasoningTrace(text: string, options?: TurnOptions): void {
    const trace = this.customReasoningTraceConfig();
    if (!trace || trace.display === 'hidden' || text === '') return;
    options?.operatorRenderer?.emit({
      kind: 'provider.reasoning_trace',
      role: options?.roleInstanceId ?? '__system__',
      label: trace.label,
      text,
      display: trace.display,
    });
  }

  private buildProviderReasoningBlocks(text: string): ProviderReasoningBlock[] | undefined {
    const trace = this.customReasoningTraceConfig();
    if (!trace || trace.replay === 'never' || text === '') return undefined;
    return [{
      provider: 'openai-compatible',
      type: 'message-field',
      field: trace.requestMessageField,
      content: text,
      replay: trace.replay,
    }];
  }

  private applyProviderReasoningBlocks(message: Record<string, unknown>, blocks: ProviderReasoningBlock[] | undefined): void {
    if (!blocks?.length) return;
    for (const block of blocks) {
      if (block.provider !== 'openai-compatible' || block.type !== 'message-field') continue;
      if (block.replay === 'never') continue;
      message[block.field] = block.content;
    }
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

    return tracer.startActiveSpan(`${GEN_AI_OPERATION_NAME_VALUE_CHAT} ${GEN_AI_PROVIDER_NAME_VALUE_OPENAI}`, {
      kind: SpanKind.CLIENT,
      attributes: {
        [ATTR_GEN_AI_PROVIDER_NAME]: GEN_AI_PROVIDER_NAME_VALUE_OPENAI,
        [ATTR_GEN_AI_OPERATION_NAME]: GEN_AI_OPERATION_NAME_VALUE_CHAT,
        [ATTR_GEN_AI_REQUEST_MODEL]: this.model,
        [ATTR_GEN_AI_REQUEST_MAX_TOKENS]: this.maxOutputTokens,
        'provider.reasoning_mode': this.reasoning?.mode ?? 'disabled',
        'provider.tools_count': tools?.length ?? 0,
        'provider.message_count': messages.length
      }
    }, async (span) => {
      const renderer = options?.operatorRenderer;
      let fullText = '';
      const outputStream = options?.outputStream;
      let contextUsage: number | undefined;
      let inputTokens: number | undefined;
      let outputTokens: number | undefined;
      let cacheReadInputTokens: number | undefined;
      let outputStarted = false;

      try {
        const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          {
            role: 'system' as const,
            content: systemPrompt
          },
          ...messages.map(m => {
            if (m.role === 'user') return { role: 'user' as const, content: m.content };
            if (m.role === 'assistant') return { role: 'assistant' as const, content: m.content };
            if (m.role === 'assistant_tool_calls') {
              const message: Record<string, unknown> = {
                role: 'assistant' as const,
                content: m.text || null,
                tool_calls: m.calls.map(c => ({
                  id: c.id,
                  type: 'function' as const,
                  function: { name: c.name, arguments: JSON.stringify(c.input) }
                }))
              };
              this.applyProviderReasoningBlocks(message, m.providerReasoning);
              return message as unknown as OpenAI.Chat.ChatCompletionMessageParam;
            }
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

        // Establish and consume the stream under network-error retry. A failure that
        // happens before any output is streamed is retried with exponential backoff;
        // once output has started (outputStarted), retrying would duplicate it, so the
        // failure is surfaced instead.
        return await withNetworkRetry<ProviderTurnResult>(async () => {
          fullText = '';
          contextUsage = undefined;
          inputTokens = undefined;
          outputTokens = undefined;
          cacheReadInputTokens = undefined;

          renderer?.requestSent(options?.roleInstanceId ?? '', 'openai-compatible', this.model);

          const stream = await (this.client.chat.completions.create({
            model: this.model,
            messages: openAIMessages,
            stream: true,
            stream_options: { include_usage: true },
            ...buildOpenAIChatCompletionTokenParams(this.reasoning, this.maxOutputTokens),
            ...(nativeTools ? { tools: nativeTools } : {})
          } as any, { signal: options?.signal }) as any);

          renderer?.receivingResponse(options?.roleInstanceId ?? '');

          let finishReason: string | null = null;
          const toolCallAcc = new Map<number, { id: string; name: string; args: string }>();
          let reasoningTrace = '';
          const trace = this.customReasoningTraceConfig();

          for await (const chunk of stream) {
            if (chunk.usage) {
              inputTokens = chunk.usage.prompt_tokens ?? undefined;
              outputTokens = chunk.usage.completion_tokens ?? undefined;
              const cachedTokens = chunk.usage.prompt_tokens_details?.cached_tokens;
              if (typeof cachedTokens === 'number') {
                cacheReadInputTokens = cachedTokens;
              }
              if (inputTokens !== undefined || outputTokens !== undefined) {
                contextUsage = (inputTokens ?? 0) + (outputTokens ?? 0);
              }
            }
            if (!chunk.choices.length) continue;

            for (const choice of chunk.choices) {
              if (!choice) continue;
              if (choice.finish_reason) finishReason = choice.finish_reason;
              const delta = choice.delta;
              const payload = delta ?? choice.message;
              if (!payload) continue;
              const rawContent = this.readStringField(payload, 'content');
              if (rawContent) {
                const content = delta
                  ? rawContent
                  : this.cumulativeStringDelta(rawContent, fullText);
                if (content) {
                  outputStarted = true;
                  outputStream?.write(content);
                  options?.onAssistantTextDelta?.(content);
                  fullText += content;
                }
              }
              const rawReasoningDelta = this.readStringPath(payload, trace?.responseDeltaField);
              const reasoningDelta = delta
                ? rawReasoningDelta
                : this.cumulativeStringDelta(rawReasoningDelta, reasoningTrace);
              if (reasoningDelta) {
                outputStarted = true;
                reasoningTrace += reasoningDelta;
                this.emitReasoningTrace(reasoningDelta, options);
              }
              const toolCalls = (payload as { tool_calls?: Array<{
                index: number;
                id?: string;
                function?: { name?: string; arguments?: string };
              }> }).tool_calls;
              if (Array.isArray(toolCalls)) {
                for (const tc of toolCalls) {
                  if (!toolCallAcc.has(tc.index)) {
                    toolCallAcc.set(tc.index, { id: '', name: '', args: '' });
                    if (tc.id || tc.function?.name) {
                      span.addEvent('provider.tool_call_received', { 'tool.name': tc.function?.name, 'tool.id': tc.id });
                    }
                  }
                  const acc = toolCallAcc.get(tc.index)!;
                  if (tc.id) acc.id = tc.id;
                  if (tc.function?.name) acc.name = acc.name || tc.function.name;
                  if (tc.function?.arguments) acc.args += tc.function.arguments;
                }
              }
            }
          }

          if (inputTokens !== undefined) span.setAttribute(ATTR_GEN_AI_USAGE_INPUT_TOKENS, inputTokens);
          if (outputTokens !== undefined) span.setAttribute(ATTR_GEN_AI_USAGE_OUTPUT_TOKENS, outputTokens);
          if (cacheReadInputTokens !== undefined) span.setAttribute(ATTR_GEN_AI_USAGE_CACHE_READ_INPUT_TOKENS, cacheReadInputTokens);
          if (finishReason) span.setAttribute(ATTR_GEN_AI_RESPONSE_FINISH_REASONS, [finishReason]);

          if (toolCallAcc.size > 0) {
            const calls = Array.from(toolCallAcc.values()).map(acc => {
              let input: Record<string, unknown>;
              let parseError: string | undefined;
              try { input = JSON.parse(acc.args); }
              catch { input = {}; parseError = acc.args; }
              return { id: acc.id, name: acc.name, input, parseError };
            });
            span.setAttribute('provider.result_type', 'tool_calls');
            return {
              type: 'tool_calls' as const,
              calls,
              continuationMessages: [{
                role: 'assistant_tool_calls' as const,
                calls,
                text: fullText || undefined,
                providerReasoning: this.buildProviderReasoningBlocks(reasoningTrace),
              }],
              contextUsage,
              ...(finishReason ? { finishReason } : {}),
            };
          }

          span.setAttribute('provider.result_type', 'text');
          return {
            type: 'text' as const,
            text: fullText,
            contextUsage,
            ...(finishReason ? { finishReason } : {}),
          };
        }, {
          signal: options?.signal,
          maxRetries: MAX_NETWORK_RETRIES,
          isRetryable: (err) => err instanceof OpenAI.APIConnectionError || isLowLevelNetworkError(err),
          canRetry: () => !outputStarted,
          onRetry: ({ attempt, delayMs, error: retryError }) => {
            renderer?.sendError(formatRetryNotice(attempt, delayMs));
            span.addEvent('provider.network_retry', {
              'retry.attempt': attempt,
              'retry.max': MAX_NETWORK_RETRIES,
              'retry.delay_ms': delayMs,
              'error.message': retryError instanceof Error ? retryError.message : String(retryError),
            });
          },
        });
      } catch (err: any) {
        if (err instanceof OpenAI.APIUserAbortError || options?.signal?.aborted) {
          span.addEvent('provider.aborted');
          span.setStatus({ code: SpanStatusCode.OK });
          throw new LLMGatewayError('ABORTED', 'Turn aborted by operator', fullText || undefined);
        }
        span.recordException(err);
        span.setStatus({ code: SpanStatusCode.ERROR });
        if (err instanceof LLMGatewayError) throw err;
        if (err instanceof OpenAI.AuthenticationError) {
          throw new LLMGatewayError(
            'AUTH_ERROR',
            this.formatProviderError(
              err,
              'Authentication failed for the OpenAI-compatible provider.',
              'Check OPENAI_COMPAT_API_KEY and provider access.'
            )
          );
        }
        if (err instanceof OpenAI.RateLimitError) {
          throw new LLMGatewayError(
            'RATE_LIMIT',
            this.formatProviderError(
              err,
              'OpenAI-compatible provider returned HTTP 429 (rate limited or quota exceeded).',
              'Retry later or check provider quota/credits for this model.'
            )
          );
        }
        if (err instanceof OpenAI.APIConnectionError) {
          throw new LLMGatewayError(
            'RATE_LIMIT',
            this.formatProviderError(
              err,
              'Could not reach the OpenAI-compatible provider.',
              'Check network access, endpoint availability, and any provider-side outages.'
            )
          );
        }
        if (err instanceof OpenAI.APIError) {
          throw new LLMGatewayError('PROVIDER_MALFORMED', `Provider API error: ${err.message}`);
        }
        throw new LLMGatewayError('UNKNOWN', `Unexpected provider error: ${err?.message || err}`);
      } finally {
        meter.createHistogram(METRIC_GEN_AI_CLIENT_OPERATION_DURATION, { unit: 's' })
          .record((Date.now() - startTime) / 1000, {
            [ATTR_GEN_AI_PROVIDER_NAME]: GEN_AI_PROVIDER_NAME_VALUE_OPENAI,
            [ATTR_GEN_AI_OPERATION_NAME]: GEN_AI_OPERATION_NAME_VALUE_CHAT,
            [ATTR_GEN_AI_REQUEST_MODEL]: this.model,
          });
        span.end();
      }
    });
  }
}
