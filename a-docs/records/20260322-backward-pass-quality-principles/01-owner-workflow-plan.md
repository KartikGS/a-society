---
type: owner-workflow-plan
date: "2026-03-22"
complexity:
  domain_spread: low
  shared_artifact_impact: low
  step_dependency: low
  reversibility: low
  scope_size: low
tier: 2
path:
  - Owner - Intake & Briefing
  - Curator - Implementation
  - Owner - Review & Forward Pass Closure
known_unknowns: []
---

**Subject:** Backward pass quality — externally-caught errors and artifact vs. genuine analysis
**Type:** Owner Workflow Plan
**Date:** 2026-03-22

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches improvement documentation only — two files in the same document family | low |
| **2. Shared artifact impact** | Two files (`$GENERAL_IMPROVEMENT`, `$A_SOCIETY_IMPROVEMENT`); additive changes only; no structural dependencies or index updates | low |
| **3. Step dependency** | Both additions are independent; the `$A_SOCIETY_IMPROVEMENT` echo does not depend on any decision made during the `$GENERAL_IMPROVEMENT` write | low |
| **4. Reversibility** | Additive text additions to existing sections; easily reverted | low |
| **5. Scope size** | Two files, one concern (backward pass analysis quality), small additions | low |

**Verdict:** Tier 2 — All complexity axes are low (complexity-derived tier is 1), but the LIB component requires writing to `general/`, which is Curator authority. The project invariant that the Owner does not write to `general/` overrides the complexity-derived tier.

---

## Routing Decision

All five axes are low — intrinsically a Tier 1 change. However, one of the two target files (`$GENERAL_IMPROVEMENT`) lives in `general/`, and writing to `general/` is explicitly outside Owner authority. The project invariant routes this as Tier 2: Owner briefs, Curator implements, Owner reviews.

---

## Path Definition

1. Owner — Intake & Briefing: produce workflow plan and brief; point Curator at brief
2. Curator — Implementation: draft and implement additions to `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT`; return to Owner for review
3. Owner — Review & Forward Pass Closure: confirm both additions are correctly placed and scoped; close forward pass; initiate backward pass

---

## Known Unknowns

None.
