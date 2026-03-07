# Curator → Owner: Proposal / Submission

**Subject:** Initializer test run — instruction gaps (Work Stream 2: `$INSTRUCTION_COMMUNICATION_CONVERSATION`, `$GENERAL_OWNER_ROLE`, `$INSTRUCTION_ROLES`)
**Status:** REGISTERED
**Type:** Proposal
**Date:** 2026-03-07

---

## Trigger

Human identified three general-instruction/template gaps during the BrightLaunch Initializer test run. Work Stream 1 (`$A_SOCIETY_INITIALIZER_ROLE`) is implemented and registered; this submission is the ordered Work Stream 2 proposal from `$A_SOCIETY_COMM_BRIEF`.

---

## What and Why

This proposal adds three targeted notes to existing `general/` artifacts so common real-world operating patterns are explicitly covered without changing baseline structure.

1. Add a concurrency naming note to `$INSTRUCTION_COMMUNICATION_CONVERSATION` so projects running multiple units simultaneously avoid filename collisions in live conversation artifacts.
2. Add an Owner-as-practitioner note to `$GENERAL_OWNER_ROLE` so small teams know role-combination is valid and governance safeguards remain non-optional.
3. Add a part-time/phase-scoped role note to `$INSTRUCTION_ROLES` so role lifecycle boundaries (activation and closure) are explicit.

Generalizability argument:
- Software projects often run concurrent sprints/initiatives and part-time specialist roles.
- Writing/editorial projects often run concurrent assignments and owners who also produce work.
- Research projects often run concurrent studies/workstreams and phase-bounded analyst/reviewer roles.

All three additions are cross-domain behavior clarifications, not domain-specific process.

---

## Where Observed

Primary observation source: BrightLaunch seed-file initialization run.  
Generalization check: validated against software (sprints), writing (assignments), and research (studies) execution patterns.

---

## Target Location

- `$INSTRUCTION_COMMUNICATION_CONVERSATION`
- `$GENERAL_OWNER_ROLE`
- `$INSTRUCTION_ROLES`

---

## Draft Content

### 1. Add concurrent naming note to `$INSTRUCTION_COMMUNICATION_CONVERSATION`

Insertion point: immediately after the existing three bullet naming conventions in `## Naming Conventions`.

```md
When two or more units of work are active at the same time (for example: concurrent sprints, client engagements, assignments, or studies), include a unit identifier in live artifact filenames to prevent collisions:

- **Concurrent live artifacts:** `[unit-slug]-[sender-role]-to-[receiver-role].md`

Use the base live-artifact naming (`[sender-role]-to-[receiver-role].md`) when only one unit is active at a time. In concurrent mode, unit-prefixed naming is required; in single-unit mode, it is optional.
```

### 2. Add Owner-as-practitioner note to `$GENERAL_OWNER_ROLE`

Insertion point: in `## Working Style`, immediately after `**Opinionated, not rigid.**` paragraph.

```md
**Owner-as-practitioner is valid.** In small teams, the Owner may also be a primary practitioner (for example, strategist, writer, or lead builder). This is common and acceptable. When roles are combined, the governance responsibilities in this role remain non-optional: apply the review tests and escalation triggers exactly as written so delivery pressure does not bypass scope and quality controls.
```

### 3. Add part-time / phase-scoped role note to `$INSTRUCTION_ROLES`

Insertion point: under `### 1. Primary Focus (mandatory)`, immediately after the existing paragraph.

```md
If the role is part-time or active only during specific workflow phases, state both lifecycle boundaries in Primary Focus:
- **Activation condition** — what event, handoff, or phase transition starts this role's authority for a unit of work
- **Closure condition** — what outcome marks this role as done for that unit

Without explicit activation and closure conditions, agents in phase-scoped roles cannot reliably determine when they should act or stand down.
```

No restructuring is proposed; these are additive notes only.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.

---

## Implementation Outcome

Implemented on 2026-03-07 exactly as approved:
- Added concurrent naming guidance in `$INSTRUCTION_COMMUNICATION_CONVERSATION` (`## Naming Conventions`) with required `[unit-slug]-[sender]-to-[receiver].md` pattern for concurrent units.
- Added Owner-as-practitioner guidance in `$GENERAL_OWNER_ROLE` (`## Working Style`) immediately after the `Opinionated, not rigid` paragraph.
- Added part-time/phase-scoped lifecycle guidance in `$INSTRUCTION_ROLES` under `### 1. Primary Focus (mandatory)`, including required activation and closure conditions.
