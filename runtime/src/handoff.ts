import yaml from 'js-yaml';
import type { HandoffResult } from './types.js';

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
    // 1. Try to find ```handoff ... ``` block
    const handoffTagRegex = /```handoff\s*[\n\r]+([\s\S]*?)```/i;
    let match = text.match(handoffTagRegex);
    let payload: any;
    
    if (match) {
      try {
        payload = yaml.load(match[1]);
      } catch (err: any) {
        throw new HandoffParseError(`Malformed YAML in handoff block: ${err.message}`);
      }
    } else {
      // 2. Try to find ```yaml ... ``` specifically with a handoff: key (backward compatibility)
      const yamlTagRegex = /```(?:yaml)?\s*[\n\r]+handoff:([\s\S]*?)```/i;
      match = text.match(yamlTagRegex);
      if (!match) {
          throw new HandoffParseError('No valid handoff block found. A handoff block is required to pass control back to the orchestrator.');
      }
      try {
          const yamlStr = `handoff:${match[1]}`;
          const parsed: any = yaml.load(yamlStr);
          payload = parsed.handoff;
      } catch (err: any) {
          throw new HandoffParseError(`Malformed YAML in handoff block: ${err.message}`);
      }
    }

    if (!payload && payload !== 0) {
      throw new HandoffParseError('Handoff block is empty or invalid.');
    }

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
      return { kind: 'targets', targets };
    }

    // 2. Non-array object
    if (typeof payload === 'object' && payload !== null) {
      // Typed signal form
      if ('type' in payload) {
        if (payload.type === 'forward-pass-closed') {
          if (typeof payload.record_folder_path !== 'string' || payload.record_folder_path.trim() === '') {
            throw new HandoffParseError('forward-pass-closed block missing record_folder_path');
          }
          if (typeof payload.artifact_path !== 'string' || payload.artifact_path.trim() === '') {
            throw new HandoffParseError('forward-pass-closed block missing artifact_path');
          }
          return {
            kind: 'forward-pass-closed',
            recordFolderPath: payload.record_folder_path,
            artifactPath: payload.artifact_path,
          };
        }
        if (payload.type === 'meta-analysis-complete') {
          if (typeof payload.findings_path !== 'string' || payload.findings_path.trim() === '') {
            throw new HandoffParseError('meta-analysis-complete block missing findings_path');
          }
          return {
            kind: 'meta-analysis-complete',
            findingsPath: payload.findings_path,
          };
        }
        throw new HandoffParseError(`Unknown handoff signal type: ${payload.type}`);
      }

      // Single-target form
      if (typeof payload.role !== 'string' || payload.role.trim() === '') {
        throw new HandoffParseError('"role" field is required and must be a non-empty string.');
      }
      return {
        kind: 'targets',
        targets: [{ role: payload.role, artifact_path: payload.artifact_path ? String(payload.artifact_path) : null }]
      };
    }

    throw new HandoffParseError('Handoff block is invalid.');
  }
}
