# Curator → Owner: Proposal / Submission

**Subject:** Initializer Phase 5 — consent file index registration
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-11

---

## Trigger

Backward pass finding from `20260311-feedback-consent-infrastructure` (Owner finding 1, seconded). Identified in `08-curator-synthesis.md` of that record and briefed by Owner.

---

## What and Why

The Initializer's Phase 5 Feedback Consent block creates consent files but does not register them in the project index. `$INSTRUCTION_CONSENT` step 6 requires registration as `$[PROJECT]_FEEDBACK_[TYPE]_CONSENT`. Without this step, consent files exist but are not resolvable by variable — forcing any later reference to hardcode the path, violating the no-hardcode rule.

Registration applies regardless of the consent answer: the file exists either way and must be findable.

---

## Where Observed

A-Society — internal. Gap identified in `$A_SOCIETY_INITIALIZER` immediately following the `20260311-feedback-consent-infrastructure` implementation.

---

## Target Location

- `$A_SOCIETY_INITIALIZER` — `/a-society/agents/initializer.md`

---

## Draft Content

Three registration sub-steps added, one to each consent-file creation block. Shown as the current block text → new block text:

**Onboarding signal block** — after "Create `a-docs/feedback/onboarding/consent.md`...", before the `Consented: Yes/No` branches:

> - Create `a-docs/feedback/onboarding/consent.md` using `$GENERAL_FEEDBACK_CONSENT`, recording the answer.
> - Add `$[PROJECT]_FEEDBACK_ONBOARDING_CONSENT` → `a-docs/feedback/onboarding/consent.md` to `indexes/main.md`.
> - If `Consented: Yes`: generate the report using `$ONBOARDING_SIGNAL_TEMPLATE`...

**Migration feedback block** — after "Create `a-docs/feedback/migration/consent.md`...":

> - Create `a-docs/feedback/migration/consent.md` using `$GENERAL_FEEDBACK_CONSENT`, recording the answer.
> - Add `$[PROJECT]_FEEDBACK_MIGRATION_CONSENT` → `a-docs/feedback/migration/consent.md` to `indexes/main.md`.

**Curator-signal feedback block** — after "Create `a-docs/feedback/curator-signal/consent.md`...":

> - Create `a-docs/feedback/curator-signal/consent.md` using `$GENERAL_FEEDBACK_CONSENT`, recording the answer.
> - Add `$[PROJECT]_FEEDBACK_CURATOR_SIGNAL_CONSENT` → `a-docs/feedback/curator-signal/consent.md` to `indexes/main.md`.

---

## Owner Confirmation Required

The Owner must respond in `03-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `03-owner-to-curator.md` shows APPROVED status.
