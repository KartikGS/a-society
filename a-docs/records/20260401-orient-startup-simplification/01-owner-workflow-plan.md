---
type: owner-workflow-plan
date: "2026-04-01"
complexity:
  domain_spread: low
  shared_artifact_impact: low
  step_dependency: low
  reversibility: low
  scope_size: low
tier: 2
path:
  - Owner — Intake & Brief
  - Runtime Developer — Implementation
  - Owner — Forward Pass Closure
known_unknowns: []
---

**Subject:** orient-startup-simplification
**Type:** Owner Workflow Plan
**Date:** 2026-04-01

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single domain — runtime layer only (`orient.ts`, `runtime/INVOCATION.md`) | low |
| **2. Shared artifact impact** | `runtime/INVOCATION.md` is a public doc but only the `orient` command description changes — no structural or interface change | low |
| **3. Step dependency** | Owner briefs → Runtime Developer implements → Owner closes; no decision in one step gates a design decision in another | low |
| **4. Reversibility** | String changes; easily reverted | low |
| **5. Scope size** | 2 files, 1 non-Owner role | low |

**Verdict:** Tier 2 — All complexity axes are low. Tier 2 (not Tier 1) because the Owner cannot implement TypeScript; requires Runtime Developer. Lightest possible Tier 2.

---

## Routing Decision

Runtime Dev workflow, with Phase 0 TA gate omitted. The Runtime Dev workflow mandates a Phase 0 architecture design gate as a structural prerequisite for implementation. That gate is designed for component decomposition, session management decisions, and LLM API integration design — none of which apply here. The change is: (1) one behavioral prompt string in `orient.ts`, (2) two log strings in `orient.ts`, and (3) the `orient` command description text in `runtime/INVOCATION.md`. There is no architecture to design. Routing directly to Runtime Developer implementation from Owner brief.

---

## Path Definition

1. Owner — Intake & Brief — produce `02-owner-to-runtime-developer-brief.md` directing the exact changes
2. Runtime Developer — Implementation — update `orient.ts` (initial message + log strings) and `runtime/INVOCATION.md` (`orient` command description)
3. Owner — Forward Pass Closure — confirm changes, update log, initiate backward pass

---

## Known Unknowns

None.
