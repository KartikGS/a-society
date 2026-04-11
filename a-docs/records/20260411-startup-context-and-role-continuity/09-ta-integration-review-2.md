**Subject:** Startup Context-Read Timing and Same-Role Session Continuity — TA Integration Review (Resubmission)
**Type:** Technical Architect → Owner
**Date:** 2026-04-11
**Flow:** `20260411-startup-context-and-role-continuity`
**Reviewed against:** `03-ta-phase0-design.md`, `06-ta-integration-review.md`, `07-owner-integration-corrections.md`

---

## Decision

**APPROVE WITH DOCUMENTED VERIFICATION GAP.** The previously blocking implementation defects in the improvement path are resolved, the repeated-role runtime seams are now exercised through the orchestrator, and the full `a-society/runtime` test suite passes end to end in review. One regression-fixture blind spot remains in `observability.test.ts`; it does not reopen the integration gate because the live runtime source is now aligned to the approved contract, but it should be normalized on the next touch.

---

## Prior Findings: Resolved

**B1 — Improvement-session namespace and path resolution now match the live `FlowRun` contract.** Resolved in `a-society/runtime/src/improvement.ts:193-245`. The improvement role key now uses ``${flowRun.projectNamespace}__${entry.role}``, and both improvement instruction paths now resolve from `path.join(flowRun.projectRoot, flowRun.projectNamespace, 'a-docs', 'improvement', ...)` rather than from the workspace root alone.

**B2 — Improvement initialization no longer regresses persisted schema state to v2.** Resolved in `a-society/runtime/src/improvement.ts:156-163`. The initialization path now preserves `flowRun.stateVersion = '3'`, and regression coverage is present in `a-society/runtime/test/observability.test.ts:376-379`, which asserts the flow remains on v3 after improvement-mode selection.

**N1 — Repeated-role coverage now reaches the orchestrator seam.** Resolved in `a-society/runtime/test/integration/same-role-continuity.test.ts:273-449`. The new tests drive `FlowOrchestrator.advanceFlow(...)` to verify:

- successful handoff appends to `flowRun.roleContinuity`
- later same-role node entry includes the continuity section
- same-role parallel activation suppresses continuity injection

This satisfies the runtime-seam verification boundary requested in the prior review.

---

## Verification Performed

I verified the resubmission by:

- reading `a-society/a-docs/records/20260411-startup-context-and-role-continuity/08-orchestration-developer-corrections-confirmed.md`
- inspecting the corrected implementation in `a-society/runtime/src/improvement.ts`
- inspecting the updated regression coverage in `a-society/runtime/test/observability.test.ts` and `a-society/runtime/test/integration/same-role-continuity.test.ts`
- running `npm test` in `a-society/runtime/`

The runtime suite passed with zero failures in review.

---

## Documented Verification Gap

One test-fixture detail remains looser than requested:

- `a-society/runtime/test/observability.test.ts:313-325` still sets `projectNamespace = path.basename(tmpDir)`

That means the fixture now validates the corrected project-scoped improvement-document paths, but it still would not distinguish `flowRun.projectNamespace` from a future regression back to `path.basename(flowRun.projectRoot)` because those two values are identical in this test setup.

I am not holding the gate open on that point alone because:

- the live runtime code now clearly uses `flowRun.projectNamespace`
- the project-scoped document-path fix is covered
- the schema-version regression is covered
- the full runtime suite passes

However, the fixture should be tightened on the next touch by choosing a namespace value that is intentionally different from `path.basename(projectRoot)`.

---

## Handoff to Owner

The integration gate is met. Startup context delivery, first-turn ownership, same-node resume behavior, later same-role continuity, and the in-scope improvement-path updates are now acceptable for downstream closure and follow-on documentation work, with the single verification-gap note above carried as cleanup rather than a gating defect.

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260411-startup-context-and-role-continuity/09-ta-integration-review-2.md
```
