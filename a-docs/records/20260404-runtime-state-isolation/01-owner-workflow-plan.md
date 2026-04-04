---
type: owner-workflow-plan
date: "2026-04-04"
complexity:
  domain_spread: low
  shared_artifact_impact: low
  step_dependency: low
  reversibility: low
  scope_size: low
tier: 2
path:
  - Owner - Intake & Brief
  - Runtime Developer - Implementation & Integration Validation
  - Technical Architect - Integration Review
  - Owner - Integration Gate
  - Curator - Registration Check
  - Owner - Forward Pass Closure
known_unknowns:
  - "Design choice for test state isolation: direct cleanup in test's finally block vs. env-var configurable STATE_DIR in store.ts. Both are valid; Runtime Developer selects based on what best positions future tests for isolation without requiring each test to know the internal path."
---

**Subject:** runtime-state-isolation
**Type:** Owner Workflow Plan
**Date:** 2026-04-04

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Runtime layer only — `orchestrator.ts`, `store.ts`, one integration test | low |
| **2. Shared artifact impact** | No new indexed artifacts; `INVOCATION.md` update only if a new env var is operator-facing | low |
| **3. Step dependency** | The two fixes are independent; neither depends on decisions from the other | low |
| **4. Reversibility** | Defensive additions; easily reverted | low |
| **5. Scope size** | 2–4 files, one implementation role | low |

**Verdict:** Tier 2 — All axes low. Single runtime domain. Standard Runtime Dev path with Phase 0 waived (targeted bug fixes, not new architecture).

---

## Routing Decision

Routes to the Runtime Development workflow with Phase 0 (TA architecture design) waived. The two issues are targeted defensive fixes: one guard condition added to an existing function, and a test cleanup strategy. Neither constitutes new architecture or new components. The TA integration review is retained to verify correctness of the identity check and that no edge cases were missed.

---

## Path Definition

1. Owner — Intake & Brief (this artifact + `02-owner-to-runtime-developer-brief.md`)
2. Runtime Developer — Implement both fixes; run integration validation
3. Technical Architect — Integration review: verify identity check is correct and complete; verify test isolation approach
4. Owner — Integration gate: review TA assessment
5. Curator — Registration check: confirm no new artifacts require indexing; update `INVOCATION.md` if a new operator-facing env var was introduced
6. Owner — Forward pass closure

---

## Known Unknowns

- Design choice for test state isolation: direct cleanup in the test's `finally` block vs. making `STATE_DIR` configurable via an env var in `store.ts`. Both are valid approaches. Runtime Developer selects based on what best positions the codebase for future test isolation without requiring each test to know the internal state path.
