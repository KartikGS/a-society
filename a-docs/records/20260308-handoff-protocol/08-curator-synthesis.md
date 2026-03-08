# Curator Synthesis

**Flow:** `20260308-handoff-protocol`
**Date:** 2026-03-08
**Sources:** `06-curator-findings.md`, `07-owner-findings.md`

---

## Summary

Three actionable flows emerge from the backward pass. The main consolidation is around approval timing: Curator Finding 1 and Owner Findings 1, 2, and 4 all describe the same structural gap from different angles. Curator Finding 3 does not produce its own flow; the Owner correctly reframed it as an implementation-status visibility problem rather than a problem with the publication gate itself.

---

## Curator Findings — Disposition

| # | Finding | Disposition |
|---|---|---|
| 1 | Briefing approval was misread as Phase 2 approval | Consolidated into Flow A with Owner Findings 1, 2, and 4. |
| 2 | Within-flow sequencing for additional Curator → Owner submissions is implicit | Consolidated into Flow C with Owner Finding 4. |
| 3 | Workflow verification should precede publication constraints | No standalone flow. Owner feedback is correct: keep the publication gate; fix submission completeness/implementation-status visibility instead. Folded into Flow B. |

---

## Owner Findings — Consolidation

Owner Findings 1, 2, and 4 are one problem:

- **Finding 1:** The workflow does not distinguish briefing-level scope/direction alignment from Phase 2 approval.
- **Finding 2:** The Approval Invariant says what requires approval, but not when approval is established.
- **Finding 4:** The briefing template allowed ambiguous pre-approval language ("this briefing constitutes that approval").

These are one fix: make briefing pre-approval explicitly directional only, require a separate Phase 2 decision artifact before implementation, and remove ambiguous approval wording from briefing guidance.

Owner Finding 3 and Curator Finding 3 align on a different root problem:

- The Owner needed implementation-status visibility in the update report submission.
- The publication gate itself was correct; the missing status declaration made review noisier than necessary.

That becomes Flow B.

Owner Finding 4 and Curator Finding 2 align on the remaining clarity issue:

- The records convention handles extra within-flow submissions implicitly.
- The pattern should be documented explicitly rather than left to inference.

That becomes Flow C.

---

## Proposed Flows

### Flow A — Briefing pre-approval language and Approval Invariant timing

**Trigger source:** Curator Finding 1; Owner Findings 1, 2, and 4
**Severity:** High
**Change:** Clarify that a briefing establishes scope/direction alignment only. A separate Phase 2 Owner decision artifact is still required before implementation begins, regardless of any pre-approval language in the briefing. Remove or constrain briefing wording that could be read as implementation authorization.
**Targets:** `$A_SOCIETY_WORKFLOW`, `$A_SOCIETY_COMM_TEMPLATE_BRIEF`, `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`
**Requires Owner approval:** Recommended — touches the Approval Invariant and briefing language.
**Portability note:** This is currently an A-Society workflow fix. If the same pattern appears elsewhere, it may later warrant propagation into the general workflow instruction.

---

### Flow B — Implementation status in update report submissions

**Trigger source:** Owner Finding 3; Curator Finding 3 (reframed)
**Severity:** Medium
**Change:** Require update report submissions to state whether the underlying implementation is complete, what files were changed, and whether any publication condition remains outstanding. Keep the publication gate; improve the submission format so the Owner can review against explicit status instead of inference.
**Targets:** `$A_SOCIETY_UPDATES_PROTOCOL`, `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`
**Requires Owner approval:** No — A-Society maintenance within Curator authority.
**Portability note:** If this proves broadly useful, the submission-template requirement may later justify a general-library proposal. This flow should fix the A-Society-specific protocol first.

---

### Flow C — Explicit within-flow sequencing for additional submissions

**Trigger source:** Curator Finding 2; Owner Finding 4
**Severity:** Low
**Change:** Explicitly document that when a flow includes an extra Curator → Owner submission after the main decision artifact (for example, an update report draft), it takes the next sequence slot before backward-pass findings. Do not leave this to the generic "sequence continues as long as required" rule.
**Targets:** `$A_SOCIETY_RECORDS`, `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`
**Requires Owner approval:** No — A-Society maintenance within Curator authority.
**Portability note:** A-Society-specific records clarity improvement.

---

## Next Steps

1. Register this completed flow in `$A_SOCIETY_LOG`.
2. Add Flow A, Flow B, and Flow C to the ordered next-priorities list.
3. Escalate Flow A for Owner briefing before implementation.
4. Flow B and Flow C may proceed as Curator-authority maintenance items once prioritized.
