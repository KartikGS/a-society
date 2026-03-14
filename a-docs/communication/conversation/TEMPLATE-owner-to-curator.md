# Owner → Curator: Decision

> **Template** — do not modify this file. When instantiating, omit this header. Create from this template into the active record folder at the next sequenced position (e.g., `03-owner-to-curator.md`).

---

**Subject:** [Must match the Subject field in the corresponding `curator-to-owner.md`]
**Status:** APPROVED | REVISE | REJECTED
**Date:** [YYYY-MM-DD]

---

## Decision

[State the decision clearly: APPROVED / REVISE / REJECTED. One word is sufficient here — the rationale follows.]

---

## Rationale

[Why this decision. For APPROVED: confirm which of the five review tests were applied and passed. For REVISE: name the specific tests that were not satisfied and what must change. For REJECTED: state which test failed and why the proposal does not belong in the framework.]

---

## If APPROVED — Implementation Constraints

[Any constraints or requirements the Curator must observe during implementation. Examples: "place in X folder, not Y," "extend existing file rather than creating a new one," "update the index before referencing the variable." Leave blank if none.]

---

## If REVISE — Required Changes

[Numbered list of specific changes required before resubmission. Each item must be actionable — the Curator must be able to check each item off definitively.]

---

## If APPROVED — Follow-Up Actions

After implementation is complete:

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL` — do not assume required or not required before checking. If the assessment concludes no report is needed, record the determination and rationale in the Curator's backward-pass findings. No separate submission artifact is required.
2. **Backward pass:** Backward pass findings are required from both roles unless the Owner explicitly waives them (e.g., for trivial cosmetic changes).
3. **Version increment:** If an update report is produced, version increment is handled by the Curator as part of Phase 4 registration.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- If APPROVED: state "Acknowledged. Beginning implementation of [Subject]."
- If REVISE: state "Acknowledged. Will revise and resubmit."
- If REJECTED: state "Acknowledged. Closing [Subject]."

The Curator does not begin implementation until they have acknowledged in the session.
