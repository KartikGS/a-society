# Integration Validation: runtime-state-isolation (2026-04-04)

**Role:** Runtime Developer
**Flow:** runtime-state-isolation (2026-04-04)
**Date:** 2026-04-04

---

## 1. Summary of Changes

Two defensive fixes were implemented to prevent state corruption across projects and isolation during integration testing.

| File | Status | Notes |
|---|---|---|
| `runtime/src/store.ts` | Modified | Implemented `A_SOCIETY_STATE_DIR` env-var support for dynamic state directory location. |
| `runtime/src/orchestrator.ts` | Modified | Added project identity guard in `startUnifiedOrchestration()` after `SessionStore.loadFlowRun()`. |
| `runtime/test/integration/unified-routing.test.ts` | Modified | Isolated test state using a temporary directory; fixed `FlowRun` schema (added `stateVersion: '2'`); added cleanup in `finally`. |

### Implementation Decision: Fix 1 (Option A)
Option A (env-var configurable state dir) was chosen for Fix 1. This provides structural isolation for tests without creating a fragile coupling to the internal `.state` path.

**Documentation Decision:** `A_SOCIETY_STATE_DIR` has been treated as an **internal-use** env var for testing and is **not** currently documented in `INVOCATION.md`. While it has legitimate operator use cases (state relocation, backup, snapshots), its primary immediate value is for test hermeticity. Adding it to the public surface at this stage would require additional validation of edge cases (e.g., path normalization across environments) that were out of scope for this defensive fix. This decision is flagged for the **TA** and **Curator** to evaluate for a future documentation update.

---

## 2. Validation Checks

Three checks were performed as specified in the brief:

### Check 1: Test state isolation
The modified `unified-routing.test.ts` was run from the runtime root.
- **Pass Status:** OK
- **Outcome:** The test passed. Verification of `runtime/.state/` showed that no files were modified nor created by the test run. All test-related state was correctly created and cleaned up in a temp directory.
- **Verification Command:** `ls -l --time-style=full-iso runtime/.state/flow.json` confirmed `mtime` remained at `16:28:27`, despite the test running at `16:45:00`.

### Check 2: Stale flow.json with mismatched projectRoot
A stale `flow.json` was present in `runtime/.state/` containing a different `projectRoot`.
- **Pass Status:** OK
- **Outcome:** When starting a session in the current project, the orchestrator correctly emitted a warning and preceded to bootstrap a fresh session rather than resuming the mismatched flow.
- **Log output confirmed:**
  ```
  [Warning] Resuming flow from a different project root:
    Loaded: /wrong/path
    Expected: /home/kartik/Metamorphosis
  Starting a fresh session instead.
  ```

### Check 3: Valid flow.json with matching projectRoot
A `flow.json` was manually created with matching `projectRoot` and valid status.
- **Pass Status:** OK
- **Outcome:** The orchestrator correctly identified the matching project root and proceeded to advance the flow (resume attempt) without emitting the mismatch warning or attempting to bootstrap.
- **Log output confirmed:** no warning emitted; `advanceFlow` initiated (errored for expected role-file absence in the mock project).

---

## 3. Implementation Deliverable Status

| Item | Status |
|---|---|
| Integration validation report filed (this artifact) | OK |
| `runtime/src/store.ts` implementation | OK |
| `runtime/src/orchestrator.ts` implementation | OK |
| `runtime/test/integration/unified-routing.test.ts` updated | OK |
| `INVOCATION.md` (no update) | OK |

---

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260404-runtime-state-isolation/03-runtime-developer-integration-validation.md
```
