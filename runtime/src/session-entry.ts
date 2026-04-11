import fs from 'node:fs';
import path from 'node:path';

/**
 * Builds the exact Owner bootstrap first-turn user message.
 * Called by the orchestrator at fresh interactive Owner bootstrap only.
 */
export function buildOwnerBootstrapMessage(): string {
  return (
    'A fresh interactive Owner session has started. ' +
    'The runtime already loaded your required-reading authority files into context. ' +
    'Using that loaded context, summarize the project log, give a brief status of where the project is at, ' +
    'ask what the user wants to work on, and end with a `type: prompt-human` handoff block. ' +
    'Do not spend this first turn rereading the log or workflow unless close inspection is necessary for the status you give.'
  );
}

export interface ForwardNodeEntryOptions {
  nodeId: string;
  role: string;
  workspaceRoot: string;
  activeArtifacts: string[];
  continuityEntries?: Array<{ nodeId: string; outputArtifactPath: string | null }>;
  humanInput?: string;
}

/**
 * Builds the combined node-entry user message for a new (not resumed) workflow node.
 * Includes: node header, non-startup distinction line, optional role-continuity section,
 * current task inputs with rendered file blocks, optional human input, and closing instruction.
 */
export function buildForwardNodeEntryMessage(opts: ForwardNodeEntryOptions): string {
  const { nodeId, role, workspaceRoot, activeArtifacts, continuityEntries, humanInput } = opts;
  const lines: string[] = [];

  lines.push(`Workflow node: ${nodeId} (role: ${role})`);
  lines.push(
    'This is a workflow node entry, not a fresh role-orientation session. ' +
    'Use the current node inputs and the already loaded startup authority to do this node\'s work.'
  );

  if (continuityEntries && continuityEntries.length > 0) {
    lines.push('');
    lines.push('Role continuity from earlier nodes in this flow:');
    for (const entry of continuityEntries) {
      if (entry.outputArtifactPath) {
        lines.push(`- ${entry.nodeId} -> ${entry.outputArtifactPath}`);
      } else {
        lines.push(`- ${entry.nodeId} -> (no artifact recorded)`);
      }
    }
  }

  lines.push('');
  lines.push('Current task inputs:');

  for (const artifactPath of activeArtifacts) {
    const fullPath = path.resolve(workspaceRoot, artifactPath);
    lines.push(`[FILE: ${artifactPath}]`);
    if (fs.existsSync(fullPath)) {
      lines.push(fs.readFileSync(fullPath, 'utf8'));
    } else {
      lines.push('(File does not exist yet)');
    }
    lines.push('');
  }

  if (humanInput) {
    lines.push('Human input:');
    lines.push(humanInput);
    lines.push('');
  }

  lines.push('Proceed from these current node inputs.');

  return lines.join('\n');
}

export interface ImprovementEntryOptions {
  stepLabel: string;
  recordFolderPath: string;
  workspaceRoot: string;
  instructionFilePath: string;
  findingsFilePaths: string[];
  completionSignal: string;
}

/**
 * Builds the first user message for a backward-pass improvement step (meta-analysis or synthesis).
 * Delivers instruction file and findings files as rendered file blocks in the user message,
 * not in the system bundle.
 */
export function buildImprovementEntryMessage(opts: ImprovementEntryOptions): string {
  const { stepLabel, recordFolderPath, workspaceRoot, instructionFilePath, findingsFilePaths, completionSignal } = opts;
  const lines: string[] = [];

  lines.push(`Backward pass ${stepLabel}.`);
  lines.push(`Record folder: ${recordFolderPath}`);
  lines.push('');

  const instructionRelPath = path.relative(workspaceRoot, instructionFilePath);
  lines.push(`[FILE: ${instructionRelPath}]`);
  if (fs.existsSync(instructionFilePath)) {
    lines.push(fs.readFileSync(instructionFilePath, 'utf8'));
  } else {
    lines.push('(File does not exist yet)');
  }
  lines.push('');

  for (const findingsPath of findingsFilePaths) {
    const relPath = path.relative(workspaceRoot, findingsPath);
    lines.push(`[FILE: ${relPath}]`);
    if (fs.existsSync(findingsPath)) {
      lines.push(fs.readFileSync(findingsPath, 'utf8'));
    } else {
      lines.push('(File does not exist yet)');
    }
    lines.push('');
  }

  lines.push(completionSignal);

  return lines.join('\n');
}
