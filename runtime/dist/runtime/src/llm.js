import { AnthropicProvider } from './providers/anthropic.js';
import { OpenAICompatibleProvider } from './providers/openai-compatible.js';
import { LLMGatewayError } from './types.js';
import { FileToolExecutor, FILE_TOOL_DEFINITIONS } from './tools/file-executor.js';
export { LLMGatewayError } from './types.js';
function createProvider(name) {
    switch (name) {
        case 'anthropic': return new AnthropicProvider();
        case 'openai-compatible': return new OpenAICompatibleProvider();
        default:
            throw new LLMGatewayError('UNKNOWN', `Unknown provider: "${name}". Supported: anthropic, openai-compatible.`);
    }
}
export class LLMGateway {
    provider;
    executor;
    tools;
    constructor(workspaceRoot, provider) {
        if (provider) {
            this.provider = provider;
        }
        else {
            this.provider = createProvider(process.env.LLM_PROVIDER ?? 'anthropic');
        }
        if (workspaceRoot) {
            this.executor = new FileToolExecutor(workspaceRoot);
            this.tools = FILE_TOOL_DEFINITIONS;
        }
    }
    async executeTurn(systemPrompt, messageHistory, options) {
        if (!this.tools || !this.executor) {
            const result = await this.provider.executeTurn(systemPrompt, messageHistory, undefined, options);
            if (result.type === 'text')
                return { text: result.text, usage: result.usage };
            throw new LLMGatewayError('PROVIDER_MALFORMED', 'Provider returned tool_calls but no tools were configured.');
        }
        let accInputTokens = 0;
        let accOutputTokens = 0;
        let anyUsage = false;
        const MAX_TOOL_ROUNDS = 50;
        let messages = [...messageHistory];
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
            if (options?.signal?.aborted) {
                throw new LLMGatewayError('ABORTED', 'Turn aborted by operator');
            }
            const result = await this.provider.executeTurn(systemPrompt, messages, this.tools, options);
            if (result.usage?.inputTokens !== undefined) {
                accInputTokens += result.usage.inputTokens;
                anyUsage = true;
            }
            if (result.usage?.outputTokens !== undefined) {
                accOutputTokens += result.usage.outputTokens;
                anyUsage = true;
            }
            if (result.type === 'text') {
                const usage = anyUsage
                    ? { inputTokens: accInputTokens, outputTokens: accOutputTokens }
                    : undefined;
                return { text: result.text, usage };
            }
            for (const call of result.calls) {
                const pathArg = call.input?.path;
                process.stderr.write(`[${call.name}${pathArg ? ': ' + pathArg : ''}]\n`);
            }
            const toolResultMessages = await Promise.all(result.calls.map(async (call) => {
                let content, isError;
                if (call.parseError) {
                    content = `Error: could not parse tool arguments: ${call.parseError}`;
                    isError = true;
                }
                else {
                    const res = await this.executor.execute(call);
                    content = res.content;
                    isError = res.isError;
                }
                return { role: 'tool_result', callId: call.id, toolName: call.name, content, isError };
            }));
            messages = [...messages, ...result.continuationMessages, ...toolResultMessages];
        }
        throw new LLMGatewayError('UNKNOWN', 'Tool call loop exceeded maximum rounds (50). The session has been aborted.');
    }
}
