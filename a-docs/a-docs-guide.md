# A-Society: Agent-Docs Guide

This document explains why each file and folder in A-Society's internal documentation set exists, plus the operator-facing invocation references the Curator maintains during registration work. For each surface it records purpose, responsibility, and what would break if it were removed or consolidated incorrectly. It is written for the Curator: the agent responsible for maintaining these surfaces.

This is not a directory listing. It is a rationale document. Read it before maintaining any file in this project.

---

## Project-Level Files

### `agents.md` — `$A_SOCIETY_AGENTS`

**Why it exists:** Every agent working on A-Society reads this first. It is the single entry point that orients any agent to the project with only the information that must be universal at session start: what the project is, how to resolve authority conflicts, and which project-wide invariants always apply.

**What it owns:** Minimal project orientation, the authority hierarchy for conflict resolution, and project-wide invariants.

**What breaks without it:** Agents have no reliable starting point or universal conflict-resolution model. Project-wide invariants would have no single orientation home.

**Do not consolidate with:** The vision (which explains what the project is, not how to operate within it), or any role file (which governs a specific role, not all agents).

---

### `a-docs-guide.md` — `$A_SOCIETY_AGENT_DOCS_GUIDE`

**Why it exists:** The Curator cannot maintain files it does not understand. This document ensures the Curator knows not just where files are (that is the index's job) but *why each file exists* — so it can maintain them correctly, avoid consolidating things that must stay separate, and recognize when a file's purpose has drifted.

**What it owns:** Rationale for every significant file and folder in this project's internal documentation set, plus the load-bearing operator references the Curator maintains directly.

**Do not consolidate with:** `project-information/structure.md` (structure explains folder placement rules; this explains file purpose) or `agents.md` (agents.md is the entry point for all agents; this is deep context for the Curator specifically).

---

### `a-docs-design.md` — `$A_SOCIETY_ADOCS_DESIGN`

**Why it exists:** A-Society now carries an explicit design model for the documentation layer itself. Without a dedicated file, progressive context disclosure and entry-point minimalism would remain an implicit preference rather than a maintainable standard.

**What it owns:** The structural rules for how A-Society's `a-docs/` is authored and maintained: progressive context disclosure, redundancy avoidance, workflow-conditional extraction, role-document scope, and minimal `agents.md` scope.

**What breaks without it:** Agents and Curators have no canonical standard for deciding when a role file should point instead of inline, when `agents.md` has become bloated, or when a new addition has made older content vestigial.

**Do not consolidate with:** `project-information/principles.md` — that file governs how A-Society is extended as a framework; this file governs how the A-Society documentation layer itself is authored. Do not consolidate with `a-docs-guide.md` — the guide explains why files exist; this file defines how those files should be structured.

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

**Why it exists:** The Owner role has authority boundaries, pushback posture, escalation triggers, and workflow-linked support-doc routing specific to A-Society. A generic template would not capture A-Society's project-specific review posture or the Owner support documents surfaced at later workflow moments.

**What it owns:** The A-Society Owner's authority, what they own and do not own, their standing pushback posture, and the routing guidance that tells the agent to rely on workflow-delivered Owner support documents.

**What breaks without it:** An Owner agent has no specific behavioral contract or routing guidance for how phase-specific Owner support docs are delivered. They either over-reach (making framework changes beyond their authority), under-reach (asking the human for every small decision), or lose the structure that keeps phase detail out of the role file.

**Do not consolidate with:** `general/roles/owner.md` — the general template is for any project; this file is A-Society's specific instantiation with A-Society-specific review tests. Do not consolidate with `roles/owner/` — those files are loaded only when a specific Owner moment occurs; this file is the role-level routing guide above them.

---

### `roles/owner/` — folder

**Why it exists:** The Owner role now uses workflow-linked support docs for phase-specific guidance. This folder groups those Owner-only support documents so `roles/owner.md` can stay a routing guide while the workflow surfaces the right document at the right moment.

**What it owns:** The Owner's on-demand support documents: brief/constraint writing, review behavior, log management, TA advisory and integration-gate review, and forward pass closure.

**What breaks without it:** Those instructions either creep back into `roles/owner.md` or stop being reusable as distinct support docs, making the role file harder to maintain and the workflow's delivery cues less clear.

**Do not consolidate with:** `roles/owner.md` — that file is the role contract and routing surface; this folder holds the support docs the workflow surfaces later. Do not consolidate with `workflow/` — the workflow delivers these docs, but they remain Owner-specific support documents rather than shared workflow definitions.

---

### `roles/owner/brief-writing.md` — `$A_SOCIETY_OWNER_BRIEF_WRITING`

**Why it exists:** Brief-writing and constraint-writing guidance is phase-specific. Keeping it in a dedicated Owner support document means the Owner loads it when needed rather than carrying it in every session.

**What it owns:** The preserved `## Brief-Writing Quality` and `## Constraint-Writing Quality` guidance extracted from `roles/owner.md`.

**What breaks without it:** Brief-writing detail returns to the role file, bloating the Owner's startup context and mixing general role identity with a later-phase task surface.

**Do not consolidate with:** `roles/owner.md` — role contract vs. phase-specific execution guidance. Do not consolidate with `roles/owner/ta-advisory-review.md` or `roles/owner/forward-pass-closure.md` — each document is loaded for a different Owner moment.

---

### `roles/owner/review-behavior.md` — `$A_SOCIETY_OWNER_REVIEW_BEHAVIOR`

**Why it exists:** Review behavior is conditional guidance. The Owner only needs this surface when reviewing a proposed addition, not at the start of every session. Keeping it in a dedicated support document preserves the routing-guide shape of `roles/owner.md`.

**What it owns:** The preserved `## How the Owner Reviews an Addition` and `## Review Artifact Quality` guidance extracted from `roles/owner.md`.

**What breaks without it:** Review-specific criteria either bloat the Owner role file again or get split across approval artifacts with no canonical Owner reference.

**Do not consolidate with:** `roles/owner.md` — role contract vs. review-phase guidance. Do not consolidate with `roles/owner/brief-writing.md` — drafting and reviewing are distinct Owner moments with different checks.

---

### `roles/owner/log-management.md` — `$A_SOCIETY_OWNER_LOG_MANAGEMENT`

**Why it exists:** The Owner manages `$A_SOCIETY_LOG` only at specific moments: intake, synthesis follow-up, and closure. Merge assessment and log-filing obligations are important, but they do not belong in the always-loaded role file.

**What it owns:** The project-log management and merge-assessment guidance extracted from `roles/owner.md`.

**What breaks without it:** Log-management detail returns to the role file, or the merge-assessment procedure becomes implicit and inconsistently applied when filing Next Priorities.

**Do not consolidate with:** `roles/owner.md` — role contract vs. log-management procedure. Do not consolidate with `roles/owner/forward-pass-closure.md` — closure uses the log, but log management also occurs at intake and during synthesis follow-up.

---

### `roles/owner/ta-advisory-review.md` — `$A_SOCIETY_OWNER_TA_REVIEW`

**Why it exists:** TA advisory and integration-gate review guidance only matters when the Owner is reviewing a Technical Architect advisory or deciding whether a TA-reviewed implementation clears the integration gate. It should not be carried inline in the Owner role for sessions that never involve a TA.

**What it owns:** The preserved `## TA Advisory Review` guidance extracted from `roles/owner.md`, plus the Owner's contract-review checks for TA-reviewed integration gates.

**What breaks without it:** TA-specific review instructions either bloat the Owner role file or get misplaced into broader workflow docs where they no longer read as Owner-only obligations. Integration-gate decisions become ad hoc instead of following a stable Owner-side evidence hierarchy.

**Do not consolidate with:** `roles/owner.md` — this is conditional review guidance, not universal role identity. Do not consolidate with `roles/owner/brief-writing.md` — advisory review and brief writing are different phases with different checks.

---

### `roles/owner/forward-pass-closure.md` — `$A_SOCIETY_OWNER_CLOSURE`

**Why it exists:** Forward pass closure guidance applies only when the Owner is closing a flow. It belongs in a dedicated closure document rather than in the always-loaded Owner role file.

**What it owns:** The preserved `## Forward Pass Closure Discipline` guidance extracted from `roles/owner.md`.

**What breaks without it:** Closure-time verification, log/archive discipline, and update-report path naming either remain inline in `roles/owner.md` or drift into artifacts that are not the canonical Owner closure reference.

**Do not consolidate with:** `roles/owner.md` — this is closure-phase guidance, not general role contract. Do not consolidate with `workflow/main.md` — workflows define phase structure; this file defines how the Owner executes one specific phase.

---

### `roles/curator.md` — `$A_SOCIETY_CURATOR_ROLE`

**Why it exists:** The Curator role has hard rules and escalation triggers specific to A-Society's maintenance needs — in particular the prohibition on writing to `general/` without Owner approval, the requirement to use `$VAR` references, and the distillation protocol for proposing patterns from observed projects.

**What it owns:** The A-Society Curator's maintenance scope, hard rules, pattern distillation process, version-aware migration obligations, and the routing pointer to the Curator's implementation-practices document.

**What breaks without it:** A Curator agent has no specific behavioral contract. They may write directly to `general/` without approval, hardcode paths, or perform migration work without understanding the framework's boundaries. Role context injection fails.

**Do not consolidate with:** `general/roles/curator.md` — same reasoning as above. The general template is the pattern; this is the A-Society-specific instantiation.

---

### `roles/curator/implementation-practices.md` — `$A_SOCIETY_CURATOR_IMPL_PRACTICES`

**Why it exists:** The Curator's proposal, implementation, and registration checks are phase-specific. Keeping them in a dedicated support document lets `roles/curator.md` stay focused on scope, authority, and escalation while still giving the Curator one canonical execution reference when work begins.

**What it owns:** The preserved `## Standing Checks` and `## Implementation Practices` guidance extracted from `roles/curator.md`.

**What breaks without it:** Proposal and implementation detail creeps back into the role file, increasing startup context and weakening the workflow-linked support-doc model.

**Do not consolidate with:** `roles/curator.md` — role contract vs. execution guidance. Do not consolidate with `general/roles/curator.md` — this document is specific to A-Society's own Curator operating on A-Society.

---

### `roles/required-readings.yaml` — `$A_SOCIETY_REQUIRED_READINGS`

**Why it exists:** To ensure every session starts with the correct context without relying on prose checklists or frontmatter duplication. This file is the single, machine-readable authority for context injection.

**What it owns:** The universal reading list and the role-specific mapping of `$VAR` references for all roles in the project.

**Who reads it:** The runtime parsing layer (which performs the injection). Humans consult it as a sequence reference.

**What breaks without it:** Programmatic context injection fails. Reading sequence becomes undocumented.

---

### `roles/technical-architect.md` — `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`

**Why it exists:** The Technical Architect role has a narrow, pre-implementation mandate that is not covered by Owner or Curator: producing the automation boundary evaluation, component designs, and open question surfaces that must exist before any programmatic tooling is built. Without a dedicated role file, this work either collapses into the Owner (adding implementation-planning scope that the Owner does not own) or proceeds without a behavioral contract, risking implementation before design is verified.

**What it owns:** The Technical Architect's authority, hard rules, primary work output definition, and the routing pointer to the TA's advisory-standards document.

**What breaks without it:** A Technical Architect agent has no behavioral contract. The boundary between design and implementation is undefined. Proposals may bypass Owner review. Direction decisions may be absorbed into technical decisions without escalation. Role context injection fails.

**Do not consolidate with:** `roles/owner.md` — the Owner reviews and approves technical proposals; they do not produce them. Do not consolidate with `roles/curator.md` — the Curator maintains existing documentation; the Technical Architect designs new technical infrastructure that does not yet exist.

---

### `roles/technical-architect/advisory-standards.md` — `$A_SOCIETY_TA_ADVISORY_STANDARDS`

**Why it exists:** Advisory standards matter only when the Technical Architect is producing an advisory, component design, or integration review. Keeping them in a support document preserves the TA role file as a startup contract rather than a full advisory-writing manual.

**What it owns:** The preserved `## Advisory Standards` and `## a-docs/ Format Dependencies` guidance extracted from `roles/technical-architect.md`.

**What breaks without it:** TA advisory-writing detail returns to the role file, or the advisory-quality standard fragments across old advisories and workflow notes with no canonical home.

**Do not consolidate with:** `roles/technical-architect.md` — role contract vs. advisory-execution guidance. Do not consolidate with `executable/architecture-proposal.md` — this file governs how the TA writes advisories; the proposal records the current approved executable design.

---

### `roles/framework-services-developer.md` — `$A_SOCIETY_FRAMEWORK_SERVICES_DEVELOPER_ROLE`

**Why it exists:** The unified executable layer still needs a pure execution role for deterministic framework services. Without this role, framework-service implementation either collapses into the Curator (wrong authority) or into orchestration work (wrong boundary), recreating the retired tooling/runtime split in a less explicit form.

**What it owns:** Deterministic executable framework-service implementation under `runtime/`, escalation triggers for design deviation and scope ambiguity, and the boundary that this role does not own a standing operator-facing executable reference by default.

**What breaks without it:** No clear behavioral contract for executable framework-service work. The executable role split becomes implicit, and implementation decisions drift across the framework-services/orchestration boundary.

**Do not consolidate with:** `roles/orchestration-developer.md` — deterministic framework services and orchestration are different executable subdomains. Do not consolidate with `roles/curator.md` — executable implementation and standing-doc maintenance remain different authorities.

---

### `roles/framework-services-developer/implementation-discipline.md` — `$A_SOCIETY_FRAMEWORK_SERVICES_DEV_IMPL_DISCIPLINE`

**Why it exists:** Framework-service implementation guidance matters at execution time, not at session start. Keeping it separate preserves a lighter startup role file while giving the implementation phases one canonical completion-report and co-maintenance reference.

**What it owns:** Completion-report shape, exact-path discipline, service-contract co-maintenance guidance, and the standing rule that framework-service implementation lives under `runtime/`.

**What breaks without it:** Framework-service completion artifacts drift in shape, and migration-boundary or co-maintenance mistakes get rediscovered ad hoc.

**Do not consolidate with:** `roles/framework-services-developer.md` — role contract vs. execution guidance. Do not consolidate with `$A_SOCIETY_EXECUTABLE_PROPOSAL` — the proposal defines the executable design; this file defines how the Developer executes within that design.

---

### `roles/orchestration-developer.md` — `$A_SOCIETY_ORCHESTRATION_DEVELOPER_ROLE`

**Why it exists:** The executable layer needs a role that explicitly owns orchestration behavior and the surviving operator-facing executable reference. Without this, `runtime/INVOCATION.md` authorship and orchestration ownership fall back into the retired pre-unification role framing or become ambiguous between implementer and Curator.

**What it owns:** Runtime orchestration implementation, operator-facing runtime reference ownership, escalation triggers, and the hard boundary that this role does not own `general/` or standing executable design decisions.

**What breaks without it:** No clear behavioral contract for orchestration work. `$A_SOCIETY_RUNTIME_INVOCATION` ownership becomes ambiguous. The executable role split becomes under-specified.

---

### `roles/orchestration-developer/implementation-discipline.md` — `$A_SOCIETY_ORCHESTRATION_DEV_IMPL_DISCIPLINE`

**Why it exists:** Orchestration implementation guidance is execution-time detail, not startup identity. Keeping it separate preserves a lighter startup role file while giving orchestration phases one canonical reference for completion artifacts, runtime-specific implementation rules, and operator-surface co-maintenance.

**What it owns:** Completion-report shape, exact-path discipline, runtime operator-surface co-maintenance, and runtime-specific implementation rules such as gateway error preservation and direct `providedHistory` mutation.

**What breaks without it:** Runtime-specific implementation rules drift back into role prose or disappear into old artifacts, and `$A_SOCIETY_RUNTIME_INVOCATION` can fall out of sync with the live executable surface.

**Do not consolidate with:** `roles/orchestration-developer.md` — role contract vs. execution guidance. Do not consolidate with `workflow/executable-development.yaml` — the workflow defines phases; this file defines how the Orchestration Developer executes within them.

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

**Why it exists:** A-Society maintains several permanent execution workflows (framework development and executable development), each with distinct phase sequences and role compositions. Without a routing index, agents arriving at the workflow folder must read every workflow file to determine which governs their current work. The index gives every agent a single load point: load it, identify the relevant workflow or multi-domain pattern, then load that file.

**What it owns:** The workflow routing directory — one entry per permanent A-Society workflow (name, one-line summary, file reference), and the **Multi-domain pattern** pointer to `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`.

**What breaks without it:** Agents have no single entry point to the workflow directory.

**Do not consolidate with:** `workflow/framework-development.yaml` or `workflow/executable-development.yaml` — those files contain the full workflow definitions; this file is the routing layer above them. Do not embed phase definitions, handoffs, or invariants here — those belong in the specific workflow files.

---

### `workflow/multi-domain-development.yaml` — `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`

**Why it exists:** Cross-cutting work often touches framework documentation, framework services, and orchestration in one feature thread. The permanent workflows each describe a single-layer cadence; they do not by themselves explain how to stitch layers into one flow with parallel tracks. This pattern document fills that gap so Owner, TA, Framework Services Developer, Orchestration Developer, and Curator agents share one map.

**What it owns:** The canonical multi-domain YAML workflow definition — when to use the pattern, how it composes (not replaces) the permanent workflows, a typical role map, parallel-track and Curator/`general/` checkpoint behavior, and record-folder `workflow.yaml` expectations.

**What breaks without it:** Agents infer multi-domain routing from the routing index bullet alone; integration handoffs and approval loops for `general/` are under-specified for complex flows.

**Do not consolidate with:** `workflow/main.md` — the routing index must stay lightweight. Do not consolidate with `workflow/framework-development.yaml` — that file owns the single-layer framework loop; this file owns cross-layer composition.

---

### `workflow/framework-development.yaml` — `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`

**Why it exists:** A-Society's primary ongoing work is framework development: growing, maintaining, and quality-gating the reusable instruction library. This workflow governs that cadence — the Proposal → Review → Implementation → Registration loop that every library addition or a-docs change passes through. Extracting it from the routing index into its own file allows agents working on framework development to load only the workflow they need without reading unrelated executable-implementation workflow material.

**What it owns:** The complete framework-development YAML workflow definition — node contracts, transitions, invariants, and escalation rules that govern the reusable-library loop.

**What breaks without it:** The framework development workflow has no dedicated home. Agents cannot load only the framework workflow without also loading unrelated executable workflow content. The Approval Invariant — the core constraint that prevents the Curator from writing to `general/` without Owner approval — is not discoverable except through role files.

**Do not consolidate with:** `workflow/main.md` (the routing index) — that file routes agents to workflows; this file defines one. Do not consolidate with `workflow/executable-development.yaml` — the two workflows have different phase sequences, different role compositions, and serve different operational cadences; merging them would force every agent to read irrelevant workflow material.

---

### `workflow/complexity.md` — `$A_SOCIETY_WORKFLOW_COMPLEXITY`

**Why it exists:** A-Society's internal workflows need an internal intake-sizing authority instead of pointing directly at the reusable library instruction. This file instantiates the general complexity model for A-Society's own framework, executable, and multi-domain routing decisions.

**What it owns:** A-Society-specific use of the five complexity axes, tier-selection rules inside this repo, the local constraints that narrow when Tier 1 is allowed, and the intake relationship between workflow sizing, the workflow-plan template, and the records convention.

**What breaks without it:** Internal workflow docs leak across the general/internal boundary. The Owner has to infer whether reusable-library, executable, or multi-domain work can be sized directly from the general instruction instead of reading a project-specific authority.

**Do not consolidate with:** `$INSTRUCTION_WORKFLOW_COMPLEXITY` — that file is the reusable instruction for any project; this file is A-Society's internal instantiation. Do not consolidate with `workflow/main.md` — the routing index chooses the workflow family; this file governs intake sizing inside the chosen family.

---

### `workflow/executable-development.yaml` — `$A_SOCIETY_WORKFLOW_EXECUTABLE_DEV`

**Why it exists:** The unified executable layer has one permanent implementation workflow, covering both deterministic framework services and orchestration. Without a dedicated workflow, agents would have to reconstruct the executable path from the retired tooling/runtime split or treat `runtime/` changes as ad hoc exceptions to framework development.

**What it owns:** The canonical executable-development YAML workflow definition — the executable design gate, the two executable implementation tracks, integration validation, registration expectations, and forward-pass closure requirements.

**What breaks without it:** The executable implementation path has no authoritative home. The standing role split between Framework Services Developer and Orchestration Developer becomes procedural folklore instead of documented workflow structure.

**Do not consolidate with:** `workflow/framework-development.yaml` — framework documentation and executable implementation remain different operational cadences. Do not consolidate with `executable/architecture-addendum.md` — that file governs standing executable constraints; this file governs the executable workflow.

---

## `improvement/`

### `improvement/main.md` — `$A_SOCIETY_IMPROVEMENT`

**Why it exists:** Improvement decisions require both principled reasoning (when to split a file, when to add a protocol, when to cross-reference) and a standing project-specific backward pass reference. This file is the canonical home for the philosophy, traversal rules, and the mapping to the project-specific phase files the runtime injects. Without it, improvement philosophy gets buried in role files, the relation between philosophy and runtime-injected phase instructions is implicit, and each cycle reinvents the process.

**What it owns:** The five improvement principles, the decision framework for applying them during meta-synthesis, the backward pass traversal algorithm, and the cross-references to `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` and `$A_SOCIETY_IMPROVEMENT_SYNTHESIS`.

**What breaks without it:** Improvement sessions reinvent principles each time. Backward passes lack a standard structure. Findings are lost or misrouted instead of flowing through the correct approval path.

**Do not consolidate with:** `agents.md` or role files — this document is improvement infrastructure; the others are execution infrastructure.

### `improvement/meta-analysis.md` — `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS`

**Why it exists:** The runtime injects a project-specific instruction file into findings-producing backward pass sessions. The framework-level template in `general/` is not the runtime target for A-Society itself; this file is. Without it, the runtime either injects generic template content or a monolithic protocol file that makes findings sessions read irrelevant material.

**What it owns:** The A-Society-specific meta-analysis instructions: when to run, how findings-producing roles should treat ordering and output, reflection categories, analysis-quality expectations, the a-docs structure checks used to catch documentation anti-patterns, and the `meta-analysis-complete` completion signal.

**What breaks without it:** Runtime-injected findings sessions do not have a project-specific instruction target. Agents receive the wrong layer (framework template) or an over-broad file, and findings artifacts drift from the project's actual protocol.

**Do not consolidate with:** `improvement/main.md` — that file owns philosophy and traversal rules; this file owns the injected instructions for findings sessions.

### `improvement/synthesis.md` — `$A_SOCIETY_IMPROVEMENT_SYNTHESIS`

**Why it exists:** The synthesis session has different responsibilities from findings sessions: direct `a-docs/` maintenance, Next Priorities routing, and closure of the backward pass. It needs its own project-specific runtime injection target.

**What it owns:** The A-Society-specific synthesis instructions: direct-vs-queued routing based on structural scope, use of `$A_SOCIETY_LOG` for non-`a-docs/` follow-up work, and the guardrails that apply to closing the backward pass in this project.

**What breaks without it:** The Curator synthesis session must infer A-Society-specific routing from a generic template or from the full protocol document, increasing the risk of wrong-layer routing or backlog generation.

**Do not consolidate with:** `improvement/main.md` or `improvement/meta-analysis.md` — the philosophy/traversal layer, findings-session layer, and synthesis-session layer serve different consumers and should remain separate.

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

## `executable/`

These files live in `a-docs/executable/`. They are the standing design, governance, historical-assessment, and coupling-reference artifacts for A-Society's unified executable layer.

### `executable/main.md` — `$A_SOCIETY_EXECUTABLE`

**Why it exists:** The executable folder contains the standing doc set for the unified executable layer. Without an entry point, agents must open every executable document to determine which is relevant to their task.

**What it owns:** Orientation to the executable subfolder — one-paragraph description of each standing executable document and its intended reader(s).

**What breaks without it:** The executable doc set has no navigable entry point.

**Do not consolidate with:** Any of the executable documents — each answers a distinct question (design, governance, coupling state, historical deviation rulings). The main.md is an orientation layer, not a summary of those documents.

---

### `executable/general-coupling-map.md` — `$A_SOCIETY_EXECUTABLE_COUPLING_MAP`

**Why it exists:** The executable capabilities depend on stable `general/` and `a-docs/` formats, and the maintained guidance surfaces must describe those capabilities in project-agnostic terms. Without a standing coupling reference, co-maintenance drift becomes invisible.

**What it owns:** The executable format dependency table, the maintained-guidance status table, and the executable change taxonomy (Types A–F).

**What breaks without it:** Format changes are approved without scoping executable follow-through, and capability/guidance drift accumulates silently.

**Do not consolidate with:** `executable/architecture-proposal.md` — the proposal is the executable design; this document is the standing coupling state. Do not consolidate with `executable/architecture-addendum.md` — the addendum is the governance layer; this document is the operational co-maintenance reference.

---

### `executable/architecture-proposal.md` — `$A_SOCIETY_EXECUTABLE_PROPOSAL`

**Why it exists:** This is the standing executable design reference. It records the runtime-root model, the framework-services/orchestration role split, the capability inventory, and the surviving operator-surface rule.

**What it owns:** The definitive description of what the unified executable layer is, what capabilities it contains, how ownership is split, and which stable documentation contracts it depends on.

**What breaks without it:** The executable role split and runtime-root model lose their authoritative design reference.

**Do not consolidate with:** `executable/architecture-addendum.md` — the proposal is the WHAT; the addendum is the governance and maintenance layer. Do not consolidate with `executable/legacy-ta-assessment-phase1-2.md` — the assessment records historical rulings; the proposal records the standing design.

---

### `executable/architecture-addendum.md` — `$A_SOCIETY_EXECUTABLE_ADDENDUM`

**Why it exists:** The proposal defines the executable layer. The addendum complements it with the standing placement rules, registration rules, extension rules, and migration constraints that govern executable-layer maintenance.

**What it owns:** Runtime-root placement constraints, role ownership boundaries, registration obligations, and extension/migration rules.

**What breaks without it:** The executable layer's maintenance rules fragment across workflows and old proposals with no single governance reference.

**Do not consolidate with:** `executable/architecture-proposal.md` — the proposal is the design spec; the addendum is the governance layer. Do not consolidate with `$A_SOCIETY_WORKFLOW_EXECUTABLE_DEV` — that document owns the executable workflow; this file owns the standing executable constraints.

---

### `executable/legacy-ta-assessment-phase1-2.md` — `$A_SOCIETY_EXECUTABLE_LEGACY_TA_ASSESSMENT_PHASE1_2`

**Why it exists:** The unified executable layer carries forward two historical deviation rulings from the legacy framework-service implementation path. This file preserves the authoritative basis for those rulings.

**What it owns:** The standing record of the update-comparison and consent-rendering deviation rulings that remain load-bearing in the unified executable layer.

**What breaks without it:** Future maintainers lose the basis for two still-active design exceptions.

**Do not consolidate with:** `executable/architecture-proposal.md` — the proposal is the authoritative standing design; the assessment preserves the historical ruling chain behind specific carried-forward deviations.

---

## Operator References

These files live in the executable layers rather than in `a-docs/`, but they are still Curator-maintained reference surfaces: internal roles verify them against live behavior, index them, and keep their rationale in view.

### `runtime/INVOCATION.md` — `$A_SOCIETY_RUNTIME_INVOCATION`

**Why it exists:** The runtime is the sole default operator-facing executable surface. Commands, runtime signals, state location, and environment variables must be discoverable without reading source files.

**What it owns:** Runtime entry points, runtime signal semantics, operator output model (live notices and token formats), state-directory behavior, and environment-driven configuration such as telemetry settings.

**What breaks without it:** Operators and reviewers infer runtime behavior from source code or historical artifacts. The Curator, TA, and Owner lose the stable operator-facing document they are expected to compare against the implementation at review and registration time.

**Do not consolidate with:** `workflow/executable-development.yaml` — the workflow defines how the executable layer is designed and reviewed, not how operators invoke it. Do not consolidate with `project-information/architecture.md` — architecture explains what the runtime is; this file explains how to operate it.

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

**Do not consolidate with:** `$INSTRUCTION_WORKFLOW_MODIFY` — that document governs design-time structural change to the graph itself; this document governs intake-time path selection through a defined graph. These are categorically distinct operations. Do not consolidate with `$A_SOCIETY_WORKFLOW` — that document describes A-Society's own workflow structure; this is a general instruction applicable to any project. Do not consolidate with `$A_SOCIETY_WORKFLOW_COMPLEXITY` — that document is A-Society's internal instantiation of this reusable model.

---

### `general/roles/` — folder

**Why it exists:** Ready-made role documents with `[CUSTOMIZE]` markers. A project adopting the framework takes a template, fills in the marked sections, and has a working role — without starting from a blank page.

**What it owns:** Starting-point role documents that encode the correct structure and most of the content for common archetypes.

**What breaks without it:** Each project re-invents role documents from scratch. The instruction for roles exists, but the gap between instruction and a working role document is larger without a template.

**Do not consolidate `general/roles/` with `general/instructions/roles/`:** Instructions describe *how* to create a role document. Templates *are* role documents, ready to use. They serve different purposes and must remain separate.
