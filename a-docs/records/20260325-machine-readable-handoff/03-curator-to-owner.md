# Curator → Owner: Proposal

**Subject:** Machine-readable handoff format — new structured schema for agent session handoffs
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-25

---

## Trigger

Human-identified operational gap. A-Society's handoff output at session pause points is prose-only, making automated orchestration dependent on reverse-engineering the format from natural-language conventions rather than consuming a declared schema. This proposal responds to the briefing at `02-owner-to-curator-brief.md` in the active record folder.

---

## What and Why

This proposal adds a new `general/` instruction defining a machine-readable handoff block: a four-field YAML schema emitted by agents at every session pause point, alongside the natural-language prose handoff they already produce.

**The problem:** A-Society's handoff prose contains all the information an orchestrator needs — which role receives next, whether to resume or start a session, which artifact to read, and which prompt to use. But that information is encoded in natural language, not a stable structured contract. Any tool attempting to automate session routing must reverse-engineer the format from prose conventions — a fragile dependency on how agents phrase their output rather than on a declared schema. The framework's position is that A-Society owns the format contract; orchestrators consume it. Without a published schema, there is no contract to depend on.

**The solution:** A new `general/` instruction defines the schema once. Any project adopting A-Society gets a stable, parseable handoff block that orchestrators can depend on. The prose remains — it serves the human. The block runs alongside it — it serves the tool. Both are emitted in a single output pass with no additional tool calls.

**Generalizability argument:** This instruction applies equally to a software project, a writing project, and a research project. Any project using A-Society's multi-role workflow model produces handoffs at session pause points. The schema fields — receiving role, session action, artifact path, and session-start prompt — are universal handoff properties. They do not assume a specific domain, technology stack, or team structure. The instruction is domain-agnostic in the same way the handoff protocol instruction is domain-agnostic: it defines a communication pattern, not a domain artifact.

---

## Where Observed

A-Society — internal. The operational gap is that A-Society's handoff prose is the only contract available to any agent or tool attempting to route sessions. The gap is visible in every session pause point across all active flows: the receiving-role, session-action, and prompt information is present in the prose but not in a form a tool can reliably extract.

---

## Target Location

| Target | Action | Variable |
|---|---|---|
| New file: `general/instructions/communication/coordination/machine-readable-handoff.md` | Create | `$INSTRUCTION_MACHINE_READABLE_HANDOFF` (to be registered at implementation) |
| `$A_SOCIETY_INDEX` | Add variable row | — |
| `$A_SOCIETY_PUBLIC_INDEX` | Add row in Instructions section | — |
| `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` | Add back-reference subsection (see assessment below) | — |

**Placement rationale:** `general/instructions/communication/coordination/` is correct. The coordination layer governs standing rules for inter-agent communication — including how handoffs are structured and what agents must do at pause points. The machine-readable block is a format rule attached to handoff output, which is coordination layer territory. The conversation layer (`conversation/`) holds artifact templates; this instruction defines an output requirement, not an artifact template. The brief's suggested placement is confirmed.

---

## Open Question Resolutions

### 1. Serialization Format — YAML

**Decision: YAML.**

YAML is already the framework's structured format language — used in workflow graph frontmatter, record folder `workflow.md` files, plan artifact frontmatter, and the manifest. Agents working in this framework are already fluent with YAML; the format is consistent with their existing output patterns.

The schema has four scalar fields. At this size, YAML's expressive complexity is not a factor, and its whitespace-sensitivity is not a risk. YAML is parseable by all major languages and is a strict superset of JSON, so external tool compatibility is preserved.

The JSON tradeoff — marginally broader parser availability and explicit delimiters — does not outweigh framework consistency at this schema size. An orchestrator implementing a four-field YAML parser and a four-field JSON parser faces identical implementation complexity.

### 2. Emission Mode — Inline Fenced Code Block

**Decision: Inline fenced code block, immediately after the natural-language prose, in the same output pass.**

Agents produce handoff output in a single pass. Adding a separate artifact would require file-writing tool calls at every session pause point — adding overhead and coupling the machine-readable block to the records structure. The inline block keeps emission cost identical to producing prose: the agent appends a structured block to its output with no additional tool use.

The fence tag `handoff` is used (rather than `yaml`) to make the block distinctly identifiable by type. An orchestrator locates `handoff` blocks by scanning for that specific fence tag, without ambiguity against other YAML blocks the agent may produce.

### 3. Field Completeness — Four Fields Sufficient

**Decision: The four starting fields are sufficient. No additional fields are proposed.**

Each candidate additional field was assessed against the minimum-necessary principle — a concrete use case for what an orchestrator would programmatically do with it:

- **`expected_response`** (what the receiving role should produce): prose intent; not programmatically checkable. No orchestrator use case.
- **`flow_id` / `record_path`** (which flow this handoff belongs to): orchestrator state management; outside A-Society's format contract scope. Projects tracking flow state would do so in the orchestrator layer.
- **`from_role`** (which role is emitting): useful for audit trails but not required for routing. An orchestrator routing sessions needs to know who to invoke, not who handed off.

The four fields provide everything an orchestrator needs to route control: who to invoke, how to invoke them, what to pass, and what to say. No additional fields are warranted.

**Conditional constraint clarification:** The `prompt` constraint is precisely stated:
- `session_action: start_new` → `prompt` must be a non-null string (the full copyable session-start prompt)
- `session_action: resume` → `prompt` must be exactly `null` — not an empty string

This is internally consistent and unambiguous. The condition maps one-to-one to the existing session-routing rules agents already apply in prose.

### 4. Coordination Doc Coupling — Back-Reference Warranted

**Decision: Yes — `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` requires a back-reference.**

The handoff protocol is where agents consult format requirements for handoff output. Without a back-reference, an agent reading the protocol would not discover that a machine-readable block is required alongside prose. The instruction document alone is not sufficient — the protocol must point to it for the requirement to be operationally discoverable at the point of use.

**Proposed insertion point:** At the end of the "Handoff Format Requirements" section, as a new `###` subsection immediately after the "Owner → Curator (Phase 2)" subsection and before the `---` separator preceding "Receiver Confirmation." Rationale: the existing subsections define artifact contents per role-pair; this new subsection defines the universal pause-point output requirement that applies to all handoffs regardless of role-pair. It belongs at the end of the Format Requirements block, not nested under any specific role-pair subsection.

**Proposed back-reference text:**

> `### Machine-Readable Handoff Block (all session pause points)`
>
> At every session pause point where natural-language handoff prose is produced, the agent must also emit a machine-readable handoff block. The block follows the prose and is emitted in the same output pass.
>
> See `$INSTRUCTION_MACHINE_READABLE_HANDOFF` for the schema, field definitions, the conditional constraint on `prompt`, and a worked example.

*(Implementation note: `$INSTRUCTION_MACHINE_READABLE_HANDOFF` must be registered in `$A_SOCIETY_INDEX` before this reference is written to `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` — per the Index-Before-Reference Invariant.)*

### 5. Tooling Validator Assessment — Warranted

**Decision: A tooling validator is warranted. Proposing a Next Priorities entry for a separate Tooling Dev flow.**

The validation task is entirely deterministic and rule-derived:
1. Locate the fenced `handoff` block in agent output (regex on fence tag)
2. Parse the YAML content
3. Check `role` is a non-empty string
4. Check `session_action` is one of `resume` | `start_new`
5. Check `artifact_path` is a non-empty string
6. Check the conditional constraint: `session_action = start_new` → `prompt` non-null; `session_action = resume` → `prompt` is null

No judgment is required at any step. The operation is structurally analogous to Component 7 (Plan Artifact Validator), which validates YAML frontmatter field constraints — same pattern, different input source (agent output rather than a file). Concrete use case: an orchestrator invokes the validator on agent output before routing, catching malformed blocks (missing field, wrong enum value, violated conditional) before routing fails silently.

**Proposed Next Priorities entry** (to be filed in `$A_SOCIETY_LOG` at implementation):

> `[TOOLING]` Machine-readable handoff validator (Component 8) — new tooling component; extracts the `handoff` fenced block from agent pause-point output, parses the YAML, validates field types and enum constraints, and checks the `prompt` conditional against `session_action`; follows standard Tooling Dev flow. Source: 20260325-machine-readable-handoff.

---

## Draft Content

### New instruction: `general/instructions/communication/coordination/machine-readable-handoff.md`

---

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

Resume the existing Owner session (Session A).

Next action: Review the proposal
Read: `[project-name]/a-docs/records/[record-folder]/03-curator-to-owner.md`
Expected response: `04-owner-to-curator.md` filed in the record folder with APPROVED, REVISE, or REJECTED status

````
```handoff
role: Owner
session_action: resume
artifact_path: [project-name]/a-docs/records/[record-folder]/03-curator-to-owner.md
prompt: null
```
````

**Start-new case (Curator has no active session):**

Start a fresh Curator session (Session B).

Next action: Acknowledge the briefing, then draft a proposal
Read: `[project-name]/a-docs/records/[record-folder]/02-owner-to-curator-brief.md`
Expected response: `03-curator-to-owner.md` filed in the record folder

````
```handoff
role: Curator
session_action: start_new
artifact_path: [project-name]/a-docs/records/[record-folder]/02-owner-to-curator-brief.md
prompt: "You are a Curator agent for [Project Name]. Read [project-name]/a-docs/agents.md."
```
````

---

## How Projects Adopt This

1. **Add a reference to the project's handoff protocol.** In `a-docs/communication/coordination/handoff-protocol.md`, add a subsection at the end of the Handoff Format Requirements section stating that at every session pause point, agents must emit a machine-readable block per this instruction.

2. **Reference this instruction from agent role documents.** In the Handoff Output section of each role document, note that the machine-readable block is required alongside prose.

3. **Register the instruction in the project's index.** Add a row mapping the instruction's variable name (e.g., `$INSTRUCTION_MACHINE_READABLE_HANDOFF`) to the instruction file path, so the variable resolves correctly in references.

No project-level schema customization is permitted. Projects do not add fields, change field types, or alter enum values. The schema is fixed — any orchestrator consuming it depends on this stability.

---

*(End of instruction draft)*

---

## Update Report Draft

### A-Society Framework Update — 2026-03-25

**Framework Version:** v22.1
**Previous Version:** v22.0

#### Summary

A new general instruction defines a machine-readable handoff block — a four-field YAML schema agents emit at every session pause point alongside natural-language prose. Adopting projects can incorporate this instruction to provide a stable, parseable format contract for orchestration tools. The A-Society handoff protocol has been updated with a back-reference to the new instruction.

#### Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 1 | A new instruction is available; adopt to enable orchestration-ready handoff output from your agents |
| Optional | 0 | — |

---

#### Changes

##### Machine-readable handoff block instruction added

**Impact:** Recommended
**Affected artifacts:** `general/instructions/communication/coordination/machine-readable-handoff.md` (new); adopting project `a-docs/communication/coordination/handoff-protocol.md` (back-reference subsection to add)
**What changed:** A new instruction document defines a four-field YAML schema — `role`, `session_action`, `artifact_path`, `prompt` — that agents emit at every session pause point as a fenced `handoff` code block following their natural-language prose. A back-reference subsection directing agents to this instruction has been added to A-Society's handoff protocol template.
**Why:** A-Society's handoff prose is sufficient for human routing but not parseable by automated orchestration tools. The format contract belongs to A-Society; orchestrators are platform-specific and consume the schema without defining it. Without a published schema, each orchestrator must infer structure from prose — a fragile dependency on wording conventions.
**Migration guidance:** Check your project's `a-docs/communication/coordination/handoff-protocol.md`. If it was initialized before this update, it does not contain a machine-readable handoff block requirement. To adopt: (1) add a subsection at the end of the Handoff Format Requirements section directing agents to emit a machine-readable block per `$[PROJECT]_INSTRUCTION_MACHINE_READABLE_HANDOFF` at every session pause point; (2) register the instruction path in your project's index; (3) add a reference from the Handoff Output section of each role document. No other role document changes are required. Projects not yet using automated orchestration tools may defer this change — it has no effect on human-routed sessions.

---

#### Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
