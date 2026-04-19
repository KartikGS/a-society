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
record_folder_path: <string>
artifact_path: <string>
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
Do not use `prompt-human` as the terminal signal for backward-pass meta-analysis or synthesis sessions; those sessions must end with `meta-analysis-complete` or `backward-pass-complete`.

---

## Field Definitions

**`target_node_id`** — Non-empty workflow node identifier naming the receiving node.

**`artifact_path`** — Repo-relative path to the primary artifact for the next phase or terminal signal.

**`type`** — One of `forward-pass-closed`, `meta-analysis-complete`, `backward-pass-complete`, or `prompt-human`.

**`record_folder_path`** — Repo-relative path to the active record folder. Used only by `forward-pass-closed`.

**`findings_path`** — Repo-relative path to the findings artifact produced in a meta-analysis session. Used only by `meta-analysis-complete`.

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
record_folder_path: [project-name]/a-docs/records/[record-folder]
artifact_path: [project-name]/a-docs/records/[record-folder]/[NN]-owner-closure.md
```

**Meta-analysis completion**

```handoff
type: meta-analysis-complete
findings_path: [project-name]/a-docs/records/[record-folder]/[NN]-[role]-findings.md
```

**Backward-pass completion**

```handoff
type: backward-pass-complete
artifact_path: [project-name]/a-docs/records/[record-folder]/[NN]-curator-synthesis.md
```

**Human interaction**

```handoff
type: prompt-human
```

When synthesis completes, emit `type: backward-pass-complete` with the synthesis artifact path. This is a terminal signal, not a routing handoff.
