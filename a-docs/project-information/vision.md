# A-Society: Project Vision

## The Problem

Agents are capable. The bottleneck is not capability — it is context.

Most projects are not set up in a way that agents can navigate confidently. There is no declared canonical tool, no structured role boundary, no single source of truth for key decisions. Agents that land in these projects must guess, infer from scattered clues, or ask repeated clarifying questions. The result is inconsistency, rework, and friction — not because the agent failed, but because the project was never made ready for one.

This is a solvable problem. And it is solved before the agent ever arrives.

---

## The Vision

**A-Society is a reusable, portable framework for making any project agentic-friendly — before agents are deployed.**

It is not a product. It is not a tool. It is a library of patterns, instructions, and standards that any project owner can apply to structure their project so that agents can operate within it confidently, from day one.

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

A-Society is organized as a library of general instructions, each answering the question: "When setting up a new project for agents, how do you create [X]?"

Each instruction document:
- Explains **what** the artifact is
- Explains **why** it is needed
- Explains **how** to create it
- Is written for any project type, not just software

The instructions live under `a-society/general/instructions/`. As the library grows, it becomes a complete playbook for standing up a new project that agents can operate in from the first session.

---

## How A-Society Is Distributed

A-Society is a **standalone repository** that users pull alongside their projects. It is not embedded inside a project — it is a peer to it.

A project adopting the framework places its code in its own folder and runs an initialization process that creates an `a-docs/` folder inside it. That `a-docs/` folder is the project's instantiation of the framework — containing the agents.md, roles, indexes, and project-specific documentation that agents need to operate.

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

If you are an agent reading this document, your job is to extend the framework — not to build features.

When you encounter a pattern that would benefit any project: propose it as an addition to `a-society/general/`. When you encounter a decision that is project-specific: keep it in that project's `a-docs/`. When you are unsure which layer something belongs to: ask.

The framework grows by abstraction, not accumulation. Every addition should make the next project easier to set up — not just this one better documented.
