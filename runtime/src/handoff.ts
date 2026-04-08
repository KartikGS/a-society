import yaml from 'js-yaml';
import type { HandoffResult } from './types.js';
import { TelemetryManager } from './observability.js';
import { SpanStatusCode, SpanKind } from '@opentelemetry/api';

export class HandoffParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HandoffParseError';
  }
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
        // 1. Try to find ```handoff ... ``` block
        const handoffTagRegex = /```handoff\s*[\n\r]+([\s\S]*?)```/i;
        let match = text.match(handoffTagRegex);
        let payload: any;
        
        if (match) {
          try {
            payload = yaml.load(match[1]);
          } catch (err: any) {
            throw new HandoffParseError(`Error: Handoff block could not be parsed. Expected fields: role (string), artifact_path (string or null). Please correct the handoff block and restate it.`);
          }
        } else {
          throw new HandoffParseError('Error: Handoff block could not be parsed. Expected fields: role (string), artifact_path (string or null). Please correct the handoff block and restate it.');
        }

        if (!payload && payload !== 0) {
          throw new HandoffParseError('Handoff block is empty or invalid.');
        }

        let result: HandoffResult;
        // 1. Array form (targets)
        if (Array.isArray(payload)) {
          if (payload.length === 0) {
            throw new HandoffParseError('Handoff block must contain at least one target.');
          }
          const targets = payload.map((entry: any, i: number) => {
            if (typeof entry.role !== 'string' || entry.role.trim() === '') {
              throw new HandoffParseError(`Handoff array entry [${i}]: "role" field is required and must be a non-empty string.`);
            }
            return { role: entry.role, artifact_path: entry.artifact_path ? String(entry.artifact_path) : null };
          });
          result = { kind: 'targets', targets };
        } else if (typeof payload === 'object' && payload !== null) {
          // 2. Non-array object
          // Typed signal form
          if ('type' in payload) {
            if (payload.type === 'forward-pass-closed') {
              if (typeof payload.record_folder_path !== 'string' || payload.record_folder_path.trim() === '') {
                throw new HandoffParseError('forward-pass-closed block missing record_folder_path');
              }
              if (typeof payload.artifact_path !== 'string' || payload.artifact_path.trim() === '') {
                throw new HandoffParseError('forward-pass-closed block missing artifact_path');
              }
              result = {
                kind: 'forward-pass-closed',
                recordFolderPath: payload.record_folder_path,
                artifactPath: payload.artifact_path,
              };
            } else if (payload.type === 'meta-analysis-complete') {
              if (typeof payload.findings_path !== 'string' || payload.findings_path.trim() === '') {
                throw new HandoffParseError('meta-analysis-complete block missing findings_path');
              }
              result = {
                kind: 'meta-analysis-complete',
                findingsPath: payload.findings_path,
              };
            } else if (payload.type === 'prompt-human') {
              result = { kind: 'awaiting_human' };
            } else {
              throw new HandoffParseError(`Unknown handoff signal type: ${payload.type}`);
            }
          } else {
            // Single-target form
            if (typeof payload.role !== 'string' || payload.role.trim() === '') {
              throw new HandoffParseError('"role" field is required and must be a non-empty string.');
            }
            result = {
              kind: 'targets',
              targets: [{ role: payload.role, artifact_path: payload.artifact_path ? String(payload.artifact_path) : null }]
            };
          }
        } else {
          throw new HandoffParseError('Handoff block is invalid.');
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
        // console.log('OTel: Ending handoff.parse span');
        span.end();
      }
    });
  }
}
