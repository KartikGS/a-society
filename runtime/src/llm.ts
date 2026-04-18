import { AnthropicProvider } from './providers/anthropic.js';
import { OpenAICompatibleProvider } from './providers/openai-compatible.js';
import type { LLMProvider, RuntimeMessageParam, ToolDefinition, ToolCall, TurnOptions, GatewayTurnResult, TurnUsage } from './types.js';
import { LLMGatewayError } from './types.js';
import { FileToolExecutor, FILE_TOOL_DEFINITIONS } from './tools/file-executor.js';
import { BashToolExecutor, BASH_TOOL_DEFINITIONS } from './tools/bash-executor.js';
import { WebSearchExecutor, WEB_SEARCH_TOOL_DEFINITIONS } from './tools/web-search-executor.js';
import { TelemetryManager } from './observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';

export type { RuntimeMessageParam, ToolDefinition, ToolCall };
export { LLMGatewayError } from './types.js';

function createProvider(name: string): LLMProvider {
  switch (name) {
    case 'anthropic':        return new AnthropicProvider(process.env.ANTHROPIC_API_KEY || '');
    case 'openai-compatible': return new OpenAICompatibleProvider();
    default:
      throw new LLMGatewayError(
        'UNKNOWN',
        `Unknown provider: "${name}". Supported: anthropic, openai-compatible.`
      );
  }
}

export class LLMGateway {
  private provider: LLMProvider;
  private fileExecutor?: FileToolExecutor;
  private bashExecutor?: BashToolExecutor;
  private webSearchExecutor?: WebSearchExecutor;
  private tools?: ToolDefinition[];

  constructor(workspaceRoot?: string, provider?: LLMProvider) {
    if (provider) {
      this.provider = provider;
    } else {
      this.provider = createProvider(process.env.LLM_PROVIDER ?? 'anthropic');
    }

    if (workspaceRoot) {
      this.fileExecutor = new FileToolExecutor(workspaceRoot);
      this.bashExecutor = new BashToolExecutor(workspaceRoot);
      this.tools = [...FILE_TOOL_DEFINITIONS, ...BASH_TOOL_DEFINITIONS];
      const tavilyKey = process.env.TAVILY_API_KEY;
      if (tavilyKey) {
        this.webSearchExecutor = new WebSearchExecutor(tavilyKey);
        this.tools = [...this.tools, ...WEB_SEARCH_TOOL_DEFINITIONS];
      }
    }
  }

  async executeTurn(
    systemPrompt: string,
    messageHistory: RuntimeMessageParam[],
    options?: TurnOptions
  ): Promise<GatewayTurnResult> {
    const tracer = TelemetryManager.getTracer();
    const toolsEnabled = !!(this.tools && this.fileExecutor);
    return tracer.startActiveSpan('llm.gateway.execute_turn', {
      kind: SpanKind.INTERNAL,
      attributes: {
        'llm.tools_enabled': toolsEnabled,
        'llm.message_count': messageHistory.length
      }
    }, async (span) => {
      try {
        if (!this.tools || !this.fileExecutor) {
          const result = await this.provider.executeTurn(systemPrompt, messageHistory, undefined, options);
          if (result.type === 'text') {
            return { text: result.text, usage: result.usage, displayedText: result.displayedText };
          }
          throw new LLMGatewayError('PROVIDER_MALFORMED', 'Provider returned tool_calls but no tools were configured.');
        }

        let accInputTokens = 0;
        let accOutputTokens = 0;
        let anyUsage = false;
        let displayedText = false;

        const MAX_TOOL_ROUNDS = 50;
        let messages: RuntimeMessageParam[] = [...messageHistory];
        const intermediateMessages: RuntimeMessageParam[] = [];
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          if (options?.signal?.aborted) {
            throw new LLMGatewayError('ABORTED', 'Turn aborted by operator');
          }

          const result = await this.provider.executeTurn(systemPrompt, messages, this.tools, options);
          displayedText = displayedText || !!result.displayedText;

          if (result.usage?.inputTokens !== undefined) { accInputTokens += result.usage.inputTokens; anyUsage = true; }
          if (result.usage?.outputTokens !== undefined) { accOutputTokens += result.usage.outputTokens; anyUsage = true; }

          if (result.type === 'text') {
            const usage: TurnUsage | undefined = anyUsage
              ? { inputTokens: accInputTokens, outputTokens: accOutputTokens }
              : undefined;
            span.setAttribute('llm.tool_round_count', round);
            return {
              text: result.text,
              usage,
              displayedText,
              intermediateMessages: intermediateMessages.length > 0 ? intermediateMessages : undefined
            };
          }

          span.addEvent('llm.tool_round', { round_index: round, call_count: result.calls.length });
          for (const call of result.calls) {
            span.addEvent('llm.tool_call', {
              'llm.tool_name': call.name,
              'llm.tool_id': call.id
            });
            const pathArg = call.input?.path as string | undefined;
            const commandArg = call.name === 'run_command' ? call.input?.command as string | undefined : undefined;
            options?.operatorRenderer?.emit({ kind: 'activity.tool_call', toolName: call.name, path: pathArg, command: commandArg });
          }

          const toolResultMessages: RuntimeMessageParam[] = await Promise.all(
            result.calls.map(async (call) => {
              let content: string, isError: boolean;
              if (call.parseError) {
                content = `Error: could not parse tool arguments: ${call.parseError}`;
                isError = true;
              } else {
                const res = await (this.bashExecutor!.canHandle(call.name)
                  ? this.bashExecutor!.execute(call)
                  : this.webSearchExecutor?.canHandle(call.name)
                  ? this.webSearchExecutor.execute(call)
                  : this.fileExecutor!.execute(call));
                content = res.content;
                isError = res.isError;
              }
              return { role: 'tool_result' as const, callId: call.id, toolName: call.name, content, isError };
            })
          );
          intermediateMessages.push(...result.continuationMessages, ...toolResultMessages);
          messages = [...messages, ...result.continuationMessages, ...toolResultMessages];
        }
        span.addEvent('llm.max_rounds_exceeded', { limit: MAX_TOOL_ROUNDS });
        throw new LLMGatewayError('UNKNOWN', 'Tool call loop exceeded maximum rounds (50). The session has been aborted.');
      } catch (e: any) {
        span.recordException(e);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw e;
      } finally {
        span.end();
      }
    });
  }
}
