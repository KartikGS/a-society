# A-Society Framework Update — 2026-04-05

**Framework Version:** v31.0
**Previous Version:** v30.0

## Summary

This update introduces the `type: prompt-human` handoff signal, enabling autonomous agents to pause for human input within their same session for clarifications, approvals, or missing data. It also documents the `forward-pass-closed` and `meta-analysis-complete` typed signals in the handoff block instruction, closing a documentation gap for the programmatic improvement system.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gaps in your current `$INSTRUCTION_MACHINE_READABLE_HANDOFF` — Curator must review |
| Recommended | 1 | Improvement in `INVOCATION.md` logic (for runtime users) |
| Optional | 0 | — |

---

## Changes

### Typed Handoff Signals (interaction and closure)

**Impact:** Breaking
**Affected artifacts:** `a-society/general/instructions/communication/coordination/machine-readable-handoff.md` (`$INSTRUCTION_MACHINE_READABLE_HANDOFF`)
**What changed:** Added three typed signal forms to the handoff block schema: `prompt-human`, `forward-pass-closed`, and `meta-analysis-complete`.
**Why:** The `prompt-human` signal enables in-flow human interaction, significantly reducing agent failure rates by providing a standard pause point for human input. The `forward-pass-closed` and `meta-analysis-complete` signals are required for the runtime-managed programmatic improvement system.
**Migration guidance:** Assessing your project's instantiation of the machine-readable handoff instruction (resolved via `$[PROJECT]_INSTRUCTION_MACHINE_READABLE_HANDOFF`). Update it to include the new typed signal section and their respective schemas. This ensures any agent working on your project understands how to correctly signal human interaction needs and system transitions.

---

### Runtime Interaction Logic (INVOCATION.md)

**Impact:** Recommended
**Affected artifacts:** `a-society/runtime/INVOCATION.md`
**What changed:** Updated the documentation for "In-Flow Human Interaction" to reflect that the session is suspended if the input stream closes (e.g., pipe end) and that empty input triggers a re-prompt.
**Why:** Improves clarity for operators using the runtime in piped or scripted environments, and provides a more robust interactive REPL experience.
**Migration guidance:** If your project hosts a customized or project-specific `INVOCATION.md` for the runtime, update the section on in-flow human interaction to include the stream-close and empty-input behaviors.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
