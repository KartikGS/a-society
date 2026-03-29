---
type: owner-workflow-plan
date: "2026-03-29"
complexity:
  domain_spread: moderate
  shared_artifact_impact: elevated
  step_dependency: moderate
  reversibility: low
  scope_size: moderate
tier: 2
path:
  - Owner — Intake & Briefing
  - Curator — Proposal
  - Owner — Review
  - Curator — Implementation & Registration
  - Owner — Forward Pass Closure
known_unknowns: []
---

**Subject:** Workflow schema unification — Framework Dev flow
**Type:** Owner Workflow Plan
**Date:** 2026-03-29

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Two `general/` instructions and two `a-docs/` files; single Framework Dev workflow | moderate |
| **2. Shared artifact impact** | `$INSTRUCTION_RECORDS` is consumed by all adopting projects; schema change to `workflow.md` requires update report for any project using Component 4 | elevated |
| **3. Step dependency** | Files can largely be updated independently; coupling map row update is consequent to the schema decisions but does not block other changes | moderate |
| **4. Reversibility** | Documentation-only changes; no code changes in this flow | low |
| **5. Scope size** | Four target files, two roles, single workflow | moderate |

**Verdict:** Tier 2 — multiple `general/` files requiring Curator proposal and Owner approval, `[LIB]` scope with likely update report.

---

## Routing Decision

Tier 2. `[LIB]` scope drives the full proposal–review–implementation path. Elevated shared artifact impact because the schema change to `$INSTRUCTION_RECORDS` affects any adopting project using Component 4 — an update report is expected. Design decisions for this item were confirmed 2026-03-29 (see Next Priorities item in `$A_SOCIETY_LOG`); no direction unknowns remain — this is execution.

**Note on multi-flow sequencing:** This Framework Dev flow is the first of three flows for the full Workflow Schema Unification item. After forward pass closure here, two subsequent flows will be initiated by the Owner: *(1)* Tooling Dev flow — Component 4 parser updated to read `nodes/edges` instead of `path[]`; *(2)* Runtime Dev flow — orchestrator reads from record-folder `workflow.md`; `start-flow` CLI signature updated; `$A_SOCIETY_RUNTIME_INVOCATION` updated. Those flows are not scoped here.

---

## Path Definition

1. Owner — Intake & Briefing
2. Curator — Proposal
3. Owner — Review
4. Curator — Implementation & Registration
5. Owner — Forward Pass Closure

---

## Known Unknowns

None.
