import yaml from 'js-yaml';
import type { HandoffResult } from '../common/types.js';
import { TelemetryManager } from '../observability/observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';

export type HandoffRepairCode =
  | 'missing_block'
  | 'yaml_parse'
  | 'invalid_target_shape'
  | 'missing_required_field'
  | 'artifact_unavailable'
  | 'invalid_transition'
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
      'Error: No handoff block found. Please end your response with a fenced code block tagged `handoff`. Use either the target form (`target_node_id` + `artifact_path`) or an appropriate typed signal (`prompt-human`, `forward-pass-closed`, `meta-analysis-complete`, or `backward-pass-complete`).'
  });
}

function yamlParseError(): HandoffParseError {
  return new HandoffParseError({
    code: 'yaml_parse',
    operatorSummary: 'Malformed handoff block',
    modelRepairMessage:
      'Error: Handoff block could not be parsed as YAML. Please correct the handoff block formatting and restate it using either the target form (`target_node_id` + `artifact_path`) or an appropriate typed signal.'
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
      `Error: Unknown handoff signal type: "${type}". Supported typed signal forms are: forward-pass-closed, meta-analysis-complete, backward-pass-complete, prompt-human.`
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
            if (typeof entry.target_node_id !== 'string' || entry.target_node_id.trim() === '') {
              throw missingRequiredField(
                `Handoff array entry [${i}]: "target_node_id" field is required and must be a non-empty string.`
              );
            }
            return {
              target_node_id: entry.target_node_id,
              artifact_path: entry.artifact_path ? String(entry.artifact_path) : null
            };
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
            } else if (payload.type === 'backward-pass-complete') {
              if (typeof payload.artifact_path !== 'string' || payload.artifact_path.trim() === '') {
                throw missingRequiredField('backward-pass-complete block missing artifact_path');
              }
              result = {
                kind: 'backward-pass-complete',
                artifactPath: payload.artifact_path,
              };
            } else if (payload.type === 'prompt-human') {
              result = { kind: 'awaiting_human' };
            } else {
              throw unknownSignalType(String(payload.type));
            }
          } else {
            if (typeof payload.target_node_id !== 'string' || payload.target_node_id.trim() === '') {
              throw missingRequiredField('"target_node_id" field is required and must be a non-empty string.');
            }
            result = {
              kind: 'targets',
              targets: [{
                target_node_id: payload.target_node_id,
                artifact_path: payload.artifact_path ? String(payload.artifact_path) : null
              }]
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
