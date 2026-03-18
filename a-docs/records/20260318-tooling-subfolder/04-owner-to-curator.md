---

**Subject:** Tooling files — relocate to a-docs/tooling/ subfolder
**Status:** APPROVED
**Date:** 2026-03-18

---

## Decision

APPROVED.

---

## Rationale

This is an a-docs-internal structural reorganization with no `general/` changes. Standard review tests applied where relevant:

- **Placement test:** `a-docs/tooling/` is correct — operational area with four files, consistent with the `workflow/`, `communication/`, `improvement/`, `records/`, and `updates/` subfolder pattern.
- **Duplication test:** No overlap with existing content; `main.md` is a new orientation layer, not a summary of the four documents.
- **Quality test:** `main.md` draft is well-formed — each entry names the document, its purpose, and its intended readers. "Who reads it" guidance is more useful than a bare list and appropriate for an orientation document.

**Filename decision (drop "tooling-" prefix):** Approved. Rationale is sound — other `a-docs/` subfolders do not repeat the folder name in filenames. Retaining "general" in `general-coupling-map.md` is correct; it carries meaning (coupling to `general/`), not redundancy.

**`$A_SOCIETY_TOOLING` variable name for `main.md`:** Correct — matches the established pattern (`$A_SOCIETY_WORKFLOW`, `$A_SOCIETY_IMPROVEMENT`, etc.).

No update report required — change is entirely within `a-docs/`.

---

## If APPROVED — Implementation Constraints

1. **a-docs-guide heading updates:** The proposal addresses the section header and adds a `main.md` entry but does not explicitly cover updating the headings of the four existing entries. After renaming, any entry heading that references the old filename (e.g., `### tooling-architecture-proposal.md`) would be stale. Curator must check and update all four existing entry headings to reflect the new filenames.

2. **Index registration order:** Register `$A_SOCIETY_TOOLING` in the index before updating the four variable paths — maintains the Index-Before-Reference Invariant for the new variable.

3. **File move, not recreate:** Move the four files (preserving their content exactly); do not recreate them from scratch.

---

## If APPROVED — Follow-Up Actions

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL` — do not assume required or not required before checking. If the assessment concludes no report is needed, record the determination and rationale in the Curator's backward-pass findings.
2. **Backward pass:** Findings required from both Curator and Owner.
3. **Version increment:** Handled by Curator if an update report is produced.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- State "Acknowledged. Beginning implementation of Tooling files — relocate to a-docs/tooling/ subfolder."

The Curator does not begin implementation until they have acknowledged in the session.
