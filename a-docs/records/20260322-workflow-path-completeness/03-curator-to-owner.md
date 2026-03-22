# Curator → Owner: Proposal

**Subject:** workflow.md path completeness — creation obligation and LIB registration step (2 changes)
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-22

---

## Trigger

Human identified a gap: `workflow.md` paths omit the predictable LIB registration loop (update report → version increment → Owner acknowledgment), causing the backward pass traversal order not to reflect the full flow that actually ran. More broadly, the general Owner role template does not instruct Owners to include `workflow.md` at Phase 0 (for projects with backward pass tooling) or to include predictable post-implementation steps in the path at intake.

---

## What and Why

**Change 1 — `$A_SOCIETY_OWNER_ROLE` (A-Society-specific, Curator authority):**
When a flow carries `[LIB]` scope, the registration loop — Curator publishes update report → version incremented → Owner acknowledgment — is a predictable structure known at intake. The current Post-Confirmation Protocol bullet instructs the Owner to create `workflow.md` but says nothing about what must be in it for `[LIB]` flows. The result: `workflow.md` paths omit the registration tail, and backward pass traversal order does not match the flow that ran.

**Change 2 — `$GENERAL_OWNER_ROLE` (general library, requires approval):**
Two gaps in the general template's Post-Confirmation Protocol:
- (2a) The record-folder bullet does not mention `workflow.md` creation. Projects using backward pass tooling must create `workflow.md` as a required Phase 0 co-output alongside `01-owner-workflow-plan.md`; omitting this instruction leaves those projects without the file their tooling requires.
- (2b) No instruction exists to include predictable post-implementation steps in the path at intake. Steps such as publishing an update report or incrementing a version record are knowable when the plan is written; leaving them out produces `workflow.md` paths that do not reflect the full flow and corrupt backward pass traversal order.

Both additions in Change 2 are domain-agnostic and contain no A-Society-specific references.

---

## Where Observed

A-Society — internal. Observed during the active `[LIB]` flow for workflow graph instruction improvements: the `workflow.md` written at Phase 0 did not include the post-implementation registration loop, and backward pass traversal order was therefore incomplete.

---

## Target Location

- Change 1: `$A_SOCIETY_OWNER_ROLE` — Post-Confirmation Protocol section
- Change 2: `$GENERAL_OWNER_ROLE` — Post-Confirmation Protocol section

---

## Draft Content

### Change 1 — `$A_SOCIETY_OWNER_ROLE` (Curator authority — implement directly)

**Insertion point:** After the existing `workflow.md` creation bullet (the bullet beginning "creates the record folder, produces `01-owner-workflow-plan.md`…") and before the Tier 2/3 brief-writing bullet. New standalone bullet in the same list:

> When the flow carries `[LIB]` scope, include the registration loop as a distinct step in `workflow.md` at intake. The predictable structure is: Curator publishes update report → version incremented → Owner acknowledgment. The `[LIB]` scope tag is the signal to add this loop; omitting it produces a `workflow.md` path that does not match the flow that actually ran.

---

### Change 2 — `$GENERAL_OWNER_ROLE` (Requires Owner approval)

**Change 2a — Extend the existing record-folder bullet.**

Current text:
> creates the record folder and produces `01-owner-workflow-plan.md` — this plan is the approval gate for the flow and must exist before any brief is written

Proposed text (append before the closing of the bullet):
> creates the record folder and produces `01-owner-workflow-plan.md` — this plan is the approval gate for the flow and must exist before any brief is written; when the project uses records with backward pass tooling, also create `workflow.md` alongside `01-owner-workflow-plan.md` at this step — it is a required Phase 0 co-output, not a post-intake artifact

**Change 2b — New standalone bullet.**

**Insertion point:** After the extended record-folder bullet (2a) and before the Tier 2/3 brief-writing bullet. New standalone bullet:

> When the flow has a known post-implementation publication or registration step (e.g., publishing an update report, incrementing a version record), include that step in the path at intake. These steps are predictable at the time the plan is written and must not be left as implied appendages — they must appear explicitly so the backward pass traversal order reflects the full flow.

---

## Update Report Draft

*Change 1 is A-Society-internal (`a-docs/` only) and does not trigger an update report. Change 2 modifies `$GENERAL_OWNER_ROLE` and qualifies. Both sub-changes (2a and 2b) are Breaking: they add mandatory obligations to the general Owner role template that existing instantiations lack.*

---

# A-Society Framework Update — 2026-03-22

**Framework Version:** v20.0
**Previous Version:** v19.1

## Summary

The general Owner role template's Post-Confirmation Protocol has been extended with two mandatory obligations: (1) creating `workflow.md` at Phase 0 alongside `01-owner-workflow-plan.md` for projects using backward pass tooling, and (2) including predictable post-implementation steps (e.g., update report publication, version increment) explicitly in the `workflow.md` path at intake. Projects that instantiated the Owner role before this update are missing both obligations; their `workflow.md` paths may not reflect the full flow that actually ran, causing backward pass traversal order to be incomplete.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 2 | Gaps in your current Owner role — Curator must review |
| Recommended | 0 | — |
| Optional | 0 | — |

---

## Changes

### workflow.md Phase 0 creation obligation added to Owner role template

**Impact:** Breaking
**Affected artifacts:** [`general/roles/owner.md`]
**What changed:** The Post-Confirmation Protocol record-folder bullet now instructs the Owner to also create `workflow.md` alongside `01-owner-workflow-plan.md` at Phase 0, conditional on the project using records with backward pass tooling. This was not present in the prior template.
**Why:** Projects using backward pass tooling require `workflow.md` to exist in the record folder before the backward pass runs. Without an explicit Phase 0 instruction in the Owner role, the file was created inconsistently or treated as a post-intake artifact rather than a co-output of intake.
**Migration guidance:** Inspect your project's Owner role (`$[PROJECT]_OWNER_ROLE`) Post-Confirmation Protocol section. If the record-folder bullet does not include an instruction to create `workflow.md` at Phase 0 when the project uses backward pass tooling, add: "when the project uses records with backward pass tooling, also create `workflow.md` alongside `01-owner-workflow-plan.md` at this step — it is a required Phase 0 co-output, not a post-intake artifact." If your project does not use backward pass tooling, this change does not apply.

---

### Path-completeness obligation for predictable post-implementation steps added to Owner role template

**Impact:** Breaking
**Affected artifacts:** [`general/roles/owner.md`]
**What changed:** A new standalone bullet has been added to the Post-Confirmation Protocol instructing the Owner to include predictable post-implementation steps (e.g., publishing an update report, incrementing a version record) explicitly in `workflow.md` at intake. These steps were previously left as implied appendages.
**Why:** Predictable post-implementation steps are knowable at intake time. Leaving them out of `workflow.md` produces paths that do not reflect the full flow that ran, causing backward pass traversal order to be incomplete or incorrect.
**Migration guidance:** Inspect your project's Owner role (`$[PROJECT]_OWNER_ROLE`) Post-Confirmation Protocol section. If no bullet instructs the Owner to include predictable post-implementation steps in `workflow.md` at intake, add: "When the flow has a known post-implementation publication or registration step (e.g., publishing an update report, incrementing a version record), include that step in the path at intake. These steps are predictable at the time the plan is written and must not be left as implied appendages — they must appear explicitly so the backward pass traversal order reflects the full flow." Customize the examples to match the publication or registration patterns relevant to your project.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
