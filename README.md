# A-Society

A portable framework for making any project agentic-friendly — before agents are deployed.

---

## The Problem

Agents are capable. The bottleneck is not capability — it is context.

Most projects are not set up in a way that agents can navigate confidently. There is no declared canonical tool, no structured role boundary, no single source of truth for key decisions. Agents that land in these projects must guess, infer from scattered clues, or ask repeated clarifying questions. The result is inconsistency, rework, and friction — not because the agent failed, but because the project was never made ready for one.

This is a solvable problem. And it is solved before the agent ever arrives.

---

## The Core Bet

> The quality of agent output is determined more by the quality of the project's structure than by the capability of the agent.

A well-structured project makes a good agent great. A poorly structured project makes a great agent mediocre.

---

## What A-Society Is

A-Society is a library of patterns, instructions, and role templates that any project owner can apply to structure their project so agents can operate within it confidently, from day one.

It is:
- **Project-agnostic** — applies to software, writing, legal, research, and any other domain
- **Domain-agnostic** — does not assume technical literacy
- **Agent-agnostic** — does not depend on a specific AI model or platform

---

## How It Works

A-Society is a standalone repository that sits alongside your project. You initialize an `a-docs/` folder inside your project using the framework's instructions — giving agents the structure they need to operate confidently.

```
a-society/          ← this repo (the framework)
  general/          ← reusable instructions, templates, role archetypes
  a-docs/           ← a-society's own agent documentation

my-project/         ← your project
  [project files]
  a-docs/           ← your project's agent documentation (initialized from a-society)
```

---

## What's Inside

| Folder | Contents |
|---|---|
| `general/instructions/` | How to create each agent-doc artifact for any project |
| `general/roles/` | Ready-made role templates (Owner, Curator) |
| `general/thinking/` | Reasoning frameworks and operational principles for agents |
| `general/improvement/` | Protocols and templates for iterative doc improvement |
| `a-docs/` | A-Society's own agent documentation — a live example of the framework applied |

---

## Getting Started

Clone this repo alongside your project. Point the A-Society **Initializer** agent at your project — it reads what exists, asks only what it cannot infer, and builds your `a-docs/` for you. You review and approve.

The Initializer role file is at [`a-docs/roles/initializer.md`](a-docs/roles/initializer.md).

If you prefer to build `a-docs/` manually, the instruction library is in [`general/instructions/`](general/instructions/).
