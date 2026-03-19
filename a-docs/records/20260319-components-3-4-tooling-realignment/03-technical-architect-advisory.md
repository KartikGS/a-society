# Technical Architect Advisory: Components 3 and 4 Tooling Realignment

**Author:** Technical Architect
**Date:** 2026-03-19
**Subject:** Resolving Component 3 & 4 dependencies on simplified workflow graph schema

---

## 1. Automation Boundary & Strategy

The removal of `first_occurrence_position` and `is_synthesis_role` from the workflow graph physical schema shifts the boundary of what the graph representation explicitly declares versus what the tooling must programmatically infer or receive at invocation.

This advisory realigns Component 3 (Workflow Graph Validator) and Component 4 (Backward Pass Orderer) to operate reliably on the simplified node-and-edge schema without losing determinism.

---

## 2. Component 3: Workflow Graph Validator Updates

Component 3 must enforce the simplified schema defined in `$INSTRUCTION_WORKFLOW_GRAPH`, ensuring no obsolete fields are validated.

**Validation Logic Updates:**
- **Remove** schema requirements for `first_occurrence_position` and `is_synthesis_role` on nodes.
- **Enforce** that `workflow.nodes` is an array of objects containing precisely `id` (string) and `role` (string).
- **Enforce** that `workflow.edges` is an array of objects containing precisely `from` (string), `to` (string), and optionally `artifact` (string).
- **Verify Referential Integrity:** Ensure every `from` and `to` value in `edges` matches an `id` present in the `nodes` array.

---

## 3. Component 4: Ordering Logic Resolution

**Question:** How is the backward-pass ordering derived programmatically without `first_occurrence_position`?
**Resolution:** The algorithm will use **node-list position (array index mapping)**.

*Rationale:* The graph instruction explicitly mandates: *"List the nodes. Read the workflow in forward-pass order."* Therefore, the YAML array order is architecturally guaranteed to represent the forward-pass structural execution order. There is no need for complex edge traversal (like topological sort or BFS), which could introduce fragility involving revision loops.

**Logic Specification:**
1. Iterate over the `workflow.nodes` array sequentially.
2. For each unique `role`, record its index `i` at its *first appearance* in the array. This index implicitly represents its `first_occurrence_position`.
3. Sort the recorded roles descending by their recorded index.
4. The resulting array of roles perfectly represents the deterministic backward pass order.

---

## 4. Component 4: Revised Interfaces

The TypeScript interfaces for `tooling/src/backward-pass-orderer.ts` must be updated to match the simplified schema and newly decoupled synthesis parameter.

```typescript
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
```

---

## 5. Component 4: Trigger Prompts & Synthesis

**Question:** Does the `generateTriggerPrompts` contract need restatement now that `is_synthesis` is removed from the schema? How does the tool correctly identify the synthesis role (and handle synthesis-absent cases)?

**Restatement of the `generateTriggerPrompts` Contract:**
With `is_synthesis_role` removed from the graph schema, synthesis identification is decoupled from the workflow structure and moves up to the integration/invocation layer.

The tool correctly handles synthesis via the `synthesisRole?` invocation parameter:
- **Synthesis-Present Case:** When the invoking agent provides the `synthesisRole` argument, Component 4 generates standard handoff prompts for all roles, but injects the terminal synthesis instructions into the specific prompt for that given role.
- **Synthesis-Absent Case:** If `synthesisRole` is omitted, Component 4 treats the workflow as a standard backward pass without a synthesis aggregator. It generates standard handoff prompts for all roles backward through the list. 

This safely resolves the synthesis-absent guard failure, pushing synthesis responsibility to the agent's contextual invocation rather than enforcing it at the rigid schema level.
