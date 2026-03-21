---
type: owner-workflow-plan
date: "2026-03-22"
complexity:
  domain_spread: moderate
  shared_artifact_impact: moderate
  step_dependency: low
  reversibility: low
  scope_size: moderate
tier: 2
path:
  - Owner - Intake & Briefing
  - Curator - Proposal
  - Owner - Review
  - Curator - Implementation & Registration
known_unknowns:
  - "Item 2 ($INSTRUCTION_RECORDS inspect): whether parallel language is present — Curator confirms during proposal formulation; if absent, Item 2 closes with no change"
---

**Subject:** General library sync — 6 Next Priority items
**Type:** Owner Workflow Plan
**Date:** 2026-03-22

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Five files across `general/` (`$GENERAL_IMPROVEMENT` × 2 additions, `$GENERAL_OWNER_ROLE` × 1, `$INSTRUCTION_WORKFLOW_GRAPH` × 1, `$INSTRUCTION_RECORDS` × 1 conditional) plus one tooling test file | moderate |
| **2. Shared artifact impact** | `$GENERAL_IMPROVEMENT` and `$GENERAL_OWNER_ROLE` are shared library artifacts consumed by all adopting projects; `$INSTRUCTION_WORKFLOW_GRAPH` and `$INSTRUCTION_RECORDS` are instruction files with adopter reach | moderate |
| **3. Step dependency** | Items are fully independent — no item's outcome affects another's implementation | low |
| **4. Reversibility** | All changes are additive sentences or targeted content additions; easily reverted | low |
| **5. Scope size** | 5–6 files, all `[S]` items, all additive | moderate |

**Verdict:** Tier 2 — moderate shared artifact impact (changes to `$GENERAL_IMPROVEMENT` and `$GENERAL_OWNER_ROLE` affect all adopting projects) and multi-file LIB scope require the full proposal–review cycle.

---

## Routing Decision

Tier 2. LIB changes require Owner approval before implementation. Item 3 (`[MAINT]`) carries Curator-direct authority and is executed in the same Curator session as the LIB implementation pass — no separate routing needed.

---

## Path Definition

1. Owner — Intake & Briefing
2. Curator — Proposal
3. Owner — Review
4. Curator — Implementation & Registration

---

## Known Unknowns

- Item 2 (`$INSTRUCTION_RECORDS` inspect): whether parallel language is present in `$INSTRUCTION_RECORDS` corresponding to the post-decision submission model changes already applied to `$A_SOCIETY_RECORDS`. Curator confirms during proposal formulation. If absent, Item 2 closes with no change — confirmed explicitly in the proposal.
