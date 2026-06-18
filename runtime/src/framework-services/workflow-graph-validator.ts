import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { parseRoleIdentity, REQUIRED_ROLE_FILES } from '../../shared/role-id.js';
import { OWNER_BASE_ROLE_ID } from '../../shared/protocol-constants.js';
import type { FlowRun } from '../common/types.js';
import { WorkflowGraph as RuntimeWorkflowGraph, parseHandoffKey } from '../../shared/workflow-graph.js';

const REQUIRED_START_NODE_ID = 'owner-intake';

export type WorkflowStateValidationInput = Pick<
  FlowRun,
  | 'runningNodes'
  | 'awaitingHumanNodes'
  | 'pendingHumanInputs'
  | 'visitedNodeIds'
  | 'completedHandoffs'
  | 'receivingHandoff'
  | 'awaitingHandoff'
>;

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

export interface WorkflowGraph {
  name: string;
  summary?: string;
  invariants?: Array<{ name: string; rule: string }>;
  escalation?: Array<{ situation: string; escalated_by: string; to: string }>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowDocument {
  workflow: WorkflowGraph;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function pushMissingStateNodeErrors(
  errors: string[],
  nodeIds: Set<string>,
  nodeReferences: Map<string, Set<string>>
): void {
  for (const [nodeId, sources] of nodeReferences) {
    if (nodeIds.has(nodeId)) continue;
    errors.push(
      `workflow state references node "${nodeId}" from ${Array.from(sources).sort().join(', ')}, but workflow.nodes does not include it`
    );
  }
}

function validateGraphAgainstFlowState(
  workflow: WorkflowGraph,
  flowState: WorkflowStateValidationInput,
  errors: string[]
): void {
  const wf = new RuntimeWorkflowGraph(workflow);
  const nodeIds = new Set(workflow.nodes.map((node) => node.id));
  const nodeById = new Map(workflow.nodes.map((node) => [node.id, node]));
  const edgeKeys = new Set(wf.edges.map((edge) => wf.edgeKey(edge.from, edge.to)));
  const nodeReferences = new Map<string, Set<string>>();

  const addNodeReference = (nodeId: string, source: string): void => {
    const sources = nodeReferences.get(nodeId) ?? new Set<string>();
    sources.add(source);
    nodeReferences.set(nodeId, sources);
  };

  for (const nodeId of flowState.runningNodes ?? []) addNodeReference(nodeId, 'runningNodes');
  for (const nodeId of Object.keys(flowState.awaitingHumanNodes ?? {})) addNodeReference(nodeId, 'awaitingHumanNodes');
  for (const nodeId of Object.keys(flowState.pendingHumanInputs ?? {})) addNodeReference(nodeId, 'pendingHumanInputs');
  for (const nodeId of flowState.visitedNodeIds ?? []) addNodeReference(nodeId, 'visitedNodeIds');
  for (const nodeId of flowState.awaitingHandoff ?? []) addNodeReference(nodeId, 'awaitingHandoff');

  const validateHandoffKeys = (
    source: 'completedHandoffs' | 'receivingHandoff',
    keys: string[]
  ): void => {
    for (const key of keys) {
      const parsed = parseHandoffKey(key);
      if (!parsed) {
        errors.push(`workflow state ${source} contains invalid handoff key "${key}"`);
        continue;
      }

      addNodeReference(parsed.from, source);
      addNodeReference(parsed.to, source);

      if (source === 'completedHandoffs') {
        if (!edgeKeys.has(key)) {
          errors.push(`workflow state completedHandoffs contains "${key}", but workflow.edges does not include that edge`);
        }
        continue;
      }

      const reverseKey = wf.edgeKey(parsed.to, parsed.from);
      if (!edgeKeys.has(key) && !edgeKeys.has(reverseKey)) {
        errors.push(
          `workflow state ${source} contains "${key}", but workflow.edges does not include either "${key}" or "${reverseKey}"`
        );
      }
    }
  };

  validateHandoffKeys('completedHandoffs', flowState.completedHandoffs ?? []);
  validateHandoffKeys('receivingHandoff', Object.keys(flowState.receivingHandoff ?? {}));

  pushMissingStateNodeErrors(errors, nodeIds, nodeReferences);

  for (const [nodeId, state] of Object.entries(flowState.awaitingHumanNodes ?? {})) {
    const node = nodeById.get(nodeId);
    if (node && node.role !== state.role) {
      errors.push(
        `workflow state awaitingHumanNodes references node "${nodeId}" with role "${state.role}", but workflow.nodes defines role "${node.role}"`
      );
    }
  }

  const receivingTargets = new Set(
    Object.keys(flowState.receivingHandoff ?? {})
      .map((key) => parseHandoffKey(key)?.to)
      .filter((nodeId): nodeId is string => Boolean(nodeId))
  );
  for (const awaitingNodeId of flowState.awaitingHandoff ?? []) {
    if (!nodeIds.has(awaitingNodeId)) continue;
    const hasIncomingEdge = workflow.edges.some((edge) => edge.to === awaitingNodeId);
    if (!hasIncomingEdge && !receivingTargets.has(awaitingNodeId)) {
      errors.push(
        `workflow state awaitingHandoff contains "${awaitingNodeId}", but workflow.edges has no inbound edge and receivingHandoff has no queued handoff for it`
      );
    }
  }
}

function findDirectedCycle(workflow: WorkflowGraph): string[] | null {
  const outgoing = new Map(workflow.nodes.map((node) => [node.id, [] as string[]]));
  for (const edge of workflow.edges) {
    outgoing.get(edge.from)?.push(edge.to);
  }

  const state = new Map<string, 'visiting' | 'visited'>();
  const stack: string[] = [];

  const visit = (nodeId: string): string[] | null => {
    const existingState = state.get(nodeId);
    if (existingState === 'visiting') {
      const cycleStart = stack.indexOf(nodeId);
      return [...stack.slice(cycleStart), nodeId];
    }
    if (existingState === 'visited') return null;

    state.set(nodeId, 'visiting');
    stack.push(nodeId);

    for (const childId of outgoing.get(nodeId) ?? []) {
      const cycle = visit(childId);
      if (cycle) return cycle;
    }

    stack.pop();
    state.set(nodeId, 'visited');
    return null;
  };

  for (const node of workflow.nodes) {
    const cycle = visit(node.id);
    if (cycle) return cycle;
  }

  return null;
}

/**
 * Validates a parsed workflow graph object against the approved schema.
 *
 * Uses runtime type checks; accepts unknown input and reports all violations.
 */
export function validateGraph(doc: unknown, rolesDir?: string, flowState: WorkflowStateValidationInput | null = null): string[] {
  const errors: string[] = [];
  const validateOptionalStringArray = (value: unknown, fieldPath: string) => {
    if (value === undefined) return;
    if (!Array.isArray(value)) {
      errors.push(`${fieldPath} must be an array of non-empty strings if present`);
      return;
    }
    value.forEach((item, index) => {
      if (typeof item !== 'string' || item.trim() === '') {
        errors.push(`${fieldPath}[${index}] must be a non-empty string`);
      }
    });
  };

  if (!doc || typeof doc !== 'object') {
    errors.push('Document is not an object');
    return errors;
  }

  // Use any for internal traversal of this runtime-validated structure
  const d = doc as any;

  if (!('workflow' in d)) {
    errors.push('Missing required field: workflow');
    return errors;
  }

  const wf = d.workflow;

  if (!wf || typeof wf !== 'object') {
    errors.push('workflow must be an object');
    return errors;
  }

  const workflowKeys = Object.keys(wf);
  const invalidWorkflowKeys = workflowKeys.filter((key) =>
    key !== 'name' &&
    key !== 'summary' &&
    key !== 'invariants' &&
    key !== 'escalation' &&
    key !== 'nodes' &&
    key !== 'edges'
  );
  if (invalidWorkflowKeys.length > 0) {
    errors.push(`workflow contains invalid keys: ${invalidWorkflowKeys.join(', ')}`);
  }

  if ('summary' in wf && (typeof wf.summary !== 'string' || wf.summary.trim() === '')) {
    errors.push('workflow.summary must be a non-empty string if present');
  }

  if ('invariants' in wf) {
    if (!Array.isArray(wf.invariants)) {
      errors.push('workflow.invariants must be an array if present');
    } else {
      wf.invariants.forEach((item: any, i: number) => {
        if (!item || typeof item !== 'object') {
          errors.push(`workflow.invariants[${i}] must be an object`);
          return;
        }
        if (typeof item.name !== 'string' || item.name.trim() === '') {
          errors.push(`workflow.invariants[${i}].name must be a non-empty string`);
        }
        if (typeof item.rule !== 'string' || item.rule.trim() === '') {
          errors.push(`workflow.invariants[${i}].rule must be a non-empty string`);
        }
      });
    }
  }

  if ('escalation' in wf) {
    if (!Array.isArray(wf.escalation)) {
      errors.push('workflow.escalation must be an array if present');
    } else {
      wf.escalation.forEach((item: any, i: number) => {
        if (!item || typeof item !== 'object') {
          errors.push(`workflow.escalation[${i}] must be an object`);
          return;
        }
        if (typeof item.situation !== 'string' || item.situation.trim() === '') {
          errors.push(`workflow.escalation[${i}].situation must be a non-empty string`);
        }
        if (typeof item.escalated_by !== 'string' || item.escalated_by.trim() === '') {
          errors.push(`workflow.escalation[${i}].escalated_by must be a non-empty string`);
        }
        if (typeof item.to !== 'string' || item.to.trim() === '') {
          errors.push(`workflow.escalation[${i}].to must be a non-empty string`);
        }
      });
    }
  }

  // workflow.name
  if (typeof wf.name !== 'string' || wf.name.trim() === '') {
    errors.push('workflow.name must be a non-empty string');
  }

  // workflow.nodes
  if (!Array.isArray(wf.nodes) || wf.nodes.length === 0) {
    errors.push('workflow.nodes must be a non-empty array');
  } else {
    const nodeIds = new Set<string>();

    wf.nodes.forEach((node: any, i: number) => {
      if (!node || typeof node !== 'object') {
        errors.push(`workflow.nodes[${i}] must be an object`);
        return;
      }
      
      const keys = Object.keys(node);
      const invalidKeys = keys.filter((k) =>
        k !== 'id' &&
        k !== 'role' &&
        k !== 'human-collaborative' &&
        k !== 'required_readings' &&
        k !== 'guidance' &&
        k !== 'inputs' &&
        k !== 'work' &&
        k !== 'outputs' &&
        k !== 'transitions' &&
        k !== 'notes'
      );
      if (invalidKeys.length > 0) {
        errors.push(`workflow.nodes[${i}] contains invalid keys: ${invalidKeys.join(', ')}`);
      }

      // id
      if (typeof node.id !== 'string' || node.id.trim() === '') {
        errors.push(`workflow.nodes[${i}].id must be a non-empty string`);
      } else if (nodeIds.has(node.id)) {
        errors.push(`workflow.nodes[${i}].id "${node.id}" is not unique`);
      } else {
        nodeIds.add(node.id);
      }
      // role
      if (typeof node.role !== 'string' || node.role.trim() === '') {
        errors.push(`workflow.nodes[${i}].role must be a non-empty string`);
      } else if (node.role !== node.role.trim()) {
        errors.push(`workflow.nodes[${i}].role must not include leading or trailing whitespace`);
      } else {
        let baseRoleId: string | null = null;
        try {
          baseRoleId = parseRoleIdentity(node.role).baseRoleId;
        } catch (error) {
          errors.push(`workflow.nodes[${i}].role ${String((error as Error).message)}`);
        }

        if (baseRoleId && rolesDir) {
          const rolePath = path.join(rolesDir, baseRoleId);
          if (!fs.existsSync(rolePath) || !fs.statSync(rolePath).isDirectory()) {
            errors.push(`workflow.nodes[${i}].role "${node.role}" (base role: "${baseRoleId}") has no matching role folder at ${rolePath}`);
          } else {
            for (const required of REQUIRED_ROLE_FILES) {
              if (!fs.existsSync(path.join(rolePath, required))) {
                errors.push(`workflow.nodes[${i}].role "${node.role}" role folder is missing required file: ${required}`);
              }
            }
          }
        }
      }
      if ('human-collaborative' in node) {
        if (
          typeof node['human-collaborative'] !== 'string' ||
          node['human-collaborative'].trim() === ''
        ) {
          errors.push(
            `workflow.nodes[${i}].human-collaborative must be a non-empty string if present`
          );
        }
      }
      validateOptionalStringArray(node.required_readings, `workflow.nodes[${i}].required_readings`);
      validateOptionalStringArray(node.guidance, `workflow.nodes[${i}].guidance`);
      validateOptionalStringArray(node.inputs, `workflow.nodes[${i}].inputs`);
      validateOptionalStringArray(node.work, `workflow.nodes[${i}].work`);
      validateOptionalStringArray(node.outputs, `workflow.nodes[${i}].outputs`);
      validateOptionalStringArray(node.transitions, `workflow.nodes[${i}].transitions`);
      validateOptionalStringArray(node.notes, `workflow.nodes[${i}].notes`);
    });

    if (typeof wf.nodes[0]?.id === 'string' && wf.nodes[0].id !== REQUIRED_START_NODE_ID) {
      errors.push(`workflow.nodes[0].id must be exactly "${REQUIRED_START_NODE_ID}" (found "${wf.nodes[0].id}")`);
    }

    // workflow.edges
    if (!Array.isArray(wf.edges)) {
      errors.push('workflow.edges must be an array');
    } else {
      wf.edges.forEach((edge: any, i: number) => {
        if (!edge || typeof edge !== 'object') {
          errors.push(`workflow.edges[${i}] must be an object`);
          return;
        }

        const keys = Object.keys(edge);
        const invalidKeys = keys.filter((k) => k !== 'from' && k !== 'to' && k !== 'artifact');
        if (invalidKeys.length > 0) {
          errors.push(`workflow.edges[${i}] contains invalid keys: ${invalidKeys.join(', ')}`);
        }

        if (typeof edge.from !== 'string' || edge.from.trim() === '') {
          errors.push(`workflow.edges[${i}].from must be a non-empty string`);
        } else if (!nodeIds.has(edge.from)) {
          errors.push(`workflow.edges[${i}].from "${edge.from}" does not match any node id`);
        }
        if (typeof edge.to !== 'string' || edge.to.trim() === '') {
          errors.push(`workflow.edges[${i}].to must be a non-empty string`);
        } else if (!nodeIds.has(edge.to)) {
          errors.push(`workflow.edges[${i}].to "${edge.to}" does not match any node id`);
        }
        if ('artifact' in edge && typeof edge.artifact !== 'string') {
          errors.push(`workflow.edges[${i}].artifact must be a string if present`);
        }
      });
    }
  }

  if (errors.length > 0) return errors;

  const workflow = wf as WorkflowGraph;

  const toIds = new Set<string>();
  const fromIds = new Set<string>();
  for (const edge of workflow.edges) {
    toIds.add(edge.to);
    fromIds.add(edge.from);
  }

  if (workflow.edges.length === 0 && workflow.nodes.length === 1) {
    if (workflow.nodes[0].role !== OWNER_BASE_ROLE_ID) {
      errors.push(`Sole node role must be exactly "owner" (found "${workflow.nodes[0].role}")`);
    }
  } else {
    const startNodes = workflow.nodes.filter((node: WorkflowNode) => !toIds.has(node.id));
    const endNodes = workflow.nodes.filter((node: WorkflowNode) => !fromIds.has(node.id));

    if (startNodes.length !== 1) {
      errors.push(`Workflow must have exactly one start node (found ${startNodes.length})`);
    }

    for (const node of startNodes) {
      if (node.id !== REQUIRED_START_NODE_ID) {
        errors.push(`Start node "${node.id}" must be exactly "${REQUIRED_START_NODE_ID}"`);
      }
      if (node.role !== OWNER_BASE_ROLE_ID) {
        errors.push(`Start node "${node.id}" must have role "owner" (found "${node.role}")`);
      }
    }

    for (const node of endNodes) {
      if (node.role !== OWNER_BASE_ROLE_ID) {
        errors.push(`End node "${node.id}" must have role "owner" (found "${node.role}")`);
      }
    }
  }

  const cycle = findDirectedCycle(workflow);
  if (cycle) {
    errors.push(`Workflow graph must be acyclic; cycle detected: ${cycle.join(' -> ')}`);
  }

  if (flowState !== null) {
    validateGraphAgainstFlowState(workflow, flowState, errors);
  }

  return errors;
}

export interface WorkflowRepairGuidance {
  operatorSummary: string;
  modelRepairMessage: string;
}

/**
 * Produces operator-visible summary and model-facing repair text for workflow validation failures.
 * Reflects the live YAML schema exactly.
 */
export function buildWorkflowRepairGuidance(errors: string[]): WorkflowRepairGuidance {
  const isParse = errors.some(e =>
    e.includes('YAML') || e.includes('Cannot read')
  );
  const operatorSummary = isParse ? 'Workflow parse failure' : 'Workflow schema invalid';
  const errorText = errors.join('; ');
  const modelRepairMessage =
    `workflow.yaml failed validation. Error(s): ${errorText}\n\n` +
    `Do not recreate the file — update it. The canonical workflow file is workflow.yaml ` +
    `with a top-level 'workflow:' key. Required structure:\n` +
    `workflow:\n` +
    `  name: <string>\n` +
    `  summary: <string>                # optional\n` +
    `  nodes:\n` +
    `    - id: owner-intake              # first node id is required\n` +
    `      role: owner                   # first node role is required\n` +
    `    - id: <string>\n` +
    `      role: <role-instance-id>      # lowercase kebab-case, optional _N suffix\n` +
    `      human-collaborative: <string>  # optional\n` +
    `      required_readings:\n` +
    `        - $VARIABLE_NAME             # optional\n` +
    `      guidance:\n` +
    `        - <string>                   # optional\n` +
    `      inputs: [<string>]             # optional\n` +
    `      work: [<string>]               # optional\n` +
    `      outputs: [<string>]            # optional\n` +
    `      transitions: [<string>]        # optional\n` +
    `      notes: [<string>]              # optional\n` +
    `  edges:\n` +
    `    - from: <node-id>\n` +
    `      to: <node-id>\n` +
    `      artifact: <string>  # optional\n` +
    `  invariants:\n` +
    `    - name: <string>               # optional\n` +
    `      rule: <string>\n` +
    `  escalation:\n` +
    `    - situation: <string>          # optional\n` +
    `      escalated_by: <string>\n` +
    `      to: <string>\n` +
    `Please fix workflow.yaml with this schema and restate your handoff.`;
  return { operatorSummary, modelRepairMessage };
}

/**
 * Thrown when workflow validation fails; carries the structured
 * errors list so the orchestrator can route to the validator-owned repair helper.
 */
export class WorkflowValidationError extends Error {
  constructor(public readonly errors: string[], public readonly filePath: string) {
    super(`Workflow validation failed: ${errors.join(', ')}`);
    this.name = 'WorkflowValidationError';
  }
}

/**
 * Validates a workflow document file against the approved workflow graph schema.
 *
 * Parses the YAML file and runs all schema checks.
 */
export function validateWorkflowFile(filePath: string, rolesDir?: string, flowState: WorkflowStateValidationInput | null = null): ValidationResult {
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return { valid: false, errors: [`Cannot read file: ${filePath} — ${(err as Error).message}`] };
  }

  let doc: unknown;
  try {
    doc = yaml.load(content);
  } catch (err) {
    return { valid: false, errors: [`YAML parse error: ${(err as Error).message}`] };
  }

  const errors = validateGraph(doc, rolesDir, flowState);
  return { valid: errors.length === 0, errors };
}
