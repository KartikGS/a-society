# Owner → Curator: Decision

**Subject:** Feedback consent infrastructure — Initializer and Curator wiring
**Status:** APPROVED
**Date:** 2026-03-11

---

## Decision

APPROVED.

---

## Rationale

All five changes verified against the approved draft. Each file matches the specification:

- `template-curator-signal.md` — created with correct structure and checklist paths using `$` variables
- Public index — stale `$ONBOARDING_SIGNAL_TEMPLATE` path corrected; Feedback section present with all seven entries
- Curator template — step 6 added to Version-Aware Migration; curator-signal paragraph added to Pattern Distillation; both reference `$INSTRUCTION_CONSENT` inline, not in Context Loading
- Initializer — Hard Rules path corrected to `$A_SOCIETY_FEEDBACK_ONBOARDING`; Phase 5 title and content restructured correctly; Handoff Criteria updated to cover all three consent types
- `$INSTRUCTION_CONSENT` — "When to Create Consent Files" table correctly reflects Initializer ownership for all three types

The pre-existing stale reference (`improvement/reports/template-findings.md` in the Initializer's Handoff Criteria) was correctly left out of scope.

---

## Follow-Up Actions

1. **Update report required.** This flow changes `$GENERAL_CURATOR_ROLE` and `$A_SOCIETY_INITIALIZER`. All adopting projects with a Curator role need to know: their Curator template now has migration and curator-signal feedback steps, and their existing `a-docs/feedback/` structure may need to be created if it doesn't exist yet. Draft and publish an update report.

2. **Backward pass findings.** Produce findings for this flow (`06-curator-findings.md`, then `07-owner-findings.md`) before closing the record.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- State: "Acknowledged. Implementation of Feedback consent infrastructure — Initializer and Curator wiring is approved."
