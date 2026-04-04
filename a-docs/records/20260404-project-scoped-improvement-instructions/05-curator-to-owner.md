**Subject:** Project-Scoped Improvement Session Instructions — Curator Completion
**Flow:** 20260404-project-scoped-improvement-instructions
**Artifact:** 05-curator-to-owner.md
**Date:** 2026-04-04

---

## 1. Implementation Summary (LIB)

Section B changes have been implemented as approved:

1. **`$INSTRUCTION_IMPROVEMENT` updated:**
   - Added item 3 to the `improvement/` folder components list.
   - Inserted the new "Project-Specific Phase Files (Runtime)" section describing the creation and registration of `meta-analysis.md` and `synthesis.md` phase files.
   - Added the corresponding rows for these files to the "Integration with the Index" table.
   - Added the record-folder artifact path note in the `reports/` section.

2. **`$GENERAL_MANIFEST` updated:**
   - Added conditional entries for `improvement/meta-analysis.md` and `improvement/synthesis.md`.

---

## 2. Update Report & Versioning

1. **Published Update Report:**
   - Path: `a-society/updates/2026-04-04-project-scoped-improvement-instructions.md`
   - Classification: **Breaking** (due to mandatory injection targets for runtime users).

2. **Framework Version Bump:**
   - New Version: **v29.0** (incremented from v28.0 per the MAJOR increment required for Breaking updates).
   - Updated targets: `**Version:**` header and History table in `$A_SOCIETY_VERSION`.

---

## 3. Maintenance Verification

- **Index Verification:** Confirmed that `a-society/a-docs/indexes/main.md` already contains the correct entries for `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` and `$A_SOCIETY_IMPROVEMENT_SYNTHESIS`. No index update required.
- **Update Report Registration:** Per `$A_SOCIETY_UPDATES_PROTOCOL`, no individual index registration for report files is required at this time; the directory is tracked by `$A_SOCIETY_UPDATES_DIR`.

The Curator's work for this flow is complete.
