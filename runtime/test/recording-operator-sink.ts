import type { OperatorEvent, OperatorRenderSink } from '../src/common/types.js';

export class RecordingOperatorSink implements OperatorRenderSink {
  readonly events: OperatorEvent[] = [];
  readonly errors: string[] = [];

  emit(event: OperatorEvent): void {
    this.events.push(event);
  }

  readonly requests: Array<{ role: string; provider: string; model: string }> = [];

  requestSent(role: string, provider: string, model: string): void {
    this.requests.push({ role, provider, model });
  }
  receivingResponse(_role: string): void {}
  responseEnd(_role: string): void {}
  sendError(message: string): void {
    this.errors.push(message);
  }
}
