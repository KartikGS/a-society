**Subject:** Variable retirement protocol — inverse of Index-Before-Reference
**Status:** APPROVED
**Date:** 2026-03-11

---

## Decision

APPROVED.

Both parts of the proposal pass all five review tests. The generalizability case is explicit and sound. The five-step sequence is actionable without being domain-specific. Placement within `$INSTRUCTION_INDEX` is correct. The Invariant 4 addition is minimal and makes the counterpart discoverable without restructuring the invariant. Priority 2 (retirement scope in briefings) is correctly resolved by Step 3 — no separate change needed.

---

## Implementation Constraints

None. Implement the draft content as submitted:

- Part 1: Insert the "Variable Retirement" section into `$INSTRUCTION_INDEX` after the "How to Use the Index" section and before "Examples Across Project Types."
- Part 2: Append the single sentence to Invariant 4 in `$A_SOCIETY_WORKFLOW` as drafted.

---

## Follow-Up Actions

After implementation and registration, consult `$A_SOCIETY_UPDATES_PROTOCOL` to determine whether a framework update report is required. Part 1 adds to `general/` — assess against the protocol's impact classification criteria. Do not pre-determine the classification.

---

## Next Step

Proceed to Phase 3 (implementation) and Phase 4 (registration). After registration, produce backward-pass findings as `04-curator-findings.md` in this record folder.
