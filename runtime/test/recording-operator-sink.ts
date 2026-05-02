import type { OperatorEvent, OperatorRenderSink } from '../src/common/types.js';

export class RecordingOperatorSink implements OperatorRenderSink {
  readonly events: OperatorEvent[] = [];

  emit(event: OperatorEvent): void {
    this.events.push(event);
  }

  startWait(_role: string, _provider: string, _model: string): void {}
  stopWait(_role: string): void {}
}
