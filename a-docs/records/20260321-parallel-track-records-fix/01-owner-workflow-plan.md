---
type: owner-workflow-plan
date: "2026-03-21"
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
known_unknowns: []
---

**Subject:** Parallel track records convention fix — A1, A2, Gen1, Gen2
**Type:** Owner Workflow Plan
**Date:** 2026-03-21

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | All changes confined to records convention and improvement protocol documentation | low |
| **2. Shared artifact impact** | `$INSTRUCTION_RECORDS` and `$GENERAL_IMPROVEMENT` are general library files consumed by all adopters; changes are additive | moderate |
| **3. Step dependency** | All four items are independent — none requires another's output | low |
| **4. Reversibility** | Purely additive documentation changes; easily undone | low |
| **5. Scope size** | 3 files, 4 rule additions | low |

**Verdict:** Tier 2 — LIB changes to `$INSTRUCTION_RECORDS` and `$GENERAL_IMPROVEMENT` require Owner → Curator brief and Owner review. Direction is fully pre-specified by `15-owner-to-curator.md` from the prior flow.

---

## Routing Decision

Tier 2. Two of the three target files are `general/` library files (LIB). The Approval Invariant requires Owner review before the Curator writes to `general/`. The scope is small and all four items are fully specified — no Curator judgment calls required; the proposal round is mechanical.

---

## Path Definition

1. Owner — Intake & Briefing (this session)
2. Curator — Proposal (Session B)
3. Owner — Review (Session A resumes)
4. Curator — Implementation & Registration (Session B resumes)

---

## Known Unknowns

None.
