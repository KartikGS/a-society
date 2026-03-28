---
type: owner-workflow-plan
date: "2026-03-28"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: low
  reversibility: low
  scope_size: moderate
tier: 3
path:
  - "TA - Phase 0 Architecture Design"
  - "Owner - Phase 0 Gate"
  - "Runtime Developer - Implementation"
  - "Runtime Developer - Integration Validation"
  - "TA - Integration Review"
  - "Owner - Integration Gate"
  - "Curator - Registration"
  - "Owner - Forward Pass Closure"
known_unknowns:
  - "Where synthesisRole is derived from — env var, workflow document, or runtime config object; TA to resolve in Phase 0 design."
---

**Subject:** runtime-env-bundle — dotenv support, provider catch block fix, synthesisRole parameterization, INVOCATION.md update
**Type:** Owner Workflow Plan
**Date:** 2026-03-28

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single domain — all changes are within the runtime layer (`runtime/src/`, `runtime/INVOCATION.md`) | low |
| **2. Shared artifact impact** | `runtime/INVOCATION.md` is externally accessible; `.env.sample` and `.gitignore` are new files with no downstream index coupling | moderate |
| **3. Step dependency** | Items are largely independent; `synthesisRole` parameterization requires a TA design decision before implementation, but dotenv and catch-block fixes are mechanical and do not depend on it | low |
| **4. Reversibility** | All changes are easily undone — no structural or schema changes | low |
| **5. Scope size** | ~7 files across 2 active roles (Runtime Developer, Curator for registration); TA in advisory mode | moderate |

**Verdict:** Tier 3 — Full Runtime Dev pipeline mandated for any runtime code implementation; TA advisory is warranted for the synthesisRole design decision.

---

## Routing Decision

Tier 3 via the Runtime Development workflow. Not driven by complexity weight alone — the workflow mandate applies to any runtime code change regardless of size. TA Phase 0 advisory is the gate because the synthesisRole parameterization carries a design decision (derivation source) that must be resolved before implementation begins. The remaining three items (dotenv, catch-block fix, INVOCATION.md update) are mechanical and can be confirmed as such in the TA advisory.

---

## Path Definition

1. **TA** — Phase 0 architecture design advisory: resolve synthesisRole derivation source; confirm dotenv and catch-block items are mechanical (no interface changes)
2. **Owner** — Phase 0 gate: review and approve TA advisory before implementation begins
3. **Runtime Developer** — Implement all four items against the approved advisory
4. **Runtime Developer** — Integration validation: end-to-end test of the composed changes
5. **TA** — Integration review: assess implementation against the approved advisory
6. **Owner** — Integration gate: sign off on integrated product
7. **Curator** — Registration: verify index entries for any newly created or modified files; update `$A_SOCIETY_AGENT_DOCS_GUIDE` if needed
8. **Owner** — Forward pass closure and backward pass initiation

---

## Known Unknowns

- Where `synthesisRole` is derived from — env var (e.g., `SYNTHESIS_ROLE`), workflow document field, or runtime config object. TA to resolve in Phase 0 design. All three options are viable; the choice affects whether the fix is purely local to `triggers.ts` or requires a config-layer change.
