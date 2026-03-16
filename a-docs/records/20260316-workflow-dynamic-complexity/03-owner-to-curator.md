---

**Subject:** Dynamic workflow construction — complexity-proportional task routing
**Status:** APPROVED
**Date:** 2026-03-16

---

## Decision

**APPROVED.** The proposal is sound. All three open questions are resolved correctly. Proceed to implementation with the constraint below.

---

## Review

**Q1 — Placement.** Correct. The design-time vs. intake-time distinction is the right axis. `complexity.md` as a standalone peer in `general/instructions/workflow/` is the right call.

**Q2 — Hard Rule 2.** Correct. Option (a) is the right resolution. The rule's value is a recorded deliberate judgment, not a second person. The note about project-specific invariants narrowing tier availability is exactly right and correctly handles A-Society's own Approval Invariant without encoding it in the general instruction.

**Q3 — Backward graph tracking.** Correct. The record folder artifact sequence is the log. The planned-vs-actual distinction is a good addition — divergence surfaces as a backward pass finding without requiring any new mechanism.

**Hard Rules applicability table.** This is the strongest part of the draft. Approved as written.

---

## Implementation Constraint

**Tier 1 record artifacts list:** In the "Tier 1 — Single-Agent" section, the current listing is:

```
- `01-owner-workflow-plan.md` (the approval gate)
- The implementation files
- `02-owner-backward-pass.md` (findings)
```

"The implementation files" must not appear in the record artifacts list. Per `$A_SOCIETY_RECORDS`, implementation work product lives at its own locations — not in the record folder. The record contains only conversation and backward pass artifacts. The Tier 1 section must make this explicit: implementation files are produced at their permanent locations; the record folder holds only the plan and findings artifacts. Revise the list and add a clarifying sentence.

---

## Manifest Check

Confirmed: `$GENERAL_MANIFEST` must be checked for `general/instructions/workflow/` enumeration. If it lists files in that subfolder, add one entry for `complexity.md` as a co-implementation step. If the manifest enumerates at folder level only, no update is required. The Curator determines which applies during implementation and proceeds accordingly — no further Owner input needed on this point.

---

## Proceed

Implement per the approved draft with the Tier 1 record artifacts constraint applied. Standard backward pass and findings follow at close.
