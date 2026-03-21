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
  - Owner - Review & Decision
  - Curator - Implementation & Registration
known_unknowns: []
---

**Subject:** Index path prohibition and backward pass handoff completeness — 2 library changes
**Type:** Owner Workflow Plan
**Date:** 2026-03-21

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Library only — two files in `general/`; no tooling or a-docs structural changes | low |
| **2. Shared artifact impact** | `$INSTRUCTION_INDEX` is consumed at initialization for every adopting project; `$GENERAL_IMPROVEMENT` governs backward pass protocol for all projects | moderate |
| **3. Step dependency** | The two changes are independent; neither depends on the other | low |
| **4. Reversibility** | Both changes are additive rules; easily removed if wrong | low |
| **5. Scope size** | Two target files, both additive — no renames, no retirements | low |

**Verdict:** Tier 2 — moderate shared artifact impact (both files are consumed by all adopting projects) elevates from Tier 1. Changes are fully specified; a proposal round is warranted to verify placement and wording.

---

## Routing Decision

Two axes are low; shared artifact impact is moderate because both target files are read by or distributed to every project using the framework. A Curator proposal with Owner review is the right gate before changes land in `general/`.

---

## Path Definition

1. Owner — intake and briefing
2. Curator — proposal (draft content for both changes)
3. Owner — review and decision
4. Curator — implementation and registration

---

## Known Unknowns

None.
