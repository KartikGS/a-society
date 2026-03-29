**Subject:** Workflow schema unification — Framework Dev phase (4 files)
**Status:** BRIEFED
**Date:** 2026-03-29

---

## Agreed Change

**Files Changed:**
| Target | Action |
|---|---|
| `$A_SOCIETY_RECORDS` | replace: `workflow.md` schema + update four dependent passages |
| `$INSTRUCTION_RECORDS` | replace: `workflow.md` schema (remove `synthesis_role`, adopt nodes/edges) + update three dependent passages |
| `$INSTRUCTION_WORKFLOW_GRAPH` | additive: new section covering record-folder `workflow.md` subgraph variant |
| `$A_SOCIETY_TOOLING_COUPLING_MAP` | replace: Component 4 row in format dependency table |

---

### Item 1 — `$A_SOCIETY_RECORDS` [Requires Owner approval]

**Background.** The record-folder `workflow.md` currently uses a flat `path[]` schema. Design decisions confirmed 2026-03-29 unify it with the permanent workflow graph format (nodes/edges). This item updates `$A_SOCIETY_RECORDS` to reflect the confirmed schema.

**Note on this record folder.** `a-society/a-docs/records/20260329-workflow-schema-unification/workflow.md` is already in the new nodes/edges format — it serves as a concrete conforming example and demonstrates the schema change is live in practice before the docs catch up.

**Change 1a — Replace schema block.** `[replace target]`

Replace the entire YAML schema block in the `workflow.md — Forward Pass Path` section (beginning with the opening code fence before `---\nworkflow:\n  path:` and ending with the closing code fence after `---`) with:

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

The sentence immediately after the schema block ("The YAML content must be wrapped in `---` frontmatter delimiters as shown.") remains unchanged.

**Change 1b — Update "What Component 4 reads from it."** `[replace target]`

Replace the sentence beginning "`workflow.path[].role`. The `phase` field is present for human orientation" with:

> `workflow.nodes[].role` and the graph structure in `workflow.nodes[].id` + `workflow.edges`. The `human-collaborative` field is present for human orientation and is not parsed by Component 4.

**Change 1c — Update completeness obligation sentence.** `[replace target]`

Replace the clause ending `"...that checkpoint must appear as its own Owner entry in \`workflow.md\`. For example, \`TA - Advisory\` must be followed by \`Owner - TA Review\` when the Owner reviews the advisory before the Curator proceeds."` with:

> ...that checkpoint must appear as its own Owner node in `workflow.md`, with an incoming edge from the preceding node and an outgoing edge to the following node. For example, `TA - Advisory` must be followed by an `Owner - TA Review` node when the Owner reviews the advisory before the Curator proceeds.

**Change 1d — Update "Relationship to the plan's `path` field."** `[replace target]`

In the "Relationship to the plan's `path` field" subsection, make two replacements:

*(i)* Replace the second bullet (beginning "`workflow.md` path — machine-readable schema parsed by Component 4. Structured `role` and `phase` fields.") with:

> - **`workflow.md`** — machine-readable graph parsed by Component 4. Structured nodes and edges. Used to compute backward pass traversal order.

*(ii)* Replace the sentence beginning "When creating `workflow.md` at intake, populate it from the plan's `path`. The roles listed must be consistent between the two." with:

> When creating `workflow.md` at intake, derive the node list and edge structure from the plan's `path`. Each step in the plan's path corresponds to a node; the sequencing and branching structure of the workflow imply the edges. Roles must be consistent between the two representations.

---

### Item 2 — `$INSTRUCTION_RECORDS` [Requires Owner approval]

**Background.** `$INSTRUCTION_RECORDS` carries a stale `workflow.md` schema: it still shows `synthesis_role` (which was removed in a prior flow, per the coupling map) and `path[]`. This item updates it to the confirmed nodes/edges schema and removes the stale field. The update also corrects the Step 2 schema reference and the "What the orderer reads from it" sentence.

**Change 2a — Replace schema block.** `[replace target]`

Replace the entire YAML schema block in the `workflow.md — Forward Pass Path` section (opening code fence before `---\nworkflow:\n  synthesis_role:` through closing code fence after `---`) with:

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

Immediately after the schema block, add the following note (this is additive; insert after the closing code fence, before "The YAML content must be wrapped in `---` frontmatter delimiters"):

> *Schema is defined in `$INSTRUCTION_WORKFLOW_GRAPH`. Record-folder `workflow.md` uses the same nodes/edges schema as permanent workflow graphs, instantiated as a flow-specific subgraph covering only the nodes and edges the flow traverses.*

**Change 2b — Update "What the orderer reads from it."** `[replace target]`

Replace the sentence beginning "The `synthesis_role` field and the `role` entries in the `path` list." with:

> `workflow.nodes[].role` and the graph structure in `workflow.nodes[].id` + `workflow.edges`. The `human-collaborative` and `artifact` fields are for human orientation and are not parsed programmatically.

**Change 2c — Update Step 2 sentence about workflow.md schema.** `[replace target]`

In the "How to Create a Records Structure" section, Step 2, replace the sentence beginning "If the project will use a Backward Pass Orderer tool, also declare `workflow.md` as a non-sequenced artifact created at intake alongside the workflow plan. Document its schema, authoring authority, and the tool that reads it in the project's `records/main.md`." with:

> If the project will use a Backward Pass Orderer tool, also declare `workflow.md` as a non-sequenced artifact created at intake alongside the workflow plan. The schema is defined in `$INSTRUCTION_WORKFLOW_GRAPH` — record-folder `workflow.md` uses the same nodes/edges schema as permanent workflow graphs, instantiated as a flow-specific subgraph covering only the nodes and edges the flow traverses. Document the authoring authority and the tool that reads it in the project's `records/main.md`.

**Change 2d — Update completeness obligation sentence.** `[replace target]`

In the completeness obligation paragraph, replace the clause ending `"...that checkpoint must appear as its own intake-role entry in \`workflow.md\`. For example, if a project's workflow includes \`RoleA - Deliverable\` and the intake role reviews..."` with:

> ...that checkpoint must appear as its own intake-role node in `workflow.md`, with an incoming edge from the preceding node and an outgoing edge to the following node. For example, if a project's workflow includes `RoleA - Deliverable` and the intake role reviews...

---

### Item 3 — `$INSTRUCTION_WORKFLOW_GRAPH` [Requires Owner approval]

**Background.** `$INSTRUCTION_WORKFLOW_GRAPH` currently covers only permanent workflow documents. Record-folder `workflow.md` uses the same schema but serves a different purpose (flow-specific subgraph). This item adds a section explaining the record-folder variant so the canonical schema definition, both uses, and their relationship are in one place.

**Change 3 — Additive: new section at end of file.** `[additive]`

After the last sentence of "What the Graph Does NOT Capture" (ending "...the reasoning behind the workflow design"), append the following new section:

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

---

### Item 4 — `$A_SOCIETY_TOOLING_COUPLING_MAP` [Curator authority — implement directly]

**Background.** The Component 4 format dependency row currently describes the old `path[]` schema. This item updates the row to reflect the new nodes/edges schema. The Tooling Dev update to Component 4 itself is pending (separate flow); this coupling map update records the new target format so the Owner can correctly apply the Coupling Test at future Phase 2 decisions.

**Change 4 — Update Component 4 row.** `[replace target]`

In the Format Dependencies table, replace the row beginning "`workflow.md` YAML frontmatter schema in record folder `[a-docs]`:" with:

| `workflow.md` YAML frontmatter schema in record folder `[a-docs]`: `workflow.name` (string, required), `workflow.nodes[].id` (string, required), `workflow.nodes[].role` (string, required), `workflow.nodes[].human-collaborative` (string, optional), `workflow.edges[].from` (string, required), `workflow.edges[].to` (string, required), `workflow.edges[].artifact` (string, optional); removed `workflow.path[].role`, `workflow.path[].phase`. **Tooling Dev update pending** — Component 4 will be updated to parse the new schema in the follow-on Tooling Dev flow. | Yes | Component 4: Backward Pass Orderer |

---

## Scope

**In scope:** The four changes above — schema replacement in `$A_SOCIETY_RECORDS` and `$INSTRUCTION_RECORDS`, new section in `$INSTRUCTION_WORKFLOW_GRAPH`, coupling map row update. No changes to the Component 4 implementation (Tooling Dev flow) or runtime code (Runtime Dev flow).

**Out of scope:** Component 4 parser update; runtime orchestrator changes; `$A_SOCIETY_RUNTIME_INVOCATION` update; `start-flow` CLI signature change. These follow in the Tooling Dev and Runtime Dev flows after this flow closes.

---

## Update Report Draft (Required — Include in Proposal Submission)

This is a `[LIB]` flow that changes `$INSTRUCTION_RECORDS` and `$INSTRUCTION_WORKFLOW_GRAPH`. Include a framework update report draft as a named section in the `curator-to-owner` proposal submission. Use classification fields marked `TBD` — classification is determined at Phase 4 by consulting `$A_SOCIETY_UPDATES_PROTOCOL`.

The update report draft must include a **migration sequencing note**: adopting projects should not migrate their `workflow.md` files to the new nodes/edges schema until the Component 4 tooling update is available. The Framework Dev flow establishes the new schema specification; the Tooling Dev flow makes the tooling compatible. Migration guidance should instruct Curators to wait for the follow-on update report accompanying the Component 4 tooling update.

---

## Open Questions for the Curator

None. Design decisions are confirmed; all four changes are fully derivable from the confirmed design. The proposal round is mechanical. State "None" in the proposal's open questions section.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Workflow schema unification — Framework Dev phase (4 files)."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
