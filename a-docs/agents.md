
# A-Society: Agent Orientation

This file is the entry point for any agent working on the A-Society project. Read it first. Read it fully. Do not begin work until context is confirmed.

---

## What Is This Project?

A-Society is a reusable, portable framework for making any project agentic-friendly — before agents are deployed. It is a library of patterns, instructions, and role templates that any project owner can apply to structure their project so agents can operate confidently from the first session.

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
- **Do not drift scope.** The framework covers all projects. The universal layer of `general/` accepts only content that applies without modification to every project type. Content that applies across a recognizable category of projects but not universally belongs under `general/project-types/<type>/`, and adding a new project-type category requires explicit Owner approval. Project-specific content belongs in that project's own `a-docs/`.
- **Do not modify project-specific content.** Files under `llm-journey/` or any other project folder are not within the scope of an A-Society agent session.
- **Use standing documents as task authority.** When performing new work, follow the current directions in standing documents, not closed historical records. Standards change over time, and historical records are immutable traceability artifacts. Consult records only for active-flow inputs, historical traceability, or when a record is explicitly designated as the authoritative long-lived reference.
- **Historical artifacts are immutable.** Once an artifact is superseded and archived, do not rewrite it to match newer conventions.
