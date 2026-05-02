import type { OperatorEvent, OperatorRenderSink } from './types.js';

export type RuntimeServerMessage =
  | { type: 'operator_event'; event: OperatorEvent }
  | { type: 'wait_start'; role: string; provider: string; model: string }
  | { type: 'wait_stop'; role: string };

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
