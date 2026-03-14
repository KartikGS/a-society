---

**Subject:** Fully agentic role model — human-collaborative phase flag — update report submission
**Status:** PENDING_REVIEW
**Type:** Update Report Submission
**Date:** 2026-03-14

---

## Trigger

Implementation of the approved change (per `03-owner-to-curator.md`) is complete. The changes to `$INSTRUCTION_ROLES` and `$INSTRUCTION_WORKFLOW` qualify for a framework update report under the trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL` — specifically: existing `general/` instructions have changed in ways that affect guidance adopting projects received at initialization, and a new mandatory field has been added to the workflow phase definition format.

---

## What and Why

See `04-update-report-draft.md` in this record folder for the full report draft. Summary of impact classification determination:

**Breaking (1):** The `Human-collaborative` field is now mandatory on Phase 1 of every workflow. Any existing workflow document is missing this field on Phase 1 — this is a gap in current instantiations. Impact classification: Breaking. Version increment: MAJOR. v8.0 → v9.0.

**Recommended (1):** The "human or agent" framing change in `$INSTRUCTION_ROLES` is a conceptual correction. Projects already writing role documents for agents have no hard gap. Impact classification: Recommended.

**Determination:** Update report required. Version increment: MAJOR (Breaking change present). v8.0 → v9.0.

---

## Where Observed

A-Society — internal (framework-level correction, not derived from a specific project observation).

---

## Target Location

Published report (pending Owner approval): `a-society/updates/2026-03-14-fully-agentic-role-model.md`

---

## Draft Content

See `04-update-report-draft.md`. The Owner should review that file directly — it contains the full report in publication-ready format.

---

## Implementation Status

**Implementation complete:** Yes
**Files changed:**
- `$INSTRUCTION_ROLES` — opening definition and failure modes updated
- `$INSTRUCTION_WORKFLOW` — Human-collaborative field added to node definition (conceptual section and Section 1 field list); Human-Collaborative Phase Pattern named sub-section added; Step 2 in "How to Write One" updated
- `$A_SOCIETY_WORKFLOW` — Phase 1 Owner corrected (Human → Owner); Human-collaborative field added to Phase 1

**Publication condition outstanding:** Yes — Owner approval of this update report required before:
1. Publishing draft to `a-society/updates/2026-03-14-fully-agentic-role-model.md`
2. Updating `$A_SOCIETY_VERSION` from v8.0 to v9.0

---

## Owner Confirmation Required

The Owner must respond in `06-owner-to-curator.md` with one of:
- **APPROVED** — Curator publishes report to `a-society/updates/` and updates `$A_SOCIETY_VERSION`
- **REVISE** — with specific changes required before publication
- **REJECTED** — with rationale; Curator records determination in backward-pass findings
