# How to Create a Workflow Graph Representation

*This document is a companion to `$INSTRUCTION_WORKFLOW`. Read that document to create your project's workflow prose document. Read this document to add a machine-readable graph representation to it.*

---

## What This Is

A workflow graph representation is a machine-readable encoding of the same workflow your `workflow/main.md` already describes in prose. It captures the structure of the workflow's forward pass — structural nodes (role-owned work blocks) and edges (handoffs) — in a YAML format that programmatic tools can process without reading prose.

This is a companion to the workflow prose document, not a replacement. The prose explains the workflow to agents and humans; the graph enables tools to compute derived facts (such as backward pass traversal order) deterministically and consistently.

---

## Why It Exists

**1. Deterministic backward pass ordering.** The backward pass protocol (see `$GENERAL_IMPROVEMENT`) requires computing traversal order from workflow structure. In simple two-role workflows this is easy to derive by inspection. In complex multi-role workflows, the order is non-obvious and error-prone to derive by reading prose. The graph representation makes that order derivable from nodes and edges without storing backward-pass-only metadata in the schema.

**2. Structural legibility.** A YAML representation of the workflow structure is readable at a glance — what structural nodes exist, which roles own them, and how they connect. It complements the prose without replacing it.

---

## Where It Goes

Embed the graph representation as YAML frontmatter at the top of `workflow/main.md`, before all prose content. YAML frontmatter is delimited by triple-dashes:

```
---
[YAML content here]
---

# Workflow Document Title

...prose content...
```

Do not create a separate file for the graph representation. The graph and the prose describe the same structure and must stay in sync; co-location enforces that obligation.

---

## Schema

The workflow graph representation uses the following schema:

```yaml
workflow:
  name: [string — the graph name; copy from workflow/main.md "Graph:" line, or use the document title]
  nodes:
    - id: [string — unique identifier for this structural node]
      role: [string — role name exactly as declared in agents.md]
  edges:
    - from: [string — node id]
      to: [string — node id]
      artifact: [string, optional — artifact type produced at this handoff, e.g. approval-decision]
```

---

## Field Definitions

### `workflow.name`

The graph name. Use the value from the "Graph:" line in your `workflow/main.md` if present, or the document title if not. This is a human-readable label, not a machine key.

### `workflow.nodes`

One entry per structural node in the forward pass. A structural node is one contiguous block of work owned by one role. If the same role performs adjacent work with no intervening handoff, model it as one node.

**`id`** — a unique identifier for this node. Convention: combine the role (lowercase) and the structural step, hyphenated (e.g., `owner-intake`, `curator-proposal`, `owner-review`).

**`role`** — the role name as declared in `agents.md`, exactly.

### `workflow.edges`

One entry per handoff between nodes. `from` and `to` are node ids. The `artifact` field is optional — include it when the handoff is carried by a named artifact type. The specific filename may vary per instance; the artifact field names the type, not the instance.

For branching (e.g., an Approved branch and a Revise branch from the same review node), add one edge per branch, all with the same `from` node.

---

## How to Fill It In

**Step 1 — List the nodes.** Read the workflow in forward-pass order. Create one node per structural handoff unit. If the same role performs adjacent work with no intervening handoff, keep that work in one node.

**Step 2 — List the edges.** For each handoff in your workflow document, add an edge. Add the artifact name if the handoff is carried by a named artifact type. Add branching edges where the workflow branches.

**Step 3 — Validate and verify.** If your project has a workflow graph validator, run it to confirm the frontmatter schema is valid. If your project has a Backward Pass Orderer, use it to confirm the backward pass order implied by the graph matches the backward pass order stated in your workflow prose. If no such tooling exists, compare the backward pass section of your workflow document against `$GENERAL_IMPROVEMENT` and confirm the prose order is consistent with the graph structure.

---

## Maintenance Rules

The following rules govern the graph frontmatter you created following this instruction. When updating your workflow prose, consult this section to determine whether the graph requires a corresponding update.

**Update the graph when:**
- A structural node is added, removed, renamed, or reassigned to a different role
- A handoff path is added, removed, or redirected
- A significant handoff artifact type is added or renamed

**Do not update the graph for:**
- Prose phase names or explanatory text that do not change the node/edge structure
- Invariants, session model details, or escalation rules — these are not captured in the graph

When you update the workflow prose in a way that changes the graph structure, update the frontmatter in the same edit. They are a co-maintained pair: a prose change that restructures the workflow without updating the graph leaves them out of sync.

---

## Relationship to the Prose Document

The graph frontmatter and the prose document describe the same workflow from different angles:

- The prose explains what happens at each phase, what decisions are made, and why.
- The graph captures structure: what structural nodes exist, which role owns each, and how they connect.

If they disagree, the prose governs — it was written first and carries explanatory context the graph cannot. Update the graph to match the prose, not the reverse.

---

## What the Graph Does NOT Capture

The graph captures structure, not behavior or rationale:

- Not captured: invariants, escalation rules, session model details, artifact content requirements
- Not captured: backward-pass-only rules such as synthesis responsibility or traversal policy
- Not captured: the reasoning behind the workflow design
- Not captured: conditional branching logic beyond the bare existence of the branch edge

These all belong in the prose workflow document.
