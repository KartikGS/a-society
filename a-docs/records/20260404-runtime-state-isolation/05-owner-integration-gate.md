---
type: owner-integration-gate
date: "2026-04-04"
status: Approved
---

**To:** Curator
**From:** Owner
**Subject:** runtime-state-isolation — integration gate approved
**Record:** `a-society/a-docs/records/20260404-runtime-state-isolation/`

---

## Decision

**Approved.** Both fixes are correctly implemented and verified against the actual source files.

---

## Verification Against Implementation

The following claims in the validation record were confirmed by direct re-reading of the implementation files at review time:

**`runtime/src/store.ts`**: `getStateDir()` checks `process.env.A_SOCIETY_STATE_DIR` at call time (not module load time). This means the env var set in the test before `SessionStore.init()` is correctly picked up. All static methods call `getStateDir()` on each invocation — no stale path captured at startup. ✓

**`runtime/src/orchestrator.ts`**: Identity guard is placed immediately after `SessionStore.loadFlowRun()`, before either the bootstrap branch or the while loop. Checks `flowRun.projectRoot !== workspaceRoot`, emits a warning naming both paths, and sets `flowRun = null`. Warning text matches the validation record's log output exactly. ✓

**`runtime/test/integration/unified-routing.test.ts`**: `testStateDir` is a subdirectory of the test's temp base (`tmpBase/.state`). `process.env.A_SOCIETY_STATE_DIR` is assigned before `SessionStore.init()`. `stateVersion: '2'` is present in the flow run fixture. `fs.rmSync(tmpBase, { recursive: true, force: true })` is the final `finally` action, cleaning up both the test project and the isolated state dir. ✓

---

## Observation (non-blocking)

The test does not unset `process.env.A_SOCIETY_STATE_DIR` in its `finally` block. At current scale — standalone test scripts executed individually — this is benign. If tests are ever combined into a single process (e.g., via a test runner), a subsequent test could inherit the deleted temp path and fail. This is not a defect in the current implementation; it is flagged for the Curator to track as a known-future-concern under the broader runtime integration test infrastructure item.

---

## Authorization for Curator

The Curator's scope for this flow is minimal. The implementation touches only:
- `runtime/src/store.ts` — implementation file, not indexed
- `runtime/src/orchestrator.ts` — implementation file, not indexed
- `runtime/test/integration/unified-routing.test.ts` — test file, not indexed

`INVOCATION.md` was deliberately not updated. The Runtime Developer and TA both flagged `A_SOCIETY_STATE_DIR` as internal-use only at this stage, with operator documentation deferred. The Curator should:

1. Confirm that no new files requiring index registration were created in this flow.
2. Confirm `runtime/INVOCATION.md` is unchanged (appropriate per the brief's guidance and TA concurrence).
3. File the registration confirmation as the next artifact in this record folder.

`[Curator authority — implement directly]` for the registration check. No proposal artifact required.
