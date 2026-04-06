**From:** Owner
**To:** Runtime Developer
**Subject:** Phase 0 Gate — Approved with one correction
**Record:** `a-society/a-docs/records/20260405-inflow-human-interaction/`
**Date:** 2026-04-05

---

## Decision

**Approved.** The `type: prompt-human` typed signal design is correct and the advisory is complete enough to implement from. One behavioral correction is required before the Runtime Developer begins.

---

## Rationale

The design satisfies the core requirement cleanly. The `prompt-human` signal is explicit (no fragile heuristics), categorically distinct from routing signals (no dummy fields), and slots naturally into the existing `advanceFlow` retry loop as a third case alongside `HandoffParseError` and normal handoff. The session history model is preserved: the agent receives the full Q&A exchange on its next turn. The `[LIB]` scope (§4: `machine-readable-handoff.md`) is properly surfaced for Curator registration.

---

## Correction Required

**Empty input in `readHumanInput` must re-prompt, not exit.**

The TA advisory recommends resolving `null` on empty input (treating it as exit). This is inconsistent with the existing bootstrap REPL in `orient.ts` (lines 146–149), which silently re-prompts on empty. An accidental Enter press during an in-flow clarification exchange should not abandon the session.

Implement `readHumanInput` as follows: empty input → re-prompt. Only `exit`, `quit`, or input stream close should resolve `null` and trigger flow suspension. Update the `rl.question` callback accordingly.

---

## Implementation Notes

1. **`INVOCATION.md` assessment:** The Runtime Developer must assess whether `runtime/INVOCATION.md` needs updating to document that in-flow agents can pause for human input via `prompt-human`. If the operator-facing docs describe session flow in a way that is now incomplete, update them. If not, no change needed.

2. **`[LIB]` flag for Curator:** `machine-readable-handoff.md` is under `general/instructions/` — this is a `[LIB]` change. The Curator must assess whether a framework update report is warranted per `$A_SOCIETY_UPDATES_PROTOCOL`.

3. All other aspects of the advisory are approved as specified. The §5 per-file implementation requirements are binding.

---

## Files Changed (from TA §4, confirmed)

| File | Action |
|---|---|
| `a-society/runtime/src/types.ts` | Add `{ kind: 'awaiting_human' }` to `HandoffResult` union |
| `a-society/runtime/src/handoff.ts` | Parse `type: prompt-human`; return `{ kind: 'awaiting_human' }` |
| `a-society/runtime/src/orchestrator.ts` | Add `readline` import; add `readHumanInput` (re-prompt on empty); handle `awaiting_human` in `advanceFlow` loop |
| `a-society/general/instructions/communication/coordination/machine-readable-handoff.md` | Document `type: prompt-human` signal |
| `a-society/runtime/INVOCATION.md` | Assess and update if operator docs are now incomplete |

---

```handoff
role: Runtime Developer
artifact_path: a-society/a-docs/records/20260405-inflow-human-interaction/04-owner-phase0-gate.md
```
