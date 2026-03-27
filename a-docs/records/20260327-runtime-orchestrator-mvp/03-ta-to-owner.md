**Subject:** Runtime Orchestrator MVP - Phase 0 architecture design
**Status:** PENDING_REVIEW
**Type:** Technical Architect Architecture Design
**Date:** 2026-03-27

---

## Trigger

Owner brief (`02-owner-to-ta-brief.md`). This flow requires the binding Phase 0 architecture design for A-Society's runtime layer before any Runtime Developer work can begin.

This document resolves the four open questions in the brief and defines the six required architecture dimensions:

1. Runtime component decomposition
2. Session management model
3. LLM API integration approach
4. Interface design
5. Relationship to existing tooling components
6. MVP scope boundary

---

## Decision Summary

| Question | Decision |
|---|---|
| LLM provider scope | **Single provider for MVP: Anthropic**, behind a runtime-owned provider adapter boundary so multi-provider support can be added later without redesigning the session model |
| Session state persistence | **Durable file-based store** in `runtime/` private state, not in-memory and not a database for MVP |
| Handoff detection model | **Parse the machine-readable handoff block from the completed assistant response**; do not poll an external session transcript |
| Context injection scope | **Inject the full session-start required reading set for supported roles**, plus the active artifact and runtime step directive; do not inject on-demand documents preemptively |

These choices keep the MVP small while preserving the core runtime value: programmatic context injection, session-to-session routing, and automatic tool triggers.

---

## 1. Runtime Component Decomposition

The runtime layer should be decomposed into seven components. Each has one job. The runtime is an orchestrator, not a second tooling layer and not a second documentation layer.

| Component | Responsibility | Does not do |
|---|---|---|
| **1. Operator Interface** | Exposes the runtime's own CLI entry points for starting, resuming, and inspecting flows | Does not contain orchestration logic |
| **2. Flow Orchestrator** | Owns the forward-pass control loop: select current node, run a role turn, evaluate handoff, trigger tools, move to next node, stop on terminal/pause states | Does not call provider SDKs directly |
| **3. Context Injection Service** | Builds the context bundle for a role turn: required docs, active artifact, role behavior prompt, runtime directive | Does not infer additional docs beyond the approved session-start set |
| **4. Session Store** | Persists flow state, role-session histories, tool-trigger results, and last-known execution state for crash-safe resume | Does not store canonical project artifacts |
| **5. LLM Gateway** | Wraps the Anthropic client, streams output, normalizes provider errors, and returns completed assistant messages to the orchestrator | Does not decide routing or parse handoffs |
| **6. Handoff Interpreter** | Extracts and validates the final `handoff` fenced block per `$INSTRUCTION_MACHINE_READABLE_HANDOFF`; returns structured routing data or a parse failure | Does not guess missing fields or repair malformed blocks |
| **7. Tool Trigger Engine** | Invokes existing tooling components when runtime state reaches a declared trigger point | Does not reimplement tooling logic |

### Runtime-owned data contracts

The runtime should persist four internal objects:

- **`FlowRun`**: project root, workflow document path, record folder path, current workflow node, overall status
- **`RoleSession`**: role name, logical session id, transcript history, active/inactive state
- **`TurnRecord`**: turn number, input artifact, injected context bundle hash, assistant output, parsed handoff result
- **`TriggerRecord`**: tool component invoked, input summary, result summary, success/failure, retry status

### Why this decomposition is correct

- It separates orchestration from provider I/O.
- It keeps context assembly distinct from routing.
- It preserves tooling as a separate reusable layer that the runtime coordinates rather than absorbs.
- It gives the Runtime Developer clear implementation seams without changing the architecture later.

### a-docs format dependencies and co-maintenance obligations

This runtime design creates explicit `a-docs/` dependencies that are not currently tracked by `$A_SOCIETY_TOOLING_COUPLING_MAP`. They must be declared now.

**Dependency 1 - machine-readable handoff schema**

The Handoff Interpreter reads assistant output and parses the block defined by `$INSTRUCTION_MACHINE_READABLE_HANDOFF`:

- fenced code block tag: `handoff`
- fields: `role`, `session_action`, `artifact_path`, `prompt`
- conditional rule: `prompt` non-null for `start_new`, exactly `null` for `resume`

If that schema changes, the runtime parser must be updated.

**Dependency 2 - supported role context sets**

The Context Injection Service must know the required-reading set for each runtime-supported role. For MVP, the runtime should **not** parse the `Context Loading` prose from role documents at runtime. Instead, it should maintain a runtime-owned `roleContextRegistry` keyed by role name and framework namespace.

This creates a manual co-maintenance obligation:

- when a supported role's `Context Loading` list changes, `roleContextRegistry` must be updated
- when a role is added to MVP support, `roleContextRegistry` must gain a corresponding entry before orchestration is enabled for that role

This is preferable to parsing prose because it keeps runtime behavior deterministic and makes drift explicit rather than hidden in a fragile parser.

**Dependency 3 - workflow graph and record-folder schemas**

The runtime will read:

- the permanent workflow document YAML frontmatter validated by Component 3
- the record-folder `workflow.md` parsed by Component 4 at backward-pass trigger time

If either schema changes, the runtime's orchestration assumptions and trigger wiring must be checked.

**Flag to Owner**

These are real co-maintenance dependencies on `a-docs/` artifacts. They are outside the tooling coupling taxonomy today. The Owner should decide, in a later flow, whether the runtime layer needs an analogous dependency map or whether explicit declarations in runtime architecture documents are sufficient.

---

## 2. Session Management Model

### Session model choice

The MVP should emulate A-Society's standing-session pattern programmatically:

- one logical flow run
- one active logical session per role within that flow
- `resume` means append a new turn to the existing logical session
- `start_new` means create a new logical session for that role and archive the old one

This matches the current human model while moving the orchestration work into the runtime.

### Flow start inputs

The Operator Interface should require these inputs at flow start:

- `project_root`
- `workflow_document_path`
- `record_folder_path`
- `starting_role`
- `starting_artifact_path`

The runtime should not infer the workflow document from the record folder in MVP. No current framework artifact provides that mapping in a stable machine-readable way. Requiring it as startup input avoids introducing a new documentation dependency mid-MVP.

### Lifecycle

1. **Initialize flow run**
   The runtime creates a `FlowRun`, validates the supplied workflow document with Component 3, and records the starting node.

2. **Assemble context**
   The Context Injection Service resolves the role's required-reading set from `roleContextRegistry`, loads those documents programmatically, adds the active artifact, and appends a runtime directive telling the model what action to take and that any pause-point handoff must end with a compliant `handoff` block.

3. **Create or resume session**
   The Session Store either resumes the existing `RoleSession` for the role or creates a new one based on current flow state. For provider calls, the session is represented as locally persisted message history plus role identity.

4. **Run the model turn**
   The LLM Gateway sends the turn to the provider, streams output to the operator console, and returns the completed assistant message to the orchestrator.

5. **Persist turn output**
   The runtime stores the assistant message, any tool outputs triggered during the turn, and the updated session transcript.

6. **Parse handoff**
   The Handoff Interpreter extracts the final `handoff` block if present.

7. **Validate transition**
   The Flow Orchestrator compares the proposed receiving role against the current workflow node's allowed successor.

   MVP rule:
   - only workflows with **at most one outgoing edge per node** are eligible for full automation
   - if the current node has zero outgoing edges, the flow is terminal after the current turn
   - if the assistant proposes a different next role than the workflow allows, stop and mark the flow failed rather than guessing

8. **Run automatic triggers**
   If the transition or current node matches a declared trigger point, the Tool Trigger Engine runs the corresponding tooling component and records the result.

9. **Advance or pause**
   The runtime advances to the next node automatically when routing is valid and no human-collaborative pause is required.

   The runtime pauses with a durable status when:
   - a workflow node is marked `human-collaborative`
   - a tooling trigger fails
   - the handoff block is malformed
   - the provider call fails after retries
   - the flow reaches a terminal node

### Status model

The Session Store should support these statuses:

- `initialized`
- `running`
- `awaiting_human`
- `awaiting_retry`
- `completed`
- `failed`

### Teardown behavior

When a flow reaches `completed` or `failed`, the runtime should:

- archive any active `RoleSession` objects as closed
- write a final runtime summary into the flow's private runtime state
- preserve all transcripts and trigger records for later inspection
- leave record-folder artifacts untouched except for the artifacts already produced by the participating role sessions

### Why file-backed persistence is the correct MVP choice

- In-memory state would lose active flows on process restart.
- A database is unnecessary for the first version because the runtime is single-operator, local, and sequential.
- File-backed state is debuggable and auditable, which matters for a first orchestrator handling project-critical routing.

The state store should live under runtime-private storage in `runtime/`, not in project `a-docs/` or record folders. Record folders remain the home for canonical flow artifacts; runtime state remains operational metadata.

---

## 3. LLM API Integration Approach

### Provider choice

**MVP recommendation: Anthropic only.**

Rationale:

- the brief already frames Anthropic as the natural single-provider candidate
- one provider keeps authentication, model naming, retry behavior, and streaming semantics small enough for an MVP
- provider-agnostic architecture can still be preserved by introducing a narrow `LLMGateway` interface now

This is the correct boundary:

- **single provider in implementation**
- **provider adapter boundary in architecture**

The runtime should not attempt multi-provider routing, failover, or model normalization in the MVP.

### Client library

Use the **official Anthropic TypeScript SDK** from the runtime layer. Do not shell out to a CLI and do not wrap another agent tool. The runtime's defining architectural property is direct LLM API ownership.

### Call model

Use **streaming responses** for runtime-managed turns.

Rationale:

- the operator needs visibility into long-running role turns
- streaming preserves a live-session feel similar to today's manual agent sessions
- handoff detection can still happen safely after the full assistant response is assembled

Handoff detection rule:

- stream tokens to the console as they arrive
- buffer the full assistant response internally
- only parse the `handoff` block after the provider signals message completion

The runtime should not inspect partial output and should not route on incomplete content.

### Error handling model

The LLM Gateway should normalize provider outcomes into four classes:

| Error class | Runtime behavior |
|---|---|
| Authentication / configuration error | Fail immediately; mark flow `failed`; operator action required |
| Rate limit / transient network error | Retry with bounded exponential backoff; if exhausted, mark `awaiting_retry` |
| Provider response malformed | Fail the current turn; preserve transcript; mark `failed` |
| Handoff parse failure after valid provider response | Do not retry provider automatically; mark `failed` because the model output violated the required contract |

Two additional rules are required:

- tool-trigger failures are orchestration failures, not provider failures
- a successful provider response without a handoff block at a terminal node is valid; a successful provider response without a handoff block at a non-terminal node is a contract failure

### Session continuity under a stateless provider call model

The runtime should assume local responsibility for conversation continuity:

- the provider receives the assembled message history for the active logical session
- the Session Store is the source of truth for transcript continuity
- `resume` reuses prior history
- `start_new` starts a fresh history for that role session

This keeps the session model stable even if provider-side conversation primitives change later.

---

## 4. Interface Design

### Interface choice

The MVP should expose a **terminal-native CLI**, not a plugin and not a web UI.

This fits the current operator environment, keeps implementation surface small, and still satisfies the architectural requirement that the runtime provide its own interface.

### Required commands

The Operator Interface should expose three commands:

- **`start-flow`**: create a new `FlowRun` and begin orchestration
- **`resume-flow`**: resume a paused or retryable `FlowRun`
- **`flow-status`**: inspect current node, role sessions, last tool trigger, and failure/pause reason

No additional UI is required for MVP.

### Operator experience

`start-flow` should:

- validate the supplied workflow document
- create persistent flow state
- begin the first role turn immediately
- stream model output to the console
- print each automatic tool trigger as a structured runtime event
- stop only on terminal completion or explicit pause/failure conditions

`resume-flow` should:

- load the persisted `FlowRun`
- display why the flow paused
- continue from the last durable checkpoint

### Input contract

The CLI should accept repo-relative flow artifacts and workflow-document paths, but framework-owned stable paths used inside the runtime must be resolved from the appropriate index rather than hardcoded string literals in orchestration logic.

Framework-path rule for implementation:

- stable A-Society framework references should live behind named constants or registry entries tied to index variables
- record-folder artifacts remain repo-relative runtime inputs because they are flow-instance artifacts, not globally indexed framework files

### Human-collaborative pause handling

If the validated workflow node contains `human-collaborative` metadata, the runtime must pause before running the model turn and mark the flow `awaiting_human`. The operator supplies the human input through `resume-flow`.

This is the MVP-safe behavior. The runtime should not fabricate human input and should not bypass a declared collaborative step.

---

## 5. Relationship to Existing Tooling Components

The runtime should **invoke tooling modules directly in-process**, not via subprocess shell commands. The runtime is coordinating deterministic utilities inside the same TypeScript/Node.js environment. Direct invocation gives typed interfaces, consistent error handling, and simpler state recording.

The runtime does not replace the tooling layer. It decides **when** tooling should fire. The tooling layer still decides **how** each deterministic operation is performed.

### Component-by-component relationship

| Tooling component | Runtime relationship in MVP | Trigger model |
|---|---|---|
| **Component 1 - Scaffolding System** | Automatically invoked during runtime-managed initialization once the manifest and target root are known | Automatic for supported initialization flows |
| **Component 2 - Consent Utility** | Not a standalone runtime trigger in MVP except where already called by Component 1; direct consent-check automation before feedback-writing flows is deferred | Indirect in MVP via Component 1 |
| **Component 3 - Workflow Graph Schema Validator** | Invoked at `start-flow` against the supplied workflow document before orchestration begins | Automatic |
| **Component 4 - Backward Pass Orderer** | Invoked automatically at forward-pass closure to compute backward-pass traversal from the record-folder `workflow.md` | Automatic |
| **Component 5 - Path Validator** | Not on the orchestration hot path; remains an agent-invoked or maintenance-time utility | Remains agent-invoked |
| **Component 6 - Version Comparator** | Out of runtime MVP scope; migration discovery remains agent-driven | Remains agent-invoked |
| **Component 7 - Plan Artifact Validator** | Invoked automatically when a plan artifact is produced in a runtime-managed flow before the flow proceeds past the plan gate | Automatic |

### Trigger rules that are binding for MVP

- **Workflow load trigger:** `start-flow` must run Component 3 before the first role turn
- **Plan gate trigger:** when the active artifact is `01-owner-workflow-plan.md`, run Component 7 before allowing the next step
- **Forward-pass closure trigger:** when the flow reaches its terminal forward-pass node, run Component 4 before marking forward pass complete
- **Initialization trigger:** when the runtime manages an Initializer scaffolding step, run Component 1 rather than asking the agent to invoke scaffolding manually

### Invocation-gap consultation

I consulted `$A_SOCIETY_TOOLING_COUPLING_MAP` as required.

Result:

- no open invocation gaps currently exist for Components 1 through 7
- the runtime's automatic use of Components 1, 3, 4, and 7 does **not** remove the need for existing agent-invocation guidance in `general/`

Why:

- runtime orchestration is a separate execution mode
- outside the runtime, agents still need the documented invocation references
- therefore no coupling-map change is required as part of this Phase 0 design alone

---

## 6. MVP Scope Boundary

### In scope

- local TypeScript/Node.js runtime in `runtime/`
- Anthropic-only provider integration behind a narrow adapter
- terminal-native CLI interface (`start-flow`, `resume-flow`, `flow-status`)
- durable file-backed session state
- automatic context injection for **runtime-supported roles**
- automated forward-pass orchestration for workflows with **at most one outgoing edge per node**
- automatic use of Components 1, 3, 4, and 7 at declared trigger points
- indirect use of Component 2 through Component 1
- pause/resume handling for `human-collaborative` workflow nodes

### Explicitly deferred

- provider-agnostic implementation
- web UI
- distributed runtime service or multi-operator concurrency
- database-backed persistence
- automatic orchestration of branching or parallel forward-pass paths
- graph-level execution for workflows with more than one outgoing edge from a node
- automatic enforcement of migration/version workflows via Component 6
- maintenance-time path-audit automation via Component 5
- direct runtime automation of feedback-writing flows that require standalone consent checks
- runtime parsing of role-doc prose to discover context loading dynamically

### Scope note on supported roles and projects

The MVP should support the roles whose context sets are explicitly registered in `roleContextRegistry`. Expanding to more roles or more project types is a later runtime increment, not a Phase 0 blocker.

This is the necessary tightening move for the first version. The runtime proves the orchestration model first; it does not attempt universal role discovery on day one.

### Scope note on behavioral guidance

The runtime architecture assumes process choreography moves out of agent prose and into the runtime. However, **trimming existing role documents is not a Phase 0 prerequisite**. The runtime can ship against current documents first; document-trimming is a follow-on Curator/Owner maintenance flow once the runtime path is real.

---

## Owner Review Focus

The Owner should review this design against five questions:

1. Is Anthropic-only MVP scope the right tradeoff, given the explicit provider-adapter boundary for later expansion?
2. Is file-backed runtime state in `runtime/` the right first persistence model?
3. Is the linear-workflow boundary acceptable for MVP, given the current single-receiver handoff schema?
4. Is the explicit `workflow_document_path` startup input acceptable, rather than introducing a new record-folder linkage artifact now?
5. Should the runtime layer gain a formal dependency map for its `a-docs/` co-maintenance obligations in a later flow?

---

## Approval Condition

If approved, this document becomes the binding architecture specification for Runtime Developer implementation work in this flow. No Runtime Developer session should open until the Owner issues explicit approval.

---

## Handoff

Artifact ready for Owner review:

`a-society/a-docs/records/20260327-runtime-orchestrator-mvp/03-ta-to-owner.md`

What the Owner needs to evaluate:

- confirm the six architecture dimensions are complete and consistent with `$A_SOCIETY_VISION` and `$A_SOCIETY_ARCHITECTURE`
- confirm the tooling relationship is compatible with Components 1 through 7
- approve or revise the MVP boundary, especially the single-provider and linear-workflow constraints

Open questions requiring Owner resolution before implementation:

- whether the runtime layer should later gain its own formal `a-docs/` dependency map
- whether explicit workflow-document input at `start-flow` is acceptable for MVP, or whether the Owner wants a follow-on design to establish a stable artifact linkage
