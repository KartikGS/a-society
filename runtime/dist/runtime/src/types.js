export class LLMGatewayError extends Error {
    type;
    partialText;
    constructor(type, message, partialText) {
        super(message);
        this.type = type;
        this.partialText = partialText;
        this.name = 'LLMGatewayError';
    }
}
