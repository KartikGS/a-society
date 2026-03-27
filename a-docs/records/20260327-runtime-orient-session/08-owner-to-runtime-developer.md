**Subject:** Correction routing — TA integration review findings
**Status:** CORRECTION REQUIRED
**Date:** 2026-03-27
**Artifacts reviewed:** `07-ta-integration-review.md`, `06-runtime-developer-completion.md`

---

## Decision

The integration gate does not clear. The Developer completion report's characterization of "no design deviations" is incorrect — the TA review identified a blocking architectural omission and a non-blocking spec deviation. Both require action before Owner sign-off.

Two roles have actions: the Developer (code corrections) and the TA (spec update). These may proceed concurrently.

---

## Developer Corrections Required

Three corrections are in scope for the Developer's follow-up pass.

### Correction 1 — Registry guard in `orient.ts` [BLOCKING]

Add a registry check at the start of `runOrientSession`, before `buildContextBundle` is called. Import `roleContextRegistry` from `./registry.js`. If `roleKey` is absent from the registry, print the exact error message specified in §2 of the Phase 0 architecture and call `process.exit(1)`.

Required error message:
```
This project's Owner role is not registered in the runtime.
Only registered projects support orient sessions.
```

No other changes to `orient.ts` are required for this correction.

**Why this was not caught in integration validation:** The test used a mock API key that triggered `AUTH_ERROR` before the context gap could manifest. The integration test passed the wrong gate condition — it validated the binary flow up to the LLM call, not registry guard behavior. The follow-up validation record must explicitly demonstrate the guard by testing the unregistered-key code path (not only the successful API path).

### Correction 2 — Literal `\n` in error string [QUALITY]

Fix the escape sequence on line 74 of `orient.ts`. The string `'\\nError during turn: ${error.message}'` produces a literal backslash-n when printed. Replace with a real newline (template literal with `\n`, or a separate `console.error()` call). This is a rendering defect.

### Correction 3 — Unused `contextHash` [QUALITY]

Remove the `contextHash` destructuring in `orient.ts`. Orient sessions do not persist context hashes (no `TurnRecord`, no SessionStore entry). The SHA-256 operation runs and the result is discarded — dead code. Destructure only `bundleContent` from the `buildContextBundle` return value.

---

## TA Spec Update Required (concurrent)

The TA is authorized to update `03-ta-phase0-architecture.md` to reflect the `llm.ts` deviation:

- **§3:** Note that `runtime/src/llm.ts` adds `export type { MessageParam }` to make the type available for import in `orient.ts` across module boundaries.
- **§8 files-changed table:** Add a row for `runtime/src/llm.ts — Modify — Re-export MessageParam type for use by orient.ts`.

No new record artifact is required for this update. The corrected `03` document speaks for itself.

---

## Developer Follow-Up Artifact

After corrections, file `09-runtime-developer-correction.md` in the record folder. It must include:

1. Confirmation that all three corrections are in place.
2. Explicit demonstration that the registry guard fires correctly for an unregistered key — command output or equivalent showing the error message and exit.
3. Explicit statement on any further deviations from the Phase 0 spec introduced during the correction pass (or "none").

---

## Gate Condition

Owner integration gate sign-off will follow the Developer's `09-` correction record. A full TA re-review is not required — the corrections are specified precisely and the Developer confirmation with guard validation is sufficient. Return to Owner when `09-` is filed.
