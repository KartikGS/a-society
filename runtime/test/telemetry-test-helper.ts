import { InMemorySpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { AggregationTemporality, InMemoryMetricExporter, MetricData } from '@opentelemetry/sdk-metrics';
import { TelemetryManager } from '../src/observability.js';

let exporter: InMemorySpanExporter | null = null;
let metricExporter: InMemoryMetricExporter | null = null;

export async function setupTestTelemetry(): Promise<void> {
  exporter = new InMemorySpanExporter();
  metricExporter = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE);
  await TelemetryManager.initForTest(exporter, metricExporter);
}

export function clearTestSpans(): void {
  exporter?.reset();
}

export function clearTestMetrics(): void {
  metricExporter?.reset();
}

export async function flushTestTelemetry(): Promise<void> {
  await TelemetryManager.forceFlush();
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

function getMetricsByName(name: string): MetricData[] {
  return metricExporter?.getMetrics()
    .flatMap(resourceMetrics => resourceMetrics.scopeMetrics)
    .flatMap(scopeMetrics => scopeMetrics.metrics)
    .filter(metric => metric.descriptor.name === name) || [];
}

export function getMetric(name: string): MetricData {
  const metrics = getMetricsByName(name);
  if (metrics.length === 0) throw new Error(`Metric "${name}" not found`);
  return metrics[metrics.length - 1];
}

export function getMetricDataPoints(name: string): Array<{ attributes: Record<string, unknown>; value: unknown }> {
  return getMetricsByName(name).flatMap(metric =>
    metric.dataPoints.map(dataPoint => ({
      attributes: dataPoint.attributes as Record<string, unknown>,
      value: dataPoint.value,
    }))
  );
}
