---
type: owner-workflow-plan
date: "2026-03-24"
complexity:
  domain_spread: low
  shared_artifact_impact: low
  step_dependency: low
  reversibility: low
  scope_size: low
tier: 2
path:
  - "Owner — Intake & Authorization"
  - "Tooling Developer — Implementation"
  - "Owner — Review & Forward Pass Closure"
known_unknowns: []
---

**Subject:** component4-synthesis-fixes
**Type:** Owner Workflow Plan
**Date:** 2026-03-24

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single domain — `tooling/src/backward-pass-orderer.ts` and its integration test. No documentation changes, no `general/` changes. | low |
| **2. Shared artifact impact** | None — no public interface changes, no index updates, no shared artifacts affected. Internal code and test only. | low |
| **3. Step dependency** | None — the two fixes are independent of each other. | low |
| **4. Reversibility** | Easily undone — specific code and test changes with no side effects. | low |
| **5. Scope size** | Two files (`backward-pass-orderer.ts`, `test/integration.test.ts`), one role (Tooling Developer). | low |

**Verdict:** Tier 2 — all axes low, but Owner cannot implement code in `tooling/`; Tooling Developer authority is required. Minimal pipeline: no proposal round, no TA advisory, no Curator involvement. Both fixes are fully specified at intake.

---

## Routing Decision

Tier 2 minimal pipeline. All complexity signals are low; the constraint driving tier selection is role authority — the Owner does not implement `tooling/` code. The work routes directly to the Tooling Developer with no proposal round. No TA advisory needed: Fix 1 is internal implementation plumbing (threading an existing parameter to a private function); Fix 2 is a test assertion gap. Both are within Developer authority per the Tooling Developer role document.

---

## Path Definition

1. Owner — Intake & Authorization (this session)
2. Tooling Developer — Implement both fixes; run `npm test` to validate
3. Owner — Review implementation output; close forward pass; initiate backward pass

---

## Known Unknowns

None. Both fixes are fully specified in `02-owner-to-developer-brief.md`. Implementation approach for Fix 1 is within Developer authority — the requirement is that the synthesis prompt produced by `orderWithPromptsFromFile` embeds the record folder path; the threading strategy is the Developer's choice.
