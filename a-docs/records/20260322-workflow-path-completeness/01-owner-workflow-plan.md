---
type: owner-workflow-plan
date: "2026-03-22"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: low
  reversibility: low
  scope_size: low
tier: 2
path:
  - Owner - Intake & Briefing
  - Curator - Proposal
  - Owner - Review
  - Curator - Implementation & Registration
  - Owner - Forward Pass Closure
known_unknowns: []
---

**Subject:** workflow.md path completeness — creation obligation and LIB registration step
**Type:** Owner Workflow Plan
**Date:** 2026-03-22

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Two Owner role files — one internal (`$A_SOCIETY_OWNER_ROLE`), one distributable (`$GENERAL_OWNER_ROLE`). Both target the Post-Confirmation Protocol / intake guidance section. | low |
| **2. Shared artifact impact** | `$GENERAL_OWNER_ROLE` is a distributable template consumed by all adopting projects; change is additive. `$A_SOCIETY_OWNER_ROLE` is internal only. | moderate |
| **3. Step dependency** | The two changes are independent of each other — neither depends on the other being drafted or approved first. | low |
| **4. Reversibility** | Additive text edits to role files; easily reverted. No structural changes. | low |
| **5. Scope size** | Two files. Well-specified in the Next Priority item. | low |

**Verdict:** Tier 2 — The `$GENERAL_OWNER_ROLE` change is LIB scope, which requires a Curator proposal and Owner approval per the Portability and Approval Invariants. The single moderate axis (shared artifact impact) corroborates Tier 2 rather than Tier 3.

---

## Routing Decision

Tier 2. The LIB change to `$GENERAL_OWNER_ROLE` cannot bypass the Proposal → Review cycle — the Approval Invariant requires a Phase 2 decision artifact before the Curator writes to `general/`. The MAINT change to `$A_SOCIETY_OWNER_ROLE` is within Curator authority and is designated accordingly in the brief.

---

## Path Definition

1. Owner — Intake & Briefing (Phase 0: plan + brief)
2. Curator — Proposal (Phase 1: draft content for both changes; submit to Owner)
3. Owner — Review (Phase 2: apply five review tests; issue decision)
4. Curator — Implementation & Registration (Phase 3 + 4: write content, register if applicable, assess update report)
5. Owner — Forward Pass Closure (Phase 5: verify completion, update log, initiate backward pass)

---

## Known Unknowns

None.
