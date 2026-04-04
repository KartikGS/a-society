# A-Society Framework Update — 2026-04-04

**Framework Version:** v29.0
**Previous Version:** v28.0

## Summary

This update introduces support for project-specific improvement instructions required by the programmatic runtime. Adopting projects that use the runtime must now create and register two new phase-specific instruction files in their `a-docs/improvement/`.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gaps in `a-docs/` for projects using the runtime — Curator must review |
| Recommended | 1 | Improvements worth adopting for all projects |
| Optional | 0 | Context-dependent improvements — adopt only if the problem applies |

---

## Changes

### Project-Specific Phase Files for Runtime

**Impact:** Breaking
**Affected artifacts:** `$INSTRUCTION_IMPROVEMENT` (`a-society/general/instructions/improvement/main.md`) / `$GENERAL_MANIFEST` (`a-society/general/manifest.yaml`)
**What changed:** Added documentation for `improvement/meta-analysis.md` and `improvement/synthesis.md` phase files; updated the manifest to include these as conditional artifacts.
**Why:** The runtime requires project-specific instruction targets rather than general library templates with unresolved placeholders.
**Migration guidance:** If your project uses the A-Society programmatic runtime, the Curator must create `$[PROJECT]_IMPROVEMENT_META_ANALYSIS` and `$[PROJECT]_IMPROVEMENT_SYNTHESIS` in `a-docs/improvement/` and register them in the index. Base them on the corresponding general templates and resolve all `[PROJECT_*]` placeholders (see the new section in `$INSTRUCTION_IMPROVEMENT` for details).

### Record-Folder Artifact Path Clarification

**Impact:** Recommended
**Affected artifacts:** `$INSTRUCTION_IMPROVEMENT` (`a-society/general/instructions/improvement/main.md`)
**What changed:** Added a note clarifying that findings in record folders are repository-tracked files, not temporary system artifacts.
**Why:** Prevents confusion about write permissions and persistence of backward pass results when using a records structure.
**Migration guidance:** No structural change required; Curators should review the note to ensure correct handling of record-folder findings.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
