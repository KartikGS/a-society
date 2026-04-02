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

/**
 * Sequential steps (outer array) containing concurrent groups (inner array).
 * Linear flows have exactly one entry in each inner array.
 */
export type BackwardPassPlan = BackwardPassEntry[][];

function createMetaAnalysisPrompt(
  role: string,
  position: number,
  total: number,
  nextRole: string,
  nextStepType: 'meta-analysis' | 'synthesis',
  concurrent: boolean,
): string {
  const lines = [
    `Next action: Perform your backward pass meta-analysis (step ${position} of ${total}).`,
    `Read: all prior artifacts in the record folder, then ### Meta-Analysis Phase in ${GENERAL_IMPROVEMENT_PATH}`,
    `Expected response: Your findings artifact at the next available sequence position in the record folder. When complete, hand off to ${nextRole} (${nextStepType}).`,
  ];

  if (concurrent) {
    lines.push(
      `Note: this step is concurrent — other roles are performing their meta-analysis in parallel. File your findings at the next available sub-labeled position (e.g., NNa-, NNb-) after reading the record folder's current contents to confirm the available slot.`
    );
  }

  return lines.join('\n\n');
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
  edges: WorkflowEdge[],
  synthesisRole: string,
  recordFolderPath: string = 'the record folder',
): BackwardPassPlan {
  // Step 1: Build predecessors map
  const predecessors: Record<string, string[]> = {};
  for (const edge of edges) {
    predecessors[edge.to] = [...(predecessors[edge.to] ?? []), edge.from];
  }

  // Step 2: Find terminal nodes (no outgoing edges)
  const hasOutgoing = new Set(edges.map(e => e.from));
  const terminalIds = nodes.map(n => n.id).filter(id => !hasOutgoing.has(id));

  if (terminalIds.length === 0) {
    // Falls back to linear first-occurrence if no edges exist or graph is malformed
    // But per spec §8: "workflow.nodes must produce at least one terminal node"
    throw new Error('workflow.nodes must produce at least one terminal node');
  }

  // Step 3: BFS from terminals through predecessor links
  const nodeDistance: Record<string, number> = {};
  const queue: string[] = [...terminalIds];
  terminalIds.forEach(id => { nodeDistance[id] = 0; });

  while (queue.length > 0) {
    const current = queue.shift()!;
    const dist = nodeDistance[current];
    for (const pred of (predecessors[current] ?? [])) {
      if (nodeDistance[pred] === undefined) {
        nodeDistance[pred] = dist + 1;
        queue.push(pred);
      }
    }
  }

  // Step 4: Compute maximum reverse distance for each role
  const nodeById: Record<string, WorkflowNode> = Object.fromEntries(nodes.map(n => [n.id, n]));
  const roleMaxDistance: Record<string, number> = {};
  
  for (const [id, dist] of Object.entries(nodeDistance)) {
    const role = nodeById[id]?.role;
    if (role) {
      roleMaxDistance[role] = Math.max(roleMaxDistance[role] ?? 0, dist);
    }
  }

  // Step 5: Group roles by their maximum distance, sort ascending
  const roleGroupsByDist: Record<number, string[]> = {};
  for (const [role, dist] of Object.entries(roleMaxDistance)) {
    roleGroupsByDist[dist] = [...(roleGroupsByDist[dist] ?? []), role];
  }
  
  const sortedRoleDistances = Object.keys(roleGroupsByDist).map(Number).sort((a, b) => a - b);
  const roleGroups: string[][] = sortedRoleDistances.map(d => roleGroupsByDist[d]);

  // Step 6: Convert to BackwardPassPlan
  const totalMetaSteps = roleGroups.reduce((acc, group) => acc + group.length, 0);
  const totalSteps = totalMetaSteps + 1;
  let currentPosition = 1;

  const plan: BackwardPassPlan = [];

  for (let i = 0; i < roleGroups.length; i++) {
    const group = roleGroups[i];
    const isConcurrent = group.length > 1;
    const groupEntries: BackwardPassEntry[] = [];

    for (const role of group) {
      // Determine what follows this group
      let nextRole: string;
      let nextStepType: 'meta-analysis' | 'synthesis';

      if (group.length > 1 && group.indexOf(role) < group.length - 1) {
        // More roles in same group
        nextRole = group[group.indexOf(role) + 1];
        nextStepType = 'meta-analysis';
      } else if (i < roleGroups.length - 1) {
        // Next group
        nextRole = roleGroups[i + 1][0];
        nextStepType = 'meta-analysis';
      } else {
        // Synthesis
        nextRole = synthesisRole;
        nextStepType = 'synthesis';
      }

      groupEntries.push({
        role,
        stepType: 'meta-analysis',
        sessionInstruction: 'existing-session',
        prompt: createMetaAnalysisPrompt(role, currentPosition, totalSteps, nextRole, nextStepType, isConcurrent),
      });
      currentPosition++;
    }
    plan.push(groupEntries);
  }

  // Final Synthesis Step
  plan.push([{
    role: synthesisRole,
    stepType: 'synthesis',
    sessionInstruction: 'new-session',
    prompt: createSynthesisPrompt(synthesisRole, totalSteps, totalSteps, recordFolderPath),
  }]);

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
    frontmatter.workflow.edges,
    synthesisRole,
    recordFolderPath,
  );
}

