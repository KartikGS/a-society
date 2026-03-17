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

Additional roles will be added here as the project grows. Do not assume a role exists unless it appears in this table.

**Role assignment:** Roles are assigned by the human. Do not assume a role or shift to a different role mid-session without explicit instruction.

---

## Required Reading

Load context in this order before beginning any session:

1. **This file** — `agents.md` (you are reading it)
2. **Index** — [`a-society/indexes/main.md`](/a-society/a-docs/indexes/main.md) — read this second so all `$VAR` references below can be resolved
3. **Vision** — `$A_SOCIETY_VISION` — what the framework is and where it is going
4. **Structure** — `$A_SOCIETY_STRUCTURE` — why each folder exists and what belongs where
5. **Role file** — your assigned role from the table above (e.g., `$A_SOCIETY_OWNER_ROLE`, `$A_SOCIETY_CURATOR_ROLE`) — your behavioral contract, authority, and any additional required readings

---

## Context Confirmation (Mandatory)

Your first output in any session must confirm that required context has been loaded:

> *"Context loaded: agents.md, index, vision, structure, [role file]. Ready."*

If any required document could not be read, name it explicitly and state why before proceeding. Do not begin work without this confirmation. An agent that skips this step has not loaded context — regardless of what it claims to know.

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
