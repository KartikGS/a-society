# How to Create an a-docs Design Principles File

## What It Is

An a-docs design-principles file is a standing document that governs how the project's agent-documentation is written, structured, and maintained. It captures the structural rules behind the documentation layer itself: when to point instead of inline, when to split phase guidance into separate files, how the workflow delivers phase-specific support docs, and how small `agents.md` and role files should remain.

It is not a folder structure document. It does not say where content belongs in the repository overall. It says how `a-docs/` artifacts should be authored so agents receive the right context at the right moment.

---

## Why Projects Need It

Without a written a-docs design model, the documentation layer tends to degrade in predictable ways:

- Entry documents accumulate explanation of runtime mechanisms and indexes that agents already receive elsewhere
- Role documents collect phase-specific instructions inline because there is no explicit rule telling authors to move them out
- Role documents become pointer dumps of "before X, read Y" cues, but the active workflow never surfaces those documents at phase entry
- New guidance gets added without checking what older guidance it makes redundant

The result is context bloat, duplication, and stale operational detail in the very documents agents read first.

---

## When to Create It

Create this file during project initialization.

Do not wait until the project is "mature." The point of the file is to shape the documentation layer as it is being created, not only after drift has already accumulated.

---

## How to Create It

1. Start from `$GENERAL_ADOCS_DESIGN`.
2. Place the instantiated file at the root of the project's `a-docs/` as `a-docs-design.md`.
3. Register it in the project index as `$[PROJECT]_ADOCS_DESIGN`.
4. Add it to the Owner and Curator starting-context set for the project (required readings or the project's equivalent startup-context mechanism).

The general template should usually be adopted with minimal modification. Only project-specific wording that truly needs instantiation should change.

---

## How It Relates to Other a-docs Artifacts

- `agents.md` remains the orientation entry point
- role documents remain role-specific routing guides
- workflow and phase documents hold workflow-conditional instructions and are the delivery surface for phase-linked support docs
- the improvement protocol uses this document as a standard when backward-pass findings evaluate documentation structure

Role documents may note that support docs exist for certain recurring moments, but they should not enumerate the phase-triggered read cues themselves. The active workflow is the place that says "read this now."

This file governs the authoring model of the a-docs layer. It does not replace the purpose of any of the artifacts above.

---

## Keeping It Current

Update the file when the project's a-docs authoring model changes materially - for example:
- when role files are restructured around workflow-linked support docs
- when the project changes how workflows surface phase-linked support docs
- when `agents.md` scope changes
- when the project adds or retires a standing anti-pattern check in meta-analysis

Do not update it for one-off edits that do not change the documentation model.

---

## Improvement Protocol Interaction

Meta-analysis should treat this document as a standing evaluation standard. When backward-pass findings identify:
- redundant context in `agents.md`
- workflow-conditional instructions embedded in role files
- pointer-only JIT where the workflow does not surface the required support doc at the relevant phase
- additions that left vestigial content behind

the finding should be framed against this document's principles rather than as an isolated stylistic preference.

If the project introduces new recurring a-docs anti-pattern checks in meta-analysis, update this file so the design rule and the backward-pass check remain aligned.
