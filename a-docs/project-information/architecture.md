# A-Society: Architecture

## System Overview

A-Society is a framework for making projects agentic-friendly. Its foundation is documentation — structured context that agents read and follow — but its work product now also includes a standing executable layer rooted in `runtime/`. Understanding the structure is understanding the architecture.

A-Society has three primary standing layers, each with a distinct role:

- **`general/`** — the library. Distributable instructions, templates, and patterns that any adopting project can use without modification.
- **`runtime/`** — the standing executable root. It owns operator-facing executable behavior and the permanent home for A-Society's executable capabilities: deterministic framework services plus orchestration/session management. The runtime calls LLM APIs directly, provides the operator-facing web server / browser UI surface, and is the surviving umbrella executable layer.
- **`a-docs/`** — the documentation layer. Agent documentation for agents working on A-Society itself. Sits alongside the work product, just as `a-docs/` sits alongside project work in any other project using this framework.

Detailed executable architecture, capability inventory, and implementation ownership boundaries live under `$A_SOCIETY_EXECUTABLE`, starting with `$A_SOCIETY_EXECUTABLE_OVERVIEW`.

Two indexes govern path resolution:

- **`a-society/index.md`** — the public index. Covers all public-facing paths in `general/` and the standing operator entry point in `runtime/`. Public runtime surfaces and project owners resolve paths here.
- **`a-society/a-docs/indexes/main.md`** — the internal index. Covers A-Society's internal documentation set plus the internal-facing and operator-facing references that A-Society roles maintain directly. Internal agents resolve paths here.

---

## Feedback Signal Architecture

A-Society grows from real-world usage. All inbound feedback signal is collected under `a-society/feedback/`, organized by signal type. All feedback writing requires recorded consent from the adopting project — see the Consent Invariant below.

**Stream 1 — Initialization signal reports** (`$A_SOCIETY_FEEDBACK_ONBOARDING`)
Every time the runtime-owned Owner initialization flow completes an initialization run, it may generate a signal report (with the project's consent) and write it to `a-society/feedback/onboarding/[project-name]-[YYYY-MM-DD].md`. These reports capture: what was inferable vs. what required questions, how each `general/` instruction performed, adversity encountered, and concrete recommendations for improving the library and runtime initialization experience. The Owner and Curator consume these reports to identify gaps and drive improvements to `general/` and `runtime/`.

**Stream 2 — Migration feedback reports** (`$A_SOCIETY_FEEDBACK_MIGRATION`)
After an adopting project's Curator implements a framework update report, it produces a migration feedback report (with consent) and files it to `a-society/feedback/migration/[project-name]-[update-report-date].md`. These reports capture: which changes applied, the clarity of migration guidance, friction encountered, and recommendations for improving future update reports. Use `$GENERAL_FEEDBACK_MIGRATION_TEMPLATE` when producing these reports.

**Stream 3 — Project-level framework feedback from adopting projects** (`$A_SOCIETY_FEEDBACK_CURATOR_SIGNAL`)
Projects using the framework run their own improvement protocols. Their backward passes surface patterns, friction, and gaps that A-Society's own agents cannot see. The final Owner feedback artifact from those projects is the high-value signal for evolving the general library and runtime. The collection path is still the legacy-named `curator-signal/` folder, but the signal itself is project-level framework feedback rather than Curator-only output.

**Outbound communication — Framework update reports**
The inverse of inbound streams: A-Society pushing change notifications out to adopting projects. When `general/` or runtime-owned initialization behavior changes in ways that require adopting projects to review their own `a-docs/`, the A-Society Curator produces a framework update report and publishes it to `a-society/updates/`. Each report classifies changes by impact (Breaking / Recommended / Optional) and includes migration guidance for each adopting project's Curator. A `vMAJOR.MINOR` versioning scheme has been established so Curators can determine which reports they still need to apply by comparing their project's recorded version (in `a-docs/a-society-version.md`) against A-Society's current version (`$A_SOCIETY_VERSION`). The remaining open problem is *discovery* — how Curators learn that new update reports exist in the first place. This is deferred until A-Society's distribution model is defined. See `$A_SOCIETY_UPDATES_PROTOCOL`.

**What this means for runtime initialization flows:**
When initializing a project that uses the A-Society framework, establish the consent system using `$INSTRUCTION_CONSENT`. Ask the human about onboarding signal consent before closing initialization. The project's update-implementing role should reference checking `a-docs/feedback/migration/consent.md` before filing migration feedback, and the Owner should reference checking `a-docs/feedback/curator-signal/consent.md` before filing project-level framework feedback.

---

## Architectural Invariants

The following constraints are non-negotiable. An agent that violates one has made a structural mistake, even if the immediate task appears to succeed.

### Layer Isolation

`a-docs/` is documentation about A-Society. `general/` and `runtime/` are A-Society's standing work product. These categories must not be mixed.

- Content that is part of A-Society's deliverable (instructions, templates, executable capabilities, operator-facing runtime surfaces) belongs in `general/` or `runtime/`, never in `a-docs/`
- Documentation for agents working on A-Society belongs in `a-docs/`, never in `general/` or `runtime/`
- The test: "Is this describing A-Society, or is this something A-Society produces?" Descriptions → `a-docs/`. Products → `general/` or `runtime/`
- The secondary test for work product placement: instructions and templates → `general/`; executable capabilities and operator-facing runtime behavior → `runtime/`

Violation: Placing executable implementation code in `a-docs/` or `general/`.
Violation: Creating a new executable implementation root that recreates the retired tooling/runtime split.

### Boundary Respect

Public runtime initialization surfaces operate outside A-Society's internal documentation layer. They must not cross into `a-docs/` as standing required reads for external project work.

- Public runtime initialization surfaces resolve paths from `a-society/index.md` only — never from `a-society/a-docs/indexes/main.md`
- Their standing context loading must not include `a-docs/` files as required reads
- If a public runtime surface needs framework knowledge (e.g., what an a-docs artifact is), that knowledge must be available in `general/` or `runtime/` — not gated behind internal documentation

Violation: A runtime initialization surface loading `a-docs/agents.md` or `a-docs/project-information/vision.md` as part of its standing context loading.

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
- A runtime initialization surface working on other projects reads only the public index plus the `general/` and `runtime/` content relevant to its task
- The test: "Would removing this document from context loading cause this agent to make a worse decision?" If no, remove it

Violation: A runtime initialization surface loading A-Society's internal vision and structure documents when its job is to initialize a different project entirely.

### Consent Before Signal

A-Society never writes feedback signal from a project without explicit, recorded consent from that project's owner. Consent is stored in the project's `a-docs/feedback/[type]/consent.md` — one file per feedback type.

- Every feedback-producing agent checks its consent file before writing. If the file is absent or `Consented: No`, the agent skips and notes it in session output
- Consent files are loaded on-demand at the moment feedback is about to be written — they are not part of any role's session-start required reading
- Every new feedback mechanism must define its consent type and agent behavior before shipping — see `$A_SOCIETY_PRINCIPLES`

Violation: An agent writing to `a-society/feedback/` without first reading the project's consent file for that feedback type.
