---

**Subject:** Archetype template Handoff Output drift — path portability missing from all six archetypes
**Type:** Owner Backward-Pass Findings
**Date:** 2026-03-15

---

## Update Report Determination Assessed

The Curator determined no standalone report is required and recommends an Optional entry in the next qualifying report. This is correct.

The archetype templates are used when creating new role documents, not directly instantiated at project initialization. Adopting projects' existing role documents were created from `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` — both corrected in v11.0. This change affects only future role creation. No adopting project is structurally broken by the pre-v11.0 archetype text; any project that has already created custom roles from the archetypes may optionally backfill the portability sentence, but their a-docs are not incorrect in the way that the v11.0 Breaking changes were.

Optional classification, deferred to next qualifying report: confirmed.

---

## Flow Assessment

**Brief quality:** The brief provided exact before/after text for all six archetypes. This eliminated the proposal round entirely — appropriate for a fully-specified mechanical consistency change. The pattern is sound and should be the default for similar maintenance briefs going forward.

**Implementation:** Clean and consistent. The `replace_all` approach for the five identical Archetype 2–6 instances was the right technique.

**No additional findings.**

---

## Flow Status

Closed. All artifacts complete:
- `01-owner-to-curator-brief.md` — brief filed
- `02-curator-findings.md` — implementation complete, Curator backward pass done
- `03-owner-findings.md` — Owner backward pass complete
