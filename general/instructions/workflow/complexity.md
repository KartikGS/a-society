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

## Structural Readiness Assessment

Before conducting complexity analysis, the Owner runs a structural readiness assessment. This assessment determines whether the task can be handled by the existing structure at all. It is a gate: a task that fails it does not proceed to complexity analysis or tier selection.

There are three sequential checks.

**Check 1 — Feasibility**

Is the task possible at all? If no: tell the user directly, explain why (invariant violation, scope conflict, structural impossibility), and probe for the underlying need — sometimes an impossible framing hides an achievable one. Do not route.

**Check 2 — Structural Routability**

Can the task be handled by the existing structure? Two dimensions, both must be true:

- *Role authority:* Does any defined role have the authority and responsibility for this task? Verify against role documents — the scope boundary definition lives in the role file itself, not in a separate metadata artifact.
- *Workflow routability:* Does an existing workflow cover this task?

If either dimension fails, a structural gap exists.

**Check 3 — Frequency Assessment** *(only when a gap is found in Check 2)*

How often will this task or similar tasks recur? This determines whether the appropriate response is to build a full new workflow or role, or to handle the task as a scoped one-off exception with explicit Owner direction. This is a sizing question, not a feasibility question — ask it only after a gap is confirmed.

**Handling by Outcome**

| Outcome | Action |
|---|---|
| Impossible | Tell user directly, explain why, probe for underlying need. Do not route. |
| Structurally ready | Proceed with complexity analysis as normal. |
| Structural gap found | Apply Structural Gap Protocol (see below). |
| User overrides structural gap | Document the gap and risk explicitly in the workflow plan as a known constraint. Proceed only with explicit user direction. |

**Structural Gap Protocol**

When a structural gap is found and the user wants to proceed with addressing it:

1. Tell the user what specifically is missing — a role with appropriate authority, a workflow, or both.
2. Describe what setup would involve (new role, new workflow, or modification to existing).
3. Get explicit user permission before opening a setup flow.
4. Add the deferred task to Next Priorities in the project log with a dependency note (e.g., "depends on: structural setup — flow to be opened"). Update the entry with the setup flow identifier once the record folder is created in step 5.
5. Open a separate setup flow through standard intake — including this structural readiness assessment, which will now pass since the structure is being built.
6. When the setup flow completes, the deferred task re-enters intake as a new flow.

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

The workflow plan is the Owner's intake artifact. Use `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` as the base; place the instantiated plan in the record folder as `01-owner-workflow-plan.md`. When a full Owner-to-Curator brief is warranted for multi-role flows, the plan may be embedded in that brief rather than produced as a separate file.

A workflow plan must specify:

1. **Complexity assessment** — a summary of the five-axis evaluation. Note the axes that are elevated; low-scoring axes require only brief acknowledgment.
2. **Routing decision** — which tier the task routes to, and why.
3. **Path definition** — the roles to engage, in order. For Tier 1, this is the Owner alone. For Tier 2 and 3, this is the sequence of handoffs.
4. **Known unknowns** — any downstream decisions better made by a later role once engaged. List these explicitly rather than speculating.

The workflow plan is the approval gate for the flow. Implementation does not begin until the plan exists.

**Plan artifact validation:** After the plan is drafted and before writing the brief, the Owner must confirm that `01-owner-workflow-plan.md` exists in the record folder and that its YAML frontmatter satisfies all required fields per `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE`. There is no distributed programmatic validator for this check; verification is the Owner's judgment against the template. This step is required before issuing a brief; it is not required for other roles reading the plan.

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
- `02-owner-backward-pass.md` (findings)

Implementation work product is created at its permanent locations, not in the record folder. The record holds only the plan and findings artifacts.

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
