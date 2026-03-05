# A-Society: Architecture

## System Overview

A-Society is a documentation framework, not a software application. Its "system" is a set of folders and files that agents read and write. Understanding the structure is understanding the architecture.

A-Society has three top-level folders, each with a distinct role:

- **`general/`** — the library. Distributable instructions, templates, and patterns that any adopting project can use without modification.
- **`agents/`** — the active agents. A-Society's deployed products that run on other projects (e.g., the Initializer). These are A-Society's work product, not internal tooling.
- **`a-docs/`** — the documentation layer. Agent documentation for agents working on A-Society itself. Sits alongside the work product, just as `a-docs/` sits alongside project work in any other project using this framework.

Two indexes govern path resolution:

- **`a-society/index.md`** — the public index. Covers all paths in `general/` and `agents/`. External agents and project owners resolve paths here.
- **`a-society/a-docs/indexes/main.md`** — the internal index. Covers paths within `a-docs/`. Internal agents (Owner, Curator) resolve paths here.

---

## Architectural Invariants

The following constraints are non-negotiable. An agent that violates one has made a structural mistake, even if the immediate task appears to succeed.

### Layer Isolation

`a-docs/` is documentation about A-Society. `general/` and `agents/` are A-Society's work product. These are categorically different things and must not be mixed.

- Content that is part of A-Society's deliverable (instructions, templates, active agents) belongs in `general/` or `agents/`, never in `a-docs/`
- Documentation for agents working on A-Society belongs in `a-docs/`, never in `general/` or `agents/`
- The test: "Is this describing A-Society, or is this something A-Society produces?" Descriptions → `a-docs/`. Products → `general/` or `agents/`

Violation: Placing an A-Society agent role file in `a-docs/roles/` when the agent works for other projects, not on A-Society.

### Boundary Respect

External agents (those in `agents/`) operate outside A-Society's internal documentation layer. They must not cross into `a-docs/` to do their job.

- External agents resolve paths from `a-society/index.md` only — never from `a-society/a-docs/indexes/main.md`
- An external agent's context loading must not include `a-docs/` files as required reads
- If an external agent needs framework knowledge (e.g., what an a-docs artifact is), that knowledge must be available in `general/` — not gated behind internal documentation

Violation: The Initializer reading `a-docs/agents.md` or `a-docs/project-information/vision.md` as part of its context loading.

### Portability Hard Constraint

Anything placed in `general/` must apply without modification to any project type — software, writing, legal, research, or any other domain. This is not a preference; it is a load-bearing constraint. `general/` is the shared library for all adopters.

- No content in `general/` may assume a specific technology, domain, team structure, or workflow
- The test: "Would this need to be rewritten for a non-technical project?" If yes, it does not belong in `general/`
- Project-specific patterns belong in that project's own `a-docs/`, not in `general/`

Violation: Adding an instruction to `general/` that references specific programming languages, software tools, or technical concepts as baseline assumptions.

### Information Ownership

Every piece of information has exactly one home. Duplication is not a convenience — it is a maintenance liability and a future conflict.

- When the same information appears in two places, one of them is wrong or will become wrong
- The resolution is always clearer scope, not consolidation or duplication
- The index (public or internal) is the single source of truth for file paths — paths are never hardcoded in documents that reference variables

Violation: Listing `$GENERAL_*` paths in both the internal index and a separate document, creating two registries that must be kept in sync.

### Context Loading Scope

An agent's context loading contains only what is directly necessary for its specific job. Loading unnecessary documents wastes context and creates false dependencies.

- An agent working on A-Society itself reads `a-docs/` orientation documents
- An agent deployed to work on other projects reads only the public index and the `general/` content relevant to its task
- The test: "Would removing this document from context loading cause this agent to make a worse decision?" If no, remove it

Violation: The Initializer loading A-Society's internal vision and structure documents when its job is to initialize a different project entirely.
