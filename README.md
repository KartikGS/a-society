<p align="center">
  <img src="assets/brand/a-society-mark.svg" alt="A-Society logo" width="112">
</p>

<h1 align="center">A-Society</h1>

<p align="center">
  <strong>An agentic harness for any project.</strong>
</p>

<p align="center">
  Structured memory, role-based workflows, runtime orchestration, verification, and self-improvement.
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-5EEAD4?style=flat-square">
  <img alt="Node v18+" src="https://img.shields.io/badge/node-v18%2B-F59E0B?style=flat-square">
  <img alt="Browser runtime" src="https://img.shields.io/badge/runtime-browser%20UI-FB7185?style=flat-square">
  <img alt="Status: early and experimental" src="https://img.shields.io/badge/status-early%20%26%20experimental-CBD5E1?style=flat-square">
</p>

<p align="center">
  <a href="#getting-started">Getting Started</a> |
  <a href="runtime/INVOCATION.md">Runtime Guide</a>
</p>

<p align="center">
  <img src="assets/brand/a-society-banner.svg" alt="A-Society workflow banner">
</p>

---

> **Status: early & experimental.** A-Society is a working idea, not a finished product. The runtime runs and you can try it today — but it is rough, lightly proven, and still being built in the open. It has one real proving ground so far (the project it is being developed alongside), so treat the cross-project claims below as design intent, not a track record. If that sounds interesting, clone it, play with it, and tell us what breaks — early feedback is exactly what it needs right now.

---

## What the Harness Is Designed to Give a Project

| Structured memory | Workflow execution | Cross-project learning |
|---|---|---|
| `a-docs/` is designed to preserve roles, rules, indexes, and standing project truth across sessions. | The runtime aims to route work through explicit roles, handoffs, records, and closure checks. | Feedback and backward-pass findings are intended to improve universal templates and project-type standards over time. |

---

## Why It Exists

Agents are capable. The bottleneck is not capability — it is the operating environment around the agent.

Most projects are not set up in a way that agents can navigate confidently, act through a designed process, retain useful memory between sessions, or improve the project from the work they just performed. There is no declared canonical tool, no structured role boundary, no workflow authority, no durable record of decisions, and no feedback loop that turns recurring friction into better defaults. The result is inconsistency, rework, and friction — not because the agent failed, but because the project has no harness for agentic work.

This is a solvable problem. It is solved by giving the project a standing agentic harness: structured memory, role boundaries, workflow execution, verification, and self-improvement.

---

## The Core Bet

> The quality of agent output is determined more by the quality of the project's harness — its structure, workflow, memory, verification, and feedback loops — than by the capability of the agent alone.

A well-harnessed project makes a good agent reliable. A poorly harnessed project makes a great agent guess.

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

A-Society is both a reusable library of project standards and an executable runtime for agentic work. It is built to initialize projects, orchestrate role-based sessions, preserve handoff records, verify closure, and turn feedback from real flows into better future defaults.

It is:
- **Project-portable** — sits beside many kinds of projects without being embedded inside them
- **Domain-flexible after setup** — can support software, writing, legal, research, design, and other project work once initialized
- **Technically honest** — setup and operation currently require a technical operator or technical environment
- **Agent-adaptable** — is not conceptually bound to one model or agent platform
- **Designed to learn across projects** — intended to use feedback to improve universal templates, project-type standards, runtime behavior, and initialization defaults as more projects adopt it

---

## How It Works

A-Society is a standalone repository that sits alongside your project. You initialize an `a-docs/` folder inside your project through the runtime UI, which scaffolds the compulsory surfaces and then runs an Owner-led initialization flow that fills them with project truth. After initialization, the runtime supports ongoing flows with role context, workflow routing, records, handoffs, closure checks, and improvement feedback.

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
| `runtime/` | The executable layer — browser runtime, orchestration, context loading, records, handoffs, initialization, and improvement support |
| `general/instructions/` | How to create each agent-doc artifact for any project |
| `general/project-types/` | Reusable standards for approved project categories |
| `general/roles/` | Ready-made universal role templates and support docs, currently centered on Owner |
| `general/improvement/` | Protocols and templates for iterative doc improvement |
| `a-docs/` | A-Society's own agent documentation — the framework dogfooded on itself |

---

## Getting Started

**1. Set up your workspace**

Clone A-Society into a workspace directory. Any projects you want to use with it live alongside it in the same parent folder:

```
your-workspace/
├── a-society/        ← this repo
└── my-project/       ← your project (or create one from the UI in step 4)
```

```bash
git clone https://github.com/KartikGS/a-society.git
```

**2. Install and start the runtime**

From the workspace root:

```bash
npm --prefix ./a-society/runtime install
npm --prefix ./a-society/runtime start
```

The runtime opens at `http://localhost:3000`.

**3. Configure a model**

The Settings panel opens automatically and stays open until you activate a model. The runtime cannot start project work without one.

Fill in:
- **Provider** — Anthropic, OpenAI, or a compatible base URL
- **API key** — from your provider's account dashboard ([Anthropic Console](https://console.anthropic.com) · [OpenAI Platform](https://platform.openai.com/api-keys))
- **Model ID** — from your provider's model catalog ([Anthropic model cards](https://docs.anthropic.com/en/docs/about-claude/models/overview) · [OpenAI models](https://platform.openai.com/docs/models))
- **Context window** — the model's token context limit; used to calculate when to compact session history

Save and set the model as active. The project selector appears once a model is active.

**4. Select or create a project**

*New project:* Click **Create New Project**, enter a name, and the runtime creates the project folder and scaffolds the compulsory `a-docs/`. An Owner-led initialization flow starts immediately and fills the scaffolded files through a short Q&A.

*Existing project:* Place your project folder in the workspace alongside `a-society/`. It will appear in the selector as uninitialized. Click it to run the same scaffold and initialization flow.

Approve the result and your project has a structured agent harness.

**5. Start your first flow**

Click **New Record**. The runtime opens a draft flow and routes it to the Owner node. You're in.

