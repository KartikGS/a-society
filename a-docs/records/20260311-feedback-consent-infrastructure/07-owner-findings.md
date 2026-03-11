# Backward Pass Findings: Owner — 20260311-feedback-consent-infrastructure

**Date:** 2026-03-11
**Task Reference:** 20260311-feedback-consent-infrastructure
**Role:** Owner
**Depth:** Standard

---

## Findings

### Seconded from Curator

All three Curator findings are valid and seconded:

1. **Instruction staleness risk from ownership changes** — Any instruction that names a specific role as responsible for an action is vulnerable when ownership transfers between roles. `$INSTRUCTION_CONSENT` is the example here; it won't be the last. This is a systemic risk, not a one-off.

2. **Impact classification edge case undocumented** — "Additive changes that create gaps in existing instantiations" is a real category that the update report protocol doesn't address. We resolved it as Breaking (correct), but only by applying the literal definition. A clarifying example in the protocol would eliminate repeated judgment calls.

3. **Brief scope for ownership transfers** — Briefs that move a responsibility from one role to another should explicitly list any existing instruction that names the prior owner. This converts a post-approval discovery (Change 5) into an in-scope item from the start.

---

### New Findings

**1. Initializer Phase 5 does not register consent files in the project index.**

`$INSTRUCTION_CONSENT` step 6 states: "Register it in the project's index as `$[PROJECT]_FEEDBACK_[TYPE]_CONSENT`." The updated Initializer Phase 5 creates the consent files correctly but has no step to register them. The Initializer builds the project's index in Phase 3 step 12 — but consent files are created in Phase 5, after the index is written. The Phase 5 Feedback Consent block needs a registration step: after each consent file is created, add the entry to `indexes/main.md`.

This is a functional gap: Curators who later need to reference the consent file by variable won't find it in the index, and will either hardcode the path (violating the no-hardcode rule) or be unable to resolve it.

**2. "Onboarding Signal" section in the public index is now an orphan.**

The public index has two adjacent sections: "Onboarding Signal" (one entry: `$ONBOARDING_SIGNAL_TEMPLATE`) and "Feedback" (seven entries). The onboarding signal template is a feedback artifact. Keeping it in a separate section creates the impression that onboarding signal is outside the feedback system, which contradicts how it actually works. Low-priority cosmetic issue, but worth folding `$ONBOARDING_SIGNAL_TEMPLATE` into the Feedback section.

---

## Top Findings (Ranked)

1. Initializer Phase 5 missing index registration for consent files — functional gap, breaks the no-hardcode rule for Curators
2. Instruction staleness risk from ownership changes — systemic, worth a general principle or checklist item for brief writing
3. Impact classification edge case undocumented in update report protocol — recurring judgment call that should be codified
4. Public index "Onboarding Signal" section orphaned from Feedback section — cosmetic, low-priority
