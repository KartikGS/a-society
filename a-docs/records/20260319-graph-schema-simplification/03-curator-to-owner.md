**Subject:** Workflow graph schema simplification — proposal and scope assessment
**Status:** PENDING_REVIEW
**Type:** Maintenance Change
**Date:** 2026-03-19

---

## Trigger

Human-directed via Owner brief `02-owner-to-curator-brief.md` in this record. The current workflow graph model duplicates structure (`phases` vs. nodes), stores backward-pass policy in schema fields, and models A-Society's backward pass as workflow nodes inside `$A_SOCIETY_WORKFLOW`.

---

## What and Why

This proposal simplifies the workflow graph schema to the minimum structural contract needed by agents and tooling: nodes and edges. The graph should describe the forward-pass shape of a workflow. It should not separately encode phases when phases and structural nodes are the same concept in practice, and it should not encode backward-pass policy through `first_occurrence_position` and `is_synthesis_role` fields when backward pass authority already lives in `$A_SOCIETY_IMPROVEMENT`.

This is the correct simplification for three reasons:

1. The current schema duplicates one concept as two structures. In the live A-Society workflow, `phases` and `nodes` have to be kept in sync manually, even though the meaningful unit for handoff structure is the node.
2. The current schema mixes forward-pass structure with backward-pass policy. That creates drift pressure between `$INSTRUCTION_WORKFLOW_GRAPH`, `$A_SOCIETY_WORKFLOW`, `$A_SOCIETY_IMPROVEMENT`, and Components 3 and 4.
3. A-Society's own workflow frontmatter currently mis-models backward pass as graph nodes. That is a category error: backward pass is mandatory, but it is governed by `$A_SOCIETY_IMPROVEMENT`, not by the workflow graph itself.

Scope boundary:
- This proposal covers documentation and registration changes only.
- Component 3 and 4 implementation changes, plus any corresponding `$A_SOCIETY_TOOLING_PROPOSAL` spec revisions, remain out of scope for this Curator flow and follow the TA advisory → Developer path noted in the brief.
- `$A_SOCIETY_TOOLING_INVOCATION` item 4 is Curator-authority maintenance. It is included below for visibility, but I intend to execute it in the same implementation pass as items 1–3 so the docs do not spend a session in a half-migrated state.

Likely downstream effect after implementation: framework update report required. The schema change affects a foundational `general/` instruction and any adopting project that uses workflow graph frontmatter.

---

## Where Observed

A-Society — internal. The issue is visible across `$INSTRUCTION_WORKFLOW_GRAPH`, `$A_SOCIETY_WORKFLOW`, `$A_SOCIETY_TOOLING_INVOCATION`, and `$A_SOCIETY_TOOLING_COUPLING_MAP`.

Repo scan result: one sibling-project workflow document also still uses the old schema (Ink project). I am flagging that as a separate migration candidate only. Per Curator hard rules, I am not modifying another project's docs inline as part of this A-Society flow.

---

## Target Location

- `$INSTRUCTION_WORKFLOW_GRAPH`
- `$A_SOCIETY_WORKFLOW`
- `$A_SOCIETY_TOOLING_INVOCATION` *(Curator authority — implement directly during the implementation pass)*
- `$A_SOCIETY_TOOLING_COUPLING_MAP`

Assessed and intentionally left unchanged in this flow:
- `$A_SOCIETY_IMPROVEMENT`
- `$A_SOCIETY_TOOLING_ADDENDUM`

---

## Draft Content

### 1. `$INSTRUCTION_WORKFLOW_GRAPH`

Replace the schema and supporting prose so the graph captures only forward-pass structure.

**Core rewrite**

- Remove `workflow.phases` entirely.
- Remove node fields `phase`, `first_occurrence_position`, and `is_synthesis_role`.
- Redefine `workflow.nodes` as one entry per structural node in the forward pass.
- Clarify merge rule: adjacent same-role work with no intervening handoff belongs in one node.
- Keep `workflow.edges` unchanged: `from`, `to`, `artifact` optional.

**Replacement schema block**

```yaml
workflow:
  name: [string — the graph name; copy from workflow/main.md "Graph:" line, or use the document title]
  nodes:
    - id: [string — unique identifier for this structural node]
      role: [string — role name exactly as declared in agents.md]
  edges:
    - from: [string — node id]
      to: [string — node id]
      artifact: [string, optional — artifact type produced at this handoff]
```

**Field-definition changes**

- `workflow.phases`: remove this section entirely.
- `workflow.nodes`: change from "one entry per role firing per phase" to "one entry per structural node in the forward pass."
- `workflow.nodes.id`: change naming guidance from role+phase to role+structural-step, e.g. `owner-intake`, `curator-proposal`, `owner-review`.
- `workflow.nodes.role`: unchanged.
- `workflow.edges`: unchanged.

**Introduction / rationale changes**

- Replace the current "captures phases, nodes, edges, first-occurrence order, and synthesis role" wording with "captures nodes and edges."
- Update "Why It Exists" so backward pass ordering remains a purpose, but the mechanism is no longer stored in node metadata. The graph supplies forward-pass structure; backward-pass ordering is derived from that structure under `$GENERAL_IMPROVEMENT`.
- Update "Structural legibility" language to say the graph shows which structural nodes exist, which roles own them, and how handoffs connect.

**How-to-fill steps**

Reduce to three steps:

1. List the nodes in forward-pass order.
2. List the edges between nodes, including branches where applicable.
3. Validate the frontmatter. If tooling is available, run the workflow graph validator. If backward-pass ordering needs verification, compare the workflow prose against `$GENERAL_IMPROVEMENT`; it is no longer encoded as frontmatter fields.

**In-scope cleanup in the same edit**

- Replace the stale `$INSTRUCTION_IMPROVEMENT` reference with `$GENERAL_IMPROVEMENT`.

---

### 2. `$A_SOCIETY_WORKFLOW`

Replace the YAML frontmatter with a four-node forward-pass graph and remove backward pass as a workflow phase.

**Replacement frontmatter**

```yaml
---
workflow:
  name: A-Society Framework Development
  nodes:
    - id: owner-intake-briefing
      role: Owner
    - id: curator-proposal
      role: Curator
    - id: owner-review
      role: Owner
    - id: curator-implementation-registration
      role: Curator
  edges:
    - from: owner-intake-briefing
      to: curator-proposal
      artifact: owner-to-curator-brief
    - from: curator-proposal
      to: owner-review
      artifact: curator-to-owner
    - from: owner-review
      to: curator-implementation-registration
      artifact: owner-to-curator
    - from: owner-review
      to: curator-proposal
      artifact: owner-to-curator
---
```

**Naming judgment**

I am proposing action-based node ids rather than phase-based ids because the simplified schema no longer has a phase layer to borrow from. These ids stay readable and reflect the merged adjacent same-role work called for in the brief.

**Prose changes**

- In "Trigger Sources," change the backward-pass bullet so it no longer says actionable items from Phase 5 re-enter the workflow. Replace with language that points to findings surfaced through `$A_SOCIETY_IMPROVEMENT`, with new flows started only when Owner judgment or a new tracked change is required.
- Keep Phases 0–4.
- Remove the `### Phase 5 — Backward Pass` section and replace it with this single sentence:

  `Backward pass is mandatory after forward-pass completion and is governed by $A_SOCIETY_IMPROVEMENT; it is not a workflow phase and is not represented as workflow graph nodes.`

- Replace both `$A_SOCIETY_IMPROVEMENT_PROTOCOL` references with `$A_SOCIETY_IMPROVEMENT`.
- Remove the `Phase 4 → Phase 5` row from the handoffs table.
- Update the session model table to remove Phase 5 from both sessions and append a backward-pass pointer to `$A_SOCIETY_IMPROVEMENT`.
- Update session steps 4–6 so backward pass is referenced as post-forward-pass work governed by `$A_SOCIETY_IMPROVEMENT`, not as a numbered workflow phase.
- Adjust the "Owner as terminal node" paragraph so it refers to the forward-pass graph specifically. The Owner remains the forward-pass review endpoint; backward-pass synthesis may still continue afterward under `$A_SOCIETY_IMPROVEMENT`.

**Important modeling note**

The graph will no longer show the plan artifact as an Owner → Owner edge. That is intentional. `01-owner-workflow-plan.md` remains required in prose as the Phase 0 gate, but it is internal work within the merged Owner intake/briefing node rather than an inter-node handoff.

---

### 3. `$A_SOCIETY_TOOLING_INVOCATION` *(Curator authority — implement directly)*

Visibility only in this proposal; not requesting Owner approval on this item.

Update the "Workflow graph YAML frontmatter schema" example block so it matches the simplified schema. Proposed replacement:

```yaml
---
workflow:
  name: "Workflow Name"
  nodes:
    - id: owner-intake
      role: Owner
    - id: curator-proposal
      role: Curator
  edges:
    - from: owner-intake
      to: curator-proposal
      artifact: "Handoff brief"
---
```

I am holding this direct-authority edit for the same implementation pass as items 1–3 so the example does not move ahead of the approved documentation set by a full session.

---

### 4. `$A_SOCIETY_TOOLING_COUPLING_MAP`

Update the Component 3/4 format dependency row to reflect the simplified schema explicitly:

- Workflow graph YAML frontmatter schema now depends on:
  - `workflow.name`
  - `workflow.nodes[].id`
  - `workflow.nodes[].role`
  - `workflow.edges[].from`
  - `workflow.edges[].to`
  - `workflow.edges[].artifact` (optional)
- Removed dependency surface:
  - `workflow.phases`
  - `workflow.nodes[].phase`
  - `workflow.nodes[].first_occurrence_position`
  - `workflow.nodes[].is_synthesis_role`

Registration note to include in the coupling-map update:

- This is a Type A change for Component 3 and Component 4, with TA advisory + Developer follow-up pending.
- Invocation status rows for Components 3 and 4 remain **Closed**. This schema simplification does not create a new invocation gap; it creates a tooling-alignment obligation.

---

### Open-Question Assessments

**`$A_SOCIETY_IMPROVEMENT`: no edit proposed.**

Assessment result: the document defines backward pass in role/protocol terms. It does not encode synthesis as a graph node and does not depend on `first_occurrence_position` or `is_synthesis_role` fields in its own text. No decoupling edit is needed in this flow.

**Other workflow graphs: flag only.**

Assessment result: repo scan found one non-A-Society workflow still using the old schema in a sibling project. Per Curator hard rules, I am not including that project doc in this flow's implementation scope. It should be handled as a separate project-specific migration.

**`$A_SOCIETY_TOOLING_ADDENDUM`: no edit proposed.**

Assessment result: the addendum does not use the removed schema fields and does not model backward pass as workflow graph nodes. Its `Phase 5` references are tooling-implementation phases, not the A-Society workflow's backward pass. No correction is needed here.

---

## Owner Confirmation Required

The Owner should respond in `04-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

Implementation sequence after approval:
- Owner-reviewed items: `$INSTRUCTION_WORKFLOW_GRAPH`, `$A_SOCIETY_WORKFLOW`
- Concurrent Curator-authority item in same pass: `$A_SOCIETY_TOOLING_INVOCATION`
- Registration/update-discipline item in same pass: `$A_SOCIETY_TOOLING_COUPLING_MAP`
