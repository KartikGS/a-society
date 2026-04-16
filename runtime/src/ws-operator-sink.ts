import type { OperatorEvent, OperatorRenderSink } from './types.js';

export type RuntimeServerMessage =
  | { type: 'operator_event'; event: OperatorEvent }
  | { type: 'wait_start'; provider: string; model: string }
  | { type: 'wait_stop' };

export class WebSocketOperatorSink implements OperatorRenderSink {
  constructor(private readonly send: (msg: RuntimeServerMessage) => void) {}

  emit(event: OperatorEvent): void {
    this.send({ type: 'operator_event', event });
  }

  startWait(provider: string, model: string): void {
    this.send({ type: 'wait_start', provider, model });
  }

  stopWait(): void {
    this.send({ type: 'wait_stop' });
  }
}
