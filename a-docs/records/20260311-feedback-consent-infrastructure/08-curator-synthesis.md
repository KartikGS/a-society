# Curator Synthesis — 20260311-feedback-consent-infrastructure

**Date:** 2026-03-11
**Produced by:** Curator
**Source:** `06-curator-findings.md` + `07-owner-findings.md`

---

## Summary

Four findings were produced across both backward passes. All four are actionable. They split into two natural clusters by urgency and type.

---

## Findings Assessed

| # | Finding | Source | Actionable? | Proposed path |
|---|---|---|---|---|
| 1 | Initializer Phase 5 missing index registration for consent files | Owner (new) | Yes | New flow — functional gap fix |
| 2 | Instruction staleness risk from ownership changes | Curator + Owner (seconded) | Yes | New flow — brief template + principle |
| 3 | Impact classification edge case undocumented in update report protocol | Curator + Owner (seconded) | Yes | Bundle with Finding 2 |
| 4 | Public index "Onboarding Signal" section orphaned from Feedback section | Owner (new) | Yes | Bundle with Finding 2 |

---

## Cluster 1 — Functional Gap: Initializer Phase 5 Index Registration

**Finding:** The updated Initializer Phase 5 creates three consent files under `a-docs/feedback/[type]/consent.md` but has no step to register them in the project index. `$INSTRUCTION_CONSENT` step 6 requires registration as `$[PROJECT]_FEEDBACK_[TYPE]_CONSENT`. Without registration, any later reference to a consent file must hardcode its path — violating the no-hardcode rule and creating the exact drift the index is designed to prevent.

**Urgency:** High. This is a functional gap in a just-published Initializer change. Any project initialized after v2.0 will have unregistered consent files.

**Recommended scope:** Add a registration sub-step to each consent-file creation block in Phase 5. Each block (onboarding, migration, curator-signal) should, after creating the consent file, add the corresponding entry to `indexes/main.md`. The variable names should follow `$INSTRUCTION_CONSENT`'s recommended naming pattern: `$[PROJECT]_FEEDBACK_ONBOARDING_CONSENT`, `$[PROJECT]_FEEDBACK_MIGRATION_CONSENT`, `$[PROJECT]_FEEDBACK_CURATOR_SIGNAL_CONSENT`.

**Proposed new flow:** Owner to brief. Suggested slug: `20260311-initializer-consent-registration`.

---

## Cluster 2 — Protocol and Template Improvements

**Finding 2 — Instruction staleness risk:** When a brief changes which role owns an action, any existing instruction naming the prior owner becomes stale. The `$INSTRUCTION_CONSENT` table was stale after this flow's Changes 1–4 but before Change 5 was added. The gap was caught in the proposal stage, not in the brief. If the brief had listed "check whether any instruction names the role we're transferring responsibility away from," Change 5 would have been in scope from the start.

**Proposed fix:** Add a note to the Owner → Curator brief template (`$A_SOCIETY_COMM_TEMPLATE_BRIEF`). Suggested placement: a brief checklist or callout at the bottom — if this brief transfers a responsibility from one role to another, list any instruction that documents who currently owns that responsibility. One sentence in the template is enough to make this a standing habit.

**Finding 3 — Impact classification edge case:** The update report protocol defines Breaking, Recommended, and Optional, but does not address "additive changes that create gaps in existing instantiations." The practical resolution (apply the literal definition: gap → Breaking) is correct, but has to be reasoned fresh each time. A single clarifying example in the protocol eliminates the recurring judgment call.

**Proposed fix:** Add one sentence or example to the Breaking definition in `$A_SOCIETY_UPDATES_PROTOCOL`: something like "This includes additive changes that make existing instantiations incomplete — for example, a new mandatory step added to a template creates a gap in any project that instantiated the template before the addition."

**Finding 4 — Public index orphan:** `$ONBOARDING_SIGNAL_TEMPLATE` sits in a standalone "Onboarding Signal" section immediately before the new "Feedback" section. Onboarding signal is a feedback type; keeping it in a separate section implies it is outside the feedback system. Cosmetic, but creates a navigability confusion in the index.

**Proposed fix:** Merge the "Onboarding Signal" row into the "Feedback" section. Delete the orphan section header. The path and variable name are unchanged.

**Proposed new flow:** Owner to brief. All three fixes are small and can be batched in a single flow. Suggested slug: `20260311-protocol-and-template-improvements`.

---

## Proposed Next Actions for the Owner

1. **Brief `20260311-initializer-consent-registration`** — Functional gap, should be addressed before the next initialization run.
2. **Brief `20260311-protocol-and-template-improvements`** — Small improvements; can be lower priority. Findings 2, 3, and 4 can be batched or split at Owner discretion.

This record is otherwise complete. The Curator has no further actions here.
