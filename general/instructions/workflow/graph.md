# How to Create a YAML Workflow Definition

*Read `$INSTRUCTION_WORKFLOW` for the workflow-design guidance. Read this document when you are ready to encode the workflow as the project's canonical YAML definition and, when applicable, as the per-flow record snapshot used by runtime capabilities.*

---

## What This Is

A workflow YAML definition is the canonical machine-readable representation of a workflow. It does not merely mirror the workflow's structure; it can also carry the node contract data that the runtime surfaces at node entry.

Use it for two related artifacts:

- **Permanent workflow definitions** — the standing project workflow files
- **Record-folder workflow snapshots** — the flow-specific `workflow.yaml` file inside an active record folder

The permanent definition expresses the reusable workflow shape. The record snapshot captures the actual active path for one flow instance.

---

## Why It Exists

**1. Runtime-delivered node context.** A workflow should be the delivery surface for node-specific guidance. Encoding the node contract in YAML lets the runtime surface the right node context at the moment the node activates.

**2. Deterministic backward-pass ordering.** Backward-pass planning still derives role order from `nodes` and `edges`, but now it reads the same YAML snapshot that the forward pass executes from.

**3. Dynamic routing compatibility.** If a project later introduces workflow-authority intermediaries or more dynamic route shaping, the active record snapshot can be updated without requiring the runtime to reconstruct intent from prose.

---

## Canonical Files

Use these conventions:

- **Permanent workflow definition:** `workflow/[name].yaml`
- **Routing index:** `workflow/main.md` may remain a lightweight routing index
- **Record snapshot:** `records/[flow-id]/workflow.yaml`

---

## Schema

```yaml
workflow:
  name: <string>
  summary: <string>            # optional
  use_when: <string>           # optional
  companion_docs:              # optional
    - $VARIABLE_NAME
  nodes:
    - id: <string>
      role: <string>
      human-collaborative: <string>  # optional
      required_readings:             # optional; injected only on first entry to this node
        - $VARIABLE_NAME
      guidance: [<string>]           # optional
      inputs: [<string>]             # optional
      work: [<string>]               # optional
      outputs: [<string>]            # optional
      transitions: [<string>]        # optional
      notes: [<string>]              # optional
  edges:
    - from: <node-id>
      to: <node-id>
      artifact: <string>             # optional
  invariants:                        # optional
    - name: <string>
      rule: <string>
  escalation:                        # optional
    - situation: <string>
      escalated_by: <string>
      to: <string>
  session_model: [<string>]          # optional
  forward_pass_closure: [<string>]   # optional
```

---

## What Each Layer Uses

### Permanent workflow definition

Use the full schema as needed. This is the reusable source that explains the workflow's standing node contracts, invariants, escalation rules, and session model.

### Record-folder `workflow.yaml`

Use the same schema, but scope it to the active flow instance:

- include only the nodes and edges the flow actually traverses or may still traverse
- copy the node-contract fields the runtime should use for this flow
- treat the record snapshot as authoritative for runtime execution of that instance

The runtime injects node-specific `required_readings` only on the first visit to a node. Reopened or backward-reactivated nodes reuse prior continuity rather than receiving the same node guidance again.

---

## How to Fill It In

**Step 1 — Define the workflow shape.** List the nodes and edges in forward-pass order.

**Step 2 — Add node contracts.** For each node, include the node-specific readings and the short node contract data the runtime should surface at first entry.

**Step 3 — Add workflow-level fields.** Include summary, use-when guidance, invariants, escalation rules, and session model details where they belong.

**Step 4 — Validate.** Run the workflow validator if your project has one.

**Step 5 — Create the record snapshot.** At intake, the workflow-authority role creates `workflow.yaml` in the active record folder by scoping the permanent definition to the active path and copying the node contract data needed for this specific flow.

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
- the runtime must execute from a newly clarified node contract for an unvisited future node

Do not edit already visited node contracts in the record snapshot unless the project explicitly allows that kind of mutation and records the reason.

---

## Relationship to `$INSTRUCTION_WORKFLOW`

`$INSTRUCTION_WORKFLOW` owns the design guidance: what a workflow is, how to think about nodes and transitions, and what a project needs procedurally.

This file owns the YAML encoding model: how that workflow is represented as executable data for both standing definitions and record snapshots.
