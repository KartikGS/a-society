# A-Society Runtime Handoff Contract

This file defines the machine-readable handoff block format used by the A-Society runtime.

The runtime injects this contract into every runtime-managed session. It is runtime-owned context, not part of any role's `required-readings.yaml`.

---

## When to Emit It

Emit a machine-readable block at every session pause point:

- when handing control to another role
- when signaling forward-pass closure
- when signaling backward-pass progress or completion
- when pausing for human input
- when suspending to wait for an inbound handoff from another node

Do not emit a block for:

- in-session confirmations that do not pause or transfer control
- intermediate output that does not conclude the current step

**Form selection rule:**
When exactly one target node must receive the handoff, emit a single-object form.
When multiple target nodes must receive the handoff, emit one handoff entry per target using the array form.

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

Emit `type: prompt-human` only when the session cannot continue without a human reply.
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
artifact_path: [project-name]/a-docs/records/[record-folder]/03-curator-to-owner.md
```

**Fork**

```handoff
- target_node_id: framework-services-implementation
  artifact_path: [project-name]/a-docs/records/[record-folder]/04-owner-approval.md
- target_node_id: orchestration-implementation
  artifact_path: [project-name]/a-docs/records/[record-folder]/04-owner-approval.md
```

**Backward revise / resubmission**

```handoff
target_node_id: curator-proposal
artifact_path: [project-name]/a-docs/records/[record-folder]/04-owner-to-curator.md
```

**Forward-pass closure**

```handoff
type: forward-pass-closed
```

**Meta-analysis completion**

```handoff
type: meta-analysis-complete
findings_path: [project-name]/a-docs/records/[record-folder]/findings/[role]-findings.md
```

**Backward-pass completion**

```handoff
type: backward-pass-complete
artifact_path: [project-name]/a-docs/records/[record-folder]/[NN]-owner-feedback.md
```

**Human interaction**

```handoff
type: prompt-human
```

When the final feedback step completes, emit `type: backward-pass-complete` with the feedback artifact path. This is a terminal signal, not a routing handoff.

**Await inbound handoff**

```handoff
type: await-handoff
```

Emitted after the node has already sent a handoff to another node and is now suspending to wait for that node to send work back.
