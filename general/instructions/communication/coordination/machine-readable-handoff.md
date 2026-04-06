# How to Create a Machine-Readable Handoff Block

## What It Is

A machine-readable handoff block is a structured YAML block emitted by an agent at every session pause point. It declares, in a parseable format, which role or roles receive control next and which artifact each receiving role should read.

The format contract belongs to A-Society. Orchestration tools are platform-specific and outside A-Society's scope. The block defines what any orchestrator consumes; it does not define the orchestrator itself.

---

## When to Emit It

Emit a machine-readable block at every session pause point — whenever the agent hands control to another role.

Do not emit a block for:
- In-session confirmations or acknowledgments that do not hand off to another role
- Clarification exchanges where no formal pause is needed — when you do need human input before continuing, emit `type: prompt-human` rather than a routing handoff
- Intermediate output that does not conclude a phase

**Form selection rule:**
At fork points — when the workflow graph has multiple outgoing edges from the current node — emit one handoff entry per fork target using the array form defined below.
At non-fork points, emit a single handoff using the standard single-object form.

---

## How to Emit It

Emit the block as a fenced code block with the fence tag `handoff`. The `handoff` tag makes the block distinctly identifiable by parsers without ambiguity against other structured blocks the agent may produce.

The block is always last in the agent's pause-point output.

---

## The Schema

The handoff block supports two forms:

### Single-target form (default)

Use this when the current workflow node has exactly one outgoing edge.

```yaml
role:            <string>       # Receiving role name (e.g., "Owner", "Curator")
artifact_path:   <string>       # Primary artifact for the receiving role to read;
                                # path relative to the repository root
```

### Array form (fork points)

Use this when the current workflow node has multiple outgoing edges.

```yaml
- role:          <string>       # First fork target
  artifact_path: <string>
- role:          <string>       # Second fork target
  artifact_path: <string>
```

Emit one array entry per fork target. The orchestrator validates that:
- the number of entries matches the number of outgoing edges from the current workflow node
- each entry's `role` matches one of the successor nodes' roles

### Typed signal forms (closure and interaction)

Use this for framework-level signals that do not route to a new workflow node but instead trigger runtime behavior (closure, improvement, or human interaction). Typed signals are discriminated by a `type` field.

**`forward-pass-closed`** — Signals the end of the forward pass.
```yaml
type: forward-pass-closed
record_folder_path: <string>       # Path to the record folder
artifact_path: <string>            # Path to the Owner's closure artifact
```

**`meta-analysis-complete`** — Produced by backward-pass meta-analysis sessions.
```yaml
type: meta-analysis-complete
findings_path: <string>            # Path to the findings artifact
```

**`prompt-human`** — Pauses the session for human input.
```yaml
type: prompt-human
```
**When to emit:** Emit `type: prompt-human` when the agent needs a human reply before it can continue — a clarification question, a missing input, or an approval that only the human can provide. The agent writes its question as normal response text and ends with this block.

**Behavior:** The runtime prompts the human for a reply, appends it to the session history, and resumes the same agent session. This may repeat across multiple exchanges; the session continues until the agent emits a routing handoff.

**Constraint:** Do not emit `type: prompt-human` when a routing target is already determinable. Use it only when the agent genuinely cannot proceed without human input.

### Field Definitions

**`role`** — The name of the receiving role as defined in the project's `agents.md`. Must be a non-empty string matching a declared role (e.g., `"Owner"`, `"Curator"`, `"Technical Architect"`).

**`artifact_path`** — The primary artifact the receiving role must read at session start. Relative to the repository root. Must be a non-empty string.

**`type`** — Discriminator for typed signal forms. Must be one of `forward-pass-closed`, `meta-analysis-complete`, or `prompt-human`.

**`record_folder_path`** — Used in `forward-pass-closed`; the repo-relative path to the record folder for the current flow.

**`findings_path`** — Used in `meta-analysis-complete`; the repo-relative path to the findings artifact produced in the meta-analysis session.

---

## Worked Example

**Single-target case (non-fork):**

```handoff
role: Owner
artifact_path: [project-name]/a-docs/records/[record-folder]/03-curator-to-owner.md
```

**Fork-point case (parallel tracks):**

```handoff
- role: Tooling Developer
  artifact_path: [project-name]/a-docs/records/[record-folder]/04-owner-approval.md
- role: Runtime Developer
  artifact_path: [project-name]/a-docs/records/[record-folder]/04-owner-approval.md
```

**Phase-closure case (single target):**

```handoff
role: Owner
artifact_path: [project-name]/a-docs/records/[record-folder]/[NN]-curator-to-owner.md
```

**Closure signal case (forward pass):**

```handoff
type: forward-pass-closed
record_folder_path: [project-name]/a-docs/records/[record-folder]
artifact_path: [project-name]/a-docs/records/[record-folder]/[NN]-owner-closure.md
```

**Meta-analysis completion case:**

```handoff
type: meta-analysis-complete
findings_path: [project-name]/a-docs/records/[record-folder]/[NN]-[role]-findings.md
```

**Human interaction case:**

```handoff
type: prompt-human
```

**Synthesis and flow-closure handoffs:** When the synthesis role completes synthesis, the flow closes unconditionally — no further handoff block is required for the current flow. If synthesis produces follow-up items that initiate a new flow, those are filed as new trigger inputs rather than continued within the current flow's handoff chain. Synthesis completion is the terminal event; there is no receiving role to hand off to within the current flow.

---

## How Projects Adopt This

1. **Add a reference to the project's handoff protocol.** In `a-docs/communication/coordination/handoff-protocol.md`, add a subsection stating that at every session pause point, agents must emit a machine-readable block per this instruction.

2. **Reference this instruction from agent role documents.** In role documents, note that the machine-readable block is required at every pause point.

3. **Register the instruction in the project's index.** Add a row mapping the instruction's variable name (e.g., `$INSTRUCTION_MACHINE_READABLE_HANDOFF`) to the instruction file path, so the variable resolves correctly in references.

No project-level schema customization is permitted. Projects do not add fields, change field types, or alter enum values. The schema is fixed — any orchestrator consuming it depends on this stability.
