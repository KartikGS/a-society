---
type: owner-workflow-plan
date: "2026-03-21"
complexity:
  domain_spread: moderate
  shared_artifact_impact: elevated
  step_dependency: low
  reversibility: low
  scope_size: moderate
tier: 2
path:
  - "Owner — Phase 0, Intake & Briefing"
  - "Curator — Phase 1, Proposal"
  - "Owner — Phase 2, Review"
  - "Curator — Phase 3+4, Implementation & Registration"
  - "Owner — Phase 5, Forward Pass Closure"
known_unknowns:
  - "Whether the synthesis routing simplification (Item 2) should also propagate to $GENERAL_IMPROVEMENT — the general doc still has the 'submit to Owner for approval' path; the Curator should assess during proposal formulation."
  - "Whether $A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER needs a new field for update report drafts (Item 4) — the change requires the draft to appear in the proposal, but whether this demands a template section or is better handled as a workflow instruction is a design call for the Curator."
---

**Subject:** Workflow mechanics corrections bundle — four systemic fixes
**Type:** Owner Workflow Plan
**Date:** 2026-03-21

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches both `a-docs/` and `general/`; spans Curator role, Owner role, improvement docs, and framework workflow | moderate |
| **2. Shared artifact impact** | Curator role and improvement docs are loaded every session; workflow and Owner role are foundational | elevated |
| **3. Step dependency** | All four items are independent — Item 1 does not affect Items 2–4; no decision in one item gates another | low |
| **4. Reversibility** | All changes are edits to existing files; easily reversed | low |
| **5. Scope size** | Approximately 6–7 files across `a-docs/` and `general/` | moderate |

**Verdict:** Tier 2 — The elevated shared artifact impact drives the tier. Items touch files loaded in every session; changes must be proposal-reviewed before implementation. Four items are bundled to avoid multiple sequential flows on related mechanics.

---

## Routing Decision

Tier 2: changes are well-specified but touch shared, high-frequency files. One item (`$GENERAL_IMPROVEMENT` update for Item 3) requires Owner approval as a `[LIB]` change. Remaining items are Curator-authority `[MAINT]` changes that can be implemented in the same pass. Standard Framework Development workflow applies.

---

## Path Definition

1. Owner — create record folder, produce plan and brief, initiate Session B
2. Curator — acknowledge brief, draft proposal covering all four items
3. Owner — review proposal, issue Phase 2 decision
4. Curator — implement approved changes, register, complete all forward-pass work
5. Owner — Phase 5 Forward Pass Closure; initiate backward pass

---

## Known Unknowns

- Whether the synthesis routing simplification (Item 2) should also propagate to `$GENERAL_IMPROVEMENT` — the general doc still has the "submit to Owner for approval" path; the Curator should assess during proposal formulation.
- Whether `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` needs a new structural field for update report drafts (Item 4) — the change requires the draft to appear in the proposal, but whether this demands a template section or is better handled as a workflow instruction is a design call for the Curator.
