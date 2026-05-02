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
- Runtime-owned contracts injected into managed sessions or runtime-owned phases

**What does not belong here:**
- General guidance or design references for how the executable layer works — those belong in `a-docs/executable/` or other `a-docs/` locations
- Content any project can take and use directly as documentation — that belongs in `general/`
- Any content that is documentation rather than executable code

**Principle:** `runtime/` is the standing executable root. The Orchestration Developer owns its operator-facing surface and orchestration behavior; Framework Services Developer-owned executable services land here.

**The key test:** Is this part of the standing executable surface A-Society intends to keep? If yes → `runtime/`.

**Internal placement standard:** New runtime work is grouped by runtime capability, not left flat at the root or directly under `src/`.

- `runtime/INVOCATION.md` remains the root operator-facing entry point. Package, build, environment, and installation files may also remain at the runtime root.
- Runtime-injected or runtime-owned agent/session contracts belong under `runtime/contracts/`, not as additional root Markdown files.
- `runtime/src/` should contain capability folders rather than a large flat set of peer files. Standard capability folders are:
  - `orchestration/` — flow lifecycle, handoff routing, role-turn coordination, and runtime state transitions
  - `context/` — required-reading resolution, node-entry assembly, index/path resolution, and workflow-file context loading
  - `framework-services/` — deterministic framework services such as scaffolding, validation, comparison, and backward-pass ordering
  - `improvement/` — backward-pass orchestration, findings/feedback flow control, and generated improvement workflow data
  - `projects/` — project discovery, initialization bootstrap, draft flow creation, record metadata, and project-scoped runtime setup
  - `server/` — HTTP, WebSocket, and browser-operator backend surfaces
  - `providers/` — LLM provider adapters and provider configuration
  - `tools/` — model-callable tool executors
  - `observability/` — telemetry, metrics, tracing, and runtime diagnostics
  - `settings/` — persisted runtime/operator settings
  - `common/` — shared types, role identifiers, and small cross-cutting utilities
- Tests should mirror the capability folder structure when a capability has more than one test file.
- A new top-level folder under `runtime/` or `runtime/src/` requires a real capability boundary. Do not create folders for one-off naming preferences; place the file in the nearest existing capability folder until the category is real.

---

### `general/`

**Purpose:** Everything A-Society distributes to other projects. `general/` is the shareable, reusable layer — the content that any project can take and apply directly, without modification within its tier. It is what A-Society *gives*; `a-docs/` is what A-Society *is*.

When someone adopts this framework, they are using `general/`. When A-Society agents work on the framework itself, they are working in `a-docs/`.

**Two-tier model:** `general/` is partitioned into a universal layer and a category layer (see `### general/project-types/` below). The universal layer is the default; the category layer is opt-in for adopting projects whose project type matches.

- **Universal layer** — the `general/` root and all non-`project-types/` sub-folders (e.g., `general/instructions/`, `general/roles/`, `general/improvement/`, `general/thinking/`). Content here must apply without modification to *any* project type — software, writing, legal, research, or any other domain.
- **Category layer** — `general/project-types/<type>/`. Content here must apply without modification to any project of that category, but is not required to apply universally.

**What belongs at the universal layer:**
- Instruction documents that describe artifacts every project produces (vision, structure, agents.md, indexes, workflow definitions, records)
- Role templates that every project instantiates regardless of domain (Owner, Curator)
- Standards, patterns, and thinking frameworks every project can use verbatim

**What belongs at the category layer:**
- Role templates that only make sense for a category of projects (e.g., a Technical Architect template under `general/project-types/executable/roles/technical-architect/`)
- Instruction documents whose subject matter is reusable across a category but not universal
- Other patterns that proved reusable within a category through feedback signal

**What does not belong in `general/` at any tier:**
- A-Society's own operational content — roles A-Society runs itself, its project identity documents (those belong in `a-docs/`)
- Project-specific content from LLM Journey or any other adopting project
- Patterns that have only been observed in one project — those stay in that project's own `a-docs/` until a second project independently produces the same pattern

**The placement test:**
1. Could this be rewritten without modification for a writing project, a legal project, *and* a software project equally? → **Universal layer.**
2. Is there a recognizable category of projects (more than one project of that type) for which this applies without modification, but it does not apply universally? → **Category layer**, under the matching `general/project-types/<type>/`. If the category does not yet exist, propose it for Owner approval before adding content.
3. Does this only apply to one specific project? → **That project's own `a-docs/`.**

---

### `general/project-types/`

**Purpose:** The category layer of `general/`. Each sub-folder names a project category and holds templates and instructions reusable across projects of that type.

**Structure:** Each `general/project-types/<type>/` folder mirrors the structural shape of the universal layer where the category needs that shape. For example, a category that requires its own roles uses `general/project-types/<type>/roles/`. Categories add only the substructure they actually use.

**What belongs here:**
- Categories that have been explicitly approved by the Owner
- Templates and instructions that apply across the named category but not universally

**What does not belong here:**
- A category that has only one example project — collect more evidence first
- Content that would belong at the universal layer if rewritten with category-specific assumptions removed
- Content specific to one project within the category

**Adding a new category is a scope decision and requires explicit Owner approval.** Each new category commits A-Society to maintaining that partition long-term. Categories are added when feedback signal demonstrates a recurring pattern across multiple projects of that type that does not generalize to projects outside the type.

**Current categories:**
- `general/project-types/executable/` — projects with an executable layer (programmatic services, runtime orchestration, code-execution surfaces). Hosts the Technical Architect role template and other patterns specific to building executable systems.

**Principle:** A project category exists in `general/project-types/` because the framework has decided to maintain reusable content for that category. Categories are scoped, named, approved, and load-bearing — not informal groupings.

---

### `general/roles/`

**Purpose:** Role templates applicable to *every* project regardless of type. Universal-layer role templates live here; category-shaped role templates live under `general/project-types/<type>/roles/`.

**What belongs here:**
- Ready-made role templates that every project instantiates regardless of domain (Owner, Curator)
- Templates that a project would copy and customize for their own `a-docs/roles/`

**What does not belong here:**
- Roles that only make sense for a category of projects (e.g., a Technical Architect, which presupposes an executable layer) — those belong under `general/project-types/<type>/roles/`
- Roles that belong to A-Society itself — those live in `a-society/a-docs/roles/`
- Roles that are specific to one project

**The key test:** Would an adopting project of *any* type instantiate this role inside their own `a-docs/`? If yes — `general/roles/` is correct. If only projects of a specific category would instantiate it — it belongs under `general/project-types/<type>/roles/`. If the role is a service A-Society provides to other projects — it belongs in `a-society/a-docs/roles/`.

**Example of the distinction:** The Owner and Curator roles belong in `general/roles/` because every project has its own Owner and Curator regardless of domain. The Technical Architect role belongs under `general/project-types/executable/roles/technical-architect/` because it only makes sense for projects that have an executable layer to design. Runtime-owned initialization guidance belongs in `runtime/contracts/initialization.md` because the executable layer now performs initialization by running an Owner flow after scaffold.

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
