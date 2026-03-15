---

**Subject:** Tooling-general coupling enforcement — coupling map artifact and workflow gate additions
**Status:** PENDING
**Type:** Brief
**Date:** 2026-03-15
**Recipient:** Curator

---

## Background

The TA's coupling surface assessment (`02-ta-to-owner.md`) has been accepted (see `03-owner-to-ta.md`). Three implementation artifacts follow from the direction decisions. All three are documentation changes within Curator authority. No new general/ additions are involved — this brief covers one new a-docs/ artifact and two updates to existing documents.

---

## What Needs to Be Done

### Change 1: Create `tooling-general-coupling-map.md`

**Location:** `a-society/a-docs/tooling-general-coupling-map.md`

**Purpose:** The standing reference for what `general/` elements each tooling component depends on (format dependencies) and whether each component currently has a `general/` instruction directing agents to invoke it (invocation status). Updated as part of Phase 7 registration after any cross-layer change.

**Content:** Extract and format the two Q1 tables from `02-ta-to-owner.md` — the format dependency table and the invocation gap table. Add a third section: maintenance instruction. The maintenance instruction must state:
- This document is updated as part of Phase 7 (Registration) after any change classified as Type A, B, C, D, E, or F in `$A_SOCIETY_TOOLING_COUPLING_MAP`'s taxonomy section
- The six change types are defined in `02-ta-to-owner.md` Q2; summarize them as a brief reference list in this document so future Curators do not need to re-derive the taxonomy
- The Owner checks this document at Phase 2 (Coupling Test); the TA checks the invocation gap column when reviewing any tooling deviation

**Note on invocation gap column:** All six components currently show invocation gaps (no `general/` instruction directs agents to invoke them). Mark all six as `Open` in the invocation status column. These will be closed in a separate brief. Do not close them in this flow.

---

### Change 2: Update `$A_SOCIETY_WORKFLOW`

Two additions to Phase 2 (Review) and one addition to the TA advisory description.

**Addition 2a — Coupling Test in Phase 2:**

In the Phase 2 work section, after the five existing review tests, add a sixth:

> 6. **Coupling Test** — Consult `$A_SOCIETY_TOOLING_COUPLING_MAP`. If the proposed `general/` element appears in the format dependency table, the proposal is not approvable until a tooling update is scoped. The Owner documents the required tooling update scope in the Phase 2 decision artifact. The tooling update follows the TA advisory → Developer path per `$A_SOCIETY_TOOLING_ADDENDUM`.

**Addition 2b — Manifest check in Phase 2:**

In the Phase 2 work section, after the Coupling Test, add:

> 7. **Manifest Check** — If the proposal adds, removes, or renames any file in `general/`, verify whether `$GENERAL_MANIFEST` needs updating. If it does, note this in the Phase 2 decision artifact as a required co-implementation step for the Curator.

**Addition 2c — TA advisory invocation gap check:**

In the Session Model section, in the TA sessions description (currently: "On-demand — invoked when Developer escalates or at Owner's request for Phase 6 gate"), add:

> When reviewing a tooling change or deviation, the TA also checks `$A_SOCIETY_TOOLING_COUPLING_MAP`'s invocation gap column for the affected component. If the gap is open, the TA notes it as a standing open item in the advisory output. This is not a hard stop — it is a gap-surfacing obligation.

---

### Change 3: Register and document the new artifact

- Add a row to `$A_SOCIETY_INDEX` for `$A_SOCIETY_TOOLING_COUPLING_MAP` pointing to `a-society/a-docs/tooling-general-coupling-map.md`.
- Add an entry to `$A_SOCIETY_AGENT_DOCS_GUIDE` for the new file: what it is, who uses it, and when it is updated.

---

## Scope Constraint

Do not close any invocation gaps in this flow. The invocation gap column must reflect the current state (all six open). Invocation gap closure is a separate brief.

Do not modify any `general/` files. All three changes are to `a-docs/` or internal A-Society workflow documents.

---

## Update Report Assessment

Check `$A_SOCIETY_UPDATES_PROTOCOL` after implementation. The workflow gate additions affect `$A_SOCIETY_WORKFLOW` (internal a-docs/, not general/) and the new coupling map is an internal artifact. Neither change directly affects adopting projects' initialization or role files. Determine after implementation whether a report is triggered; do not pre-classify.

---

## Curator Confirmation Required

State: "Acknowledged. Beginning implementation of tooling-general coupling enforcement — coupling map artifact and workflow gate additions."

The Curator does not begin until they have acknowledged in the session.
