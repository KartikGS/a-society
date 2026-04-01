import yaml from 'js-yaml';

export interface HandoffBlock {
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
   * Fails strictly if missing, malformed, or conditionally invalid.
   */
  static parse(text: string): HandoffBlock {
    // Look for ```yaml\nhandoff: ... ``` or similar.
    // The spec says "fenced code block tag: handoff" or the format is yaml with handoff key.
    const blockRegex = /```(?:yaml)?\s*[\n\r]+handoff:([\s\S]*?)```/i;
    const match = text.match(blockRegex);
    
    if (!match) {
      throw new HandoffParseError('No valid handoff block found. A handoff block is required to pass control back to the orchestrator.');
    }

    let parsed: any;
    try {
      // Re-prepend the 'handoff:' key to parse standard YAML
      const yamlStr = `handoff:${match[1]}`;
      parsed = yaml.load(yamlStr);
    } catch (err: any) {
      throw new HandoffParseError(`Malformed YAML in handoff block: ${err.message}`);
    }

    if (!parsed || !parsed.handoff) {
      throw new HandoffParseError('Handoff block parsed but missing required root "handoff" key.');
    }

    const { role, artifact_path } = parsed.handoff;

    if (typeof role !== 'string') throw new HandoffParseError('"role" field is required and must be a string.');

    return {
      role,
      artifact_path: artifact_path ? String(artifact_path) : null
    };
  }
}

