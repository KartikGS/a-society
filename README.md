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
  agents/           ← a-society's active agents (e.g., the Initializer)
  a-docs/           ← a-society's own agent documentation

my-project/         ← your project
  [project files]
  a-docs/           ← your project's agent documentation (initialized from a-society)
```

---

## What's Inside

| Folder | Contents |
|---|---|
| `agents/` | A-Society's active agents — start here to initialize your project |
| `general/instructions/` | How to create each agent-doc artifact for any project |
| `general/roles/` | Ready-made role templates (Owner, Curator) |
| `general/thinking/` | Reasoning frameworks and operational principles for agents |
| `general/improvement/` | Protocols and templates for iterative doc improvement |
| `a-docs/` | A-Society's own agent documentation — a live example of the framework applied |

---

## Getting Started

**1. Clone A-Society alongside your project**

Both should live in the same parent directory:

```
your-workspace/
├── your-project/     ← your existing project
└── a-society/        ← this repo
```

**2. Run the Initializer**

Using any agentic tool that can read files (Claude Code, Cursor, Copilot, etc.), run this prompt — replacing `your-project` with your project's folder name:

```
You are an A-Society Initializer Agent.
Read @a-society/agents/initializer.md and initialize a-docs/ for your-project.
```

The Initializer will read your project, ask only what it cannot infer, and build your `a-docs/`. You review and approve.

**3. Done**

Once approved, your project has a structured agent layer. Any agent you assign a role to can load context from `a-docs/` and operate confidently from the first session.

---

*Prefer to build manually? The instruction library is in [`general/instructions/`](general/instructions/).*
