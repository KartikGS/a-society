# Proposal: Workflow schema unification — Framework Dev phase (4 files)

**Flow ID:** `20260329-workflow-schema-unification`
**Status:** PROPOSED
**Date:** 2026-03-29

---

## Content Changes

### Item 1 — `$A_SOCIETY_RECORDS` (`a-society/a-docs/records/main.md`)

**Change 1a — Replace schema block.**
Replace lines 61–68:
```yaml
61: ```yaml
62: ---
63: workflow:
64:   path:
65:     - role: <string>         # Role name (parsed by Component 4)
66:       phase: <string>        # Phase descriptor (human orientation; not parsed by Component 4)
67: ---
68: ```
```
with:
```yaml
```yaml
---
workflow:
  name: <string>             # Permanent workflow name; include flow identifier when helpful
  nodes:
    - id: <string>           # Unique node identifier
      role: <string>         # Role name (parsed by Component 4)
      human-collaborative: <string>  # Optional; non-empty string describing required human input
  edges:
    - from: <string>         # Node id
      to: <string>           # Node id
      artifact: <string>     # Optional; artifact type carried by this handoff
---
```
```

**Change 1b — Update "What Component 4 reads from it."**
Replace line 80:
```markdown
80: **What Component 4 reads from it:** `workflow.path[].role`. The `phase` field is present for human orientation and is not parsed by Component 4.
```
with:
```markdown
**What Component 4 reads from it:** `workflow.nodes[].role` and the graph structure in `workflow.nodes[].id` + `workflow.edges`. The `human-collaborative` field is present for human orientation and is not parsed by Component 4.
```

**Change 1c — Update completeness obligation sentence.**
Replace the sentence on lines 74–75 (specifically the specified clause):
```markdown
74: **Completeness obligation:** When populating `workflow.md` at intake, the Owner must list every role step they expect, including intermediate Owner review and approval checkpoints between roles. If the Owner will review or approve work before the next non-Owner role acts, that checkpoint must appear as its own Owner entry in `workflow.md`. For example, `TA - Advisory` must be followed by `Owner - TA Review` when the Owner reviews the advisory before the Curator proceeds. No Owner checkpoint may be omitted because it was implied. Silent checkpoints produce `workflow.md` paths that do not match the flow that actually ran, which corrupt backward pass ordering.
```
with:
```markdown
**Completeness obligation:** When populating `workflow.md` at intake, the Owner must list every role step they expect, including intermediate Owner review and approval checkpoints between roles. If the Owner will review or approve work before the next non-Owner role acts, that checkpoint must appear as its own Owner node in `workflow.md`, with an incoming edge from the preceding node and an outgoing edge to the following node. For example, `TA - Advisory` must be followed by an `Owner - TA Review` node when the Owner reviews the advisory before the Curator proceeds. No Owner checkpoint may be omitted because it was implied. Silent checkpoints produce `workflow.md` paths that do not match the flow that actually ran, which corrupt backward pass ordering.
```

**Change 1d — Update "Relationship to the plan's `path` field."**
Replace lines 85 and 87:
```markdown
85: - **`workflow.md` path** — machine-readable schema parsed by Component 4. Structured `role` and `phase` fields. Used to compute backward pass traversal order.
...
87: When creating `workflow.md` at intake, populate it from the plan's `path`. The roles listed must be consistent between the two. `workflow.md` is the authoritative source for programmatic backward pass ordering; the plan's `path` governs human-oriented planning only.
```
with:
```markdown
- **`workflow.md`** — machine-readable graph parsed by Component 4. Structured nodes and edges. Used to compute backward pass traversal order.
...
When creating `workflow.md` at intake, derive the node list and edge structure from the plan's `path`. Each step in the plan's path corresponds to a node; the sequencing and branching structure of the workflow imply the edges. Roles must be consistent between the two representations. `workflow.md` is the authoritative source for programmatic backward pass ordering; the plan's `path` governs human-oriented planning only.
```

---

### Item 2 — `$INSTRUCTION_RECORDS` (`a-society/general/instructions/records/main.md`)

**Change 2a — Replace schema block.**
Replace lines 72–80:
```yaml
72: ```yaml
73: ---
74: workflow:
75:   synthesis_role: <string>   # The role that performs backward pass synthesis
76:   path:
77:     - role: <string>         # Role name
78:       phase: <string>        # Phase descriptor (human orientation only)
79: ---
80: ```
```
with:
```yaml
```yaml
---
workflow:
  name: <string>             # Permanent workflow name; include flow identifier when helpful
  nodes:
    - id: <string>           # Unique node identifier
      role: <string>         # Role name (for backward pass ordering)
      human-collaborative: <string>  # Optional; non-empty string describing required human input
  edges:
    - from: <string>         # Node id
      to: <string>           # Node id
      artifact: <string>     # Optional; artifact type carried by this handoff
---
```

*Schema is defined in `$INSTRUCTION_WORKFLOW_GRAPH`. Record-folder `workflow.md` uses the same nodes/edges schema as permanent workflow graphs, instantiated as a flow-specific subgraph covering only the nodes and edges the flow traverses.*
```

**Change 2b — Update "What the orderer reads from it."**
Replace line 92:
```markdown
92: **What the orderer reads from it:** The `synthesis_role` field and the `role` entries in the `path` list. The `phase` field is for human orientation and is not parsed programmatically.
```
with:
```markdown
**What the orderer reads from it:** `workflow.nodes[].role` and the graph structure in `workflow.nodes[].id` + `workflow.edges`. The `human-collaborative` and `artifact` fields are for human orientation and are not parsed programmatically.
```

**Change 2c — Update Step 2 sentence about workflow.md schema.**
Replace the second half of line 146:
```markdown
146: ...If the project will use a Backward Pass Orderer tool, also declare `workflow.md` as a non-sequenced artifact created at intake alongside the workflow plan. Document its schema, authoring authority, and the tool that reads it in the project's `records/main.md`.
```
with:
```markdown
If the project will use a Backward Pass Orderer tool, also declare `workflow.md` as a non-sequenced artifact created at intake alongside the workflow plan. The schema is defined in `$INSTRUCTION_WORKFLOW_GRAPH` — record-folder `workflow.md` uses the same nodes/edges schema as permanent workflow graphs, instantiated as a flow-specific subgraph covering only the nodes and edges the flow traverses. Document the authoring authority and the tool that reads it in the project's `records/main.md`.
```

**Change 2d — Update completeness obligation sentence.**
Replace the specified clause on line 86:
```markdown
86: ...that checkpoint must appear as its own intake-role entry in `workflow.md`. For example, if a project's workflow includes `RoleA - Deliverable` and the intake role reviews that deliverable before `RoleB` proceeds, `IntakeRole - RoleA Review` must appear as a distinct entry.
```
with:
```markdown
...that checkpoint must appear as its own intake-role node in `workflow.md`, with an incoming edge from the preceding node and an outgoing edge to the following node. For example, if a project's workflow includes `RoleA - Deliverable` and the intake role reviews...
```

---

### Item 3 — `$INSTRUCTION_WORKFLOW_GRAPH` (`a-society/general/instructions/workflow/graph.md`)

**Change 3 — Additive: new section at end of file.**
Append after line 132:
```markdown

---

## Record-Folder workflow.md — Subgraph Variant

Projects that maintain per-flow record folders and use a Backward Pass Orderer tool create a `workflow.md` in each record folder alongside the sequenced artifacts. This file uses the same nodes/edges schema defined in this document, with one key difference: it is a **flow-specific subgraph** — it captures only the nodes and edges the flow actually traverses, not the full workflow.

**When to use this.** When your project uses a Backward Pass Orderer tool and records flow artifacts in per-flow record folders (see `$INSTRUCTION_RECORDS`). Projects without such tooling do not need `workflow.md` in record folders.

**Schema.** Same as the permanent workflow graph schema above. `workflow.name` should reflect the permanent workflow name; include the flow identifier when helpful.

**Who creates it.** The role that performs flow intake, at the same time as the workflow plan artifact, before any sequenced artifacts are created.

**What it captures.** Only the nodes the flow traverses and the edges between them. If the full permanent workflow has five nodes but this flow only traverses three, include only those three nodes and their connecting edges. Include branching edges (e.g., a revise loop) if the flow may take that branch.

**What the orderer reads.** `workflow.nodes[].id`, `workflow.nodes[].role`, and `workflow.edges` — the same fields as from a permanent workflow graph — to compute backward pass traversal order specific to this flow instance.

**Relationship to the permanent workflow graph.** The permanent workflow document describes the full workflow structure any flow traversal may follow. The record-folder `workflow.md` scopes that structure to what this flow actually traverses. Both use the same schema; they are not the same artifact. When they disagree, the permanent workflow document governs — it is the maintained source. The record-folder `workflow.md` is a historical artifact for this flow.

**Maintenance.** Record-folder `workflow.md` files are created once at intake and are not modified unless the flow's path changes mid-flow, which requires explicit workflow-authority approval. Unlike the permanent workflow graph, they are not updated as the framework evolves — they record what actually ran.
```

---

### Item 4 — `$A_SOCIETY_TOOLING_COUPLING_MAP` (`a-society/a-docs/tooling/general-coupling-map.md`)

**Change 4 — Update Component 4 row.**
Replace line 29:
```markdown
29: | `workflow.md` YAML frontmatter schema in record folder `[a-docs]`: `workflow.path[].role` (string, required), `workflow.path[].phase` (string, required); removed `workflow.synthesis_role` | Yes | Component 4: Backward Pass Orderer |
```
with:
```markdown
29: | `workflow.md` YAML frontmatter schema in record folder `[a-docs]`: `workflow.name` (string, required), `workflow.nodes[].id` (string, required), `workflow.nodes[].role` (string, required), `workflow.nodes[].human-collaborative` (string, optional), `workflow.edges[].from` (string, required), `workflow.edges[].to` (string, required), `workflow.edges[].artifact` (string, optional); removed `workflow.path[].role`, `workflow.path[].phase`. **Tooling Dev update pending** — Component 4 will be updated to parse the new schema in the follow-on Tooling Dev flow. | Yes | Component 4: Backward Pass Orderer |
```

---

## Update Report Draft

**Title:** Workflow Schema Unification — record-folder `workflow.md` adopts nodes/edges format
**Impact:** `[TBD]`
**Date:** 2026-03-29
**Version:** `v[TBD]`
**Summary:** Unified the record-folder `workflow.md` schema with the permanent workflow graph format. Adopts a nodes/edges subgraph model, eliminating the flat `path[]` list and the stale `synthesis_role` field. This enables consistent programmatic backward pass ordering across all workflow types.

### Impacted Files
- `a-docs/records/main.md`
- `general/instructions/records/main.md`
- `general/instructions/workflow/graph.md`

### Migration Guidance
**Migration Sequencing Note:** Adopting projects should **not** migrate their `workflow.md` files to the new nodes/edges schema until the Component 4 tooling update is available. The current flow establishes the specification; a follow-on Tooling Dev flow will provide the compatible parser. Wait for the update report accompanying the Component 4 tooling update before implementing these changes in your project.

---

## Open Questions
None.
