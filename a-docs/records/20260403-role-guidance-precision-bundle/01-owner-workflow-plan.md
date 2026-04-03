---
type: owner-workflow-plan
date: "2026-04-03"
complexity:
  domain_spread: elevated
  shared_artifact_impact: elevated
  step_dependency: moderate
  reversibility: low
  scope_size: elevated
tier: 2
path:
  - Owner - Intake & Brief
  - Curator - Proposal
  - Owner - Review Decision
  - Curator - Implementation
  - Owner - Forward Pass Closure
known_unknowns:
  - "Whether any of the 9 items conflict with each other or with existing rules"
  - "Whether items already implemented in a-society-specific roles need the general-layer counterpart"
  - "Whether any item requires a framework update report"
---

> **Template** — do not modify this file. When instantiating, omit this header block. Create from this template into the active record folder as `01-owner-workflow-plan.md`. All five `complexity` axis fields, `tier`, and `path` must be filled in — a plan with any `null` or missing required value is incomplete and does not satisfy the Phase 0 gate.

> **Completion gate:** This plan must exist before any other artifact in the record folder. Implementation does not begin until it exists.

---

**Subject:** Role guidance precision bundle: brief-state-claim verification, implementation portability gap, dependency-scoping completeness, session-routing-removal additions, structured documentation replacement boundary

**Type:** Owner Workflow Plan

**Date:** 2026-04-03

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Changes to `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` — role-template quality and precision guidelines | elevated |
| **2. Shared artifact impact** | Two core role templates in `general/roles/` would be modified | elevated |
| **3. Step dependency** | Some items may build on each other; most are independent but require consistent scoping | moderate |
| **4. Reversibility** | Role template changes can be revised via future flows; low concern because pattern is established | low |
| **5. Scope size** | 9 distinct items across 2 role templates; scope is well-bounded | elevated |

**Verdict:** Tier 2 — moderate complexity. The work is well-scoped to two role templates with a clear existing pattern. A single Curator session can produce the proposal following the standard Framework Dev workflow.

---

## Routing Decision

Tier 2 is appropriate because:

- The items are derived from backward pass synthesis findings across multiple prior flows (source-rich, not discovery-driven)
- The target files are known (`$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE`)
- The improvement pattern (role guidance precision) is established by prior bundles
- No new design decisions are required — these are extensions of existing guidance

---

## Path Definition

1. **Owner** — Intake & brief writing. Create record folder, produce this plan, write brief.
2. **Curator** — Proposal. Analyze the 9 items, formulate as additions to role templates, submit proposal.
3. **Owner** — Review decision. Apply Phase 2 review tests, approve/revise/reject.
4. **Curator** — Implementation. Apply approved items to role templates, register in index.
5. **Owner** — Forward pass closure. Confirm implementation, invoke backward pass.

---

## Known Unknowns

- Whether any of the 9 items conflict with each other or with existing rules in the role templates
- Whether some items were already implemented in the A-Society-specific role files (`$A_SOCIETY_OWNER_ROLE`, `$A_SOCIETY_CURATOR_ROLE`) and need their general-layer counterpart
- Whether any item requires a framework update report (if changes affect adopters' expected behavior)

These are expected to be resolved during the Curator's proposal phase.