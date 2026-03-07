# Owner → Curator: Briefing

**Subject:** Initializer test run — protocol and instruction gaps
**Status:** BRIEFED
**Date:** 2026-03-07

---

## Agreed Change

A controlled test run of the Initializer using a seed-file project (BrightLaunch, a promotional agency) surfaced gaps in both the Initializer protocol and three general instructions. The human and Owner have reviewed and aligned on the following changes. The Curator's job is to draft proposals for each, in the order listed below.

This brief covers two work streams. Propose them in sequence — complete the Initializer stream first, then the general instructions stream. Each stream requires a Curator → Owner proposal before implementation.

---

## Work Stream 1: Initializer Protocol

**What is changing:** Five additions and modifications to `$A_SOCIETY_INITIALIZER_ROLE`.

### 1a. Add `agent-docs-guide.md` to Phase 3 required outputs

**Problem:** The Initializer reads `$INSTRUCTION_AGENT_DOCS_GUIDE` as part of its context loading (step 2), but Phase 3 does not list `agent-docs-guide.md` as a required output. The Initializer correctly created one for BrightLaunch — the file was populated, project-specific, and valuable for the Curator. The protocol has an omission, not the Initializer.

**Change:** Add `agent-docs-guide.md` to the Phase 3 output list, positioned after `agents.md` (it documents all files created in Phase 3 and should be written once they exist).

### 1b. Add `project-information/log.md` to Phase 3 required outputs

**Problem:** The project log is the rolling current-state anchor that every Owner reads to orient themselves at the start of a session. Without it, the first Owner session begins without any record of what the Initializer produced, what was confirmed, or what comes next.

**Change:** Add `project-information/log.md` to the Phase 3 output list. The Initializer should populate it from `$INSTRUCTION_LOG`. At initialization, the log's current state is "Initialized," recent focus is the initialization run, and next priorities are the first actions the Owner should take (e.g., assign an Owner agent to begin the first work session). The Initializer should also register `$INSTRUCTION_LOG` in `a-society/index.md` if it is not already referenced by the Initializer's context loading.

### 1c. Instantiate improvement report templates at init time

**Problem:** The current protocol registers improvement report template variables (`$[PROJECT]_IMPROVEMENT_TEMPLATE_*`) in the index pointing to files that do not yet exist. This creates broken references. Agents resolving these variables find nothing.

**Change:** Update Phase 3 to direct the Initializer to create `improvement/reports/main.md` and the four template files (`template-lightweight.md`, `template-findings.md`, `template-synthesis.md`, `template-backlog.md`) from `$GENERAL_IMPROVEMENT_TEMPLATE_*`. The Curator of the target project can refine them when the first improvement cycle runs. Files should exist with real content at init time, not be registered as future placeholders.

### 1d. Add user onboarding message to Phase 5

**Problem:** After initialization completes, the human is left with a populated `a-docs/` and no clear guidance on what to do next. The framework assumes the human knows what an Owner agent is and how to invoke one. Many users will not.

**Change:** Add a step to Phase 5: after stating "Initialization complete," provide the human with a brief onboarding message that explains what they now have, what the first recommended action is, and the exact prompt they can use to invoke the Owner agent. Example message structure:

> "Your project's agent documentation is live. To get started, begin a new session with your AI assistant and use this prompt:
> 'You are an Owner agent for [project name]. Read [path to agents.md].'
> The Owner agent will orient itself and help you decide what to work on first."

The Curator should draft this message as a reusable template embedded in the Initializer protocol, not as free-form ad-hoc output.

### 1e. Change signal report from mandatory write to informed consent

**Problem:** Phase 5 currently writes the signal report to `a-society/onboarding_signal/` as a mandatory step with no user input. Users who do not understand what the signal report is, or who prefer not to share it, have no choice.

**Change:** Update Phase 5 to add a consent step before writing the signal report. The Initializer should:
1. Briefly explain what the signal report is and how it is used (A-Society framework improvement)
2. Ask the user for permission before writing it
3. If permission is granted, write the report as currently specified
4. If permission is denied, acknowledge and close without writing — note in the completion statement that the signal report was not produced

The report remains valuable and should be encouraged, but the user must opt in.

---

## Work Stream 2: General Instruction Gaps

**What is changing:** Three targeted additions to existing general instructions.

### 2a. Concurrent naming — `$INSTRUCTION_COMMUNICATION_CONVERSATION`

**Problem:** The conversation instruction defines live artifact naming as `[sender-role]-to-[receiver-role].md`, which assumes one active unit of work per handoff type. Projects that run multiple simultaneous engagements, sprints, or clients need a unit-of-work identifier in the filename — otherwise live artifacts are overwritten constantly. BrightLaunch's Initializer had to derive this independently.

**Change:** Add a note (short paragraph or sidebar) to the conversation instruction addressing the concurrent case. When multiple units of work run simultaneously, live artifacts must carry a unit identifier in the filename. Recommend the convention `[unit-slug]-[sender]-to-[receiver].md` and note when this pattern is required (two or more concurrent units) vs. optional (single unit at a time). This note should generalize — software (sprints), agencies (clients), editorial (assignments) all encounter this.

### 2b. Owner-as-practitioner — `$GENERAL_OWNER_ROLE`

**Problem:** The Owner role template assumes the Owner is a dedicated governance role. In small teams, the Owner is often also a primary practitioner — in BrightLaunch's case, the Account Manager who also does client strategy. The hard rules become especially important in this combination because the pressure to skip governance steps (approvals, reviews) comes from inside the same role, not from outside it.

**Change:** Add a short note to `$GENERAL_OWNER_ROLE` acknowledging the Owner-as-practitioner pattern. The note should state: this combination is valid and common in small teams; when it occurs, the hard rules in the role document are the primary safeguard against practitioner pressure overriding governance responsibilities. Do not restructure the template — add a note in the appropriate section (likely the Character or Hard Rules section).

### 2c. Part-time and phase-scoped roles — `$INSTRUCTION_ROLES`

**Problem:** The roles instruction does not address part-time or phase-scoped roles — roles that are only active during specific phases of a workflow. BrightLaunch's Analyst is part-time and only activates after Launch. Without guidance, role documents for these contributors lack activation and closure conditions, and agents acting in these roles may not know when their role begins or ends.

**Change:** Add a note to `$INSTRUCTION_ROLES` on part-time and phase-scoped roles. When a role is only active during specific phases: the role document must state the activation condition (what event or handoff triggers this role) and the closure condition (what marks this role's work as done for this unit) explicitly in the Primary Focus section. This prevents agents from acting outside their phase scope and makes the role's lifecycle visible to any agent reading the a-docs.

---

## Scope

**In scope:** The eight changes described above across the two work streams. Each requires a draft proposal and Owner review before implementation.

**Out of scope:** The graph-based workflow model extension (logged separately in `$A_SOCIETY_TODO_GRAPH_WORKFLOW`). The concurrent naming change (2a) is a symptom fix; the underlying model extension is deferred. Do not conflate them.

---

## Likely Targets

| Change | Target |
|---|---|
| 1a — agent-docs-guide.md in Phase 3 | `$A_SOCIETY_INITIALIZER_ROLE` |
| 1b — project-log in Phase 3 | `$A_SOCIETY_INITIALIZER_ROLE` |
| 1c — improvement templates at init | `$A_SOCIETY_INITIALIZER_ROLE` |
| 1d — user onboarding message | `$A_SOCIETY_INITIALIZER_ROLE` |
| 1e — signal report consent | `$A_SOCIETY_INITIALIZER_ROLE` |
| 2a — concurrent naming | `$INSTRUCTION_COMMUNICATION_CONVERSATION` |
| 2b — Owner-as-practitioner | `$GENERAL_OWNER_ROLE` |
| 2c — Phase-scoped roles | `$INSTRUCTION_ROLES` |

---

## Open Questions for the Curator

1. For 1b (project log): Verify that `$INSTRUCTION_LOG` is accessible to the Initializer via `a-society/index.md`. If it is not currently registered in the public index, the Curator must add it before the Initializer can reference it.

2. For 1d (onboarding message): The message must work for any project type and any project name. Draft it as a reusable template with placeholders. Verify the template is general enough to not assume technical literacy from the human.

3. For 2a (concurrent naming): The generalizability test applies — confirm the note works equally for a software project (sprints), a writing project (assignments), and a research project (studies) before drafting. Do not write it only for the agency use case.

---

## Curator Confirmation Required

Before beginning Phase 2, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Initializer test run — protocol and instruction gaps."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
