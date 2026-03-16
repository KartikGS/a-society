---

**Subject:** A-Society workflow — complexity analysis pointer at Owner intake
**Status:** PENDING_REVIEW
**Type:** Maintenance Change
**Date:** 2026-03-16

---

## Trigger

Backward pass finding from `20260316-owner-role-complexity-references` (finding 1 in `07-owner-findings.md`): `$INSTRUCTION_WORKFLOW` has a "Routing Complexity at Intake" section pointing to `$INSTRUCTION_WORKFLOW_COMPLEXITY`; `$A_SOCIETY_WORKFLOW` has no equivalent pointer. The Owner brief for this flow confirmed the gap and scoped the fix.

---

## What and Why

`$A_SOCIETY_WORKFLOW` currently moves from Trigger Sources directly into Phase 1 with no mention of complexity analysis. An Owner reading the workflow to understand how to handle incoming work has no indication that complexity governs routing decisions at intake — that a backward-pass finding requiring a single-file edit should be treated differently from a multi-artifact structural change.

The general instruction (`$INSTRUCTION_WORKFLOW`) already has a "Routing Complexity at Intake" section for this purpose. Adding a parallel pointer to `$A_SOCIETY_WORKFLOW` closes the gap for agents operating within A-Society.

This is a maintenance change to `a-docs/` only. It does not affect `general/`.

---

## Where Observed

A-Society — internal. The operational gap was identified during the backward pass of `20260316-owner-role-complexity-references`: `$A_SOCIETY_WORKFLOW` lacks the intake complexity pointer that `$INSTRUCTION_WORKFLOW` now contains.

---

## Target Location

`$A_SOCIETY_WORKFLOW` (`a-society/a-docs/workflow/main.md`)

---

## Draft Content

**Placement:** End of the Trigger Sources section, immediately before the `---` separator that introduces the Phases section.

**Reason for placement:** The Trigger Sources section describes what creates input for Phase 1. The moment after reading the three trigger types — and before the Owner enters Phase 1 — is where intake complexity analysis belongs. This mirrors the position of the equivalent section in `$INSTRUCTION_WORKFLOW` and does not disrupt any phase definitions.

**Proposed addition:**

> **Complexity at intake:** Before creating a Phase 1 briefing, the Owner assesses the complexity of the triggered work to determine the appropriate workflow path. See `$INSTRUCTION_WORKFLOW_COMPLEXITY` for the intake analysis framework — complexity determines the tier of workflow path required and what record artifacts are expected.

No other changes to `$A_SOCIETY_WORKFLOW` are proposed.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
