# How to Create an agents.md

## What Is agents.md?

`agents.md` is the minimal orientation entry point for every agent working on a project. It is the first file any agent reads. Its scope is narrow by design: it contains only what every agent needs regardless of role, session type, or workflow phase.

The runtime handles role assignment, required-reading injection, and context loading. `agents.md` is not the mechanism for those — it is the document that answers the questions no role file or injected context can answer first.

---

## What Every agents.md Must Contain

### 1. Project description (mandatory)

One paragraph: what is this project? What does it produce? Who does it serve? Close with a pointer to the full vision document if one exists.

### 2. Authority and conflict resolution (mandatory)

When two documents give conflicting guidance, which takes precedence? State the precedence order explicitly. The standard hierarchy is: project vision → project structure → role document → agents.md. End with: "if the conflict cannot be resolved using these sources, stop and ask the human."

### 3. Project-wide invariants (mandatory)

Rules that apply across all roles and all sessions. These are non-negotiable constraints no role document can override. Keep this list short — three to seven rules. If it grows longer, some invariants belong in role documents or the vision.

---

## What Does NOT Belong in agents.md

- **Roles and role files** — the runtime assigns roles; agents already know their role when the session starts
- **Required readings** — the runtime injects these per role; agents.md does not list or point to them
- **File path index explanation** — the runtime resolves index references; agents.md does not explain the `$VAR` convention
- **Phase-specific instructions** — those belong in the workflow or phase documents that create the moment
- **Role-specific content** — anything only some agents need does not belong in the document all agents read
- **Anything that changes frequently** — agents.md should be stable; if a section needs frequent updating, it belongs elsewhere

If agents.md grows long, it has drifted. Extract sections into their correct home.

---

## How to Write One

**Step 1 — Write the project description.**
One paragraph. What is this project? Close with a pointer to the full vision document.

**Step 2 — Write authority and conflict resolution.**
List documents in precedence order. The standard hierarchy: project vision → project structure → role document → agents.md. End with escalation to human when no source resolves the conflict.

**Step 3 — Write the invariants.**
Three to seven short rules. Non-negotiable constraints that apply to every agent, every session. If a rule only applies to one role or one phase, it does not belong here.

---

## Maintenance Rules

Copy these rules into the project's agents.md at initialization. They govern how it is updated over its lifetime.

- **Update only when the project description changes or invariants genuinely change.** agents.md should be stable across sessions. Frequent edits are a signal that content has drifted into here from its correct home.
- **Never add role-specific content.** If a rule applies only to one role, it belongs in that role's document.
- **Never add phase-specific instructions.** Those belong in workflow or phase documents.
- **If invariants exceed seven, trim.** Anything beyond a short list either belongs in role documents or is a project-wide rule that should live in the vision or principles document.
- **If a section is growing, extract it.** Length in agents.md is always a symptom of content that belongs elsewhere.
