import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveVariableFromIndex } from './paths.js';
import type { WorkflowGraph } from '../orchestration/workflow-graph.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNTIME_WORKFLOW_CONTRACT_PATH = path.resolve(__dirname, '../../contracts/workflow.md');

export interface ForwardNodeEntryOptions {
  nodeId: string;
  workspaceRoot: string;
  projectNamespace: string;
  isResume?: boolean;
  handoffContext?: {
    wf: WorkflowGraph;
    completedHandoffs: string[];
    receivingHandoffSnapshot?: Array<{ fromNodeId: string; artifacts: string[] }>;
    staleForwardArtifacts?: Array<{ toNodeId: string; artifacts: string[] }>;
  };
  includeWorkflowContract?: boolean;
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
    workspaceRoot,
    projectNamespace,
    isResume,
    handoffContext,
    includeWorkflowContract,
    nodeContext,
  } = opts;
  const lines: string[] = [];

  lines.push(`Node ${nodeId} ${isResume ? 'resumed' : 'started'} at: ${new Date().toISOString()}`);
  lines.push('');

  // Injected only on first node visit when the node contract references workflow authority.
  if (includeWorkflowContract) {
    lines.push('Runtime workflow contract:');
    lines.push('Use this contract when creating, updating, or repairing workflow.yaml for this active flow.');
    if (fs.existsSync(RUNTIME_WORKFLOW_CONTRACT_PATH)) {
      lines.push('[FILE: a-society/runtime/contracts/workflow.md]');
      lines.push(fs.readFileSync(RUNTIME_WORKFLOW_CONTRACT_PATH, 'utf8'));
    } else {
      lines.push('[FILE ERROR: Could not read a-society/runtime/contracts/workflow.md]');
    }
    lines.push('');
  }

  // Injected only on first node visit when the node definition has at least one populated contract field.
  if (nodeContext) {
    const appendStringList = (heading: string, items?: string[]) => {
      if (!items || items.length === 0) return;
      lines.push(heading);
      for (const item of items) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    };

    lines.push(`Node-specific instructions for node ${nodeId}:`);
    lines.push('');

    appendStringList('Guidance:', nodeContext.guidance);
    appendStringList('Declared inputs:', nodeContext.inputs);
    appendStringList('Declared work:', nodeContext.work);
    appendStringList('Declared outputs:', nodeContext.outputs);
    appendStringList('Transition notes:', nodeContext.transitions);
    appendStringList('Node notes:', nodeContext.notes);

    if (nodeContext.required_readings && nodeContext.required_readings.length > 0) {
      lines.push('Node-specific required reading:');
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

  // Handoff state: received artifacts, pending inbound, and sent/unsent outbound edges.
  if (handoffContext) {
    const { wf, completedHandoffs, receivingHandoffSnapshot, staleForwardArtifacts } = handoffContext;

    const inboundHandoffs = (receivingHandoffSnapshot ?? []).map(({ fromNodeId, artifacts }) => ({
      fromNodeId,
      artifacts,
      direction: wf.getIncomingEdges(nodeId).some(e => e.from === fromNodeId) ? 'forward' as const : 'backward' as const,
    }));
    const notReceivedFromNodeIds = wf.getIncomingEdges(nodeId)
      .filter(e => !completedHandoffs.includes(wf.edgeKey(e.from, nodeId)))
      .map(e => e.from);
    const sentToNodeIds = wf.getOutgoingEdges(nodeId)
      .filter(e => completedHandoffs.includes(wf.edgeKey(nodeId, e.to)))
      .map(e => e.to);
    const notSentToNodeIds = wf.getOutgoingEdges(nodeId)
      .filter(e => !completedHandoffs.includes(wf.edgeKey(nodeId, e.to)))
      .map(e => e.to);

    if (inboundHandoffs.length > 0) {
      lines.push('Handoffs received:');
      for (const { fromNodeId, artifacts, direction } of inboundHandoffs) {
        const label = direction === 'forward'
          ? `From predecessor ${fromNodeId}:`
          : `From successor ${fromNodeId} (please take necessary action so the successor can complete its work):`;
        lines.push(label);
        for (const artifactPath of artifacts) {
          const fullPath = path.resolve(workspaceRoot, artifactPath);
          lines.push(`[FILE: ${artifactPath}]`);
          if (fs.existsSync(fullPath)) {
            lines.push(fs.readFileSync(fullPath, 'utf8'));
          } else {
            lines.push('(File does not exist yet)');
          }
          lines.push('');
        }
        if (direction === 'backward' && staleForwardArtifacts) {
          const stale = staleForwardArtifacts.find(s => s.toNodeId === fromNodeId);
          if (stale && stale.artifacts.length > 0) {
            lines.push(
              `Note: the following previously queued forward artifact(s) to ${fromNodeId} are superseded by the backward handoff above. ` +
              `Do not treat them as delivered current work; use these paths only as prior context when creating the corrected replacement handoff:`
            );
            for (const artifactPath of stale.artifacts) {
              lines.push(`- ${artifactPath}`);
            }
            lines.push('');
          }
        }
      }
    }

    if (notReceivedFromNodeIds.length > 0) {
      lines.push('Handoffs not yet received from:');
      lines.push('Do not search the record folder for these handoffs. Any matching files there may be stale; the runtime will inject each handoff here when it is ready.');
      lines.push('If you need one of these handoffs before you can proceed, emit await-handoff.');
      for (const id of notReceivedFromNodeIds) lines.push(`- ${id}`);
      lines.push('');
    }

    if (sentToNodeIds.length > 0) {
      lines.push('Handoffs already sent to:');
      for (const id of sentToNodeIds) lines.push(`- ${id}`);
      lines.push('');
    }

    if (notSentToNodeIds.length > 0) {
      lines.push('Handoffs not yet sent to:');
      for (const id of notSentToNodeIds) lines.push(`- ${id}`);
      lines.push('');
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
  contextLines?: string[];
  completionSignal: string;
}

/**
 * Builds the first user message for a backward-pass improvement step (meta-analysis or feedback).
 * Delivers instruction file and findings files as rendered file blocks in the user message,
 * not in the system bundle.
 */
export function buildImprovementEntryMessage(opts: ImprovementEntryOptions): string {
  const {
    stepLabel,
    recordFolderPath,
    workspaceRoot,
    instructionFilePath,
    findingsFilePaths,
    contextLines,
    completionSignal
  } = opts;
  const lines: string[] = [];

  lines.push(`Backward pass ${stepLabel}.`);
  lines.push(`Node started at: ${new Date().toISOString()}`);
  lines.push(`Record folder: ${recordFolderPath}`);
  lines.push('');

  if (contextLines && contextLines.length > 0) {
    lines.push('Flow feedback context:');
    for (const line of contextLines) {
      lines.push(`- ${line}`);
    }
    lines.push('');
  }

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
