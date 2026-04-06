**From:** Technical Architect
**To:** Owner
**Subject:** Integration Findings — In-Flow Human Interaction
**Record:** `a-society/a-docs/records/20260405-inflow-human-interaction/`
**Date:** 2026-04-05

---

## Verdict

**Pass with two INVOCATION.md documentation gaps.** The runtime implementation is correct and faithful to the advisory. No behavioral deviations. The two findings below are documentation gaps in `INVOCATION.md` that do not affect runtime correctness but leave operator-facing behavior underdocumented.

---

## Implementation Verification

### `types.ts`
`| { kind: 'awaiting_human' }` added to `HandoffResult` union at line 18. ✓

### `handoff.ts`
`type: prompt-human` dispatch added at lines 78–80, correctly placed before the unknown-type throw. Returns `{ kind: 'awaiting_human' }` with no field validation (correct — no payload fields required). ✓

### `orchestrator.ts`
- `readline` imported at line 12. ✓
- `awaiting_human` handling in `advanceFlow` loop (lines 242–257): on reply, appends to `injectedHistory`, saves session, continues without saving flowRun. On null, sets `flowRun.status = 'awaiting_human'`, saves both session and flowRun, breaks. Matches advisory §3 exactly. ✓
- `readHumanInput` private method (lines 393–413): re-prompts on empty input via recursion (Developer correction applied per Phase 0 gate); resolves null on `exit`, `quit`, or stream close. The recursive re-prompt correctly closes the old readline interface before opening a new one — no resource leak. ✓

### `machine-readable-handoff.md`
Deferred to Curator. Correctly handled per Runtime Developer hard rules — the Developer has no write authority over `general/`. The deferred scope is documented in the completion report and the Curator is identified as the responsible party. ✓

---

## Findings

### Finding 1 — INVOCATION.md: stream-close exit path not documented

**File:** `a-society/runtime/INVOCATION.md`

`readHumanInput` resolves `null` on `rl.on('close', ...)` in addition to `exit`/`quit`. This triggers the same `awaiting_human` suspension path. INVOCATION.md documents only `exit`/`quit` as exit triggers:

> "If the operator enters `exit` or `quit`, the flow status is set to `awaiting_human` and the session is suspended."

Stream close (e.g., piped input exhausted, terminal closed) is a third exit trigger that operators should know about.

**Required fix:** Add stream close to the documented exit conditions. Suggested wording: "If the operator enters `exit` or `quit`, or the input stream closes, the flow status is set to `awaiting_human` and the session is suspended."

---

### Finding 2 — INVOCATION.md: empty-input re-prompt behavior not documented

**File:** `a-society/runtime/INVOCATION.md`

`readHumanInput` re-prompts silently on empty input. An operator who presses Enter without typing anything will see a new `> ` prompt with no explanation. This is intentional behavior (applied as a correction at Phase 0 gate) but is undocumented.

**Required fix:** Add one sentence to the In-Flow Human Interaction section. Suggested addition after the exit semantics sentence: "Empty input (Enter with no text) re-prompts without advancing the session."

---

## Scope Note

Both findings are documentation-only. Neither requires a code change. The Curator's `machine-readable-handoff.md` update and the INVOCATION.md corrections can be batched into a single Curator action.

---

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260405-inflow-human-interaction/07-ta-integration-findings.md
```
