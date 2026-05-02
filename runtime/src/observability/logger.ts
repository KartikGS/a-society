import { SeverityNumber } from '@opentelemetry/api-logs';
import type { LogAttributes as OtelLogAttributes } from '@opentelemetry/api-logs';
import * as opentelemetry from '@opentelemetry/api';
import { TelemetryManager } from './observability.js';

export type LogAttributes = Record<string, string | number | boolean | undefined>;

function emit(severity: SeverityNumber, severityText: string, body: string, attributes?: LogAttributes): void {
  TelemetryManager.getLogger().emit({
    severityNumber: severity,
    severityText,
    body,
    attributes: attributes as OtelLogAttributes,
    context: opentelemetry.context.active(),
  });
}

export const logger = {
  info(body: string, attributes?: LogAttributes): void {
    emit(SeverityNumber.INFO, 'INFO', body, attributes);
  },
  warn(body: string, attributes?: LogAttributes): void {
    emit(SeverityNumber.WARN, 'WARN', body, attributes);
  },
  error(body: string, attributes?: LogAttributes): void {
    emit(SeverityNumber.ERROR, 'ERROR', body, attributes);
  },
  debug(body: string, attributes?: LogAttributes): void {
    emit(SeverityNumber.DEBUG, 'DEBUG', body, attributes);
  },
};
