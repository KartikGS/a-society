import yaml from 'js-yaml';
import type { HandoffResult } from './types.js';
import { TelemetryManager } from './observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';

export type HandoffRepairCode =
  | 'missing_block'
  | 'yaml_parse'
  | 'invalid_target_shape'
  | 'missing_required_field'
  | 'unknown_signal_type';

export interface HandoffRepairDetails {
  code: HandoffRepairCode;
  operatorSummary: string;
  modelRepairMessage: string;
}

export class HandoffParseError extends Error {
  readonly details: HandoffRepairDetails;
  constructor(details: HandoffRepairDetails) {
    super(details.operatorSummary);
    this.name = 'HandoffParseError';
    this.details = details;
  }
}

function missingBlock(): HandoffParseError {
  return new HandoffParseError({
    code: 'missing_block',
    operatorSummary: 'Malformed handoff block',
    modelRepairMessage:
      'Error: No handoff block found. Please end your response with a fenced code block tagged `handoff` containing the required fields:\n```handoff\nrole: <role>\nartifact_path: <path>\n```'
  });
}

function yamlParseError(): HandoffParseError {
  return new HandoffParseError({
    code: 'yaml_parse',
    operatorSummary: 'Malformed handoff block',
    modelRepairMessage:
      'Error: Handoff block could not be parsed as YAML. Expected fields: role (string), artifact_path (string or null). Please correct the handoff block formatting and restate it.'
  });
}

function invalidTargetShape(detail: string): HandoffParseError {
  return new HandoffParseError({
    code: 'invalid_target_shape',
    operatorSummary: 'Malformed handoff block',
    modelRepairMessage: `Error: ${detail}`
  });
}

function missingRequiredField(detail: string): HandoffParseError {
  return new HandoffParseError({
    code: 'missing_required_field',
    operatorSummary: 'Handoff block missing required field',
    modelRepairMessage: `Error: ${detail}`
  });
}

function unknownSignalType(type: string): HandoffParseError {
  return new HandoffParseError({
    code: 'unknown_signal_type',
    operatorSummary: `Unsupported handoff signal type "${type}"`,
    modelRepairMessage:
      `Error: Unknown handoff signal type: "${type}". Supported typed signal forms are: forward-pass-closed, meta-analysis-complete, prompt-human.`
  });
}

export class HandoffInterpreter {
  /**
   * Extracts and validates the final handoff block from an assistant message.
   * Supports target forms (single/array) and typed signal forms.
   */
  static parse(text: string): HandoffResult {
    const tracer = TelemetryManager.getTracer();
    return tracer.startActiveSpan('handoff.parse', {
      kind: SpanKind.INTERNAL,
      attributes: { 'handoff.text_length': text.length }
    }, (span) => {
      try {
        const handoffTagRegex = /```handoff\s*[\n\r]+([\s\S]*?)```/i;
        const match = text.match(handoffTagRegex);
        let payload: any;

        if (match) {
          try {
            payload = yaml.load(match[1]);
          } catch (_err) {
            throw yamlParseError();
          }
        } else {
          throw missingBlock();
        }

        if (!payload && payload !== 0) {
          throw missingBlock();
        }

        let result: HandoffResult;

        if (Array.isArray(payload)) {
          if (payload.length === 0) {
            throw invalidTargetShape('Handoff block must contain at least one target.');
          }
          const targets = payload.map((entry: any, i: number) => {
            if (typeof entry.role !== 'string' || entry.role.trim() === '') {
              throw missingRequiredField(
                `Handoff array entry [${i}]: "role" field is required and must be a non-empty string.`
              );
            }
            return { role: entry.role, artifact_path: entry.artifact_path ? String(entry.artifact_path) : null };
          });
          result = { kind: 'targets', targets };

        } else if (typeof payload === 'object' && payload !== null) {
          if ('type' in payload) {
            if (payload.type === 'forward-pass-closed') {
              if (typeof payload.record_folder_path !== 'string' || payload.record_folder_path.trim() === '') {
                throw missingRequiredField('forward-pass-closed block missing record_folder_path');
              }
              if (typeof payload.artifact_path !== 'string' || payload.artifact_path.trim() === '') {
                throw missingRequiredField('forward-pass-closed block missing artifact_path');
              }
              result = {
                kind: 'forward-pass-closed',
                recordFolderPath: payload.record_folder_path,
                artifactPath: payload.artifact_path,
              };
            } else if (payload.type === 'meta-analysis-complete') {
              if (typeof payload.findings_path !== 'string' || payload.findings_path.trim() === '') {
                throw missingRequiredField('meta-analysis-complete block missing findings_path');
              }
              result = {
                kind: 'meta-analysis-complete',
                findingsPath: payload.findings_path,
              };
            } else if (payload.type === 'prompt-human') {
              result = { kind: 'awaiting_human' };
            } else {
              throw unknownSignalType(String(payload.type));
            }
          } else {
            if (typeof payload.role !== 'string' || payload.role.trim() === '') {
              throw missingRequiredField('"role" field is required and must be a non-empty string.');
            }
            result = {
              kind: 'targets',
              targets: [{ role: payload.role, artifact_path: payload.artifact_path ? String(payload.artifact_path) : null }]
            };
          }
        } else {
          throw missingBlock();
        }

        span.setAttribute('handoff.parse.success', true);
        span.setAttribute('handoff.result_kind', result.kind);
        return result;
      } catch (e: any) {
        span.setAttribute('handoff.parse.success', false);
        span.recordException(e);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw e;
      } finally {
        span.end();
      }
    });
  }
}
