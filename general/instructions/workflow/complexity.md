# How to Construct a Complexity-Proportional Workflow

*This document is a companion to `$INSTRUCTION_WORKFLOW` and `$INSTRUCTION_WORKFLOW_MODIFY`. Read those documents to understand workflow creation and static modification. Read this document at intake — when the Owner must decide which workflow path a given task requires.*

This is the reusable complexity-routing model. Projects should usually instantiate it in a project-local operational workflow or complexity document and route live execution through that local doc rather than pointing agents here directly.

---

## The Problem

A complexity-blind workflow applies uniform overhead to every task. The same role sequence is forced onto a two-line maintenance fix and a multi-domain structural change. For simple tasks, the workflow becomes more expensive than the work itself; for complex tasks, the fixed sequence still misses the real question: which surfaces and authorities are actually in play?

The solution is **proportional, surface-driven workflow construction**. The same governing principles and hard rules apply to every flow, but the path is derived from the touched permanent surfaces, their truth owners, and the unique gates the work actually needs.

---

## The Dynamic Complexity Model

At intake, the Owner conducts a complexity analysis and constructs a workflow plan. The plan specifies the touched surfaces, the roles to engage, the nodes to traverse, and the artifacts to produce. For trivial tasks, this may be a direct Owner or single-owner flow with only intake and closure. For complex, multi-domain tasks, it may include design, parallel execution, independent review, and registration nodes.

The workflow is not a fixed template applied uniformly. It is **constructed per task**, governed by the same hard rules, and scaled to the task's actual demands.

Four principles govern the model:

**1. Surface-first routing.** Before choosing a tier, identify which permanent surfaces the task touches and which roles own their truth. Workflow shape is derived from those surfaces, not from habit or from a default phase sequence.

**2. Start from the smallest legal path.** The default path is `Owner intake -> touched-surface work -> Owner closure`. Add nodes only when they add unique value that the smaller path cannot provide safely.

**3. Gates are conditional, not ceremonial.** Add a design, review, approval, or registration node only when it contributes unique decision value, unique review value, or unique stewardship value. Do not preserve a gate merely because a previous workflow version had one.

**4. Backward graph tracking.** The backward pass structure is not pre-defined at intake. The executed workflow is tracked through the record folder's artifact sequence. At close, this sequence is the input to the backward graph builder. Simple forward graphs produce simple backward passes.

---

## Structural Readiness Assessment

Before conducting complexity analysis, the Owner runs a structural readiness assessment. This assessment determines whether the task can be handled by the existing structure at all. It is a gate: a task that fails it does not proceed to complexity analysis or tier selection.

There are three sequential checks.

**Check 1 — Feasibility**

Is the task possible at all? If no: tell the user directly, explain why (invariant violation, scope conflict, structural impossibility), and probe for the underlying need. Do not route.

**Check 2 — Structural Routability**

Can the task be handled by the existing structure? Two dimensions, both must be true:

- *Role authority:* Does some defined role own or have standing authority over each touched surface?
- *Workflow routability:* Can the touched surfaces be served by the project's existing workflow families and node types?

If either dimension fails, a structural gap exists.

**Check 3 — Frequency Assessment** *(only when a gap is found in Check 2)*

How often will this task or similar tasks recur? This determines whether the appropriate response is to build a fuller standing workflow branch or role, or to handle the task as a scoped one-off exception with explicit Owner direction. This is a sizing question, not a feasibility question — ask it only after a gap is confirmed.

**Handling by Outcome**

| Outcome | Action |
|---|---|
| Impossible | Tell user directly, explain why, probe for underlying need. Do not route. |
| Structurally ready | Proceed with complexity analysis as normal. |
| Structural gap found | Apply Structural Gap Protocol (see below). |
| User overrides structural gap | Document the gap and risk explicitly in the workflow plan as a known constraint. Proceed only with explicit user direction. |

**Structural Gap Protocol**

When a structural gap is found and the user wants to proceed with addressing it:

1. Tell the user what specifically is missing — a role with appropriate authority, a workflow node type, or both.
2. Describe what setup would involve.
3. Get explicit user permission before opening a setup flow.
4. Add the deferred task to Next Priorities in the project log with a dependency note.
5. Open a separate setup flow through standard intake.
6. When the setup flow completes, the deferred task re-enters intake as a new flow.

---

## Complexity Axes

At intake, the Owner evaluates the task against five axes:

| Axis | Question |
|---|---|
| **1. Domain spread** | Does this touch one domain or multiple? |
| **2. Shared artifact impact** | Does it modify any public, shared, or load-bearing artifact? |
| **3. Dependency between steps** | Do later steps depend on decisions made in earlier steps? |
| **4. Reversibility** | Can the change be easily undone? |
| **5. Scope size** | How many files, systems, or roles are affected? |

Each axis is a signal, not a binary threshold. The Owner reads the combination to assess where the task falls on the complexity spectrum and routes accordingly.

---

## Producing a Workflow Plan

The workflow plan is the Owner's intake artifact. Use `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` as the base; place the instantiated plan in the record folder as `01-owner-workflow-plan.md`.

A workflow plan must specify:

1. **Complexity assessment** — a summary of the five-axis evaluation.
2. **Routing decision** — which tier the task routes to, and why.
3. **Touched surfaces and truth owners** — which permanent surfaces are in scope and which roles are accountable for them.
4. **Path definition** — the roles or nodes to engage, in order. Start from the smallest legal path and add only the gates the work actually needs.
5. **Known unknowns** — downstream decisions better made by a later role once engaged.

The workflow plan is always the first authorization point for the flow. Additional approval or review nodes are required only when the touched surfaces and risk profile call for them.

**Plan artifact validation:** After the plan is drafted and before writing any downstream brief, the Owner must confirm that `01-owner-workflow-plan.md` exists in the record folder and that its YAML frontmatter satisfies all required fields per `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE`.

---

## Gate Triggers

Use these triggers when deciding whether the smallest legal path needs additional nodes:

- **Design node:** add when standing design does not already govern the work, when the change alters boundaries or contracts, or when multiple implementers need a shared design.
- **Independent approval or review node:** add when the work changes shared promises, shared library surfaces, another role's owned truth surfaces, or any other high-impact area where the same role should not both authorize and verify its own change.
- **Registration or stewardship node:** add when a separate role owns indexes, guides, update reports, version records, or other stewardship surfaces that must be updated in-band with the work.
- **Parallel tracks and join:** add when multiple touched-surface tracks are independent enough to proceed concurrently and later converge.

If none of these triggers apply, do not add the node.

---

## Workflow Tiers

There are three tiers. The Owner selects the appropriate tier at intake based on the complexity analysis and the touched-surface map.

### Tier 1 — Direct Flow

**Signals:**
- Domain spread: single domain
- Shared artifact impact: low, or confined to surfaces owned by one role
- Dependency between steps: low
- Reversibility: high
- Scope size: one role or one tightly bounded ownership area

**Path:** Owner intake -> direct work by the touched truth owner(s) -> Owner closure.

This may be Owner-only or may involve one non-Owner role, depending on who owns the touched surfaces. No extra design, approval, or registration node is required unless a gate trigger applies.

### Tier 2 — Targeted Routed Flow

**Signals:**
- Domain spread: one domain, possibly touching a second through stewardship
- Shared artifact impact: moderate
- Dependency between steps: some, but the flow is still mostly linear
- Reversibility: moderate
- Scope size: one primary truth-owner track plus one optional design, review, or registration gate

**Path:** Owner intake -> targeted domain path -> Owner closure.

The targeted domain path may include one optional design node, one optional independent review or approval node, or one optional registration node. Tier 2 is still intentionally narrow: avoid adding parallel tracks unless they are materially beneficial.

### Tier 3 — Coordinated Flow

**Signals:**
- Domain spread: multiple domains or role families
- Shared artifact impact: high
- Dependency between steps: significant
- Reversibility: low
- Scope size: multiple tracks, joins, or coordination-heavy execution

**Path:** Owner intake -> coordinated multi-role path -> Owner closure.

Tier 3 is for flows that truly need parallel tracks, joins, multiple gate types, or significant cross-domain coordination. It is not the default just because more than one role is involved.

---

## Project-Specific Invariants

Project-level invariants may further constrain tier selection. For example, a project may require explicit Owner review for additions to a shared library regardless of complexity, or require a dedicated registration node whenever public indexes change. The dynamic complexity model determines the default tier; project invariants narrow the available options within it. When a project invariant and a complexity-derived tier conflict, the invariant takes precedence.

---

## Incremental Pipeline Definition

For Tier 2 and Tier 3 flows, the Owner defines the known path at intake and marks open decisions as known unknowns in the workflow plan. Engaged roles may define later segments only when they are the legitimate authority to do so and only before producing the next handoff.

This is not permission to defer structure indefinitely. Each agent must define the next handoff before producing it. An undefined next step at a handoff point is a gap — it must be surfaced explicitly rather than improvised.

---

## Backward Graph Tracking

The backward pass is proportional to the flow. Simple flows produce simple backward passes.

**Source:** The record folder's artifact sequence is the executed workflow log. Each artifact represents a completed step; the prefix ordering gives the sequence; the file names identify the role and action.

**At close:** The Owner or the project's closure authority reads the record folder artifact sequence and derives the traversal order for the backward pass. This is the input for the project's executable backward-pass ordering capability if available; otherwise derive manually per `$INSTRUCTION_IMPROVEMENT`.

**Planned vs. actual path:** The workflow plan records the intended path; the artifact sequence records the actual path. Any divergence between planned and actual path is itself a backward pass finding.

---

## Hard Rules — Applicability

All hard rules from `$INSTRUCTION_WORKFLOW_MODIFY` apply unchanged to the dynamic complexity model. Tier selection does not suspend any rule; it determines which artifacts and handoffs are present, not whether the rules govern them.

| Rule | How it applies to all tiers |
|---|---|
| 1. Every handoff produces a written artifact | The workflow plan is the first artifact. Every handoff that occurs must still carry an artifact. |
| 2. Authorization before implementation | Satisfied at all tiers: the workflow plan is always the first authorization point; higher-impact work adds an independent approval or review node when the touched surfaces require it. |
| 3. Each step owned by exactly one role | Applies unchanged. |
| 4. Workflow indexed before referenced | Applies unchanged. |
| 5. No step requires context not produced by a prior step | Applies unchanged. |
| 6. Role-defined, not agent-defined | Applies unchanged. |
| 7. Records immutable once produced | Applies unchanged. |

---

## Refinement Over Time

The five complexity axes and three tiers represent the best current model for proportional workflow construction. They will be refined as flows reveal where the model fails — cases where an omitted gate produced rework, or where an extra gate added cost without adding value.

Refinements are proposed and approved through the standard workflow. The model is a living instrument; it is not frozen.

---

## Relationship to Other Instructions

- **`$INSTRUCTION_WORKFLOW`** — defines what a workflow is and how to write one.
- **`$INSTRUCTION_WORKFLOW_MODIFY`** — defines how to change a standing workflow safely.
- **`$INSTRUCTION_WORKFLOW_GRAPH`** — defines the YAML encoding for permanent workflow definitions and record snapshots.
- **`$INSTRUCTION_IMPROVEMENT`** — owns backward pass ordering and final feedback behavior.
