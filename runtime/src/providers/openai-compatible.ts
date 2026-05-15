import OpenAI from 'openai';
import { LLMGatewayError } from '../common/types.js';
import type { LLMProvider, RuntimeMessageParam, ToolDefinition, ProviderTurnResult, TurnOptions } from '../common/types.js';
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
  appendThinkingSystemInstruction,
  DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS,
  resolveMaxOutputTokens,
  type ProviderRuntimeConfig
} from './config.js';

export class OpenAICompatibleProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;
  private baseURL: string;
  private maxOutputTokens: number;
  private supportsThinking: boolean;

  constructor(config: { baseURL: string; apiKey: string; model: string } & ProviderRuntimeConfig) {
    this.client = new OpenAI({ baseURL: config.baseURL, apiKey: config.apiKey });
    this.baseURL = config.baseURL;
    this.model = config.model;
    this.maxOutputTokens = resolveMaxOutputTokens(
      config.maxOutputTokens,
      DEFAULT_OPENAI_COMPATIBLE_MAX_OUTPUT_TOKENS
    );
    this.supportsThinking = config.supportsThinking === true;
  }

  private formatProviderError(err: any, summary: string, suggestion?: string): string {
    const detail = typeof err?.message === 'string' && err.message.trim() !== ''
      ? ` Provider message: ${err.message}.`
      : '';
    const requestId = typeof err?.request_id === 'string' && err.request_id.trim() !== ''
      ? ` Request ID: ${err.request_id}.`
      : '';
    const nextStep = suggestion ? ` ${suggestion}` : '';
    return `${summary} Model: ${this.model}. Endpoint: ${this.baseURL}.${requestId}${detail}${nextStep}`;
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
        'provider.supports_thinking': this.supportsThinking,
        'provider.tools_count': tools?.length ?? 0,
        'provider.message_count': messages.length
      }
    }, async (span) => {
      const renderer = options?.operatorRenderer;
      let fullText = '';
      const outputStream = options?.outputStream ?? process.stdout;
      let contextUsage: number | undefined;
      let inputTokens: number | undefined;
      let outputTokens: number | undefined;

      try {
        renderer?.requestSent(options?.role ?? '', 'openai-compatible', this.model);

        const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          {
            role: 'system' as const,
            content: appendThinkingSystemInstruction(systemPrompt, this.supportsThinking)
          },
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
          max_tokens: this.maxOutputTokens,
          stream_options: { include_usage: true },
          ...(nativeTools ? { tools: nativeTools } : {})
        }, { signal: options?.signal });

        renderer?.receivingResponse(options?.role ?? '');

        let finishReason: string | null = null;
        const toolCallAcc = new Map<number, { id: string; name: string; args: string }>();

        for await (const chunk of stream) {
          if (chunk.usage) {
            inputTokens = chunk.usage.prompt_tokens ?? undefined;
            outputTokens = chunk.usage.completion_tokens ?? undefined;
            if (inputTokens !== undefined || outputTokens !== undefined) {
              contextUsage = (inputTokens ?? 0) + (outputTokens ?? 0);
            }
          }
          if (!chunk.choices.length) continue;

          const choice = chunk.choices[0];
          if (!choice) continue;
          if (choice.finish_reason) finishReason = choice.finish_reason;
          const delta = choice.delta;
          if (!delta) continue;
          if (delta.content) {
            outputStream.write(delta.content);
            options?.onAssistantTextDelta?.(delta.content);
            fullText += delta.content;
          }
          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
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

        renderer?.responseEnd(options?.role ?? '');


        if (inputTokens !== undefined) span.setAttribute(ATTR_GEN_AI_USAGE_INPUT_TOKENS, inputTokens);
        if (outputTokens !== undefined) span.setAttribute(ATTR_GEN_AI_USAGE_OUTPUT_TOKENS, outputTokens);
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
            continuationMessages: [{ role: 'assistant_tool_calls' as const, calls, text: fullText || undefined }],
            contextUsage
          };
        }

        span.setAttribute('provider.result_type', 'text');
        return { type: 'text' as const, text: fullText, contextUsage };
      } catch (err: any) {
        renderer?.responseEnd(options?.role ?? '');
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
