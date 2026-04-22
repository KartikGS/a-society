# A-Society

A portable framework for making any project agentic-friendly — with runtime-guided initialization and role-based ongoing work.

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

## The Standards A-Society Targets

A-Society is designed to help projects achieve three standards:

- **Comprehensive work** — touched standing surfaces are accounted for, not silently left stale
- **Cost optimization** — agents load only the context and verification burden they actually need
- **Low latency** — workflows take the shortest safe path and parallelize independent work

When these standards conflict, A-Society prioritizes them in this order:

`comprehensive work > cost optimization > low latency`

---

## What A-Society Is

A-Society is a library of patterns, instructions, and role templates that any project owner can apply to structure their project so agents can operate within it confidently, from day one.

It is:
- **Project-agnostic** — applies to software, writing, legal, research, and any other domain
- **Domain-agnostic** — does not assume technical literacy
- **Agent-agnostic** — does not depend on a specific AI model or platform

---

## How It Works

A-Society is a standalone repository that sits alongside your project. You initialize an `a-docs/` folder inside your project through the runtime UI, which scaffolds the compulsory surfaces and then runs an Owner-led initialization flow that fills them with project truth.

```
a-society/          ← this repo (the framework)
  general/          ← reusable instructions, templates, role archetypes
  runtime/          ← executable layer, browser UI, and initialization contract
  a-docs/           ← a-society's own agent documentation

my-project/         ← your project
  [project files]
  a-docs/           ← your project's agent documentation (initialized from a-society)
```

---

## What's Inside

| Folder | Contents |
|---|---|
| `runtime/` | The executable layer — browser runtime, orchestration, scaffolding entry path, and initialization contract |
| `general/instructions/` | How to create each agent-doc artifact for any project |
| `general/roles/` | Ready-made role templates (Owner, Curator) |
| `general/thinking/` | Reasoning frameworks and operational principles for agents |
| `general/improvement/` | Protocols and templates for iterative doc improvement |
| `a-docs/` | A-Society's own agent documentation — a live example of the framework applied |

---

## Getting Started

### If you have an existing project

**1. Clone A-Society alongside your project**

Both should live in the same parent directory:

```
your-workspace/
├── your-project/     ← your existing project
└── a-society/        ← this repo
```

**2. Start the runtime**

From the workspace root, run:

```bash
a-society
```

The browser UI lists existing projects with `a-docs/`, existing projects without `a-docs/`, and a create-new-project path.

Choose your existing project. If it does not yet have `a-docs/`, the runtime scaffolds the compulsory files and then starts an Owner initialization flow that reads the project, asks only what it cannot infer, and fills the scaffolded files.

**3. Done**

Once approved, your project has a structured agent layer. Any agent you assign a role to can load context from `a-docs/` and operate confidently from the first session.

---

### If you are starting from scratch

You do not need a finished project to use A-Society. A rough idea is enough to start.

**1. Clone A-Society into your workspace**

```
your-workspace/
└── a-society/        ← this repo
```

**2. Start the runtime**

```bash
a-society
```

**3. Create the project in the UI**

Choose `Create New Project`, enter the project name, and let the runtime create the project folder and scaffold the compulsory `a-docs/`.

The runtime then starts an Owner initialization flow. The Owner asks the startup questions interactively, fills the scaffolded files with real project truth, and leaves you with a usable first-pass `a-docs/`.

**4. Improve as you go**

Your `a-docs/` reflects where your project is today. As your vision sharpens, your `a-docs/` sharpens with it. Periodically run the Curator role to keep agent documentation aligned with how the project has evolved. You do not need a complete project to get value from the framework — every session builds on the last.

---

*Prefer to build manually? The instruction library is in [`general/instructions/`](general/instructions/).*
