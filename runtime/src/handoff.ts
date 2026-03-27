import yaml from 'js-yaml';

export interface HandoffBlock {
  role: string;
  session_action: 'resume' | 'start_new';
  artifact_path: string | null;
  prompt: string | null;
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

    const { role, session_action, artifact_path, prompt } = parsed.handoff;

    if (typeof role !== 'string') throw new HandoffParseError('"role" field is required and must be a string.');
    if (typeof session_action !== 'string') throw new HandoffParseError('"session_action" field is required and must be a string.');
    
    const isNew = session_action === 'start_new';
    const isResume = session_action === 'resume';

    if (!isNew && !isResume) {
      throw new HandoffParseError('"session_action" must be one of: start_new, resume.');
    }

    if (isNew && (prompt === null || prompt === undefined)) {
      throw new HandoffParseError('"prompt" cannot be null for a new session_action.');
    }

    if (isResume && prompt !== null && prompt !== undefined) {
      throw new HandoffParseError('"prompt" must be strictly null (or missing) for a resume session_action.');
    }

    return {
      role,
      session_action: isNew ? 'start_new' : 'resume',
      artifact_path: artifact_path ? String(artifact_path) : null,
      prompt: prompt ? String(prompt) : null
    };
  }
}
