# A-Society: Project Vision

## The Problem

Agents are capable. The bottleneck is not capability — it is context.

Most projects are not set up in a way that agents can navigate confidently. There is no declared canonical tool, no structured role boundary, no single source of truth for key decisions. Agents that land in these projects must guess, infer from scattered clues, or ask repeated clarifying questions. The result is inconsistency, rework, and friction — not because the agent failed, but because the project was never made ready for one.

This is a solvable problem. And it is solved before the agent ever arrives.

---

## The Vision

**A-Society is a reusable, portable framework for making any project agentic-friendly — before agents are deployed.**

It is a library of patterns and instructions, and a set of active agents that together do the work of making a project ready. A project owner does not manually build the structure — an A-Society agent does it with them, asking only what cannot be inferred, and handing off a verified, agent-ready project.

The framework is:
- **Project-agnostic** — it applies to software, writing, legal, research, design, and any other domain.
- **Domain-agnostic** — it does not assume technical literacy. A writing team and an engineering team both benefit from the same underlying patterns.
- **Agent-agnostic** — it does not depend on a specific AI model or platform. Any agent that can read and follow structured context benefits from it.

---

## The Core Bet

> The quality of agent output is determined more by the quality of the project's structure than by the capability of the agent.

A well-structured project makes a good agent great. A poorly structured project makes a great agent mediocre.

The investment is in the project setup — not in the agent itself.

---

## What "Agentic-Friendly" Means

A project is agentic-friendly when an agent can be given a role and a task, and immediately know:

1. **What tools to use** — no guessing, no asking, no defaulting to familiar choices
2. **What the rules are** — constraints, forbidden alternatives, non-negotiables
3. **Who owns what** — role boundaries are explicit, not implied
4. **Where to find things** — key files are registered in a discoverable index, not scattered
5. **How to verify their work** — compliance can be checked, not just assumed

These conditions are not hard to create. They require deliberate, upfront structure — and that is exactly what this framework provides.

---

## What A-Society Is

A-Society has two layers:

**The library layer** — a collection of general instructions, templates, and role archetypes, each answering the question: "When setting up a new project for agents, how do you create [X]?" Each instruction explains what the artifact is, why it is needed, and how to build it. The library lives under `a-society/general/` and is project-agnostic — applicable to software, writing, legal, research, and any other domain.

**The active layer** — a set of agents that use the library to do the actual work. The primary active agent is the **Initializer**: given a project, it reads what exists, drafts the foundational agent-docs, resolves ambiguity with the human through targeted questions, and produces a complete `a-docs/` ready for agents to operate in. The human reviews and approves; they do not build manually.

The library defines what good looks like. The active agents produce it.

---

## How A-Society Is Distributed

A-Society is a **standalone repository** that users pull alongside their projects. It is not embedded inside a project — it is a peer to it.

A project adopting the framework places its code in its own folder and points the A-Society Initializer agent at it. The Initializer reads the project, drafts the foundational documents, asks targeted questions, and creates an `a-docs/` folder — the project's instantiation of the framework, containing the agents.md, roles, indexes, and project-specific documentation that agents need to operate. The human reviews and approves before the project is considered ready.

The result is a clean separation at the filesystem level:

```
a-society/          ← the framework (pulled from this repo)
  general/          ← reusable instructions, templates, archetypes
  a-docs/           ← a-society's own project documentation

my-project/         ← the user's project
  [project code]
  a-docs/           ← the project's agent documentation (initialized from a-society)
```

A-Society applies this pattern to itself: `general/` holds the distributable framework; `a-docs/` holds a-society's own agent documentation — the same structure every adopting project uses.

---

## The Relationship to LLM Journey

LLM Journey is the first project this framework is being built alongside and refined against. It is the proving ground — not the definition.

Patterns that emerge from LLM Journey execution get abstracted into `a-society/general/` when they prove reusable across project types. Patterns that are LLM Journey-specific stay in LLM Journey's own `a-docs/`.

When a future project is created, it pulls a-society, initializes its own `a-docs/`, and adds its project-specific layer — without modifying the framework.

---

## What Exists in This Repo

The current state of the framework is tracked in the project index. Consult `$A_SOCIETY_INDEX` for the authoritative list of files and their locations.

---

## Direction for Agents Reading This

If you are an agent reading this document, determine which layer you are operating in:

- **Initializer** — your job is to bootstrap a specific project's `a-docs/`. Read the project, draft the documents, resolve ambiguity with the human, hand off a verified result. Do not modify A-Society itself.
- **Owner or Curator** — your job is to extend or maintain the framework. When you encounter a pattern that would benefit any project: propose it as an addition to `a-society/general/`. When you encounter a decision that is project-specific: keep it in that project's `a-docs/`. When unsure which layer something belongs to: ask.

The framework grows by abstraction, not accumulation. Every addition should make the next project easier to set up — not just this one better documented.
