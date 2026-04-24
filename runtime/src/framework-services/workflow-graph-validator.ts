import fs from 'node:fs';
import yaml from 'js-yaml';

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
  use_when?: string;
  companion_docs?: string[];
  invariants?: Array<{ name: string; rule: string }>;
  escalation?: Array<{ situation: string; escalated_by: string; to: string }>;
  session_model?: string[];
  forward_pass_closure?: string[];
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

/**
 * Validates a parsed workflow graph object against the approved schema.
 *
 * Uses runtime type checks; accepts unknown input and reports all violations.
 */
export function validateGraph(doc: unknown, strict?: boolean): string[] {
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
    key !== 'use_when' &&
    key !== 'companion_docs' &&
    key !== 'invariants' &&
    key !== 'escalation' &&
    key !== 'session_model' &&
    key !== 'forward_pass_closure' &&
    key !== 'nodes' &&
    key !== 'edges'
  );
  if (invalidWorkflowKeys.length > 0) {
    errors.push(`workflow contains invalid keys: ${invalidWorkflowKeys.join(', ')}`);
  }

  if ('summary' in wf && (typeof wf.summary !== 'string' || wf.summary.trim() === '')) {
    errors.push('workflow.summary must be a non-empty string if present');
  }
  if ('use_when' in wf && (typeof wf.use_when !== 'string' || wf.use_when.trim() === '')) {
    errors.push('workflow.use_when must be a non-empty string if present');
  }
  validateOptionalStringArray(wf.companion_docs, 'workflow.companion_docs');
  validateOptionalStringArray(wf.session_model, 'workflow.session_model');
  validateOptionalStringArray(wf.forward_pass_closure, 'workflow.forward_pass_closure');

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

  // 1. Unconditional check: No neighboring same-role nodes
  const nodeIdToRole = new Map<string, string>();
  for (const node of workflow.nodes) {
    nodeIdToRole.set(node.id, node.role);
  }

  for (let i = 0; i < workflow.edges.length; i++) {
    const edge = workflow.edges[i];
    const fromRole = nodeIdToRole.get(edge.from);
    const toRole = nodeIdToRole.get(edge.to);

    if (fromRole && toRole && fromRole === toRole) {
      errors.push(`Invalid edge [${i}]: neighboring nodes "${edge.from}" and "${edge.to}" both share the same role "${fromRole}"`);
    }
  }

  // 2. Strict checks: unique Owner start node; Owner at end
  if (strict) {
    const toIds = new Set<string>();
    const fromIds = new Set<string>();
    for (const edge of workflow.edges) {
      toIds.add(edge.to);
      fromIds.add(edge.from);
    }

    if (workflow.edges.length === 0 && workflow.nodes.length === 1) {
      // Sole node case
      if (workflow.nodes[0].role !== 'Owner') {
        errors.push(`Strict mode violation: sole node role must be "Owner" (found "${workflow.nodes[0].role}")`);
      }
    } else {
      // General case: workflow must have exactly one start node, and it must be Owner.
      const startNodes = workflow.nodes.filter((node: WorkflowNode) => !toIds.has(node.id));
      const endNodes = workflow.nodes.filter((node: WorkflowNode) => !fromIds.has(node.id));

      if (startNodes.length !== 1) {
        errors.push(
          `Strict mode violation: workflow must have exactly one start node (found ${startNodes.length})`
        );
      }

      for (const node of startNodes) {
        if (node.role !== 'Owner') {
          errors.push(
            `Strict mode violation: start node "${node.id}" must have role "Owner" (found "${node.role}")`
          );
        }
      }

      for (const node of endNodes) {
        if (node.role !== 'Owner') {
          errors.push(
            `Strict mode violation: end node "${node.id}" must have role "Owner" (found "${node.role}")`
          );
        }
      }
    }
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
    `  use_when: <string>               # optional\n` +
    `  companion_docs:\n` +
    `    - $VARIABLE_NAME               # optional\n` +
    `  nodes:\n` +
    `    - id: <string>\n` +
    `      role: <string>\n` +
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
    `  session_model: [<string>]        # optional\n` +
    `  forward_pass_closure: [<string>] # optional\n` +
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
export function validateWorkflowFile(filePath: string, strict?: boolean): ValidationResult {
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

  const errors = validateGraph(doc, strict);
  return { valid: errors.length === 0, errors };
}
