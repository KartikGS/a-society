import fs from 'node:fs';
import yaml from 'js-yaml';

export interface WorkflowGraphNode {
  id: string;
  role: string;
}

export interface WorkflowGraphEdge {
  from: string;
  to: string;
  artifact?: string;
}

export interface WorkflowGraph {
  workflow: {
    name: string;
    nodes: WorkflowGraphNode[];
    edges: WorkflowGraphEdge[];
  };
}

export interface BackwardPassOrderer {
  /**
   * Computes the backward pass execution order using node-list position derivation.
   */
  computeBackwardPassOrder(graph: WorkflowGraph): string[];

  /**
   * Generates trigger prompts for the backward pass protocol.
   * @param graph The validated workflow graph.
   * @param synthesisRole Optional. If provided, injects synthesis-specific instructions for this role.
   */
  generateTriggerPrompts(graph: WorkflowGraph, synthesisRole?: string): Record<string, string>;
}

export const backwardPassOrderer: BackwardPassOrderer = {
  computeBackwardPassOrder(graph: WorkflowGraph): string[] {
    const rolesSet = new Set<string>();
    const orderedRoles: string[] = [];

    // Array index implicitly represents first occurrence.
    // We iterate sequentially, keeping the first appearance.
    for (const node of graph.workflow.nodes) {
      if (!rolesSet.has(node.role)) {
        rolesSet.add(node.role);
        orderedRoles.push(node.role);
      }
    }

    // Sort descending by first appearance index is equivalent to reversing the array.
    return orderedRoles.reverse();
  },

  generateTriggerPrompts(graph: WorkflowGraph, synthesisRole?: string): Record<string, string> {
    const order = this.computeBackwardPassOrder(graph);
    const prompts: Record<string, string> = {};
    const total = order.length;

    for (let i = 0; i < order.length; i++) {
      const position = i + 1; // 1-based index in the reversed order
      const role = order[i];
      const isSynthesis = role === synthesisRole;
      const nextRole = order[i + 1]; // Undefined for the last role

      const parts: string[] = [];
      parts.push(`You are the ${role} agent for A-Society. Read a-society/a-docs/agents.md.`);

      if (isSynthesis) {
        parts.push(`You are performing backward pass synthesis (position ${position} of ${total} — final step).`);
        parts.push('Read all findings artifacts in the record folder and produce the synthesis at the next available sequence position.');
      } else {
        parts.push('You are performing a backward pass findings review.');
        parts.push(`Backward pass position: ${position} of ${total}`);
        
        let handoff = '';
        if (nextRole) {
          handoff = `hand off to ${nextRole}`;
          if (nextRole === synthesisRole) {
            handoff += ' (synthesis)';
          }
        } else {
          handoff = 'process is complete'; // Default when there's no next role
        }

        parts.push(`Read the prior artifacts in the record folder. Produce your findings at the next available sequence position. When complete, ${handoff}.`);
      }

      prompts[role] = parts.join('\n\n');
    }

    return prompts;
  }
};
