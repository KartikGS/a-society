import type { OperatorEvent, OperatorRenderSink } from '../common/types.js';

export type RuntimeServerMessage =
  | { type: 'operator_event'; event: OperatorEvent }
  | { type: 'request_sent'; role: string; provider: string; model: string }
  | { type: 'receiving_response'; role: string }
  | { type: 'response_end'; role: string }
  | { type: 'error'; message: string };

export class WebSocketOperatorSink implements OperatorRenderSink {
  constructor(private readonly send: (msg: RuntimeServerMessage) => void) {}

  emit(event: OperatorEvent): void {
    this.send({ type: 'operator_event', event });
  }

  requestSent(role: string, provider: string, model: string): void {
    this.send({ type: 'request_sent', role, provider, model });
  }

  receivingResponse(role: string): void {
    this.send({ type: 'receiving_response', role });
  }

  responseEnd(role: string): void {
    this.send({ type: 'response_end', role });
  }

  sendError(message: string): void {
    this.send({ type: 'error', message });
  }
}
