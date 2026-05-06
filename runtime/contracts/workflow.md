# A-Society Runtime Workflow Contract

This file defines the runtime-owned `workflow.yaml` contract.

The runtime uses this contract when it creates record folders, validates workflow YAML, resolves canonical node contracts, injects node-entry context, routes handoffs, and computes backward-pass ordering. The runtime injects this guide into node-entry messages for nodes whose contract says they may create or update `workflow.yaml`.

This is runtime-owned context, not a role startup reading. Do not copy this file into record folders.

---

## Workflow Files

The runtime reads two workflow YAML surfaces:

- **Canonical workflow definition:** `[project]/a-docs/workflow/main.yaml`
- **Record workflow snapshot:** `[project]/a-docs/records/[record-id]/workflow.yaml`

The canonical definition is the standing workflow map and node-contract source. The record snapshot is the active flow's topology: the nodes and edges this flow traverses or may still traverse.

When both files exist, the runtime resolves node contracts by `node.id`: it starts with the canonical node, then applies any fields present on the matching record-snapshot node as overrides. The record snapshot's `edges` are authoritative for the active flow.

---

## YAML Schema

```yaml
workflow:
  name: <string>
  summary: <string>                # optional
  use_when: <string>               # optional
  companion_docs:
    - $VARIABLE_NAME               # optional
  nodes:
    - id: <string>
      role: <string>
      human-collaborative: <string>  # optional
      required_readings:
        - $VARIABLE_NAME             # optional
      guidance:
        - <string>                   # optional
      inputs:
        - <string>                   # optional
      work:
        - <string>                   # optional
      outputs:
        - <string>                   # optional
      transitions:
        - <string>                   # optional
      notes:
        - <string>                   # optional
  edges:
    - from: <node-id>
      to: <node-id>
      artifact: <string>            # optional
  invariants:
    - name: <string>                # optional
      rule: <string>
  escalation:
    - situation: <string>           # optional
      escalated_by: <string>
      to: <string>
  session_model:
    - <string>                      # optional
  forward_pass_closure:
    - <string>                      # optional
```

Validation rules:

- `workflow.name` is required and must be a non-empty string.
- `workflow.nodes` is required and must be a non-empty array.
- Every node requires non-empty string `id` and `role`.
- Node ids must be unique.
- `workflow.edges` is required and must be an array.
- Every edge requires `from` and `to`, and both must match node ids.
- Optional string-list fields must be arrays of non-empty strings when present.
- Optional object-list fields must contain the fields shown above.
- Unknown keys fail validation.

Strict validation additionally requires a single Owner start node and an Owner terminal node. A single-node workflow is valid only when that node's base role is Owner.

---

## Record Snapshot Rules

Use record `workflow.yaml` as the active-path snapshot.

- Include only the nodes and edges this flow traverses or may still traverse.
- Keep node entries topology-first by default: `id`, `role`, and needed edges.
- Add node-contract fields only when the active flow needs an override or when the runtime-created draft needs enough first-entry guidance for the Owner to act.
- List every real review, approval, registration, or closure checkpoint as its own node. Do not rely on implied checkpoints.
- Update the snapshot before emitting a handoff to any node that depends on the changed topology.

Artifact names in edge `artifact` fields are descriptors for handoff type. They are not frozen sequence-number reservations.

---

## Node-Entry Injection

On first entry to a node, the runtime may inject the resolved node contract into the node-entry user message:

- `required_readings`
- `guidance`
- `inputs`
- `work`
- `outputs`
- `transitions`
- `notes`

`required_readings` are resolved through the project's index and included as file blocks in the node-entry message. They are injected only on first entry to that node. Reopened nodes and later same-role transitions rely on prior session continuity plus the current task inputs.

Do not use node-specific `required_readings` for files already loaded at role startup or for runtime-managed session contracts.

---

## Role Instances

The runtime uses the node `role` field as the role-session identity.

Use numbered role names when two nodes share the same base role but must have separate runtime histories:

- `Curator_1`
- `Curator_2`
- `Owner_1`
- `Owner_2`

The suffix pattern is `Role_N`, where `N` is a numeric suffix. The runtime loads the base role authority and base role required readings, while preserving a separate session identity and transcript for the numbered role instance.

Node notes such as "Curator A" or "Curator B" are descriptive only. They do not create separate runtime sessions.

Edges may connect neighboring nodes with the same role instance. The runtime treats the second node as a continuation of the same flow-scoped role-instance session and injects that node's current task inputs before the role continues.

If two nodes share the same role instance and become ready at the same time, the runtime keeps both in ready order but claims only the earliest ready node for that role instance. Later same-role-instance nodes wait until the role instance is no longer running or awaiting human input.

If a flow needs separate runtime histories for the same base role, use separate numbered role instances. If distinct role instances are used, they may run in parallel.

---

## Handoff Routing

The handoff block's `target_node_id` must match a node id in the active record snapshot.

When exactly one node should receive control, emit a single handoff object. When parallel branches should start, emit one handoff entry per target node. The handoff syntax itself is defined in `runtime/contracts/handoff.md`; this file defines how those target node ids relate to `workflow.yaml`.

When the workflow snapshot changes mid-flow, the workflow-authority node must update `workflow.yaml` before emitting handoffs that depend on the new path.
