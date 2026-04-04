---
type: owner-workflow-plan
date: "2026-04-04"
complexity:
  domain_spread: elevated
  shared_artifact_impact: elevated
  step_dependency: moderate
  reversibility: moderate
  scope_size: moderate
tier: 2
path:
  - Owner — Intake & Briefing
  - Runtime Developer — Fix improvement.ts path derivation
  - Curator — Create A-Society phase files (MAINT); propose $INSTRUCTION_IMPROVEMENT & $GENERAL_MANIFEST updates (LIB)
  - Owner — Integration gate
  - Curator — Implement approved LIB changes; publish update report
  - Owner — Forward Pass Closure
known_unknowns:
  - "Content adequacy of A-Society-specific improvement phase files: the Curator produces these by resolving [PROJECT_*] placeholders from the general templates; content reviewed at Owner integration gate"
---

**Subject:** Project-Scoped Improvement Session Instructions
**Type:** Owner Workflow Plan
**Date:** 2026-04-04

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Runtime code (`improvement.ts`) + A-Society a-docs (`improvement/`) + general instruction library (`$INSTRUCTION_IMPROVEMENT`, `$GENERAL_MANIFEST`) | elevated |
| **2. Shared artifact impact** | `$INSTRUCTION_IMPROVEMENT` governs improvement folder setup for all adopting projects; `$GENERAL_MANIFEST` governs initialization scaffolding | elevated |
| **3. Step dependency** | Parallel tracks (Runtime Dev + Curator) converge at Owner integration gate; Curator LIB implementation depends on Owner approval of proposal | moderate |
| **4. Reversibility** | LIB changes notify adopters via update report; runtime change is a targeted path replacement — both reversible but require coordination | moderate |
| **5. Scope size** | 4–5 files across 3 domains, 3 roles, 2 parallel tracks | moderate |

**Verdict:** Tier 2 — multi-domain multi-role flow with clear scope and no unresolved design questions; parallel tracks are feasible without a TA advisory given that the runtime change is mechanically specified in prior backward pass findings.

---

## Routing Decision

Tier 2. Elevated domain spread and shared artifact impact drive the multi-role parallel structure. No TA advisory required: the runtime change (replacing two hardcoded path constants with `flowRun.projectRoot`-derived paths) is fully specified in the prior backward pass findings (TA Top Finding 2, Owner Top Findings 1–2). The architectural principle — multi-project runtime hosts must derive injection paths from project context, never hardcode them — is established. The implementation is a targeted substitution.

Multi-domain flow (per `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`): Runtime Developer track and Curator track run in parallel after Owner briefing, converge at Owner integration gate.

**Absorbed at intake:** `[S][LIB]` — Improvement artifact path semantics item. Same target file (`$INSTRUCTION_IMPROVEMENT`), compatible authority (`[LIB]`), same Framework Dev workflow path as this flow's LIB track. Absorbed into Curator brief Change B1, Change 3.

---

## Path Definition

1. Owner — Intake & Briefing (this session; produces `02a-owner-to-curator-brief.md` and `02b-owner-to-runtime-developer-brief.md`)
2. [Parallel] Runtime Developer — Fix `improvement.ts` path derivation (produces `03b-runtime-developer-completion.md`)
3. [Parallel] Curator — Create A-Society-specific improvement phase files (MAINT, on receipt); propose `$INSTRUCTION_IMPROVEMENT` and `$GENERAL_MANIFEST` changes with update report draft (LIB, produces `03a-curator-to-owner.md`)
4. Owner — Integration gate: review runtime completion + Curator proposal; issue decision (produces `04-owner-to-curator.md`)
5. Curator — Implement approved LIB changes; publish update report (produces `05-curator-to-owner.md`)
6. Owner — Forward Pass Closure

**Parallel track sub-labels pre-assigned:**
- `03a-curator-to-owner.md` — Curator proposal (LIB items + update report draft)
- `03b-runtime-developer-completion.md` — Runtime Developer completion report

---

## Known Unknowns

Content adequacy of A-Society-specific improvement phase files: the Curator produces these by resolving `[PROJECT_*]` placeholders from the general templates (`$GENERAL_IMPROVEMENT_META_ANALYSIS`, `$GENERAL_IMPROVEMENT_SYNTHESIS`). Content reviewed at Owner integration gate before approving LIB implementation.
