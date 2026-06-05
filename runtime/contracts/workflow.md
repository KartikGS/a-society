# A-Society Runtime Workflow Contract

Use these rules when creating, updating, repairing, or interpreting `workflow.yaml`. Do not copy this contract into record folders.

## Workflow Files

Use two workflow YAML surfaces:

- **Canonical workflow definition:** `[project]/a-docs/workflow/main.yaml`
- **Record workflow snapshot:** `.a-society/state/[project]/[flow-id]/record/workflow.yaml`

The canonical definition is the standing workflow map and node-contract source. The record snapshot is the active flow's topology: the nodes and edges this flow traverses or may still traverse.

When both files exist, resolve node contracts by `node.id`: start with the canonical node, then apply any fields present on the matching record-snapshot node as overrides. The record snapshot's `edges` are authoritative for the active flow.

---

## YAML Schema

```yaml
workflow:
  name: <string>
  summary: <string>                # optional
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
```

Validation rules:

- `workflow.name` is required and must be a non-empty string.
- `workflow.nodes` is required and must be a non-empty array.
- Every node requires non-empty string `id` and `role`.
- `role` is a role instance id: lowercase kebab-case with an optional numeric `_N` suffix, such as `owner`, `technical-architect`, or `owner_2`.
- Node ids must be unique.
- The first declared node must have `id: owner-intake`.
- `workflow.edges` is required and must be an array.
- Every edge requires `from` and `to`, and both must match node ids.
- Optional node string-list fields must be arrays of non-empty strings when present.
- Optional object-list fields (`invariants`, `escalation`) must contain the fields shown above.
- Unknown keys fail validation.

Strict validation additionally requires a single `owner` start node whose id is `owner-intake`, and an `owner` terminal node. A single-node workflow is valid only when that node's id is `owner-intake` and its role id is `owner`.

---

## Record Snapshot Rules

Use record `workflow.yaml` as the active-path snapshot.

- Include only the nodes and edges this flow traverses or may still traverse.
- Keep node entries topology-first by default: `id`, `role`, and needed edges.
- Add node-contract fields only when the active flow needs an override or when the runtime-created draft needs enough first-entry guidance for the Owner to act.
- List every real review, approval, registration, or closure checkpoint as its own node. Do not rely on implied checkpoints.
- Update the snapshot before emitting a handoff to any node that depends on the changed topology.

Artifact names in edge `artifact` fields are descriptors for handoff type. They are not filename reservations.

---

## Node-Entry Injection

On first entry to a node, expect the resolved node contract in the node-entry user message:

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

Use the node `role` field as the role-session identity.

Use numbered role instance ids when two nodes share the same base role but must have separate runtime histories:

- `curator_1`
- `curator_2`
- `owner_1`
- `owner_2`

The suffix pattern is `role-id_N`, where `N` is a positive numeric suffix. The runtime loads the base role authority and base role required readings, while preserving a separate session identity and transcript for the numbered role instance.

Node notes such as "Curator A" or "Curator B" are descriptive only. They do not create separate runtime sessions.

Edges may connect neighboring nodes with the same role instance. The runtime treats the second node as a continuation of the same flow-scoped role-instance session and injects that node's current task inputs before the role continues.

If two nodes share the same role instance and become runnable at the same time, the runtime claims only the earliest runnable node for that role instance. Later same-role-instance nodes wait in derived scheduler state, or in the runner's initial-node list during startup/recovery, until the role instance is no longer running or awaiting human input.

If a flow needs separate runtime histories for the same base role, use separate numbered role instances. If distinct role instances are used, they may run in parallel.

---

## Handoff Routing

The handoff block's `target_node_id` must match a node id in the active record snapshot.

When exactly one node should receive control, emit a single handoff object. When parallel branches should start, emit one handoff entry per target node. The handoff syntax itself is defined in `runtime/contracts/handoff.md`; this file defines how those target node ids relate to `workflow.yaml`.

When the workflow snapshot changes mid-flow, the workflow-authority node must update `workflow.yaml` before emitting handoffs that depend on the new path.

When updating `workflow.yaml` after a flow has already started, preserve every node and active handoff edge that runtime state still references. The new snapshot must include nodes referenced by `runningNodes`, `awaitingHumanNodes`, `pendingHumanInputs`, `visitedNodeIds`, `awaitingHandoff`, `completedHandoffs`, and `receivingHandoff`. Completed handoff keys must still exist as forward edges. Active receiving handoff keys must still connect adjacent nodes in either direction, so backward correction handoffs remain valid. Nodes waiting for human input must keep the same role instance id.
