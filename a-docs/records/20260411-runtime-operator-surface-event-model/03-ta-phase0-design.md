**Subject:** Runtime Operator Surface Event Model - TA Phase 0 Design Advisory
**Type:** Technical Architect -> Owner
**Date:** 2026-04-11
**Flow:** `20260411-runtime-operator-surface-event-model`

---

## Open Question Resolutions

Six open questions were called out in the brief. They are resolved here because the rest of the design depends on them.

**Q1 - Rendering boundary?**
**Resolution:** Live runtime/system notices render on `stderr`; assistant/model text remains on the existing assistant output stream (`stdout` in normal CLI use); `a-society flow-status` remains a snapshot command on `stdout`.

This is the smallest boundary that keeps runtime/system output visibly distinct from model text without inventing a second operator surface. It also matches the current direction of existing fragments: spinner/tool/token output already tends toward `stderr`, while assistant text streams to `stdout`.

**Q2 - Smallest event taxonomy that still makes the runtime legible?**
**Resolution:** Eight operator-visible classes:

- `flow`
- `role`
- `activity`
- `handoff`
- `repair`
- `human`
- `parallel`
- `usage`

This is small enough to stop ad hoc `console.log` growth, but explicit enough to cover repairs, transitions, suspension, and parallel state.

**Q3 - Successful handoff and active-role activation: one event or two?**
**Resolution:** Separate semantic events, one combined rendered notice in the common linear case.

The runtime must preserve the distinction because a handoff may succeed while one or more successor nodes are join-blocked. The operator should still see one compact line for a simple linear transition, but the internal model cannot collapse "handoff accepted" and "successor activated" into the same state change.

**Q4 - How much parallel visibility belongs live versus only in `flow-status`?**
**Resolution:** `flow-status` is the authoritative parallel-state snapshot. Live execution emits transition notices at fork and join boundaries only.

The current terminal surface is good at announcing state transitions; it is not good at multiplexing two concurrent assistant streams in one readable pane. Phase 1 therefore surfaces fork activation and join waiting inline, and relies on `flow-status` for the full active-node view.

**Q5 - Exact fallback when token usage is unavailable?**
**Resolution:** Make unavailability explicit, never implicit. Approved render strings:

- `Tokens: <input> in, <output> out`
- `Tokens: input unavailable, <output> out`
- `Tokens: <input> in, output unavailable`
- `Tokens unavailable (provider did not report usage)`

Unknown is not zero. The operator must be able to distinguish "provider omitted usage" from "usage was zero."

**Q6 - When does future parallel-track output exceed the current terminal surface and justify a richer follow-on operator surface?**
**Resolution:** When the runtime needs to present more than one concurrently streaming assistant output in real time, or maintain persistent per-track panes, the current terminal surface is no longer enough.

That threshold is not crossed by this flow. Phase 1 stays inside the current terminal experience and does not introduce a richer surface.

---

## Coupling-Map Consultation

`$A_SOCIETY_EXECUTABLE_COUPLING_MAP` was consulted before completing this advisory.

Relevant existing rows already exist:

- `$INSTRUCTION_MACHINE_READABLE_HANDOFF` -> Runtime handoff interpretation
- Workflow graph YAML / record-folder `workflow.md` schema -> Workflow graph validation
- `$A_SOCIETY_RUNTIME_INVOCATION` -> Operator-facing executable behavior

This advisory changes standing executable behavior, so it is a Type C change, and it also tightens Type F co-maintenance around handoff/schema repair surfacing. No new coupling-map row is required. The standing obligation is unchanged but becomes stricter in implementation: the handoff interpreter, workflow validator guidance, and `$A_SOCIETY_RUNTIME_INVOCATION` must move together.

---

## §1 - Operator Goals and Success Criteria

"A first-class operator surface" for this runtime means the operator no longer infers state from silence or scattered implementation details. The runtime states, in a declared and bounded way, what it is doing, what just changed, and when intervention is required.

After this flow, the operator must be able to tell, during a normal `run`, all of the following without inspecting source or state files:

1. which node and role are active now
2. whether the runtime is waiting for first token, streaming assistant text, repairing, retrying, awaiting human input, or closing the forward pass
3. when a handoff succeeded
4. whether a successor node activated immediately or is waiting on a join
5. whether token usage is available, partial, or unavailable
6. when the runtime has transitioned into the improvement path

Minimum success criteria for live execution:

- Every operator-visible runtime notice belongs to an approved event kind from §2.
- Every live runtime/system notice renders through one owner: the operator renderer.
- During live execution, assistant/model text and runtime/system notices are visibly distinct by channel and by prefix.
- Every repair loop emits exactly two outputs: one short operator-visible reason and one model-facing corrective prompt derived from the owning validator/interpreter.
- Successful transitions are surfaced positively; the operator does not need to infer success from the absence of errors.

Minimum success criteria for `flow-status`:

- `flow-status` remains a stdout-only snapshot command.
- It is the authoritative view of active nodes and pending joins.
- It uses the same vocabulary as the live operator surface: `Active nodes`, `Completed nodes`, `Pending joins`, `awaiting_human`.
- It does not attempt to replay per-turn noise such as tool calls, token summaries, or repair prompts.

Phase-1 presentation boundary:

- The current terminal experience is the only approved operator surface for this flow.
- No additional TUI, dashboard, log file, or persistent sidecar surface is added in Phase 1.
- No new env vars or CLI flags are required for the event model itself.

---

## §2 - Event Taxonomy and Rendering Model

### Approved operator-visible event taxonomy

The runtime's operator-visible contract is the following event set. No other ad hoc live notice classes are approved for Phase 1.

| Event kind | Required fields | Live render | `flow-status` | Channel | Approved render template |
|---|---|---|---|---|---|
| `flow.bootstrap_started` | `role` | Yes | No | `stderr` | `[runtime/flow] Bootstrapping from interactive <role> session` |
| `flow.resumed` | `flowId`, `activeNodeCount` | Yes | No | `stderr` | `[runtime/flow] Resuming flow <flowId> with <n> active node(s)` |
| `role.active` | `nodeId`, `role`, `artifactCount`, `artifactBasename?` | Yes | Reflected by `Active nodes` | `stderr` | `[runtime/role] Active: <nodeId> (<role>)` plus ` - artifact: <basename>` when exactly one artifact exists, or ` - inputs: <n> artifacts` when more than one exists |
| `activity.waiting_for_first_token` | `provider`, `model` | Yes | No | `stderr` | TTY: spinner labeled `[runtime/wait] Waiting for first token from <provider>/<model>`; non-TTY: one line with the same text |
| `activity.tool_call` | `toolName`, `path?` | Yes | No | `stderr` | `[runtime/tool] <toolName>` plus ` <path>` when the tool input includes `path` |
| `handoff.applied` | `fromNodeId`, `fromRole`, `targets[]` | Yes | Reflected indirectly by `Active nodes` / `Pending joins` | `stderr` | Linear case: `[runtime/handoff] <fromNodeId> (<fromRole>) -> <toNodeId> (<toRole>)` plus ` - artifact: <basename>` when present. Fork case: `[runtime/handoff] <fromNodeId> (<fromRole>) forked to <nodeA> (<roleA>), <nodeB> (<roleB>)` |
| `repair.requested` | `scope`, `code`, `summary` | Yes | No | `stderr` | `[runtime/repair] <summary>; retrying current node` |
| `human.awaiting_input` | `reason`, `mode` | Yes | Reflected by `Status: awaiting_human` | `stderr` | `prompt-human`: `[runtime/human] Waiting for operator input`; interactive abort: `[runtime/human] Turn aborted by operator; waiting for revised input`; autonomous abort or null-return suspension: `[runtime/human] Flow suspended; waiting for later operator input` |
| `human.resumed` | `nodeId`, `role` | Yes | No | `stderr` | `[runtime/human] Operator input received; resuming <nodeId> (<role>)` |
| `parallel.active_set` | `activeNodes[]` | Yes, at fork/resume boundaries only | Reflected by `Active nodes` | `stderr` | `[runtime/parallel] Active nodes: <node1> (<role1>), <node2> (<role2>)` |
| `parallel.join_waiting` | `nodeId`, `role`, `waitingFor[]` | Yes | Yes | `stderr` live, `stdout` snapshot | `[runtime/parallel] Join pending: <nodeId> (<role>) waiting for <pred1>, <pred2>` |
| `usage.turn_summary` | `availability`, `inputTokens?`, `outputTokens?` | Yes | No | `stderr` | One of the four exact strings from Open Question 5 |
| `flow.forward_pass_closed` | `recordFolderPath`, `artifactBasename` | Yes | No | `stderr` | `[runtime/flow] Forward pass closed via <artifact>; starting improvement phase` |
| `flow.completed` | none | Yes | Reflected by `Status: completed` | `stderr` | `[runtime/flow] Orchestration complete` |

### Rendering boundary and ownership

The render boundary is strict:

- Live operator/runtime notices render on `stderr`.
- Assistant/model text remains on the assistant output stream (`stdout` in the normal CLI path).
- `flow-status` remains a snapshot command on `stdout`.

The ownership boundary is also strict:

- `OperatorEventRenderer` owns all live runtime/system rendering.
- Providers do not instantiate spinners.
- Providers, `llm.ts`, `orient.ts`, and `orchestrator.ts` do not write new live operator notices directly with `console.log`, `console.warn`, `console.error`, or raw `process.stderr.write`.
- Fatal CLI usage errors before orchestration starts may remain direct CLI errors; once a live run begins, operator notices go through the renderer.

### Newline and separation rules

These rules are part of the approved surface, not implementation trivia:

1. Every rendered live notice is newline-terminated.
2. The wait spinner clears before any non-wait runtime notice renders.
3. The wait spinner clears on the first text token or on the first tool-call block, whichever comes first.
4. No live runtime notice other than the wait-state may render while assistant text is actively streaming mid-response.
5. `flow-status` uses no ANSI behavior and no spinner.

### `flow-status` contract

`flow-status` remains the authoritative parallel-state snapshot. It must render these sections in workflow order:

- `Record Folder`
- `Status`
- `Active nodes`
- `Completed nodes`
- `Pending joins` when any join is waiting

Additional rule:

- When `flowRun.status === 'awaiting_human'`, `flow-status` must make the suspended state explicit. The minimum acceptable representation is `Status: awaiting_human`; adding a one-line `Suspended: waiting for operator input` note is approved and preferred.

What `flow-status` does not show in Phase 1:

- tool-call history
- token counts
- repair prompts
- wait/spinner state

---

## §3 - Repair and Validator Contract

This flow absorbs the schema/repair-alignment item. The implementation must therefore remove duplicated, stale repair text and replace it with validator-owned guidance.

### Ownership boundary

There is not one shared cross-domain repair-text file. There are two canonical owners, one per contract:

- `a-society/runtime/src/handoff.ts` owns the handoff contract and all handoff repair wording.
- `a-society/runtime/src/framework-services/workflow-graph-validator.ts` owns the `workflow.md` contract and all workflow repair wording.

`orchestrator.ts` owns retry behavior and operator-event emission, but it does not own schema wording.

### Handoff repair contract

`HandoffInterpreter.parse()` must continue to return a valid `HandoffResult` on success, but parse failure must become typed and structured rather than freeform.

Approved failure shape:

```typescript
type HandoffRepairCode =
  | 'missing_block'
  | 'yaml_parse'
  | 'invalid_target_shape'
  | 'missing_required_field'
  | 'unknown_signal_type';

interface HandoffRepairDetails {
  code: HandoffRepairCode;
  operatorSummary: string;
  modelRepairMessage: string;
}
```

`HandoffParseError` must carry `HandoffRepairDetails`.

Required distinction:

- malformed handoff block -> operator summary such as `Malformed handoff block`
- unsupported typed signal -> operator summary such as `Unsupported handoff signal type "<type>"`

Those are not the same operator event and they do not share the same model-facing repair text.

### Workflow repair contract

`workflow-graph-validator.ts` must export shared schema constants and a repair-guidance helper derived from those constants. The current stale `description` example in `orchestrator.ts` is explicitly disallowed after this flow.

Approved schema ownership:

- node keys: `id`, `role`, `human-collaborative`
- edge keys: `from`, `to`, `artifact`
- no `description` field in the runtime-owned workflow schema example

Approved helper shape:

```typescript
interface WorkflowRepairGuidance {
  operatorSummary: string;
  modelRepairMessage: string;
}
```

The helper may accept either a validation-result object or the validator's error list, but the owning module must generate both messages.

The START-trigger path must preserve those details. `ToolTriggerEngine` must not flatten workflow validation failure into a generic string before the orchestrator can render the approved operator summary and inject the approved model-facing repair text.

### Operator-visible versus model-facing output

The runtime must split repair output into two layers:

1. Operator-visible summary
2. Model-facing corrective prompt

Rules:

- The operator sees one short reason line through `repair.requested`.
- The model receives the full corrective prompt injected into session history.
- The operator does not see the full corrective prompt dumped verbatim.
- The runtime does not invent examples outside the owning validator/interpreter.

### Required failure distinctions

The following distinctions are load-bearing and must survive implementation:

| Failure class | Operator summary class | Model-facing repair owner |
|---|---|---|
| Missing or malformed handoff block | `repair.requested` with handoff-specific summary | `handoff.ts` |
| Unsupported typed signal | `repair.requested` with unsupported-signal summary | `handoff.ts` |
| Missing handoff fields | `repair.requested` with field-specific summary | `handoff.ts` |
| Missing workflow frontmatter or YAML parse failure | `repair.requested` with workflow-parse summary | `workflow-graph-validator.ts` |
| Workflow schema invalid | `repair.requested` with workflow-schema summary | `workflow-graph-validator.ts` |

---

## §4 - Parallel-Track Visibility Model

The current runtime can represent parallel state, but it cannot yet present two concurrently streaming assistant outputs in one clean live terminal surface. That is the key failure point.

Current constraint:

- one assistant-text stream
- one runtime/system stream
- one prompt/input loop

Because of that, Phase 1 does not attempt per-track live multiplexing. It surfaces state transitions and leaves the standing snapshot to `flow-status`.

### Approved Phase-1 parallel-state contract

When a fork activates multiple successor nodes:

- the runtime emits `handoff.applied`
- the runtime emits `parallel.active_set`
- `flow-status` lists all active nodes in workflow order

When a successor cannot activate because a join is incomplete:

- the runtime emits `parallel.join_waiting`
- `flow-status` lists the same node under `Pending joins`

How queued or deferred work is represented:

- ready-but-not-currently-executing nodes remain part of `Active nodes`
- join-blocked successors are not listed as active; they are represented as join-pending
- there is no additional "deferred nodes" section in Phase 1

This is deliberate. The smallest readable contract is:

- live notices at state-change boundaries
- snapshot command for full parallel state

### Authoritative parallel view

`a-society flow-status` is the authoritative operator view for:

- how many nodes are active
- which nodes are active
- which nodes are complete
- which joins are waiting and on whom

Live execution must not try to maintain a constantly updating parallel dashboard inline.

### Explicitly deferred

The following are not part of this flow:

- simultaneous live streaming panes for multiple active nodes
- persistent track-specific log panes
- a richer operator UI beyond the current terminal experience

Those become appropriate only when the runtime is truly executing and presenting more than one live assistant stream at once.

---

## §5 - Token, Liveness, and Tool Activity Model

The current fragmented surfaces must become one contract with one renderer owner.

### Ownership boundary

- Providers own provider facts: request started, first output observed, provider/model identity, returned usage values.
- `LLMGateway` owns tool-call activity and turn-level usage accumulation across tool rounds.
- `orient.ts` owns per-turn human-facing usage summary and suspension/resume notices because it knows the turn outcome and interactive/autonomous mode.
- `orchestrator.ts` owns flow lifecycle, handoff, repair-loop, and parallel-state notices.
- `OperatorEventRenderer` owns all actual live rendering.

### Interface threading

To make that ownership real, the event/render sink must be threaded explicitly.

Approved additions:

```typescript
export interface OperatorRenderSink {
  emit(event: OperatorEvent): void;
  startWait(provider: string, model: string): void;
  stopWait(): void;
}
```

Approved threading path:

1. `orchestrator.ts` obtains an `OperatorRenderSink` implementation from the new renderer module.
2. `runInteractiveSession()` accepts an optional `operatorRenderer?: OperatorRenderSink`.
3. `TurnOptions` gains `operatorRenderer?: OperatorRenderSink`.
4. `LLMGateway.executeTurn()` forwards `options.operatorRenderer` to the provider.
5. Providers call `startWait()` before the remote request and `stopWait()` on first output or termination.
6. `LLMGateway` emits `activity.tool_call` through `emit()`.
7. `orient.ts` emits `usage.turn_summary` and `human.*`.
8. `orchestrator.ts` emits `flow.*`, `role.active`, `handoff.applied`, `repair.requested`, and `parallel.*`.

### Liveness

Approved behavior:

- Wait state begins when a provider request starts.
- Wait state ends on the first text token or the first tool-call block.
- Wait state also ends on abort, error, or normal completion with no text.
- TTY gets a spinner.
- Non-TTY gets one static wait line.

This means the wait indicator is about "waiting for first output," not "assistant is currently thinking forever."

### Tool activity

Tool-call notices are live only.

Approved behavior:

- One line per tool call.
- Show the tool name.
- Show `path` only when present in the tool input.
- Do not dump arbitrary JSON arguments into the operator surface.

Approved template:

- `[runtime/tool] read_file path/to/file.md`
- `[runtime/tool] list_files`

### Token reporting

Token summary renders once per completed gateway turn, after usage has been accumulated across all provider/tool rounds in that turn.

This is load-bearing:

- the summary is for the whole turn, not an individual provider round
- missing usage is reported as unavailable, not zero
- both providers map into the same four-state string contract from Open Question 5

### Provider symmetry requirements

Both `anthropic.ts` and `openai-compatible.ts` must implement the same liveness contract:

- start wait before the request
- stop wait on first text or first tool-call block
- never own spinner rendering directly
- never write live operator notices directly

Assistant text streaming still comes from the provider code, but runtime/system notices do not.

---

## §6 - Files Changed

The following file actions are the approved Phase-1 implementation surface. `a-society/runtime/src/operator-renderer.ts` and `a-society/runtime/test/operator-renderer.test.ts` do not currently exist and are create actions.

| File | Action | Required implementation content |
|---|---|---|
| `a-society/runtime/src/types.ts` | modify | Add `OperatorEvent`, `OperatorRenderSink`, and any supporting payload types required by the approved event set in §2. Add `operatorRenderer?: OperatorRenderSink` to `TurnOptions`. Do not leave event names as freeform strings outside the type surface. |
| `a-society/runtime/src/operator-renderer.ts` | create | Add the single live-render owner. It must implement `OperatorRenderSink`, own the wait spinner lifecycle, render all live runtime/system notices to `stderr`, enforce the prefix contract from §2, and keep `stdout` untouched for assistant text. It must expose a reusable default renderer for the normal CLI path and allow test construction with an in-memory stream. |
| `a-society/runtime/src/spinner.ts` | modify | Convert the spinner into a renderer-owned utility. Remove the hardcoded dependence on providers and on the fixed `Thinking...` label. The renderer must be able to supply the exact wait label from §2 and clear the spinner before any non-wait notice. |
| `a-society/runtime/src/orchestrator.ts` | modify | Import the renderer and the validator-owned repair helpers. Replace direct lifecycle/status writes with `flow.*`, `role.active`, `handoff.applied`, `repair.requested`, `parallel.active_set`, `parallel.join_waiting`, and `flow.completed`. Remove the stale hardcoded workflow repair schema text and call the validator-owned workflow repair helper instead. For a linear transition, render one positive handoff line; for a fork, render the fork line plus the active-set line; for join-blocked successors, render the join-waiting line. `flow.completed` must no longer be a plain stdout `console.log`. |
| `a-society/runtime/src/orient.ts` | modify | Accept or obtain an `OperatorRenderSink`, pass it into `LLMGateway.executeTurn`, emit `usage.turn_summary` after each completed turn, and replace raw abort/suspension notices with the approved `human.awaiting_input` / `human.resumed` variants. Handoff success must not be announced here before orchestration actually applies the transition; `orchestrator.ts` remains the owner of final handoff-success notices. |
| `a-society/runtime/src/handoff.ts` | modify | Replace freeform parse failures with typed `HandoffRepairDetails` carried by `HandoffParseError`. Export the canonical handoff repair-message builder(s). Distinguish malformed handoffs from unsupported typed signals and missing required fields. No other file may hardcode handoff repair wording after this flow. |
| `a-society/runtime/src/framework-services/workflow-graph-validator.ts` | modify | Export shared workflow schema constants and a workflow-repair guidance helper that generates both operator summary and model-facing repair text. The helper must reflect the live schema exactly: node keys are `id`, `role`, `human-collaborative`; edge keys are `from`, `to`, `artifact`; no `description` field appears in runtime-owned examples. |
| `a-society/runtime/src/triggers.ts` | modify | Preserve structured workflow-validation failure details on the START path instead of collapsing them into one generic error string. The orchestrator must be able to recover validator-owned repair guidance without reparsing or guessing. |
| `a-society/runtime/src/llm.ts` | modify | Stop writing tool-call notices directly to `stderr`. Emit approved `activity.tool_call` events through `operatorRenderer.emit()`. Continue accumulating turn usage across tool rounds and return the full-turn usage summary to `orient.ts`. The gateway does not own final rendering of token summaries. |
| `a-society/runtime/src/providers/anthropic.ts` | modify | Remove direct spinner ownership. Call `operatorRenderer.startWait('anthropic', model)` before the request and `stopWait()` on first text token, first tool-use block, abort, or normal termination. Continue streaming assistant text only to the assistant output stream. Do not emit live runtime notices directly. |
| `a-society/runtime/src/providers/openai-compatible.ts` | modify | Same provider obligations as the Anthropic provider. Stop wait state on first text delta or first tool-call delta. Continue streaming assistant text only to the assistant output stream. Do not emit live runtime notices directly. |
| `a-society/runtime/src/visualization.ts` | modify | Keep `flow-status` as the authoritative parallel-state snapshot, aligned to the vocabulary from §2. Preserve workflow-order rendering, keep `Pending joins`, and make `awaiting_human` explicit in the snapshot. Do not add tool-call or token history to `flow-status`. |
| `a-society/runtime/INVOCATION.md` | modify | Document the approved live operator notice model: runtime/system notices on `stderr`, assistant text on `stdout`, exact token-unavailable strings, and the fact that `flow-status` is the authoritative parallel-state snapshot. Document that Phase 1 introduces no new flags or env vars for operator-event rendering. |
| `a-society/runtime/test/operator-renderer.test.ts` | create | Add renderer-level tests for the exact live line templates, wait-state clear behavior, and the four approved token-summary strings. At minimum verify that a wait state clears before a subsequent rendered notice. |
| `a-society/runtime/test/handoff.test.ts` | modify | Add tests for typed handoff repair details: malformed block, missing required field, and unsupported typed signal must produce distinct repair codes/summaries. |
| `a-society/runtime/test/framework-services/workflow-graph-validator.test.ts` | modify | Add tests that the workflow repair helper emits live-schema guidance and does not mention `description`. This is the explicit anti-drift test for the absorbed schema/repair-alignment scope. |
| `a-society/runtime/test/visualization.test.ts` | modify | Extend snapshot tests to cover multiple active nodes and explicit `awaiting_human` rendering while preserving the `Pending joins` section. |
| `a-society/runtime/test/integration/unified-routing.test.ts` | modify | Capture the operator stream separately from assistant output. Verify a successful handoff notice and next-role activation notice on the operator stream, plus the malformed-handoff repair summary before the retry succeeds. |

### Explicitly not required in Phase 1

No file in this advisory introduces:

- a new CLI flag
- a new env var
- a second operator surface beyond the terminal

`a-society/runtime/src/cli.ts` may remain unchanged unless the Developer chooses to thread an explicit operator stream from the CLI entrypoint. The approved design does not require a CLI-surface change.

---

## §7 - Verification and Test Boundary

Verification must assert rendered content and state semantics, not only command success.

### Automated validation expectations

The Orchestration Developer must add or extend automated tests so the following are explicitly checked:

1. **Successful handoff and next-role activation notice**
   - Assert the operator stream contains the approved positive handoff line.
   - Assert the operator stream contains the approved `role.active` line for the successor.
   - Assert assistant text remains on the assistant stream, not the operator stream.

2. **Malformed-handoff repair visibility**
   - Assert the operator stream contains one `repair.requested` summary line.
   - Assert session history contains the model-facing repair prompt from the handoff helper.
   - Assert the retry succeeds without inventing a second repair wording path.

3. **Prompt-human suspend/resume visibility**
   - Assert `prompt-human` causes the approved `human.awaiting_input` notice.
   - Assert a subsequent operator reply causes the approved `human.resumed` notice.

4. **Forward-pass closure notice**
   - Assert a `forward-pass-closed` handoff signal emits the approved `flow.forward_pass_closed` line before improvement orchestration begins.

5. **Token fallback / unavailable state**
   - Assert all four approved token-summary strings render correctly:
     - full usage available
     - input unavailable
     - output unavailable
     - both unavailable

6. **Parallel-state rendering**
   - Assert fork activation produces a `parallel.active_set` notice live.
   - Assert join-blocked successors produce `parallel.join_waiting` live.
   - Assert `flow-status` renders the same join-pending state in snapshot form.

### Test categories

The minimum acceptable test split is:

- renderer/unit tests for exact strings and wait-state transitions
- parser/validator unit tests for repair ownership and anti-drift
- integration test(s) that capture assistant and operator streams separately
- snapshot tests for `flow-status`

### What is not sufficient

The following are not sufficient verification on their own:

- "command exits successfully"
- "stderr contained something"
- "state file changed"

The gate is content-specific. The tests must prove the operator can actually see the approved contract.

---

## §8 - Operator Documentation Surface

After implementation, `$A_SOCIETY_RUNTIME_INVOCATION` must say the following in operator-facing terms:

1. During live `run`, runtime/system notices render on `stderr` and assistant/model text renders on `stdout`.
2. The operator should expect live notices in these classes:
   - flow lifecycle
   - role activation
   - wait/liveness
   - tool activity
   - handoff success
   - repair/retry
   - human-input suspension/resume
   - parallel-state transition notices
   - token summary / token unavailable
3. `a-society flow-status` is the authoritative snapshot for active nodes and pending joins.
4. Token-unavailable states use the exact approved strings from this advisory; unavailable never means zero.
5. Phase 1 introduces no new operator-event flags or env vars.

Required warning/caveat language:

- TTY sessions show a wait spinner before first output; non-TTY sessions degrade to a one-line wait notice.
- Live parallel visibility is transition-based, not a multi-pane live dashboard.
- `flow-status` is the place to inspect the full current parallel state.

Documentation accuracy rule for this flow:

- If any command examples or CLI wording are touched while updating `$A_SOCIETY_RUNTIME_INVOCATION`, they must match the live implementation at the time of implementation review. This flow does not authorize speculative command documentation.
