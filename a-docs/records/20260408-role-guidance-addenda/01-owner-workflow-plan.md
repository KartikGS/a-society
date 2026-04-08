---
type: owner-workflow-plan
date: "2026-04-08"
complexity:
  domain_spread: low
  shared_artifact_impact: elevated
  step_dependency: moderate
  reversibility: moderate
  scope_size: moderate
tier: 2
path:
  - Owner - Intake & Briefing
  - Curator - Proposal
  - Owner - Review
  - Curator - Implementation & Registration
  - Owner - Forward Pass Closure
known_unknowns:
  - "Exact local ordering of the new role-guidance clauses within each target section, if a clearer order than the Owner's proposed insertion blocks emerges during proposal preparation."
  - "Whether any existing general-role wording needs minor adjacent cleanup for consistency once the new clauses are inserted."
  - "Framework update report classification, which remains TBD until the Curator applies $A_SOCIETY_UPDATES_PROTOCOL during proposal/implementation."
---

**Subject:** role-guidance-addenda — general TA advisory completeness plus Owner/Curator precision follow-up
**Type:** Owner Workflow Plan
**Date:** 2026-04-08

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single workflow and single layer (the reusable general role-template layer), but spanning three shared role templates. | low |
| **2. Shared artifact impact** | Modifies reusable role templates consumed by adopting projects and likely requires a framework update report draft. | elevated |
| **3. Step dependency** | Proposal must verify current template state, avoid re-adding already-landed guidance, and align wording across three role templates before review and implementation. | moderate |
| **4. Reversibility** | The changes are documentation-only and reversible, but they affect shared guidance relied on by adopters, so careless edits would create migration churn. | moderate |
| **5. Scope size** | Three general role templates, one update-report draft, and the standard Owner/Curator forward pass. | moderate |

**Verdict:** Tier 2 — Shared-library impact requires the standard Curator proposal and Owner review path, but the work remains within a single documentation domain and a lightweight two-role flow.

---

## Routing Decision

Structural readiness passes: the requested work is feasible, falls within existing Owner and Curator authority, and routes cleanly through `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`.

Tier 2 is the correct route because the task modifies existing shared general-library artifacts and likely triggers an update report draft, which requires Curator proposal plus Owner approval before implementation. Tier 3 overhead is not warranted because the work does not cross into tooling, runtime, or a separate advisory/implementation domain.

---

## Path Definition

1. Owner — intake, merged-flow scoping, and Owner-to-Curator briefing
2. Curator — proposal covering the missing reusable TA/Owner/Curator guidance additions and the update report draft
3. Owner — proposal review and decision
4. Curator — implement approved general-role changes and complete registration/update-report publication duties
5. Owner — forward pass closure, including log maintenance and Next Priorities cleanup

---

## Known Unknowns

- Exact local ordering of the new role-guidance clauses within each target section, if a clearer order than the Owner's proposed insertion blocks emerges during proposal preparation.
- Whether any existing general-role wording needs minor adjacent cleanup for consistency once the new clauses are inserted.
- Framework update report classification, which remains TBD until the Curator applies `$A_SOCIETY_UPDATES_PROTOCOL` during proposal/implementation.
