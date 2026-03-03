# How to Create an agents.md

## What Is agents.md?

`agents.md` is the primary orientation document for every agent working on a project. It is the first file any agent reads — before role files, before standards, before task specifications. Everything else is reached from here.

It answers four questions an agent has at the start of any session:

1. **What project am I in?** — a brief description and pointer to the vision
2. **What role am I playing?** — the role table, with links to role files
3. **What do I need to read?** — the required reading list, in order
4. **How do I confirm I'm ready?** — the context confirmation statement

An `agents.md` that answers all four questions clearly reduces session startup time to near zero. An agent that has read it is oriented; one that has not is not — regardless of what else they may have loaded.

---

## Why Every Project Needs One

Without `agents.md`, agents either:
- Start from wherever they happen to land — reading files ad-hoc, building partial context, missing critical constraints
- Ask the human "what should I read?" at the start of every session — adding friction that compounds across every role, every session, every collaborator

`agents.md` is the fix. It is a single document that front-loads all orientation. The human writes it once. Every agent reads it every time. The cost is one document; the benefit is every session starting correctly.

**It is also the contract between the human and the agent system.** What `agents.md` declares, agents treat as authoritative. What it does not declare, agents do not invent.

---

## What Every agents.md Must Contain

### 1. Project description (mandatory)
One paragraph: what is this project? Not the vision in full — a one-paragraph summary with a pointer to the full vision document. The agent should be able to read this in ten seconds and know what kind of project they are in.

### 2. File path index reference (mandatory)
State where the project's index lives and explain the `$VARIABLE_NAME` convention. Every agent must know: when they see `$VAR` in a doc, they look up the index. This should appear early — before the required reading list.

### 3. Roles table (mandatory)
A table with three columns: Role name, file path, one-line primary focus. Every role available in this project appears here. Roles not in this table do not exist in this project. Include a note: roles are assigned by the human; do not assume a role or shift roles without explicit instruction.

### 4. Required reading list (mandatory)
An ordered list of documents every agent must read before starting work, regardless of role. Typically: this file → vision → structure → index → role file. The role file is listed last because it may specify additional readings of its own.

### 5. Context confirmation statement (mandatory)
The exact text an agent must output to confirm they have loaded required context. State it verbatim — agents copy it. Include a note that an agent which skips this step has not loaded context, even if they claim otherwise.

### 6. Authority and conflict resolution (mandatory)
When two documents give conflicting guidance, which takes precedence? State the resolution order explicitly. End with: "if the conflict cannot be resolved using these sources, stop and ask the human."

### 7. Project invariants (mandatory)
Rules that apply across all roles and all sessions, regardless of task. These are the non-negotiable constraints of the project that no role document can override. Keep this list short — if it grows long, some invariants belong in role documents or the vision instead.

---

## What Does NOT Belong in agents.md

- **Full role documentation** — that belongs in role files
- **Implementation details or specifications** — those belong in task-specific documents
- **Historical context** — what the project used to do belongs in archived artifacts, not the orientation document
- **Comprehensive process documentation** — that belongs in a workflow document
- **Anything that changes frequently** — agents.md should be stable. If a section needs frequent updating, it belongs in a document linked from agents.md, not in agents.md itself

If `agents.md` grows long, it has drifted. Extract sections into their correct home and replace them with a single link.

---

## How to Write One

**Step 1 — Write the project description.**
One paragraph. What is this project? What does it produce? Who does it serve? Close with a pointer to the full vision document.

**Step 2 — Add the file path index reference.**
State the index location and explain `$VAR` convention in two to three sentences. Agents see this early, before they encounter any `$VAR` references in the required reading list.

**Step 3 — Build the roles table.**
List every role. If only one role exists, the table still has one row. Include: role name, file path, one-line primary focus. Add the role assignment note.

**Step 4 — Write the required reading list.**
Order matters. Start with `agents.md` itself (agents confirm they have read it), then vision, then structure, then index, then role file. If your project has additional universal required readings (e.g., a standards document every agent needs), insert them before the role file.

**Step 5 — Write the context confirmation statement.**
State it exactly as agents should output it. Use a blockquote so it is visually distinct. Include the enforcement note.

**Step 6 — Write authority and conflict resolution.**
List the documents in precedence order. Three to five items is typical. End with the escalation to human.

**Step 7 — Write the invariants.**
Three to seven short rules. These are the project-level constraints that apply to every agent, every session. If you find yourself writing more than seven, some belong in role documents.

---

## Format Rules

- **Short.** An `agents.md` that takes more than five minutes to read is too long. Agents read it at the start of every session. Length is a friction cost paid repeatedly.
- **Stable.** Roles and invariants should change rarely. If `agents.md` changes frequently, something upstream (the vision, the structure) is unstable.
- **No redundancy.** Do not repeat content from role files or the vision in `agents.md`. Pointer to the source; do not copy the content. Duplication creates drift.
- **Imperative tone.** "Read this file first." Not "you may want to read this file first." Agents follow clear instructions.

---

## Examples Across Project Types

### Software project
```
## What Is This Project?
[Product name] is a [type] application that [purpose]. Full vision: $VISION.

## File Path Index
Key file paths are in `indexes/main.md`. Resolve $VAR references there.

## Roles
| Role | File | Focus |
|---|---|---|
| Tech Lead | roles/tech-lead.md | Technical decisions and execution |
| BA | roles/ba.md | Requirements and scope |
| Backend | roles/sub-agents/backend.md | API and data layer |

## Required Reading
1. This file
2. $VISION — project vision
3. $TOOLING_STANDARD — mandatory tools and constraints
4. $WORKFLOW — how work gets done
5. Your role file

## Context Confirmation
> "Context loaded: agents.md, vision, tooling, workflow, [role]. Ready."

## Invariants
- Never use npm or yarn — pnpm only.
- Do not write feature code as Tech Lead.
- All scope changes require human approval.
```

### Editorial / writing project
```
## What Is This Project?
[Publication name] is a [type] publication covering [topic]. Full vision: $VISION.

## File Path Index
Key file paths are in `indexes/main.md`. Resolve $VAR references there.

## Roles
| Role | File | Focus |
|---|---|---|
| Editor | roles/editor.md | Voice, quality, and final approval |
| Writer | roles/writer.md | Drafting within approved briefs |

## Required Reading
1. This file
2. $VISION — what this publication is for
3. $STYLE_GUIDE — voice, tone, citation format
4. Your role file

## Context Confirmation
> "Context loaded: agents.md, vision, style guide, [role]. Ready."

## Invariants
- Never publish without editor approval.
- Citation format: [standard]. No exceptions.
- Drafts live in /drafts/ until approved.
```

---

## What Makes an agents.md Fail

**Too long.** If agents skim it, they miss invariants. Keep it to what every agent truly needs, every session.

**Missing the context confirmation.** Without a confirmation gate, there is no way to know if context was actually loaded. The confirmation is the gate, not a formality.

**Roles not in a table.** A prose description of roles is ambiguous. The table is a declaration: these roles exist, these do not.

**Invariants buried in prose.** If invariants are not visually distinct, agents miss them. They should be a named list, not paragraphs.

**Updated frequently.** A frequently-updated `agents.md` signals that something upstream is unstable. Fix the upstream problem; do not treat `agents.md` as a changelog.
