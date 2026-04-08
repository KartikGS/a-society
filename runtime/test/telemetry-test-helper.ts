import { InMemorySpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { TelemetryManager } from '../src/observability.js';

let exporter: InMemorySpanExporter | null = null;

export async function setupTestTelemetry(): Promise<void> {
  exporter = new InMemorySpanExporter();
  await TelemetryManager.initForTest(exporter);
}

export function clearTestSpans(): void {
  exporter?.reset();
}

export function getSpansByName(name: string): ReadableSpan[] {
  return exporter?.getFinishedSpans().filter(s => s.name === name) || [];
}

export function getSpan(name: string): ReadableSpan {
  const spans = getSpansByName(name);
  if (spans.length === 0) throw new Error(`Span "${name}" not found`);
  return spans[0];
}

export function getEvents(span: ReadableSpan): any[] {
  return span.events;
}
