# A-Society: Workflow Complexity Guidance

This document is the A-Society-specific intake sizing reference for Owner-led workflow routing. It instantiates the reusable model from `$INSTRUCTION_WORKFLOW_COMPLEXITY` for work inside this repository.

Read this at Owner intake, before creating `01-owner-workflow-plan.md`.

---

## What It Owns

This document owns:

- the five intake axes as they are applied inside A-Society
- the tier-selection rules for A-Society framework, executable, and multi-domain flows
- the A-Society-specific constraints that narrow when Tier 1 is allowed
- the relationship between workflow sizing, `$A_SOCIETY_RECORDS`, and `$A_SOCIETY_COMM_TEMPLATE_PLAN`

It does not replace `$INSTRUCTION_WORKFLOW_COMPLEXITY`. The general instruction remains the reusable library source; this file is the internal project instantiation.

---

## Intake Axes

Assess each triggered work item against these five axes:

1. **Domain spread** — how many A-Society domains the work touches (`general/`, `agents/`, `a-docs/`, `runtime/`, or multi-domain combinations)
2. **Shared artifact impact** — whether the work changes standing shared artifacts, reusable library surfaces, or operator-facing executable references
3. **Step dependency** — whether later steps depend on design or approval decisions made earlier in the flow
4. **Reversibility** — how safely the work can be undone if the approach proves wrong
5. **Scope size** — how many files, roles, and maintained surfaces are affected

The plan template at `$A_SOCIETY_COMM_TEMPLATE_PLAN` provides the required fields and allowed values.

---

## Tier Selection in A-Society

### Tier 1

Use Tier 1 only when the work is genuinely Owner-only and the workflow plan can safely serve as the sole approval gate.

Typical Tier 1 characteristics:

- bounded internal maintenance or clarification
- one role
- no proposal/review loop required
- no Curator write to `general/`
- no executable design or multi-domain coordination requirement

Expected path: Owner intake/direct work -> Owner closure -> backward pass.

### Tier 2

Use Tier 2 for the standard framework-development loop when the work needs Curator proposal, Owner review, and Curator implementation/registration, but does not require a larger multi-role or multi-domain structure.

Typical Tier 2 characteristics:

- bounded `general/`, `agents/`, or `a-docs/` work
- one Curator proposal/review/implementation loop
- clear sequence at intake
- no parallel executable tracks

Expected path: Owner intake -> Curator proposal -> Owner review -> Curator implementation/registration -> Owner closure.

### Tier 3

Use Tier 3 when the work exceeds the lightweight library loop and requires a larger structure.

Typical Tier 3 characteristics:

- structural or high-impact reusable-library changes
- executable design or implementation tracks
- parallel or converging paths
- multiple role families
- meaningful cross-domain coordination

Expected path: route through the applicable permanent workflow or multi-domain pattern declared in `$A_SOCIETY_WORKFLOW`.

---

## A-Society-Specific Constraints

These constraints narrow the tier options inside this project:

- **Approval Invariant:** Do not choose Tier 1 for work that would require the Curator to write to `general/` without an Owner review node. If the change needs Curator-authored `general/` content, it must route through a review-bearing path.
- **Workflow selection comes first:** Use `$A_SOCIETY_WORKFLOW` to choose the applicable workflow family. Use this document to size the intake path once the applicable workflow is known.
- **Executable scope is not framework-only scope:** If the work changes executable design, implementation, operator-facing executable behavior, or stable executable contracts, route through `$A_SOCIETY_WORKFLOW_EXECUTABLE_DEV` or `$A_SOCIETY_WORKFLOW_MULTI_DOMAIN` as appropriate.
- **Record artifacts are mandatory at intake:** `01-owner-workflow-plan.md` and `workflow.md` are always required at A-Society intake. Tier changes alter the downstream path; they do not waive the intake artifacts.

---

## Required Intake Outputs

At Owner intake:

1. Create the record folder under `$A_SOCIETY_RECORDS`
2. Produce `01-owner-workflow-plan.md` from `$A_SOCIETY_COMM_TEMPLATE_PLAN`
3. Create `workflow.md` for the active path
4. Verify all plan fields are non-null before issuing any Tier 2/3 brief

`$A_SOCIETY_RECORDS` governs record-folder structure and artifact sequencing. `$A_SOCIETY_COMM_TEMPLATE_PLAN` governs the workflow plan schema and prose fields.

---

## Relationship to the General Instruction

`$INSTRUCTION_WORKFLOW_COMPLEXITY` remains the reusable library instruction for any adopting project.

This A-Society document exists so the framework's own internal workflows do not point directly at a general-library instruction when they need project-specific operational guidance.
