
# A-Society: Agent Orientation

This file is the entry point for any agent working on the A-Society project. Read it first. Read it fully. Do not begin work until context is confirmed.

---

## What Is This Project?

A-Society is a reusable, portable framework for making any project agentic-friendly — before agents are deployed. It is a library of patterns, instructions, and role templates that any project owner can apply to structure their project so agents can operate confidently from the first session.

Full vision: [`$A_SOCIETY_VISION`] — resolve via `$A_SOCIETY_INDEX`.

---

## File Path Index

Key file locations are registered in [`a-society/indexes/main.md`](/a-society/a-docs/indexes/main.md). When you see `$VARIABLE_NAME` in any doc, look up its current path in the index before following it. To relocate a file: update the one row in the index table, then grep for the variable name to confirm no stale paths remain.

---

## Roles

| Role | File | Primary Focus |
|---|---|---|
| **Owner** | [`roles/owner.md`](/a-society/a-docs/roles/owner.md) | Vision keeper, quality gatekeeper, structure guardian for the A-Society framework |
| **Curator** | [`roles/curator.md`](/a-society/a-docs/roles/curator.md) | Agent-docs steward — maintenance, migration, and pattern distillation into `general/` |
| **Technical Architect** | [`roles/technical-architect.md`](/a-society/a-docs/roles/technical-architect.md) | Scoping and planning the programmatic tooling layer — automation boundaries, component design, open questions |
| **Tooling Developer** | [`roles/tooling-developer.md`](/a-society/a-docs/roles/tooling-developer.md) | Implementing approved tooling components in TypeScript — spec-faithful execution within `tooling/` |
| **Runtime Developer** | [`roles/runtime-developer.md`](/a-society/a-docs/roles/runtime-developer.md) | Implementing the framework's runtime orchestration layer in TypeScript — spec-faithful execution |

Additional roles will be added here as the project grows. Do not assume a role exists unless it appears in this table.

**Role assignment:** Roles are assigned by the human. Do not assume a role or shift to a different role mid-session without explicit instruction.

---

## Required Readings Authority

All universal and role-specific required readings for this project are maintained in the single machine-readable authority file: [`a-society/a-docs/roles/required-readings.yaml`](/a-society/a-docs/roles/required-readings.yaml).

The runtime uses this file to programmatically inject the correct context for every session.

---

## Authority & Conflict Resolution

When two sources give conflicting guidance, resolve in this order:

1. The project vision (`$A_SOCIETY_VISION`) — direction and scope
2. The structure document (`$A_SOCIETY_STRUCTURE`) — placement and organization
3. The role document — behavioral authority within a session
4. This file — orientation and role assignment

If the conflict cannot be resolved using these sources: stop and ask the human.

---

## Invariants

- **Do not invent rules.** If a rule is not written in `a-society/`, assume it does not exist. Ask rather than invent.
- **Do not drift scope.** The framework covers all projects. A proposed addition that only applies to one type of project (e.g., only software, only technical teams) does not belong in `general/`.
- **Do not modify project-specific content.** Files under `llm-journey/` or any other project folder are not within the scope of an A-Society agent session.
- **Historical artifacts are immutable.** Once an artifact is superseded and archived, do not rewrite it to match newer conventions.
