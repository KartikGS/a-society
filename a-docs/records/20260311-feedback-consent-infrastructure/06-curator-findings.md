# Backward Pass Findings: Curator — 20260311-feedback-consent-infrastructure

**Date:** 2026-03-11
**Task Reference:** 20260311-feedback-consent-infrastructure
**Role:** Curator
**Depth:** Lightweight

---

## Findings

### Conflicting Instructions

- `$INSTRUCTION_CONSENT` stated "Owner Agent" for migration and curator-signal consent creation. This conflicted directly with the brief's decision that the Initializer owns all three. Change 5 resolved it, but the conflict would have been present immediately after changes 1–4 shipped if not caught. The gap was flagged by the Curator during proposal drafting, not discovered by the Owner reviewing the brief. The brief's scope list should arguably include a note: "check whether any existing general/ instruction contradicts the agreed ownership change."

### Missing Information

- The brief did not specify how Phase 5's consent block should handle the `$GENERAL_FEEDBACK_CONSENT` template reference when creating consent files. The instruction (`$INSTRUCTION_CONSENT`) covers this in "How to Create a Consent File" step 3. The Initializer Phase 5 now references `$GENERAL_FEEDBACK_CONSENT` directly per that instruction — correct, but the Curator had to cross-reference `$INSTRUCTION_CONSENT` to confirm the right template variable. The brief could have stated this explicitly.

### Unclear Instructions

- None.

### Redundant Information

- None.

### Scope Concerns

- None. The scope boundaries in the brief were precise and held throughout execution.

### Workflow Friction

- The update report requires classification of each change's impact (Breaking / Recommended / Optional) and a version increment decision. No document explains how to classify additive changes to role templates (is adding new steps to a template "Breaking" because existing instantiations are now incomplete, or "Recommended" because existing projects still function?). The protocol defines the categories but not the edge cases. This was resolved by applying the literal definition ("gap or contradiction"), but a brief note in the update report protocol on additive-but-gap-creating changes would prevent repeated judgment calls.

---

## Top Findings (Ranked)

1. Instruction staleness risk from ownership changes — `$INSTRUCTION_CONSENT` / any instruction that names responsible roles by role title is vulnerable when ownership transfers between roles. Consider whether instructions should reference role responsibilities generically or flag which role they depend on.
2. Impact classification edge case undocumented — update report protocol does not address additive changes that create gaps in existing instantiations; a brief clarifying example would eliminate per-cycle judgment.
3. Brief scope omission — briefs that change ownership of a responsibility should explicitly name any instruction that documents the prior owner, so the Curator can flag it in proposal rather than discovering it post-approval.
