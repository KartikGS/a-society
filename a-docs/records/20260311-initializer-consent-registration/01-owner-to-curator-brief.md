# Owner → Curator: Briefing

**Subject:** Initializer Phase 5 — consent file index registration
**Status:** BRIEFED
**Date:** 2026-03-11

---

## Agreed Change

The Initializer's Phase 5 Feedback Consent block (added in `20260311-feedback-consent-infrastructure`) creates three consent files under `a-docs/feedback/[type]/consent.md` but has no step to register them in the project's `indexes/main.md`. `$INSTRUCTION_CONSENT` step 6 requires registration as `$[PROJECT]_FEEDBACK_[TYPE]_CONSENT`. Without it, any later reference to a consent file must hardcode its path — violating the no-hardcode rule and creating index drift from the moment of initialization.

**Fix:** Add a registration sub-step to each consent-file creation block in Phase 5. After creating each consent file (regardless of the consent answer), add the corresponding entry to the project's `indexes/main.md`. The variable naming pattern comes from `$INSTRUCTION_CONSENT`:

- Onboarding: `$[PROJECT]_FEEDBACK_ONBOARDING_CONSENT`
- Migration: `$[PROJECT]_FEEDBACK_MIGRATION_CONSENT`
- Curator-signal: `$[PROJECT]_FEEDBACK_CURATOR_SIGNAL_CONSENT`

Registration applies whether consent is Yes or No — the file exists either way and needs to be findable.

---

## Scope

**In scope:**
- Adding one registration sub-step to each of the three consent-file creation blocks in the Initializer's Phase 5 Feedback Consent step

**Out of scope:**
- Any other Phase 5 changes
- Changes to `$INSTRUCTION_CONSENT` — the naming pattern is already specified there; no update needed
- Existing initialized projects — they do not have consent files to register; this fix applies to future initializations only

---

## Likely Target

- `$A_SOCIETY_INITIALIZER` — `/a-society/agents/initializer.md`

---

## Open Questions for the Curator

None. The change is fully specified.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Initializer Phase 5 — consent file index registration."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
