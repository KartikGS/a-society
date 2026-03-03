# Instruction: How to Create a `thinking/` Folder

This document explains how to create a `thinking/` folder for a project's agent-docs. A thinking folder centralizes the cognitive and operational foundations that every agent in the project must internalize — before starting any work.

---

## What Is a `thinking/` Folder?

A `thinking/` folder contains three documents that answer:
1. **What principles guide this project?** (`main.md`)
2. **How should agents reason through problems?** (`reasoning.md`)
3. **What must agents never forget while working?** (`keep-in-mind.md`)

These documents are universal — read by every agent regardless of role. They are the behavioral foundation layer.

---

## Why a Dedicated Folder?

Without a thinking folder, principles and reasoning guidelines either:
- Live embedded in a large `agents.md`, making them harder to update and harder to target-load
- Get re-stated inconsistently in role files
- Are missing entirely, leading agents to fall back on instinct

A dedicated folder gives these documents one home each. Each file has one purpose. When a principle changes, one file updates.

---

## The Three Files

### `main.md` — General Principles

**What it is:** A concise list of cross-role engineering or operational principles. These are the "always true" rules that apply to every agent, every task.

**What belongs here:**
- Principles that hold regardless of role (BA, Tech Lead, sub-agent)
- Principles that hold regardless of task type (planning, implementation, documentation)
- Principles that are concrete enough to act on (not platitudes)

**What does not belong here:**
- Reasoning heuristics (those go in `reasoning.md`)
- Role-specific rules (those go in the role file)
- Workflow-specific rules (those go in the workflow documents)

**Starting point:** Use `$GENERAL_THINKING` as the template. Customize by adding project-specific principles at the bottom; remove any that do not apply.

---

### `reasoning.md` — Reasoning Framework

**What it is:** A cognitive framework for how agents should think through problems — not what to do, but how to approach analysis and decision-making.

**What belongs here:**
- Anti-patterns in agent reasoning (e.g., treating environmental claims as fact without probing)
- Decision frameworks for common ambiguous situations
- The "talk back" rule and other epistemic stances
- Deviation protocol (how to handle discovered improvements)

**What does not belong here:**
- Workflow steps or phases (those go in the workflow documents)
- Role authority rules (those go in role files)
- Technical standards (those go in tooling or development documents)

**Starting point:** Use `$GENERAL_THINKING_REASONING` as the template. Customize role names (BA, Tech Lead, etc.) and cross-reference variables to match your project's index.

---

### `keep-in-mind.md` — Operational Reminders

**What it is:** A quick-reference checklist of hard operational rules — the things agents most commonly forget or violate under time pressure.

**What belongs here:**
- Hard stops that apply to every agent (role integrity, context confirmation, path discipline)
- Common failure modes with concrete prevention rules
- Rules that need to be visible at the start of every session, not buried in a long document

**What does not belong here:**
- Principles already fully covered in `main.md` (cross-reference; do not duplicate)
- Reasoning heuristics already in `reasoning.md`
- Role-specific hard stops (those go in the role file)

**Starting point:** Use `$GENERAL_THINKING_KEEP_IN_MIND` as the template. Add project-specific hard stops in each section as needed.

---

## Integration with `agents.md`

Once created, the three files must be referenced in the project's `agents.md` as part of the Universal Standards required reading. Example format:

```markdown
### Universal Standards (ALL agents)
- **General Principles:** `$[PROJECT]_THINKING`
- **Reasoning Framework:** `$[PROJECT]_THINKING_REASONING`
- **Keep in Mind:** `$[PROJECT]_THINKING_KEEP_IN_MIND`
```

---

## Integration with the Index

Add all three files to the project's file path index before referencing them anywhere:

| Variable | Path | Description |
|---|---|---|
| `$[PROJECT]_THINKING` | `/[project]/a-docs/thinking/main.md` | General principles — cross-role operational rules |
| `$[PROJECT]_THINKING_REASONING` | `/[project]/a-docs/thinking/reasoning.md` | Reasoning framework — how to think through problems |
| `$[PROJECT]_THINKING_KEEP_IN_MIND` | `/[project]/a-docs/thinking/keep-in-mind.md` | Operational reminders — hard stops and common failure modes |

---

## When to Create This Folder

Create a `thinking/` folder when:
- The project has more than one agent role
- Agents have shown a tendency to repeat the same reasoning errors across sessions
- The project's `agents.md` has grown a long "universal standards" section that deserves dedicated homes

A project with a single agent role and minimal documented process can defer this folder. The need becomes clear when drift starts appearing.
