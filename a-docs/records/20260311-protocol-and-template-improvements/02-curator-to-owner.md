# Curator → Owner: Proposal / Submission

**Subject:** Protocol and template improvements — backward pass learnings batch
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-11

---

## Trigger

Five findings accumulated across the backward passes of `20260311-feedback-consent-infrastructure` and `20260311-initializer-consent-registration`. Briefed by Owner.

---

## What and Why

Five small, self-contained improvements to protocol and template documents. Each is a direct codification of a judgment call or pattern observed during session execution. No architectural changes.

---

## Where Observed

A-Society — internal. All five sourced from backward pass findings in the two preceding flows.

---

## Target Location

- `$A_SOCIETY_UPDATES_PROTOCOL` — `/a-society/a-docs/updates/protocol.md`
- `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — `/a-society/a-docs/communication/conversation/TEMPLATE-owner-to-curator-brief.md`
- `$A_SOCIETY_RECORDS` — `/a-society/a-docs/records/main.md`
- `$A_SOCIETY_PUBLIC_INDEX` — `/a-society/index.md`

---

## Draft Content

### Change 1 — `$A_SOCIETY_UPDATES_PROTOCOL`: Breaking classification edge case

**Current Breaking definition:**
> **Breaking** — Adopting projects are currently operating with a gap or contradiction introduced by this change. The Curator must review their project's `a-docs/` and determine whether to adopt the change. Examples: a new mandatory section was added to a template; a protocol was corrected that projects may have implemented incorrectly.

**After (append one sentence):**
> **Breaking** — Adopting projects are currently operating with a gap or contradiction introduced by this change. The Curator must review their project's `a-docs/` and determine whether to adopt the change. Examples: a new mandatory section was added to a template; a protocol was corrected that projects may have implemented incorrectly. This includes additive changes that make existing instantiations incomplete — for example, a new mandatory step added to a role template creates a gap in any project that instantiated the template before the addition.

---

### Change 2 — `$A_SOCIETY_COMM_TEMPLATE_BRIEF`: Ownership-transfer note

Add a callout block between the `## Scope` section and the `## Likely Target` section:

> ---
>
> > **Responsibility transfer note:** If this brief moves a responsibility from one role to another, list here any instruction that currently names the prior owner as responsible. This converts a post-proposal staleness discovery into an in-scope item from the start.
>
> ---

---

### Change 3 — `$A_SOCIETY_COMM_TEMPLATE_BRIEF`: Fully-specified brief signal

**Current Open Questions instruction text:**
> [Things the Curator should research or decide during proposal formulation. If none, state "None — the scope and target are clear."]

**After:**
> [Things the Curator should research or decide during proposal formulation. If none, state "None" explicitly — this tells the Curator that no judgment calls are required and the proposal round is mechanical, not that questions were forgotten.]

---

### Change 4 — `$A_SOCIETY_RECORDS`: Backward pass pre-check

**Current text** (end of the Artifact Sequence section):
> Backward-pass findings always occupy the final positions in the sequence. Example: main flow closes at `03-owner-to-curator.md`; update report submission takes `04-curator-to-owner.md` and Owner decision takes `05-owner-to-curator.md`; backward-pass findings then start at `06-`.

**After (append one sentence):**
> Backward-pass findings always occupy the final positions in the sequence. Example: main flow closes at `03-owner-to-curator.md`; update report submission takes `04-curator-to-owner.md` and Owner decision takes `05-owner-to-curator.md`; backward-pass findings then start at `06-`. Before filing findings, confirm that all submissions in this flow are resolved — meaning the Owner has responded to every Curator → Owner artifact that followed the main decision.

---

### Change 5 — `$A_SOCIETY_PUBLIC_INDEX`: Consolidate orphaned section

**Current structure (lines 17–26):**
```
| **Onboarding Signal** | | |
| `$ONBOARDING_SIGNAL_TEMPLATE` | `/a-society/feedback/onboarding/_template.md` | Template for Initializer signal reports — one report per initialization run |
| **Feedback** | | |
| `$INSTRUCTION_CONSENT` | ...
| ...seven more rows...
```

**After — delete the "Onboarding Signal" section header and move `$ONBOARDING_SIGNAL_TEMPLATE` as the first row of the Feedback section:**
```
| **Feedback** | | |
| `$ONBOARDING_SIGNAL_TEMPLATE` | `/a-society/feedback/onboarding/_template.md` | Template for Initializer signal reports — one report per initialization run |
| `$INSTRUCTION_CONSENT` | ...
| ...seven more rows...
```

No variable name or path changes.

---

## Owner Confirmation Required

The Owner must respond in `03-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `03-owner-to-curator.md` shows APPROVED status.
