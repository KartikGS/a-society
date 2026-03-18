**Subject:** Component 7 Track 2 — Owner decision
**Status:** APPROVED
**Date:** 2026-03-18

---

## Decision

**APPROVED** — all three Track 2 items proceed to implementation as proposed in `09-curator-to-owner.md`, with two additions below.

---

## Rationale

**Public index registration:** `.ts` extension is correct. The Curator is right to register against disk reality rather than the stale `.js` pattern of the existing six entries. The six stale entries are a separate problem addressed below.

**C1 resolution (coupling map `a-docs/` representation):** Column header change + section intro note + `[a-docs]` row annotation is accepted. Minimal, visible at point of use, and does not require restructuring the table for a single row. The stated rationale is sound.

**Coupling map rows:** Format dependency row and invocation status row (initially Open) are correctly specified per OQ4.

**`$INSTRUCTION_WORKFLOW_COMPLEXITY` invocation reference:** Placement, wording, and scope are correct. "This step is required for the Owner before issuing a brief; it is not required for other roles reading the plan" correctly constrains the gate to the right role. Not proposing an addition to `$A_SOCIETY_RECORDS` is also correct — OQ4 ruled that optional, and there is no strong reason to add it.

**Invocation status close in same pass:** Approved. Close the row to Closed with today's date immediately after implementing the `general/` change.

---

## Two Additions to Implementation Scope

**Addition 1 — `$A_SOCIETY_TOOLING_INVOCATION` description update (public index)**

The `$A_SOCIETY_TOOLING_INVOCATION` row currently reads: "Invocation reference for all six tooling components — quick start, entry points, and error conventions." This description is stale the moment Component 7 is registered. Update the description in the same implementation pass:

> Invocation reference for all tooling components — quick start, entry points, and error conventions

(Remove the count. A count in the description creates a maintenance liability on every new component — "all tooling components" is accurate regardless of count.)

**Addition 2 — Stale `.js` entries: flag for follow-up, not in scope here**

The Curator's flag is confirmed against the public index. All six existing tooling entries use `.js` extensions; the actual files are `.ts`. This is not a cosmetic issue — the Path Validator tool (Component 5) would fail on every one of these entries. Do not fix them in this pass (out of scope, different flow). I am adding a Next Priorities entry for a follow-up maintenance flow. The Curator notes this as out of scope in the implementation session.

---

## Implementation Sequence (confirmed)

1. Add Component 7 row to `$A_SOCIETY_PUBLIC_INDEX` with `.ts` extension
2. Update `$A_SOCIETY_TOOLING_INVOCATION` description in `$A_SOCIETY_PUBLIC_INDEX` (Addition 1)
3. Apply all four coupling map changes: section intro note, column header, format dependency row, invocation status row (Open)
4. Add invocation reference paragraph to `$INSTRUCTION_WORKFLOW_COMPLEXITY`
5. Close invocation status row in `$A_SOCIETY_TOOLING_COUPLING_MAP` (Open → Closed, date: 2026-03-18)

---

## Handoff

Resume Session B (Curator). Implement all five steps above, then confirm in the session. After confirmation, return to this session (Session A) — the flow proceeds to Phase 5 backward pass.
