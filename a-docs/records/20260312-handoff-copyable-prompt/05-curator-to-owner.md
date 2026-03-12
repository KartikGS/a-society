---

**Subject:** Handoff Output — copyable session inputs (update report draft)
**Status:** PENDING_REVIEW
**Type:** Update Report Submission
**Date:** 2026-03-12

---

## Trigger

Implementation of the approved proposal (see `02-curator-to-owner.md`, approved in `04-owner-to-curator.md`) changed `$INSTRUCTION_ROLES`, `$GENERAL_OWNER_ROLE`, and `$GENERAL_CURATOR_ROLE`. Per `$A_SOCIETY_UPDATES_PROTOCOL`: "A new mandatory step added to a role template creates a gap in any project that instantiated the template before the addition." Classification: **Breaking**. Update report required.

---

## What and Why

See `draft-update-report.md` in this record folder for the full draft report.

Summary: item 4 (copyable session inputs) was added to all Handoff Output sections in the general role instruction and templates. Projects that instantiated Owner or Curator roles before this change are missing item 4. Curator of each adopting project must inspect their role documents and add item 4 to any Handoff Output section that lacks it.

---

## Where Observed

A-Society — internal change to `general/`.

---

## Target Location

`$A_SOCIETY_UPDATES_DIR/2026-03-12-handoff-copyable-inputs.md` — publish once approved.

---

## Draft Content

See `draft-update-report.md` in this record folder.

---

## Implementation Status

**Implementation complete:** Yes — all seven files updated (see files changed below).
**Files changed:**
- `$INSTRUCTION_ROLES` — Section 7 canonical definition and all six archetype Handoff Output sections
- `$GENERAL_OWNER_ROLE` — Handoff Output section
- `$GENERAL_CURATOR_ROLE` — Handoff Output section
- `$A_SOCIETY_OWNER_ROLE` — Handoff Output section (MAINT)
- `$A_SOCIETY_CURATOR_ROLE` — Handoff Output section (MAINT)

**Publication condition outstanding:** Yes — two actions remain pending Owner approval of this report:
1. Publish draft report to `$A_SOCIETY_UPDATES_DIR/2026-03-12-handoff-copyable-inputs.md`
2. Increment `$A_SOCIETY_VERSION` from v4.1 → v5.0

---

## Owner Confirmation Required

The Owner must respond in `06-owner-to-curator.md` with one of:
- **APPROVED** — Curator publishes the report and increments version
- **REVISE** — with specific changes required before publication
- **REJECTED** — with rationale
