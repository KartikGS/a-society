# Owner → Curator: Briefing

**Subject:** Protocol and template improvements — backward pass learnings batch
**Status:** BRIEFED
**Date:** 2026-03-11

---

## Agreed Change

Five small improvements accumulated across the backward passes of `20260311-feedback-consent-infrastructure` and `20260311-initializer-consent-registration`. All five are self-contained. They touch four files and can be implemented in any order.

---

**1. `$A_SOCIETY_UPDATES_PROTOCOL` — Breaking classification edge case**

The update report protocol defines Breaking, Recommended, and Optional but does not address additive changes that create gaps in existing instantiations. The recurring judgment call: "is a new mandatory step added to a template Breaking (existing projects now have a gap) or Recommended (existing projects still function)?" The answer is Breaking — a gap is a contradiction with the current standard — but it has to be reasoned fresh each time because the protocol doesn't say so.

Add one clarifying sentence or example to the Breaking definition. It should cover: additive changes that make existing instantiations incomplete are Breaking, because existing projects now have a gap relative to the current standard. Example phrasing: "This includes additive changes that make existing instantiations incomplete — for example, a new mandatory step added to a role template creates a gap in any project that instantiated the template before the addition."

**2. `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — ownership-transfer note**

When a brief moves a responsibility from one role to another, any existing instruction that documents who currently owns that responsibility becomes a candidate for staleness. In `20260311-feedback-consent-infrastructure`, the `$INSTRUCTION_CONSENT` table was stale after Changes 1–4 but before Change 5 was added — caught at proposal stage, not in the brief.

Add a note to the brief template. Placement: a callout or checklist item near the bottom of the template, activated when the brief transfers a responsibility. One sentence: if this brief moves a responsibility from one role to another, list any instruction that names the prior owner as responsible.

**3. `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — fully-specified brief signal**

The brief template already has an "Open Questions" section. When there are genuinely no open questions — the change is fully derivable from existing instructions — the section is left blank or the Curator has to guess whether questions are expected. Stating "None" explicitly signals to the Curator that no judgment calls are required and the proposal round is mechanical.

Add a brief note to the Open Questions section instructions: when there are no open questions, state "None" explicitly. This tells the Curator to proceed mechanically without seeking clarification.

**4. `$A_SOCIETY_RECORDS` — backward pass pre-check**

The records convention states that backward pass findings occupy the final positions in the sequence, but does not give the Curator an explicit pre-condition to check before filing. In `20260311-initializer-consent-registration`, findings were filed before the submission review was resolved — a sequencing error, self-corrected.

Add a stated pre-condition to the backward pass section of the records convention: before filing findings, confirm that all submissions in this flow are resolved — meaning the Owner has responded to every Curator → Owner artifact that followed the main decision.

**5. `$A_SOCIETY_PUBLIC_INDEX` — consolidate orphaned section**

The public index has a standalone "Onboarding Signal" section containing only `$ONBOARDING_SIGNAL_TEMPLATE`, immediately above the "Feedback" section. Onboarding signal is a feedback type; the separate section implies otherwise and creates a navigation confusion.

Move the `$ONBOARDING_SIGNAL_TEMPLATE` row into the "Feedback" section. Delete the "Onboarding Signal" section header. The variable name and path are unchanged.

---

## Scope

**In scope:**
- Exactly the five changes described above — one sentence or example per change, no broader rewrites

**Out of scope:**
- Any other changes to these files beyond the specified additions
- Changes to the internal index (`$A_SOCIETY_INDEX`) — the `$A_SOCIETY_FEEDBACK_CURATOR_SIGNAL` description there is stale ("mechanism TBD") but is a separate cleanup item; do not address it here

---

## Likely Targets

- `$A_SOCIETY_UPDATES_PROTOCOL` — `/a-society/a-docs/updates/protocol.md`
- `$A_SOCIETY_COMM_TEMPLATE_BRIEF` — `/a-society/a-docs/communication/conversation/TEMPLATE-owner-to-curator-brief.md`
- `$A_SOCIETY_RECORDS` — `/a-society/a-docs/records/main.md`
- `$A_SOCIETY_PUBLIC_INDEX` — `/a-society/index.md`

---

## Open Questions for the Curator

None. All five changes are fully specified.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Protocol and template improvements — backward pass learnings batch."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
