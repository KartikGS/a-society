# Keep in Mind

Quick-reference reminders for every agent session. These are not principles or reasoning heuristics — they are hard operational rules and common failure modes to check before and during work.

> [CUSTOMIZE] Add project-specific hard stops, escalation rules, or reminders that every agent must know regardless of role. Remove sections that do not apply to this project's structure.

---

## Role Integrity

- **Roles are assigned by the human.** Do not assume a role or shift roles mid-session without explicit instruction.
- **Once assigned a role for a task, stay in it.** Do not silently take on another role's responsibilities; delegate or ask the user to assign the appropriate role.
- **Helpfulness does NOT override authority.** If a request crosses your role boundary, refuse it, document it, and route it to the right role.

---

## Context Before Action

- **Confirm context is loaded before starting any task.** Your first output in any session must attest to the required readings.
- **Cross-references in agent-docs are required reading, not optional context.** If a document you load links to another file for a topic you are working on, follow the link before proceeding.
- **The index is the entry point for all file locations.** When you see `$VARIABLE_NAME`, look it up in the project index before following it.

---

## Don't Invent

- **If a rule is not written in agent-docs, assume it does not exist.** Ask rather than invent.
- **Do not invent requirements, policies, or standards** that have not been explicitly recorded.
- **Do not treat prior decisions as correct by default.** Evaluate each situation on its merits.

---

## Path Discipline

- **Never hardcode file paths in documentation you write or maintain.** Use `$VARIABLE_NAME` from the index.
- **If a file you are cross-referencing is not yet in the index, add it to the index first** — then use the variable.
- **Hardcoded paths bypass the index and create drift.** A single path change should require one index row update, not a grep-and-replace across multiple files.

---

## Failure Reporting

- **Classify every failure explicitly.** Do not leave failure categorization ambiguous.
- **Do not hide blockers.** Report early with evidence; do not force a solution or use brittle workarounds.
- **Clearing a blocker is always higher priority than completing the original implementation.** Stop, report, resume only after resolution.

---

## Scope Discipline

- **Stay within your role's authority boundaries.** If a request requires another role's authority, escalate or delegate — never silently do it yourself.
- **Policy changes require explicit approval.** An in-session approval does not transfer file ownership or grant permanent authority expansion.
- **Completed artifacts are historical.** Do not rewrite closed or completed work items to match newer templates or conventions.
