# A-Society Framework Update — 2026-03-08

## Summary

A-Society has renamed the live artifact filename `agent-docs-guide.md` to `a-docs-guide.md` for the guide document that explains why each a-docs file exists. The change aligns the filename with current project terminology while preserving the existing index variables, so projects that resolve paths through `$INSTRUCTION_AGENT_DOCS_GUIDE` and `$[PROJECT]_AGENT_DOCS_GUIDE` can absorb the change cleanly.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 1 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### Filename Alignment: `agent-docs-guide.md` → `a-docs-guide.md`

**Impact:** Recommended
**Affected artifacts:** `$INSTRUCTION_AGENT_DOCS_GUIDE`, `$GENERAL_CURATOR_ROLE`, `$A_SOCIETY_INITIALIZER`
**What changed:** The instruction file behind `$INSTRUCTION_AGENT_DOCS_GUIDE` now resolves to `a-docs-guide.md`, and the live guidance in `$GENERAL_CURATOR_ROLE` and `$A_SOCIETY_INITIALIZER` now refers to `a-docs-guide.md` instead of `agent-docs-guide.md`. The variable names were intentionally left unchanged so index-based references remain stable.
**Why:** The framework had already shifted from "agent-docs" terminology to "a-docs" in active project language, but the live filename still used the older form. This created unnecessary naming drift between the concept, the instructions, and the operational docs.
**Migration guidance:** Review your project for hardcoded references to `agent-docs-guide.md`, especially in the Curator role, initialization docs, workflow docs, and any onboarding instructions. If your project uses `$[PROJECT]_AGENT_DOCS_GUIDE` consistently and resolves paths through the index, no urgent change is required beyond ensuring the index row points to the current file. If your project hardcodes the filename or you want terminology alignment, rename the project artifact to `a-docs-guide.md`, update the `$[PROJECT]_AGENT_DOCS_GUIDE` row in your project index, and update any live references that still mention the old filename directly.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `$A_SOCIETY_UPDATES_DIR` periodically as part of their maintenance cycle.
