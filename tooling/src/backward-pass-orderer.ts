import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { extractFrontmatter } from './utils.js';

/**
 * Co-maintenance dependency: update if $GENERAL_IMPROVEMENT relocates in the index.
 */
const GENERAL_IMPROVEMENT_PATH = 'a-society/general/improvement/main.md';

export interface WorkflowNode {
  id: string;
  role: string;
  'human-collaborative'?: string;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  artifact?: string;
}

export interface RecordWorkflowFrontmatter {
  workflow: {
    name?: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };
}

export interface BackwardPassEntry {
  role: string;
  stepType: 'meta-analysis' | 'synthesis';
  sessionInstruction: 'existing-session' | 'new-session';
  prompt: string;
}

export type BackwardPassPlan = BackwardPassEntry[];

function createMetaAnalysisPrompt(
  role: string,
  position: number,
  total: number,
  nextRole: string,
  nextStepType: 'meta-analysis' | 'synthesis',
): string {
  return [
    `Next action: Perform your backward pass meta-analysis (step ${position} of ${total}).`,
    `Read: all prior artifacts in the record folder, then ### Meta-Analysis Phase in ${GENERAL_IMPROVEMENT_PATH}`,
    `Expected response: Your findings artifact at the next available sequence position in the record folder. When complete, hand off to ${nextRole} (${nextStepType}).`,
  ].join('\n\n');
}

function createSynthesisPrompt(role: string, position: number, total: number, recordFolderPath: string): string {
  return [
    `You are the ${role} agent for A-Society. Read a-society/a-docs/agents.md.`,
    `You are performing backward pass synthesis (step ${position} of ${total} — final step).`,
    `Read: all findings artifacts in ${recordFolderPath}, then ### Synthesis Phase in ${GENERAL_IMPROVEMENT_PATH}`,
    `Produce your synthesis at the next available sequence position in ${recordFolderPath}.`,
  ].join('\n\n');
}

function parseRecordWorkflowFrontmatter(doc: unknown): RecordWorkflowFrontmatter {
  if (!doc || typeof doc !== 'object') {
    throw new Error('workflow.md frontmatter must parse to an object');
  }

  const rawWorkflow = (doc as Record<string, unknown>).workflow;
  if (!rawWorkflow || typeof rawWorkflow !== 'object') {
    throw new Error('workflow.md frontmatter must contain a workflow object');
  }

  const workflowObj = rawWorkflow as Record<string, unknown>;

  if ('path' in workflowObj) {
    throw new Error('Obsolete workflow schema detected (path[]). Please migrate workflow.md to the nodes/edges schema.');
  }

  const rawNodes = workflowObj.nodes;
  if (!Array.isArray(rawNodes) || rawNodes.length === 0) {
    throw new Error('workflow.nodes must be a non-empty array');
  }

  const nodes = rawNodes.map((node, index) => {
    if (!node || typeof node !== 'object') {
      throw new Error(`workflow.nodes[${index}] must be an object`);
    }

    const nodeObj = node as Record<string, unknown>;
    const id = nodeObj.id;
    const role = nodeObj.role;

    if (typeof id !== 'string' || id.trim() === '') {
      throw new Error(`workflow.nodes[${index}].id must be a non-empty string`);
    }

    if (typeof role !== 'string' || role.trim() === '') {
      throw new Error(`workflow.nodes[${index}].role must be a non-empty string`);
    }

    return {
      id,
      role,
      'human-collaborative': typeof nodeObj['human-collaborative'] === 'string' ? nodeObj['human-collaborative'] : undefined,
    };
  });

  const rawEdges = workflowObj.edges ?? [];
  if (!Array.isArray(rawEdges)) {
    throw new Error('workflow.edges must be an array');
  }

  const edges = rawEdges.map((edge, index) => {
    if (!edge || typeof edge !== 'object') {
      throw new Error(`workflow.edges[${index}] must be an object`);
    }

    const edgeObj = edge as Record<string, unknown>;
    const from = edgeObj.from;
    const to = edgeObj.to;

    if (typeof from !== 'string' || from.trim() === '') {
      throw new Error(`workflow.edges[${index}].from must be a non-empty string`);
    }

    if (typeof to !== 'string' || to.trim() === '') {
      throw new Error(`workflow.edges[${index}].to must be a non-empty string`);
    }

    return {
      from,
      to,
      artifact: typeof edgeObj.artifact === 'string' ? edgeObj.artifact : undefined,
    };
  });

  return {
    workflow: {
      name: typeof workflowObj.name === 'string' ? workflowObj.name : undefined,
      nodes,
      edges,
    },
  };
}

export function computeBackwardPassOrder(
  nodes: WorkflowNode[],
  synthesisRole: string,
  recordFolderPath: string = 'the record folder',
): BackwardPassPlan {
  const seenRoles = new Set<string>();
  const firstOccurrenceRoles: string[] = [];

  for (const node of nodes) {
    if (!seenRoles.has(node.role)) {
      seenRoles.add(node.role);
      firstOccurrenceRoles.push(node.role);
    }
  }

  const traversalRoles = [...firstOccurrenceRoles].reverse();
  const totalSteps = traversalRoles.length + 1;

  const plan: BackwardPassPlan = traversalRoles.map((role, index) => {
    const nextRole = index < traversalRoles.length - 1
      ? traversalRoles[index + 1]
      : synthesisRole;
    const nextStepType = index < traversalRoles.length - 1
      ? 'meta-analysis'
      : 'synthesis';

    return {
      role,
      stepType: 'meta-analysis' as const,
      sessionInstruction: 'existing-session' as const,
      prompt: createMetaAnalysisPrompt(role, index + 1, totalSteps, nextRole, nextStepType),
    };
  });

  plan.push({
    role: synthesisRole,
    stepType: 'synthesis',
    sessionInstruction: 'new-session',
    prompt: createSynthesisPrompt(synthesisRole, totalSteps, totalSteps, recordFolderPath),
  });

  return plan;
}

export function orderWithPromptsFromFile(
  recordFolderPath: string,
  synthesisRole: string,
): BackwardPassPlan {
  const workflowFilePath = path.join(recordFolderPath, 'workflow.md');

  let content: string;
  try {
    content = fs.readFileSync(workflowFilePath, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read workflow.md at ${workflowFilePath}: ${(err as Error).message}`);
  }

  const yamlStr = extractFrontmatter(content);
  if (yamlStr === null) {
    throw new Error(`No YAML frontmatter found in ${workflowFilePath}`);
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(yamlStr);
  } catch (err) {
    throw new Error(`Invalid YAML in ${workflowFilePath}: ${(err as Error).message}`);
  }

  const frontmatter = parseRecordWorkflowFrontmatter(parsed);
  return computeBackwardPassOrder(
    frontmatter.workflow.nodes,
    synthesisRole,
    recordFolderPath,
  );
}

