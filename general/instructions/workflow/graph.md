# How to Create a Workflow Graph Representation

*This document is a companion to `$INSTRUCTION_WORKFLOW`. Read that document to create your project's workflow prose document. Read this document to add a machine-readable graph representation to it.*

---

## What This Is

A workflow graph representation is a machine-readable encoding of the same workflow your `workflow/main.md` already describes in prose. It captures the structure of the workflow — phases, nodes (role firings), edges (handoffs), first-occurrence order, and which role is the synthesis role — in a YAML format that programmatic tools can process without reading prose.

This is a companion to the workflow prose document, not a replacement. The prose explains the workflow to agents and humans; the graph enables tools to compute derived facts (such as backward pass traversal order) deterministically and consistently.

---

## Why It Exists

**1. Deterministic backward pass ordering.** The backward pass protocol (see `$INSTRUCTION_IMPROVEMENT`) requires computing traversal order from a workflow's role structure: roles in reverse first-occurrence order, synthesis role always last. In simple two-role workflows this is easy to derive by inspection. In complex multi-role workflows, the order is non-obvious and error-prone to derive by reading prose. The graph representation makes backward pass order computable without agent judgment.

**2. Structural legibility.** A YAML representation of the workflow structure is readable at a glance — what phases exist, what roles fire, in what order, and how they connect. It complements the prose without replacing it.

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
  phases:
    - id: [string — lowercase-hyphenated identifier, e.g. phase-1, review, registration]
      name: [string — human-readable phase name matching workflow/main.md]
  nodes:
    - id: [string — unique identifier; combine role and phase, e.g. owner-phase-1, curator-phase-3]
      role: [string — role name exactly as declared in agents.md]
      phase: [string — the phase id this firing belongs to]
      first_occurrence_position: [integer — 1-based; position at which this role first fires in the forward pass]
      is_synthesis_role: [boolean — true for exactly one node: the synthesis role's final firing]
  edges:
    - from: [string — node id]
      to: [string — node id]
      artifact: [string, optional — artifact type produced at this handoff, e.g. approval-decision]
```

---

## Field Definitions

### `workflow.name`

The graph name. Use the value from the "Graph:" line in your `workflow/main.md` if present, or the document title if not. This is a human-readable label, not a machine key.

### `workflow.phases`

One entry per phase in the workflow, in forward-pass order. `id` is a lowercase-hyphenated machine identifier; `name` is the human-readable phase name from the workflow document.

### `workflow.nodes`

One entry per role firing — each distinct occurrence of a role performing work in a specific phase. Multiple firings of the same role in different phases are separate nodes.

**`id`** — a unique identifier for this node. Convention: combine the role (lowercase) and the phase id, hyphenated. If a role fires multiple times within the same phase (e.g., once for findings and once for synthesis), append a suffix to distinguish them (e.g., `curator-phase-5-findings`, `curator-phase-5-synthesis`).

**`role`** — the role name as declared in `agents.md`, exactly.

**`phase`** — the `id` of the phase this node belongs to.

**`first_occurrence_position`** — the 1-based integer position at which this role *first* appears in the forward pass sequence of the workflow. Count distinct roles in the order they first fire:

- The role that first fires in the workflow gets position 1.
- The next new role to fire gets position 2.
- And so on.

A role that fires multiple times in different phases retains its original position value in all its nodes — the position is the first-occurrence position, not the position of this specific firing.

**`is_synthesis_role`** — set to `true` on exactly one node: the synthesis role's final firing. The synthesis role always produces backward pass synthesis last, regardless of its `first_occurrence_position`. All other nodes set this to `false`. See `$INSTRUCTION_IMPROVEMENT` for the definition of synthesis role and the backward pass ordering rule.

### `workflow.edges`

One entry per handoff between nodes. `from` and `to` are node ids. The `artifact` field is optional — include it when the handoff is carried by a named artifact type. The specific filename may vary per instance; the artifact field names the type, not the instance.

For branching (e.g., an Approved branch and a Revise branch from the same review node), add one edge per branch, all with the same `from` node.

---

## How to Fill It In

**Step 1 — List the phases.** Copy from your workflow document, in forward-pass order. Assign each a lowercase-hyphenated `id`.

**Step 2 — List the nodes.** Read each phase in forward-pass order. For each phase, identify which role(s) fire. Create one node per role firing per phase. Assign `first_occurrence_position` values by counting: the first role to fire across the whole workflow gets 1, the next new role gets 2, and so on.

**Step 3 — Designate the synthesis role.** Identify the role that produces synthesis in the backward pass (always fires last). Set `is_synthesis_role: true` on that role's final firing node. A workflow has exactly one synthesis role. Set to `false` on all others.

**Step 4 — List the edges.** For each handoff in your workflow document, add an edge. Add the artifact name if the handoff is carried by a named artifact type. Add branching edges where the workflow branches.

**Step 5 — Verify backward pass order.** Sort distinct roles by `first_occurrence_position` ascending. Reverse the list. The synthesis role moves to the end. This should match the backward pass order in your workflow document. Correct the graph if it does not.

---

## Maintenance Rules

The following rules govern the graph frontmatter you created following this instruction. When updating your workflow prose, consult this section to determine whether the graph requires a corresponding update.

**Update the graph when:**
- A phase is added, removed, or renamed
- A role's participation in the workflow changes (new role added, role removed, or phase assignment changes)
- The synthesis role changes
- A significant handoff artifact type is added or renamed

**Do not update the graph for:**
- Prose edits that do not change the structural shape of the workflow (adding explanation, clarifying invariants, updating escalation rules)
- Invariants, session model details, or escalation rules — these are not captured in the graph

When you update the workflow prose in a way that changes the graph structure, update the frontmatter in the same edit. They are a co-maintained pair: a prose change that restructures the workflow without updating the graph leaves them out of sync.

---

## Relationship to the Prose Document

The graph frontmatter and the prose document describe the same workflow from different angles:

- The prose explains what happens at each phase, what decisions are made, and why.
- The graph captures structure: what phases exist, who fires in each, in what order, and how nodes connect.

If they disagree, the prose governs — it was written first and carries explanatory context the graph cannot. Update the graph to match the prose, not the reverse.

---

## What the Graph Does NOT Capture

The graph captures structure, not behavior or rationale:

- Not captured: invariants, escalation rules, session model details, artifact content requirements
- Not captured: the reasoning behind the workflow design
- Not captured: conditional branching logic beyond the bare existence of the branch edge

These all belong in the prose workflow document.
