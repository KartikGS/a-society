---
type: owner-workflow-plan
date: "2026-04-01"
complexity:
  domain_spread: moderate
  shared_artifact_impact: moderate
  step_dependency: low
  reversibility: low
  scope_size: low
tier: 2
path:
  - Owner — Intake & Briefing
  - Tooling Developer — Component 7 removal; Component 3 structural invariant extension
  - Runtime Developer — triggers.ts cleanup; synthesis role hardcode
  - Owner — Convergence review
  - Curator — Documentation updates
  - Owner — Forward Pass Closure
known_unknowns: []
---

**Subject:** C7 removal, Component 3 structural extension, synthesis role hardcode
**Type:** Owner Workflow Plan
**Date:** 2026-04-01

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches tooling source (`workflow-graph-validator.ts`, `plan-artifact-validator.ts`) and runtime source (`triggers.ts`), plus documentation across `a-docs/`, `tooling/INVOCATION.md`, and `runtime/INVOCATION.md` | moderate |
| **2. Shared artifact impact** | `triggers.ts` is the single file where Component 7's trigger lives and where synthesis role is hardcoded — both changes land in the same file but are assigned to Runtime Developer in a single track; documentation updates span coupling map, architecture doc, invocation docs, and the tooling dev workflow doc | moderate |
| **3. Step dependency** | Implementation tracks are independent (different source directories); one soft dependency resolved in brief (Runtime Developer's Component 3 call update requires knowing the new interface — specified upfront by Owner) | low |
| **4. Reversibility** | All code deletions are recoverable via version control; documentation changes are straightforward to revert | low |
| **5. Scope size** | ~8 files across `tooling/src/`, `runtime/src/`, `runtime/`, `tooling/`, and `a-docs/` | low |

**Verdict:** Tier 2 — multi-domain, bounded, and fully specified; no open design decisions.

---

## Routing Decision

Three decisions made in this Owner session (2026-04-01): (1) Component 7 removed — plan artifact is not consumed programmatically; artifact existence validation belongs in the orchestrator layer. (2) Component 3 extended with structural invariant checks in a `strict` mode — per-flow `workflow.md` files must have Owner at start/end, and no two directly connected nodes may share the same role. (3) Synthesis role hardcoded as `'Curator'` — the `SYNTHESIS_ROLE` env var was always defaulting to Curator and adds unnecessary configuration surface.

Two parallel implementation tracks (Tooling Developer, Runtime Developer), no TA advisory needed — scope is fully specified. No `general/` changes — no framework update report triggered.

---

## Path Definition

1. Owner — Intake & Briefing (this artifact + `02-owner-to-developer-brief.md`)
2. Tooling Developer — Remove `plan-artifact-validator.ts`; extend `workflow-graph-validator.ts` with strict mode and structural checks [parallel with step 3; pre-assigned: `03a-tooling-developer-completion.md`]
3. Runtime Developer — Update `triggers.ts`: remove Component 7 trigger and import, hardcode `'Curator'`, update Component 3 invocation to strict mode; remove `SYNTHESIS_ROLE` from `.env.sample` [parallel with step 2; pre-assigned: `03b-runtime-developer-completion.md`]
4. Owner — Convergence review: verify both completion artifacts before routing to Curator
5. Curator — Documentation updates (direct implementation, all Curator authority with Owner direction given in brief)
6. Owner — Forward Pass Closure

---

## Known Unknowns

None.
