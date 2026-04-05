import Anthropic from '@anthropic-ai/sdk';
import { LLMGatewayError } from '../types.js';
import { Spinner } from '../spinner.js';
export class AnthropicProvider {
    client;
    model;
    constructor() {
        this.client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY || ''
        });
        this.model = process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022';
    }
    async executeTurn(systemPrompt, messages, tools, options) {
        const spinner = new Spinner();
        spinner.start();
        let fullText = '';
        let inputTokens;
        let outputTokens;
        try {
            const nativeMessages = messages.map(m => {
                if (m.role === 'user')
                    return { role: 'user', content: m.content };
                if (m.role === 'assistant')
                    return { role: 'assistant', content: m.content };
                if (m.role === 'assistant_tool_calls') {
                    return {
                        role: 'assistant',
                        content: [
                            ...(m.text ? [{ type: 'text', text: m.text }] : []),
                            ...m.calls.map(c => ({
                                type: 'tool_use',
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
                                type: 'tool_result',
                                tool_use_id: m.callId,
                                content: m.content,
                                is_error: m.isError
                            }]
                    };
                }
                throw new Error('Unknown message type');
            });
            const nativeTools = tools && tools.length > 0
                ? tools.map((def) => ({
                    name: def.name,
                    description: def.description,
                    input_schema: def.inputSchema
                }))
                : undefined;
            const stream = await this.client.messages.create({
                model: this.model,
                max_tokens: 8192,
                system: systemPrompt,
                messages: nativeMessages,
                ...(nativeTools ? { tools: nativeTools } : {}),
                stream: true
            }, { signal: options?.signal });
            let stopReason = null;
            const toolUseBlocks = new Map();
            for await (const chunk of stream) {
                if (chunk.type === 'message_start') {
                    inputTokens = chunk.message?.usage?.input_tokens;
                }
                else if (chunk.type === 'message_delta') {
                    if (chunk.delta.stop_reason) {
                        stopReason = chunk.delta.stop_reason;
                    }
                    if (chunk.usage?.output_tokens) {
                        outputTokens = chunk.usage?.output_tokens;
                    }
                }
                else if (chunk.type === 'content_block_start') {
                    const block = chunk.content_block;
                    if (block.type === 'tool_use') {
                        toolUseBlocks.set(chunk.index, { id: block.id, name: block.name, inputJson: '' });
                    }
                }
                else if (chunk.type === 'content_block_delta') {
                    const delta = chunk.delta;
                    if (delta.type === 'text_delta') {
                        if (fullText === '')
                            spinner.stop();
                        process.stdout.write(delta.text);
                        fullText += delta.text;
                    }
                    else if (delta.type === 'input_json_delta') {
                        const block = toolUseBlocks.get(chunk.index);
                        if (block)
                            block.inputJson += delta.partial_json;
                    }
                }
            }
            spinner.stop();
            if (fullText)
                process.stdout.write('\n');
            if (stopReason === 'max_tokens') {
                process.stderr.write(`[Warning] Response truncated: model hit max_tokens limit (stop_reason=max_tokens). The response may be incomplete.\n`);
            }
            const usage = (inputTokens !== undefined || outputTokens !== undefined)
                ? { inputTokens, outputTokens }
                : undefined;
            if (toolUseBlocks.size > 0) {
                const calls = Array.from(toolUseBlocks.values()).map(block => ({
                    id: block.id,
                    name: block.name,
                    input: (() => { try {
                        return JSON.parse(block.inputJson);
                    }
                    catch {
                        return {};
                    } })()
                }));
                return {
                    type: 'tool_calls',
                    calls,
                    continuationMessages: [{ role: 'assistant_tool_calls', calls, text: fullText || undefined }],
                    usage
                };
            }
            return { type: 'text', text: fullText, usage };
        }
        catch (err) {
            if (err?.name === 'AbortError' || options?.signal?.aborted) {
                spinner.stop();
                throw new LLMGatewayError('ABORTED', 'Turn aborted by operator', fullText || undefined);
            }
            spinner.stop();
            if (err instanceof LLMGatewayError)
                throw err;
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
