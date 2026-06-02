import fs from 'node:fs';
import path from 'node:path';
import { findWorkflowFilePath, parseWorkflowFile } from '../context/workflow-file.js';
import { IMPROVEMENT_CHOICE_MODE, OWNER_BASE_ROLE_ID } from '../common/protocol-constants.js';
import type { ProtocolImprovementChoiceMode } from '../common/protocol-constants.js';
import { parseRoleIdentity } from '../common/role-id.js';

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
  stepType: 'meta-analysis' | 'feedback';
  sessionInstruction: 'existing-session' | 'new-session';
  findingsRolesToInject: string[];
}

export interface BackwardPassEdge {
  from: string;
  to: string;
}

export const FINDINGS_DIRECTORY_NAME = 'findings';

export function deterministicFindingsFilePath(
  recordFolderPath: string,
  roleName: string,
): string {
  return path.join(
    recordFolderPath,
    FINDINGS_DIRECTORY_NAME,
    `${parseRoleIdentity(roleName).instanceRoleId}-findings.md`,
  );
}

/**
 * Backward-pass execution graph. Edges point from a produced findings artifact
 * to the later meta-analysis/feedback role instance that should consume it.
 */
export interface BackwardPassPlan {
  entries: BackwardPassEntry[];
  edges: BackwardPassEdge[];
}
type BackwardPassMode = Exclude<ProtocolImprovementChoiceMode, typeof IMPROVEMENT_CHOICE_MODE.NONE>;

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
  feedbackRole: string,
  mode: BackwardPassMode,
): BackwardPassPlan {
  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));
  const feedbackRoleId = parseRoleIdentity(feedbackRole).instanceRoleId;

  if (mode === IMPROVEMENT_CHOICE_MODE.PARALLEL) {
    const roles = Array.from(new Set(nodes.map(n => parseRoleIdentity(n.role).instanceRoleId)));
    const nonOwnerRoles = roles.filter(r => parseRoleIdentity(r).instanceRoleId !== OWNER_BASE_ROLE_ID);
    const ownerRoles = roles.filter(r => parseRoleIdentity(r).instanceRoleId === OWNER_BASE_ROLE_ID);
    if (ownerRoles.length !== 1) {
      throw new Error('parallel improvement mode requires exactly one owner role');
    }
    if (roles.includes(feedbackRoleId)) {
      throw new Error('improvement feedback role must be distinct from workflow meta-analysis roles');
    }

    const toMetaAnalysisEntry = (role: string, findingsRolesToInject: string[] = []): BackwardPassEntry => ({
      role,
      stepType: 'meta-analysis',
      sessionInstruction: 'existing-session',
      findingsRolesToInject,
    });
    const nonOwnerEntries = nonOwnerRoles.map(role => toMetaAnalysisEntry(role));
    const ownerEntry = toMetaAnalysisEntry(ownerRoles[0], nonOwnerRoles);

    const feedbackEntry: BackwardPassEntry = {
      role: feedbackRoleId,
      stepType: 'feedback',
      sessionInstruction: 'new-session',
      findingsRolesToInject: [],
    };

    const edges: BackwardPassEdge[] = [
      ...nonOwnerEntries.map(entry => ({ from: entry.role, to: ownerEntry.role })),
      { from: ownerEntry.role, to: feedbackEntry.role },
    ];

    return {
      entries: [...nonOwnerEntries, ownerEntry, feedbackEntry],
      edges,
    };
  }

  // mode === graph-based
  const incomingCount = Object.fromEntries(nodes.map(n => [n.id, 0]));
  const children: Record<string, string[]> = Object.fromEntries(nodes.map(n => [n.id, []]));
  for (const node of nodes) {
    parseRoleIdentity(node.role);
  }
  for (const edge of edges) {
    if (!nodeById[edge.from] || !nodeById[edge.to]) continue;
    incomingCount[edge.to] = (incomingCount[edge.to] ?? 0) + 1;
    children[edge.from].push(edge.to);
  }

  // Step 1: Find the first workflow node for each role instance by minimum depth
  // from the workflow source. Repeated later nodes for the same role are collapsed.
  const sources = nodes.filter(n => incomingCount[n.id] === 0).map(n => n.id);
  if (sources.length !== 1) {
    throw new Error('workflow.nodes must produce exactly one source node');
  }
  const minDepth: Record<string, number> = {};
  const queue = sources.map(id => {
    minDepth[id] = 0;
    return id;
  });
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const nextDepth = minDepth[currentId] + 1;
    for (const childId of children[currentId] ?? []) {
      if (minDepth[childId] === undefined || nextDepth < minDepth[childId]) {
        minDepth[childId] = nextDepth;
        queue.push(childId);
      }
    }
  }

  const keptNodeByRole = new Map<string, WorkflowNode>();
  for (const node of nodes) {
    const role = parseRoleIdentity(node.role).instanceRoleId;
    const current = keptNodeByRole.get(role);
    const depth = minDepth[node.id] ?? Number.POSITIVE_INFINITY;
    const currentDepth = current ? (minDepth[current.id] ?? Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY;
    if (!current || depth < currentDepth) {
      keptNodeByRole.set(role, node);
    }
  }

  const keptNodeIds = new Set(Array.from(keptNodeByRole.values()).map(node => node.id));
  const roleByKeptNodeId = new Map(
    Array.from(keptNodeByRole.entries()).map(([role, node]) => [node.id, role])
  );

  // Step 2: Remove non-canonical repeated-role nodes by shortcutting through
  // them. A kept node connects to the first kept descendants reachable through
  // zero or more removed nodes.
  const forwardRoleEdges: BackwardPassEdge[] = [];
  const forwardRoleEdgeKeys = new Set<string>();
  for (const keptNode of keptNodeByRole.values()) {
    const fromRole = roleByKeptNodeId.get(keptNode.id)!;
    const seen = new Set<string>();
    const searchQueue = [...(children[keptNode.id] ?? [])];
    while (searchQueue.length > 0) {
      const candidateId = searchQueue.shift()!;
      if (seen.has(candidateId)) continue;
      seen.add(candidateId);
      if (candidateId === keptNode.id) continue;

      if (keptNodeIds.has(candidateId)) {
        const toRole = roleByKeptNodeId.get(candidateId)!;
        const key = `${fromRole}=>${toRole}`;
        if (fromRole !== toRole && !forwardRoleEdgeKeys.has(key)) {
          forwardRoleEdges.push({ from: fromRole, to: toRole });
          forwardRoleEdgeKeys.add(key);
        }
        continue;
      }

      searchQueue.push(...(children[candidateId] ?? []));
    }
  }

  // Step 3: Reverse the pruned role graph. Backward edges now mean "findings
  // from this downstream role should be injected into that upstream role."
  const metaEntriesByRole = new Map<string, BackwardPassEntry>();
  for (const [role] of keptNodeByRole) {
    metaEntriesByRole.set(role, {
      role,
      stepType: 'meta-analysis',
      sessionInstruction: 'existing-session',
      findingsRolesToInject: [],
    });
  }
  if (metaEntriesByRole.has(feedbackRoleId)) {
    throw new Error('improvement feedback role must be distinct from workflow meta-analysis roles');
  }

  const metaEdges: BackwardPassEdge[] = forwardRoleEdges.map(edge => ({
    from: edge.to,
    to: edge.from,
  }));

  const incomingByRole = new Map(Array.from(metaEntriesByRole.keys()).map(role => [role, [] as string[]]));
  for (const edge of metaEdges) {
    incomingByRole.get(edge.to)?.push(edge.from);
  }

  for (const entry of metaEntriesByRole.values()) {
    entry.findingsRolesToInject = incomingByRole.get(entry.role) ?? [];
  }

  const feedbackEntry: BackwardPassEntry = {
    role: feedbackRoleId,
    stepType: 'feedback',
    sessionInstruction: 'new-session',
    findingsRolesToInject: [],
  };
  const sourceRole = parseRoleIdentity(nodeById[sources[0]].role).instanceRoleId;
  const feedbackEdge = { from: sourceRole, to: feedbackEntry.role };

  return {
    entries: [...metaEntriesByRole.values(), feedbackEntry],
    edges: [...metaEdges, feedbackEdge],
  };
}

export function computeBackwardPassPlan(
  recordFolderPath: string,
  feedbackRole: string,
  mode: BackwardPassMode,
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
      feedbackRole,
      mode,
    );
  } catch (err) {
    throw new Error(`Cannot read workflow file at ${workflowFilePath}: ${(err as Error).message}`);
  }
}

export function locateFindingsFiles(
  recordFolderPath: string,
  roleNames: string[],
): string[] {
  const matches = roleNames
    .map(roleName => deterministicFindingsFilePath(recordFolderPath, roleName))
    .filter(filePath => fs.existsSync(filePath));

  return Array.from(new Set(matches));
}

export function locateAllFindingsFiles(
  recordFolderPath: string,
): string[] {
  const findingsFolderPath = path.join(recordFolderPath, FINDINGS_DIRECTORY_NAME);
  return (() => {
    try {
      return fs.readdirSync(findingsFolderPath)
        .filter(filename => /^[a-z0-9_-]+-findings\.md$/i.test(filename))
        .map(filename => path.join(findingsFolderPath, filename))
        .sort();
    } catch {
      return [];
    }
  })();
}
