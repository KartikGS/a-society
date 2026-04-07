---
type: curator-to-owner
date: "2026-04-07"
---

**Subject:** a-docs Design Principles - JIT context model, agents.md cleanup, owner.md restructure, meta-analysis scope expansion
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-04-07

---

## Trigger

Human-directed framework change surfaced through this flow's Owner brief: establish a written a-docs design model around just-in-time context disclosure, apply it immediately to `$A_SOCIETY_AGENTS` and `$A_SOCIETY_OWNER_ROLE`, and add standing backward-pass checks so the same anti-patterns are caught in future flows.

---

## Pre-Proposal Verification

### 1. Principle 5 vs. the scoped `agents.md` result

The brief's proposed text for Principle 5 says `agents.md` contains only: what the project is (one paragraph) and the authority/conflict resolution model. The same brief's Item 2 explicitly retains the `## Invariants` section in `$A_SOCIETY_AGENTS`.

These two directions conflict. The proposal below resolves the contradiction by revising Principle 5 to say that `agents.md` contains:
- what the project is (one paragraph)
- the authority/conflict resolution model
- project-wide invariants

This preserves the brief's scoped `agents.md` result while keeping the principle internally consistent.

### 2. Residual `owner.md` scope drift outside this brief

The proposed Principle 4 says role documents do not contain review criteria for artifacts produced by other roles. `$A_SOCIETY_OWNER_ROLE` will still retain `## How the Owner Reviews an Addition` after the scoped extraction in this flow.

I am not expanding scope unilaterally. The proposal below leaves that section in place and flags it as residual follow-on work if the Owner wants Principle 4 applied more strictly in a later flow.

### 3. Index scope needs one refinement

The brief scopes `$A_SOCIETY_PUBLIC_INDEX` for the new general files, but `$A_SOCIETY_INDEX` is also the internal resolver for general and instruction variables used in A-Society docs. If `$GENERAL_ADOCS_DESIGN` and `$INSTRUCTION_ADOCS_DESIGN` are approved, both variables must also be added to `$A_SOCIETY_INDEX` during implementation.

### 4. Manifest scaffold mode needs one refinement

If `a-docs-design.md` is added to `$GENERAL_MANIFEST`, the entry should be `copy`, not `stub`. This flow creates a ready-made general template at `$GENERAL_ADOCS_DESIGN`; a `stub` entry would ignore that template and create an empty file instead.

### 5. Reader assignment is currently missing

A new a-docs design-principles artifact should not be created without an assigned reader. The brief does not currently scope `$A_SOCIETY_REQUIRED_READINGS`, but the new `$A_SOCIETY_ADOCS_DESIGN` will otherwise be orphaned.

Recommendation: treat this as a scope refinement and add `$A_SOCIETY_ADOCS_DESIGN` to the Owner and Curator role-specific lists in `$A_SOCIETY_REQUIRED_READINGS` during implementation. The general instruction should likewise tell adopting projects to add their project instance to the Owner and Curator starting-context set (required readings or equivalent project-specific startup context mechanism).

### 6. `a-docs-guide` scope also needs one refinement

The brief explicitly names `$A_SOCIETY_AGENT_DOCS_GUIDE` for the new `a-docs-design.md` file. The extracted Owner phase documents are also new `a-docs/` artifacts and should receive guide entries in the same implementation pass.

---

## What and Why

This proposal introduces a new cross-cutting a-docs design artifact, then uses it to right-size two existing entry documents that currently front-load too much instruction:

1. `$A_SOCIETY_ADOCS_DESIGN` and its general-layer counterparts establish a durable rule set for how a-docs should be authored: progressive context disclosure, no redundancy with injected context, workflow-conditional guidance living in phase documents, and minimal `agents.md` scope.
2. `$A_SOCIETY_AGENTS` is reduced to true orientation content rather than runtime-mechanism explanation and role-table duplication.
3. `$A_SOCIETY_OWNER_ROLE` becomes a routing guide with just-in-time pointers to Owner phase documents instead of carrying all phase instructions inline.
4. `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` and `$GENERAL_IMPROVEMENT_META_ANALYSIS` gain standing a-docs structure checks so the same anti-patterns are surfaced automatically in backward pass work.

The change is generalizable because every project using a-docs faces the same structural problem: if guidance is loaded too early, duplicated across entry documents, or kept inline in role files when it only matters at a later phase, agents spend context budget on instructions that are not yet relevant and role files accumulate stale operational detail.

The extracted Owner phase documents remain A-Society-specific in this flow. Generalizing the same split into `$GENERAL_OWNER_ROLE` is a follow-on step, not part of this proposal.

---

## Where Observed

A-Society - internal.

The anti-patterns were observed directly in:
- `$A_SOCIETY_AGENTS` - redundant index/runtime/role-assignment explanation
- `$A_SOCIETY_OWNER_ROLE` - phase-specific instructions embedded inline
- `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` / `$GENERAL_IMPROVEMENT_META_ANALYSIS` - no standing check that would surface these problems during backward pass work

The generalizable pattern is not A-Society-specific. Any project with role documents, required readings, and phase-based workflows can accumulate the same front-loaded context and duplication.

---

## Target Location

### New principle artifacts

- `$A_SOCIETY_ADOCS_DESIGN` (proposed) -> `a-society/a-docs/a-docs-design.md`
- `$GENERAL_ADOCS_DESIGN` (proposed) -> `a-society/general/a-docs-design.md`
- `$INSTRUCTION_ADOCS_DESIGN` (proposed) -> `a-society/general/instructions/a-docs-design.md`

### Existing files to modify

- `$A_SOCIETY_AGENTS`
- `$A_SOCIETY_OWNER_ROLE`
- `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS`
- `$GENERAL_IMPROVEMENT_META_ANALYSIS`
- `$A_SOCIETY_INDEX`
- `$A_SOCIETY_PUBLIC_INDEX`
- `$A_SOCIETY_AGENT_DOCS_GUIDE`
- `$GENERAL_MANIFEST`

### Proposed new Owner phase documents

- `$A_SOCIETY_OWNER_BRIEF_WRITING` (proposed) -> `a-society/a-docs/roles/owner/brief-writing.md`
- `$A_SOCIETY_OWNER_TA_REVIEW` (proposed) -> `a-society/a-docs/roles/owner/ta-advisory-review.md`
- `$A_SOCIETY_OWNER_CLOSURE` (proposed) -> `a-society/a-docs/roles/owner/forward-pass-closure.md`

### Scope refinements recommended for approval

- `$A_SOCIETY_REQUIRED_READINGS` - add `$A_SOCIETY_ADOCS_DESIGN` to Owner and Curator role-specific context sets
- `$A_SOCIETY_AGENT_DOCS_GUIDE` - add entries for the three new Owner phase documents in addition to `$A_SOCIETY_ADOCS_DESIGN`

---

## Draft Content

### 1. Structural recommendations

#### 1A. Placement of extracted `owner.md` content

**Recommendation:** create a new subfolder `a-society/a-docs/roles/owner/` containing three files:
- `brief-writing.md`
- `ta-advisory-review.md`
- `forward-pass-closure.md`

**Why this location is correct:**
- These are Owner-specific on-demand documents, not standalone roles.
- They are not permanent workflow definitions, so `a-docs/workflow/` is the wrong layer.
- The category is real and contains three artifacts immediately, so the structure rule in `$A_SOCIETY_STRUCTURE` is satisfied without invoking the namespace-parity exception.
- Nesting them under `roles/owner/` makes the JIT chain explicit: role file -> Owner support document for the triggered moment.

**Why not `a-docs/workflow/`:**
- These files do not define a workflow, phase graph, or shared routing logic.
- They are behavioral instructions for one role, loaded only when that role reaches a specific moment.
- Placing them in `workflow/` would mix role-specific behavior with permanent workflow definitions and make the folder less semantically coherent.

#### 1B. `Review Artifact Quality` disposition

**Recommendation:** keep `## Review Artifact Quality` in `$A_SOCIETY_OWNER_ROLE` in this flow.

**Rationale:**
- It governs all Owner review artifacts, not only one workflow type or one narrow phase.
- Extracting only this section now would split the Owner's review surface across two places while `## How the Owner Reviews an Addition` remains inline in the same file.
- The stricter "routing-guide only" application of Principle 4 would also pull `## How the Owner Reviews an Addition` out of the role file, but that change is outside this brief's scope.

**Flagged residual:** if the Owner wants a stricter follow-through on Principle 4, a future flow should evaluate `## How the Owner Reviews an Addition` and `## Review Artifact Quality` together as one review-behavior surface.

#### 1C. General template framing

**Recommendation:** `$GENERAL_ADOCS_DESIGN` should be structurally identical to `$A_SOCIETY_ADOCS_DESIGN`, with only two framing differences:
- the opening paragraph should describe "this project's a-docs" rather than A-Society specifically
- Principle 2 should refer to the agent's starting context in a project-agnostic way ("required readings or runtime injection") rather than assuming the A-Society runtime specifically

No structural section changes are needed for portability.

---

### 2. `$A_SOCIETY_ADOCS_DESIGN` (new)

**Proposed file:** `$A_SOCIETY_ADOCS_DESIGN`

```markdown
# a-docs Design Principles

These principles govern how agent-documentation is written, structured, and maintained in A-Society. Apply them when creating any `a-docs/` artifact, when reviewing a proposal, and during meta-analysis.

---

## 1. Progressive Context Disclosure

Agents receive information exactly when they need it - not before. Role documents do not contain phase instructions; they contain pointers to where phase instructions live. Instructions are read at the moment they become relevant.

**The pattern:** role document -> "when X occurs, read Y" -> Y contains the instructions -> Y may direct to Z.

**Anti-patterns:**
- Inline instructions in a role document that only apply at a specific phase
- Role-document sections that begin "when writing a brief..." or "when closing a forward pass..." - those instructions belong in the document the agent reads at that phase
- Providing detailed how-to content up front that the agent will not need until much later in the session, displacing context that matters now

---

## 2. No Redundancy With Injected Context

If a document is already in an agent's required readings or otherwise injected into starting context, do not also reference, explain, or link it elsewhere in the required-reading set. Every piece of information has one home.

**Anti-patterns:**
- Links from `agents.md` to documents that are already in required readings for some roles
- Sections that explain the index or required-readings mechanism when those are already handled by the runtime
- Links from `agents.md` to role-specific documents that only some agents read

---

## 3. Workflow-Conditional Instructions Belong in Phase Documents

If an instruction only applies when a specific workflow type is active or a specific phase has been reached, it belongs in the workflow or phase-specific document - not in the role document. A role document that contains TA advisory review instructions will be read by agents in flows that have no TA.

**Anti-patterns:**
- TA advisory review guidance in a general-purpose role document
- Forward pass closure discipline in a role document - belongs in a closure-phase document
- Brief-writing quality standards in a role document - belong in a document read when the brief is being written

---

## 4. Role Documents Are Routing Guides

A role document contains: who this agent is, what it owns, what it does not own, and what to read when specific moments arise. Nothing else.

What a role document does not contain:
- Instructions for how to execute a phase
- Quality standards for artifacts produced in a phase
- Review criteria for artifacts produced by other roles
- Behavioral guidance that only applies to some flows or some workflow types

---

## 5. agents.md Is a Minimal Orientation Entry Point

`agents.md` is the first document every agent reads. Its scope is: what the project is (one paragraph), the authority/conflict resolution model, and project-wide invariants. Nothing else.

What `agents.md` does not contain:
- Links to documents already in required readings for any role
- Explanation of the index or the required-readings mechanism - handled by the runtime
- A roles table - the runtime assigns the role; the agent already knows what it is
- Any section whose information is available through another channel already in scope
```

---

### 3. `$GENERAL_ADOCS_DESIGN` (new)

**Proposed file:** `$GENERAL_ADOCS_DESIGN`

```markdown
# a-docs Design Principles

These principles govern how a project's agent-documentation is written, structured, and maintained. Apply them when creating any `a-docs/` artifact, when reviewing a proposal, and during meta-analysis.

---

## 1. Progressive Context Disclosure

Agents receive information exactly when they need it - not before. Role documents do not contain phase instructions; they contain pointers to where phase instructions live. Instructions are read at the moment they become relevant.

**The pattern:** role document -> "when X occurs, read Y" -> Y contains the instructions -> Y may direct to Z.

**Anti-patterns:**
- Inline instructions in a role document that only apply at a specific phase
- Role-document sections that begin "when writing a brief..." or "when closing a forward pass..." - those instructions belong in the document the agent reads at that phase
- Providing detailed how-to content up front that the agent will not need until much later in the session, displacing context that matters now

---

## 2. No Redundancy With Injected Context

If a document is already in an agent's starting context via required readings or runtime injection, do not also reference, explain, or link it elsewhere in the required-reading set. Every piece of information has one home.

**Anti-patterns:**
- Links from `agents.md` to documents that are already in required readings for some roles
- Sections that explain the index or required-readings mechanism when those are already handled by the project's session-start mechanism
- Links from `agents.md` to role-specific documents that only some agents read

---

## 3. Workflow-Conditional Instructions Belong in Phase Documents

If an instruction only applies when a specific workflow type is active or a specific phase has been reached, it belongs in the workflow or phase-specific document - not in the role document. A role document that contains workflow-conditional review guidance will be read in flows where that guidance does not apply.

**Anti-patterns:**
- Workflow-specific review guidance in a general-purpose role document
- Forward pass closure discipline in a role document - belongs in a closure-phase document
- Brief-writing quality standards in a role document - belong in a document read when the brief is being written

---

## 4. Role Documents Are Routing Guides

A role document contains: who this agent is, what it owns, what it does not own, and what to read when specific moments arise. Nothing else.

What a role document does not contain:
- Instructions for how to execute a phase
- Quality standards for artifacts produced in a phase
- Review criteria for artifacts produced by other roles
- Behavioral guidance that only applies to some flows or some workflow types

---

## 5. agents.md Is a Minimal Orientation Entry Point

`agents.md` is the first document every agent reads. Its scope is: what the project is (one paragraph), the authority/conflict resolution model, and project-wide invariants. Nothing else.

What `agents.md` does not contain:
- Links to documents already in required readings for any role
- Explanation of the index or the required-readings mechanism when those are already handled by the project's session-start mechanism
- A roles table - role assignment happens outside `agents.md`
- Any section whose information is available through another channel already in scope
```

---

### 4. `$INSTRUCTION_ADOCS_DESIGN` (new)

**Proposed file:** `$INSTRUCTION_ADOCS_DESIGN`

```markdown
# How to Create an a-docs Design Principles File

## What It Is

An a-docs design-principles file is a standing document that governs how the project's agent-documentation is written, structured, and maintained. It captures the structural rules behind the documentation layer itself: when to point instead of inline, when to split phase guidance into separate files, and how small `agents.md` and role files should remain.

It is not a folder structure document. It does not say where content belongs in the repository overall. It says how `a-docs/` artifacts should be authored so agents receive the right context at the right moment.

---

## Why Projects Need It

Without a written a-docs design model, the documentation layer tends to degrade in predictable ways:

- Entry documents accumulate explanation of runtime mechanisms and indexes that agents already receive elsewhere
- Role documents collect phase-specific instructions inline because there is no explicit rule telling authors to move them out
- New guidance gets added without checking what older guidance it makes redundant

The result is context bloat, duplication, and stale operational detail in the very documents agents read first.

---

## When to Create It

Create this file during project initialization.

Do not wait until the project is "mature." The point of the file is to shape the documentation layer as it is being created, not only after drift has already accumulated.

---

## How to Create It

1. Start from `$GENERAL_ADOCS_DESIGN`.
2. Place the instantiated file at the root of the project's `a-docs/` as `a-docs-design.md`.
3. Register it in the project index as `$[PROJECT]_ADOCS_DESIGN`.
4. Add it to the Owner and Curator starting-context set for the project (required readings or the project's equivalent startup-context mechanism).

The general template should usually be adopted with minimal modification. Only project-specific wording that truly needs instantiation should change.

---

## How It Relates to Other a-docs Artifacts

- `agents.md` remains the orientation entry point
- role documents remain role-specific routing guides
- workflow and phase documents hold workflow-conditional instructions
- the improvement protocol uses this document as a standard when backward-pass findings evaluate documentation structure

This file governs the authoring model of the a-docs layer. It does not replace the purpose of any of the artifacts above.

---

## Keeping It Current

Update the file when the project's a-docs authoring model changes materially - for example:
- when role files are restructured around new just-in-time reads
- when `agents.md` scope changes
- when the project adds or retires a standing anti-pattern check in meta-analysis

Do not update it for one-off edits that do not change the documentation model.

---

## Improvement Protocol Interaction

Meta-analysis should treat this document as a standing evaluation standard. When backward-pass findings identify:
- redundant context in `agents.md`
- workflow-conditional instructions embedded in role files
- additions that left vestigial content behind

the finding should be framed against this document's principles rather than as an isolated stylistic preference.

If the project introduces new recurring a-docs anti-pattern checks in meta-analysis, update this file so the design rule and the backward-pass check remain aligned.
```

---

### 5. `$A_SOCIETY_AGENTS` cleanup

**Proposed resulting file:**

```markdown
# A-Society: Agent Orientation

This file is the entry point for any agent working on the A-Society project. Read it first. Read it fully. Do not begin work until context is confirmed.

---

## What Is This Project?

A-Society is a reusable, portable framework for making any project agentic-friendly - before agents are deployed. It is a library of patterns, instructions, and role templates that any project owner can apply to structure their project so agents can operate confidently from the first session.

---

## Authority & Conflict Resolution

When two sources give conflicting guidance, resolve in this order:

1. The project vision (`$A_SOCIETY_VISION`) - direction and scope
2. The structure document (`$A_SOCIETY_STRUCTURE`) - placement and organization
3. The role document - behavioral authority within a session
4. This file - orientation and role assignment

If the conflict cannot be resolved using these sources: stop and ask the human.

---

## Invariants

- **Do not invent rules.** If a rule is not written in `a-society/`, assume it does not exist. Ask rather than invent.
- **Do not drift scope.** The framework covers all projects. A proposed addition that only applies to one type of project (e.g., only software, only technical teams) does not belong in `general/`.
- **Do not modify project-specific content.** Files under `llm-journey/` or any other project folder are not within the scope of an A-Society agent session.
- **Historical artifacts are immutable.** Once an artifact is superseded and archived, do not rewrite it to match newer conventions.
```

---

### 6. `$A_SOCIETY_OWNER_ROLE` restructure

#### 6A. Proposed placement and variable names

- `$A_SOCIETY_OWNER_BRIEF_WRITING` -> `a-society/a-docs/roles/owner/brief-writing.md`
- `$A_SOCIETY_OWNER_TA_REVIEW` -> `a-society/a-docs/roles/owner/ta-advisory-review.md`
- `$A_SOCIETY_OWNER_CLOSURE` -> `a-society/a-docs/roles/owner/forward-pass-closure.md`

#### 6B. Proposed in-file changes

**Authority & Responsibilities -> Workflow routing bullet**

Replace the current workflow-routing bullet with:

> - **Workflow routing** - routing work into the appropriate workflow by default. When the user makes a request, read `$A_SOCIETY_WORKFLOW` to route it and `$INSTRUCTION_WORKFLOW_COMPLEXITY` for tier selection and intake procedure. When work spans multiple role types or implementation domains, design a single flow that routes through all required roles - using parallel tracks where steps are independent. Do not fragment a single feature into separate flows on the basis that it involves multiple role types.

**Post-Confirmation Protocol**

Replace the current section with:

```markdown
## Post-Confirmation Protocol

After confirming context, ask what the human wants to work on.

What would you like to work on?

Then route per `$A_SOCIETY_WORKFLOW` and `$INSTRUCTION_WORKFLOW_COMPLEXITY`. If the human explicitly asks to discuss or stay outside the workflow, the Owner may do so.
```

**Remove from `$A_SOCIETY_OWNER_ROLE`:**
- `## Brief-Writing Quality`
- `## Constraint-Writing Quality`
- `## TA Advisory Review`
- `## Forward Pass Closure Discipline`

**Keep in `$A_SOCIETY_OWNER_ROLE` in this flow:**
- `## Review Artifact Quality`
- `## How the Owner Reviews an Addition`

**Add a new routing section in place of the removed inline phase sections:**

```markdown
## Just-in-Time Reads

When writing a brief or review constraint, read `$A_SOCIETY_OWNER_BRIEF_WRITING`.

When reviewing a TA advisory, read `$A_SOCIETY_OWNER_TA_REVIEW`.

When closing a forward pass, read `$A_SOCIETY_OWNER_CLOSURE`.
```

#### 6C. Proposed extracted file: `$A_SOCIETY_OWNER_BRIEF_WRITING`

**Proposed file:** `$A_SOCIETY_OWNER_BRIEF_WRITING`

```markdown
# Owner Brief Writing

## Brief-Writing Quality

When a change is fully derivable from existing instructions - no ambiguity about scope, target, or implementation approach - write a fully-specified brief:

- Cover all three dimensions explicitly: scope, target file(s), and implementation approach
- State **"None"** explicitly in the Open Questions section
- This signals to the Curator that the proposal round is mechanical: no judgment calls, straight to draft content

A fully-specified brief eliminates revision cycles for straightforward changes. Reserve open questions for changes that genuinely require Curator judgment.

**Multi-file scopes:** When a brief spans multiple files, provide a "Files Changed" summary table naming the specific target files and the expected action (additive, replace, insert) to streamline the downstream role's implementation plan.

**Removed type surfaces require consumer enumeration.** When a brief removes or renames a union variant, enum value, interface member, event type, or other consumed program element, enumerate not only the definition site but also the consuming call sites that must change to keep the layer valid. A type-surface removal mechanically implies downstream edits; list those consuming files in the Files Changed table rather than leaving the receiving role to discover them during implementation.

**Prose insertions:** When a brief directs a downstream role to insert text into existing prose, provide the exact immediately adjacent target clause or phrase at the insertion boundary. Acceptable forms: "after the clause ending '...X'," "before the sentence beginning 'Y'," or "replace the phrase 'Z' with." If the insertion is bounded from both sides, name the immediately adjacent clause on each side - not a nearby landmark elsewhere in the section. A brief that names only the section leaves the receiving role to infer the exact insertion point, which creates ambiguity and can require a correction round.

**Structured-entry replacement boundary.** When directing a change within a structured documentation entry - such as a table row, index entry, log item, or role-table record - state whether the replacement applies to the full entry or only a named sub-element within it (for example, "update only the Description cell" vs. "replace the full row"). A brief that specifies only the target entry without bounding the replacement scope leaves the receiving role to infer which parts are in scope, which can result in either over-replacement (unintended changes to adjacent fields) or under-replacement (incomplete updates).

**Instruction-text variable references:** When a brief proposes text that itself contains `$VAR` references, use only variable names that actually exist in the relevant index. If no project-agnostic variable name exists for the concept being described, use a functional description instead - for example, "the variable registered in the project's index for the agents entry point" - rather than inventing a fictional placeholder.

**Authority designation:** The `[Curator authority - implement directly]` label can designate write authority outside the receiving role's default scope when the Owner explicitly scopes it in the brief. Absent explicit designation, the receiving role operates within its default scope. The brief is the correct home for explicit authority designation.

**Mixed-scope Curator briefs need an execution-timing rule.** When a brief to the Curator combines approval-scoped work with direct-authority `[MAINT]` or `[Curator authority - implement directly]` items, state whether the direct-authority items should be implemented immediately on receipt or batched into the post-approval implementation pass. Authority answers who may do the work; the brief must also answer when that work should occur.

**Topology-based obligation:** When a flow has no Proposal phase (per the workflow plan), the brief must explicitly state that no proposal artifact is required before implementation begins.

**Output-format changes are not mechanical.** Any change that introduces a new required field, a new template section, or a new required structural element in the output carries design decisions about what the output should look like - those decisions belong in the brief, not left to the Curator. A brief that introduces an output-format change must explicitly specify the expected output form. "Open Questions: None" is only correct when the output form is also fully derivable from the brief.

When proposing an output-format change, also assess whether the change makes any existing field, section, or type value obsolete - and scope that removal explicitly in the brief. A brief that adds a new section without checking what the addition makes vestigial transfers that obsolescence assessment to the Curator unnecessarily.

**Removal-of-dependents scoping.** When a brief scopes removal of an item from a numbered or structured list, explicitly enumerate any other content in that file - or in sibling files receiving the same removal - that depends on the removed item and would become vestigial after its removal. This includes format blocks gated on the removed item, cross-references to it, and any prose whose meaning changes when the item no longer exists. Apply this consistently across all target files in the brief; do not scope explicit dependent removal for only the first instance noticed and leave the same pattern implicit in the remaining files.

**Project-specific convention changes require mirror assessment.** When a brief modifies a project-specific convention that instantiates a reusable general instruction, explicitly assess the general counterpart in the brief. Either scope the general instruction as a co-change or declare it out of scope with rationale. Do not leave the mirror decision implicit; otherwise the Curator must guess whether parity maintenance is in scope.

**Runtime-injected file references must name the project layer.** When a brief or review specifies a file the runtime will inject into project sessions, reference the project's own `a-docs/` artifact or explicitly require derivation from project context (for example `flowRun.projectRoot`). Do not use `$GENERAL_*` template variables as runtime injection targets; those name framework templates, not project session inputs.

**Schema migrations require a vocabulary sweep.** When a brief changes a schema, field name, or structural vocabulary, explicitly scope a surrounding prose sweep for deprecated terms as part of the same work. Updating the schema block alone is incomplete if adjacent explanations still use the old terminology.

**Schema-code coupling check.** When a documentation change defines or modifies a schema with a programmatic consumer (a type definition, parser, or validator in the codebase), the brief must scope both the documentation change and the corresponding code change in the same flow. At brief-writing time, ask: "Does this documentation change define or modify a schema that is consumed programmatically?" If yes, identify the programmatic consumer and include it in the flow scope. A brief scoped documentation-only when code must also change fragments the work and requires external correction.

**Executable-layer verification scope must name the boundary.** When a brief asks the Tooling Developer or Runtime Developer to verify a change under `tooling/` or `runtime/`, specify the intended verification boundary explicitly: file-local, module/package-wide, or repository-wide. Do not say "confirm the module compiles" when the scoped work only names one file unless the brief also makes the module-wide verification obligation explicit. If sibling consumers or compile surfaces must be checked to call the work complete, name them in the brief rather than leaving the receiving role to discover the breadth during implementation.

**Verification obligations must specify output content, not just successful execution.** When a verification obligation requires confirming a documentation change or an output-format requirement, name the specific content: what must be absent, what must be present, or which fields the output must include. "Runs without error" or "confirm the section is removed" is not a sufficient verification standard - a command that runs successfully can still produce under-specified output, and a document can retain prohibited content while technically compiling or rendering. A Developer who passes all listed verification obligations without content-precision standards has not deviated from the spec; the spec has incomplete verification scope.

**Multi-mode scope declaration.** When a brief targets a component that has distinct execution paths (for example, interactive and autonomous modes, synchronous and asynchronous paths, TTY and non-TTY paths), explicitly declare which modes are in scope - or state that all modes are in scope. Do not rely on interactive framing to convey full scope implicitly. A brief framed around the interactive path that does not declare "applies to both paths" will be correctly read as interactive-only by the receiving role. Catching the omission requires a full re-draft; one sentence of scope declaration eliminates the correction round.

**Do not pre-specify update report classification.** If the change described in a brief may trigger a framework update report, do not state an expected impact classification. Classification is determined by the Curator post-implementation by consulting `$A_SOCIETY_UPDATES_PROTOCOL`. Stating a classification in the brief creates framing the Curator must override - which adds a correction round rather than eliminating one.

**`[LIB]` brief trigger for update report drafts.** When a `[LIB]` flow is likely to qualify for a framework update report, the brief must explicitly instruct the Curator to include the update report draft as a named section in the proposal submission. When classification cannot yet be determined, instruct the Curator to include the draft with classification fields marked `TBD`, to be resolved at Phase 4 by consulting `$A_SOCIETY_UPDATES_PROTOCOL`. This requirement comes from Phase 1 of `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`; surface it in the brief rather than relying on the Curator to infer it from the workflow document mid-flow.

**Update report drafts for newly created files must use proposed `$VAR` names.** When a brief asks the Curator to draft an update report for files being created or indexed in the same flow, name those files in the draft using their proposed variable names rather than raw paths. Proposed `$VAR` names are acceptable in draft content before registration when the same brief also scopes the index additions that will define them.

The same applies to approval rationale for main decisions: do not comment on expected classification when approving a content change. The Follow-Up Actions section directing the Curator to check `$A_SOCIETY_UPDATES_PROTOCOL` is the correct mechanism - no anticipation needed.

This prohibition applies to briefs and to the main approval rationale - those two contexts only.

**Behavioral property consistency:** When specifying behavioral properties (ordering, mutability, timing constraints), verify that they are internally consistent before sending. A brief that seeds contradictory properties will have those contradictions reproduced downstream.

Classification guidance issued in **update report phase handoffs** is permitted and is a positive practice: when directing the Curator to consult `$A_SOCIETY_UPDATES_PROTOCOL` after implementation, noting a likely classification as orienting guidance does not create framing that must be overridden, because classification is now actually determinable.

**Tooling dev flows: cross-check Phase 7 obligations when authorizing Curator scope.** When writing a Curator authorization for a tooling development flow, do not derive scope solely from the TA advisory's Section 5 (Files Changed). Phase 7 of the tooling dev workflow carries standing Curator obligations - including update report assessment (`$A_SOCIETY_UPDATES_PROTOCOL`) and index registration - that apply regardless of what the TA brief scoped. Cross-check the Phase 7 obligations explicitly against the authorization list before finalizing the brief.

**TA design briefs require a constraint/preference partition.** When a brief asks a Technical Architect to produce a design, constraints in the brief must be genuinely non-negotiable - derived from framework invariants, explicit user direction, or immovable prior decisions. A design preference or working hypothesis is not a constraint; presenting it as one closes off design space the TA is specifically engaged to evaluate. If the Owner has a hypothesis about the right direction, name it as a preference with rationale and require the TA to address it - do not convert it into a prohibitive constraint. The test: "Would I reject a TA advisory that explored this option?" If the answer is "I don't know," it is not a constraint.

---

## Constraint-Writing Quality

When a decision artifact or review constraint directs downstream implementation checks, write the constraint with the same precision required of briefs. Constraint language should be mechanically followable by the receiving role without needing pattern inference.

**Registration scope must be file-based.** When directing index registration or verification, scope the instruction by the newly created or modified files, not by their parent directory, unless the directory boundary is itself the point of the constraint. "Verify whether `$A_SOCIETY_INDEX` needs updating for any newly created or modified files" is mechanically actionable; a location-based qualifier can accidentally exclude the relevant file.

**Public-index variable retirement requires a reference sweep.** When a brief, convergence decision, or other Owner authorization retires a public-index variable or deletes a publicly registered artifact, sweep `a-society/` for references to that `$VARIABLE_NAME` before finalizing scope. Explicitly name every dependent file that must change, including any `general/` artifacts, so required `[LIB]` authorization is granted up front rather than retroactively.
```

#### 6D. Proposed extracted file: `$A_SOCIETY_OWNER_TA_REVIEW`

**Proposed file:** `$A_SOCIETY_OWNER_TA_REVIEW`

```markdown
# Owner TA Advisory Review

## TA Advisory Review

When reviewing a Technical Architect advisory, apply two distinct criteria: design correctness and spec completeness. Design correctness is not sufficient - the advisory must also be complete enough that the Developer can implement from the Interface Changes section (Section 4) alone.

**Section 4 completeness check.** For every parameter change described in Section 4 (Interface Changes), verify that the full implementation path is specified. If a new parameter on a public function must be threaded through to an internal call, that threading path must appear in Section 4 - not only in the Section 5 Files Changed table. A parameter change that requires the Developer to independently infer threading is an incomplete spec.

**Data-extraction type coverage check.** For every type that represents data parsed from model output (tool calls, handoff blocks, YAML frontmatter, JSON responses), verify that the type includes a mechanism to represent parse failure. A type that specifies only the happy-path fields is structurally incomplete. Also verify that every internal execution path - including no-tool, no-op, and fallback paths - has its non-happy-path behavior explicitly specified in the advisory's per-file implementation requirements, not left as an implied passthrough.
```

#### 6E. Proposed extracted file: `$A_SOCIETY_OWNER_CLOSURE`

**Proposed file:** `$A_SOCIETY_OWNER_CLOSURE`

```markdown
# Owner Forward Pass Closure

## Forward Pass Closure Discipline

When a closing flow surfaces new Next Priorities items, add or merge those log entries in `$A_SOCIETY_LOG` before filing the forward pass closure artifact. The closure artifact should reflect the already-updated project state; it is not the step that leaves log maintenance for later.

At forward pass closure, after the flow's changes are confirmed, the Owner sweeps Next Priorities entries whose target files or design areas overlap with the scope of the completed flow. The same four-case taxonomy applies (addressed, contradicted, restructured, partially addressed). Relevant entries are updated, narrowed, or removed before the closure artifact is filed.

**Executable-layer API removals require cross-consumer verification.** When a tooling or runtime flow removes, renames, or deprecates a public function, exported type, CLI entry point, or other consumed executable-layer interface, closure verification must include a sweep of in-repo consumers across `tooling/` and `runtime/` before the forward pass is declared closed. Do not treat the edited file or local test target as sufficient verification when another executable layer may still import or invoke the retired surface.

**Closure artifact numbering uses sequence slots, not raw file count.** Before naming a forward-pass closure artifact, read the active record folder and identify the next available numeric slot from the actual sequence positions. Sub-labeled artifacts such as `02a` / `02b` share slot `02`; they do not consume additional whole-number positions. Do not derive the closure artifact number by counting filenames.

**Archive the displaced Previous entry, not the closing flow.** When updating `$A_SOCIETY_LOG` and `$A_SOCIETY_LOG_ARCHIVE` at closure, the archive target is the oldest item displaced from the `Previous` list by the new Recent Focus entry. Do not archive the flow that is currently closing unless it is itself the item being displaced by a later closure.

**Multi-track path portability.** For flows with multiple parallel tracks, verify at closure that all track convergence artifacts (e.g. completion artifacts filed by non-Curator roles) do not contain machine-specific absolute paths or `file://` URLs. Confirming functional completeness is not sufficient - handoff artifact format portability must also be confirmed. A `file://` path in a terminal track artifact violates the path portability rule even if the path was not used for routing.

**Update-report path naming.** When a forward pass closure artifact instructs the Curator to publish a framework update report, specify the filename using the `$A_SOCIETY_UPDATES_PROTOCOL` contract: `[YYYY-MM-DD]-[brief-descriptor].md` within `$A_SOCIETY_UPDATES_DIR`. A date-only filename is non-compliant with the programmatic parsing contract and will be ignored by the Version Comparator.
```

---

### 7. `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS`

**Proposed insertion point:** after `### Useful Lenses`, before `### Output Format`

```markdown
### a-docs Structure Checks

When the reviewed artifact lives in `a-docs/` or affects the agent-documentation layer, apply these additional checks:

1. **Redundancy check:** Does this document reference, explain, or link anything already in the agent's injected context or required readings? If yes, flag the specific lines for removal.
2. **Phase-coupling check:** Does this role document contain instructions applicable only at a specific workflow phase? If yes, flag the section for extraction to a phase-specific document and add a pointer.
3. **Workflow-conditioning check:** Does this document contain instructions applicable only in specific workflow types (for example, only flows with a TA, only flows with a forward pass closure)? If yes, flag the section for extraction.
4. **Role document scope check:** Does this role document contain anything beyond routing guidance, ownership declaration, and pointers to phase-specific documents? If yes, flag the excess.
5. **agents.md scope check:** Does `agents.md` contain anything beyond: what the project is (one paragraph), the authority/conflict resolution model, and project-wide invariants? If yes, flag it for removal.
6. **Addition-without-removal check:** When a new instruction is added to a role document or `agents.md`, does any existing content become redundant or vestigial? If yes, flag it. Adding without checking what the addition makes obsolete is how garbage accumulates.
```

---

### 8. `$GENERAL_IMPROVEMENT_META_ANALYSIS`

**Proposed insertion point:** after `### Useful Lenses`, before `### Output Format`

```markdown
### a-docs Structure Checks

When the reviewed artifact lives in the project's `a-docs/` or affects the agent-documentation layer, apply these additional checks:

1. **Redundancy check:** Does this document reference, explain, or link anything already in the agent's starting context via required readings or runtime injection? If yes, flag the specific lines for removal.
2. **Phase-coupling check:** Does this role document contain instructions applicable only at a specific workflow phase? If yes, flag the section for extraction to a phase-specific document and add a pointer.
3. **Workflow-conditioning check:** Does this document contain instructions applicable only in specific workflow types? If yes, flag the section for extraction.
4. **Role document scope check:** Does this role document contain anything beyond routing guidance, ownership declaration, and pointers to phase-specific documents? If yes, flag the excess.
5. **agents.md scope check:** Does the project's `agents.md` contain anything beyond: what the project is (one paragraph), the authority/conflict resolution model, and project-wide invariants? If yes, flag it for removal.
6. **Addition-without-removal check:** When a new instruction is added to a role document or `agents.md`, does any existing content become redundant or vestigial? If yes, flag it. Adding without checking what the addition makes obsolete is how garbage accumulates.
7. **Repeated-header matching guidance:** When editing files with repeated semantic sub-headers (for example, `### Roles` appearing under multiple parent `##` headings), include the parent section header in the match context to preserve placement integrity. A mis-edit that places content under the wrong parent due to ambiguous header matching is a structural error, not a minor slip.
```

---

### 9. Registration and maintenance implications

If approved, implementation should include:

- `$A_SOCIETY_INDEX`
  - add `$A_SOCIETY_ADOCS_DESIGN`
  - add `$GENERAL_ADOCS_DESIGN`
  - add `$INSTRUCTION_ADOCS_DESIGN`
  - add `$A_SOCIETY_OWNER_BRIEF_WRITING`
  - add `$A_SOCIETY_OWNER_TA_REVIEW`
  - add `$A_SOCIETY_OWNER_CLOSURE`

- `$A_SOCIETY_PUBLIC_INDEX`
  - add `$GENERAL_ADOCS_DESIGN`
  - add `$INSTRUCTION_ADOCS_DESIGN`

- `$A_SOCIETY_AGENT_DOCS_GUIDE`
  - add an entry for `$A_SOCIETY_ADOCS_DESIGN`
  - add entries for `$A_SOCIETY_OWNER_BRIEF_WRITING`, `$A_SOCIETY_OWNER_TA_REVIEW`, and `$A_SOCIETY_OWNER_CLOSURE`

- `$A_SOCIETY_REQUIRED_READINGS` (scope refinement recommended)
  - add `$A_SOCIETY_ADOCS_DESIGN` to Owner and Curator role-specific lists

- `$GENERAL_MANIFEST`
  - add `path: a-docs-design.md`
  - set `required: true`
  - set `scaffold: copy`
  - set `source_path: general/a-docs-design.md`

Rationale for the manifest recommendation: this is a cross-cutting design artifact meant to exist in every initialized project under the new model. If the Owner does not want it instantiated universally, the correct alternative is `required: false` with `copy` - not `stub`.

---

## Update Report Draft

This flow is likely to qualify for a framework update report because it introduces a new project artifact type in `general/`, adds a new instruction in `general/instructions/`, changes the distributable meta-analysis template, and likely changes `$GENERAL_MANIFEST`.

Because final classification depends in part on whether `a-docs-design.md` is approved as a required manifest entry, the draft below leaves version and classification fields as `TBD` for Phase 4 resolution per `$A_SOCIETY_UPDATES_PROTOCOL`.

---

# A-Society Framework Update - 2026-04-07

**Framework Version:** vTBD
**Previous Version:** vTBD

## Summary

A new a-docs design-principles artifact has been added to the general library, alongside a companion instruction for creating and maintaining it. The general meta-analysis template also gains standing a-docs structure checks so Curators can detect front-loaded context, redundant entry-point material, and phase-specific instructions embedded inline in role files.

Projects that maintain `agents.md`, role documents, and backward-pass meta-analysis instructions should review the new design artifact and assess whether their current a-docs structure front-loads guidance that should instead be moved to on-demand phase documents.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | TBD | Depends on whether `a-docs-design.md` is approved as a required initialized artifact |
| Recommended | TBD | Improvement-level structural guidance and meta-analysis checks |
| Optional | TBD | No optional-only items anticipated at proposal time |

---

## Changes

### New a-docs design-principles artifact

**Impact:** TBD
**Affected artifacts:** `$GENERAL_ADOCS_DESIGN`, `$INSTRUCTION_ADOCS_DESIGN`, `$GENERAL_MANIFEST`
**What changed:** Added a new ready-made artifact, `$GENERAL_ADOCS_DESIGN`, and a companion instruction, `$INSTRUCTION_ADOCS_DESIGN`, defining how projects should structure agent-documentation around progressive context disclosure, minimal entry documents, and phase-specific support docs. If approved at implementation, `$GENERAL_MANIFEST` will also be updated so new projects instantiate `a-docs-design.md` automatically.
**Why:** Projects need an explicit design model for the documentation layer itself. Without one, `agents.md` and role files accumulate runtime-mechanism explanation, redundant links, and phase instructions that belong in separate on-demand documents.
**Migration guidance:** Review whether your project has a standing a-docs design-principles artifact. If not, assess whether to add `a-docs-design.md` at the root of your project's `a-docs/`, register it in your project index as `$[PROJECT]_ADOCS_DESIGN`, and add it to the Owner and Curator starting-context set. Then compare your `agents.md` and role files against the design principles: if they front-load phase-specific instructions or duplicate already-injected context, plan a maintenance flow to extract that material into phase-specific documents.

---

### Meta-analysis gains standing a-docs structure checks

**Impact:** TBD
**Affected artifacts:** `$GENERAL_IMPROVEMENT_META_ANALYSIS`
**What changed:** Added a new `a-docs Structure Checks` section to the general meta-analysis template. The new checks cover redundancy with injected context, phase-coupling inside role files, workflow-conditional inline guidance, over-scoped `agents.md`, addition-without-removal drift, and repeated-header matching discipline.
**Why:** These structural issues recur unless backward-pass work is explicitly told to look for them. Without standing checks, front-loaded context and vestigial inline guidance are treated as accidental style drift instead of a maintainable class of documentation errors.
**Migration guidance:** Review your project's backward-pass meta-analysis instructions. If they are based on `$GENERAL_IMPROVEMENT_META_ANALYSIS`, assess whether they already prompt reviewers to check for redundant entry-point content, phase-specific instructions embedded in role files, and vestigial content left behind after additive changes. If not, update the project-specific meta-analysis instructions accordingly.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.

---

## Owner Confirmation Required

Specific confirmations requested at Phase 2:

1. Approve or revise the proposed `roles/owner/` subfolder placement for the extracted Owner phase documents.
2. Approve or revise the recommendation to keep `## Review Artifact Quality` inline in `$A_SOCIETY_OWNER_ROLE` for this flow.
3. Approve or revise the scope refinements for `$A_SOCIETY_REQUIRED_READINGS`, `$A_SOCIETY_INDEX` (general variables), and `$A_SOCIETY_AGENT_DOCS_GUIDE` (entries for all new `a-docs/` files).
4. Confirm whether `a-docs-design.md` should be a required initialized artifact in `$GENERAL_MANIFEST` (`copy`) or a conditional one (`copy`, `required: false`).

The Owner must respond in `04-owner-to-curator.md` with one of:
- **APPROVED** - with any implementation constraints
- **REVISE** - with specific changes required before resubmission
- **REJECTED** - with rationale

The Curator does not begin implementation until `04-owner-to-curator.md` shows APPROVED status.
