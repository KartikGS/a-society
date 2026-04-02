import yaml from 'js-yaml';

export interface HandoffTarget {
  role: string;
  artifact_path: string | null;
}

export class HandoffParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HandoffParseError';
  }
}

export class HandoffInterpreter {
  /**
   * Extracts and validates the final handoff block from an assistant message.
   * Supports both single-target and array (multi-target) forms.
   * Always returns an array of HandoffTargets.
   */
  static parse(text: string): HandoffTarget[] {
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

    // Empty array guard:
    if (Array.isArray(payload) && payload.length === 0) {
      throw new HandoffParseError('Handoff block must contain at least one target.');
    }

    // Single-object form:
    if (!Array.isArray(payload)) {
      if (typeof payload.role !== 'string' || payload.role.trim() === '') {
        throw new HandoffParseError('"role" field is required and must be a non-empty string.');
      }
      return [{ role: payload.role, artifact_path: payload.artifact_path ? String(payload.artifact_path) : null }];
    }

    // Array form:
    return payload.map((entry: any, i: number) => {
      if (typeof entry.role !== 'string' || entry.role.trim() === '') {
        throw new HandoffParseError(`Handoff array entry [${i}]: "role" field is required and must be a non-empty string.`);
      }
      return { role: entry.role, artifact_path: entry.artifact_path ? String(entry.artifact_path) : null };
    });
  }
}
