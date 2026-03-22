# Curator Addendum — Update Report Draft

**Subject:** Improvement docs restructure — separate meta-analysis phase from synthesis phase (Backward Pass Protocol)
**Status:** PENDING_REVIEW
**Type:** Update Report Submission
**Date:** 2026-03-22

---

## Submission Fields (per `$A_SOCIETY_UPDATES_PROTOCOL`)

**Implementation status:** Complete. Phase 3 (Implementation) is done — both `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` updated; `[CUSTOMIZE]` fix applied. Phase 4 (Registration) is pending Owner approval of this report; index updates were not required (no new files created, both files already registered).

**Files changed:**
- `$GENERAL_IMPROVEMENT` — `### How It Works` replaced with `### Meta-Analysis Phase` and `### Synthesis Phase`; `[CUSTOMIZE]` preamble updated
- `$A_SOCIETY_IMPROVEMENT` — `### How It Works` replaced with `### Meta-Analysis Phase` and `### Synthesis Phase` (A-Society instantiation only; not an adopting-project artifact)

**Publication condition:** Two items remain outstanding before publication:
1. Owner approval of this report
2. `$A_SOCIETY_VERSION` update (header field + History table row for v18.1) — to be executed by Curator after approval, as part of the same Phase 4 registration step as publication

---

## Update Report Draft

*Proposed filename: `a-society/updates/2026-03-22-improvement-bp-phase-separation.md`*
*Do not publish until Owner approves.*

---

# A-Society Framework Update — 2026-03-22

**Framework Version:** v18.1
**Previous Version:** v18.0

## Summary

The backward pass protocol section of the general improvement template (`$GENERAL_IMPROVEMENT`) has been restructured: the single `### How It Works` section has been replaced with two explicitly labeled phase sections — `### Meta-Analysis Phase` (for roles producing findings) and `### Synthesis Phase` (for the synthesis role). No content was removed; the change is purely structural. The `[CUSTOMIZE]` preamble in the template has been updated to reference the new heading. Projects that initialized their improvement document from the prior template now have a structurally divergent heading.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 1 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### Backward Pass Protocol: Meta-Analysis Phase and Synthesis Phase replace How It Works

**Impact:** Recommended
**Affected artifacts:** `a-society/general/improvement/main.md`
**What changed:** The `### How It Works` section in the Backward Pass Protocol has been split into two explicitly labeled phase sections. `### Meta-Analysis Phase` now holds the findings-production steps (formerly numbered items 1–3 of How It Works) and all reflection-guidance subsections (What to Reflect On, Analysis Quality, Generalizable Findings, Useful Lenses), promoted from `###` to `####`. `### Synthesis Phase` now holds the synthesis routing steps (formerly item 4 of How It Works). The introductory `[CUSTOMIZE]` preamble has been updated to point to the `"Meta-Analysis Phase"` section instead of the `"How It Works"` section.
**Why:** Findings-role agents and the synthesis role have different responsibilities in the backward pass. A single `How It Works` section required both to read the full block to locate their applicable steps. Separate phase headings let each role navigate directly to their section, and make the phase boundary explicit — a prerequisite for future Component 4 prompt embedding.
**Migration guidance:** Locate your project's instantiation of the improvement protocol (typically `a-docs/improvement/main.md` or equivalent — check `$[PROJECT]_IMPROVEMENT`). In the Backward Pass Protocol section, look for a `### How It Works` heading. If present, replace it with the two-phase structure from the current template: `### Meta-Analysis Phase` (findings-production steps + reflection subsections as `####`) followed by `### Synthesis Phase` (synthesis routing steps). No content needs to be dropped — all items from the original `How It Works` are preserved in the new structure. Also update your `[CUSTOMIZE]` preamble if it still references `"How It Works"` — change the reference to `"Meta-Analysis Phase"`. If your project's improvement document was already customized beyond the standard template, verify that the structural split maps correctly to your role composition before applying.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.

---

*End of update report draft.*

---

## Owner Confirmation Required

The Owner must respond with one of:
- **APPROVED** — Curator publishes the report to `$A_SOCIETY_UPDATES_DIR` and updates `$A_SOCIETY_VERSION` (header field + History table row for v18.1)
- **REVISE** — with specific changes required before resubmission
