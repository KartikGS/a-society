# A-Society: Folder Structure

This document explains why each folder in `a-society/` exists — the principle behind it, what belongs there, and what does not. It is not a directory listing. It is a placement guide for agents adding new content.

---

## The Three-Folder Structure

A-Society is a project like any other. As with any project using this framework, `a-docs/` sits alongside the project's actual work product — it is not above it or inside it.

A-Society's work product occupies two folders:

- **`general/`** — the library: distributable instructions, templates, and patterns that any project can adopt
- **`agents/`** — the active agents: A-Society's deployed products that run on other projects

A-Society's agent documentation occupies one folder:

- **`a-docs/`** — operational documentation for agents working on A-Society itself

The key placement question is: what kind of thing is this?
- Content any project can take and use directly → `general/`
- An A-Society agent deployed to work on other projects → `agents/`
- Documentation for agents working on A-Society itself → `a-docs/`

When you are unsure whether something belongs in `general/` vs another project's folder, ask: "Is this true only of A-Society, or would it be true of a legal project, a writing project, and a software project equally?" If the latter — it belongs in `general/`.

---

## Folder Reference

### `project-information/`

**Purpose:** The identity layer of A-Society. Documents here describe what A-Society is, why it exists, and how it is organized.

**What belongs here:**
- The project vision (`vision.md`)
- This file — the folder structure explanation (`structure.md`)
- Any other document that describes A-Society as a project in its own right

**What does not belong here:**
- General instructions that apply to any project
- Content specific to a project using the framework (e.g., LLM Journey) — that belongs in its own project folder

**Principle:** Documents here are about A-Society, not produced by it.

---

### `agents/`

**Purpose:** A-Society's active agents — the products A-Society deploys to work on other projects. These are not templates for other projects to adopt; they are A-Society's own agents that operate externally.

**What belongs here:**
- Agent role files for A-Society-deployed agents (e.g., the Initializer)
- Any future A-Society agent that runs on a target project rather than on A-Society itself

**What does not belong here:**
- Internal operational roles for agents working on A-Society — those live in `a-docs/roles/`
- Distributable role templates for other projects to adopt — those live in `general/roles/`

**Principle:** Files here are A-Society's work product deployed externally. An agent in `agents/` serves other projects; an agent in `a-docs/roles/` serves A-Society.

**The key test:** Does this agent work *on A-Society* (maintaining, extending, or operating the framework)? → `a-docs/roles/`. Does this agent work *for other projects* on behalf of A-Society? → `agents/`.

---

### `general/`

**Purpose:** Everything A-Society distributes to other projects. `general/` is the shareable, reusable layer — the content that any project can take and apply directly, without modification. It is what A-Society *gives*; `a-docs/` is what A-Society *is*.

When someone adopts this framework, they are using `general/`. When A-Society agents work on the framework itself, they are working in `a-docs/`.

**What belongs here:**
- Instruction documents (how to create specific project artifacts)
- Role templates for projects to adopt as their own
- Standards, patterns, and thinking frameworks any project can use verbatim

**What does not belong here:**
- A-Society's own operational content — roles A-Society runs itself, its project identity documents (those belong in `a-docs/`)
- Anything that assumes a specific technology, domain, or team structure
- Project-specific content from LLM Journey or any other adopting project

**Principle:** If it would need to be rewritten for a different kind of project, it does not belong here. If it can be handed to any project owner and applied immediately, it does.

---

### `general/roles/`

**Purpose:** Role templates that any adopting project can use as-is or adapt. These are not A-Society's own roles — they are starting points for other projects to build their own.

**What belongs here:**
- Ready-made role templates applicable to any project type (Owner, Curator, and similar archetypes)
- Templates that a project would copy and customize for their own `a-docs/roles/`

**What does not belong here:**
- Roles that belong to A-Society itself — those live in `a-society/a-docs/roles/`
- Roles that are specific to one project or domain

**The key test:** Would an adopting project instantiate this role inside their own `a-docs/`? If yes — `general/roles/` is correct. If the role is a service A-Society provides to other projects (not something they own themselves) — it belongs in `a-society/a-docs/roles/`.

**Example of the distinction:** The Owner and Curator roles belong in `general/roles/` because every project has its own Owner and Curator. The Initializer belongs in `a-society/a-docs/roles/` because it is A-Society's own agent — other projects receive the Initializer's output, they do not run one themselves.

---

### `general/instructions/`

**Purpose:** The instruction library. Each file answers the question: "How do you create [X] for a new project?"

**What belongs here:**
- One instruction document per artifact type (tooling document, vision document, structure document, etc.)
- Instructions that are flat (not part of a sub-category) live directly in this folder

**What does not belong here:**
- The artifacts themselves (those belong in the project's own folder)
- Instructions that are specific to one project

**Principle:** Instructions describe *how to build* something. They do not contain the thing itself.

---

### `general/instructions/project-information/`

**Purpose:** Instructions specifically for creating `project-information/` artifacts — the documents that describe a project's identity, structure, and orientation.

**What belongs here:**
- `vision.md` — how to write a project vision
- `structure.md` — how to write a folder structure document
- Any future instruction for a `project-information/`-type artifact

**Why a sub-folder?**
Project-information documents form a coherent category: they are all read at orientation, they are all about the project rather than the work, and they are all stable by design. Grouping their instructions together mirrors that coherence and makes the instruction library navigable as it grows.

**Principle:** The sub-folder exists because the category is real — not because the files needed a home.

---

## How This Structure Grows

New instruction types are added to `general/instructions/` (or a sub-folder if they form a coherent category with existing instructions).

New A-Society project documents are added to `project-information/`.

Content from other projects never lives inside `a-society/`. Each project using this framework maintains its own folder at the same level as `a-society/` (e.g., `llm-journey/`, `[next-project]/`).

When a sub-folder becomes warranted inside `general/instructions/`, the signal is: three or more instruction files that share a coherent category and are more useful grouped than flat. Do not create sub-folders preemptively.

### Namespace Parity Exception

Default behavior is still flat placement in `general/instructions/`. However, a single-file sub-folder is allowed when it preserves namespace parity with project-level artifact structure.

Use this exception only when all conditions are true:
- The namespace represents a real, reusable artifact category (not a one-off naming preference).
- The sub-folder improves one-to-one mapping between instruction paths and project artifact paths across adopters.
- The folder starts with `main.md` and uses that as the canonical entry point.

This exception does not remove the three-file rule for ordinary categorization. It is a deliberate portability rule for structural symmetry, not a general invitation to pre-create folders.
