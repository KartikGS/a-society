import path from 'node:path';
import { AnthropicProvider } from './anthropic.js';
import { OpenAICompatibleProvider } from './openai-compatible.js';
import type { LLMProvider, RuntimeMessageParam, ToolDefinition, ToolCall, TurnOptions, GatewayTurnResult } from '../common/types.js';
import { CONSENT_CHECK_RESULT, LLMGatewayError } from '../common/types.js';
import { FileToolExecutor, FILE_TOOL_DEFINITIONS } from '../tools/file-executor.js';
import { BashToolExecutor, BASH_TOOL_DEFINITIONS } from '../tools/bash-executor.js';
import { WebSearchExecutor, WEB_SEARCH_TOOL_DEFINITIONS } from '../tools/web-search-executor.js';
import { TelemetryManager } from '../observability/observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { configureSettingsStore, getActiveModelWithKey, getEnabledWebSearchApiKey, MODEL_CONFIGURATION_REQUIRED_MESSAGE } from '../settings/settings-store.js';

export type { RuntimeMessageParam, ToolDefinition, ToolCall };
export { LLMGatewayError } from '../common/types.js';

function projectWriteRoots(workspaceRoot: string, projectNamespace: string): string[] {
  return [
    path.join(workspaceRoot, projectNamespace),
    path.join(workspaceRoot, '.a-society', 'a-docs', projectNamespace),
    path.join(workspaceRoot, 'a-society', 'feedback'),
  ];
}

function createProvider(): LLMProvider {
  const active = getActiveModelWithKey();
  if (!active || active.modelId.trim() === '' || active.apiKey.trim() === '') {
    throw new LLMGatewayError('UNKNOWN', MODEL_CONFIGURATION_REQUIRED_MESSAGE);
  }
  const providerRuntimeConfig = {
    maxOutputTokens: active.maxOutputTokens,
    supportsThinking: active.supportsThinking,
  };
  switch (active.providerType) {
    case 'anthropic':
      return new AnthropicProvider(active.apiKey, active.modelId, providerRuntimeConfig);
    case 'openai-compatible':
      if (active.providerBaseUrl.trim() === '') {
        throw new LLMGatewayError('UNKNOWN', MODEL_CONFIGURATION_REQUIRED_MESSAGE);
      }
      return new OpenAICompatibleProvider({
        baseURL: active.providerBaseUrl,
        apiKey: active.apiKey,
        model: active.modelId,
        ...providerRuntimeConfig,
      });
    default:
      throw new LLMGatewayError(
        'UNKNOWN',
        `Unknown provider: "${(active as { providerType: string }).providerType}". Supported: anthropic, openai-compatible.`
      );
  }
}

function throwIfAborted(signal: AbortSignal | undefined, partialText?: string): void {
  if (!signal?.aborted) return;
  throw new LLMGatewayError('ABORTED', 'Turn aborted by operator', partialText);
}

export class LLMGateway {
  private provider: LLMProvider;
  private fileExecutor?: FileToolExecutor;
  private bashExecutor?: BashToolExecutor;
  private webSearchExecutor?: WebSearchExecutor;
  private tools?: ToolDefinition[];

  constructor(workspaceRoot?: string, provider?: LLMProvider, projectNamespace?: string) {
    if (workspaceRoot) {
      configureSettingsStore(workspaceRoot);
    }

    if (provider) {
      this.provider = provider;
    } else {
      this.provider = createProvider();
    }

    if (workspaceRoot) {
      const writeRoots = projectNamespace ? projectWriteRoots(workspaceRoot, projectNamespace) : undefined;
      this.fileExecutor = new FileToolExecutor(workspaceRoot, writeRoots);
      this.bashExecutor = new BashToolExecutor(workspaceRoot);
      this.tools = [...FILE_TOOL_DEFINITIONS, ...BASH_TOOL_DEFINITIONS];
      const tavilyKey = getEnabledWebSearchApiKey();
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
            throwIfAborted(options?.signal, result.text);
            return { text: result.text, contextUsage: result.contextUsage };
          }
          throwIfAborted(options?.signal);
          throw new LLMGatewayError('PROVIDER_MALFORMED', 'Provider returned tool_calls but no tools were configured.');
        }

        let accContextUsage: number | undefined;

        const MAX_TOOL_ROUNDS = 50;
        let messages: RuntimeMessageParam[] = [...messageHistory];
        const appendConversationMessages = async (newMessages: RuntimeMessageParam[]): Promise<void> => {
          if (newMessages.length === 0) return;
          messageHistory.push(...newMessages);
          messages = [...messages, ...newMessages];
          await options?.onConversationMessages?.(newMessages);
        };

        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          if (options?.signal?.aborted) {
            throw new LLMGatewayError('ABORTED', 'Turn aborted by operator');
          }

          const result = await this.provider.executeTurn(systemPrompt, messages, this.tools, options);
          if (result.type === 'text') {
            throwIfAborted(options?.signal, result.text);
          }

          if (result.contextUsage !== undefined) { accContextUsage = result.contextUsage; }

          if (result.type === 'text') {
            span.setAttribute('llm.tool_round_count', round);
            return {
              text: result.text,
              contextUsage: accContextUsage
            };
          }

          span.addEvent('llm.tool_round', { round_index: round, call_count: result.calls.length });
          for (const call of result.calls) {
            span.addEvent('llm.tool_call', {
              'llm.tool_name': call.name,
              'llm.tool_id': call.id
            });
          }

          await appendConversationMessages(result.continuationMessages);
          throwIfAborted(options?.signal);

          for (const call of result.calls) {
            let content: string, isError: boolean;
            if (call.parseError) {
              content = `Error: could not parse tool arguments: ${call.parseError}`;
              isError = true;
            } else {
              if (this.bashExecutor?.canHandle(call.name)) {
                const denylistResult = this.bashExecutor.validate(call);
                if (denylistResult) {
                  options?.operatorRenderer?.emit({ kind: 'activity.tool_call', role: options?.role ?? '__system__', toolName: call.name, command: call.input?.command as string | undefined });
                  await appendConversationMessages([{
                    role: 'tool_result' as const,
                    callId: call.id,
                    toolName: call.name,
                    content: denylistResult.content,
                    isError: true,
                  }]);
                  options?.operatorRenderer?.emit({ kind: 'activity.tool_result', role: options?.role ?? '__system__', toolName: call.name, isError: true });
                  continue;
                }
              }
              if (this.fileExecutor) {
                const pathResult = this.fileExecutor.validate(call);
                if (pathResult) {
                  options?.operatorRenderer?.emit({ kind: 'activity.tool_call', role: options?.role ?? '__system__', toolName: call.name, path: call.input?.path as string | undefined });
                  await appendConversationMessages([{
                    role: 'tool_result' as const,
                    callId: call.id,
                    toolName: call.name,
                    content: pathResult.content,
                    isError: true,
                  }]);
                  options?.operatorRenderer?.emit({ kind: 'activity.tool_result', role: options?.role ?? '__system__', toolName: call.name, isError: true });
                  continue;
                }
              }
              if (options?.consentGate) {
                if (!options.role || !options.nodeId) {
                  throw new LLMGatewayError(
                    'UNKNOWN',
                    'Consent-gated tool calls require role and node ownership metadata.'
                  );
                }
                const decision = await options.consentGate.check({
                  toolName: call.name,
                  input: call.input,
                  role: options.role,
                  nodeId: options.nodeId,
                }, options.signal);
                if (decision === CONSENT_CHECK_RESULT.DENY) {
                  const pathArg = call.input?.path as string | undefined;
                  const commandArg = call.name === 'run_command' ? call.input?.command as string | undefined : undefined;
                  options?.operatorRenderer?.emit({ kind: 'activity.tool_call', role: options?.role ?? '__system__', toolName: call.name, path: pathArg, command: commandArg });
                  await appendConversationMessages([{
                    role: 'tool_result' as const,
                    callId: call.id,
                    toolName: call.name,
                    content: 'Tool call denied: the user did not grant permission for this operation. The node is paused for operator guidance.',
                    isError: true,
                  }]);
                  options?.operatorRenderer?.emit({ kind: 'activity.tool_result', role: options?.role ?? '__system__', toolName: call.name, isError: true });
                  throw new LLMGatewayError(
                    'CONSENT_DENIED',
                    'Tool call denied by operator; awaiting human guidance.'
                  );
                }
              }
              const pathArg = call.input?.path as string | undefined;
              const commandArg = call.name === 'run_command' ? call.input?.command as string | undefined : undefined;
              options?.operatorRenderer?.emit({ kind: 'activity.tool_call', role: options?.role ?? '__system__', toolName: call.name, path: pathArg, command: commandArg });
              const res = await (this.bashExecutor!.canHandle(call.name)
                ? this.bashExecutor!.execute(call, options?.signal)
                : this.webSearchExecutor?.canHandle(call.name)
                ? this.webSearchExecutor.execute(call, options?.signal)
                : this.fileExecutor!.execute(call, options?.signal));
              content = res.content;
              isError = res.isError;
              options?.operatorRenderer?.emit({ kind: 'activity.tool_result', role: options?.role ?? '__system__', toolName: call.name, isError: res.isError });
            }
            throwIfAborted(options?.signal);
            await appendConversationMessages([{ role: 'tool_result' as const, callId: call.id, toolName: call.name, content, isError }]);
          }
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
