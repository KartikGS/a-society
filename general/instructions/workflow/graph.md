# How to Create an Executable Workflow Definition

*Read `$INSTRUCTION_WORKFLOW` for workflow-design guidance. Read this document when a project will represent that design as executable workflow YAML. The authoritative runtime schema, node-entry injection behavior, and role-instance syntax live in `$A_SOCIETY_RUNTIME_WORKFLOW_CONTRACT`.*

---

## What This Is

A workflow YAML definition is the machine-readable representation of a workflow. The permanent definition carries standing node contracts; the record snapshot scopes that definition down to the active path for one flow instance.

Use it for two related artifacts:

- **Permanent workflow definitions** — the standing project workflow files
- **Record-folder workflow snapshots** — the flow-specific `workflow.yaml` file inside an active record folder

The permanent definition expresses the reusable workflow shape. The record snapshot captures the actual active path for one flow instance.

---

## Why It Exists

**1. Executable node context.** The permanent workflow definition is the standing source of node-specific guidance. Runtime-managed projects use `$A_SOCIETY_RUNTIME_WORKFLOW_CONTRACT` to determine exactly how that context is represented and delivered.

**2. Deterministic active-path execution.** Backward-pass planning and active-flow routing derive role order from the same record snapshot the forward pass executes from.

**3. Dynamic routing compatibility.** If a project later introduces workflow-authority intermediaries or more dynamic route shaping, the active record snapshot can be updated without requiring the runtime to reconstruct intent from prose.

---

## Canonical Files

Use these conventions:

- **Permanent workflow definition:** `workflow/main.yaml`
- **Record snapshot:** `records/[flow-id]/workflow.yaml`

---

## Runtime Contract

For projects using the A-Society runtime, `$A_SOCIETY_RUNTIME_WORKFLOW_CONTRACT` is the single source for:

- YAML fields accepted by the runtime validator
- canonical workflow vs. record-snapshot merge behavior
- node-specific `required_readings` injection behavior
- role-instance syntax for parallel same-base-role sessions
- handoff target semantics for `workflow.yaml` node ids

---

## What Each Layer Uses

### Permanent workflow definition

Use the runtime contract's full schema as needed. This is the reusable source that explains the workflow's standing node contracts, invariants, escalation rules, and session model.

### Record-folder `workflow.yaml`

Use the runtime contract's record-snapshot rules, and scope the snapshot to the active flow instance:

- include only the nodes and edges the flow actually traverses or may still traverse
- treat the record snapshot as authoritative for runtime topology and handoff routing in that instance
- omit node-contract fields unless the active flow needs an explicit per-flow override beyond the permanent definition

---

## How to Fill It In

**Step 1 — Define the workflow shape.** List the nodes and edges in forward-pass order.

**Step 2 — Add node contracts to the permanent definition.** For each node, include the node-specific readings and short node contract data that the executable contract allows.

**Step 3 — Add workflow-level fields.** Include summary, use-when guidance, invariants, escalation rules, and session model details where they belong.

**Step 4 — Validate.** Run the workflow validator if your project has one.

**Step 5 — Create the record snapshot.** At intake, the workflow-authority role creates `workflow.yaml` in the active record folder by scoping the permanent definition to the active path and following `$A_SOCIETY_RUNTIME_WORKFLOW_CONTRACT`.

---

## Maintenance Rules

Update the permanent YAML definition when:

- a structural node is added, removed, renamed, or reassigned
- a handoff path is added, removed, or redirected
- a node contract changes
- a workflow-level invariant, escalation rule, or session-model rule changes

Update the record snapshot when:

- the active flow path changes mid-flow
- a workflow-authority role adds future nodes that were not knowable at intake
- the active flow needs a node-level override for an unvisited future node beyond the permanent definition

Do not edit already visited node overrides in the record snapshot unless the project explicitly allows that kind of mutation and records the reason.

---

## Relationship to `$INSTRUCTION_WORKFLOW`

`$INSTRUCTION_WORKFLOW` owns the design guidance: what a workflow is, how to think about nodes and transitions, and what a project needs procedurally.

This file owns the reusable instruction to encode a workflow as executable data. `$A_SOCIETY_RUNTIME_WORKFLOW_CONTRACT` owns the runtime-specific schema and interpretation rules.
