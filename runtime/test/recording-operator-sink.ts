import type { OperatorEvent, OperatorRenderSink } from '../src/common/types.js';

export class RecordingOperatorSink implements OperatorRenderSink {
  readonly events: OperatorEvent[] = [];

  emit(event: OperatorEvent): void {
    this.events.push(event);
  }

  requestSent(_role: string, _provider: string, _model: string): void {}
  receivingResponse(_role: string): void {}
  responseEnd(_role: string): void {}
  sendError(_message: string): void {}
}
