**Subject:** Workflow graph schema simplification — 4 changes
**Status:** BRIEFED
**Date:** 2026-03-19

> **Count verify:** Four numbered items below; subject line states 4. Confirmed.

---

## Agreed Change

The workflow graph YAML schema has accumulated three fields that should not exist (`phases`, `first_occurrence_position`, `is_synthesis_role`) and A-Society's own workflow incorrectly encodes the backward pass as workflow nodes. Both problems add unnecessary complexity to the schema and to tooling. The direction: phases and nodes are the same concept; adjacent same-agent nodes should be merged; backward pass is governed by `$A_SOCIETY_IMPROVEMENT` and must not appear as workflow graph nodes.

**1. `$INSTRUCTION_WORKFLOW_GRAPH` — simplified schema** `[Requires Owner approval]`

Rewrite the schema to remove the three erroneous fields and simplify the fill-in steps:

- Remove the `phases:` list from the schema block entirely
- Remove the `phase` field from nodes
- Remove `first_occurrence_position` from nodes
- Remove `is_synthesis_role` from nodes
- The simplified node definition is: `id` (string) + `role` (string) only
- Edges are unchanged: `from`, `to`, `artifact` (optional)
- Update the schema code block, field definitions section, and "How to Fill It In" steps to match (steps reduce to: list nodes → list edges → validate)
- Update the "Why It Exists" rationale: backward pass ordering is still a reason, but the mechanism is now edge traversal rather than `first_occurrence_position` fields
- Update the introduction paragraph: remove "phases" as a concept distinct from nodes

**2. `$A_SOCIETY_WORKFLOW` — YAML frontmatter rewrite** `[Requires Owner approval]`

Replace the current YAML frontmatter with the simplified schema:

- Remove the `phases:` section
- Merge `owner-phase-0-plan` + `owner-phase-1-briefing` into one node (Owner)
- Merge `curator-phase-3-implementation` + `curator-phase-4-registration` into one node (Curator)
- Remove all Phase 5 nodes (`curator-phase-5-findings`, `owner-phase-5-findings`, `curator-phase-5-synthesis`) — these are backward pass artifacts, not workflow nodes
- Remove `phase`, `first_occurrence_position`, `is_synthesis_role` from all remaining nodes
- Update edges to reflect the merged nodes and the removed backward pass nodes

The simplified workflow has four nodes: Owner (intake + briefing), Curator (proposal), Owner (review), Curator (implementation + registration). Edges: owner-intake → curator-proposal, curator-proposal → owner-review, owner-review → curator-implementation (approved), owner-review → curator-proposal (revise). Naming convention is Curator judgment.

**3. `$A_SOCIETY_WORKFLOW` — prose update** `[Requires Owner approval]`

Remove the backward pass from the workflow phases and update the session model:

- Remove Phase 5 as a named workflow phase; replace the Phase 5 section with a single sentence referencing `$A_SOCIETY_IMPROVEMENT` as the governing document for the backward pass
- Update the session model table: remove Phase 5 from both Session A and Session B rows; add a trailing reference to backward pass per `$A_SOCIETY_IMPROVEMENT`
- Update session model steps 4–6 to remove Phase 5 handoff language; the backward pass trigger language at the end of steps 4 and 5 should become a pointer to `$A_SOCIETY_IMPROVEMENT`
- Update the handoffs table: remove the Phase 4 → Phase 5 row
- If the prose references `$A_SOCIETY_IMPROVEMENT_PROTOCOL` anywhere (a retired variable), replace with `$A_SOCIETY_IMPROVEMENT`

**4. `$A_SOCIETY_TOOLING_INVOCATION` — schema example update** `[Curator authority — implement directly]`

The "Workflow graph YAML frontmatter schema" example block in the invocation reference (Component 3 + 4 section) shows the old schema with `phases`, `first_occurrence_position`, and `is_synthesis_role`. Update the example block to show the simplified schema (nodes with `id` + `role` only, no phases list, no removed fields).

---

## Scope

**In scope:**
- `$INSTRUCTION_WORKFLOW_GRAPH` — schema, field definitions, fill-in steps, rationale prose
- `$A_SOCIETY_WORKFLOW` — YAML frontmatter rewrite + prose Phase 5 removal + session model update + handoffs table
- `$A_SOCIETY_TOOLING_INVOCATION` — schema example block in Component 3 + 4 section
- `$A_SOCIETY_TOOLING_COUPLING_MAP` — record the format dependency changes for Components 3 and 4 (schema fields removed; invocation gaps pending TA advisory + Developer)

**Out of scope:**
- Component 3 (Workflow Graph Schema Validator) implementation update — TA advisory + Developer track; the coupling map entry is the handoff
- Component 4 (Backward Pass Orderer) implementation update — same; the backward pass orderer currently reads `first_occurrence_position` and `is_synthesis_role`; how it derives order post-simplification is a TA design question
- `$A_SOCIETY_TOOLING_PROPOSAL` spec updates for Components 3 and 4 — follows TA advisory
- `$INSTRUCTION_WORKFLOW` prose changes — the "Backward Pass (mandatory)" section in that document describes what to include in a workflow document's backward pass section; it does not need to change because of the schema simplification

---

## Likely Target

- `$INSTRUCTION_WORKFLOW_GRAPH` — `/a-society/general/instructions/workflow/graph.md`
- `$A_SOCIETY_WORKFLOW` — `/a-society/a-docs/workflow/main.md`
- `$A_SOCIETY_TOOLING_INVOCATION` — `/a-society/tooling/INVOCATION.md`
- `$A_SOCIETY_TOOLING_COUPLING_MAP` — resolve via `$A_SOCIETY_INDEX`

---

## Open Questions for the Curator

1. **`$A_SOCIETY_IMPROVEMENT` assessment:** Does the improvement document reference synthesis-as-graph-node in ways that now need decoupling? (It defines the synthesis role concept for the backward pass — that concept remains valid; the question is whether it ties synthesis role to graph fields that no longer exist.) Assess during proposal and include any required edits in the proposal if found.

2. **Other workflow graphs:** Are there any other `workflow/main.md` files in the repository with YAML frontmatter using the old schema? Run a grep for `is_synthesis_role` and `first_occurrence_position` across the repo. If any are found, include them in scope and note them in the proposal.

3. **`$A_SOCIETY_TOOLING_ADDENDUM`:** Does this document reference backward pass nodes, `is_synthesis_role`, or Phase 5 as a workflow construct in ways that now require correction? Assess and include in proposal if so.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Workflow graph schema simplification — 4 changes."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
