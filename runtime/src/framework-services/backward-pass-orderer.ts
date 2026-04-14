import fs from 'node:fs';
import path from 'node:path';
import { findWorkflowFilePath, parseWorkflowFile } from '../workflow-file.js';

export interface WorkflowNode {
  id: string;
  role: string;
  'human-collaborative'?: string;
  required_readings?: string[];
  guidance?: string[];
  inputs?: string[];
  work?: string[];
  outputs?: string[];
  transitions?: string[];
  notes?: string[];
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
  findingsRolesToInject: string[];
}

/**
 * Sequential steps (outer array) containing concurrent groups (inner array).
 * Linear flows have exactly one entry in each inner array.
 */
export type BackwardPassPlan = BackwardPassEntry[][];

export function parseRecordWorkflowFrontmatter(doc: unknown): RecordWorkflowFrontmatter {
  if (!doc || typeof doc !== 'object') {
    throw new Error('workflow file must parse to an object');
  }

  const rawWorkflow = (doc as Record<string, unknown>).workflow;
  if (!rawWorkflow || typeof rawWorkflow !== 'object') {
    throw new Error('workflow file must contain a workflow object');
  }

  const workflowObj = rawWorkflow as Record<string, unknown>;

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
      required_readings: Array.isArray(nodeObj.required_readings)
        ? nodeObj.required_readings.filter((value): value is string => typeof value === 'string')
        : undefined,
      guidance: Array.isArray(nodeObj.guidance)
        ? nodeObj.guidance.filter((value): value is string => typeof value === 'string')
        : undefined,
      inputs: Array.isArray(nodeObj.inputs)
        ? nodeObj.inputs.filter((value): value is string => typeof value === 'string')
        : undefined,
      work: Array.isArray(nodeObj.work)
        ? nodeObj.work.filter((value): value is string => typeof value === 'string')
        : undefined,
      outputs: Array.isArray(nodeObj.outputs)
        ? nodeObj.outputs.filter((value): value is string => typeof value === 'string')
        : undefined,
      transitions: Array.isArray(nodeObj.transitions)
        ? nodeObj.transitions.filter((value): value is string => typeof value === 'string')
        : undefined,
      notes: Array.isArray(nodeObj.notes)
        ? nodeObj.notes.filter((value): value is string => typeof value === 'string')
        : undefined,
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

export function buildBackwardPassPlan(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  synthesisRole: string,
  mode: 'graph-based' | 'parallel',
): BackwardPassPlan {
  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));
  const hasOutgoing = new Set(edges.map(e => e.from));
  const terminalIds = nodes.map(n => n.id).filter(id => !hasOutgoing.has(id));

  if (terminalIds.length === 0) {
    throw new Error('workflow.nodes must produce at least one terminal node');
  }

  if (mode === 'parallel') {
    const roles = Array.from(new Set(nodes.map(n => n.role)));
    const metaAnalysisGroup: BackwardPassEntry[] = roles.map(role => ({
      role,
      stepType: 'meta-analysis',
      sessionInstruction: 'existing-session',
      findingsRolesToInject: [],
    }));

    const synthesisGroup: BackwardPassEntry[] = [{
      role: synthesisRole,
      stepType: 'synthesis',
      sessionInstruction: 'new-session',
      findingsRolesToInject: [],
    }];

    return [metaAnalysisGroup, synthesisGroup];
  }

  // mode === 'graph-based'

  // Step 1: Compute topological order position (BFS from sources)
  const incomingCount: Record<string, number> = {};
  const children: Record<string, string[]> = {};
  for (const node of nodes) {
    incomingCount[node.id] = 0;
    children[node.id] = [];
  }
  for (const edge of edges) {
    incomingCount[edge.to] = (incomingCount[edge.to] ?? 0) + 1;
    children[edge.from].push(edge.to);
  }

  const sources = nodes.filter(n => incomingCount[n.id] === 0).map(n => n.id);
  const topologicalOrder: string[] = [];
  const queue = [...sources];
  const processedIncoming = { ...incomingCount };

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    topologicalOrder.push(currentId);
    for (const childId of children[currentId]) {
      processedIncoming[childId]--;
      if (processedIncoming[childId] === 0) {
        queue.push(childId);
      }
    }
  }

  const nodePosition = Object.fromEntries(topologicalOrder.map((id, index) => [id, index]));

  // Step 2: First occurrence position per role
  const firstOccurrencePosition: Record<string, number> = {};
  for (const node of nodes) {
    const pos = nodePosition[node.id];
    if (pos !== undefined) {
      if (firstOccurrencePosition[node.role] === undefined || pos < firstOccurrencePosition[node.role]) {
        firstOccurrencePosition[node.role] = pos;
      }
    }
  }

  // Step 3: Direct successor roles per role
  const directSuccessorRoles: Record<string, Set<string>> = {};
  for (const edge of edges) {
    const fromRole = nodeById[edge.from].role;
    const toRole = nodeById[edge.to].role;
    if (!directSuccessorRoles[fromRole]) directSuccessorRoles[fromRole] = new Set();
    directSuccessorRoles[fromRole].add(toRole);
  }

  // Step 4: Backward pass grouping (BFS from terminals through predecessors)
  const predecessors: Record<string, string[]> = {};
  for (const edge of edges) {
    predecessors[edge.to] = [...(predecessors[edge.to] ?? []), edge.from];
  }

  const nodeDistance: Record<string, number> = {};
  const backQueue = [...terminalIds];
  terminalIds.forEach(id => { nodeDistance[id] = 0; });

  while (backQueue.length > 0) {
    const current = backQueue.shift()!;
    const dist = nodeDistance[current];
    for (const pred of (predecessors[current] ?? [])) {
      if (nodeDistance[pred] === undefined) {
        nodeDistance[pred] = dist + 1;
        backQueue.push(pred);
      }
    }
  }

  const roleMaxDistance: Record<string, number> = {};
  for (const [id, dist] of Object.entries(nodeDistance)) {
    const role = nodeById[id].role;
    roleMaxDistance[role] = Math.max(roleMaxDistance[role] ?? 0, dist);
  }

  const roleGroupsByDist: Record<number, string[]> = {};
  for (const [role, dist] of Object.entries(roleMaxDistance)) {
    roleGroupsByDist[dist] = [...(roleGroupsByDist[dist] ?? []), role];
  }

  const sortedRoleDistances = Object.keys(roleGroupsByDist).map(Number).sort((a, b) => a - b);
  const plan: BackwardPassPlan = [];

  for (const dist of sortedRoleDistances) {
    const roles = roleGroupsByDist[dist];
    const groupEntries: BackwardPassEntry[] = roles.map(role => {
      const successors = directSuccessorRoles[role] ?? new Set();
      const findingsRolesToInject = Array.from(successors).filter(s =>
        firstOccurrencePosition[s] > firstOccurrencePosition[role]
      );

      return {
        role,
        stepType: 'meta-analysis',
        sessionInstruction: 'existing-session',
        findingsRolesToInject,
      };
    });
    plan.push(groupEntries);
  }

  // Final Synthesis Step
  plan.push([{
    role: synthesisRole,
    stepType: 'synthesis',
    sessionInstruction: 'new-session',
    findingsRolesToInject: [],
  }]);

  return plan;
}

export function computeBackwardPassPlan(
  recordFolderPath: string,
  synthesisRole: string,
  mode: 'graph-based' | 'parallel',
): BackwardPassPlan {
  const workflowFilePath = findWorkflowFilePath(recordFolderPath);
  if (!workflowFilePath) {
    throw new Error(`Cannot read workflow file at ${path.join(recordFolderPath, 'workflow.yaml')}: file does not exist`);
  }

  try {
    const parsed = parseWorkflowFile(workflowFilePath);
    const frontmatter = parseRecordWorkflowFrontmatter(parsed);
    return buildBackwardPassPlan(
      frontmatter.workflow.nodes,
      frontmatter.workflow.edges,
      synthesisRole,
      mode,
    );
  } catch (err) {
    throw new Error(`Cannot read workflow file at ${workflowFilePath}: ${(err as Error).message}`);
  }
}

function normalizeRoleSlug(role: string): string {
  return role.toLowerCase().replace(/\s+/g, '-');
}

export function locateFindingsFiles(
  recordFolderPath: string,
  roleNames: string[],
): string[] {
  const filenames = (() => {
    try {
      return fs.readdirSync(recordFolderPath);
    } catch {
      return [];
    }
  })();

  const normalizedRequestedRoles = new Set(roleNames.map(normalizeRoleSlug));
  const findingsPattern = /^(\d+)[a-z]?-(.*)-findings\.md$/i;

  const matches = filenames.filter(filename => {
    const match = filename.match(findingsPattern);
    if (!match) return false;
    const roleSlug = normalizeRoleSlug(match[2]);
    return normalizedRequestedRoles.has(roleSlug);
  });

  return matches.map(filename => path.relative(process.cwd(), path.join(recordFolderPath, filename)));
}

export function locateAllFindingsFiles(
  recordFolderPath: string,
): string[] {
  const filenames = (() => {
    try {
      return fs.readdirSync(recordFolderPath);
    } catch {
      return [];
    }
  })();

  const findingsPattern = /^\d+[a-z]?-(.*)-findings\.md$/i;
  const matches = filenames.filter(filename => findingsPattern.test(filename));

  return matches.map(filename => path.relative(process.cwd(), path.join(recordFolderPath, filename)));
}
