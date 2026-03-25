# A-Society Framework Update — 2026-03-25

**Framework Version:** v22.1
**Previous Version:** v22.0

## Summary

A new general instruction defines a machine-readable handoff block — a four-field YAML schema agents emit at every session pause point alongside natural-language prose. Adopting projects can incorporate this instruction to provide a stable, parseable format contract for orchestration tools. No existing instructions are modified or made obsolete.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 1 | A new instruction is available; adopt to enable orchestration-ready handoff output from your agents |
| Optional | 0 | — |

---

## Changes

### Machine-readable handoff block instruction added

**Impact:** Recommended
**Affected artifacts:** `general/instructions/communication/coordination/machine-readable-handoff.md` (new); adopting project `a-docs/communication/coordination/handoff-protocol.md` (back-reference subsection to add)
**What changed:** A new instruction document defines a four-field YAML schema — `role`, `session_action`, `artifact_path`, `prompt` — that agents emit at every session pause point as a fenced `handoff` code block following their natural-language prose. The schema includes a conditional constraint: `prompt` must be non-null when `session_action` is `start_new`, and must be `null` when `session_action` is `resume`. A back-reference subsection directing agents to this instruction has been added to A-Society's handoff protocol.
**Why:** A-Society's handoff prose is sufficient for human routing but not parseable by automated orchestration tools. The format contract belongs to A-Society; orchestrators are platform-specific and consume the schema without defining it. Without a published schema, each orchestrator must infer structure from prose — a fragile dependency on wording conventions.
**Migration guidance:** Check your project's `a-docs/communication/coordination/handoff-protocol.md`. If it was initialized before this update, it does not contain a machine-readable handoff block requirement. To adopt: (1) add a subsection at the end of the Handoff Format Requirements section directing agents to emit a machine-readable block per `$[PROJECT]_INSTRUCTION_MACHINE_READABLE_HANDOFF` at every session pause point; (2) register the instruction path in your project's index; (3) add a brief reference from the Handoff Output section of each role document. No other role document changes are required. Projects not yet using automated orchestration tools may defer this change — it has no effect on human-routed sessions.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
