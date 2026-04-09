# Instruction: Feedback Consent Setup

This instruction explains how to establish the consent system in a project's `a-docs/` during initialization, and how agents use it when producing feedback signal for A-Society.

---

## What Feedback Consent Is

A-Society collects feedback signal from adopting projects to improve the framework — but only with the project owner's explicit permission. Consent is recorded in small, targeted files: one per feedback type, stored adjacent to where that feedback would be produced.

Agents check consent before writing any feedback. If consent is absent or denied, they skip the write and note it in session output. No agent writes feedback without a recorded Yes.

---

## When to Create Consent Files

Consent files are created when a feedback-producing agent is first set up for the project — not all at once. Create the consent file for a feedback type when that feedback type becomes relevant:

| Feedback type | Created by | When |
|---|---|---|
| `onboarding-signal` | Initializer | During initialization (Phase 5), before closing |
| `migration` | Initializer | During initialization (Phase 5), if a Curator role was created |
| `curator-signal` | Initializer | During initialization (Phase 5), if a Curator role was created |

Do not create consent files for feedback types that are not yet active in the project.

---

## How to Create a Consent File

1. Ask the human explicitly: "May A-Society write a [type] report to `a-society/feedback/[type]/` after [triggering event]? This report helps A-Society improve the framework."
2. Record the answer — do not infer consent from silence or general agreement.
3. Use the project's executable consent-creation capability, if one exists, to create the consent file. Pass the project's `a-docs/` path, the feedback type identifier (`onboarding`, `migration`, or `curator-signal`), and the consent answer recorded in step 2. If no such capability exists, copy `$GENERAL_FEEDBACK_CONSENT` manually, fill in the Type, Consented, Date, Recorded by, and description fields, and save at `a-docs/feedback/[type]/consent.md`.
4. Register the consent file in the project's index as `$[PROJECT]_FEEDBACK_[TYPE]_CONSENT`.

---

## Folder Structure

Each project's `a-docs/feedback/` folder mirrors A-Society's own `a-society/feedback/` collection folders:

```
a-docs/feedback/
  onboarding/
    consent.md        ← checked by Initializer before writing onboarding signal
  migration/
    consent.md        ← checked by Curator before filing a migration feedback report
    [local draft migration reports, if any]
  curator-signal/
    consent.md        ← checked by Curator before submitting patterns to A-Society
```

---

## Agent Behavior at Feedback Time

Before writing any feedback artifact, the producing agent must:

1. Read the consent file at `a-docs/feedback/[type]/consent.md`
2. If `Consented: Yes` — proceed with writing to `a-society/feedback/[type]/[project]-[date].md`
3. If `Consented: No` or the file does not exist — skip. Output: "Feedback skipped — consent not recorded for [type]."

The consent file is not loaded at session start. It is loaded only at the moment the agent is about to write feedback.

---

## What Does Not Belong Here

- Do not store actual feedback reports in `a-docs/feedback/` — filed reports go to `a-society/feedback/[type]/` (A-Society's collection folder)
- Do not use `a-docs/feedback/` for any purpose other than consent files and in-progress local drafts
- Do not create a consent file without asking the human — assumed consent is not consent
