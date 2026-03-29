# A-Society: Agent-Docs Guide

This document explains why each file and folder in `a-society/`'s agent-docs exists — its purpose, what it is responsible for, and what would break if it were removed or consolidated with something else. It is written for the Curator: the agent responsible for maintaining these files.

This is not a directory listing. It is a rationale document. Read it before maintaining any file in this project.

---

## Project-Level Files

### `agents.md` — `$A_SOCIETY_AGENTS`

**Why it exists:** Every agent working on A-Society reads this first. It is the single entry point that orients any agent to the project — what the project is, what roles exist, what documents to read and in what order, and what invariants govern all work here.

**What it owns:** Role registration (the roles table), required reading sequence, context confirmation protocol, authority hierarchy for conflict resolution, and project-wide invariants.

**What breaks without it:** Agents have no reliable starting point. Role existence is undiscoverable. Reading order is undefined.

**Do not consolidate with:** The vision (which explains what the project is, not how to operate within it), or any role file (which governs a specific role, not all agents).

---

### `a-docs-guide.md` — `$A_SOCIETY_AGENT_DOCS_GUIDE`

**Why it exists:** The Curator cannot maintain files it does not understand. This document ensures the Curator knows not just where files are (that is the index's job) but *why each file exists* — so it can maintain them correctly, avoid consolidating things that must stay separate, and recognize when a file's purpose has drifted.

**What it owns:** Rationale for every significant file and folder in this project's agent-docs.

**Do not consolidate with:** `project-information/structure.md` (structure explains folder placement rules; this explains file purpose) or `agents.md` (agents.md is the entry point for all agents; this is deep context for the Curator specifically).

---

## `indexes/`

### `indexes/main.md` — `$A_SOCIETY_INDEX`

**Why it exists:** File paths change. When they do, every document that hardcodes a path breaks. The index is the single source of truth for file locations — all references to key files use `$VARIABLE_NAME` which resolves here. To move a file, update one row.

**What it owns:** The variable-to-path mapping for every key file in the project. Any file referenced by other documents should be registered here.

**What breaks without it:** `$VAR` references in other documents become unresolvable. File moves require hunting down every reference across the entire project.

**Do not consolidate with:** `agents.md` — the index is a lookup table; agents.md is an orientation document. Merging them would make agents.md too long and the index harder to scan.

---

## `project-information/`

### `project-information/vision.md` — `$A_SOCIETY_VISION`

**Why it exists:** Every scope and direction dispute traces back to the vision. It is the reference document for "does this addition belong in A-Society?" and "is this general enough for `general/`?" The core bet lives here.

**What it owns:** What A-Society is, the problem it solves, the core bet, what "agentic-friendly" means, and direction for agents extending the framework.

**What breaks without it:** Scope disputes cannot be resolved by reference. Agents must guess at the boundaries of the framework. Additions accumulate without a shared standard for what belongs.

**Do not consolidate with:** `structure.md` — vision answers "what is this and why?" and structure answers "where does content go?" These are distinct questions with distinct answers.

---

### `project-information/structure.md` — `$A_SOCIETY_STRUCTURE`

**Why it exists:** Every time new content is created, someone must decide which folder it belongs in. This document makes that decision explicit and principled — not a matter of preference or guesswork.

**What it owns:** The purpose and governing principle of each folder in `a-society/`, what belongs in each folder, what does not, and how the structure grows.

**What breaks without it:** Agents place content based on instinct or analogy. The folder structure drifts from its intended design. Related content ends up scattered.

**Do not consolidate with:** `vision.md` — structure is operational (governs placement decisions); vision is strategic (governs scope decisions).

---

### `project-information/principles.md` — `$A_SOCIETY_PRINCIPLES`

**Why it exists:** When an agent proposes a new feature, reviews an addition, or designs a feedback mechanism, it needs to know what A-Society values beyond vision and structure. The principles document captures design-level constraints — context efficiency, consent requirements, feedback as a design requirement, and structural scope discipline — that shape how the framework is extended. Without it, agents apply generic engineering judgment where project-specific policy exists.

**What it owns:** The named design principles that govern how A-Society itself is extended: what to check before proposing a feature, what consent obligations exist for feedback mechanisms, and what structural commitments a new folder implies.

**What breaks without it:** Agents propose features that waste context budget, ship feedback mechanisms without consent models, or create folders that imply maintenance commitments nobody agreed to. These are principled constraints that cannot be derived from vision or structure alone.

**Do not consolidate with:** `vision.md` — the vision defines what A-Society is and its scope; principles define how to make design decisions within that scope. Do not consolidate with `architecture.md` — architecture defines structural invariants (what must never be violated); principles define design values (what should guide choices when multiple valid options exist).

---

### `project-information/log.md` — `$A_SOCIETY_LOG`

**Why it exists:** Without a project log, the Owner must reconstruct current state at every session start by scanning record folders and backward pass findings. The log surfaces current status, recently completed flows, and ordered next priorities in one read. It is the answer to "where did we leave off?" and "what should I work on next?"

**What it owns:** Current project status label, the rolling window of completed flows (one Recent Focus, up to three Previous), the ordered next priorities list with scope tags and source references, and a pointer to the companion archive file.

**What breaks without it:** The Owner reconstructs state from scattered artifacts every session — slow, error-prone, and inconsistent. Next priorities buried in backward pass findings are easy to miss or re-discover as new.

**Who reads it:** The Owner loads it at every session start. The Curator loads it at the start of maintenance sessions. Not universal required reading for all roles.

**Do not consolidate with:** `project-information/vision.md` — the vision describes what A-Society is and its strategic direction; the log describes current execution state and next concrete steps. Do not consolidate with `a-docs/records/` — records contain the full artifact history of completed flows; the log is a current-state summary for orientation.

---

### `project-information/log-archive.md` — `$A_SOCIETY_LOG_ARCHIVE`

**Why it exists:** The main log is bounded — one Recent Focus, up to three Previous. As flows accumulate, older entries must have a permanent home that is not the main log. Without a companion archive file, the main log grows without bound and eventually exceeds agent read limits. The archive file is not loaded at orientation; it is consulted only when historical traceability is needed.

**What it owns:** All closed flow entries older than the rolling window, in one-liner format: `[scope-tags] — **slug** (YYYY-MM-DD): one sentence`. Most recent at top. Entries are immutable once written.

**What breaks without it:** Archived entries either accumulate in the main log (making it too long to read) or are discarded (losing historical traceability).

**Do not consolidate with:** `project-information/log.md` — the main log is a current-state summary loaded at every session; the archive is historical storage not loaded at orientation.

---

## `roles/`

### `roles/owner.md` — `$A_SOCIETY_OWNER_ROLE`

**Why it exists:** The Owner role has authority boundaries, review criteria, and escalation triggers specific to A-Society — in particular the generalizability test, abstraction level test, and duplication test that govern what enters `general/`. A generic template would not capture these.

**What it owns:** The A-Society Owner's authority, what they own and do not own, how they review contributions to the framework, and when they escalate.

**What breaks without it:** An Owner agent has no specific behavioral contract. They either over-reach (making framework changes beyond their authority) or under-reach (asking the human for every small decision).

**Do not consolidate with:** `general/roles/owner.md` — the general template is for any project; this file is A-Society's specific instantiation with A-Society-specific review tests.

---

### `roles/curator.md` — `$A_SOCIETY_CURATOR_ROLE`

**Why it exists:** The Curator role has hard rules and escalation triggers specific to A-Society's maintenance needs — in particular the prohibition on writing to `general/` without Owner approval, the requirement to use `$VAR` references, and the distillation protocol for proposing patterns from observed projects.

**What it owns:** The A-Society Curator's maintenance scope, hard rules, pattern distillation process, current active work, and escalation triggers.

**What breaks without it:** A Curator agent has no specific behavioral contract. They may write directly to `general/` without approval, hardcode paths, or perform migration work without understanding the framework's boundaries.

**Do not consolidate with:** `general/roles/curator.md` — same reasoning as above. The general template is the pattern; this is the A-Society-specific instantiation.

---

### `roles/technical-architect.md` — `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`

**Why it exists:** The Technical Architect role has a narrow, pre-implementation mandate that is not covered by Owner or Curator: producing the automation boundary evaluation, component designs, and open question surfaces that must exist before any programmatic tooling is built. Without a dedicated role file, this work either collapses into the Owner (adding implementation-planning scope that the Owner does not own) or proceeds without a behavioral contract, risking implementation before design is verified.

**What it owns:** The Technical Architect's authority, hard rules, primary work output definition, context loading, and escalation triggers for the programmatic tooling layer design phase.

**What breaks without it:** A Technical Architect agent has no behavioral contract. The boundary between design and implementation is undefined. Proposals may bypass Owner review. Direction decisions may be absorbed into technical decisions without escalation.

**Do not consolidate with:** `roles/owner.md` — the Owner reviews and approves technical proposals; they do not produce them. Do not consolidate with `roles/curator.md` — the Curator maintains existing documentation; the Technical Architect designs new technical infrastructure that does not yet exist.

---

### `roles/tooling-developer.md` — `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`

**Why it exists:** The Tooling Developer role has a narrow implementation mandate: executing the six approved tooling components in Node.js, within `tooling/` only, with blocking escalation for any deviation from the approved spec. Without a dedicated role file, implementation either collapses into the Curator (who owns documentation, not Node.js code) or proceeds without a behavioral contract — risking scope creep, unapproved workarounds, and components that diverge from the TA's approved designs.

**What it owns:** The Developer's authority (implementation choices, Node.js project initialization), hard rules (no implementation without Phase 0 cleared, no writes outside `tooling/`, no workarounds without TA resolution), minimal context loading (five documents only), and escalation triggers (design deviation, scope ambiguity, documentation gap, Phase 0 incomplete).

**What breaks without it:** A Tooling Developer agent has no behavioral contract. The boundary between implementation and design is undefined. Deviations from the approved spec may be absorbed into implementation decisions without escalation. The Phase 0 gate — which requires this file to be indexed before any Developer session opens — cannot be satisfied.

**Do not consolidate with:** `roles/technical-architect.md` — the TA scopes and designs; the Developer implements. Do not consolidate with `roles/curator.md` — the Curator maintains a-docs; the Developer writes Node.js code in `tooling/`. These are different layers with different authority boundaries.

---

### `roles/runtime-developer.md` — `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`

**Why it exists:** The Runtime Developer has a specialized implementation mandate for the programmatic runtime layer, distinct from the deterministic tooling components. Without this, runtime implementation merges with the Tooling Developer, blurring the clear boundary between A-Society's utility layer and its session orchestration capabilities.

**What it owns:** The Developer's execution authority over the runtime layer, hard rules, context loading requirements, and escalation paths.

**What breaks without it:** No defined behavioral contract for implementing A-Society's runtime layer.

---

## `thinking/`

### `thinking/` — folder

**Why it exists:** Every agent working on a project needs a behavioral foundation layer — principles, reasoning heuristics, and hard stops — that apply regardless of role or task. Without a dedicated folder, these rules either bloat `agents.md`, scatter into role files (where they are re-stated inconsistently), or are missing entirely. The thinking folder gives each of the three documents a single, maintainable home.

**What it owns:** Three files: `main.md` (cross-role operational principles), `reasoning.md` (cognitive framework for how agents reason through problems), and `keep-in-mind.md` (hard stops and operational reminders every agent must carry). All three are universal — loaded by every agent regardless of role.

**What breaks without it:** Agents fall back on instinct for reasoning and principles. Drift appears across sessions. Reasoning errors repeat rather than being corrected by reference. The Universal Standards section of `agents.md` either becomes unwieldy or is omitted.

**Do not consolidate with:** `agents.md` — that file is the orientation entry point; thinking/ is the substance of the universal standards it references. Do not consolidate with role files — thinking/ documents apply to every agent; role files apply to one role. Do not consolidate the three sub-documents: each answers a distinct question (principles, reasoning, reminders), and merging them reduces individual clarity and maintainability.

---

## `workflow/`

### `workflow/main.md` — `$A_SOCIETY_WORKFLOW`

**Why it exists:** A-Society maintains several permanent execution workflows (framework development, tooling development, runtime development), each with distinct phase sequences and role compositions. Without a routing index, agents arriving at the workflow folder must read every workflow file to determine which governs their current work. The index gives every agent a single load point: load it, identify the relevant workflow or multi-domain pattern, then load that file.

**What it owns:** The workflow routing directory — one entry per permanent A-Society workflow (name, one-line summary, file reference), the **Multi-domain pattern** pointer to `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`, and the universal session routing rules that apply across all A-Society workflows.

**What breaks without it:** Agents have no single entry point to the workflow directory. The session routing rules — which role files reference via `$A_SOCIETY_WORKFLOW` — have no home. Each workflow would need to duplicate these rules, violating the Single-Source Invariant.

**Do not consolidate with:** `workflow/framework-development.md`, `workflow/tooling-development.md`, or `workflow/runtime-development.md` — those files contain the full workflow definitions; this file is the routing layer above them. Do not embed phase definitions, handoffs, or invariants here — those belong in the specific workflow files.

---

### `workflow/multi-domain-development.md` — `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`

**Why it exists:** Cross-cutting work often touches framework documentation, tooling, and runtime in one feature thread. The permanent workflows each describe a single-layer cadence; they do not by themselves explain how to stitch layers into one flow with parallel tracks. This pattern document fills that gap so Owner, TA, Tooling Developer, Runtime Developer, and Curator agents share one map.

**What it owns:** When to use the pattern, how it composes (not replaces) the permanent workflows, a typical role map, parallel-track and Curator/`general/` checkpoint behavior, session routing references, and record-folder `workflow.md` expectations — plus an illustrative YAML subgraph.

**What breaks without it:** Agents infer multi-domain routing from the routing index bullet alone; integration handoffs and approval loops for `general/` are under-specified for complex flows.

**Do not consolidate with:** `workflow/main.md` — the routing index must stay lightweight. Do not consolidate with `workflow/framework-development.md` — that file owns the single-layer framework loop; this file owns cross-layer composition.

---

### `workflow/framework-development.md` — `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`

**Why it exists:** A-Society's primary ongoing work is framework development: growing, maintaining, and quality-gating the reusable instruction library. This workflow governs that cadence — the Proposal → Review → Implementation → Registration loop that every library addition or a-docs change passes through. Extracting it from the routing index into its own file allows agents working on framework development to load only the workflow they need without reading tooling workflow material.

**What it owns:** The complete framework development workflow — the YAML graph (five nodes: Owner intake, Curator proposal, Owner review, Curator implementation/registration, Owner closure), all phases (0–5), handoffs table, session model, invariants (Portability, Approval, Single-Source, Index-Before-Reference), and escalation rules.

**What breaks without it:** The framework development workflow has no dedicated home. Agents cannot load only the framework workflow without also loading tooling workflow content. The Approval Invariant — the core constraint that prevents the Curator from writing to `general/` without Owner approval — is not discoverable except through role files.

**Do not consolidate with:** `workflow/main.md` (the routing index) — that file routes agents to workflows; this file defines one. Do not consolidate with `workflow/tooling-development.md` — the two workflows have different phase sequences, different role compositions, and serve different operational cadences; merging them would force every agent to read irrelevant workflow material.

---

### `workflow/tooling-development.md` — `$A_SOCIETY_WORKFLOW_TOOLING_DEV`

**Why it exists:** A-Society's programmatic tooling layer has its own implementation workflow — multi-phase, multi-role, with a Tooling Developer session, TA advisory reviews, and phase-gated documentation prerequisites. This workflow is structurally different from the framework development workflow (more phases, more roles, concurrent phase tracks, three standing sessions). Defining it in its own file keeps the framework development workflow clean and gives tooling-related sessions a dedicated, unambiguous workflow reference.

**What it owns:** The complete tooling development workflow — the YAML graph (ten nodes across four roles), role definitions for this workflow (Tooling Developer, Technical Architect, Curator, Owner), all phases (0–8 including Phase 1A), session model (Sessions A, B, C, plus on-demand TA sessions), and the phase dependency diagram.

**What breaks without it:** The tooling implementation workflow has no dedicated home. Role files for the Tooling Developer and Technical Architect reference `$A_SOCIETY_WORKFLOW_TOOLING_DEV` for session routing; without this file, those references are unresolvable. Component 4 (Backward Pass Orderer) cannot be correctly invoked for tooling flows without the YAML graph.

**Do not consolidate with:** `workflow/framework-development.md` — same reasoning as above; different cadence, different role set. Do not consolidate with `a-docs/tooling/architecture-addendum.md` — that file retains structural constraints and the post-Phase-6 addition protocol; this file owns the executable workflow (phases, roles, session routing).

---

### `workflow/runtime-development.md` — `$A_SOCIETY_WORKFLOW_RUNTIME_DEV`

**Why it exists:** Provides the structural process specifically for designing and building A-Society's runtime layer, enforcing a strict Phase 0 design gate that distinguishes it from general tooling components.

**What it owns:** The workflow graph, Phase 0 design requirements, integration and registration phases, and session orchestration rules for runtime development.

**What breaks without it:** The runtime layer would either be developed monolithically without review gates or improperly forced into a Tooling sub-process that wasn't scoped for stateful orchestration implementations.

---

## `improvement/`

### `improvement/main.md` — `$A_SOCIETY_IMPROVEMENT`

**Why it exists:** Improvement decisions require both principled reasoning (when to split a file, when to add a protocol, when to cross-reference) and a standardized backward pass protocol (who produces findings, in what order, how findings route to action). Without a single dedicated file, improvement philosophy gets buried in role files, backward passes are ad-hoc, and each cycle reinvents the process.

**What it owns:** The five improvement principles, the decision framework for applying them during meta-synthesis, the backward pass traversal algorithm, and the protocol for producing and routing findings.

**What breaks without it:** Improvement sessions reinvent principles each time. Backward passes lack a standard structure. Findings are lost or misrouted instead of flowing through the correct approval path.

**Do not consolidate with:** `agents.md` or role files — this document is improvement infrastructure; the others are execution infrastructure.

---

## `communication/`

### `communication/main.md` — `$A_SOCIETY_COMM`

**Why it exists:** Roles and workflow phases define what happens and who owns it. The communication folder defines how agents interact — what artifacts they exchange, in what format, under what rules. Without it, agents invent their own handoff formats and apply inconsistent coordination rules across sessions.

**What it owns:** Entry point orienting the Curator and Owner to the two sub-layers (conversation and coordination) and explaining which layer to consult for which question.

**What breaks without it:** The communication folder has no navigable entry point. Agents must scan the sub-folders to understand the structure.

**Do not consolidate with:** `workflow/main.md` — the workflow document describes phase sequencing; this folder describes the communication rules within and between those phases.

---

### `communication/conversation/` — `$A_SOCIETY_COMM_CONVERSATION`

**Why it exists:** Every proposal the Curator submits and every decision the Owner issues follows a defined format. Without templates, handoff formats vary by session. The conversation folder is the stable home for those templates.

**What it owns:** The permanent templates for each artifact type (workflow plan, briefing, proposal, decision). Artifacts themselves are created in the active record folder (see `$A_SOCIETY_RECORDS`), not here.

**What breaks without it:** Agents writing handoffs have no canonical format reference. Templates become scattered or are recreated inconsistently.

**Do not consolidate with:** `communication/coordination/` — conversation is about artifact formats; coordination is about the rules governing those artifacts. Do not consolidate with `records/` — records hold the produced artifacts; this folder holds the templates they are produced from.

---

### `communication/coordination/` — `$A_SOCIETY_COMM_COORDINATION`

**Why it exists:** The standing rules of inter-agent communication must be declared and stable. Without a coordination layer, each session re-negotiates what counts as an approved handoff, what to do when something goes wrong, and who has authority to resolve disagreements.

**What it owns:** The status vocabulary (shared across all artifacts), the handoff protocol, the feedback protocol (what to do when a discrepancy is discovered), and the conflict-resolution procedure.

**What breaks without it:** Agents apply different status tokens, have no shared procedure for reporting blockers, and escalate conflicts inconsistently. The coordination failures that emerge look like execution failures but are actually structural gaps.

**Do not consolidate the three sub-documents:** Each answers a distinct question — handoff format, discrepancy response, and dispute resolution. Merging them makes the relevant rule harder to find under pressure.

---

## `records/`

### `records/main.md` — `$A_SOCIETY_RECORDS`

**Why it exists:** Every workflow traversal produces multiple artifacts: a briefing, a proposal, a decision, and backward pass findings. Without a dedicated structure, these artifacts either scatter across folders or overwrite each other between flows. The records structure ties all artifacts for one flow into one folder, in chronological sequence. The record folder name *is* the flow identifier — no separate `<task-id>` field is needed anywhere.

**What it owns:** A-Society's records convention: the identifier format (`YYYYMMDD-slug`), the canonical artifact sequence within a record folder, the sequencing prefix convention (`01-`, `02-`, ...), and the rule for what belongs in a record versus what does not.

**What breaks without it:** Agents creating flow artifacts have no canonical convention for naming or locating them. The record folder identifier is undefined. Flow artifacts scatter or overwrite between flows.

**Do not consolidate with:** `workflow/main.md` — the workflow describes phase sequencing; records describes artifact storage within a flow. Do not consolidate with `communication/conversation/main.md` — the conversation folder holds templates; records holds the artifacts produced from those templates.

---

## `updates/`

### `updates/protocol.md` — `$A_SOCIETY_UPDATES_PROTOCOL`

**Why it exists:** When A-Society changes `general/` or `agents/` in ways that affect adopting projects, those projects need to know what changed, why, and what to do. Without a protocol, the decision of when to publish and what to include is made ad-hoc each time — producing inconsistent reports that adopting project Curators cannot reliably act on.

**What it owns:** The trigger conditions for publishing a framework update report, the impact classification model (Breaking / Recommended / Optional), the production and approval process, the naming convention for report files, and the delivery problem statement.

**What breaks without it:** The Curator has no principled basis for deciding when to publish. Reports vary in structure and completeness. Adopting project Curators cannot triage changes reliably.

**Do not consolidate with:** `improvement/protocol.md` — the improvement protocol governs internal A-Society reflection; the update report protocol governs outbound communication to the ecosystem. Different audiences, different purposes.

---

### `updates/template.md` — `$A_SOCIETY_UPDATES_TEMPLATE`

**Why it exists:** Adopting project Curators read update reports to decide what to change in their own `a-docs/`. A consistent template ensures every report contains what a Curator needs: a summary, an impact classification table, per-change entries with migration guidance, and a delivery note.

**What it owns:** The canonical structure for a framework update report — sections, fields, and format expectations.

**What breaks without it:** Reports are written free-form. Consuming Curators must infer structure. Migration guidance is inconsistently provided. The impact classification model is applied inconsistently.

**Do not consolidate with:** `updates/protocol.md` — the protocol governs when and how to produce reports; the template is the artifact the report fills. Process document vs. format document.

---

## `tooling/`

These files live in `a-docs/tooling/`. They are the design, specification, assessment, and coupling governance artifacts for A-Society's programmatic tooling layer.

### `tooling/main.md` — `$A_SOCIETY_TOOLING`

**Why it exists:** The tooling folder contains four related documents — component spec, implementation workflow, coupling map, and TA deviation assessment — that together govern A-Society's programmatic tooling layer. Without an entry point, agents must open all four documents to determine which is relevant to their task. The main.md lists each document, its purpose, and who reads it.

**What it owns:** Orientation to the tooling subfolder — one-paragraph description of each document and its intended reader(s).

**What breaks without it:** The tooling folder has no navigable entry point. Agents must scan all four documents to understand which to consult.

**Do not consolidate with:** Any of the four tooling documents — each answers a distinct question (what to build, how to build it, format dependencies, deviation rulings). The main.md is an orientation layer, not a summary of those documents.

---

### `tooling/general-coupling-map.md` — `$A_SOCIETY_TOOLING_COUPLING_MAP`

**Why it exists:** The tooling components depend on `general/` formats — if a format changes, a component breaks. Conversely, when a tool is built, a `general/` instruction should direct agents to invoke it. Without a standing reference for these two dependency types, both can drift silently: format changes break tools without warning, and tools go unused because no instruction points agents to them.

**What it owns:** Two tables — the format dependency table (which `general/` elements each component parses) and the invocation status table (whether each component has a `general/` instruction directing agents to invoke it, and whether that gap is Open or Closed). Also a change taxonomy (Types A–F) defining which change types require this document to be updated.

**Who uses it:** The Owner checks the format dependency table at Phase 2 (Coupling Test) before approving any `general/` proposal. The TA checks the invocation gap column when reviewing tooling deviations. The Curator updates it at Phase 7 (Registration) after any Type A–F change.

**What breaks without it:** Format changes are approved without scoping the tooling update — tools break after `general/` changes. Invocation gaps accumulate invisibly — tools exist but no agent knows to use them. The Coupling Test and Manifest Check in Phase 2 have no reference to check against.

**Do not consolidate with:** `tooling/architecture-proposal.md` — the proposal is the component spec; this document is the coupling state. Do not consolidate with `tooling/architecture-addendum.md` — the addendum is the implementation workflow; this document is a standing operational reference updated after each cross-layer change.

---

### `tooling/architecture-proposal.md` — `$A_SOCIETY_TOOLING_PROPOSAL`

**Why it exists:** The Tooling Developer's primary authority for implementation decisions. The proposal contains the automation boundary evaluation, all six component designs (interfaces, data flow, open questions resolved), and the co-maintenance dependency declarations added after Phase 1-2. Without it, the Developer has no binding specification — implementation would proceed from memory or inference, producing components that diverge from what the Owner approved.

**What it owns:** The definitive record of what each component does, what its interface is, what it depends on, and what was ruled in or out of automation scope. Any post-implementation spec update (accepted deviations) is recorded here; the proposal is the living spec, not a snapshot.

**What breaks without it:** The Developer has no authoritative design reference. Components may be implemented inconsistently or revised without a documented basis. Deviations from this document are the trigger for TA escalation — without the document, there is nothing to deviate from.

**Do not consolidate with:** `tooling/architecture-addendum.md` — the proposal is the WHAT (component designs); the addendum is the WHO/WHEN (phases, roles, session routing). Do not consolidate with `tooling/ta-assessment-phase1-2.md` — the assessment records deviation rulings; the proposal records the authoritative spec.

---

### `tooling/architecture-addendum.md` — `$A_SOCIETY_TOOLING_ADDENDUM`

**Why it exists:** The proposal defines the components. The addendum complements it with the structural constraints, dependency rules, and post-Phase-6 addition protocol that govern the tooling layer's ongoing maintenance. These are architectural and governance rules — distinct from the executable workflow phases, which live in `$A_SOCIETY_WORKFLOW_TOOLING_DEV`.

**What it owns:** Section 3 (Constraints and Dependencies) — the hard rules governing role boundaries (TA does not implement, Developer writes to `tooling/` only), the four inherited workflow invariants, and the open dependency on the update report discovery problem. Section 4 (Post-Phase-6 Component Additions) — the Phase 0 gate conditions for adding new components after the original launch, the TA advisory mode definition for new components, and the phase numbering convention.

**What breaks without it:** The structural constraints — particularly the Phase 3 gate before Phase 4 and the deviation escalation rule — have no documented home. The protocol for adding post-Phase-6 components is undefined. Future Technical Architects and Developers working on new components have no governance reference.

**Do not consolidate with:** `tooling/architecture-proposal.md` — the proposal is the component spec; the addendum is the governance and constraints layer. Do not consolidate with `$A_SOCIETY_WORKFLOW_TOOLING_DEV` — that document owns the executable workflow (phases, roles, session routing); this document owns the structural constraints that govern the build process regardless of phase.

---

### `tooling/ta-assessment-phase1-2.md` — `$A_SOCIETY_TA_ASSESSMENT_PHASE1_2`

**Why it exists:** During Phases 1 and 2, the Developer identified two implementation deviations from the approved spec and escalated to the Technical Architect per the deviation protocol. The TA's formal rulings on those deviations — and the required spec updates — are recorded here. This creates a traceable audit trail: deviation → ruling → spec update → implementation.

**What it owns:** The description of each Phase 1-2 deviation, the TA's ruling (both ruled "Accept with spec update"), and the required change to `$A_SOCIETY_TOOLING_PROPOSAL` for each deviation.

**What breaks without it:** The basis for the post-Phase 2 spec updates to the proposal is undiscoverable. The ruling that accepted hardcoded rendering in Component 2 and the VERSION.md history table approach in Component 6 cannot be verified. Future agents maintaining the tooling layer cannot trace why those two components diverge from an implementation-neutral reading of the spec.

**Do not consolidate with:** `tooling/architecture-proposal.md` — the proposal is the authoritative spec; the assessment records the process by which the spec was revised. Merging them would obscure the deviation-ruling-update chain.

---

## `general/`

### `general/instructions/` — folder

**Why it exists:** This is the instruction library. Each file answers "how do you create [X] for a new project?" Instructions are separated from the artifacts they describe. A project that uses A-Society inherits the instructions but creates its own artifacts.

**What it owns:** Reusable, project-agnostic guidance for standing up new agent-docs artifacts. Every instruction here must work equally for a software project, a writing project, and a research project.

**What breaks without it:** Each new project figures out how to create these artifacts from scratch. Hard-won patterns from one project are not available to the next.

---

### `general/instructions/workflow/modify.md` — `$INSTRUCTION_WORKFLOW_MODIFY`

**Why it exists:** When an existing workflow needs to change, agents need more than the creation instruction — they need a model for what kind of operation they are performing and the constraints that govern it. Without this document, agents either apply changes ad-hoc (violating traceability) or re-derive evaluation criteria from scratch each time. The document establishes the single-graph model (there is one operation: graph modification), the five evaluative principles, and the seven hard rules that every node, edge, and phase in a modified graph must satisfy.

**What it owns:** The single-graph model, the five principles, the seven hard rules, and the six-step procedure for routing, drafting, validating, and implementing a workflow modification.

**What breaks without it:** Agents facing workflow changes have no principled framework. Modifications bypass approval (violating traceability), collapse role separation (violating the core bet), or remove approval gates (removing quality checks). The false binary between "add a workflow" and "modify a workflow" resurfaces, producing inconsistent graph structures across sessions.

**Do not consolidate with:** `$INSTRUCTION_WORKFLOW` — the creation instruction tells you how to build a workflow; this document tells you how to change one. Distinct operations with distinct constraints. Do not consolidate with `$A_SOCIETY_WORKFLOW` — that document describes A-Society's own workflow; this is a general instruction applicable to any project.

---

### `general/instructions/workflow/complexity.md` — `$INSTRUCTION_WORKFLOW_COMPLEXITY`

**Why it exists:** The workflow creation and modification instructions define the static structure of a workflow graph. Neither covers the intake-time decision of which path through that graph a given task requires. Without this document, agents either apply the full pipeline uniformly to every task (overhead that erodes trust) or bypass structure informally (no principled basis). This document establishes the dynamic complexity model: five axes for intake analysis, three tiers for proportional routing, and the mechanism by which the workflow plan satisfies Hard Rule 2 at every tier.

**What it owns:** The five complexity axes, the three workflow tiers with their signals and record artifact expectations, the workflow plan format, the Hard Rule 2 resolution for single-agent flows, the project-specific invariants note, the incremental pipeline definition principle, and the backward graph tracking mechanism.

**What breaks without it:** The Owner has no principled framework for sizing a flow at intake. Uniform pipeline application continues. Hard Rule 2's applicability to single-agent flows remains undefined. Backward graph tracking is ad-hoc or absent for lightweight flows.

**Do not consolidate with:** `$INSTRUCTION_WORKFLOW_MODIFY` — that document governs design-time structural change to the graph itself; this document governs intake-time path selection through a defined graph. These are categorically distinct operations. Do not consolidate with `$A_SOCIETY_WORKFLOW` — that document describes A-Society's own workflow structure; this is a general instruction applicable to any project.

---

### `general/roles/` — folder

**Why it exists:** Ready-made role documents with `[CUSTOMIZE]` markers. A project adopting the framework takes a template, fills in the marked sections, and has a working role — without starting from a blank page.

**What it owns:** Starting-point role documents that encode the correct structure and most of the content for common archetypes.

**What breaks without it:** Each project re-invents role documents from scratch. The instruction for roles exists, but the gap between instruction and a working role document is larger without a template.

**Do not consolidate `general/roles/` with `general/instructions/roles/`:** Instructions describe *how* to create a role document. Templates *are* role documents, ready to use. They serve different purposes and must remain separate.
