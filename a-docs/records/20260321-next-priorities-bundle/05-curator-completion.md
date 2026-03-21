---

**Subject:** Implementation complete — next priorities bundle
**Status:** COMPLETE
**Date:** 2026-03-21

---

## Implementation Summary

All five items from the brief are complete.

| Item | Target | Status |
|---|---|---|
| A — Guardrail order swap | `$GENERAL_IMPROVEMENT`, `$A_SOCIETY_IMPROVEMENT` | Done |
| C — `---` delimiter requirement | `$INSTRUCTION_RECORDS` | Done |
| Priority 2 — Repo-relative paths | `$A_SOCIETY_INDEX` | Done |
| B — Ordered-list insertions | `$GENERAL_OWNER_ROLE` | Done |
| E — Classification scope note | `$A_SOCIETY_OWNER_ROLE`, `$GENERAL_OWNER_ROLE` | Done |

---

## Priority 2 Row Count Verification

**The brief's "98 rows" referred to the total line count of the file (98 lines), not the count of data rows in the table.**

The original index file had 98 lines total. Of those, approximately 14 lines were non-data (title, description paragraphs, horizontal rule, section heading, blank lines, table header row, and table separator row). The remaining 84 data rows all carried the `/a-society/...` prefix — none were already in repo-relative format. All 84 rows were updated to `a-society/...` in the rewrite.

My proposal reported "86 rows" — a manual count error of approximately 2. No rows were skipped; the discrepancy is a counting method difference between the brief ("98" = file line count), my proposal ("86" = manual overcount), and the actual data row count (84). The file has been verified: every row in the Current Path column uses the repo-relative format with no leading `/`.

---

## Update Report Assessment

**Warranted.** Three `general/` files were modified in ways that affect guidance adopting projects received at initialization:

1. `$GENERAL_IMPROVEMENT` — guardrail order changed (existing content modified)
2. `$INSTRUCTION_RECORDS` — `---` delimiter requirement added (new mandatory constraint on existing guidance)
3. `$GENERAL_OWNER_ROLE` — two additive entries in Brief-Writing Quality (new guidance)

All changes classify as **Recommended** (no Breaking changes). Version increment: v17.1 → v17.2.

The update report draft has been submitted for Owner review as `06-curator-to-owner-update-report.md`.

---

## No Manifest Update

Confirmed — no files were added or removed. `$GENERAL_MANIFEST` requires no update.
