# Curator → Owner: Proposal / Submission

**Subject:** Feedback consent infrastructure — Initializer and Curator wiring
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-11

---

## Trigger

Human identified a gap. Briefed via `01-owner-to-curator-brief.md` in this record folder. The feedback consent infrastructure exists partially but is not wired: a curator-signal template is absent, the public index is missing or stale on all feedback entries, and neither the Curator template nor the Initializer have steps to act on consent.

---

## What and Why

Four coordinated changes wire the feedback consent infrastructure end-to-end:

1. A new curator-signal template so Curators have a structured artifact to file
2. Public index corrections and additions so all feedback paths resolve
3. Curator role template additions so migration and pattern-distillation activities trigger feedback at the right moment
4. Initializer Phase 5 restructuring so all three consent conversations happen at initialization — with the Initializer owning all three

This is A-Society-internal maintenance. Generalizability is not the test for changes 2–4; correctness and completeness are. Change 1 (the new template) is a `general/` addition and must pass the generalizability test: any project with a Curator role that observes patterns in execution would benefit from a structured curator-signal report, regardless of domain. It applies equally to a software project, a writing project, and a research project.

---

## Where Observed

A-Society — internal. The gap was identified by reviewing the consent instruction (`$INSTRUCTION_CONSENT`), the public index (`$A_SOCIETY_PUBLIC_INDEX`), the Curator template (`$GENERAL_CURATOR_ROLE`), and the Initializer (`$A_SOCIETY_INITIALIZER`) against each other.

---

## Target Location

- New: `a-society/general/feedback/template-curator-signal.md`
- `$A_SOCIETY_PUBLIC_INDEX` — `/a-society/index.md`
- `$GENERAL_CURATOR_ROLE` — `/a-society/general/roles/curator.md`
- `$A_SOCIETY_INITIALIZER` — `/a-society/agents/initializer.md`

---

## Answers to Open Questions

### Q1 — Phase 5 structure: one step with sub-blocks or three steps?

**Recommendation: one step ("Feedback Consent") with three labeled sub-blocks.**

Rationale: all three consent conversations are one logical activity—gathering consent before the session closes. Splitting them into three numbered steps inflates Phase 5 from five steps to seven without adding structural clarity, and makes the conditional logic ("only if Curator role created") harder to read when it has to appear as a condition on the step heading rather than as a qualifier inside a sub-block. A single step with clearly labeled sub-blocks keeps the conditionality local and the step count minimal.

### Q2 — `$INSTRUCTION_CONSENT` placement in the Curator template

**Recommendation: inline reference only — not in Context Loading.**

Rationale: Principle 1 (Context Is a Scarce Resource) prohibits adding documents to required session-start reading unless the role cannot operate without them. Most Curator sessions involve neither a migration nor a pattern distillation that triggers feedback filing. Adding `$INSTRUCTION_CONSENT` to Context Loading would load it in every session, including sessions where it is never needed. Inline references at the point of use — within the new step 6 of Version-Aware Migration and the new closing paragraph of Pattern Distillation — load the instruction exactly when and only when the Curator is about to write feedback.

---

## Additional Observation (Flagged for Owner Decision)

`$INSTRUCTION_CONSENT` currently states that `migration` and `curator-signal` consent files are "Created by: Owner Agent". After change 4 of this flow, those conversations move to the Initializer. This makes the table in `$INSTRUCTION_CONSENT` stale. This file is not in the brief's scope, but the staleness is a direct consequence of change 4.

**Options:**
- Include a fifth change in this flow: update the `$INSTRUCTION_CONSENT` "When to Create Consent Files" table to reflect Initializer ownership of all three types.
- File it as a separate maintenance item.

The Curator flags this for Owner judgment. It is not implemented below.

---

## Draft Content

### Change 1 — New file: `a-society/general/feedback/template-curator-signal.md`

```markdown
# Curator-Signal Feedback Report — Template

**Project:** [project name]
**Date:** [YYYY-MM-DD]
**Produced by:** [Curator role name from this project's a-docs]
**Context:** [Backward pass / Ongoing observation]

---

## Patterns Observed

Practices from this project's execution that may generalize to other projects and warrant addition to `a-society/general/`.

| Pattern name | Evidence | Problem it solves |
|---|---|---|
| [name] | [where observed, what the Curator did, what resulted] | [what would have gone wrong without it] |

[Or: "No patterns observed in this period."]

---

## Anti-Patterns Observed

Practices that created friction or confusion that A-Society's guidance could help prevent in other projects.

| Anti-pattern name | Evidence | Suggested guidance |
|---|---|---|
| [name] | [what happened, what went wrong] | [what guidance would have prevented it] |

[Or: "No anti-patterns observed in this period."]

---

## Documentation Gaps

Areas where `a-society/general/` lacked guidance that was needed during execution.

| Gap | Context | Suggested addition |
|---|---|---|
| [what was missing] | [when the gap was encountered, what judgment call was required] | [type of document or addition that would fill it] |

[Or: "No documentation gaps encountered."]

---

## Recommendations

| Target | Change type | Description |
|---|---|---|
| [general/ path / a-society process] | Clarify / Add / Remove | [what and why] |

[Or: "No recommendations at this time."]

---

## Completion Checklist

- [ ] Consent verified at `a-docs/feedback/curator-signal/consent.md` before filing this report
- [ ] Report filed at `$A_SOCIETY_FEEDBACK_CURATOR_SIGNAL/[project]-[YYYY-MM-DD].md`
```

---

### Change 2 — Public index (`$A_SOCIETY_PUBLIC_INDEX`)

**Fix stale entry in the existing "Onboarding Signal" section:**

| Old | New |
|---|---|
| `$ONBOARDING_SIGNAL_TEMPLATE` → `/a-society/onboarding_signal/_template.md` | `$ONBOARDING_SIGNAL_TEMPLATE` → `/a-society/feedback/onboarding/_template.md` |

**Add new "Feedback" section** (insert after the "Onboarding Signal" section):

```markdown
| **Feedback** | | |
| `$INSTRUCTION_CONSENT` | `/a-society/general/instructions/consent.md` | How to establish the feedback consent system in a project during initialization |
| `$GENERAL_FEEDBACK_CONSENT` | `/a-society/general/feedback/consent.md` | Ready-made consent file template — instantiated per feedback type in a project's a-docs/feedback/[type]/ |
| `$GENERAL_FEEDBACK_MIGRATION_TEMPLATE` | `/a-society/general/feedback/template-migration.md` | Migration feedback report template — used by Curators after implementing framework update reports |
| `$GENERAL_FEEDBACK_CURATOR_SIGNAL_TEMPLATE` | `/a-society/general/feedback/template-curator-signal.md` | Curator-signal feedback report template — used by Curators after backward passes or ongoing observation |
| `$A_SOCIETY_FEEDBACK_ONBOARDING` | `/a-society/feedback/onboarding/` | Initializer signal reports — filed after initialization runs with project consent |
| `$A_SOCIETY_FEEDBACK_MIGRATION` | `/a-society/feedback/migration/` | Migration feedback reports — filed by Curators after implementing framework update reports |
| `$A_SOCIETY_FEEDBACK_CURATOR_SIGNAL` | `/a-society/feedback/curator-signal/` | Curator-signal reports from adopting projects — patterns and gaps filed after backward passes |
```

Note: `$INSTRUCTION_CONSENT` and `$GENERAL_FEEDBACK_CONSENT` already appear in the internal A-Society index (`$A_SOCIETY_INDEX`) but are absent from the public index. This change makes them resolvable by external agents (Initializer, project Curators) who read the public index.

---

### Change 3 — Curator role template (`$GENERAL_CURATOR_ROLE`)

**Version-Aware Migration — add step 6 after current step 5:**

> 6. After marking migration complete, check `a-docs/feedback/migration/consent.md` (see `$INSTRUCTION_CONSENT` for the consent check procedure). If `Consented: Yes`, generate a migration feedback report using `$GENERAL_FEEDBACK_MIGRATION_TEMPLATE` and file it at `$A_SOCIETY_FEEDBACK_MIGRATION/[project]-[update-report-date].md`. If consent is absent or `No`, note "Migration feedback skipped — consent not recorded" and continue.

**Pattern Distillation — add after the closing line "submit to the Owner for review":**

> After submitting, independently of whether the Owner approves the proposal, check `a-docs/feedback/curator-signal/consent.md` (see `$INSTRUCTION_CONSENT`). If `Consented: Yes`, file a curator-signal report using `$GENERAL_FEEDBACK_CURATOR_SIGNAL_TEMPLATE` at `$A_SOCIETY_FEEDBACK_CURATOR_SIGNAL/[project]-[YYYY-MM-DD].md`. The report captures observations regardless of approval outcome. If consent is absent or `No`, note "Curator-signal feedback skipped — consent not recorded" and continue.

---

### Change 4 — Initializer (`$A_SOCIETY_INITIALIZER`)

**Hard Rules — fix stale path:**

Current line:
> The Initializer writes to exactly two locations: the target project's `a-docs/`, and `a-society/onboarding_signal/` for the signal report.

Replace `a-society/onboarding_signal/` with `$A_SOCIETY_FEEDBACK_ONBOARDING`:
> The Initializer writes to exactly two locations: the target project's `a-docs/`, and `$A_SOCIETY_FEEDBACK_ONBOARDING` for the signal report.

---

**Phase 5 title — update:**

Current: `Phase 5 — Completion, Onboarding, and Signal Report Consent`
New: `Phase 5 — Completion, Onboarding, and Feedback Consent`

---

**Phase 5 steps 3–5 — replace with single "Feedback Consent" step:**

Current steps 3–5:
> 3. Request informed consent for onboarding signal reporting: [...]
> 4. If permission is granted: [...]
> 5. If permission is denied: [...]

Replace with:

> 3. Feedback Consent
>
> Before beginning this step, read `$INSTRUCTION_CONSENT`.
>
> **Onboarding signal** (always):
> - Explain: "A-Society uses initialization data to improve the framework. A signal report summarizes how this initialization went and what could be clearer."
> - Ask: "May A-Society write an onboarding signal report to `a-society/feedback/onboarding/`?"
> - Create `a-docs/feedback/onboarding/consent.md` using `$GENERAL_FEEDBACK_CONSENT`, recording the answer.
> - If `Consented: Yes`: generate the report using `$ONBOARDING_SIGNAL_TEMPLATE`, file it at `$A_SOCIETY_FEEDBACK_ONBOARDING/[project-name]-[YYYY-MM-DD].md`, confirm report produced.
> - If `Consented: No`: state explicitly in completion messaging that the onboarding signal report was not produced.
>
> **Migration feedback** *(only if a Curator role was created in Phase 3)*:
> - Explain: "When A-Society releases updates to its framework, the Curator applies those changes to your project. A migration report captures how clearly that guidance worked, helping A-Society improve its update process."
> - Ask: "May A-Society write a migration feedback report to `a-society/feedback/migration/` after each update is applied?"
> - Create `a-docs/feedback/migration/consent.md` using `$GENERAL_FEEDBACK_CONSENT`, recording the answer.
>
> **Curator-signal feedback** *(only if a Curator role was created in Phase 3)*:
> - Explain: "During backward improvement passes, your Curator identifies practices worth generalizing across projects. A curator-signal report captures those observations as structured data for A-Society's library."
> - Ask: "May A-Society write a curator-signal report to `a-society/feedback/curator-signal/` after each backward pass?"
> - Create `a-docs/feedback/curator-signal/consent.md` using `$GENERAL_FEEDBACK_CONSENT`, recording the answer.

---

**Handoff Criteria — update the signal report criterion:**

Current:
> The onboarding signal report outcome is explicit: either written with user consent, or declined by the user and recorded in the completion statement

Replace with:
> The feedback consent outcome is explicit for each applicable type: onboarding signal (always), migration feedback (if a Curator role was created), and curator-signal feedback (if a Curator role was created). Each consent is recorded in `a-docs/feedback/[type]/consent.md`. The onboarding signal report outcome is stated in the completion message.

---

## Owner Confirmation Required

The Owner must respond in `03-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `03-owner-to-curator.md` shows APPROVED status.
