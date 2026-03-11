**Subject:** Variable retirement protocol — inverse of Index-Before-Reference
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-11

---

## Trigger

Human identified a structural gap in `$INSTRUCTION_INDEX`. Two flows exposed it with real consequences: the `20260308-records-infrastructure` flow required four variable retirements by judgment alone; the `20260310-retire-todo-folder` flow left a stale prose reference that survived both a section removal and an index-row deletion because no post-removal scan was prescribed. The Owner briefed the agreed change directly (`01-owner-to-curator-brief.md`).

---

## What and Why

The framework already specifies the creation lifecycle rigorously (Index-Before-Reference Invariant; file-move procedure in `$INSTRUCTION_INDEX`). Retirement — removing a variable and all its references — is the inverse operation and requires the same structural discipline. Without a prescribed sequence, Curators retire variables by judgment, leaving stale references in active documents.

Generalizes to any project type: any project using an index will eventually retire content. A writing project retiring an archived style guide, a software project retiring a deprecated tooling standard, a research project retiring a superseded protocol document — all face the same risk of stale references surviving an ad-hoc removal. The five-step sequence applies unchanged across all domains.

Two changes are proposed:

**Part 1 — "Variable Retirement" section added to `$INSTRUCTION_INDEX`**

Placed after "How to Use the Index" and before "Examples Across Project Types", as a parallel lifecycle operation to the existing file-move procedure.

**Part 2 — Invariant 4 updated in `$A_SOCIETY_WORKFLOW`**

An appended sentence names the Variable Retirement protocol as Invariant 4's counterpart, making the retirement requirement discoverable from the invariant without requiring Curators to infer it from the instruction document alone.

---

## Where Observed

A-Society — internal. Both retirement gaps arose during A-Society's own workflow flows (`20260308-records-infrastructure`, `20260310-retire-todo-folder`).

---

## Target Location

- `$INSTRUCTION_INDEX` — new "Variable Retirement" section added
- `$A_SOCIETY_WORKFLOW` — Invariant 4 sentence appended

---

## Draft Content

### Part 1 — New section for `$INSTRUCTION_INDEX`

*Placement: after the "How to Use the Index" section, before "Examples Across Project Types".*

---

**## Variable Retirement**

When a registered variable is removed — because the file it pointed to has been deleted, merged into another document, or is otherwise no longer referenced — retire the variable using this sequence, in order:

**Step 1 — Identify all consumers.**
Grep all active documents for the `$VARIABLE_NAME` before touching anything. This produces the definitive list of references that must be resolved. Do not skip this step on the assumption that you know all the references.

**Step 2 — Update or remove each reference.**
For each consuming document: if the content was relocated rather than removed, replace the variable reference with the new variable name. If the content was removed entirely, remove the reference from the document. Do not leave dangling variable names in active documents.

**Step 3 — Check guide-type documents.**
If the project maintains a document that catalogs the purpose or rationale of its files (e.g., an agent-docs guide), check it for entries that reference the retired content. Remove or update those entries. These documents are not always caught by a variable-name grep because they may describe the file by purpose rather than by variable.

**Step 4 — Remove the variable row from the index.**
Only after all consumer references are resolved. Removing the row before updating consumers leaves documents with unresolvable variable names.

**Step 5 — Post-removal scan.**
Grep all active documents for both the `$VARIABLE` form *and* the prose concept name of the retired content (e.g., if `$TODO_FOLDER` pointed to a to-do folder, also grep for "to-do folder" and "todo folder"). A section removal and an index-row deletion are not a sufficient retirement — stale prose references survive both.

This sequence is the inverse of Index-Before-Reference: where creation requires registration before reference, retirement requires reference cleanup before removal.

---

### Part 2 — Invariant 4 update for `$A_SOCIETY_WORKFLOW`

*Current text:*

> **4. Index-Before-Reference Invariant**
> A file must be registered in the relevant index before any document references it by variable name. Register first, then write the reference.

*Proposed text (sentence appended):*

> **4. Index-Before-Reference Invariant**
> A file must be registered in the relevant index before any document references it by variable name. Register first, then write the reference. The inverse — retiring a variable — requires all consumer references to be resolved before the row is removed from the index; the Variable Retirement protocol in `$INSTRUCTION_INDEX` governs this sequence.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
