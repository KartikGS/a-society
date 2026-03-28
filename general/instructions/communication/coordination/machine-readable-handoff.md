# How to Create a Machine-Readable Handoff Block

## What It Is

A machine-readable handoff block is a structured YAML block emitted by an agent at every session pause point alongside its natural-language handoff prose. It declares, in a parseable format, which role receives control next, what session action is required, which artifact the receiving role should read, and — when a new session is needed — the prompt to use.

The format contract belongs to A-Society. Orchestration tools are platform-specific and outside A-Society's scope. The block defines what any orchestrator consumes; it does not define the orchestrator itself.

---

## Why It Exists

A-Society's natural-language handoff prose is sufficient for a human reading it and routing the next session manually. It is not parseable by an orchestration tool: there is no structured contract a tool can extract to determine which role to invoke, whether to start a new session or resume one, which artifact to pass, or which prompt to use.

The machine-readable block solves this without replacing the prose. Both are emitted in a single output pass. The human reads the prose; the tool reads the block. No additional tool calls or separate artifacts are required.

---

## When to Emit It

Emit a machine-readable block at every session pause point where natural-language handoff prose is produced — that is, whenever the agent hands control to another role and instructs the human to switch or start a session.

Do not emit a block for:
- In-session confirmations or acknowledgments that do not hand off to another role
- Clarification exchanges within an active session
- Intermediate output that does not conclude a phase

---

## How to Emit It

Emit the block as a fenced code block with the fence tag `handoff`, immediately after the natural-language prose. The `handoff` tag makes the block distinctly identifiable by parsers without ambiguity against other structured blocks the agent may produce.

The block is always last in the agent's pause-point output — after the prose, not before or interspersed within it.

---

## The Schema

```
role:            <string>       # Receiving role name (e.g., "Owner", "Curator")
session_action:  <enum>         # "resume" | "start_new"
artifact_path:   <string>       # Primary artifact for the receiving role to read;
                                # path relative to the repository root
prompt:          <string|null>  # Full copyable session-start prompt;
                                # required (non-null) when session_action = "start_new";
                                # must be null when session_action = "resume"
```

### Field Definitions

**`role`** — The name of the receiving role as defined in the project's `agents.md`. Must be a non-empty string matching a declared role (e.g., `"Owner"`, `"Curator"`, `"Technical Architect"`).

**`session_action`** — The session instruction for the human. Exactly one of:
- `resume` — the receiving role has an active session; the human resumes it
- `start_new` — no active session exists for this role; the human starts a fresh one

**`artifact_path`** — The primary artifact the receiving role must read at session start. Relative to the repository root, consistent with path conventions used in role Handoff Output sections. Must be a non-empty string.

For phase-closure handoffs where the receiving role verifies completion rather than reads a new proposal or decision — for example, a Curator returning to the Owner after implementation and registration are complete — `artifact_path` should point to the primary artifact the receiving role needs to confirm closure: typically the final submission artifact in the record folder (e.g., the registration confirmation or implementation summary). If no single artifact represents the completion state, point to the record folder's most recent sequenced artifact.

**`prompt`** — The session-start prompt the human copies to open a new session.
- When `session_action` is `start_new`: must be a non-null string containing the full prompt.
- When `session_action` is `resume`: must be `null`. Do not use an empty string — use explicit `null`.

### Conditional Constraint

| `session_action` | `prompt` requirement |
|---|---|
| `start_new` | Non-null string — the full copyable session-start prompt |
| `resume` | `null` — exactly; an empty string is malformed |

A block with `session_action: start_new` and `prompt: null` is malformed. A block with `session_action: resume` and a non-null `prompt` is malformed.

---

## Worked Example

The following shows a complete pause-point handoff at the end of a Curator session — natural-language prose followed immediately by the machine-readable block.

**Resume case (Owner has an active session):**

---

Resume the existing Owner session (Session A).

Next action: Review the proposal
Read: `[project-name]/a-docs/records/[record-folder]/03-curator-to-owner.md`
Expected response: `04-owner-to-curator.md` filed in the record folder with APPROVED, REVISE, or REJECTED status

```handoff
role: Owner
session_action: resume
artifact_path: [project-name]/a-docs/records/[record-folder]/03-curator-to-owner.md
prompt: null
```

---

**Start-new case (Curator has no active session):**

---

Start a fresh Curator session (Session B).

Next action: Acknowledge the briefing, then draft a proposal
Read: `[project-name]/a-docs/records/[record-folder]/02-owner-to-curator-brief.md`
Expected response: `03-curator-to-owner.md` filed in the record folder

```handoff
role: Curator
session_action: start_new
artifact_path: [project-name]/a-docs/records/[record-folder]/02-owner-to-curator-brief.md
prompt: "You are a Curator agent for [Project Name]. Read [project-name]/a-docs/agents.md."
```

---

**Phase-closure case (receiving role verifies completion):**

---

Resume the existing Owner session (Session A).

Next action: Verify implementation and registration complete; proceed to forward pass closure
Read: `[project-name]/a-docs/records/[record-folder]/[NN]-curator-to-owner.md`
Expected response: Forward pass closure message with backward pass initiation

```handoff
role: Owner
session_action: resume
artifact_path: [project-name]/a-docs/records/[record-folder]/[NN]-curator-to-owner.md
prompt: null
```

---

**Synthesis and flow-closure handoffs:** When the synthesis role completes backward pass synthesis, the flow closes unconditionally — no further handoff block is required for the current flow. If synthesis produces follow-up items that initiate a new flow, those are filed as new trigger inputs rather than continued within the current flow's handoff chain. Synthesis completion is the terminal event; there is no receiving role to hand off to within the current flow.

---

## How Projects Adopt This

1. **Add a reference to the project's handoff protocol.** In `a-docs/communication/coordination/handoff-protocol.md`, add a subsection at the end of the Handoff Format Requirements section stating that at every session pause point, agents must emit a machine-readable block per this instruction.

2. **Reference this instruction from agent role documents.** In the Handoff Output section of each role document, note that the machine-readable block is required alongside prose.

3. **Register the instruction in the project's index.** Add a row mapping the instruction's variable name (e.g., `$INSTRUCTION_MACHINE_READABLE_HANDOFF`) to the instruction file path, so the variable resolves correctly in references.

No project-level schema customization is permitted. Projects do not add fields, change field types, or alter enum values. The schema is fixed — any orchestrator consuming it depends on this stability.
