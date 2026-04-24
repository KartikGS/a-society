# A-Society: Workflow Complexity Guidance

This document is the A-Society-specific intake sizing reference for Owner-led workflow routing. It instantiates the reusable model from `$INSTRUCTION_WORKFLOW_COMPLEXITY` for work inside this repository.

Read this at Owner intake, before creating `01-owner-workflow-plan.md`.

---

## What It Owns

This document owns:

- the five intake axes as they are applied inside A-Society
- the tier-selection rules for direct, targeted, and coordinated paths through A-Society's single canonical workflow
- the A-Society-specific gate triggers that determine when Curator and Technical Architect nodes are required
- the relationship between workflow sizing, `$A_SOCIETY_RECORDS`, and `$A_SOCIETY_COMM_TEMPLATE_PLAN`

It does not replace `$INSTRUCTION_WORKFLOW_COMPLEXITY`. The general instruction remains the reusable library source; this file is the internal project instantiation.

---

## Intake Axes

Assess each triggered work item against these five axes:

1. **Domain spread** — how many A-Society domains the work touches (`general/`, `agents/`, `a-docs/`, `runtime/`, or multi-domain combinations)
2. **Shared artifact impact** — whether the work changes standing shared artifacts, reusable library surfaces, operator-facing executable references, or role-routing policy
3. **Step dependency** — whether later steps depend on design or approval decisions made earlier in the flow
4. **Reversibility** — how safely the work can be undone if the approach proves wrong
5. **Scope size** — how many files, roles, and maintained surfaces are affected

The plan template at `$A_SOCIETY_COMM_TEMPLATE_PLAN` provides the required fields and allowed values.

---

## Surface-Driven Routing First

Before choosing a tier, map the touched permanent surfaces and their truth owners from the role ownership files.

At A-Society intake, these two trigger checks matter most:

- **Curator required:** when the flow touches Curator-owned stewardship surfaces such as indexes, `a-docs-guide`, update-report surfaces, version/reporting surfaces, feedback/update registries, or conversation-template surfaces
- **Technical Architect required:** when the flow changes executable boundaries, standing executable capabilities, stable executable contracts, executable workflow topology, or otherwise needs shared executable design before implementation

Owner review is required when the work changes project direction, modifies shared framework promises, adds to `general/`, or otherwise creates a high-impact case where the same role should not both authorize and verify its own change.

If none of those triggers apply, do not force the extra node into the path.

---

## Tier Selection in A-Society

### Tier 1 — Direct Flow

Use Tier 1 when the work is tightly bounded to one truth-owner path and no extra gate adds unique value.

Typical Tier 1 characteristics:

- one role or one tightly bounded ownership area
- no parallel tracks
- no Curator stewardship surfaces touched
- no executable design or independent review trigger
- no `general/` addition or project-direction decision

Expected path: Owner intake -> direct owner/domain work -> Owner closure -> backward pass.

### Tier 2 — Targeted Routed Flow

Use Tier 2 when the work is still mostly linear but needs one additional gate type beyond direct execution.

Typical Tier 2 characteristics:

- one primary domain path
- one optional Curator stewardship step, or one optional TA design/review step, or one optional Owner approval step
- clear sequence at intake
- no meaningful parallelism benefit

Expected path: Owner intake -> targeted domain path -> Owner closure.

Examples:

- Owner -> Curator -> Owner for stewardship or registration work
- Owner -> Curator -> Owner review -> Curator -> Owner for `general/` additions
- Owner -> TA -> Developer -> Owner when executable design is required but no registration node is touched

### Tier 3 — Coordinated Flow

Use Tier 3 when the work truly requires multiple coordinated tracks or multiple gate types.

Typical Tier 3 characteristics:

- structural or high-impact changes spanning framework and executable domains
- parallel framework-service and orchestration work
- Curator stewardship plus executable implementation in the same flow
- joins, multiple role families, or significant cross-domain coordination

Expected path: activate a coordinated subset of nodes inside `$A_SOCIETY_WORKFLOW`, including parallel tracks where the touched surfaces are independent until a join.

---

## A-Society-Specific Constraints

These constraints narrow the tier options inside this project:

- **Touched-surface routing comes first:** Use the role ownership files to identify which truth owners are implicated before selecting the tier.
- **Curator is not the default documentation hop:** Engage the Curator only when Curator-owned stewardship surfaces are touched or when the flow explicitly routes a proposal/registration node through Curator authority.
- **Executable scope is not framework-only scope:** If the work changes executable design, implementation, operator-facing executable behavior, or stable executable contracts, activate the TA and/or executable developer nodes inside `$A_SOCIETY_WORKFLOW` as appropriate.
- **`general/` additions still require Owner decision:** Work that adds to `general/` cannot go straight from Curator proposal to implementation without an explicit Owner decision node.
- **Record artifacts are mandatory at intake:** `01-owner-workflow-plan.md` and `workflow.yaml` are always required at A-Society intake. Tier changes alter the downstream path; they do not waive the intake artifacts.
- **OD and UI Developer have separate runtime sub-domains:** The Orchestration Developer owns the orchestration core and server/WebSocket layer (`src/orchestrator.ts`, `src/server.ts`, `src/ws-operator-sink.ts`, providers, observability); the UI Developer owns `runtime/ui/`. At intake, when a flow touches both sub-domains, activate them as independent parallel tracks with a join at ta-review or owner-closure. When a flow touches only one sub-domain, activate only that developer track. Server/WebSocket contract changes that affect both roles require TA design resolution before either track begins implementation.

---

## Required Intake Outputs

At Owner intake:

1. Work inside the active record folder under `$A_SOCIETY_RECORDS`
2. Produce `01-owner-workflow-plan.md` from `$A_SOCIETY_COMM_TEMPLATE_PLAN`
3. Create or update `workflow.yaml` for the active path
4. Verify all plan fields are non-null before issuing any downstream brief or handoff artifact

`$A_SOCIETY_RECORDS` governs record-folder structure and artifact sequencing. `$A_SOCIETY_COMM_TEMPLATE_PLAN` governs the workflow plan schema and prose fields.

---

## Relationship to the General Instruction

`$INSTRUCTION_WORKFLOW_COMPLEXITY` remains the reusable library instruction for any adopting project.

This A-Society document exists so the framework's own internal workflows do not point directly at a general-library instruction when they need project-specific operational guidance.
