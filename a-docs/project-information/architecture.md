# A-Society: Architecture

## System Overview

A-Society is a documentation framework, not a software application. Its "system" is a set of folders and files that agents read and write. Understanding the structure is understanding the architecture.

A-Society has four top-level folders, each with a distinct role:

- **`general/`** — the library. Distributable instructions, templates, and patterns that any adopting project can use without modification.
- **`agents/`** — the active agents. A-Society's deployed products that run on other projects (e.g., the Initializer). These are A-Society's work product, not internal tooling.
- **`tooling/`** — the programmatic tooling layer. Executable utilities that agents invoke to perform deterministic, rule-derived framework operations. These tools are A-Society's work product: adopting project agents invoke them via paths registered in the public index. Implemented in TypeScript (tsx runtime, ESM); invocation model is agent-invoked (agents call tools and interpret results in natural language — humans do not call tools directly).
- **`a-docs/`** — the documentation layer. Agent documentation for agents working on A-Society itself. Sits alongside the work product, just as `a-docs/` sits alongside project work in any other project using this framework.

The tooling layer comprises seven components, each covering a distinct deterministic operation:

| Component | What it does |
|---|---|
| Path Validator (5) | Checks that every path registered in an index table resolves to an existing file |
| Version Comparator (6) | Identifies which framework update reports an adopting project has not yet applied |
| Plan Artifact Validator (7) | Confirms a plan artifact exists in a given record folder and that its YAML frontmatter satisfies all required field constraints |
| Consent Utility (2) | Creates consent files from template and checks consent status |
| Workflow Graph Schema Validator (3) | Validates that a workflow graph document matches the approved YAML frontmatter format |
| Backward Pass Orderer (4) | Computes backward pass traversal order and generates per-role session trigger prompts from `workflow.md` in the active record folder |
| Scaffolding System (1) | Creates the folder structure and stub files for a new project's `a-docs/` |

Component numbers reflect the implementation phase order (Phases 1–5 in the approved proposal; Component 7 is in Phase 1A, concurrent with Phases 1–3). Full component specifications are in `$A_SOCIETY_TOOLING_PROPOSAL`. Workflow, role definitions, and phase sequencing are in `$A_SOCIETY_TOOLING_ADDENDUM`.

**Node.js project initialization:** The `tooling/` directory is initialized with Node.js project scaffolding (`package.json`, directory structure) by the Tooling Developer after the Owner approves this architecture document update. This is a Developer responsibility — the Curator does not write to `tooling/`.

Two indexes govern path resolution:

- **`a-society/index.md`** — the public index. Covers all paths in `general/`, `agents/`, and `tooling/`. External agents and project owners resolve paths here.
- **`a-society/a-docs/indexes/main.md`** — the internal index. Covers paths within `a-docs/`. Internal agents (Owner, Curator, Tooling Developer) resolve paths here.

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

`a-docs/` is documentation about A-Society. `general/`, `agents/`, and `tooling/` are A-Society's work product. These are categorically different things and must not be mixed.

- Content that is part of A-Society's deliverable (instructions, templates, active agents, executable utilities) belongs in `general/`, `agents/`, or `tooling/`, never in `a-docs/`
- Documentation for agents working on A-Society belongs in `a-docs/`, never in `general/`, `agents/`, or `tooling/`
- The test: "Is this describing A-Society, or is this something A-Society produces?" Descriptions → `a-docs/`. Products → `general/`, `agents/`, or `tooling/`
- The secondary test for work product placement: instructions and templates → `general/`; deployed agents that run on other projects → `agents/`; deterministic executable utilities → `tooling/`

Violation: Placing an A-Society agent role file in `a-docs/roles/` when the agent works for other projects, not on A-Society.
Violation: Placing tooling implementation code in `a-docs/` or `general/`.

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
