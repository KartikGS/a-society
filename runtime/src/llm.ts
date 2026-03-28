import { AnthropicProvider } from './providers/anthropic.js';
import { OpenAICompatibleProvider } from './providers/openai-compatible.js';
import type { LLMProvider, RuntimeMessageParam, ToolDefinition, ToolCall } from './types.js';
import { LLMGatewayError } from './types.js';
import { FileToolExecutor, FILE_TOOL_DEFINITIONS } from './tools/file-executor.js';

export type { RuntimeMessageParam, ToolDefinition, ToolCall };
export { LLMGatewayError } from './types.js';

function createProvider(name: string): LLMProvider {
  switch (name) {
    case 'anthropic':        return new AnthropicProvider();
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
  private executor?: FileToolExecutor;
  private tools?: ToolDefinition[];

  constructor(workspaceRoot?: string, provider?: LLMProvider) {
    if (provider) {
      this.provider = provider;
    } else {
      this.provider = createProvider(process.env.LLM_PROVIDER ?? 'anthropic');
    }

    if (workspaceRoot) {
      this.executor = new FileToolExecutor(workspaceRoot);
      this.tools = FILE_TOOL_DEFINITIONS;
    }
  }

  async executeTurn(systemPrompt: string, messageHistory: RuntimeMessageParam[]): Promise<string> {
    if (!this.tools || !this.executor) {
      const result = await this.provider.executeTurn(systemPrompt, messageHistory, undefined);
      if (result.type === 'text') return result.text;
      throw new LLMGatewayError('PROVIDER_MALFORMED', 'Provider returned tool_calls but no tools were configured.');
    }

    const MAX_TOOL_ROUNDS = 50;
    let messages: RuntimeMessageParam[] = [...messageHistory];
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const result = await this.provider.executeTurn(systemPrompt, messages, this.tools);
      if (result.type === 'text') {
        return result.text;
      }

      for (const call of result.calls) {
        const pathArg = call.input?.path as string | undefined;
        process.stdout.write(`[${call.name}${pathArg ? ': ' + pathArg : ''}]\n`);
      }

      const toolResultMessages: RuntimeMessageParam[] = await Promise.all(
        result.calls.map(async (call) => {
          let content: string, isError: boolean;
          if (call.parseError) {
            content = `Error: could not parse tool arguments: ${call.parseError}`;
            isError = true;
          } else {
            const res = await this.executor!.execute(call);
            content = res.content;
            isError = res.isError;
          }
          return { role: 'tool_result' as const, callId: call.id, toolName: call.name, content, isError };
        })
      );
      messages = [...messages, ...result.continuationMessages, ...toolResultMessages];
    }
    throw new LLMGatewayError('UNKNOWN', 'Tool call loop exceeded maximum rounds (50). The session has been aborted.');
  }
}
