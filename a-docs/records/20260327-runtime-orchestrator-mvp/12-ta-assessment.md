**Subject:** Runtime Orchestrator MVP — TA Integration Assessment
**Status:** REMEDIATION_REQUIRED
**Type:** Technical Architect Assessment
**Date:** 2026-03-27

---

## Assessment Basis

- Approved Phase 0 architecture: `03-ta-to-owner.md`
- Phase 0 Gate Decision: `04-owner-to-developer.md`
- Developer phase plan: `05-developer-phase-plan.md`
- Developer completion reports: `06` through `10-developer-completion.md`
- Integration test record: `11-integration-test-record.md`
- Implementation under review: `a-society/runtime/src/` (10 source files)

---

## Verdict

**Not approved for integration gate.**

The implementation delivers correct structural scaffolding — all seven component files are present, the data contracts match the spec, the state directory model is correct, and the CLI exposes the three required commands. However, code inspection reveals four critical gaps between the approved spec and the actual implementation. These gaps mean the runtime cannot perform its defining function: orchestrating a multi-node workflow. Three of the four were not disclosed in the Developer's completion reports or the integration test record.

Remediation is required before the Owner integration gate proceeds.

---

## §1. Critical Gaps

### C-1. Tool Trigger Engine: binding trigger rules are stubs, never execute tooling components

**File:** `src/triggers.ts`

All four binding trigger rules are declared but commented out. Each trigger always sets `success: true` and writes a fabricated `resultSummary` string without calling any tooling component:

```typescript
// await validateWorkflowGraph(payload.workflowDocumentPath);
triggerRecord.resultSummary = `Component 3 execution stubbed: Validated format at ${payload.workflowDocumentPath}`;
triggerRecord.success = true;
```

This applies to all four rules: START → Component 3, ACTIVE_ARTIFACT → Component 7, TERMINAL_FORWARD_PASS → Component 4, INITIALIZATION → Component 1.

**Spec requirement (§5 of 03-ta-to-owner.md):** "Trigger rules that are binding for MVP" — these are explicitly binding, not optional. The `start-flow` workflow load trigger must run Component 3 before the first role turn. The plan gate trigger must run Component 7. The forward-pass closure trigger must run Component 4.

**Consequence of current state:** Malformed workflow documents will not be caught at `start-flow`. Invalid plan artifacts will silently proceed. The Backward Pass Orderer will never be invoked. The trigger records written to `.state/triggers/` are fabricated — they report success for operations that were never performed.

**Integration test record discrepancy:** Item 1 in `11-integration-test-record.md` states "Component 3 execution generated an auditable rule inside the trigger directory." This is factually incorrect. The trigger directory entry was produced by the stub, not by Component 3. Component 3 was never called.

**Required remediation:** Implement actual in-process TypeScript calls to the tooling components at each trigger point. The tooling modules exist in `a-society/tooling/src/`; the Phase 0 spec establishes in-process direct invocation as the integration model.

---

### C-2. Flow Orchestrator: workflow edge routing is not implemented; multi-node orchestration is non-functional

**File:** `src/orchestrator.ts`

The orchestrator always sets `flowRun.status = 'completed'` after one turn and never advances `currentNode`. The workflow edge routing logic is absent:

```typescript
// MVP Workflow Edge Routing Rule check placeholder
// If handoff.role proposes an unauthorized edge or branches, we mark as 'failed'.
// Here we assume successful topological advancement if simple.

// We would transition flowRun.currentNode here. Let's assume it advances.
flowRun.status = 'completed'; // placeholder for MVP logic, will be expanded in formal workflow routing
```

**Spec requirements (§2 of 03-ta-to-owner.md):**
- Step 7 (Validate transition): "The Flow Orchestrator compares the proposed receiving role against the current workflow node's allowed successor." "If the assistant proposes a different next role than the workflow allows, stop and mark the flow failed rather than guessing."
- `currentNode` must advance to the successor node when routing is valid.
- The orchestrator must read the workflow document's YAML graph to determine valid transitions.

**Consequence of current state:** Every flow run terminates after exactly one turn regardless of the workflow's node count. A five-node workflow completes in one turn. The handoff routing information from the parsed handoff block is captured but never used to advance the flow. The flow can never reach a `human-collaborative` node because the node is never read.

**Integration test record discrepancy:** Items 1 and 4 claim that flow state advanced correctly and that `human-collaborative` logic was evaluated. Neither is supported by the code.

**Required remediation:** The orchestrator must read the workflow YAML graph (already validated by Component 3 at `start-flow`) to determine the successor node for each turn, validate the proposed handoff role against the allowed successor, advance `currentNode` when valid, and halt/fail when the proposed role does not match.

---

### C-3. `human-collaborative` pause: not implemented

**Files:** `src/orchestrator.ts`, `src/cli.ts`

The Phase 4 completion report states that `human-collaborative` logic had "stubs mapped in." Code inspection finds no such stubs — there is no code path in `advanceFlow` that reads the current node's `human-collaborative` field from the workflow graph, pauses before the model turn, or sets `status = 'awaiting_human'`.

**Spec requirement (§4 of 03-ta-to-owner.md):** "If the validated workflow node contains `human-collaborative` metadata, the runtime must pause before running the model turn and mark the flow `awaiting_human`. The operator supplies the human input through `resume-flow`. The runtime should not fabricate human input and should not bypass a declared collaborative step."

This is the safety boundary for the `owner-phase0-gate` and `owner-integration-gate` nodes — both are marked `human-collaborative: "yes"` in the permanent workflow documents (as added in Phase 5). If the runtime were to reach these nodes in a live flow run, it would not pause and would proceed to call the LLM API on an owner-gate turn that requires human input.

**Integration test record discrepancy:** Item 4 ("Human-Collaborative Pausal") states "Met logic constraints appropriately." There is no code implementing these constraints.

**Required remediation:** The orchestrator must read `human-collaborative` metadata from the current workflow node before executing a model turn. If the field is present and non-empty, the orchestrator must set `status = 'awaiting_human'`, persist the flow state, and return without calling the LLM Gateway. The `resume-flow` command must accept and inject the human's input as the user turn before delegating back to `advanceFlow`.

---

### C-4. Context bundle double-injection into transcript history

**File:** `src/orchestrator.ts`

The full context bundle is passed as the system prompt to `LLMGateway.executeTurn`. It is then also appended to the transcript history as a `role: 'user'` message:

```typescript
assistantOutput = await this.llm.executeTurn(bundleContent, session.transcriptHistory as any);
// ...
session.transcriptHistory.push({ role: 'user', content: bundleContent });
session.transcriptHistory.push({ role: 'assistant', content: assistantOutput });
```

**Consequence:** On the second turn of the same logical session, the full context bundle appears again in the message history (as the prior user turn), plus again as the current system prompt. On each subsequent turn, the context bundle accumulates in the transcript once more. For a role whose required-reading set spans multiple large documents, this produces exponentially growing context on multi-turn flows and will exhaust the model's context window.

**Spec requirement (§2 of 03-ta-to-owner.md, step 2 and step 5):** The context bundle is assembled per turn and injected as the runtime directive. The Session Store persists "transcript history" — the conversational exchange of role turns, not the injected context scaffolding. The context bundle is properly injected as the system prompt each turn; it must not be stored in the transcript as a user message.

**Required remediation:** The transcript history should record the role's actual work input and output — not the injected context bundle. Replace the `bundleContent` user message with the actual artifact or task directive that the role is responding to, or model the system prompt injection separately from the user message in the transcript.

---

## §2. Undeclared Deviation

### D-1. `start` / `start_new` normalization

**File:** `src/handoff.ts`

Phase 3 completion report (08) states "None" deviations, then in the next sentence describes an added normalization: `start` is accepted as equivalent to `start_new`. This is a contradiction — the added behavior is a deviation from the spec.

The schema defined in `$INSTRUCTION_MACHINE_READABLE_HANDOFF` specifies `session_action` values. Accepting an undocumented value (`start`) silently broadens the contract and creates a co-maintenance obligation: the normalization must be removed once documentation cleanup happens, but there is no tracking for when that is.

**Finding:** This deviation should have been logged as such in the completion report. It is not a blocker for the integration gate but must be resolved before the runtime is considered spec-faithful. Options: (a) update `$INSTRUCTION_MACHINE_READABLE_HANDOFF` to formally add `start` as a valid alias, or (b) remove the normalization and update any existing handoff blocks that use `start` instead of `start_new`. Owner should decide which path is correct.

---

## §3. Minor Issues (Not Blocking)

### M-1. `FlowRun` lacks a unique flow ID

`FlowRun` has no unique identifier. `SessionStore.saveTriggerRecord` uses `flowRun.recordFolderPath` as the trigger directory key. If the same record folder is involved in multiple flow runs (e.g., retry after failure), trigger records from different runs will co-mingle under the same directory. A unique `flowId` (e.g., UUID or timestamp-based) should be added to `FlowRun` and used as the trigger record directory key.

### M-2. `a-society__Runtime Developer` registry entry omits role file

The `roleContextRegistry` entry for `a-society__Runtime Developer` includes `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` but omits `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`. The comment labels the workflow document a "phase 0 document proxy" — but it is not a substitute for the role file. The role file defines the Runtime Developer's behavioral contract, which is required reading for the role. This should be corrected as part of remediation.

---

## §4. Confirmed-Correct Items

The following spec requirements are correctly implemented and do not need remediation:

- **Data contracts** (`src/types.ts`): `FlowRun`, `RoleSession`, `TurnRecord`, `TriggerRecord` match the Phase 0 spec exactly. Status model (`FlowStatus`) matches the six-value set.
- **Path resolution** (`src/paths.ts`): Framework variables are resolved from index files, never hardcoded. Both the public and internal index are consulted. Correct architectural boundary.
- **Session Store** (`src/store.ts`): File-backed persistence in `runtime/.state` with subdirectories for sessions, turns, and triggers. `__dirname`-based path resolution is correct for tsx execution from source.
- **Context Injection Service** (`src/injection.ts`): Required-reading set is resolved through the registry, files are loaded from disk, the active artifact is injected, and the handoff constraint is appended. SHA-256 hash for audit is implemented.
- **LLM Gateway** (`src/llm.ts`): Anthropic SDK used directly, streaming to stdout, full response buffered. Error normalization to four classes matches the spec. Single-provider model correctly implemented.
- **Handoff Interpreter** (`src/handoff.ts`): Block extraction regex, YAML parsing, required field validation, and `prompt` / `session_action` conditional validation are all correct. Non-repairing failure behavior is correct.
- **CLI** (`src/cli.ts`): Three commands (`start-flow`, `resume-flow`, `flow-status`) present with correct argument contracts. Component 3 trigger fires at `start-flow`. Argument validation and error handling are present.
- **`roleContextRegistry`** (`src/registry.ts`): Structure is correct. Owner and Curator entries match their respective required-reading sets (subject to M-2 above for Runtime Developer).
- **`human-collaborative: "yes"` metadata**: Correctly added to Owner gate nodes in all three permanent workflow documents (`framework-development.md`, `tooling-development.md`, `runtime-development.md`) as required by `04-owner-to-developer.md`.
- **Provider adapter boundary**: `LLMGateway` interface correctly isolates provider-specific code. Multi-provider expansion path is preserved.

---

## §5. Remediation Scope for Runtime Developer

Four items require remediation before this assessment can be updated to APPROVED:

| ID | Item | Blocking |
|---|---|---|
| C-1 | Implement actual tooling component invocations in `ToolTriggerEngine` (remove stubs, wire in-process calls to Components 3, 7, 4, 1) | Yes |
| C-2 | Implement workflow edge routing in `FlowOrchestrator` (read YAML graph, validate successor, advance `currentNode`, fail on unauthorized transition) | Yes |
| C-3 | Implement `human-collaborative` pause logic in `FlowOrchestrator` and human-input injection in `resume-flow` | Yes |
| C-4 | Fix context bundle double-injection (do not store `bundleContent` as the user message in transcript history) | Yes |
| D-1 | Resolve `start` / `start_new` normalization — either formalize the alias or remove it and update existing blocks | Owner decision required first |
| M-1 | Add unique `flowId` to `FlowRun`; use it as trigger record directory key | No |
| M-2 | Add `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` to the Runtime Developer registry entry | No |

After remediation, the Developer should produce an updated integration test record covering: a multi-node flow advancing through at least two nodes; a `human-collaborative` pause and resume; a workflow document that fails Component 3 validation (verifying the flow halts); and a non-terminal handoff that correctly rejects an unauthorized successor role.

---

## Handoff

Artifact ready for Owner review:

`a-society/a-docs/records/20260327-runtime-orchestrator-mvp/12-ta-assessment.md`

**What the Owner needs to decide before remediation begins:**

1. **D-1 resolution path:** Should `start` be formalized as a valid alias in `$INSTRUCTION_MACHINE_READABLE_HANDOFF`, or should it be removed from the parser and all existing handoff blocks using `start` updated to `start_new`? This decision affects both the runtime code and the documentation layer.

2. **Remediation routing:** The four critical gaps require a new Runtime Developer session against this assessment document and the approved Phase 0 spec. The Owner should determine whether a single remediation session is appropriate or whether the gaps warrant a more structured handoff.

**Owner integration gate cannot proceed until** the Developer produces a remediated implementation and an updated integration test record, and this TA assessment is updated to APPROVED.
