import OpenAI from 'openai';
import { LLMGatewayError } from '../types.js';
import type { LLMProvider, RuntimeMessageParam, ToolDefinition, ProviderTurnResult, TurnOptions, TurnUsage } from '../types.js';
import { TelemetryManager } from '../observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';

export class OpenAICompatibleProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;
  private baseURL: string;

  constructor(config?: { baseURL: string; apiKey: string; model: string }) {
    if (config) {
      this.client = new OpenAI({ baseURL: config.baseURL, apiKey: config.apiKey });
      this.baseURL = config.baseURL;
      this.model = config.model;
    } else {
      const baseURL = process.env.OPENAI_COMPAT_BASE_URL;
      if (!baseURL) {
        throw new LLMGatewayError('UNKNOWN', 'LLM_PROVIDER=openai-compatible requires OPENAI_COMPAT_BASE_URL to be set.');
      }
      this.client = new OpenAI({ baseURL, apiKey: process.env.OPENAI_COMPAT_API_KEY || '' });
      this.baseURL = baseURL;
      this.model = process.env.OPENAI_COMPAT_MODEL ?? 'mistralai/Mistral-7B-Instruct-v0.3';
    }
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

    return tracer.startActiveSpan('provider.execute_turn', {
      kind: SpanKind.CLIENT,
      attributes: {
        'provider.name': 'openai-compatible',
        'provider.model': this.model,
        'provider.tools_count': tools?.length ?? 0,
        'provider.message_count': messages.length
      }
    }, async (span) => {
      const renderer = options?.operatorRenderer;
      let fullText = '';
      const outputStream = options?.outputStream ?? process.stdout;
      let displayedText = false;
      let inputTokens: number | undefined;
      let outputTokens: number | undefined;

      try {
        renderer?.startWait('openai-compatible', this.model);

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
          stream_options: { include_usage: true },
          ...(nativeTools ? { tools: nativeTools } : {})
        }, { signal: options?.signal });

        let finishReason: string | null = null;
        const toolCallAcc = new Map<number, { id: string; name: string; args: string }>();

        for await (const chunk of stream) {
          if (!chunk.choices.length && chunk.usage) {
            inputTokens = chunk.usage.prompt_tokens ?? undefined;
            outputTokens = chunk.usage.completion_tokens ?? undefined;
            continue;
          }

          const choice = chunk.choices[0];
          if (!choice) continue;
          if (choice.finish_reason) finishReason = choice.finish_reason;
          const delta = choice.delta;
          if (!delta) continue;
          if (delta.content) {
            if (fullText === '') renderer?.stopWait();
            outputStream.write(delta.content);
            fullText += delta.content;
            displayedText = true;
          }
          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              if (!toolCallAcc.has(tc.index)) {
                toolCallAcc.set(tc.index, { id: '', name: '', args: '' });
                if (tc.id || tc.function?.name) {
                  span.addEvent('provider.tool_call_received', { 'tool.name': tc.function?.name, 'tool.id': tc.id });
                  renderer?.stopWait();
                }
              }
              const acc = toolCallAcc.get(tc.index)!;
              if (tc.id) acc.id = tc.id;
              if (tc.function?.name) acc.name = acc.name || tc.function.name;
              if (tc.function?.arguments) acc.args += tc.function.arguments;
            }
          }
        }

        renderer?.stopWait();

        const usage: TurnUsage | undefined = (inputTokens !== undefined || outputTokens !== undefined)
          ? { inputTokens, outputTokens }
          : undefined;

        if (inputTokens !== undefined) span.setAttribute('provider.input_tokens', inputTokens);
        if (outputTokens !== undefined) span.setAttribute('provider.output_tokens', outputTokens);
        if (finishReason) span.setAttribute('provider.stop_reason', finishReason);

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
            usage,
            displayedText
          };
        }

        span.setAttribute('provider.result_type', 'text');
        return { type: 'text' as const, text: fullText, usage, displayedText };
      } catch (err: any) {
        renderer?.stopWait();
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
        const duration = Date.now() - startTime;
        meter.createHistogram('a_society.provider.latency').record(duration, { provider: 'openai-compatible', model: this.model });
        span.end();
      }
    });
  }
}
