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
  - Owner - Proposal Review
  - Curator - Implementation & Registration
  - Owner - Forward Pass Closure
known_unknowns: []
---

**Subject:** Improvement docs restructure — separate meta-analysis phase from synthesis phase
**Type:** Owner Workflow Plan
**Date:** 2026-03-22

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Two improvement philosophy docs only; contained within improvement/ subfolder | low |
| **2. Shared artifact impact** | `$GENERAL_IMPROVEMENT` is a LIB file used by all adopting projects; structural format change affects how agents read backward pass instructions across the ecosystem | moderate |
| **3. Step dependency** | Restructuring is self-contained; no cascading decisions required by later steps | low |
| **4. Reversibility** | Documentation structural change; section content is preserved, only organization changes; easily reverted | low |
| **5. Scope size** | Two files; no new files created; reorganization within existing structure | low |

**Verdict:** Tier 2 — LIB change to `$GENERAL_IMPROVEMENT` requires Owner approval; shared artifact impact is the elevated axis driving the proposal round.

---

## Routing Decision

Tier 2: Owner brief → Curator proposal → Owner review → Curator implements. The elevated shared artifact impact axis reflects that `$GENERAL_IMPROVEMENT` is distributed to all adopting projects — the structural form decision for how backward pass instructions are organized warrants Owner review before it ships. Both files are in scope; `$GENERAL_IMPROVEMENT` (LIB) drives the flow; `$A_SOCIETY_IMPROVEMENT` (MAINT) echoes the same restructuring.

**Scope boundary:** This flow addresses Part 2 of the `backward-pass-jit-delivery` Next Priorities item — separating meta-analysis from synthesis instructions in the improvement docs. Parts 1, 3, and 4 of that item (remove backward pass instructions from required reading; update Component 4 to embed instructions; update Curator required reading) are deferred. They require Component 4 to carry the relevant instruction sets in its generated prompts before required-reading removal is safe. Part 3 needs TA scoping. A revised Next Priorities item will be filed at forward pass closure.

---

## Path Definition

1. Owner — Intake & Briefing
2. Curator — Proposal
3. Owner — Proposal Review
4. Curator — Implementation & Registration
5. Owner — Forward Pass Closure

---

## Known Unknowns

None.
