# A-Society: Project Vision

## The Problem

Agents are capable. The bottleneck is not capability — it is the operating environment around the agent.

Most projects are not set up in a way that agents can navigate confidently, act through a designed process, retain useful memory between sessions, or improve the project from the work they just performed. There is no declared canonical tool, no structured role boundary, no workflow authority, no durable record of decisions, and no feedback loop that turns recurring friction into better defaults. Agents that land in these projects must guess, infer from scattered clues, or ask repeated clarifying questions. The result is inconsistency, rework, and friction — not because the agent failed, but because the project has no harness for agentic work.

This is a solvable problem. It is solved by giving the project a standing agentic harness: structured memory, role boundaries, workflow execution, verification, and self-improvement.

---

## The Vision

**A-Society is a reusable, portable agentic harness for project work: structured memory, role-based workflows, runtime orchestration, verification, and self-improvement.**

It is both a library of reusable project standards and a runtime that helps initialize projects, orchestrate agent sessions, preserve flow records, enforce handoffs, and turn feedback into better framework guidance. A-Society does not merely prepare a project before agents arrive. It helps run the agentic work itself, keeps the project memory coherent, and improves the reusable defaults that future projects inherit.

The framework is:
- **Project-portable** — it can sit beside many kinds of projects without being embedded inside them.
- **Domain-flexible after setup** — once the harness is installed and initialized, it can support software, writing, legal, research, design, and other forms of project work.
- **Technically honest** — today's setup and operation require a technical operator or a technical environment. A-Society should not pretend that every project owner can install it unaided.
- **Agent-adaptable** — it is not conceptually bound to one model or agent platform. Any agent that can read structured context, follow contracts, and work through a role can benefit from it.
- **Learning across projects** — feedback from real flows improves general templates, project-type templates, runtime behavior, and future initialization defaults.

---

## The Core Bet

> The quality of agent output is determined more by the quality of the project's harness — its structure, workflow, memory, verification, and feedback loops — than by the capability of the agent alone.

A well-harnessed project makes a good agent reliable. A poorly harnessed project makes a great agent guess.

The investment is in the operating system around the work — not only in the agent itself.

---

## The Standards We Aim to Provide

A-Society is designed to provide three standards to the projects that adopt it:

1. **Comprehensive work** — work should close with all touched standing surfaces accounted for, not just the most obvious implementation artifact.
2. **Cost optimization** — agents should not be burdened with redundant context, redundant verification, or unnecessary participation in a flow.
3. **Low latency** — work should move through the shortest safe path, with independent work happening in parallel when appropriate.

These are not equal in conflict. The framework prioritizes them in this order:

`comprehensive work > cost optimization > low latency`

---

## Why Roles and Workflows Exist

A single agent can do many things. But a single agent doing everything produces work that is complete by its own assessment — not by structural verification. It plans, implements, and reviews its own work without friction, without a second perspective, without anyone checking whether something was missed. The work feels done. It may not be done.

Roles exist because **different types of expertise produce different perspectives**. An Owner evaluating whether an addition belongs is applying different judgment than a Curator who drafted it. A reviewer checking work against acceptance criteria is thinking differently than the implementer who produced it. Each role brings a perspective the others cannot — and it is the combination of perspectives that makes the output reliable.

Workflows exist because **expertise alone is not enough — experts must communicate effectively**. A workflow is the designed process by which agents with completely different expertise collaborate: each node receives well-formed input, does its specialized work, and produces output for the next node. When every phase runs, completeness is structural — not a matter of one agent's self-assessment.

**Human-directed work is not exempt from this.** When the human identifies a need and directs the work, that direction enters the workflow — it does not bypass it. The Owner receives the direction, routes it into the appropriate workflow, and the designed role separation ensures completeness. An Owner that collapses all phases into itself — proposing, implementing, registering, and self-reviewing — has removed the perspectives that the workflow was designed to include. The result may be fast, but it is not structurally verified.

The framework's recommendation to every project: **follow your designed workflows**. They exist because you decided that completeness and quality require multiple expert perspectives. Bypassing them means losing those perspectives — and the quality guarantee they provide.

The executable layer is the mechanism by which this compliance becomes structural rather than instructional. When the executable layer is deployed, agents follow the workflow because deterministic framework services and runtime orchestration enforce the designed path programmatically — not because a document told them to. The case for designed workflows holds regardless: structure that is enforced programmatically is still structure that was designed because completeness requires multiple expert perspectives.

The investment is in the harness around the work — not only in the agent itself.

---

## Who This Is For and How They Use It

A-Society is for projects that use AI agents as a regular part of getting work done. It is especially useful when the project needs more than one-off prompting: durable context, role boundaries, repeatable workflows, review gates, handoff records, and a way for lessons from completed work to improve the next flow.

Today, A-Society is not a no-setup consumer product. A project needs a technical operator, or someone operating in a technical environment, to install the runtime, configure the workspace, and keep the executable surface healthy. Once that harness exists, the work it supports does not have to be technical. A writing project, research project, legal project, design project, software project, or mixed-domain project can all benefit from the same core mechanism: agents receive structured context, act through explicit roles, produce records, and feed improvement signal back into the framework.

The critical context is session memory. AI agents do not retain memory between sessions. Every time a new agent session starts, the agent arrives fresh — with no knowledge of what was decided last week, what conventions the project has established, or what work is already in progress. Without a structured context layer, the human must re-establish all of this at the start of every session. With a-docs, orientation takes minutes, not conversations.

The typical usage pattern:
1. **Once:** Run the runtime initialization flow to bootstrap the project's `a-docs/`
2. **Each flow:** Let the runtime and workflow contract route the agent work through the appropriate roles, records, handoffs, and closure checks
3. **Each session:** Give the active role its required context so it can work without re-briefing
4. **After meaningful work:** Use backward-pass analysis and optional upstream feedback to improve the project and the framework

`a-docs/` are not a snapshot of a finished project. They are a living layer that starts wherever the project starts — including rough or early-stage — and improves alongside it. A project with a vague vision produces rough a-docs; as the vision sharpens, the Curator brings the a-docs in line. The improvement protocol is the mechanism by which agent documentation catches up to reality.

A-Society's value is not in initialization alone. Initialization is the entry cost. The value accumulates in every session after — agents that arrive oriented, work through the intended process, preserve useful memory, and leave both the project and the framework better than they found them.

---

## What "Agentic-Friendly" Means

A project is agentic-friendly when an agent can be given a role and a task, and immediately know:

1. **What tools to use** — no guessing, no asking, no defaulting to familiar choices
2. **What the rules are** — constraints, forbidden alternatives, non-negotiables
3. **Who owns what** — role boundaries are explicit, not implied
4. **Where to find things** — key files are registered in a discoverable index, not scattered
5. **How the work moves** — workflows, handoffs, review gates, and closure rules are explicit
6. **What the project remembers** — decisions, flow records, and standing context survive the session
7. **How to verify their work** — compliance can be checked, not just assumed
8. **How the system improves** — recurring friction becomes project updates, reusable templates, or framework feedback

These conditions require deliberate structure and an executable process that keeps the structure active while work is happening. That is what the A-Society harness provides.

---

## What A-Society Is

A-Society has two distributable work product layers:

**The library layer** — a collection of general instructions, templates, role archetypes, and project-type-specific standards. The universal layer answers questions every project has: "How do you create [X] so agents can use it?" The category layer captures patterns that recur across a recognizable type of project without pretending they apply to every project. The library lives under `a-society/general/` and grows from feedback, backward-pass findings, and real use.

**The executable layer** — the programmatic execution layer rooted in `a-society/runtime/`. It has standing capability families for deterministic framework services, runtime orchestration, context loading, session and handoff management, backward-pass planning, update comparison, consent prompts for upstream feedback, and operator-facing runtime behavior. The executable layer owns project initialization, but it also supports ongoing work: it helps route flows, preserve records, surface the right context, and make improvement structurally harder to skip.

Like any project using this framework, A-Society also maintains its own `a-docs/` — the agent documentation for agents working on A-Society itself. This is not part of the distributable framework; it is A-Society's own operational layer.

---

## How A-Society Is Distributed

A-Society is a **standalone repository** that users pull alongside their projects. It is not embedded inside a project — it is a peer to it.

A project adopting the framework places its work in its own folder and starts the A-Society runtime in the workspace. The runtime either opens an existing project flow or, when the project lacks `a-docs/`, scaffolds the compulsory files and starts an Owner initialization flow. The Owner reads the project, asks targeted questions, and fills the scaffolded `a-docs/` surfaces — the project's instantiation of the framework, containing the agents.md, roles, indexes, and project-specific documentation that agents need to operate. The human reviews and approves before the project is considered ready.

The result is a clean separation at the filesystem level:

```
a-society/          ← the framework (pulled from this repo)
  general/          ← reusable instructions, templates, archetypes
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

Patterns that emerge from LLM Journey execution get abstracted into `a-society/general/` when they prove reusable across project types. Patterns that apply across a narrower but repeatable category belong in the project-type layer under `general/project-types/<type>/` once that category is approved. Patterns that are LLM Journey-specific stay in LLM Journey's own `a-docs/`.

When a future project is created, it pulls a-society, initializes its own `a-docs/`, and adds its project-specific layer — without modifying the framework.

---

## What Exists in This Repo

The current state of the framework is tracked in the project index. Consult `$A_SOCIETY_INDEX` for the authoritative list of files and their locations.

---

## Direction for Agents Reading This

If you are an agent reading this document, determine which layer you are operating in:

- **Runtime initialization Owner flow** — your job is to bootstrap a specific project's `a-docs/`. Read the project, fill the scaffolded documents, resolve ambiguity with the human, and close only when the project has a usable first-pass harness for agentic work. Do not modify A-Society itself.
- **Runtime-managed project flow** — your job is to work inside the initialized harness: load the role context, follow the workflow contract, preserve records, and participate in improvement when the flow closes.
- **Owner or Curator** — your job is to extend or maintain the framework. When you encounter a pattern that would benefit every project: propose it for the universal layer of `a-society/general/`. When it benefits a repeatable project category: classify it for `general/project-types/<type>/` and require Owner approval for new categories. When a decision is project-specific: keep it in that project's `a-docs/`. When unsure which layer something belongs to: ask.

The framework grows by abstraction, not accumulation. Every addition should make the next project easier to set up — not just this one better documented.
