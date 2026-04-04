---
type: owner-to-runtime-developer-brief
date: "2026-04-04"
status: Active
---

**To:** Runtime Developer
**From:** Owner
**Subject:** runtime-state-isolation — two defensive fixes
**Record:** `a-society/a-docs/records/20260404-runtime-state-isolation/`

*Note: No proposal artifact is required before implementation begins. This flow has no Proposal phase per the workflow plan.*

---

## Context

A live runtime session was corrupted by stale state left behind by an integration test. Root cause analysis identified two independent structural gaps:

1. `unified-routing.test.ts` calls `SessionStore.init()` and `SessionStore.saveFlowRun(...)` directly, writing to the global `runtime/.state/` directory. Its `finally` block does not clean up this state. The stale `flow.json` persisted after the test run.

2. `startUnifiedOrchestration` in `orchestrator.ts` calls `SessionStore.loadFlowRun()` and, if a flow is found, immediately resumes it — without checking whether `flowRun.projectRoot` matches the `workspaceRoot` argument passed in. When the stale test flow (pointing to a `/tmp/` test directory) was loaded, the orchestrator routed a real user session into it.

The result: the LLM received a degenerate context bundle for a test role (`test-project__Next`), hallucinated file tool calls, emitted an invalid handoff format, and the session terminated without any useful work. The stale flow.json now sits at `runtime/.state/flow.json` with `status: "awaiting_human"`.

---

## Scope

### Fix 1 — Test state isolation

**File:** `runtime/test/integration/unified-routing.test.ts`

The test must not write to the global `runtime/.state/` directory. Choose one of the following approaches:

**Option A — Env-var configurable state dir (preferred):** Modify `runtime/src/store.ts` so that `STATE_DIR` is derived from an env var (e.g., `A_SOCIETY_STATE_DIR`) when set, falling back to the current default (`runtime/.state`) when unset. In the test, set `process.env.A_SOCIETY_STATE_DIR` to a temp-dir path before calling `SessionStore.init()`, and clean up that temp dir in the `finally` block.

**Option B — Direct cleanup:** In the test's `finally` block, delete the state written by the test. Requires knowing the internal `STATE_DIR` path (currently `runtime/.state`) — creates a fragile coupling to an implementation detail.

Option A is preferred because it isolates any future test naturally without each test needing to know the internal path. However, if Option A introduces complexity that outweighs the benefit at this scale, document the rationale for choosing Option B in the integration validation record.

**If Option A is implemented:** `A_SOCIETY_STATE_DIR` is an internal-use env var for tests. It is not operator-facing and should not be documented in `INVOCATION.md` unless you determine it has legitimate operator use cases. Flag this decision in the integration validation record for the TA and Curator to evaluate.

### Fix 2 — Project identity check in `startUnifiedOrchestration`

**File:** `runtime/src/orchestrator.ts`

After `let flowRun = SessionStore.loadFlowRun();` and before entering the bootstrap or while-loop path, add a guard: if `flowRun` is not null and `flowRun.projectRoot !== workspaceRoot`, the loaded flow is stale (belongs to a different project). In this case:
- Emit a clear console warning naming both the loaded `flowRun.projectRoot` and the current `workspaceRoot`
- Set `flowRun = null` so the bootstrap path runs, starting a fresh session

Do not delete `flow.json` automatically — warn the user and let them clear it manually. This preserves optionality in case the state holds value they want to inspect.

---

## Files Changed

| File | Action | Notes |
|---|---|---|
| `runtime/src/orchestrator.ts` | Modify | Add project identity guard after `loadFlowRun()` |
| `runtime/src/store.ts` | Modify (if Option A) | Make `STATE_DIR` env-var configurable |
| `runtime/test/integration/unified-routing.test.ts` | Modify | Isolate test state; clean up in `finally` |
| `runtime/INVOCATION.md` | Modify if needed | Only if `A_SOCIETY_STATE_DIR` is determined to be operator-facing |

---

## Integration Validation

After implementation, confirm:

1. Running the integration test no longer writes to or leaves state in `runtime/.state/`.
2. When a stale `flow.json` with a mismatched `projectRoot` is present in `.state/`, `startUnifiedOrchestration` emits the project-mismatch warning and runs the bootstrap path rather than resuming the stale flow.
3. When a valid `flow.json` with a matching `projectRoot` is present (status: `'running'`), `startUnifiedOrchestration` still resumes it correctly — the guard must not break legitimate resume behavior.

Document the validation steps and outcomes in the integration validation record filed in this record folder.

---

## Open Questions

None. Implementation approach for Fix 1 is the one known unknown; both options are specified and the Runtime Developer selects between them with documented rationale.

---

## Handoff

Next session: Runtime Developer.

```
Next action: Implement both fixes per this brief; run integration validation; file the integration validation record in this record folder.
Read: a-society/a-docs/records/20260404-runtime-state-isolation/02-owner-to-runtime-developer-brief.md
Expected response: Integration validation record (next available sequence slot in this record folder) confirming both fixes implemented and all three validation checks passed.
```
