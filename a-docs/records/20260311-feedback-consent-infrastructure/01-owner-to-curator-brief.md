# Owner → Curator: Briefing

**Subject:** Feedback consent infrastructure — Initializer and Curator wiring
**Status:** BRIEFED
**Date:** 2026-03-11

---

## Agreed Change

The feedback consent infrastructure is partially built but not wired. The consent instruction (`$INSTRUCTION_CONSENT`) and its template (`$GENERAL_FEEDBACK_CONSENT`) exist, as does the migration feedback template. What is missing:

- No curator-signal feedback template exists
- The public index is missing entries for the entire feedback infrastructure — `$INSTRUCTION_CONSENT`, `$GENERAL_FEEDBACK_CONSENT`, the migration and curator-signal templates, the three collection folder paths — and the onboarding signal template path is stale
- The Curator role template has no steps for filing migration feedback or curator-signal feedback after the relevant activities
- The Initializer handles onboarding consent verbally with no consent file created; migration and curator-signal consent are assigned to the Owner, who has no workflow trigger to do it

**Decision:** The Initializer will own all three consent conversations during Phase 5 — not the Owner. Migration and curator-signal consent are asked only if a Curator role was created during Phase 3. The Initializer provides two-sentence educational context for migration and curator-signal before asking, since first-time users will not know what these concepts mean.

This requires four coordinated changes:

**1. New file — `a-society/general/feedback/template-curator-signal.md`**

A structured feedback report template, parallel to `$GENERAL_FEEDBACK_MIGRATION_TEMPLATE`. Contents:
- Header fields: project, date, produced by, context (backward pass / ongoing observation)
- Patterns observed — name, evidence, problem it solves
- Anti-patterns observed — name, evidence, suggested guidance
- Documentation gaps in `a-society/general/` — gap, context, suggested addition
- Recommendations table — target, change type, description
- Completion checklist — including: consent verified at `a-docs/feedback/curator-signal/consent.md`, report filed at `$A_SOCIETY_FEEDBACK_CURATOR_SIGNAL/[project]-[YYYY-MM-DD].md`

**2. Public index (`$A_SOCIETY_PUBLIC_INDEX`)**

Fix the stale entry: `$ONBOARDING_SIGNAL_TEMPLATE` currently points to `/a-society/onboarding_signal/_template.md` — correct path is `/a-society/feedback/onboarding/_template.md`.

Add missing entries in a new "Feedback" section:
- `$INSTRUCTION_CONSENT` → `/a-society/general/instructions/consent.md`
- `$GENERAL_FEEDBACK_CONSENT` → `/a-society/general/feedback/consent.md`
- `$GENERAL_FEEDBACK_MIGRATION_TEMPLATE` → `/a-society/general/feedback/template-migration.md`
- `$GENERAL_FEEDBACK_CURATOR_SIGNAL_TEMPLATE` → `/a-society/general/feedback/template-curator-signal.md`
- `$A_SOCIETY_FEEDBACK_ONBOARDING` → `/a-society/feedback/onboarding/`
- `$A_SOCIETY_FEEDBACK_MIGRATION` → `/a-society/feedback/migration/`
- `$A_SOCIETY_FEEDBACK_CURATOR_SIGNAL` → `/a-society/feedback/curator-signal/`

**3. Curator role template (`$GENERAL_CURATOR_ROLE`)**

Two additions to existing sections:

*Version-Aware Migration — add step 6:* After marking migration complete (step 5), check `a-docs/feedback/migration/consent.md`. If `Consented: Yes`, generate a migration feedback report using `$GENERAL_FEEDBACK_MIGRATION_TEMPLATE` and file it at `$A_SOCIETY_FEEDBACK_MIGRATION/[project]-[update-report-date].md`. If consent is absent or No, note "Migration feedback skipped — consent not recorded" and continue.

*Pattern Distillation — add a step after submitting the proposal to Owner:* Independently of whether the Owner approves the proposal, check `a-docs/feedback/curator-signal/consent.md`. If `Consented: Yes`, file a curator-signal report using `$GENERAL_FEEDBACK_CURATOR_SIGNAL_TEMPLATE` at `$A_SOCIETY_FEEDBACK_CURATOR_SIGNAL/[project]-[YYYY-MM-DD].md`. The report captures observations regardless of approval outcome.

**4. Initializer (`$A_SOCIETY_INITIALIZER`)**

Three changes:

*Hard Rules:* Replace stale path `a-society/onboarding_signal/` with `$A_SOCIETY_FEEDBACK_ONBOARDING`.

*Phase 5 — Feedback consent block:* Replace the current step 3 (informal ask and immediate act) with a structured feedback consent block following `$INSTRUCTION_CONSENT`:
- For onboarding-signal (always): ask, create `a-docs/feedback/onboarding/consent.md`, file report if yes using `$ONBOARDING_SIGNAL_TEMPLATE`
- For migration (only if a Curator role was created): provide two-sentence explanation — *"When A-Society releases updates to its framework, the Curator applies those changes to your project. A migration report captures how clearly that guidance worked, helping A-Society improve its update process."* Then ask, create `a-docs/feedback/migration/consent.md`
- For curator-signal (only if a Curator role was created): provide two-sentence explanation — *"During backward improvement passes, your Curator identifies practices worth generalizing across projects. A curator-signal report captures those observations as structured data for A-Society's library."* Then ask, create `a-docs/feedback/curator-signal/consent.md`

*Context Loading:* Add `$INSTRUCTION_CONSENT` as a prerequisite for Phase 5 — read it before beginning the feedback consent block, not at session start.

---

## Scope

**In scope:**
- Creating `a-society/general/feedback/template-curator-signal.md`
- Fixing and extending `$A_SOCIETY_PUBLIC_INDEX` as described above
- Extending `$GENERAL_CURATOR_ROLE` (Version-Aware Migration and Pattern Distillation sections only)
- Restructuring Phase 5 of `$A_SOCIETY_INITIALIZER`, fixing the Hard Rules stale path, and adding `$INSTRUCTION_CONSENT` as a Phase 5 prerequisite

**Out of scope:**
- The Initializer's Phase 3 steps 9–10 reference `improvement/reports/` — this is a separate stale reference issue, not part of this flow
- Propagating consent infrastructure to existing initialized project curator role files — those projects receive this via the normal migration path when the update report is published
- Creating `a-society/feedback/migration/` and `a-society/feedback/curator-signal/` directories — created when the first report is filed; no placeholder files needed now

---

## Likely Targets

- New: `a-society/general/feedback/template-curator-signal.md`
- `$A_SOCIETY_PUBLIC_INDEX` — `/a-society/index.md`
- `$GENERAL_CURATOR_ROLE` — `/a-society/general/roles/curator.md`
- `$A_SOCIETY_INITIALIZER` — `/a-society/agents/initializer.md`

---

## Open Questions for the Curator

1. **Phase 5 structure:** The three consent conversations need to replace what is currently a single step 3 in Phase 5. Propose whether these should be a single numbered step "Feedback Consent" with labeled sub-blocks, or three separate numbered steps. Choose whichever fits the existing Phase 5 structure cleanest without inflating the step count unnecessarily.

2. **`$INSTRUCTION_CONSENT` placement in curator template:** The consent instruction is not required session-start reading — it is loaded on-demand only at the moment feedback is about to be written. Propose whether it belongs as an inline reference only within the Version-Aware Migration and Pattern Distillation sections, or whether a brief note in Context Loading ("when producing feedback, read `$INSTRUCTION_CONSENT` before acting") is cleaner.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Feedback consent infrastructure — Initializer and Curator wiring."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
