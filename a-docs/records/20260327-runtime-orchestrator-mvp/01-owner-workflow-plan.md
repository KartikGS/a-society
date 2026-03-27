---
type: owner-workflow-plan
date: "2026-03-27"
complexity:
  domain_spread: high
  shared_artifact_impact: high
  step_dependency: high
  reversibility: high
  scope_size: high
tier: 3
path:
  - Owner - Intake & Briefing
  - Technical Architect - Phase 0 Architecture Design
  - Owner - Phase 0 Gate Review
  - Runtime Developer - Implementation Phases (deferred to Phase 0 output)
  - Runtime Developer - Integration Validation
  - Technical Architect - Integration Review
  - Owner - Integration Gate
  - Curator - Registration
  - Owner - Forward Pass Closure
known_unknowns:
  - "Implementation phase decomposition and count — determined by Phase 0 architecture output"
  - "Whether implementation phases can be parallelized — TA determines in Phase 0"
  - "Full session model table (sessions × phases) — deferred pending Phase 0 per workflow specification"
---

**Subject:** Runtime Orchestrator MVP
**Type:** Owner Workflow Plan
**Date:** 2026-03-27

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | New TypeScript/Node.js application layer; LLM API integration; interaction with existing tooling layer; session lifecycle management — multiple distinct technical and architectural domains | high |
| **2. Shared artifact impact** | Runtime becomes A-Society work product registered in the public index; Phase 0 architecture is binding for all implementation; multiple a-docs/ and public index entries required | high |
| **3. Step dependency** | Entire flow gated on Phase 0 output; implementation phases cannot be defined until architecture is approved; integration validation requires completed implementation; later steps depend heavily on earlier decisions | high |
| **4. Reversibility** | Phase 0 architectural decisions are binding and set direction for the entire runtime layer; significant implementation investment once underway — poorly reversible | high |
| **5. Scope size** | Four roles (TA, Runtime Developer, Curator, Owner); entirely new top-level system layer (`runtime/`); public index updates; new a-docs/ entries | high |

**Verdict:** Tier 3 — all five axes are elevated. Full pipeline required.

---

## Routing Decision

Routes to the **Runtime Development workflow** (`$A_SOCIETY_WORKFLOW_RUNTIME_DEV`). This flow is tagged `[L][ADR]` — a large, direction-setting strategic item with direction explicitly agreed during the runtime-layer-vision flow (2026-03-26). All five complexity axes are elevated. The workflow is fully gated on a Phase 0 architecture design that defines all subsequent phases; nothing downstream can be pre-specified. Tier 3 is the only appropriate routing.

---

## Path Definition

1. Owner — Intake & Briefing
2. Technical Architect — Phase 0 Architecture Design
3. Owner — Phase 0 Gate Review
4. Runtime Developer — Implementation Phases (composition and count deferred to Phase 0 output)
5. Runtime Developer — Integration Validation
6. Technical Architect — Integration Review
7. Owner — Integration Gate
8. Curator — Registration
9. Owner — Forward Pass Closure

---

## Known Unknowns

- **Implementation phase decomposition and count** — The Phase 0 architecture design determines the component breakdown and implementation sequencing. These phases cannot be pre-specified at intake; `workflow.md` will be updated when Phase 0 is approved.
- **Parallelization** — Whether any implementation phases can run concurrently is a Phase 0 determination. If parallel tracks are declared, the Owner must pre-assign sub-labeled sequence positions in `workflow.md` at that point per `$A_SOCIETY_RECORDS`.
- **Full session model table** — Per `$A_SOCIETY_WORKFLOW_RUNTIME_DEV`, the sessions × phases table is deferred pending Phase 0 output.
