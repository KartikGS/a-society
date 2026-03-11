**Subject:** Variable retirement protocol — update report submission
**Status:** PENDING_REVIEW
**Type:** Update Report Submission
**Date:** 2026-03-11

---

## Trigger

Phase 4 of the `20260311-variable-retirement-protocol` flow. A new "Variable Retirement" section was added to `$INSTRUCTION_INDEX` (a `general/` file). Per `$A_SOCIETY_UPDATES_PROTOCOL`, changes to `general/` that affect guidance adopting projects received at initialization require an update report.

---

## What and Why

A five-step Variable Retirement protocol was added to `$INSTRUCTION_INDEX`. This is the first formal guidance for removing index variables — previously absent, with two A-Society flows exposing the gap. Additionally, Invariant 4 in `$A_SOCIETY_WORKFLOW` was updated to name the protocol as Invariant 4's counterpart. The `$A_SOCIETY_WORKFLOW` change is internal (`a-docs/` only) and does not affect adopting projects.

---

## Where Observed

A-Society — internal. Described in the trigger and briefing of this flow.

---

## Target Location

`$A_SOCIETY_UPDATES_DIR` — to be published as `2026-03-11-variable-retirement-protocol.md` upon approval.

---

## Draft Content

The full update report draft follows.

---

# A-Society Framework Update — 2026-03-11

**Framework Version:** v4.1
**Previous Version:** v4.0

## Summary

A "Variable Retirement" protocol has been added to the index instruction (`$INSTRUCTION_INDEX`). This is the counterpart to the Index-Before-Reference Invariant: where creation requires registration before reference, retirement requires reference cleanup before removal. The five-step protocol prescribes a sequence that prevents stale references — including prose references — from surviving a variable removal. Adopting project Curators should familiarize themselves with the protocol for use in future maintenance cycles.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 1 | New procedural guidance worth adopting — Curator should read and apply in future maintenance cycles |
| Optional | 0 | — |

---

## Changes

### Variable Retirement Protocol Added to Index Instruction

**Impact:** Recommended
**Affected artifacts:** [`general/instructions/indexes/main.md`]
**What changed:** A new "Variable Retirement" section was added to the general index instruction. It prescribes a five-step sequence for retiring a variable: (1) grep all active documents for the `$VARIABLE_NAME` before touching anything; (2) update or remove each consumer reference; (3) check any guide-type document that catalogs file purposes for entries referencing the retired content; (4) remove the variable row from the index only after all references are resolved; (5) post-removal scan for both the `$VARIABLE` form and the prose concept name of the retired content.
**Why:** The framework prescribed how to create variables (Index-Before-Reference) and how to move files (file-move procedure), but had no corresponding guidance for removal. Two flows in A-Society's own development exposed the gap: variables were retired by judgment, and a stale prose reference survived both a section removal and an index-row deletion because no post-removal scan was prescribed.
**Migration guidance:** No change to your project's existing index files is required. The Variable Retirement protocol governs a future maintenance operation — it applies the next time your project's Curator retires a variable from `$[PROJECT]_INDEX`. Before retiring any variable: read the "Variable Retirement" section in `$INSTRUCTION_INDEX` and follow the five-step sequence. In particular, note Step 3 (check guide-type documents for prose references) and Step 5 (post-removal prose scan) — these are the steps most likely to be omitted by a Curator working from intuition.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.

---

## Implementation Status

**Implementation complete:** Yes. Both changes were applied in Phase 3 of this flow:
- "Variable Retirement" section added to `$INSTRUCTION_INDEX`
- Invariant 4 sentence appended in `$A_SOCIETY_WORKFLOW`

**Files changed:**
- `$INSTRUCTION_INDEX` (`/a-society/general/instructions/indexes/main.md`) — new section added
- `$A_SOCIETY_WORKFLOW` (`/a-society/a-docs/workflow/main.md`) — Invariant 4 appended

**Publication condition outstanding:** Yes. Pending Owner approval. Upon approval, the Curator will publish the report to `a-society/updates/2026-03-11-variable-retirement-protocol.md` and increment `$A_SOCIETY_VERSION` from v4.0 to v4.1 as an atomic step.

---

## Owner Confirmation Required

The Owner must respond in `05-owner-to-curator.md` with one of:
- **APPROVED** — with any constraints on the report content or version increment
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not publish the report or update `$A_SOCIETY_VERSION` until `05-owner-to-curator.md` shows APPROVED status.
