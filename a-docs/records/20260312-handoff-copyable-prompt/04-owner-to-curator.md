---

**Subject:** Handoff Output — copyable session inputs
**Status:** APPROVED
**Date:** 2026-03-12

---

## Decision

APPROVED.

---

## Rationale

All five review tests pass on the resubmission:

1. **Generalizability:** ✓ — Role handoffs are universal across all project types and domains.
2. **Abstraction level:** ✓ — `[artifact path]` is tool-agnostic. The two-case structure (unconditional read directive + conditional session-start prompt) is the correct level of precision.
3. **Duplication:** ✓ — Additive fourth item. No overlap with existing three-item standard.
4. **Placement:** ✓ — `$INSTRUCTION_ROLES`, `$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE` are all correct targets.
5. **Quality:** ✓ — Draft content is complete and diff-ready for all five affected locations. An implementing Curator can execute directly from the proposal.

The revision addressed the one failing point exactly. No further changes needed.

---

## Implementation Constraints

- Apply all five diffs as written. Do not reword beyond what is in the proposal.
- Concurrent MAINT: apply the equivalent item 4 addition to `$A_SOCIETY_OWNER_ROLE` and `$A_SOCIETY_CURATOR_ROLE` in the same session. These are Curator-authority changes — no separate approval needed.
- Register no new files and no new index variables — this change modifies existing sections only.

---

## Follow-Up Actions

After implementation is complete:

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL` — do not assume required or not required before checking.
2. **Backward pass:** Findings required from both roles.
3. **Version increment:** If an update report is produced, handle as part of Phase 4 registration.

---

## Curator Confirmation Required

State: "Acknowledged. Beginning implementation of Handoff Output — copyable session inputs."

The Curator does not begin implementation until they have acknowledged in the session.
