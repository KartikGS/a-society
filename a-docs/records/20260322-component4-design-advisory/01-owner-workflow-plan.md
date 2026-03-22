---
type: owner-workflow-plan
date: "2026-03-22"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: elevated
  reversibility: moderate
  scope_size: moderate
tier: 2
path:
  - Owner — Intake & TA Brief
  - Technical Architect — Design Advisory
  - Owner — TA Advisory Review
  - Tooling Developer — Component 4 Implementation
  - Technical Architect — Implementation Verification (on-demand)
  - Owner — Implementation Approval
  - Curator — Documentation Updates
  - Owner — Forward Pass Closure
known_unknowns:
  - "Whether synthesis_role removal affects existing record folders that already have workflow.md (likely exempt as pre-change artifacts; TA to confirm)"
  - "Whether 'remove directive to load improvement docs upfront' touches $GENERAL_IMPROVEMENT (LIB — requires Owner approval) or only $A_SOCIETY_IMPROVEMENT (MAINT — Curator authority); determines whether step 7 needs an Owner checkpoint"
  - "Whether Component 4's improvement doc path reference should be a fixed path known to the component or a new parameter to orderWithPromptsFromFile"
---

**Subject:** Component 4 design advisory — prompt embedding, synthesis_role schema, session prompt distinction
**Type:** Owner Workflow Plan
**Date:** 2026-03-22

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Tooling component (TypeScript) and associated doc updates only — no cross-domain scope | low |
| **2. Shared artifact impact** | `workflow.md` schema change affects all future record folders; `INVOCATION.md` and improvement doc directives are shared reference artifacts | moderate |
| **3. Step dependency** | TA advisory gates implementation; synthesis_role removal design constrains prompt generation design; all three problems are interrelated and must be resolved together before implementation begins | elevated |
| **4. Reversibility** | Code changes are reversible; `workflow.md` schema change does not affect historical record folders (they predate the change) | moderate |
| **5. Scope size** | 1 TypeScript source file + tests, 3–4 documentation files, 4 roles | moderate |

**Verdict:** Tier 2 — elevated step dependency (TA advisory must precede implementation; three interrelated problems cannot be independently resolved by the Developer) drives tier above what domain spread and scope size alone would indicate.

---

## Routing Decision

Tier 2. The three design problems are interrelated: synthesis_role removal changes where Component 4 gets the synthesis role, which constrains how synthesis prompts are generated, which must be co-designed with the session prompt distinction fix. The TA must resolve all three as a unified design before the Developer acts. Step dependency is the primary tier driver.

---

## Path Definition

1. Owner — Intake & TA Brief
2. Technical Architect — Design Advisory (all three problems)
3. Owner — TA Advisory Review
4. Tooling Developer — Component 4 Implementation
5. Technical Architect — Implementation Verification (on-demand; Owner requests if deviations are escalated)
6. Owner — Implementation Approval
7. Curator — Documentation Updates
8. Owner — Forward Pass Closure

---

## Known Unknowns

- Whether synthesis_role removal from `workflow.md` schema affects existing record folders that already have `workflow.md` written (likely exempt as pre-change artifacts, but TA should clarify).
- Whether "remove directive to load improvement docs upfront" touches `$GENERAL_IMPROVEMENT` (LIB — requires Owner approval before implementation) or only `$A_SOCIETY_IMPROVEMENT` (MAINT — Curator authority). Determines whether step 7 needs an Owner checkpoint before the Curator proceeds with that change.
- Whether Component 4's improvement doc path reference should be a fixed path known to the component or a new parameter to `orderWithPromptsFromFile`.
