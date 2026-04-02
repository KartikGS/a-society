# A-Society: Programmatic Tooling Layer — Architecture Proposal

**Role:** Technical Architect
**Status:** Awaiting Owner review — not approved for implementation
**Placement note:** This file is placed flat in `a-docs/` pending Owner decision on where Technical Architect work products should live. See Open Question 1.

---

## 1. Automation Boundary Evaluation

### The governing question

An operation is a candidate for automation when: it is fully determined by rules already written in the framework, produces the same correct output regardless of which agent or human runs it, and its value-add is speed and reliability rather than judgment. An operation must remain agent-driven when: correct output depends on understanding context, interpreting ambiguity, weighing trade-offs, or making decisions that the framework deliberately leaves to a reasoning agent.

---

### Candidates for automation

**Initialization scaffolding** — creating the folder structure and empty/stub files for a new project's `a-docs/`

The set of files a fully initialized `a-docs/` contains is defined by the framework's instruction set in `general/`. Given a project name and a confirmed initialization scope, the folder structure and stub files are derivable from those instructions by rule — not by judgment. Currently this work is done by the Initializer agent manually, which introduces inconsistency risk and consumes tokens on mechanical work. Automating it removes both problems.

Boundary: the scaffold creates structure. It does not fill content. The decision of *which* files to include (if initialization scope varies by project type) remains agent-driven until the scope is formally defined.

---

**Consent file creation** — instantiating a consent file from template at the correct path

The template is defined (`$GENERAL_FEEDBACK_CONSENT`), the target path is rule-defined (`a-docs/feedback/[type]/consent.md`), and the feedback types are enumerated. Creation is mechanical: given a project name and feedback type, produce a file at the correct path with the correct boilerplate. The human decision of whether to consent is separate from and not automated by this operation.

Boundary: file creation only. The consent decision itself is made by the human during initialization; the tool captures that decision in the file, it does not make it.

---

**Backward pass order computation** — given a workflow graph, derive the correct backward pass traversal order

The backward pass protocol defines a rule: reverse the first-occurrence order of nodes in the forward pass, with the synthesis role always last. This rule is deterministic. If the workflow is represented in a structured format (see Component 3 below), applying the rule is a computation, not a judgment. Currently agents must derive this order by reading prose workflow documents and reasoning about first occurrences — a process that is error-prone across complex workflows.

Boundary: order computation only. The orderer outputs a sequence; it does not evaluate whether the work at each node was good, whether a node should have fired, or what changes are needed.

---

**Path validation** — checking that every path registered in an index table resolves to an existing file

The index format is defined, the paths are machine-readable, and the check is binary: the file either exists or it does not. This is currently not validated at all — index drift is discovered only when an agent follows a broken path. A validator makes the invariant checkable.

Boundary: existence check only. The validator reports whether paths resolve; it does not evaluate whether files are in the right location or have the right content.

---

**Version comparison** — identifying which framework update reports an adopting project has not yet applied

The version scheme is defined (`$A_SOCIETY_VERSION`, `$INSTRUCTION_A_SOCIETY_VERSION_RECORD`). The update reports are in a named directory (`$A_SOCIETY_UPDATES_DIR`). Given a project's recorded version and the current framework version, the set of unapplied reports is derivable by comparison. Currently this requires an agent to manually compare versions and scan the updates directory — mechanical work with room for error.

Boundary: comparison and list generation only. The tool identifies which reports apply; it does not evaluate their content, decide whether changes are relevant to a specific project, or implement them.

---

### Must remain agent-driven

**Project document drafting** — vision, structure, roles, tooling, index — all require a reasoning agent reading the project, inferring purpose and scope, asking targeted questions, and producing content that fits the specific project. No rule can substitute for this judgment.

**Initialization scope determination** — deciding which `a-docs/` files a project needs (if scope varies) requires understanding the project's nature. The scaffold operates after this decision is made, not before.

**Ambiguity resolution during initialization** — the Initializer must decide what to ask, interpret human answers, and resolve gaps. Deterministic tooling cannot do this.

**Pattern abstraction** — deciding whether something from an adopting project belongs in `general/` requires reasoning about generalizability across project types. This is explicitly the Owner's domain.

**Backward pass quality evaluation** — the orderer computes who reviews what, in what order. Whether the work at each node is actually good — whether a document is accurate, complete, structurally sound — is qualitative judgment that belongs to the reviewing agent.

**Feedback signal interpretation** — reading feedback reports from adopting projects and deciding what framework changes they imply requires reasoning about generalizability, priority, and scope.

**Conflict resolution** — when two documents give conflicting guidance, resolving the conflict requires understanding intent, authority hierarchy, and the specific decision domain.

**Index registration** — adding a new entry to the index requires judgment about the variable name, description, and whether the file belongs in the index at all. Format validation (no duplicate variable names, correct column structure) can be automated; content quality cannot.

---

## 2. Technical Component Designs

### Component 1: Scaffolding System

**What it is:** A tool that creates the folder structure and stub files for a new project's `a-docs/`.

**What it does:**
- Accepts: project root path, project name, and a manifest of artifacts to create
- Creates the directory tree under `[project-root]/a-docs/`
- Creates each file in the manifest as an empty stub or a minimal template instantiation (e.g., filling in project name in the front-matter of a consent file)
- Reports what was created, what already existed (skipped), and what failed

**What it does NOT do:**
- Decide which artifacts to include — the manifest is provided by the Initializer agent after initialization scope is confirmed with the human
- Fill in document content — stubs are empty or minimally templated
- Make any judgment about the project
- Overwrite existing files without explicit confirmation

**Interface with the documentation layer:**
- Reads `general/` to locate and copy templates where applicable
- Writes to the target project's `a-docs/` only
- Does not read or write A-Society's own `a-docs/`

**Dependencies:**
- Stable, enumerated set of what a complete `a-docs/` contains (the manifest schema)
- Stable template files in `general/`
- Consent Utility (Component 2), which it calls to create consent stubs during initialization

**Open dependency:** The manifest schema — the definition of what files a fully initialized `a-docs/` contains — does not exist as a machine-readable artifact today. It is currently described in prose in `general/instructions/`. Before the Scaffolding System can be implemented, this must either be formalized or derived from the instruction set by a defined rule. See Open Question 6.

---

### Component 2: Consent Utility

**What it is:** A utility with two operations — create a consent file from template, and check whether consent has been given.

**What it does:**

*Create operation:*
- Accepts: project `a-docs/` path, feedback type (`onboarding` | `migration` | `curator-signal`), project name, initial consent value (`yes` | `no` | `pending`)
- Renders consent file content programmatically using hardcoded structure consistent with `$GENERAL_FEEDBACK_CONSENT` format, and writes the result to the correct path (`a-docs/feedback/[type]/consent.md`). Does not read the template file at runtime.
- Reports whether the file was created, already existed, or failed

*Check operation:*
- Accepts: project `a-docs/` path, feedback type
- Reads the consent file at the expected path
- Returns: `consented` (yes/no/pending), `file_status` (present/absent), `path_checked`
- Does not modify the file

**What it does NOT do:**
- Make or override the consent decision
- Create consent for a feedback type not in the enumerated list without explicit extension

**Interface with the documentation layer:**
- Does not read `$GENERAL_FEEDBACK_CONSENT` at runtime. The rendered format is maintained in `renderConsentFile()` in the tool source. When `$GENERAL_FEEDBACK_CONSENT` is updated, `renderConsentFile()` must be updated to match — these are treated as a co-maintained pair.
- Reads/writes `a-docs/feedback/[type]/consent.md` in the target project
- Does not touch A-Society's own `a-docs/`

**Dependencies:**
- Stable consent file format (template and expected fields)
- Enumerated list of feedback types
- Format co-maintenance dependency: `$GENERAL_FEEDBACK_CONSENT` and `renderConsentFile()` must be kept in sync manually. A change to the template format is a trigger for a tooling update.

---

### Component 3: Workflow Graph Format

**What it is:** A structured representation format for describing a workflow — its phases, nodes (roles that fire), edges (handoffs), first-occurrence order, and synthesis role designation.

**What it does:**
- Defines a schema for expressing a workflow in a machine-readable format
- Captures: phases, the role at each node, the order in which roles first appear in the forward pass, handoff edges between nodes, and which role is the synthesis role
- Enables Component 4 (Backward Pass Orderer) to compute traversal order without reading prose

**What it does NOT do:**
- Replace prose workflow documents — the structured representation sits alongside prose, not instead of it
- Make any judgment about whether the workflow is correctly designed
- Enforce workflow execution — it is a representation, not a runtime

**Interface with the documentation layer:**
- The storage location of this structured representation (alongside prose, as a separate file, or embedded as structured data) requires Owner decision — this is a documentation layer change if it modifies existing workflow files. See Open Question 4 and the escalation note at the end of this document.
- Tooling components that consume this format (Component 4) read it; they do not write to it. Writing is done by agents when establishing or updating a workflow.

**Schema (draft):**

```
workflow:
  name: [string]
  phases:
    - id: [string]
      name: [string]
  nodes:
    - id: [string]
      role: [string]
      phase: [phase-id]
      first_occurrence_position: [integer, 1-based, derived from phase order]
      is_synthesis_role: [boolean]
  edges:
    - from: [node-id]
      to: [node-id]
      artifact: [string, optional — the artifact produced at handoff]
```

**Note:** `first_occurrence_position` determines backward pass order. The synthesis role fires last in the backward pass regardless of its position value. If multiple nodes share the same role (a role that fires more than once), first occurrence position reflects the first time that role fires.

**Dependencies:**
- Owner decision on storage location (before this can be written for existing A-Society workflows)
- If adopting projects are expected to maintain workflow graphs: a new `general/instructions/workflow/` instruction is required (see Open Question 5)

---

### Component 4: Backward Pass Orderer

**What it is:** A tool that computes the correct backward pass traversal order from a workflow graph and generates session prompts for each step.

**What it does:**
- Accepts: a record folder path (containing `workflow.md`) and the synthesis role name
- Derives forward pass order from `role` entries in the `workflow.md` path
- Reverses to produce backward pass order, placing the provided synthesis role last
- Generates tailored prompts for each step:
  - **Meta-analysis:** follows the three-field handoff format, no preamble, includes a `Read:` reference to `### Meta-Analysis Phase` in `$GENERAL_IMPROVEMENT`
  - **Synthesis:** follows the orientation format (preamble included), includes a `Read:` reference to `### Synthesis Phase` in `$GENERAL_IMPROVEMENT`
- Returns: an array of step objects (`role`, `stepType`, `sessionInstruction`, `prompt`)

**What it does NOT do:**
- Evaluate the quality of work at each node
- Determine whether a node should have fired
- Modify any files
- Substitute for the agent doing the actual backward pass reflection

**Interface with the documentation layer:**
- Reads `workflow.md` from the provided record folder path
- Embeds references to `$GENERAL_IMPROVEMENT` sections in generated prompts
- Writes nothing
- Output is consumed by agents to sequence and execute their backward pass work

**Dependencies:**
- Component 3 (Workflow Graph Format) — `workflow.md` path schema
- Stable backward pass protocol rules in `$GENERAL_IMPROVEMENT` (referenced by prompts)

---

### Component 5: Path Validator

**What it is:** A utility that checks whether paths registered in an index table resolve to existing files.

**What it does:**
- Accepts: path to an index file (public index or internal index)
- Parses the index table (Variable | Path | Description format)
- For each row, checks whether the registered path exists at the filesystem level
- Returns: list of `(variable, path, status)` where status is `ok`, `missing`, or `parse-error`

**What it does NOT do:**
- Evaluate whether a file is in the correct location (only checks existence)
- Create missing files
- Modify the index
- Check file content

**Interface with the documentation layer:**
- Reads index files only
- Writes nothing
- Operates on both the public index (`a-society/index.md`) and the internal index (`a-society/a-docs/indexes/main.md`)

**Dependencies:**
- Stable index table format (current format: markdown table, three columns)

---

### Component 6: Version Comparator

**What it is:** A utility that identifies which A-Society framework update reports an adopting project has not yet applied.

**What it does:**
- Accepts: path to project's `a-docs/a-society-version.md`, path to A-Society's `VERSION.md`, path to `a-society/updates/` directory
- Parses both version files to extract the version stamp
- Identifies applicable update reports from the VERSION.md history table, which records the version stamp and report filename for each published update. Does not scan the `a-society/updates/` directory.
- The `updates-dir` parameter is accepted for interface compatibility and future use; current implementation does not use it.
- Filters to reports whose version stamp is greater than the project's recorded version
- Returns: `(project_version, current_version, unapplied_reports[])` where each report entry includes filename and version stamp

**What it does NOT do:**
- Evaluate whether a report's changes are relevant to the specific project
- Apply any updates
- Modify any files

**Interface with the documentation layer:**
- Reads `a-docs/a-society-version.md` in the target project
- Reads `a-society/VERSION.md` (history table, not just the version stamp)
- Writes nothing

**Dependencies:**
- Stable version file format (defined in `$INSTRUCTION_A_SOCIETY_VERSION_RECORD`) — the comparator must parse this programmatically; format must be stable or versioned
- Stable VERSION.md history table format — the comparator parses the history table to extract report filenames and version stamps; format must remain consistent
- Co-maintenance dependency: VERSION.md history table must be kept current when update reports are published. Reports published to `a-society/updates/` but not recorded in VERSION.md's history table will not be identified by this tool. *(OQ-9 resolved — see `$A_SOCIETY_UPDATES_PROTOCOL` Programmatic Parsing Contract.)*

---

## 3. Tooling Development Workflow Proposal

### Sequencing rationale

Components are sequenced by: (a) dependency order — components that others depend on must come first; (b) independence — components with no dependencies come early to build the harness and validate the approach; (c) risk — changes that touch the documentation layer are deferred until the storage question is resolved.

---

### Phase 1: Foundation primitives

**Components:** Path Validator (5), Version Comparator (6)

**Rationale:** Both are self-contained with no cross-component dependencies and no documentation layer changes required. They can be built and validated independently against current framework files. They also serve as the test harness: if the path validator works correctly, it can be run against all subsequent work to catch regressions.

**Phase output:**
- Working path validator, tested against both indexes
- Working version comparator, tested against current VERSION.md and at least one synthetic update report
- Confirmed: index format and version file format are stable enough for programmatic parsing

**Handoff condition:** Both tools pass against current framework state. No regressions in index or version file format introduced.

---

### Phase 2: Consent Utility

**Component:** Consent Utility (2)

**Rationale:** No cross-component dependencies. Prerequisite for Scaffolding System (Component 1), which calls it during initialization. Also immediately useful standalone — agents can invoke it during initialization before the scaffold is ready. Deferred to Phase 2 (not Phase 1) because it involves writing files to target projects, which adds test complexity beyond read-only validators.

**Phase output:**
- Working consent utility (create and check operations)
- Tested against: create in a temp project directory, check with present/absent/pending states
- Confirmed: consent template format and feedback type enumeration are stable

**Handoff condition:** Both operations produce correct output. Create does not overwrite existing files without confirmation.

---

### Phase 3: Enabling format and backward pass orderer

**Components:** Workflow Graph Format (3), Backward Pass Orderer (4)

**Rationale:** Component 4 depends on Component 3. Together they form a logical unit. Deferred to Phase 3 because Component 3's storage location requires Owner resolution (Open Question 4) before it can be written for existing workflows. The orderer can be designed and tested with synthetic graphs before the storage question is resolved.

**Phase output:**
- Workflow graph format schema, finalized and documented
- Working backward pass orderer, validated against A-Society's own workflow (manually verified against the prose in `$A_SOCIETY_IMPROVEMENT`)
- A-Society's workflow represented in the structured format (once storage location is decided)

**Handoff condition:** Orderer output for A-Society's workflow matches the manually verified order in `$A_SOCIETY_IMPROVEMENT`. Owner has approved the storage location for workflow graphs.

---

### Phase 4: Scaffolding System

**Component:** Scaffolding System (1)

**Rationale:** Most complex component. Depends on stable templates in `general/`, the consent utility (Phase 2), and a resolved manifest schema (Open Question 6). Placed last because it integrates all prior work and because its correctness depends on the framework's template set being stable — premature implementation risks building against a moving target.

**Phase output:**
- Working scaffolding system
- Manifest schema defined (what a complete `a-docs/` contains)
- Tested against: full initialization run in a temp project directory, verified that output matches a manually initialized `a-docs/`

**Handoff condition:** Scaffold produces a correct, complete stub `a-docs/` that passes path validation. Consent stubs are created correctly. No existing files are overwritten.

---

### Phase 5: Integration validation

**What this phase does:**
- Run all components together against a simulated initialization and backward pass scenario
- Validate that component interfaces compose correctly (scaffold calls consent utility; backward pass orderer reads workflow graph)
- Run path validator against all indexes, including any new paths created by tooling work
- Document the invocation model for agents and humans

**Phase output:**
- Integration test record
- Invocation documentation (how agents and humans call each tool)
- Path validator passing against all indexes

---

## 4. Open Questions and Dependencies

Each item is tagged: **who must answer**, **what it blocks**, and **type** (hard blocker / watch item / escalation).

---

**OQ-1: Tooling layer placement in repository**

The architecture document explicitly states the tooling layer placement is not yet defined and that the Technical Architect is responsible for producing the design before any structural decision is made. No component can have a permanent home until this is resolved.

Proposal for Owner consideration: a new top-level folder `tooling/` alongside `general/`, `agents/`, and `a-docs/`. Rationale: tooling is A-Society's third work product layer, distinct from the library (`general/`) and the active agents (`agents/`). It is not internal documentation (`a-docs/`). A dedicated top-level folder reflects that distinction and is consistent with the three-folder precedent: each folder is a categorically different thing.

This is a structural decision that implies a change to the stated architecture — **escalated to Owner for direction decision**.

**Who:** Owner + human
**Blocks:** All component implementations
**Type:** Hard blocker for implementation; escalation required before any directory is created

---

**OQ-2: Language and runtime**

What language or runtime will the tooling be implemented in? The choice affects: whether non-technical adopters can run tools without technical setup, how agents invoke tools, and what the dependency footprint is for adopting projects.

Candidates to consider: shell scripts (zero-dependency, but limited structure), Python (widely available, good for parsing), Node.js (JavaScript ecosystem). No recommendation is made here — this is a human decision about the distribution model.

**Who:** Human (primary), Owner (for framework compatibility implications)
**Blocks:** All component implementations
**Type:** Hard blocker for implementation; watch item for design

---

**OQ-3: Invocation model**

Are tools invoked by agents, by humans, or both? This determines interface design for all components.

If agent-invoked: output must be structured (machine-parseable) so agents can consume and act on results without text interpretation.
If human-invoked: output can be human-readable prose with color and formatting.
If both: dual output modes, or a structured core with a human-readable wrapper.

The stated goal — reliability for non-technical adopters — suggests that at minimum, agents should be able to invoke tools and report results to humans in natural language. Whether humans also invoke tools directly is a separate decision.

**Who:** Owner + human
**Blocks:** All component interface designs
**Type:** Hard blocker for interface design

---

**OQ-4: Workflow graph format — storage location** *(Escalation to Owner)*

The workflow graph format (Component 3) requires that each workflow's structured representation be stored somewhere. Three options, each with documentation layer implications:

*Option A: Separate file alongside prose workflow docs* — e.g., `a-docs/workflow/graph.yaml` alongside `a-docs/workflow/main.md`. Clean separation; prose remains untouched. Creates a new file type that must be kept in sync with the prose.

*Option B: Embedded structured data in prose files* — e.g., YAML frontmatter in `a-docs/workflow/main.md`. Single source; no sync problem. Requires modifying existing workflow documents — a documentation layer change.

*Option C: Derived at runtime* — the orderer parses prose workflow docs using an agent step to produce the graph on demand. No new file type; no documentation layer change. But this reintroduces agent judgment into a supposedly deterministic computation and may not be reliable.

**Any option that modifies existing workflow documents is a documentation layer change driven by a tooling requirement. My role explicitly prohibits deciding this unilaterally — escalated to Owner.**

**Who:** Owner
**Blocks:** Component 3 design finalization, Component 4 implementation
**Type:** Escalation — cannot proceed without Owner decision

---

**OQ-5: New general/ instruction for workflow graph format**

If adopting projects are expected to maintain their own workflow graphs (not just A-Society using this internally), a new instruction document is needed in `general/instructions/workflow/` explaining how to create and maintain a workflow graph representation.

This is an addition to `general/` and must follow the standard proposal flow — it cannot be added by the Technical Architect unilaterally.

If the tooling layer is intended only for A-Society's own use (not distributed to adopting projects), this question is moot.

**Who:** Owner (must determine scope: A-Society-only vs. distributed to adopters)
**Blocks:** Component 3 completion for adopting projects; `general/` addition proposal
**Type:** Escalation — scope decision required

---

**OQ-6: Scaffolding manifest schema**

The Scaffolding System needs a manifest: a machine-readable definition of what files a complete `a-docs/` contains. This manifest does not currently exist as a formal artifact — it is implied by the set of instruction documents in `general/instructions/`.

Options:
*Option A: Derive from instruction set* — the manifest is computed from the instruction set at tool runtime. Stays in sync automatically; but requires parsing instruction documents, which may be brittle.
*Option B: Explicit manifest file* — a formal artifact (e.g., `general/manifest.yaml`) that enumerates all `a-docs/` artifacts. Must be maintained when new instruction types are added. Single source of truth; machine-readable by design.
*Option C: Configurable per project* — the Initializer agent produces a project-specific manifest during initialization, and the scaffold executes it. Clean separation of judgment (agent) and execution (scaffold). Most flexible; least reusable across projects automatically.

Recommendation for Owner consideration: Option C. It preserves the Initializer's role as the judgment layer and makes the scaffold a pure executor — consistent with the boundary principle.

**Who:** Technical Architect to propose, Owner to approve
**Blocks:** Component 1 design finalization
**Type:** Watch item (does not block Phase 1–3; must be resolved before Phase 4)

---

**OQ-7: Tooling-generated output and the consent model**

If a tool produces output that could constitute signal (e.g., a scaffold run record showing what files were created, a path validation report showing which paths failed), does that output require a consent model per Principle 2?

Assessment: local operation output that stays in the invoking agent's session or is written to the project's own `a-docs/` is not feedback signal in the consent model sense — it is not data flowing to A-Society. However, if any tool is designed to write reports to `a-society/feedback/`, the consent requirement applies in full.

Provisional ruling: tools in Phases 1–3 produce output consumed locally. No consent mechanism required. Any future tool designed to write to `a-society/feedback/` must define its consent type before shipping — consistent with Principle 2.

**Who:** Owner to confirm this interpretation
**Blocks:** Any component that could write to `a-society/feedback/`
**Type:** Watch item — confirmation needed before any feedback-writing tool is designed

---

**OQ-8: Non-technical adopter access model** *(Escalation to Owner)*

The stated goal for this tooling layer includes "reliability for non-technical adopters who cannot easily verify agent correctness." This implies that non-technical users must be able to benefit from tooling without technical setup.

If tools are invoked only by agents (agents call the tool, report results to the human in natural language), non-technical adopters never interact with tooling directly — they interact with agents, as they do now. This is compatible with any implementation language.

If tools are invoked by humans directly, non-technical adopters face a setup problem: installing a runtime, running CLI commands, interpreting output. This may defeat the stated goal.

**This is a direction question: it determines whether tooling is an agent capability or a human-facing product.** The answer constrains implementation language, distribution model, and interface design for all components. It cannot be decided by the Technical Architect.

**Who:** Human (strategic intent)
**Blocks:** Distribution design, interface design for all components
**Type:** Escalation — direction decision required

---

**OQ-9: Update report naming convention for programmatic parsing**

The Version Comparator (Component 6) needs to parse update report filenames to extract version stamps. The current updates directory (`$A_SOCIETY_UPDATES_DIR`) has update reports but no explicit machine-parseable naming convention documented for programmatic consumption.

The comparator needs to know: what is the filename format, and how is the version stamp embedded in it? If the naming convention changes, the comparator breaks.

Before implementing Component 6, the naming convention must be confirmed as stable and documented as a parsing contract.

**Who:** Owner (to confirm/define naming convention as a stable contract)
**Blocks:** Component 6 implementation
**Type:** Watch item (does not block Phases 1–3)

---

**OQ-10: Backward pass orderer scope — A-Society only, or distributed**

Should the Backward Pass Orderer be available to adopting projects for their own workflows, or is it scoped to A-Society's internal use only?

If A-Society only: Component 3 format and Component 4 need only represent A-Society's workflow. Simpler scope; faster to implement.

If distributed to adopters: adopting projects must create and maintain workflow graphs. A `general/instructions/workflow/` entry is required (OQ-5). The format must be domain-agnostic (consistent with `general/` portability constraint). Higher complexity; higher value for adopters with complex multi-role workflows.

This is a scope decision about what the tooling layer delivers to adopters versus what it delivers to A-Society's own operations.

**Who:** Owner
**Blocks:** Component 3 and 4 scope definition
**Type:** Watch item (does not block Phases 1–2; must be resolved before Phase 3)

---

## Summary of escalations requiring Owner direction before design can proceed

| # | Question | Blocks |
|---|---|---|
| OQ-1 | Where does the tooling layer live in the repository? | All component implementations |
| OQ-4 | Where is the workflow graph format stored? (Any answer that modifies existing docs requires Owner approval) | Component 3 finalization, Component 4 |
| OQ-8 | Is tooling an agent capability or a human-facing product? | All interface and distribution design |

These three are hard blockers for the work they gate. The remaining seven are watch items that can be resolved during or before the phases that depend on them.

---

*This proposal is ready for Owner review. No implementation has begun.*
