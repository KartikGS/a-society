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

## Why Roles and Workflows Exist

A single agent can do many things. But a single agent doing everything produces work that is complete by its own assessment — not by structural verification. It plans, implements, and reviews its own work without friction, without a second perspective, without anyone checking whether something was missed. The work feels done. It may not be done.

Roles exist because **different types of expertise produce different perspectives**. An Owner evaluating whether an addition belongs is applying different judgment than a Curator who drafted it. A reviewer checking work against acceptance criteria is thinking differently than the implementer who produced it. Each role brings a perspective the others cannot — and it is the combination of perspectives that makes the output reliable.

Workflows exist because **expertise alone is not enough — experts must communicate effectively**. A workflow is the designed process by which agents with completely different expertise collaborate: each node receives well-formed input, does its specialized work, and produces output for the next node. When every phase runs, completeness is structural — not a matter of one agent's self-assessment.

**Human-directed work is not exempt from this.** When the human identifies a need and directs the work, that direction enters the workflow — it does not bypass it. The Owner receives the direction, routes it into the appropriate workflow, and the designed role separation ensures completeness. An Owner that collapses all phases into itself — proposing, implementing, registering, and self-reviewing — has removed the perspectives that the workflow was designed to include. The result may be fast, but it is not structurally verified.

The framework's recommendation to every project: **follow your designed workflows**. They exist because you decided that completeness and quality require multiple expert perspectives. Bypassing them means losing those perspectives — and the quality guarantee they provide.

The executable layer is the mechanism by which this compliance becomes structural rather than instructional. When the executable layer is deployed, agents follow the workflow because deterministic framework services and runtime orchestration enforce the designed path programmatically — not because a document told them to. The case for designed workflows holds regardless: structure that is enforced programmatically is still structure that was designed because completeness requires multiple expert perspectives.

The investment is in the project setup — not in the agent itself.

---

## Who This Is For and How They Use It

A-Society is for project owners who work with AI agents regularly — not as a one-off experiment, but as a normal part of how their project gets done. They may be building software, writing content, conducting research, or running any other kind of project. What they share is this: they assign agents to sessions, and they want those agents to work reliably without constant re-briefing.

The critical context is session memory. AI agents do not retain memory between sessions. Every time a new agent session starts, the agent arrives fresh — with no knowledge of what was decided last week, what conventions the project has established, or what work is already in progress. Without a structured context layer, the human must re-establish all of this at the start of every session. With a-docs, orientation takes minutes, not conversations.

The typical usage pattern:
1. **Once:** Run the Initializer to bootstrap the project's `a-docs/`
2. **Each session:** Assign an agent a role, point it at `agents.md` — it loads context and works
3. **Periodically:** Run the Curator to keep `a-docs/` current as the project evolves

`a-docs/` are not a snapshot of a finished project. They are a living layer that starts wherever the project starts — including rough or early-stage — and improves alongside it. A project with a vague vision produces rough a-docs; as the vision sharpens, the Curator brings the a-docs in line. The improvement protocol is the mechanism by which agent documentation catches up to reality.

A-Society's value is not in initialization. Initialization is the entry cost. The value accumulates in every session after — agents that arrive oriented, work aligned, and leave the project better than they found it.

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

A-Society has three work product layers:

**The library layer** — a collection of general instructions, templates, and role archetypes, each answering the question: "When setting up a new project for agents, how do you create [X]?" Each instruction explains what the artifact is, why it is needed, and how to build it. The library lives under `a-society/general/` and is project-agnostic — applicable to software, writing, legal, research, and any other domain.

**The active layer** — a set of agents that use the library to do the actual work. These agents live under `a-society/agents/`. The primary active agent is the **Initializer**: given a project, it reads what exists, drafts the foundational agent-docs, resolves ambiguity with the human through targeted questions, and produces a complete `a-docs/` ready for agents to operate in. The human reviews and approves; they do not build manually.

**The executable layer** — the programmatic execution layer rooted in `a-society/runtime/`. It has two standing capability families: deterministic framework services (scaffolding, validation, consent handling, backward-pass planning, update comparison, and related helpers) and orchestration (session management, context loading, handoff transitions, trigger execution, and operator-facing runtime behavior). The executable layer does not replace agent judgment; it makes repeatable framework operations reliable and moves process choreography from natural-language instruction to programmatic control. The `tooling/` directory may persist temporarily as a legacy implementation location during migration, but it is no longer a standing peer layer. The natural evolution: the library defines what good looks like, the active agents produce it, and the executable layer makes the repeatable parts dependable.

Like any project using this framework, A-Society also maintains its own `a-docs/` — the agent documentation for agents working on A-Society itself. This is not part of the distributable framework; it is A-Society's own operational layer.

---

## How A-Society Is Distributed

A-Society is a **standalone repository** that users pull alongside their projects. It is not embedded inside a project — it is a peer to it.

A project adopting the framework places its code in its own folder and points the A-Society Initializer agent at it. The Initializer reads the project, drafts the foundational documents, asks targeted questions, and creates an `a-docs/` folder — the project's instantiation of the framework, containing the agents.md, roles, indexes, and project-specific documentation that agents need to operate. The human reviews and approves before the project is considered ready.

The result is a clean separation at the filesystem level:

```
a-society/          ← the framework (pulled from this repo)
  general/          ← reusable instructions, templates, archetypes
  agents/           ← a-society's active agents (e.g., the Initializer)
  runtime/          ← standing executable root and operator surface
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
