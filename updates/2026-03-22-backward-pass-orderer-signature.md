# A-Society Framework Update — 2026-03-22

**Framework Version:** v19.0
**Previous Version:** v18.1

## Summary

The `orderWithPromptsFromFile` function in Component 4 (Backward Pass Orderer) now requires a second mandatory argument, `synthesisRole`. This is a breaking change for any caller using the old single-parameter signature. The `$GENERAL_IMPROVEMENT` tooling description was updated to reflect the new signature and to document the embedded phase-instruction behavior of generated prompts. Adopting projects must update their improvement protocol's invocation note and any direct tool invocations.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gap in your current `a-docs/` — Curator must review |
| Recommended | 1 | Improvement worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### `orderWithPromptsFromFile` signature change — two required parameters

**Impact:** Breaking
**Affected artifacts:** `general/improvement/main.md`
**What changed:** `orderWithPromptsFromFile` now requires a second mandatory parameter, `synthesisRole: string`. Old signature: `orderWithPromptsFromFile(recordFolderPath)`. New signature: `orderWithPromptsFromFile(recordFolderPath, synthesisRole)`. The `$GENERAL_IMPROVEMENT` tooling invocation note was updated to reflect this. The `synthesis_role` field was simultaneously removed from the `workflow.md` record folder schema; the synthesis role is now supplied by the calling agent at invocation time rather than read from the record folder.
**Why:** Decouples synthesis role configuration from the record folder. The calling agent always knows the synthesis role at invocation time; embedding it in `workflow.md` was an unnecessary schema dependency. The change also makes Component 4 usable by any project regardless of which role performs synthesis.
**Migration guidance:** Inspect your project's `$[PROJECT]_IMPROVEMENT` (or `a-docs/improvement/main.md`) backward pass tooling description. If it documents `orderWithPromptsFromFile(recordFolderPath)` (single parameter), update the invocation to `orderWithPromptsFromFile(recordFolderPath, synthesisRole)`, where `synthesisRole` is the name of the role that performs backward pass synthesis in your project. Also update any agent that invokes the tool directly. Existing record folders that contain `synthesis_role` in their `workflow.md` do not need to be migrated — the field is silently ignored by the updated component.

---

### Embedded phase-instruction references in Component 4 prompts

**Impact:** Recommended
**Affected artifacts:** `general/improvement/main.md`
**What changed:** Added an "Embedded instructions" paragraph to the `$GENERAL_IMPROVEMENT` backward pass tooling description. Component 4 generated prompts now automatically embed a `Read:` reference to the relevant phase-instruction section (`### Meta-Analysis Phase` or `### Synthesis Phase`) in the improvement document. Roles follow this reference to orient to their phase-specific tasks; no separate session-start loading of the improvement document is required.
**Why:** Previously, the tooling note described invocation only. Agents in adopting projects relying on the template would not know that phase instructions are delivered inline — potentially leading them to attempt loading the full improvement document unnecessarily at session start.
**Migration guidance:** Inspect your project's `$[PROJECT]_IMPROVEMENT` backward pass tooling description. If it lacks an embedded-instructions note after the invocation description, add the following paragraph:

> **Embedded instructions:** Generated prompts automatically embed a `Read:` reference to the relevant phase instructions in this document (`### Meta-Analysis Phase` or `### Synthesis Phase`). Roles follow these references to orient to their phase-specific tasks; no separate session-start loading of the improvement document is required. Consult the project's tooling documentation for the specific invocation path. When no such tool is available, apply the traversal rules above manually.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
