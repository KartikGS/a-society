# Owner → Curator: Decision

**Subject:** Owner protocol and role guidance bundle — 11 items (Groups A, B, C)
**Status:** APPROVED WITH CONSTRAINTS
**Date:** 2026-03-29
**Proposal:** `03-curator-to-owner-proposal.md`

---

## Decision

The proposal is approved with three implementation constraints that must be applied before or during implementation. The content of all 11 items is correct. The constraints address state claim errors and consolidation requirements identified by re-reading current file state at review time.

---

## Constraints

### Constraint 1 — B1: `$GENERAL_OWNER_ROLE` has no criterion 3 to replace [Critical]

The proposal states "Replace criterion 3 in the merge assessment table for all three files." This is incorrect for `$GENERAL_OWNER_ROLE`. Re-reading the current file confirms that the merge assessment on line 23 reads:

> "scan existing items for (1) same target files or same design area, and (2) compatible authority level."

There is no criterion 3 in `$GENERAL_OWNER_ROLE`. The correct operation is:

- **`$GENERAL_OWNER_ROLE`:** Add criterion 3 as a new item after criterion 2, using the multi-domain text from the proposal.
- **`$A_SOCIETY_OWNER_ROLE`:** Replace criterion 3 (exists; reads "same workflow type and role path").
- **`$INSTRUCTION_LOG`:** Replace criterion 3 (exists; reads "Same workflow type and role path").

The proposed text for the revised criterion 3 is approved for all three targets, applied as add or replace per the above.

### Constraint 2 — A2 and C5 must be implemented as a single consolidated section [Minor]

Both A2 (closure validity sweep) and C5 (log before closure rule) target the same new "Forward Pass Closure Discipline" section in `$GENERAL_OWNER_ROLE`. The proposal does not address this consolidation, creating a risk of two separate section creations or one item being missed.

Implement A2 and C5 as a single "Forward Pass Closure Discipline" section, created once, with both rules together. Suggested order within the section: the log-before-closure rule (C5) first, then the closure validity sweep (A2) — this matches the order in `$A_SOCIETY_OWNER_ROLE`, where the log update obligation precedes the sweep.

For `$A_SOCIETY_OWNER_ROLE`: the Forward Pass Closure Discipline section already exists. Insert the closure validity sweep (A2) into that existing section, after the existing log-update obligation — do not create a second section.

### Constraint 3 — Update report draft: remove parenthetical classification assessment [Minor]

The update report draft marks Impact Classification as "TBD (Assessed as Recommended/Optional bundle)." The parenthetical pre-assesses classification before implementation. Remove the parenthetical. The field must read "TBD" only, to be resolved by consulting `$A_SOCIETY_UPDATES_PROTOCOL` post-implementation.

---

## Approved Content

All 11 items are approved as proposed, subject to the constraints above:

- **Group A:** A1 (intake validity sweep), A2 (closure validity sweep, with Constraint 2 applied), A3 (entry lifecycle documentation in `$INSTRUCTION_LOG`)
- **Group B:** B1 (criterion 3 revision, with Constraint 1 applied)
- **Group C:** C1–C8 as proposed

---

## Follow-Up Actions

After implementation and registration:

1. Resolve the update report classification by consulting `$A_SOCIETY_UPDATES_PROTOCOL`.
2. Verify whether any newly created or modified files require registration in `$A_SOCIETY_INDEX` or `$A_SOCIETY_PUBLIC_INDEX`.
3. Return to Owner with the implementation confirmation artifact.
