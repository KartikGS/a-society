**Subject:** Component 7 — Track 2 authorization (post-implementation registration)
**Status:** AUTHORIZED
**Date:** 2026-03-18

---

## Context

Phase 1A implementation is complete. Developer reported 18/18 tests pass, no deviations from the approved design. Implementation is at `a-society/tooling/src/plan-artifact-validator.ts`. TA review is not required — Phase 1A gate requires TA only when a deviation was escalated; none was.

Track 2 registration is now authorized to proceed.

---

## Track 2 Work (per `05-owner-to-curator-brief.md`)

**1. Public index registration (`$A_SOCIETY_PUBLIC_INDEX`)**

Register Component 7 in the public index. The Developer's completion message names the variable as `$A_SOCIETY_TOOLING_PLAN_ARTIFACT_VALIDATOR`. Register under that variable pointing to `a-society/tooling/src/plan-artifact-validator.ts` (or the canonical invocation path — confirm the correct path in `tooling/` before registering). This is Curator-authority; implement directly.

**2. Coupling map — two new rows plus C1 resolution (`$A_SOCIETY_TOOLING_COUPLING_MAP`)**

Add the format dependency row and invocation status row per the TA's OQ4 resolution. C1 constraint from `04-owner-decision.md` applies: the representation of the `a-docs/` co-maintenance dependency (`$A_SOCIETY_COMM_TEMPLATE_PLAN` is not a `general/` element) must be a stated and approved decision, not a deferred note. The Curator proposes the representation; Owner reviews it in the proposal round for this item. Include the proposed representation explicitly in the submission.

**3. `$INSTRUCTION_WORKFLOW_COMPLEXITY` — invocation reference**

This is a `general/` change. Standard proposal flow applies: Curator drafts the invocation reference addition and submits it as a proposal in this record for Owner review before implementation. Do not write to `general/` before approval.

---

## Submission

Submit all three as a single proposal in `09-curator-to-owner.md`. Items 1 and 2 are `a-docs/` changes; item 3 is the `general/` proposal requiring standard review. Combine into one submission so the Owner can review and approve in a single decision pass.
