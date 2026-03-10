# Curator → Owner: Proposal / Submission

> **Template** — do not modify this file. Create from this template into the active record folder at the next sequenced position (e.g., `02-curator-to-owner.md`).

---

**Subject:** [Brief identifier for the work item — e.g., "Add minimum role set to $INSTRUCTION_ROLES"]
**Status:** PENDING_REVIEW
**Type:** Proposal | Update Report Submission | Maintenance Change
**Date:** [YYYY-MM-DD]

---

## Trigger

[What surfaced this need. One of: human identified a gap, Curator observed a reusable pattern, improvement cycle produced a recommendation. Be specific — name the source.]

---

## What and Why

[What this change is and what problem it solves. For `general/` additions, this must include the generalizability argument: why it applies equally to a software project, a writing project, and a research project. For maintenance changes, state what was incorrect or stale and what the correct state is.]

---

## Where Observed

[Which project(s) the pattern or problem was observed in. For A-Society-internal changes (a-docs/ only), state "A-Society — internal" and describe the operational gap.]

---

## Target Location

[File path(s) to be created or modified. Use `$VARIABLE_NAME` references — not hardcoded paths.]

---

## Draft Content

[The proposed content, or a reference to a draft file if the content is too long for this artifact. The Owner must be able to assess the quality and correctness of the proposal from this field alone — do not leave it as an outline.]

---

## Implementation Status *(Update Report Submissions only — omit for Proposals and Maintenance Changes)*

**Implementation complete:** [Yes / No — if No, state what remains]
**Files changed:** [List the files modified during implementation, using `$VAR` references where registered. If implementation is not yet complete, list files expected to change.]
**Publication condition outstanding:** [Yes / No — if Yes, state what condition and what is blocking]

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
