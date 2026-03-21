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
export function validateGraph(doc: unknown): string[] {
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

  return errors;
}

/**
 * Validates a workflow document file against the approved workflow graph schema.
 *
 * Parses the YAML frontmatter from the file and runs all schema checks.
 */
export function validateWorkflowFile(filePath: string): ValidationResult {
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

  const errors = validateGraph(doc);
  return { valid: errors.length === 0, errors };
}
