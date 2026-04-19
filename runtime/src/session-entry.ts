import fs from 'node:fs';
import path from 'node:path';
import { resolveVariableFromIndex } from './paths.js';

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
  projectNamespace: string;
  activeArtifacts: string[];
  entryMode?: 'first-node' | 'role-transition' | 'reopened-node';
  previousNodeId?: string;
  humanInput?: string;
  nodeContext?: {
    required_readings?: string[];
    guidance?: string[];
    inputs?: string[];
    work?: string[];
    outputs?: string[];
    transitions?: string[];
    notes?: string[];
  };
}

/**
 * Builds the combined node-entry user message for a workflow node.
 * Includes: node header, role-session framing, current task inputs with rendered file blocks,
 * optional human input, and closing instruction.
 */
export function buildForwardNodeEntryMessage(opts: ForwardNodeEntryOptions): string {
  const {
    nodeId,
    role,
    workspaceRoot,
    projectNamespace,
    activeArtifacts,
    entryMode = 'first-node',
    previousNodeId,
    humanInput,
    nodeContext
  } = opts;
  const lines: string[] = [];

  lines.push(`Workflow node: ${nodeId} (role: ${role})`);
  if (entryMode === 'role-transition' && previousNodeId) {
    lines.push(
      `You are continuing the same role-scoped flow session from workflow node ${previousNodeId} to ${nodeId}. ` +
      'Prior role discussion remains available in this session, but the current task inputs below are authoritative for this node.'
    );
  } else if (entryMode === 'reopened-node') {
    lines.push(
      'This workflow node has been reopened in the same role-scoped flow session. ' +
      'Prior discussion for this node remains available, but the current task inputs below are authoritative and may supersede earlier assumptions.'
    );
  } else {
    lines.push(
      'This is the first workflow node for this role in the current flow session. ' +
      'Use the current node inputs and the already loaded startup authority to do this node\'s work.'
    );
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

  if (nodeContext) {
    const appendStringList = (heading: string, items?: string[]) => {
      if (!items || items.length === 0) return;
      lines.push(heading);
      for (const item of items) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    };

    lines.push('Workflow node contract (first entry to this node only):');
    lines.push('Use this snapshot as the authoritative node contract for this node in the active flow.');
    lines.push('');

    appendStringList('Guidance:', nodeContext.guidance);
    appendStringList('Declared inputs:', nodeContext.inputs);
    appendStringList('Declared work:', nodeContext.work);
    appendStringList('Declared outputs:', nodeContext.outputs);
    appendStringList('Transition notes:', nodeContext.transitions);
    appendStringList('Node notes:', nodeContext.notes);

    if (nodeContext.required_readings && nodeContext.required_readings.length > 0) {
      lines.push('Node-specific required reading (first entry to this node only):');
      for (const varName of nodeContext.required_readings) {
        const resolvedPath = resolveVariableFromIndex(varName, workspaceRoot, projectNamespace);
        if (resolvedPath && fs.existsSync(resolvedPath)) {
          lines.push(`[FILE: ${varName} (resolved to ${resolvedPath})]`);
          lines.push(fs.readFileSync(resolvedPath, 'utf8'));
        } else {
          lines.push(`[FILE ERROR: Could not resolve or read ${varName}]`);
        }
        lines.push('');
      }
    }
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
 * Builds the first user message for a backward-pass improvement step (meta-analysis or feedback).
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
