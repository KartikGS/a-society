# A-Society: Folder Structure

This document explains why each folder in `a-society/` exists — the principle behind it, what belongs there, and what does not. It is not a directory listing. It is a placement guide for agents adding new content.

---

## The Three-Layer Structure

A-Society is a project like any other. As with any project using this framework, `a-docs/` sits alongside the project's actual work product — it is not above it or inside it.

A-Society's standing work product occupies two folders:

- **`general/`** — the library: distributable instructions, templates, and patterns that any project can adopt
- **`runtime/`** — the executable layer root: deterministic framework services plus programmatic orchestration, operator-facing runtime behavior, and the standing executable reference surface

A-Society's agent documentation occupies one folder:

- **`a-docs/`** — operational documentation for agents working on A-Society itself

The key placement question is: what kind of thing is this?
- Content any project can take and use directly → `general/`
- A standing executable capability or operator-facing executable surface → `runtime/`
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

### `runtime/`

**Purpose:** A-Society's executable layer root — the standing home for operator-facing runtime behavior, orchestration/session management, and permanent executable framework services. The runtime calls LLM APIs directly, provides the executable CLI surface, and is the surviving umbrella root for executable implementation.

**What belongs here:**
- TypeScript source files implementing orchestration components (context injection, session management, handoff routing, provider gateways, observability, and similar)
- TypeScript source files implementing permanent deterministic framework services
- Supporting runtime files (`package.json`, state management, `INVOCATION.md`)

**What does not belong here:**
- General guidance or design references for how the executable layer works — those belong in `a-docs/executable/` or other `a-docs/` locations
- Content any project can take and use directly as documentation — that belongs in `general/`
- Any content that is documentation rather than executable code

**Principle:** `runtime/` is the standing executable root. The Orchestration Developer owns its operator-facing surface and orchestration behavior; Framework Services Developer-owned executable services land here.

**The key test:** Is this part of the standing executable surface A-Society intends to keep? If yes → `runtime/`.

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

**Example of the distinction:** The Owner and Curator roles belong in `general/roles/` because every project has its own Owner and Curator. Runtime-owned initialization guidance belongs in `runtime/INITIALIZATION.md` because the executable layer now performs initialization by running an Owner flow after scaffold.

---

### `general/instructions/`

**Purpose:** The instruction library. Each file answers the question: "How do you create [X] for a new project?" — and, where applicable, how to work with it once created (e.g., how to modify an existing workflow).

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

### `general/feedback/`

**Purpose:** Feedback-reference artifacts for upstream A-Society feedback. The active surface is a single general feedback template that matches the runtime's optional final feedback step. Legacy stream-specific templates remain here only as compatibility references for historical artifacts.

**What belongs here:**
- The general upstream feedback template
- Compatibility references for older feedback formats or older update reports that still mention them

**What does not belong here:**
- Actual feedback reports filed by adopting projects — those go to `a-society/feedback/`
- Project-level consent records or scaffolding requirements — the runtime now asks for upstream-feedback consent per flow at feedback time

**Principle:** Files here define or preserve feedback artifact formats. They do not define project scaffolding requirements.

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
