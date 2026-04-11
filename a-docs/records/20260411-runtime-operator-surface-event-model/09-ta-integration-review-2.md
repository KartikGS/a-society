**Subject:** Runtime Operator Surface Event Model — TA Integration Review (Resubmission)
**Type:** Technical Architect → Owner
**Date:** 2026-04-11
**Flow:** `20260411-runtime-operator-surface-event-model`
**Reviewed against:** `03-ta-phase0-design.md`, `06-ta-integration-review.md`

---

## Decision

**APPROVE WITH DOCUMENTED DEVIATION.** The four findings from the prior TA review are resolved, the runtime suite passes end to end, and the landed implementation now matches the approved Phase 1 operator contract on the core live paths. One low-frequency renderer-ownership deviation remains on an edge resume guard; it is documented below and should be normalized on the next runtime-surface touch, but it is not material enough to hold the integration gate open.

---

## Prior Findings: Resolved

**B1 — Resume path now emits `parallel.active_set`.** Resolved in `a-society/runtime/src/orchestrator.ts:182-190`. After `flow.resumed`, the resume path now reads `workflow.md`, maps active node IDs to roles, and emits `parallel.active_set` when more than one node is active. Coverage is present in `a-society/runtime/test/integration/resume-parallel.test.ts:11-117`, including ordering of `flow.resumed` before the parallel-state notice.

**B2 — `stdout` closure notice removed from `orient.ts`.** Resolved. The prior direct `console.log('\nSession closed.')` path is gone; the close handler now only resolves the pending interaction in `a-society/runtime/src/orient.ts:363-369`. This restores the approved runtime-on-`stderr` / assistant-on-`stdout` boundary for the reviewed closure path.

**N1 — Duplicate linear-successor `role.active` emission suppressed.** Resolved in `a-society/runtime/src/orchestrator.ts:274-283` and `a-society/runtime/src/orchestrator.ts:502-512`. The orchestrator now tracks successor activation emitted at the handoff boundary and suppresses the duplicate when `advanceFlow()` enters the same node. Coverage is present in `a-society/runtime/test/integration/linear-role-active.test.ts:11-169`.

**N2 — Forward-pass closure now has execution-path verification.** Resolved. `a-society/runtime/test/integration/forward-pass-closure.test.ts:11-175` drives a real `forward-pass-closed` typed signal through the orchestrator, verifies the approved operator notice, confirms improvement orchestration is entered, and asserts the flow reaches `completed` after the no-improvement selection.

---

## Verification Performed

I verified the resubmission by:

- reading `a-society/a-docs/records/20260411-runtime-operator-surface-event-model/08-orchestration-developer-corrections-confirmed.md`
- inspecting the corrected runtime source and new integration tests
- running `npm test` in `a-society/runtime/`

The full runtime suite passed with zero failures, including the new `resume-parallel`, `linear-role-active`, and `forward-pass-closure` integration scenarios.

---

## Documented Deviation

One renderer-ownership deviation remains outside the prior correction list:

- `a-society/runtime/src/orchestrator.ts:64-68` still prints the "resuming flow from a different project root" warning directly via `console.warn(...)` rather than through `OperatorEventRenderer`

This does **not** break the approved stream split, because the warning still lands on `stderr`, and it does not affect the normal bootstrap/resume/handoff/repair paths reviewed in this gate. I am therefore not reopening the gate on this edge case alone. However, it does fall short of the strict single-renderer ownership rule in `03-ta-phase0-design.md`, so it should be normalized the next time the runtime operator surface is touched.

---

## Handoff to Owner

The integration gate is met. The runtime operator surface event model is approved for downstream registration and documentation work, with the single documented edge-path deviation above carried as follow-up cleanup rather than a gating defect.

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260411-runtime-operator-surface-event-model/09-ta-integration-review-2.md
```
