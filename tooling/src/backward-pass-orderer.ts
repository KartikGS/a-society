import fs from 'node:fs';
import yaml from 'js-yaml';
import { validateWorkflowFile, WorkflowDocument } from './workflow-graph-validator.js';
import { extractFrontmatter } from './utils.js';

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

export interface TriggerPromptOptions {
  recordFolderPath?: string;  // Embedded in prompt text; receiving agent knows where to read
                              // prior artifacts and write findings. Not read by the component.
  flowName?: string;          // Human-readable description of the flow for agent context.
}

export interface BackwardPassTriggerEntry extends BackwardPassEntry {
  trigger_prompt: string;     // Copyable session-start prompt for the receiving agent.
}

/**
 * Generates per-role trigger prompts from a computed backward pass order.
 *
 * Pure function — performs no file I/O. The caller provides the order (from orderFromFile
 * or orderFromGraph) and optional context to embed in the prompts.
 *
 * Each entry in the input order receives a trigger_prompt field. Order is preserved.
 */
export function generateTriggerPrompts(
  order: BackwardPassEntry[],
  options?: TriggerPromptOptions,
): BackwardPassTriggerEntry[] {
  const total = order.length;

  return order.map((entry) => {
    const N = entry.backward_pass_position;
    let trigger_prompt: string;

    if (entry.is_synthesis) {
      const parts: string[] = [];
      parts.push(`You are the ${entry.role} agent for A-Society. Read a-society/a-docs/agents.md.`);
      parts.push(`You are performing backward pass synthesis (position ${N} of ${total} — final step).`);

      const contextLines: string[] = [];
      if (options?.flowName) contextLines.push(`Flow: ${options.flowName}`);
      if (options?.recordFolderPath) contextLines.push(`Record folder: ${options.recordFolderPath}`);
      if (contextLines.length > 0) parts.push(contextLines.join('\n'));

      parts.push('Read all findings artifacts in the record folder and produce the synthesis at the next available sequence position.');
      trigger_prompt = parts.join('\n\n');
    } else {
      const parts: string[] = [];
      parts.push(`You are the ${entry.role} agent for A-Society. Read a-society/a-docs/agents.md.`);
      parts.push('You are performing a backward pass findings review.');

      const contextLines = [`Backward pass position: ${N} of ${total}`];
      if (options?.flowName) contextLines.push(`Flow: ${options.flowName}`);
      if (options?.recordFolderPath) contextLines.push(`Record folder: ${options.recordFolderPath}`);
      parts.push(contextLines.join('\n'));

      // order[N] is the next entry: N is 1-based, so index N (0-based) is the next item
      const nextEntry = order[N];
      const synthesisSuffix = nextEntry.is_synthesis ? ' (synthesis)' : '';
      parts.push(`Read the prior artifacts in the record folder. Produce your findings at the next available sequence position. When complete, hand off to ${nextEntry.role}${synthesisSuffix}.`);
      trigger_prompt = parts.join('\n\n');
    }

    return { ...entry, trigger_prompt };
  });
}

/**
 * Reads and validates the workflow file, computes the backward pass order, and generates
 * trigger prompts — a single-call convenience wrapper.
 *
 * Equivalent to: generateTriggerPrompts(orderFromFile(filePath, firedNodeIds), options)
 */
export function orderWithPromptsFromFile(
  filePath: string,
  firedNodeIds?: string[],
  options?: TriggerPromptOptions,
): BackwardPassTriggerEntry[] {
  return generateTriggerPrompts(orderFromFile(filePath, firedNodeIds), options);
}
