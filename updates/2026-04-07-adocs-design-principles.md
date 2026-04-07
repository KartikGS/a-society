# A-Society Framework Update — 2026-04-07

**Framework Version:** v32.0
**Previous Version:** v31.0

## Summary

This update adds a new required project artifact, `a-docs-design.md`, plus a companion instruction for creating and maintaining it. It also expands the general meta-analysis template with standing a-docs structure checks so Curators can systematically detect front-loaded context, redundant entry-point content, and phase-specific instructions embedded inline in role files.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 2 | Gaps in your current a-docs structure or meta-analysis template — Curator must review |
| Recommended | 0 | — |
| Optional | 0 | — |

---

## Changes

### New required a-docs design-principles artifact

**Impact:** Breaking
**Affected artifacts:** `a-society/general/a-docs-design.md` (`$GENERAL_ADOCS_DESIGN`), `a-society/general/instructions/a-docs-design.md` (`$INSTRUCTION_ADOCS_DESIGN`), `a-society/general/manifest.yaml` (`$GENERAL_MANIFEST`)
**What changed:** Added a new ready-made artifact, `$GENERAL_ADOCS_DESIGN`, and a companion instruction, `$INSTRUCTION_ADOCS_DESIGN`, defining how projects should structure agent-documentation around progressive context disclosure, minimal entry documents, and phase-specific support docs. `$GENERAL_MANIFEST` now includes `a-docs-design.md` as a required copied artifact for new initializations.
**Why:** Projects need an explicit design model for the documentation layer itself. Without one, `agents.md` and role files accumulate runtime-mechanism explanation, redundant links, and phase instructions that belong in separate on-demand documents.
**Migration guidance:** Review whether your project has `a-docs-design.md` at the root of its `a-docs/`. If it does not, create it from the new general template, register it in your project index as `$[PROJECT]_ADOCS_DESIGN`, and add it to the Owner and Curator starting-context set. Then compare your `agents.md` and role files against the design principles and identify any content that should be extracted into on-demand phase documents.

---

### Meta-analysis gains mandatory a-docs structure checks

**Impact:** Breaking
**Affected artifacts:** `a-society/general/improvement/meta-analysis.md` (`$GENERAL_IMPROVEMENT_META_ANALYSIS`)
**What changed:** Added a new `a-docs Structure Checks` section to the general meta-analysis template. The new checks cover redundancy with injected context, phase-coupling inside role files, workflow-conditional inline guidance, over-scoped `agents.md`, addition-without-removal drift, and repeated-header matching discipline.
**Why:** These structural issues recur unless backward-pass work is explicitly told to look for them. Without standing checks, front-loaded context and vestigial inline guidance are treated as incidental style drift instead of a recurring class of documentation errors.
**Migration guidance:** Review your project's meta-analysis instruction file instantiated from `$GENERAL_IMPROVEMENT_META_ANALYSIS`. Update it to include the new `a-docs Structure Checks` section so backward-pass findings explicitly evaluate redundant startup context, phase-specific instructions embedded in role files, and vestigial content left behind after additive changes.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
