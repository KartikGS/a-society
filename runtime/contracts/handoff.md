# A-Society Runtime Handoff Contract

Emit machine-readable handoff blocks exactly as specified here.

## When to Emit It

Emit a machine-readable block at every session pause point:

- when handing control to another role
- when signaling forward-pass closure
- when signaling backward-pass progress or completion
- when pausing for human input
- when suspending to wait for an inbound handoff from another node

**Form selection rule:**
When exactly one target node must receive the handoff, emit a single-object form.
When multiple target nodes must receive the handoff, emit one handoff entry per target using the array form.

**Neighbor-only handoff rule:**
A node may only handoff to its direct neighbors — forward to immediate successors, backward to immediate predecessors. Handoffs to non-adjacent nodes are not permitted. To route work to a node that is not a direct neighbor, chain handoffs through each intermediate node in sequence: each node receives the work and passes it to its own neighbor until the destination is reached.

Do not add reverse workflow edges to make backward clarification or correction possible. Runtime workflow edges remain a DAG; every forward edge already allows the downstream node to hand off backward to its immediate upstream node.

---

## How to Emit It

Emit the block as a fenced code block tagged `handoff`.

The block is always last in the pause-point output.

---

## Schema

### Single-target form

Use this when the current workflow node has exactly one target node for this pause point.

```yaml
target_node_id: <string>
artifact_path:   <string>
```

### Array form

Use this when the current workflow node has multiple target nodes for this pause point.

```yaml
- target_node_id: <string>
  artifact_path:   <string>
- target_node_id: <string>
  artifact_path:   <string>
```

Emit one array entry per target node.

### Typed signals

Use typed signals when the output is not routing to another workflow node but triggering runtime behavior.

**`forward-pass-closed`**
```yaml
type: forward-pass-closed
```

Only the last owner node may emit `forward-pass-closed`. The last owner node is the owner node with no outgoing edges in the workflow graph. In a workflow with a single owner node, that node is the last owner node. No other role and no other owner node may emit this signal. If the forward pass is not yet complete, emit a handoff to the next node instead.

**`meta-analysis-complete`**
```yaml
type: meta-analysis-complete
findings_path: <string>
```

**`backward-pass-complete`**
```yaml
type: backward-pass-complete
artifact_path: <string>
```

**`prompt-human`**
```yaml
type: prompt-human
```

Emit `type: prompt-human` only when the session cannot continue without a human reply. If a handoff cannot be completed because the expected workflow path is blocked or unclear, emit `prompt-human` to surface the situation to the human rather than attempting an unauthorized transition.
Do not use `prompt-human` as the terminal signal for backward-pass meta-analysis or feedback sessions; those sessions must end with `meta-analysis-complete` or `backward-pass-complete`.

**`await-handoff`**
```yaml
type: await-handoff
```

Emit `type: await-handoff` to suspend the current node and wait for an inbound handoff from another node. Valid only when the current node already has a pending or received handoff directed at it (i.e. it previously emitted a handoff to the node it expects a reply from). If no such handoff exists the runtime will reject the signal and ask the role to emit the outbound handoff first.

---

## Field Definitions

**`target_node_id`** — Non-empty workflow node identifier naming the receiving node.

**`artifact_path`** — Repo-relative path to the primary artifact for the next phase or terminal signal.

**`type`** — One of `forward-pass-closed`, `meta-analysis-complete`, `backward-pass-complete`, `prompt-human`, or `await-handoff`.

**`findings_path`** — Repo-relative path to the runtime-assigned findings artifact produced in a meta-analysis session. Used only by `meta-analysis-complete`.

---

## Examples

**Single target**

```handoff
target_node_id: owner-review
artifact_path: .a-society/state/[project-name]/[flow-id]/record/reviewer-to-owner.md
```

**Fork**

```handoff
- target_node_id: framework-services-implementation
  artifact_path: .a-society/state/[project-name]/[flow-id]/record/owner-approval.md
- target_node_id: orchestration-implementation
  artifact_path: .a-society/state/[project-name]/[flow-id]/record/owner-approval.md
```

**Backward revise / resubmission**

```handoff
target_node_id: producer-revision
artifact_path: .a-society/state/[project-name]/[flow-id]/record/reviewer-to-producer.md
```

**Forward-pass closure**

```handoff
type: forward-pass-closed
```

**Meta-analysis completion**

```handoff
type: meta-analysis-complete
findings_path: .a-society/state/[project-name]/[flow-id]/record/findings/[role]-findings.md
```

**Backward-pass completion**

```handoff
type: backward-pass-complete
artifact_path: .a-society/state/[project-name]/[flow-id]/record/[NN]-owner-feedback.md
```

**Human interaction**

```handoff
type: prompt-human
```

**Await inbound handoff**

```handoff
type: await-handoff
```
