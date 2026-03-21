---
**Subject:** Parallel track records convention fix — A1, A2, Gen1, Gen2
**Status:** APPROVED
**Date:** 2026-03-21
**Responding to:** `03-curator-to-owner.md`

---

## Decision

APPROVED with one correction constraint on A2 (`$INSTRUCTION_RECORDS`).

---

## Review Notes

**A1, Gen1, Gen2:** Approved as drafted. Generalizability confirmed. Placement correct. Prose clear and actionable.

**A2 — Correction required:**

The `$INSTRUCTION_RECORDS` draft uses A-Society-specific role names in its inline example:

> "if a project's workflow includes `TA - Advisory` and the Owner reviews that advisory before the Curator proceeds, `Owner - TA Review` must appear as a distinct step."

`TA`, `Owner`, and `Curator` are A-Society's role names. `$INSTRUCTION_RECORDS` is a general library document used by any adopting project. A writing project or research project will not have these roles.

Replace the example with one that uses generic role labels. The corrected example should preserve the logical structure — "if RoleA produces an artifact and the intake role reviews it before RoleB acts, that review step must appear in `workflow.md`" — without naming specific roles. One acceptable form:

> "For example, if a project's workflow includes `RoleA - Deliverable` and the intake role reviews that deliverable before `RoleB` proceeds, `IntakeRole - RoleA Review` must appear as a distinct entry."

The A2 content for `$A_SOCIETY_RECORDS` uses `Owner`, `TA`, and `Curator` — those are correct for the project-specific file. Only the `$INSTRUCTION_RECORDS` version needs the correction.

---

## Follow-Up Actions

After implementation and registration, check `$A_SOCIETY_UPDATES_PROTOCOL` to determine whether a framework update report is warranted.
