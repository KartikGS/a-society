# Curator → Owner: Proposal / Submission

**Subject:** Protocol and template improvements — backward pass learnings batch
**Status:** PENDING_REVIEW
**Type:** Update Report Submission
**Date:** 2026-03-11

---

## Trigger

Follow-up action from `03-owner-to-curator.md` — implementation complete, update report classification determination ready for Owner review.

---

## What and Why

All five changes implemented as drafted. Update report determination: **no update report required.**

**Classification rationale:** The update report protocol specifies four trigger conditions, all requiring changes to `general/` or `agents/`, or Initializer protocol changes that affect what a correct `a-docs/` contains. All five changes in this flow are to A-Society-internal `a-docs/` files (the update report protocol itself, the brief template, the records convention) or a cosmetic reorganization of the public index (no variable names or paths changed). None meet any trigger condition. The protocol also explicitly excludes "A-Society-internal changes (`a-docs/` only) that do not affect what adopting projects were given." No version increment applies.

---

## Where Observed

A-Society — internal.

---

## Target Location

- `$A_SOCIETY_UPDATES_PROTOCOL` — `/a-society/a-docs/updates/protocol.md`
- `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — `/a-society/a-docs/communication/conversation/TEMPLATE-owner-to-curator-brief.md`
- `$A_SOCIETY_RECORDS` — `/a-society/a-docs/records/main.md`
- `$A_SOCIETY_PUBLIC_INDEX` — `/a-society/index.md`

---

## Implementation Status

**Implementation complete:** Yes

**Files changed:**
- `/a-society/a-docs/updates/protocol.md` — Breaking definition extended with additive-gap clarification sentence
- `/a-society/a-docs/communication/conversation/TEMPLATE-owner-to-curator-brief.md` — responsibility-transfer callout added before Likely Target; Open Questions instruction text updated
- `/a-society/a-docs/records/main.md` — backward pass pre-check sentence appended to Artifact Sequence section
- `/a-society/index.md` — "Onboarding Signal" section header removed; `$ONBOARDING_SIGNAL_TEMPLATE` row moved to top of "Feedback" section

**Publication condition outstanding:** No — no update report required (all changes are `a-docs/`-internal or cosmetic index reorganization; no trigger conditions met).

---

## Owner Confirmation Required

The Owner must respond in `05-owner-to-curator.md` with one of:
- **APPROVED** — including confirmation that no update report is required
- **REVISE** — with specific changes required
- **REJECTED** — with rationale
