import fs from 'node:fs';
import yaml from 'js-yaml';
import { extractFrontmatter } from './utils.js';

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

export interface WorkflowGraph {
  name: string;
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateGraph(doc: unknown, strict?: boolean): string[] {
  const errors: string[] = [];

  if (!doc || typeof doc !== 'object') {
    errors.push('Document is not an object');
    return errors;
  }

  // Use any for internal traversal of this runtime-validated structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // workflow.name
  if (typeof wf.name !== 'string' || wf.name.trim() === '') {
    errors.push('workflow.name must be a non-empty string');
  }

  // workflow.nodes
  if (!Array.isArray(wf.nodes) || wf.nodes.length === 0) {
    errors.push('workflow.nodes must be a non-empty array');
  } else {
    const nodeIds = new Set<string>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wf.nodes.forEach((node: any, i: number) => {
      if (!node || typeof node !== 'object') {
        errors.push(`workflow.nodes[${i}] must be an object`);
        return;
      }
      
      const keys = Object.keys(node);
      const invalidKeys = keys.filter((k) => k !== 'id' && k !== 'role' && k !== 'human-collaborative');
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
    });

    // workflow.edges
    if (!Array.isArray(wf.edges)) {
      errors.push('workflow.edges must be an array');
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // 2. Strict checks: Owner at start and end
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
      // General case: Any node with no incoming/outgoing edges must be Owner if it's a start/end
      const startNodes = workflow.nodes.filter((node: WorkflowNode) => !toIds.has(node.id));
      const endNodes = workflow.nodes.filter((node: WorkflowNode) => !fromIds.has(node.id));

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
 * Reflects the live schema exactly: node keys are id, role, human-collaborative;
 * edge keys are from, to, artifact; no description field.
 */
export function buildWorkflowRepairGuidance(errors: string[]): WorkflowRepairGuidance {
  const isParse = errors.some(e =>
    e.includes('YAML') || e.includes('frontmatter') || e.includes('Cannot read')
  );
  const operatorSummary = isParse ? 'Workflow parse failure' : 'Workflow schema invalid';
  const errorText = errors.join('; ');
  const modelRepairMessage =
    `workflow.md failed validation. Error(s): ${errorText}\n\n` +
    `Do not recreate the file — update it. The workflow.md must contain YAML frontmatter ` +
    `(between --- delimiters) with a top-level 'workflow:' key. Required structure:\n` +
    `---\n` +
    `workflow:\n` +
    `  name: <string>\n` +
    `  nodes:\n` +
    `    - id: <string>\n` +
    `      role: <string>\n` +
    `      human-collaborative: <string>  # optional\n` +
    `  edges:\n` +
    `    - from: <node-id>\n` +
    `      to: <node-id>\n` +
    `      artifact: <string>  # optional\n` +
    `---\n` +
    `Please fix workflow.md with this schema and restate your handoff.`;
  return { operatorSummary, modelRepairMessage };
}

/**
 * Thrown by ToolTriggerEngine when START validation fails; carries the structured
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
 * Parses the YAML frontmatter from the file and runs all schema checks.
 */
export function validateWorkflowFile(filePath: string, strict?: boolean): ValidationResult {
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return { valid: false, errors: [`Cannot read file: ${filePath} — ${(err as Error).message}`] };
  }

  const yamlStr = extractFrontmatter(content);
  if (yamlStr === null) {
    return { valid: false, errors: ['No YAML frontmatter found (expected content between --- delimiters at start of file)'] };
  }

  let doc: unknown;
  try {
    doc = yaml.load(yamlStr);
  } catch (err) {
    return { valid: false, errors: [`YAML parse error: ${(err as Error).message}`] };
  }

  const errors = validateGraph(doc, strict);
  return { valid: errors.length === 0, errors };
}
