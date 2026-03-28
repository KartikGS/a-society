---
type: owner-workflow-plan
date: "2026-03-28"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: low
  reversibility: low
  scope_size: low
tier: 2
path:
  - Owner — Intake & Briefing
  - Curator — Proposal
  - Owner — Review
  - Curator — Implementation & Registration
  - Owner — Forward Pass Closure
known_unknowns: []
---

**Subject:** Improvement synthesis — third merge criterion
**Type:** Owner Workflow Plan
**Date:** 2026-03-28

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single domain — backward pass / improvement protocol only | low |
| **2. Shared artifact impact** | Modifies `$GENERAL_IMPROVEMENT`, a distributable instruction consumed by all adopting projects | moderate |
| **3. Step dependency** | None — change is fully specified; no decisions depend on earlier steps | low |
| **4. Reversibility** | Additive text edit to two files; easily undone | low |
| **5. Scope size** | Two files, Owner + Curator, no systems affected | low |

**Verdict:** Tier 2 — Complexity axes are predominantly low, but the `[LIB]` tag triggers the Approval Invariant: the Curator cannot write to `general/` without Owner approval, which requires at minimum a Tier 2 pipeline.

---

## Routing Decision

Tier 2. The Approval Invariant forces Owner review before Curator implementation on the `$GENERAL_IMPROVEMENT` change. The `$A_SOCIETY_IMPROVEMENT` change is within Curator authority (`[MAINT]`) but is bundled in the same proposal to avoid two-flow overhead for a two-sentence fix.

---

## Path Definition

1. Owner — Intake & Briefing
2. Curator — Proposal (with update report draft section, per `[LIB]` requirement)
3. Owner — Review
4. Curator — Implementation & Registration
5. Owner — Forward Pass Closure

---

## Known Unknowns

None.

---

**Note on plan artifact validation:** Component 7 (`plan-artifact-validator.ts`) exists in `tooling/src/` but is not yet documented in `$A_SOCIETY_TOOLING_INVOCATION` (open Next Priorities item: "Add Component 7 to `$A_SOCIETY_TOOLING_INVOCATION`"). Plan validation has been omitted; the YAML frontmatter above is structurally complete and all required fields are non-null.
