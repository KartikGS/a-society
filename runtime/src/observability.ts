import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import * as opentelemetry from '@opentelemetry/api';
import { SpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
const versionFilePath = path.join(__dirname, '../../VERSION.md');
let frameworkVersion = 'unknown';
try {
  const versionFile = fs.readFileSync(versionFilePath, 'utf-8');
  const frameworkVersionMatch = versionFile.match(/v\d+\.\d+/);
  if (frameworkVersionMatch) frameworkVersion = frameworkVersionMatch[0];
} catch (e) {
  // VERSION.md might not be reachable from certain execution contexts
}

export class TelemetryManager {
  private static instance: NodeSDK | null = null;
  private static testProvider: any = null;
  private static tracer: opentelemetry.Tracer | null = null;
  private static meter: opentelemetry.Meter | null = null;

  static init(): void {
    if (this.instance) return;
    if (process.env.A_SOCIETY_TELEMETRY_ENABLED === 'false') return;

    const resource = Resource.default().merge(new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'a-society-runtime',
      [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'a-society',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.A_SOCIETY_ENVIRONMENT || 'production',
      [SemanticResourceAttributes.SERVICE_VERSION]: packageJson.version,
      ['a_society.framework.version']: frameworkVersion,
    }));

    const endpoint = process.env.A_SOCIETY_OTLP_ENDPOINT;
    const headers = this.parseHeaders(process.env.A_SOCIETY_OTLP_HEADERS);

    let traceExporter: any = undefined;
    let metricReader: any = undefined;

    if (endpoint) {
      traceExporter = new OTLPTraceExporter({
        url: endpoint.endsWith('/') ? `${endpoint}v1/traces` : `${endpoint}/v1/traces`,
        headers,
      });
      metricReader = new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: endpoint.endsWith('/') ? `${endpoint}v1/metrics` : `${endpoint}/v1/metrics`,
          headers,
        }),
        exportIntervalMillis: Number(process.env.A_SOCIETY_OTLP_METRICS_INTERVAL) || 60000,
      });
    }

    this.instance = new NodeSDK({
      resource,
      traceExporter,
      metricReader,
      instrumentations: [],
    });

    try {
      this.instance.start();
    } catch (e) {
      process.stderr.write(`[telemetry] Warning: Failed to initialize OpenTelemetry SDK. Traces and metrics will not be exported.\n`);
    }

    process.on('SIGTERM', () => this.shutdown());
    process.on('beforeExit', () => this.shutdown());
  }

  static async initForTest(traceExporter: SpanExporter): Promise<void> {
    await this.shutdown();
    
    const resource = Resource.default().merge(new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'a-society-runtime-test',
      [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'a-society',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'test',
    }));

    const { BasicTracerProvider } = await import('@opentelemetry/sdk-trace-base');
    const { AsyncHooksContextManager } = await import('@opentelemetry/context-async-hooks');
    const opentelemetryApi = await import('@opentelemetry/api');

    this.testProvider = new BasicTracerProvider({
      resource,
    });
    this.testProvider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
    this.testProvider.register();

    const contextManager = new AsyncHooksContextManager();
    contextManager.enable();
    opentelemetryApi.context.setGlobalContextManager(contextManager);

    this.tracer = this.testProvider.getTracer('a-society-runtime');
    this.meter = null;
  }

  static async shutdown(): Promise<void> {
    if (this.instance) {
      await this.instance.shutdown();
      this.instance = null;
    }
    if (this.testProvider) {
      await this.testProvider.shutdown();
      this.testProvider = null;
    }
    this.tracer = null;
    this.meter = null;
  }

  static getTracer(): opentelemetry.Tracer {
    if (!this.tracer) {
      this.tracer = opentelemetry.trace.getTracer('a-society-runtime');
    }
    return this.tracer;
  }

  static getMeter(): opentelemetry.Meter {
    if (!this.meter) {
      this.meter = opentelemetry.metrics.getMeter('a-society-runtime');
    }
    return this.meter;
  }

  private static parseHeaders(headerStr?: string): Record<string, string> {
    if (!headerStr) return {};
    const headers: Record<string, string> = {};
    const pairs = headerStr.split(',');
    for (const pair of pairs) {
      const parts = pair.split('=');
      if (parts.length === 2) {
        headers[parts[0].trim()] = parts[1].trim();
      } else if (pair.trim()) {
        process.stderr.write(`[telemetry] Warning: Malformed OTLP headers provided. Telemetry will be collected but not exported.\n`);
        return {};
      }
    }
    return headers;
  }
}
