# Curator → Owner: Proposal

**Subject:** Handoff protocol — workflow as default and session routing for all roles
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-08

---

## Trigger

Owner briefing (`01-owner-to-curator-brief.md`, 2026-03-08): two linked gaps were identified in the framework. First, the Owner Post-Confirmation Protocol currently frames workflow routing as one menu option among several co-equal paths. Second, workflow-participating roles tell the human which role acts next, but they do not explicitly say whether the human should resume an existing session or start a new one. The briefing explicitly grants approval for the scoped `general/` changes; this proposal records the implementation decisions and draft content for the flow record.

---

## What and Why

This change makes workflow routing the default behavior of the Owner role and makes outgoing handoff guidance an explicit requirement of workflow-participating roles.

Why it matters:
- The workflow exists to preserve role separation and perspective checks. If the Owner presents freeform as a co-equal default path, the framework quietly permits bypassing the very structure it is supposed to enforce.
- At pause points, the human should not have to infer session mechanics. The active role should say whether to resume an existing session or start a new one, which session to switch to, and what the receiving role needs to read.
- The load-bearing change belongs in `$INSTRUCTION_ROLES`, because this is a framework rule for future role creation, not just a patch to the current Owner and Curator roles.

The chosen design is:
1. Add a new mandatory `Handoff Output` section to `$INSTRUCTION_ROLES`, immediately after `Input Validation`.
2. Keep `Handoff Output` separate from `Input Validation`.
   Rationale: the two sections govern opposite directions of the same boundary. A role may need one without the other. The Owner, for example, usually needs outgoing handoff guidance but not incoming handoff validation.
3. Treat freeform discussion as a human-invoked override, not a co-equal default entry path.
4. Encode the default routing rule as: resume the existing session unless the project's workflow says to start a new one.

---

## Open Question Resolutions

### OQ1 — Name and placement

Use `Handoff Output` as a new section 7 in `$INSTRUCTION_ROLES`, immediately after `Input Validation`.

Rationale: it is short, directional, and parallel to `Input Validation` without collapsing incoming and outgoing rules into one overloaded section.

### OQ2 — Which archetypes get the new section

Add `Handoff Output` guidance to these archetypes in `$INSTRUCTION_ROLES`:
- Owner
- Analyst
- Implementer
- Reviewer
- Coordinator
- Curator

Rationale: each archetype commonly owns a pause point in a workflow graph. A specific project may instantiate one of them as a terminal node and omit the section there, but the archetype itself should model the complete pattern.

### OQ3 — "Menu is always available, never blocking"

Remove the menu framing entirely. Replace it with language that says:
- the Owner asks what the human wants to work on
- the Owner routes that need into the appropriate workflow by default
- freeform remains available only when the human explicitly asks for it

This preserves human override without making bypass the default.

### OQ4 — Uncustomized placeholder in `$GENERAL_OWNER_ROLE`

Keep the `[CUSTOMIZE]` workflow list, but redefine its purpose: it is the routing map the Owner uses after the human states a need. Add explicit language that if the list has not yet been customized, the Owner still identifies the governing workflow first rather than defaulting to freeform.

### OQ5 — Where Curator routing guidance lives

Add a dedicated `Handoff Output` section to both `$GENERAL_CURATOR_ROLE` and `$A_SOCIETY_CURATOR_ROLE`.

Rationale: the behavior is structural, not stylistic. It should be easy to find at first read and should not be buried inside Working Style.

### OQ6 — Inline vs. summary in `$A_SOCIETY_WORKFLOW`

Use both:
- a short default-routing note at the top of the Session Model section
- concise inline start/resume guidance in steps 1-6

This keeps the rule centralized while still removing ambiguity at each pause point.

### OQ7 — Specificity in general templates

Keep all new text in `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` at the principle level. Do not mention A-Society record folders, briefing filenames, or project-specific artifact names.

---

## Where Observed

A-Society — internal. The gap is in the framework's own role and workflow documents, and the fix belongs in the general role-creation instruction because the problem is structural across adopting projects.

---

## Target Location

1. `$INSTRUCTION_ROLES` — add mandatory `Handoff Output` section and update archetype templates
2. `$GENERAL_OWNER_ROLE` — reframe Post-Confirmation Protocol and add session-routing guidance
3. `$GENERAL_CURATOR_ROLE` — add session-routing guidance
4. `$A_SOCIETY_OWNER_ROLE` — reframe Post-Confirmation Protocol and add session-routing guidance
5. `$A_SOCIETY_CURATOR_ROLE` — add session-routing guidance
6. `$A_SOCIETY_WORKFLOW` — add explicit resume-vs-new-session guidance to the Session Model

---

## Draft Content

### Item 1 — `$INSTRUCTION_ROLES`

Add a new section 7, `Handoff Output`, immediately after `Input Validation`.

Core rule:
- At each pause point, a workflow-participating role that hands work to another role must state whether the human should resume an existing session or start a new one, which session to switch to, and what the receiving role needs to read.
- Default: resume the existing session.
- Start a new session only when the project's workflow says to.

Template updates:
- Owner: Post-Confirmation Protocol now routes into workflow by default; add `Handoff Output`.
- Analyst, Implementer, Reviewer, Coordinator, Curator: add concise `Handoff Output` sections describing the required outgoing handoff message.

### Item 2 — `$GENERAL_OWNER_ROLE`

Rewrite `Post-Confirmation Protocol` so the Owner:
1. confirms context
2. asks what the user wants to work on
3. routes that need into the appropriate workflow by default
4. uses freeform only when the user explicitly asks for it

Add `Handoff Output` stating:
- default is to resume the existing session
- the Owner must name the receiving session
- the Owner must name the artifact or context the next role needs
- terminal decisions should be stated explicitly so the human does not keep routing a closed item

### Item 3 — `$GENERAL_CURATOR_ROLE`

Add `Handoff Output` stating that after proposals, update-report submissions, implementation/registration pauses, and findings/synthesis pauses, the Curator must tell the human:
- resume or start
- which session to switch to
- what artifact or changed files the receiving role must read

### Item 4 — `$A_SOCIETY_OWNER_ROLE`

Rewrite `Post-Confirmation Protocol` so the default path is into `A-Society Framework Development`. Freeform remains available only when the human explicitly asks for it.

Add `Handoff Output` covering:
- after `01-owner-to-curator-brief.md`
- after review decisions
- after Owner findings when Curator synthesis still follows

### Item 5 — `$A_SOCIETY_CURATOR_ROLE`

Add `Handoff Output` covering:
- after proposal submission
- after implementation and registration, including any update-report draft awaiting Owner review
- after Curator findings or synthesis

### Item 6 — `$A_SOCIETY_WORKFLOW`

In `Session Model`:
- add a top-level default-routing note: resume existing session unless the "When to start a new session" criteria apply
- make each numbered step explicitly say whether the next action is start or resume
- update "The human's role at each transition" so the active role names start-vs-resume, target session, and required reading

---

## Owner Confirmation Required

The briefing explicitly states that Owner approval for the scoped `general/` changes is granted in `01-owner-to-curator-brief.md`. No separate approval loop is required before implementation. Any refinements can be captured in review of the update-report draft or in backward-pass findings.
