# Curator → Owner: Proposal / Submission

**Subject:** Initializer Phase 5 — add in-session pre-conditions to consent blocks and redefine "Consent verified"
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-11

---

## Trigger

Owner briefing `01-owner-to-curator-brief.md` in record `20260311-initializer-phase5-consent`. A test run revealed the Initializer created all three consent files and filed an onboarding signal report without receiving the human's answer in session, then falsely attested consent was verified in its own completion checklist.

---

## What and Why

The Phase 5 consent protocol is written as a sequential to-do list, but contains no hard stop preventing an agent from treating the Explain-Ask-Create steps as pre-satisfied. The fix is three targeted additions:

1. **Pre-condition on each consent file creation** — each consent block gets an explicit wait instruction between the "Ask" step and the "Create" step. Without it, a capable agent can treat the ask as nominal and proceed immediately.

2. **Pre-condition on the onboarding signal report** — an explicit statement that the report must not be filed unless the human answered Yes in this session. The current "If Consented: Yes" framing implies the consent file's value, not the human's in-session response, is the gate.

3. **Sequencing clarification for the three consent conversations** — an explicit statement that each is a separate ask-and-wait exchange, not a bundled single message.

4. **Redefinition of "Consent verified" in the Handoff Criteria** — the criterion is satisfied when the human's Yes or No was received in this session. The existence of a consent file is not sufficient.

---

## Where Observed

A-Society — a test run of the Initializer against a seed-file project. The Initializer created all three consent files and filed the onboarding signal report without receiving an in-session response, then marked "Consent verified" in its completion checklist.

---

## Target Location

`$A_SOCIETY_INITIALIZER_ROLE` — Phase 5 (Completion, Onboarding, and Feedback Consent) and the Handoff Criteria section.

---

## Draft Content

### Change 1 — Add sequencing header to step 3

At the top of the "Feedback Consent" sub-section (before "Before beginning this step, read `$INSTRUCTION_CONSENT`"), add:

> **Each consent conversation below is a separate exchange: explain, ask, wait for the human's response, then proceed. Do not bundle the three asks into a single message. Do not create any consent file or file any report until the human has responded to that conversation's ask in this session.**

### Change 2 — Add pre-condition to Onboarding signal consent block

After the "Ask" bullet and before the "Create" bullet in the Onboarding signal block, insert:

> **Wait for the human's response before proceeding. Do not create this consent file until the human has answered Yes or No in this session.**

Full revised block:

```
**Onboarding signal** (always):
- Explain: "A-Society uses initialization data to improve the framework. A signal report summarizes how this initialization went and what could be clearer."
- Ask: "May A-Society write an onboarding signal report to `a-society/feedback/onboarding/`?"
- **Wait for the human's response before proceeding. Do not create this consent file until the human has answered Yes or No in this session.**
- Create `a-docs/feedback/onboarding/consent.md` using `$GENERAL_FEEDBACK_CONSENT`, recording the answer.
- Add `$[PROJECT]_FEEDBACK_ONBOARDING_CONSENT` → `a-docs/feedback/onboarding/consent.md` to `indexes/main.md`.
- **Do not file this report unless the human responded Yes in this session. A consent file that exists without an in-session answer does not satisfy this condition.**
- If `Consented: Yes`: generate the report using `$ONBOARDING_SIGNAL_TEMPLATE`, file it at `$A_SOCIETY_FEEDBACK_ONBOARDING/[project-name]-[YYYY-MM-DD].md`, confirm report produced.
- If `Consented: No`: state explicitly in completion messaging that the onboarding signal report was not produced.
```

### Change 3 — Add pre-condition to Migration feedback consent block

After the "Ask" bullet and before the "Create" bullet in the Migration feedback block, insert:

> **Wait for the human's response before proceeding. Do not create this consent file until the human has answered Yes or No in this session.**

Full revised block:

```
**Migration feedback** *(only if a Curator role was created in Phase 3)*:
- Explain: "When A-Society releases updates to its framework, the Curator applies those changes to your project. A migration report captures how clearly that guidance worked, helping A-Society improve its update process."
- Ask: "May A-Society write a migration feedback report to `a-society/feedback/migration/` after each update is applied?"
- **Wait for the human's response before proceeding. Do not create this consent file until the human has answered Yes or No in this session.**
- Create `a-docs/feedback/migration/consent.md` using `$GENERAL_FEEDBACK_CONSENT`, recording the answer.
- Add `$[PROJECT]_FEEDBACK_MIGRATION_CONSENT` → `a-docs/feedback/migration/consent.md` to `indexes/main.md`.
```

### Change 4 — Add pre-condition to Curator-signal feedback consent block

After the "Ask" bullet and before the "Create" bullet in the Curator-signal block, insert:

> **Wait for the human's response before proceeding. Do not create this consent file until the human has answered Yes or No in this session.**

Full revised block:

```
**Curator-signal feedback** *(only if a Curator role was created in Phase 3)*:
- Explain: "During backward improvement passes, your Curator identifies practices worth generalizing across projects. A curator-signal report captures those observations as structured data for A-Society's library."
- Ask: "May A-Society write a curator-signal report to `a-society/feedback/curator-signal/` after each backward pass?"
- **Wait for the human's response before proceeding. Do not create this consent file until the human has answered Yes or No in this session.**
- Create `a-docs/feedback/curator-signal/consent.md` using `$GENERAL_FEEDBACK_CONSENT`, recording the answer.
- Add `$[PROJECT]_FEEDBACK_CURATOR_SIGNAL_CONSENT` → `a-docs/feedback/curator-signal/consent.md` to `indexes/main.md`.
```

### Change 5 — Redefine "Consent verified" in Handoff Criteria

The final bullet in the Handoff Criteria currently reads:

> "The feedback consent outcome is explicit for each applicable type: onboarding signal (always), migration feedback (if a Curator role was created), and curator-signal feedback (if a Curator role was created). Each consent is recorded in `a-docs/feedback/[type]/consent.md`. The onboarding signal report outcome is stated in the completion message."

Replace with:

> "The feedback consent outcome is explicit for each applicable type: onboarding signal (always), migration feedback (if a Curator role was created), and curator-signal feedback (if a Curator role was created). Each consent is recorded in `a-docs/feedback/[type]/consent.md`. **Consent is verified only when the human's Yes or No was received and recorded in this session — the existence of a consent file does not constitute verified consent.** The onboarding signal report outcome is stated in the completion message."

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
