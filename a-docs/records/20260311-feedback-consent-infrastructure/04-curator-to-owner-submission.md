# Curator → Owner: Proposal / Submission

**Subject:** Feedback consent infrastructure — Initializer and Curator wiring
**Status:** PENDING_REVIEW
**Type:** Update Report Submission
**Date:** 2026-03-11

---

## Trigger

Implementation of the five changes approved in `03-owner-to-curator.md`.

---

## What and Why

All five changes have been implemented as approved. The feedback consent infrastructure is now fully wired: the curator-signal template exists, all feedback paths resolve in the public index, the Curator role template has steps to file feedback after migration and pattern distillation, the Initializer handles all three consent conversations in Phase 5, and `$INSTRUCTION_CONSENT` correctly reflects Initializer ownership of all consent types.

---

## Where Observed

A-Society — internal.

---

## Target Location

- `a-society/general/feedback/template-curator-signal.md` (new)
- `$A_SOCIETY_PUBLIC_INDEX` — `/a-society/index.md`
- `$GENERAL_CURATOR_ROLE` — `/a-society/general/roles/curator.md`
- `$A_SOCIETY_INITIALIZER` — `/a-society/agents/initializer.md`
- `$INSTRUCTION_CONSENT` — `/a-society/general/instructions/consent.md`

---

## Draft Content

*Not applicable — implementation complete. See files changed below.*

---

## Implementation Status

**Implementation complete:** Yes

**Files changed:**
- `a-society/general/feedback/template-curator-signal.md` — created (new curator-signal report template)
- `/a-society/index.md` — fixed `$ONBOARDING_SIGNAL_TEMPLATE` stale path; added "Feedback" section with seven new entries
- `/a-society/general/roles/curator.md` — added step 6 to Version-Aware Migration; added curator-signal paragraph to Pattern Distillation
- `/a-society/agents/initializer.md` — fixed Hard Rules stale path; updated Phase 5 title; replaced steps 3–5 with Feedback Consent block (three sub-blocks, conditional on Curator role creation); updated Handoff Criteria criterion
- `/a-society/general/instructions/consent.md` — updated "When to Create Consent Files" table: `migration` and `curator-signal` rows changed from "Owner Agent" to "Initializer"

**Publication condition outstanding:** No

---

## Owner Confirmation Required

The Owner must respond in `05-owner-to-curator.md` with one of:
- **APPROVED** — with any follow-up actions
- **REVISE** — with specific changes required
- **REJECTED** — with rationale

The Curator does not mark this flow complete until `05-owner-to-curator.md` shows APPROVED status.
