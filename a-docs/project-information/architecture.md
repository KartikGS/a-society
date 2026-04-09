# A-Society: Architecture

## System Overview

A-Society is a framework for making projects agentic-friendly. Its foundation is documentation — structured context that agents read and follow — but its work product now also includes a standing executable layer rooted in `runtime/`. Understanding the structure is understanding the architecture.

A-Society has five top-level folders, each with a distinct role:

- **`general/`** — the library. Distributable instructions, templates, and patterns that any adopting project can use without modification.
- **`agents/`** — the active agents. A-Society's deployed products that run on other projects (e.g., the Initializer). These are A-Society's work product, not internal framework-maintenance docs.
- **`runtime/`** — the standing executable root. It owns operator-facing executable behavior and the permanent home for A-Society's executable capabilities: deterministic framework services plus orchestration/session management. The runtime calls LLM APIs directly, provides the operator-facing CLI surface, and is the surviving umbrella executable layer.
- **`tooling/`** — transitional legacy implementation location. Some deterministic framework-service code may still live here while migrations are phased in, but `tooling/` is no longer a standing peer layer and is not a target for new permanent placements.
- **`a-docs/`** — the documentation layer. Agent documentation for agents working on A-Society itself. Sits alongside the work product, just as `a-docs/` sits alongside project work in any other project using this framework.

The executable layer currently includes six standing deterministic framework services and one orchestration family:

| Capability | What it does |
|---|---|
| Scaffolding | Creates the folder structure and stub files for a new project's `a-docs/` |
| Consent handling | Creates consent files from template and checks consent status |
| Workflow graph validation | Validates approved workflow graph representations and related schema constraints |
| Backward-pass planning | Computes backward-pass traversal order and related findings-location data from `workflow.md` in the active record folder |
| Path validation | Checks that every path registered in an index table resolves to an existing file |
| Update comparison | Identifies which framework update reports an adopting project has not yet applied |
| Orchestration | Manages agent sessions end to end: context injection, handoff routing, trigger execution, observability, and operator-facing runtime behavior |

Standing executable design and coupling references live under `$A_SOCIETY_EXECUTABLE`. During migration, legacy implementation details and historical assessment context may still point back to the transitional `tooling/` paths they describe.

**Executable implementation ownership:** `runtime/` is the standing executable root. Framework Services Developer and Orchestration Developer work within the executable layer under approved design authority. The Curator maintains the standing docs and indexes but does not author executable implementation surfaces.

Two indexes govern path resolution:

- **`a-society/index.md`** — the public index. Covers all public-facing paths in `general/`, `agents/`, and the standing operator entry point in `runtime/`. External agents and project owners resolve paths here.
- **`a-society/a-docs/indexes/main.md`** — the internal index. Covers A-Society's internal documentation set plus the internal-facing and operator-facing references that A-Society roles maintain directly. Internal agents resolve paths here.

---

## Feedback Signal Architecture

A-Society grows from real-world usage. All inbound feedback signal is collected under `a-society/feedback/`, organized by signal type. All feedback writing requires recorded consent from the adopting project — see the Consent Invariant below.

**Stream 1 — Initializer signal reports** (`$A_SOCIETY_FEEDBACK_ONBOARDING`)
Every time the Initializer completes an initialization run, it generates a signal report (with the project's consent) and writes it to `a-society/feedback/onboarding/[project-name]-[YYYY-MM-DD].md`. These reports capture: what was inferable vs. what required questions, how each `general/` instruction performed, adversity encountered, and concrete recommendations for improving the library. The Owner and Curator consume these reports to identify gaps and drive improvements to `general/` and `agents/`.

**Stream 2 — Migration feedback reports** (`$A_SOCIETY_FEEDBACK_MIGRATION`)
After an adopting project's Curator implements a framework update report, it produces a migration feedback report (with consent) and files it to `a-society/feedback/migration/[project-name]-[update-report-date].md`. These reports capture: which changes applied, the clarity of migration guidance, friction encountered, and recommendations for improving future update reports. Use `$GENERAL_FEEDBACK_MIGRATION_TEMPLATE` when producing these reports.

**Stream 3 — Curator signals from adopting projects** (`$A_SOCIETY_FEEDBACK_CURATOR_SIGNAL`)
Projects using the framework run their own improvement protocols. Their Curators observe patterns, friction, and gaps that A-Society's own agents cannot see. These observations are high-value signal for evolving the general library. The mechanism for communicating these signals back to A-Society — format, submission path, receiving role — is not yet defined. This is a deliberate open problem: the right solution depends on how the framework is distributed and how many projects are using it. A future role (provisionally: a signal-receiving or integration role) will own this stream.

**Outbound communication — Framework update reports**
The inverse of inbound streams: A-Society pushing change notifications out to adopting projects. When `general/` or `agents/` changes in ways that require adopting projects to review their own `a-docs/`, the A-Society Curator produces a framework update report and publishes it to `a-society/updates/`. Each report classifies changes by impact (Breaking / Recommended / Optional) and includes migration guidance for each adopting project's Curator. A `vMAJOR.MINOR` versioning scheme has been established so Curators can determine which reports they still need to apply by comparing their project's recorded version (in `a-docs/a-society-version.md`) against A-Society's current version (`$A_SOCIETY_VERSION`). The remaining open problem is *discovery* — how Curators learn that new update reports exist in the first place. This is deferred until A-Society's distribution model is defined. See `$A_SOCIETY_UPDATES_PROTOCOL`.

**What this means for agents initializing new projects:**
When initializing a project that uses the A-Society framework, establish the consent system using `$INSTRUCTION_CONSENT`. Ask the human about onboarding signal consent before closing initialization. The project's Curator role should reference checking `a-docs/feedback/migration/consent.md` before filing migration feedback, and checking `a-docs/feedback/curator-signal/consent.md` before submitting patterns.

---

## Architectural Invariants

The following constraints are non-negotiable. An agent that violates one has made a structural mistake, even if the immediate task appears to succeed.

### Layer Isolation

`a-docs/` is documentation about A-Society. `general/`, `agents/`, and `runtime/` are A-Society's standing work product. `tooling/` may exist as transitional executable implementation state only when an approved migration still requires it. These categories must not be mixed.

- Content that is part of A-Society's deliverable (instructions, templates, active agents, executable capabilities, operator-facing runtime surfaces) belongs in `general/`, `agents/`, or `runtime/`, never in `a-docs/`
- Documentation for agents working on A-Society belongs in `a-docs/`, never in `general/`, `agents/`, or `runtime/`
- The test: "Is this describing A-Society, or is this something A-Society produces?" Descriptions → `a-docs/`. Products → `general/`, `agents/`, or `runtime/`
- The secondary test for work product placement: instructions and templates → `general/`; deployed agents that run on other projects → `agents/`; executable capabilities and operator-facing runtime behavior → `runtime/`; `tooling/` only when an approved migration explicitly preserves a legacy implementation location for the current flow

Violation: Placing an A-Society agent role file in `a-docs/roles/` when the agent works for other projects, not on A-Society.
Violation: Placing executable implementation code in `a-docs/` or `general/`.
Violation: Creating new permanent executable placements under `tooling/` after the executable-layer unification decision.

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

### Consent Before Signal

A-Society never writes feedback signal from a project without explicit, recorded consent from that project's owner. Consent is stored in the project's `a-docs/feedback/[type]/consent.md` — one file per feedback type.

- Every feedback-producing agent checks its consent file before writing. If the file is absent or `Consented: No`, the agent skips and notes it in session output
- Consent files are loaded on-demand at the moment feedback is about to be written — they are not part of any role's session-start required reading
- Every new feedback mechanism must define its consent type and agent behavior before shipping — see `$A_SOCIETY_PRINCIPLES`

Violation: An agent writing to `a-society/feedback/` without first reading the project's consent file for that feedback type.
