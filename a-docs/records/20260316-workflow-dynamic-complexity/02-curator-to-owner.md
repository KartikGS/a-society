---

**Subject:** Dynamic workflow construction — complexity-proportional task routing
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-16

---

## Trigger

Human identified a structural gap in the current A-Society workflow: the full multi-role pipeline applies uniformly to every task regardless of size or complexity. Direction and scope agreed in session and formalized in `01-owner-to-curator-brief.md`.

---

## What and Why

**What:** A new general instruction document defining a dynamic complexity model for per-task workflow construction. At intake, the Owner conducts a complexity analysis and constructs a workflow path proportional to the task's actual demands — from single-agent execution to full pipeline. The same governing principles and hard rules apply at every tier; what scales is the path through the graph.

**Why:** The current workflow's uniform overhead creates a mismatch: for simple tasks, the pipeline cost exceeds the work itself. This erodes trust in the framework and creates pressure to bypass it. The fix is not a lighter workflow — it is proportional construction. A two-line index registration and a new framework capability route differently, by design.

**Generalizability:** The five complexity axes (domain spread, shared artifact impact, dependency between steps, reversibility, scope size) are domain-agnostic. A writing project deciding whether to route a minor edit or a structural revision applies the same axes as a software project. The three-tier model applies equally to any project with a defined workflow and roles. This instruction is not A-Society-specific.

---

## Where Observed

A-Society — internal. The mismatch between pipeline overhead and task complexity has been observed across multiple A-Society flows, particularly for registration-only and cross-reference changes that do not warrant a full brief-proposal-review cycle.

---

## Target Location

- **New file:** `$INSTRUCTION_WORKFLOW_COMPLEXITY` — `/a-society/general/instructions/workflow/complexity.md`
- **Index registration (internal):** `$A_SOCIETY_INDEX` — one new row for `$INSTRUCTION_WORKFLOW_COMPLEXITY`
- **Index registration (public):** `$A_SOCIETY_PUBLIC_INDEX` — one new row for `$INSTRUCTION_WORKFLOW_COMPLEXITY`
- **Cross-reference addition:** `$INSTRUCTION_WORKFLOW_MODIFY` — one pointer added to the "Relationship to Other Instructions" section
- **a-docs-guide entry:** `$A_SOCIETY_AGENT_DOCS_GUIDE` — one new entry for `complexity.md` under `general/instructions/workflow/`
- **Manifest update:** `$GENERAL_MANIFEST` — one new file entry (see Manifest Check note below)

---

## Open Question Resolutions

### Q1 — Placement

**Decision: standalone document at `general/instructions/workflow/complexity.md`.**

The dynamic complexity model answers a categorically distinct question from all existing workflow instructions:

- `$INSTRUCTION_WORKFLOW` — how to *create* a workflow (design-time structure)
- `$INSTRUCTION_WORKFLOW_MODIFY` — how to *modify* a workflow's static structure (design-time structure)
- `complexity.md` (proposed) — how to *select and construct a path* through the workflow for a given task (intake-time routing)

The first two are design-time operations: they change the graph itself. This document is a runtime operation: it governs how the Owner traverses a defined graph for a specific task. Merging it into either existing document would confuse their purpose. The distinction maps cleanly to a separate file.

The namespace parity exception (single-file sub-folder) does not apply here — the document sits alongside three existing files in `general/instructions/workflow/` as a flat peer, which is appropriate given the three-file threshold for a new sub-folder is already met by the existing files.

### Q2 — Hard Rule 2 compatibility

**Decision: option (a) — the Owner's workflow plan is the approval gate for all tiers.**

Hard Rule 2: "Every workflow must have at least one approval gate before implementation."

Option (a) preserves the rule's intent without weakening its text. The intent of the rule is that no work proceeds without a perspective-check — something external to the implementer that confirms the work is scoped correctly. For multi-role flows, this is the Owner's Phase 2 decision artifact. For single-agent flows, the Owner is both analyst and implementer, but the workflow plan artifact records a deliberate judgment: complexity was assessed, the task was evaluated against five axes, and Tier 1 was the explicit routing decision. That judgment is the gate.

Option (b) — scoping Rule 2 to multi-role flows only — risks being read as "simple flows need no gate at all," which removes the protection the rule provides. The rule's value is not in requiring a *second person*; it is in requiring a *recorded deliberate decision* before work begins. Option (a) preserves that.

**Implication for project-specific invariants:** Project-level invariants may further constrain tier selection. For example, A-Society's Approval Invariant requires Curator-proposed `general/` additions to pass Owner review regardless of complexity score. This means any `general/` change in A-Society routes to Tier 2 or 3 by the Approval Invariant — Tier 1 is available to the Owner for `a-docs/` maintenance and similar changes that do not involve `general/`. The instruction notes this category of constraint without encoding A-Society-specific rules.

### Q3 — Backward graph tracking mechanism

**Decision: the record folder artifact sequence is the executed workflow log; no new tracking artifact is required.**

The record folder's artifact sequence already encodes who did what and in what order. Each artifact represents a completed step; the prefix ordering gives the sequence; the file names identify the role and action. This is sufficient input for the backward graph builder — either `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` (if available) or manual derivation per `$INSTRUCTION_IMPROVEMENT`.

The workflow plan artifact (produced at intake) serves a complementary role: it records the *intended* path. The artifact sequence records the *actual* path. For simple Tier 1 flows these will be identical. For more complex flows, any divergence between planned and actual path is itself a backward pass finding — surfaced naturally when the Owner or Curator reads the record at close.

No new artifact type is needed. No tooling prerequisite is created. The mechanism is immediately actionable.

---

## Manifest Check Note

The proposed file adds one entry to `general/instructions/workflow/`. If `$GENERAL_MANIFEST` enumerates files within `general/instructions/workflow/`, it requires a co-implementation update. The Owner should note this as a required co-implementation step in the Phase 2 decision if confirmed.

---

## Draft Content

---

# How to Construct a Complexity-Proportional Workflow

*This document is a companion to `$INSTRUCTION_WORKFLOW` and `$INSTRUCTION_WORKFLOW_MODIFY`. Read those documents to understand workflow creation and static modification. Read this document at intake — when the Owner must decide which workflow path a given task requires.*

---

## The Problem

A complexity-blind workflow applies uniform overhead to every task. The same multi-role pipeline — brief, proposal, approval, implementation, backward pass — applies equally to a two-line index registration and a new framework capability. For simple tasks, the overhead exceeds the work itself: this erodes trust in the framework and creates pressure to bypass it.

The solution is not a lighter workflow. The solution is **proportional workflow construction**: the same governing principles and hard rules apply to every flow; the path through the graph is sized to the task's actual demands.

---

## The Dynamic Complexity Model

At intake, the Owner conducts a complexity analysis and constructs a workflow plan. The plan specifies the roles to engage, the phases to traverse, and the artifacts to produce. For trivial tasks, this may be a single agent with a minimal record. For complex, multi-domain tasks, this is the full pipeline.

The workflow is not a fixed template applied uniformly. It is **constructed per task**, governed by the same hard rules, scaled to the task's actual demands.

Three principles govern the model:

**1. The workflow plan is the approval gate.** The Owner's complexity analysis and routing decision satisfies Hard Rule 2 ("Every workflow must have at least one approval gate before implementation") for all tiers. For single-agent flows, the Owner's plan is the gate — it records the deliberate judgment that the task is scoped for direct execution. For multi-role flows, the plan defines the path and the Owner's Phase 2 review remains the gate as usual. Rule 2 is satisfied by construction at every tier.

**2. Incremental pipeline definition.** The Owner defines the known path at intake. Other roles, once engaged, may be better positioned to make downstream decisions. The Owner does not need to pre-specify every step. Agents extend the path as clarity develops. This reduces speculative structure at the start of a flow.

**3. Backward graph tracking.** The backward pass structure is not pre-defined at intake. The executed workflow is tracked through the record folder's artifact sequence. At close, this sequence is the input to the backward graph builder. Simple forward graphs produce simple backward passes.

---

## Complexity Axes

At intake, the Owner evaluates the task against five axes:

| Axis | Question |
|---|---|
| **1. Domain spread** | Does this touch one domain or multiple? |
| **2. Shared artifact impact** | Does it modify any public or shared artifact (e.g., the index, a public interface, a shared template)? |
| **3. Dependency between steps** | Do later steps depend on decisions made in earlier steps? |
| **4. Reversibility** | Can the change be easily undone? |
| **5. Scope size** | How many files, systems, or roles are affected? |

Each axis is a signal, not a binary threshold. The Owner reads the combination to assess where the task falls on the complexity spectrum and routes accordingly.

---

## Producing a Workflow Plan

The workflow plan is the Owner's intake artifact. It is placed in the record folder as the first sequenced artifact (e.g., `01-owner-workflow-plan.md`). When a full Owner-to-Curator brief is warranted for multi-role flows, the plan may be embedded in that brief rather than produced as a separate file.

A workflow plan must specify:

1. **Complexity assessment** — a summary of the five-axis evaluation. Note the axes that are elevated; low-scoring axes require only brief acknowledgment.
2. **Routing decision** — which tier the task routes to, and why.
3. **Path definition** — the roles to engage, in order. For Tier 1, this is the Owner alone. For Tier 2 and 3, this is the sequence of handoffs.
4. **Known unknowns** — any downstream decisions better made by a later role once engaged. List these explicitly rather than speculating.

The workflow plan is the approval gate for the flow. Implementation does not begin until the plan exists.

---

## Workflow Tiers

There are three tiers. The Owner selects the appropriate tier at intake based on the complexity analysis.

### Tier 1 — Single-Agent

**Signals:**
- Domain spread: single domain
- Shared artifact impact: none, or incidental (e.g., adding a row to an index owned entirely by the executing role)
- Dependency between steps: none
- Reversibility: high
- Scope size: one to three files; one role; no second-perspective requirement

**Path:** Owner only. No additional role engagement. No Phase 2 review separate from the plan.

**Record artifacts:**
- `01-owner-workflow-plan.md` (the approval gate)
- The implementation files
- `02-owner-backward-pass.md` (findings)

**Hard Rule 2 satisfaction:** The workflow plan is the approval gate. The Owner's decision to route to Tier 1 and execute is itself the deliberate judgment step. No separate approval artifact is required.

### Tier 2 — Lightweight Pipeline

**Signals:**
- Domain spread: single domain, possibly touching a second
- Shared artifact impact: moderate (e.g., modifying a shared instruction document, updating a shared index variable)
- Dependency between steps: low; the sequence is clear at intake
- Reversibility: moderate
- Scope size: two to five files; one or two roles

**Path:** Owner brief → Curator proposal → Owner review → Curator implementation + registration → backward pass.

**Record artifacts:** Standard sequence. When scope is tightly defined, the Owner brief may be compact rather than the full Owner-to-Curator briefing template.

**Hard Rule 2 satisfaction:** Owner's Phase 2 review is the approval gate. Standard.

### Tier 3 — Full Pipeline

**Signals:**
- Domain spread: multiple domains or multiple shared areas
- Shared artifact impact: high (e.g., modifying hard rules, structural changes, changes to multiple shared artifacts)
- Dependency between steps: significant; later decisions depend on earlier ones
- Reversibility: low
- Scope size: multiple files, multiple roles, or significant project-wide impact

**Path:** Full pipeline per the project's defined workflow — Owner brief → proposal → Owner review → implementation + registration → backward pass → Owner findings → synthesis.

**Record artifacts:** Full standard sequence.

**Hard Rule 2 satisfaction:** Owner's Phase 2 review is the approval gate. Standard.

---

## Project-Specific Invariants

Project-level invariants may further constrain tier selection. For example, a project with an invariant requiring Owner approval for all additions to a shared library — regardless of complexity — must route those changes through Tier 2 or 3 by that invariant, even if the complexity score would support Tier 1. The dynamic complexity model determines the default tier; project invariants narrow the available options within it. When a project invariant and a complexity-derived tier conflict, the invariant takes precedence.

---

## Incremental Pipeline Definition

For Tier 2 and Tier 3 flows, the Owner defines the known path at intake and marks open decisions as known unknowns in the workflow plan. The engaged role then defines the next segment when it has the context to do so.

This is not permission to defer structure indefinitely. Each agent must define the next handoff before producing it. An undefined next step at a handoff point is a gap — it must be surfaced explicitly rather than improvised.

---

## Backward Graph Tracking

The backward pass is proportional to the flow. Simple flows produce simple backward passes.

**Source:** The record folder's artifact sequence is the executed workflow log. Each artifact represents a completed step; the prefix ordering gives the sequence; the file names identify the role and action.

**At close:** The Owner or Curator (depending on tier) reads the record folder artifact sequence and derives the traversal order for the backward pass. This is the input for `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` if available; otherwise derive manually per `$INSTRUCTION_IMPROVEMENT`.

**Planned vs. actual path:** The workflow plan records the intended path; the artifact sequence records the actual path. For Tier 1 flows these will typically be identical. For more complex flows, any divergence between planned and actual path is itself a backward pass finding — surfaced naturally when the record is reviewed at close.

**For Tier 1:** The Owner produces backward pass findings immediately after implementation. No multi-role synthesis step.

**For Tier 2 and 3:** Standard backward pass order per the project's defined workflow.

---

## Hard Rules — Applicability

All hard rules from `$INSTRUCTION_WORKFLOW_MODIFY` apply unchanged to the dynamic complexity model. Tier selection does not suspend any rule; it determines which artifacts and handoffs are present, not whether the rules govern them.

| Rule | How it applies to all tiers |
|---|---|
| 1. Every handoff produces a written artifact | The workflow plan is the first artifact. Every handoff that occurs must still carry an artifact. The tier affects which handoffs occur — not whether artifact production applies. |
| 2. Approval gate before implementation | Satisfied at all tiers: Tier 1 by the workflow plan; Tier 2 and 3 by the Owner's Phase 2 decision artifact. |
| 3. Each step owned by exactly one role | Applies unchanged. For Tier 1, all steps are owned by the Owner — one role, not shared. |
| 4. Workflow indexed before referenced | Applies unchanged. Any new sub-flow or named workflow must be indexed before it can be referenced. |
| 5. No step requires context not produced by a prior step | Applies unchanged. The workflow plan must be complete enough for the next role to begin from it without undocumented context. |
| 6. Role-defined, not agent-defined | Applies unchanged. |
| 7. Records immutable once produced | Applies unchanged. |

---

## Refinement Over Time

The five complexity axes and three tiers represent the best current model for proportional workflow construction. They will be refined as flows reveal where the model fails — cases where a Tier 1 routing produced work that required rework because it should have been Tier 2, or where Tier 3 routing caused unnecessary overhead for a task that turned out to be simple.

Refinements are proposed and approved through the standard workflow. The model is a living instrument; it is not frozen.

---

## Relationship to Other Instructions

- **`$INSTRUCTION_WORKFLOW`** — how to create a workflow from scratch. The dynamic complexity model governs how a defined workflow is traversed, not how it is created.
- **`$INSTRUCTION_WORKFLOW_MODIFY`** — how to modify the static structure of a workflow (design-time). The complexity model is about intake-time path selection; workflow modification is about design-time structural change. These are distinct operations.
- **`$INSTRUCTION_WORKFLOW_GRAPH`** — machine-readable graph representation. When a workflow has YAML frontmatter, the backward graph builder uses it as input alongside the record folder artifact sequence.
- **`$INSTRUCTION_IMPROVEMENT`** — the backward pass protocol. Backward pass traversal order is defined there; this document defines only the mechanism for deriving the traversal input from the record folder.

---

*End of draft content.*

---

## Owner Confirmation Required

The Owner must respond in `03-owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints (including Manifest Check confirmation)
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `03-owner-to-curator.md` shows APPROVED status.
