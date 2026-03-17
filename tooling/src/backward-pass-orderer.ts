import fs from 'node:fs';
import yaml from 'js-yaml';
import { validateWorkflowFile, extractFrontmatter, WorkflowDocument } from './workflow-graph-validator.js';

export interface BackwardPassEntry {
  backward_pass_position: number;
  role: string;
  node_ids: string[];
  is_synthesis: boolean;
}

interface RoleMapEntry {
  min_position: number;
  node_ids: string[];
}

/**
 * Computes the backward pass traversal order from a parsed workflow graph.
 *
 * Algorithm:
 *   1. Separate the synthesis node (is_synthesis_role: true) from all other nodes.
 *   2. From the non-synthesis nodes (optionally filtered to firedNodeIds), deduplicate
 *      by role — keeping the minimum first_occurrence_position for each role.
 *   3. Sort deduplicated roles by first_occurrence_position ascending (forward pass order).
 *   4. Reverse — this is the findings order.
 *   5. Append the synthesis role last.
 */
export function orderFromGraph(graph: WorkflowDocument, firedNodeIds?: string[]): BackwardPassEntry[] {
  const nodes = graph.workflow.nodes;
  const fired = firedNodeIds ? new Set(firedNodeIds) : null;

  // Separate synthesis node
  const synthesisNode = nodes.find(n => n.is_synthesis_role);
  if (!synthesisNode) throw new Error('No synthesis node found (is_synthesis_role: true) in graph');

  const nonSynthesisNodes = nodes.filter(n => !n.is_synthesis_role);

  // Apply optional fired filter to non-synthesis nodes
  const activeNonSynthesis = fired
    ? nonSynthesisNodes.filter(n => fired.has(n.id))
    : nonSynthesisNodes;

  // Deduplicate by role: track min first_occurrence_position and all node ids per role
  const roleMap = new Map<string, RoleMapEntry>();
  for (const node of activeNonSynthesis) {
    const existing = roleMap.get(node.role);
    if (!existing) {
      roleMap.set(node.role, { min_position: node.first_occurrence_position, node_ids: [node.id] });
    } else {
      existing.node_ids.push(node.id);
      if (node.first_occurrence_position < existing.min_position) {
        existing.min_position = node.first_occurrence_position;
      }
    }
  }

  // Sort by min first_occurrence_position ascending, then reverse (findings order)
  const sorted = [...roleMap.entries()]
    .sort((a, b) => a[1].min_position - b[1].min_position)
    .map(([role, meta]) => ({ role, min_position: meta.min_position, node_ids: meta.node_ids }));

  const reversed = sorted.reverse();

  // Determine whether to include the synthesis node
  // Include if: no filter, OR the synthesis node id is in the fired set
  const includeSynthesis = !fired || fired.has(synthesisNode.id);

  // Build output
  const result: BackwardPassEntry[] = [];
  let position = 1;

  for (const entry of reversed) {
    result.push({
      backward_pass_position: position++,
      role: entry.role,
      node_ids: entry.node_ids,
      is_synthesis: false,
    });
  }

  if (includeSynthesis) {
    result.push({
      backward_pass_position: position,
      role: synthesisNode.role,
      node_ids: [synthesisNode.id],
      is_synthesis: true,
    });
  }

  return result;
}

/**
 * Reads, validates, and computes the backward pass traversal order from a workflow file.
 *
 * Throws if the file cannot be read, has no frontmatter, or fails schema validation.
 */
export function orderFromFile(filePath: string, firedNodeIds?: string[]): BackwardPassEntry[] {
  const { valid, errors } = validateWorkflowFile(filePath);
  if (!valid) {
    throw new Error(`Workflow graph validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const yamlStr = extractFrontmatter(content);
  const graph = yaml.load(yamlStr!) as WorkflowDocument;

  return orderFromGraph(graph, firedNodeIds);
}
