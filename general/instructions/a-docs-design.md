# How to Create an a-docs Design Principles File

## What It Is

An a-docs design-principles file is a standing document that governs how the project's agent-documentation is written, structured, and maintained. It captures the structural rules behind the documentation layer itself: when to point instead of inline, when to split node guidance into separate files, how the workflow delivers node-specific support docs, and how small `agents.md` and role files should remain.

It is not a folder structure document. It does not say where content belongs in the repository overall. It says how `a-docs/` artifacts should be authored so agents receive the right context at the right moment.

---

## Why Projects Need It

Without a written a-docs design model, the documentation layer tends to degrade in predictable ways:

- Entry documents accumulate explanation of runtime mechanisms and indexes that agents already receive elsewhere
- Role documents collect node-specific instructions inline because there is no explicit rule telling authors to move them out
- Role documents become pointer dumps of "before X, read Y" cues, but the active workflow never surfaces those documents at node entry
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
4. Add it to the required readings of roles that own or maintain a-docs surfaces.

The general template should usually be adopted with minimal modification. Only project-specific wording that truly needs instantiation should change.

---

## How It Relates to Other a-docs Artifacts

- `agents.md` remains the orientation entry point
- role documents remain role-specific routing guides
- workflow and node documents hold workflow-conditional instructions and are the delivery surface for node-linked support docs
- the improvement protocol uses this document as a standard when backward-pass findings evaluate documentation structure

Role documents may note that support docs exist for certain recurring moments, but they should not enumerate the node-triggered read cues themselves. The active workflow is the place that says "read this now."

This file governs the authoring model of the a-docs layer. It does not replace the purpose of any of the artifacts above.

---

## Maintenance Rules

Copy these rules into the project's `a-docs-design.md` at initialization. They govern how the file is updated over its lifetime.

- **Update when the authoring model changes materially** — not for one-off edits. Triggers: restructuring role files around workflow-linked support docs, changing how workflows surface node-linked support docs, changing the scope of `agents.md`, adding or retiring a standing anti-pattern check in meta-analysis.
- **Do not update to reflect individual backward-pass findings.** If meta-analysis surfaces a specific violation, fix the violated document. Only update `a-docs-design.md` when the underlying design rule itself needs to change.
- **Keep principles ahead of the current state.** This file governs how `a-docs/` should be authored. It should describe the intended model, not document what currently exists.
- **During meta-analysis, treat this file as the evaluation standard.** Frame findings about redundant context in `agents.md`, workflow-conditional instructions in role files, pointer-only JIT, or vestigial content against the principles here — not as isolated stylistic observations.
- **When a new recurring anti-pattern check is added to meta-analysis, update this file.** The design rule and the backward-pass check must stay aligned.
