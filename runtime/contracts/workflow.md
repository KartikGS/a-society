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
  summary: <string>                 # optional
  nodes:
    - id: <string>
      role: <string>
      required_readings:            # optional
        - $VARIABLE_NAME
      work:                         # optional
        - <string>
      human-colab: <boolean>        # optional; default false
      await-all-inputs: <boolean>   # optional; default false
  edges:
    - from: <node-id>
      to: <node-id>
```

A node carries only what the runtime acts on: its identity (`id`, `role`), the first-entry context it needs (`required_readings`, `work`), and two behavioral flags (`human-colab`, `await-all-inputs`). A node's inputs, outputs, and transitions are not authored fields — they are derived from `edges` and the live handoff state, and injected at node entry. Put node-specific guidance and cautions in `work`.

Validation rules:

- `workflow.name` is required and must be a non-empty string.
- `workflow` accepts only `name`, `summary`, `nodes`, and `edges`. Unknown top-level keys fail validation.
- `workflow.nodes` is required and must be a non-empty array.
- Every node requires non-empty string `id` and `role`.
- A node accepts only `id`, `role`, `required_readings`, `work`, `human-colab`, and `await-all-inputs`. Unknown node keys fail validation.
- `role` is a role instance id: lowercase kebab-case with an optional numeric `_N` suffix, such as `owner`, `technical-architect`, or `owner_2`.
- Node ids must be unique.
- The first declared node must have `id: owner-intake`.
- `required_readings` and `work` must be arrays of non-empty strings when present.
- `human-colab` and `await-all-inputs` must be booleans when present.
- `workflow.edges` is required and must be an array.
- An edge accepts only `from` and `to`, and both must match node ids.
- Edges define the forward DAG topology. Do not add reverse `to` -> `from` edges to model clarification or correction.
- Every forward edge already permits runtime backward handoffs from its `to` node to its `from` node.
- The graph must be acyclic.

Strict validation additionally requires a single `owner` start node whose id is `owner-intake`, and an `owner` terminal node. A single-node workflow is valid only when that node's id is `owner-intake` and its role id is `owner`.

---

## Record Snapshot Rules

Use record `workflow.yaml` as the active-path snapshot.

- Include only the nodes and edges this flow traverses or may still traverse.
- Keep node entries topology-first by default: `id`, `role`, and needed edges.
- Add node-contract fields only when the active flow needs an override or when the runtime-created draft needs enough first-entry guidance for the Owner to act.
- List every real review, approval, registration, or closure checkpoint as its own node. Do not rely on implied checkpoints.
- Update the snapshot before emitting a handoff to any node that depends on the changed topology.

---

## Node-Entry Injection

On first entry to a node, the node-entry user message includes the resolved node contract:

- `required_readings` — resolved through the project's index and included as file blocks. Injected only on first entry to that node. Reopened nodes and later same-role transitions rely on prior session continuity plus the current task inputs.
- `work` — the node's task bullets.
- the live handoff picture — inbound handoffs received (with artifact contents), inbound not yet received, and outbound edges sent / not yet sent — all derived from `edges` and handoff state.
- a human-collaboration directive when the node sets `human-colab: true`.

Do not use node-specific `required_readings` for files already loaded at role startup or for runtime-managed session contracts.

---

## Human-Collaborative Nodes (`human-colab`)

A node with `human-colab: true` is one where the human must stay in the decision. The runtime applies two behaviors:

1. **Entry directive.** On first node entry the runtime injects a standing instruction that this is a human-collaborative node: keep the human in the decision loop, surface the proposed decision before proceeding, and do not treat the node's work as final without explicit human direction or approval.
2. **Handoff approval gate.** When the node emits a forward handoff, the runtime does not commit it immediately. It stages the forward target(s) and the artifact path(s), suspends the node awaiting an operator decision, and asks the operator to approve or decline the handoff.
   - **Approve:** the staged handoff is committed exactly as emitted, without re-running the role.
   - **Decline:** the staged handoff is discarded and the node is parked awaiting plain human input; the operator drives the next step (typically by sending guidance, which resumes the role to produce a revised handoff).

The gate applies only to forward handoffs. Backward correction handoffs, `await-handoff`, `prompt-human`, and `forward-pass-closed` are never gated. A single approval decision covers the whole emitted handoff set, including parallel fan-out.

---

## Input Joins (`await-all-inputs`)

By default a join node becomes runnable as soon as any one inbound handoff is deliverable, and the role decides whether to wait for the rest (for example by emitting `await-handoff`).

A node with `await-all-inputs: true` is a strict AND-join: the runtime does not make it runnable until every inbound edge's handoff is complete. Author this only when every inbound edge is guaranteed to complete on the active path — an inbound edge that is pruned or never delivered will block the node indefinitely.

---

## Role Instances

Use the node `role` field as the role-session identity.

Use numbered role instance ids when two nodes share the same base role but must have separate runtime histories:

- `domain-lead_1`
- `domain-lead_2`
- `owner_1`
- `owner_2`

The suffix pattern is `role-id_N`, where `N` is a positive numeric suffix. The runtime loads the base role authority and base role required readings, while preserving a separate session identity and transcript for the numbered role instance.

Node `work` bullets such as "Domain Lead A" or "Domain Lead B" are descriptive only. They do not create separate runtime sessions.

Edges may connect neighboring nodes with the same role instance. The runtime treats the second node as a continuation of the same flow-scoped role-instance session and injects that node's current task inputs before the role continues.

If two nodes share the same role instance and become runnable at the same time, the runtime claims only the earliest runnable node for that role instance. Later same-role-instance nodes wait in derived scheduler state, or in the runner's initial-node list during startup/recovery, until the role instance is no longer running or awaiting human input.

If a flow needs separate runtime histories for the same base role, use separate numbered role instances. If distinct role instances are used, they may run in parallel.

---

## Handoff Routing

The handoff block's `target_node_id` must match a node id in the active record snapshot.

When exactly one node should receive control, emit a single handoff object. When parallel branches should start, emit one handoff entry per target node. The handoff syntax itself is defined in `runtime/contracts/handoff.md`; this file defines how those target node ids relate to `workflow.yaml`.

When the workflow snapshot changes mid-flow, the workflow-authority node must update `workflow.yaml` before emitting handoffs that depend on the new path.

When updating `workflow.yaml` after a flow has already started, preserve every node and active handoff edge that runtime state still references. The new snapshot must include nodes referenced by `runningNodes`, `awaitingHumanNodes`, `pendingHumanInputs`, `pendingHandoffApprovals`, `visitedNodeIds`, `awaitingHandoff`, `completedHandoffs`, and `receivingHandoff`. Completed handoff keys must still exist as forward edges. Active receiving handoff keys must still connect adjacent nodes in either direction, so backward correction handoffs remain valid. Nodes waiting for human input or for handoff approval must keep the same role instance id.
