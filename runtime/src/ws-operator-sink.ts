import type { OperatorEvent, OperatorFeedMessage, OperatorRenderSink } from './types.js';

export type RuntimeServerMessage = Extract<
  OperatorFeedMessage,
  { type: 'operator_event' | 'wait_start' | 'wait_stop' }
>;

export class WebSocketOperatorSink implements OperatorRenderSink {
  constructor(private readonly send: (msg: RuntimeServerMessage) => void) {}

  emit(event: OperatorEvent): void {
    this.send({ type: 'operator_event', event });
  }

  startWait(role: string, provider: string, model: string): void {
    this.send({ type: 'wait_start', role, provider, model });
  }

  stopWait(role: string): void {
    this.send({ type: 'wait_stop', role });
  }
}
