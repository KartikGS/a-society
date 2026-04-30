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

A-Society grows from real-world usage. All inbound feedback signal is collected under `$A_SOCIETY_FEEDBACK_DIR`. New runtime-generated feedback is a single optional upstream-sharing step that happens only after a flow's forward pass is closed and its backward-pass meta-analysis is complete.

**Single feedback path — optional upstream sharing after backward pass**
Every initialized project flow can end in the same shape:

1. forward pass closes
2. backward-pass meta-analysis runs locally
3. the runtime asks the human whether to generate upstream A-Society feedback for that flow
4. if the human says Yes, the feedback agent writes one report directly to a runtime-assigned path under `$A_SOCIETY_FEEDBACK_DIR`
5. if the human says No, the flow closes without running the feedback agent

The feedback prompt is flow-aware. Initialization flows should focus on what the runtime inferred, what required human input, and where scaffolding or initialization guidance caused friction. Update-application flows should focus on which update guidance applied, what was unclear, and what future migration reports should improve. Standard flows should focus on reusable framework gaps, workflow friction, runtime issues, and cross-project patterns.

**Collection model — local generation, human-reviewed sharing**
The current collection model is intentionally simple: the feedback agent writes a markdown artifact into `$A_SOCIETY_FEEDBACK_DIR`, then the human reviews, redacts if needed, and may share it upstream in a manual GitHub PR. This keeps submission explicit, avoids automatic ingestion from personal machines, and leaves moderation at the PR-review layer. Privacy review is the immediate concern, so the runtime should always make clear that generated feedback may contain project-specific details and should be reviewed before sharing.

**Outbound communication — Framework update reports**
The inverse of inbound feedback: A-Society pushing change notifications out to adopting projects. When `general/` or runtime-owned initialization behavior changes in ways that require adopting projects to review their own `a-docs/`, the A-Society Curator produces a framework update report and publishes it to `a-society/updates/`. Each report classifies changes by impact (Breaking / Recommended / Optional) and includes migration guidance for the adopting project's Owner, who starts an update-application flow and routes work to the touched-surface truth owners. A `vMAJOR.MINOR` versioning scheme has been established so adopters can determine which reports they still need to apply by comparing their project's recorded version (in `a-docs/a-society-version.md`) against A-Society's current version (`$A_SOCIETY_VERSION`). The remaining open problem is *discovery* — how projects learn that new update reports exist in the first place. This is deferred until A-Society's distribution model is defined. See `$A_SOCIETY_UPDATES_PROTOCOL`.

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

A-Society never writes upstream feedback from a project without an explicit operator decision for that flow.

- Local backward-pass meta-analysis may still run without upstream-sharing consent
- The final upstream feedback agent runs only after the runtime asks whether to generate feedback for the just-completed flow
- If the answer is No, the flow closes without creating an upstream feedback artifact
- If the answer is Yes, the feedback agent writes exactly one runtime-assigned artifact under `$A_SOCIETY_FEEDBACK_DIR`

Violation: The runtime running the upstream feedback step, or writing to `a-society/feedback/`, without an explicit per-flow operator decision.
