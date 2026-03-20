---
type: owner-workflow-plan
date: "2026-03-20"
complexity:
  domain_spread: low
  shared_artifact_impact: elevated
  step_dependency: low
  reversibility: low
  scope_size: elevated
tier: 2
path:
  - Owner - Intake
  - Curator - Proposal
  - Owner - Review
  - Curator - Implementation & Registration
known_unknowns:
  - "Whether $GENERAL_OWNER_ROLE requires updates alongside $A_SOCIETY_COMM_TEMPLATE_BRIEF for edit-mode fields."
  - "Whether $INSTRUCTION_ROLES and $INSTRUCTION_RECORDS require the function-based backward-pass artifact reference rule."
---

**Subject:** Next Priorities Bundle (Priorities 2-6)
**Type:** Owner Workflow Plan
**Date:** 2026-03-20

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Internal documentation and general templates only | low |
| **2. Shared artifact impact** | Modifies core conversation templates and workflow instruction files | elevated |
| **3. Step dependency** | Independent changes that can be implemented in parallel | low |
| **4. Reversibility** | Text additions to markdown files are easily reverted | low |
| **5. Scope size** | Touches 5-7 different files across `a-docs/` and `general/` | elevated |

**Verdict:** Tier 2 — Multiple template and role files are being modified, requiring structured proposal and review to ensure consistency, particularly for the general library updates.

---

## Routing Decision

Tier 2. The elevated impact on shared artifacts (brief templates, update templates) and the multi-file scope warrant the standard A-Society Framework Development workflow. The Curator will draft the proposal for all five items.

---

## Path Definition

1. Owner — Phase 0 Plan and Phase 1 Briefing (current session)
2. Curator — Phase 1 Proposal
3. Owner — Phase 2 Review
4. Curator — Phase 3 Implementation and Phase 4 Registration

---

## Known Unknowns

- Whether `$GENERAL_OWNER_ROLE` Brief-Writing Quality section requires a corresponding update for the per-file summary and edit-mode fields.
- Whether `$INSTRUCTION_ROLES` and `$INSTRUCTION_RECORDS` require the same generalizable rule for function-based backward-pass artifact references.
