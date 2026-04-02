# How to Create a Machine-Readable Handoff Block

## What It Is

A machine-readable handoff block is a structured YAML block emitted by an agent at every session pause point alongside its natural-language handoff prose. It declares, in a parseable format, which role or roles receive control next and which artifact each receiving role should read.

The format contract belongs to A-Society. Orchestration tools are platform-specific and outside A-Society's scope. The block defines what any orchestrator consumes; it does not define the orchestrator itself.

---

## Why It Exists

A-Society's natural-language handoff prose is sufficient for a human reading it and routing the next session manually. It is not parseable by an orchestration tool: there is no structured contract a tool can extract to determine which role to invoke or which artifact to pass.

The machine-readable block solves this without replacing the prose. Both are emitted in a single output pass. The human reads the prose; the tool reads the block. No additional tool calls or separate artifacts are required.

---

## When to Emit It

Emit a machine-readable block at every session pause point where natural-language handoff prose is produced — that is, whenever the agent hands control to another role and instructs the human to switch or start a session.

Do not emit a block for:
- In-session confirmations or acknowledgments that do not hand off to another role
- Clarification exchanges within an active session
- Intermediate output that does not conclude a phase

**Form selection rule:**
At fork points — when the workflow graph has multiple outgoing edges from the current node — emit one handoff entry per fork target using the array form defined below.
At non-fork points, emit a single handoff using the standard single-object form.

---

## How to Emit It

Emit the block as a fenced code block with the fence tag `handoff`, immediately after the natural-language prose. The `handoff` tag makes the block distinctly identifiable by parsers without ambiguity against other structured blocks the agent may produce.

The block is always last in the agent's pause-point output — after the prose, not before or interspersed within it.

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

### Field Definitions

**`role`** — The name of the receiving role as defined in the project's `agents.md`. Must be a non-empty string matching a declared role (e.g., `"Owner"`, `"Curator"`, `"Technical Architect"`).

**`artifact_path`** — The primary artifact the receiving role must read at session start. Relative to the repository root, consistent with path conventions used in role Handoff Output sections. Must be a non-empty string.

---

## Worked Example

The following examples show complete pause-point handoffs — natural-language prose followed immediately by the machine-readable block.

**Single-target case (non-fork):**

---

Next action: Review the proposal
Read: `[project-name]/a-docs/records/[record-folder]/03-curator-to-owner.md`
Expected response: `04-owner-to-curator.md` filed in the record folder with APPROVED, REVISE, or REJECTED status

```handoff
role: Owner
artifact_path: [project-name]/a-docs/records/[record-folder]/03-curator-to-owner.md
```

---

**Fork-point case (parallel tracks):**

---

Next action: Open both implementation tracks from the approved convergence decision
Read: `[project-name]/a-docs/records/[record-folder]/04-owner-approval.md`
Expected response: parallel completion artifacts from both receiving roles

```handoff
- role: Tooling Developer
  artifact_path: [project-name]/a-docs/records/[record-folder]/04-owner-approval.md
- role: Runtime Developer
  artifact_path: [project-name]/a-docs/records/[record-folder]/04-owner-approval.md
```

---

**Phase-closure case (single target):**

---

Next action: Verify implementation and registration complete; proceed to forward pass closure
Read: `[project-name]/a-docs/records/[record-folder]/[NN]-curator-to-owner.md`
Expected response: Forward pass closure message with backward pass initiation

```handoff
role: Owner
artifact_path: [project-name]/a-docs/records/[record-folder]/[NN]-curator-to-owner.md
```

---

**Synthesis and flow-closure handoffs:** When the synthesis role completes backward pass synthesis, the flow closes unconditionally — no further handoff block is required for the current flow. If synthesis produces follow-up items that initiate a new flow, those are filed as new trigger inputs rather than continued within the current flow's handoff chain. Synthesis completion is the terminal event; there is no receiving role to hand off to within the current flow.

---

## How Projects Adopt This

1. **Add a reference to the project's handoff protocol.** In `a-docs/communication/coordination/handoff-protocol.md`, add a subsection at the end of the Handoff Format Requirements section stating that at every session pause point, agents must emit a machine-readable block per this instruction.

2. **Reference this instruction from agent role documents.** In the Handoff Output section of each role document, note that the machine-readable block is required alongside prose.

3. **Register the instruction in the project's index.** Add a row mapping the instruction's variable name (e.g., `$INSTRUCTION_MACHINE_READABLE_HANDOFF`) to the instruction file path, so the variable resolves correctly in references.

No project-level schema customization is permitted. Projects do not add fields, change field types, or alter enum values. The schema is fixed — any orchestrator consuming it depends on this stability.
