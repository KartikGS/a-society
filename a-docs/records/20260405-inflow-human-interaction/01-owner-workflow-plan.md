---
type: owner-workflow-plan
date: "2026-04-05"
complexity:
  domain_spread: low
  shared_artifact_impact: low
  step_dependency: moderate
  reversibility: low
  scope_size: low
tier: 3
path:
  - Owner — Intake & Briefing
  - Technical Architect — Phase 0 Architecture Design
  - Owner — Phase 0 Gate
  - Runtime Developer — Implementation & Integration Validation
  - Technical Architect — Integration Review
  - Owner — Integration Gate
  - Curator — Registration
  - Owner — Forward Pass Closure
known_unknowns:
  - "How to distinguish 'no handoff block emitted' (agent asking a clarification question) from 'handoff block present but malformed' (parse error requiring model retry) — TA determines the interface design"
  - "Whether runtime/INVOCATION.md needs updating to document the changed in-flow session behavior"
---

**Subject:** In-Flow Human Interaction — allow in-flow agents to pause and ask the human questions
**Type:** Owner Workflow Plan
**Date:** 2026-04-05

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Runtime layer only — `orchestrator.ts`, `orient.ts`, `handoff.ts` | low |
| **2. Shared artifact impact** | Runtime source files only; no index changes; `INVOCATION.md` possibly | low |
| **3. Step dependency** | TA Phase 0 determines interface design; implementation depends on that decision | moderate |
| **4. Reversibility** | Runtime source changes; easily revisable | low |
| **5. Scope size** | 2–3 runtime files, one Runtime Developer session, TA advisory + review | low |

**Verdict:** Tier 3 — step dependency (moderate) on TA Phase 0 interface design, and the Runtime Dev workflow requires the full pipeline for all runtime layer changes.

---

## Routing Decision

Routes through the Runtime Development workflow. Complexity scores are generally low, but the Runtime Dev workflow requires a Phase 0 TA architecture design gate before any implementation. The key design question — how to distinguish a clarification-requesting response from a malformed handoff at the error/behavioral level — has interface implications across `handoff.ts`, `orient.ts`, and `orchestrator.ts` that belong in TA scope.

---

## Path Definition

1. Owner — Intake & Briefing (this artifact + TA brief)
2. Technical Architect — Phase 0 Architecture Design
3. Owner — Phase 0 Gate
4. Runtime Developer — Implementation & Integration Validation
5. Technical Architect — Integration Review
6. Owner — Integration Gate
7. Curator — Registration
8. Owner — Forward Pass Closure

---

## Known Unknowns

1. How to distinguish "no handoff block emitted" (agent is asking a clarification question and needs human input) from "handoff block present but malformed" (model error requiring automatic retry with error feedback). TA decides whether to split `HandoffParseError` into subtypes, change the behavioral contract in `runInteractiveSession`, or use another mechanism.
2. Whether `runtime/INVOCATION.md` needs updating to document that in-flow agents can pause for user interaction.
