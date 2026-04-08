**Subject:** Runtime Observability Foundation — Phase 0 Design Advisory (Revised)
**Type:** Technical Architect → Owner
**Date:** 2026-04-08
**Flow:** `20260408-runtime-observability-foundation`
**Supersedes:** `03-ta-phase0-design.md`

---

## Revision Summary

Three issues from the Owner's REVISE decision are corrected here:

1. `session.turn` redefined as one-span-per-LLM-call. A new `session.interaction` span wraps the full `runInteractiveSession` invocation. The narrative, hierarchy, metric, tests, and §8 rows are updated consistently.
2. Improvement meta-analysis sessions correctly include `handoff.parse` child spans — `runInteractiveSession` calls `HandoffInterpreter.parse` for typed signals as well as routing handoffs.
3. `a_society.handoff.parse_failure` metric emission moved to `orient.ts` where `roleKey` is a direct function parameter — no span attribute introspection.

All approved sections from `03-ta-phase0-design.md` are reproduced unchanged. Revised sections are indicated with `[REVISED]` in their headings.

---

## Open Question Resolutions

Unchanged from the approved advisory. See `03-ta-phase0-design.md §Open Question Resolutions`.

---

## §1 — Observability Objectives and Success Criteria [REVISED]

### Questions that must be answerable after Phase 1

After implementation, the following questions must have deterministic answers in trace data without inspecting log files or source code:

1. **Why did a node advance or fail to advance?** The `flow.node.advance` span captures node ID, role, handoff kind (or error), and terminal outcome. Handoff parse failures appear as span events with the raw error message.

2. **Why did a session abort or enter `awaiting_human`?** The `session.interaction` span captures terminal outcome (`session.interaction.outcome`). The individual `session.turn` span where ABORTED occurred carries the `session.turn.aborted` event.

3. **Which provider and model ran?** Every `provider.execute_turn` span carries `provider.name` and `provider.model` attributes.

4. **Whether a tool-call round occurred?** The `llm.gateway.execute_turn` span carries `llm.tool_round_count` as an attribute.

5. **Why a handoff parse failed?** `handoff.parse` spans record `handoff.parse.success = false` and an exception event with the raw parse error. Each `handoff.parse` is a child of the `session.turn` span for the LLM call it follows.

6. **Why the runtime entered `awaiting_human`?** The `flow.node.advance` span records `flow.awaiting_human = true` and the suspension reason.

7. **Where latency accumulated?** The span hierarchy (flow → node → interaction → turn → llm gateway → provider) allows exact latency attribution to any layer. Per-LLM-call latency is measured by `session.turn` span duration and by the `a_society.session.turn.duration` histogram.

### Execution paths the design must cover

All of the following must produce spans covering their complete lifecycle:

- Interactive bootstrap session (Owner bootstrapping, multiple user/assistant exchanges before handoff)
- Autonomous session turn (single LLM call, handoff or rethrown parse error)
- Prompt-human loop (autonomous node pausing for human input)
- Human input resumption
- Forward-pass closure signal
- Improvement-phase meta-analysis sessions (per-role backward pass, including `handoff.parse` on typed signal)
- Improvement-phase synthesis session (including `handoff.parse`)
- Tool-call rounds within a provider turn
- Handoff parse failure and error feedback loop
- ABORTED turn

### Minimum operator outcomes

After Phase 1, an operator must be able to:

1. Trace a single flow end-to-end — from `flow.run` through all nodes to completion.
2. See per-LLM-call latency and token usage — every `session.turn` span duration and every `provider.execute_turn` span carry latency; token counters are present per turn.
3. Assert expected spans in integration tests — using an in-memory span exporter, verifying `session.interaction`, `session.turn`, `handoff.parse`, and `flow.node.advance` spans programmatically.

---

## §2 — Telemetry Bootstrap and Export Architecture

Unchanged from `03-ta-phase0-design.md §2`. Reproduced in full below for completeness.

### Bootstrap module: `a-society/runtime/src/observability.ts`

A dedicated module `src/observability.ts` is required. Both `bin/a-society.ts` and `src/cli.ts` call `TelemetryManager.init()` as the first action after dotenv configuration, before any traced code runs.

**Why a dedicated module:** Both entry points need the same bootstrap logic. The module also provides `initForTest()` for the test seam (§6).

**Why NodeSDK:** `NodeSDK` handles async context propagation via `AsyncLocalStorage`. Child spans inside `runInteractiveSession` and `LLMGateway.executeTurn` are automatically parented to the enclosing spans — no span context threading through function parameters.

`NodeSDK` is initialized with `instrumentations: []`.

### `TelemetryManager` public interface

```typescript
TelemetryManager.init(): void
TelemetryManager.initForTest(traceExporter: SpanExporter): void
TelemetryManager.shutdown(): Promise<void>
TelemetryManager.getTracer(): Tracer
TelemetryManager.getMeter(): Meter
```

Semantics unchanged from `03-ta-phase0-design.md §2`.

### Bootstrap logic

Unchanged from `03-ta-phase0-design.md §2`. Summary:
1. Idempotency guard.
2. `A_SOCIETY_TELEMETRY_ENABLED=false` → NOOP tracer/meter, no SDK init.
3. `A_SOCIETY_OTLP_ENDPOINT` absent → no-export fallback (spans collected but not exported).
4. Present → OTLP/HTTP exporters for traces and metrics.
5. `A_SOCIETY_OTLP_HEADERS` parsed; malformed → stderr warning, proceed without headers.
6. `NodeSDK` constructed with resource attributes; `sdk.start()` with error catch and stderr warning.
7. SIGTERM and beforeExit shutdown handlers registered.

`initForTest(traceExporter)`: shuts down prior SDK, resets singleton, initializes new SDK with provided exporter, no signal handlers.

### Resource attributes, export topology, LangSmith

Unchanged from `03-ta-phase0-design.md §2`.

---

## §3 — Trace Model [REVISED]

### Root trace strategy

One root trace per flow run. A `flow.run` root span is created at the start of `FlowOrchestrator.startUnifiedOrchestration` and closes when `startUnifiedOrchestration` returns.

**Two-level session span model:** `runInteractiveSession` is called from multiple sites — the bootstrap loop, `advanceFlow`'s retry loop, and the improvement orchestrator. Each invocation produces one `session.interaction` span. Within each `session.interaction`, every LLM API call produces one `session.turn` child span. This is the level at which per-turn debugging granularity is achieved.

Mapping to the live `orient.ts` code:
- **Empty history path** (lines 40–87): one `session.turn` for the initial `llm.executeTurn` call.
- **Resume turn path** (lines 90–127): one `session.turn` for the `llm.executeTurn` call when history is non-empty and the last message is a user message.
- **Interactive readline loop** (lines 145–199): one `session.turn` per `promptUser()` iteration — each iteration makes exactly one `llm.executeTurn` call. A loop with three user exchanges before handoff produces three `session.turn` children.

`session.interaction` spans are children of `bootstrap.session`, `flow.node.advance`, or the improvement phase spans, depending on the call site.

`session.turn` spans are always children of `session.interaction`. `llm.gateway.execute_turn` and `handoff.parse` are children of `session.turn`.

OTel's `AsyncLocalStorage` context propagation makes this automatic — no span context threading is required.

### Span hierarchy (complete)

```
flow.run                                              [FlowOrchestrator.startUnifiedOrchestration]
├── bootstrap.session                                 [bootstrap while-loop, before flowRun established]
│   ├── session.interaction × N                       [each runInteractiveSession call in bootstrap]
│   │   └── session.turn × M                          [each LLM call within the interaction]
│   │       ├── llm.gateway.execute_turn
│   │       │   └── provider.execute_turn × rounds
│   │       └── handoff.parse
│   └── tool_trigger.execute                          [START event, after workflow validates]
├── flow.node.advance × N                             [FlowOrchestrator.advanceFlow per node]
│   ├── session.interaction × M                       [each runInteractiveSession call in advanceFlow retry loop]
│   │   └── session.turn                              [single LLM call — autonomous mode; M=1 per interaction]
│   │       ├── llm.gateway.execute_turn
│   │       │   └── provider.execute_turn × rounds
│   │       └── handoff.parse
│   └── improvement.orchestrate                       [if forward-pass-closed signal received]
│       ├── improvement.meta_analysis.step × K        [per backward-pass plan step group]
│       │   └── session.interaction × roles in group
│       │       └── session.turn
│       │           ├── llm.gateway.execute_turn
│       │           └── handoff.parse                 [for meta-analysis-complete typed signal]
│       └── improvement.synthesis
│           └── session.interaction
│               └── session.turn
│                   ├── llm.gateway.execute_turn
│                   └── handoff.parse
└── tool_trigger.execute                              [TERMINAL_FORWARD_PASS, in applyHandoffAndAdvance]
```

**Notes:**
- `flow.node.advance` calls `runInteractiveSession` with `autonomous = true`. Each call is one `session.interaction` with exactly one `session.turn` child (single LLM call, no readline loop).
- Bootstrap calls `runInteractiveSession` with `autonomous = false`. The readline loop in interactive mode means one `session.interaction` may have multiple `session.turn` children.
- Improvement phase sessions (meta-analysis, synthesis) call `runInteractiveSession` with `autonomous` defaulting to `false`. Each improvement session is one `session.interaction`.
- `handoff.parse` is present under `session.turn` for every LLM call site, including improvement meta-analysis sessions. `HandoffInterpreter.parse` handles all typed signal kinds (`meta-analysis-complete`, `prompt-human`, `forward-pass-closed`) as well as routing handoffs. The `handoff.result_kind` attribute distinguishes the parsed form.
- `tool_trigger.execute` for the START event is a child of `bootstrap.session`.
- `tool_trigger.execute` for TERMINAL_FORWARD_PASS is a child of the active `flow.node.advance` span.

### Span definitions

#### `flow.run`

Created in `FlowOrchestrator.startUnifiedOrchestration` — first action after `SessionStore.init()`.
Closed in `finally` block.
Kind: `SpanKind.INTERNAL`.

**Attributes at creation:**

| Attribute | Type | Value |
|---|---|---|
| `flow.id` | string | `"pending"` — updated to `flowRun.flowId` once established |
| `flow.resumed` | boolean | `true` if `SessionStore.loadFlowRun()` returned non-null |

**Attributes at completion:**

| Attribute | Type | Value |
|---|---|---|
| `flow.project_namespace` | string | `flowRun.projectNamespace` |
| `flow.status` | string | Final `flowRun.status` |

**Events:**

| Event | When | Attributes |
|---|---|---|
| `flow.started` | At span creation | `flow.resumed` |
| `store.flow_loaded` | When `loadFlowRun` returns non-null | `flow.id` |
| `flow.bootstrapping` | When bootstrap loop begins | — |
| `flow.established` | When `flowRun` created after bootstrap | `flow.id`, `record_folder_path` (repo-relative) |

**Error recording:** Unhandled exceptions: `span.recordException(e)`, `span.setStatus({ code: SpanStatusCode.ERROR })`.

#### `bootstrap.session`

Created when bootstrap loop begins; closed on `break` after `SessionStore.saveFlowRun`.
Kind: `SpanKind.INTERNAL`.

**Attributes at creation:** `role_key`.

**Attributes at completion:** `bootstrap.retry_count` (loop iterations), `bootstrap.workflow_path` (repo-relative).

**Events:**

| Event | When | Attributes |
|---|---|---|
| `bootstrap.workflow_not_found` | workflow.md not found, error injected | `record_folder_path` |
| `bootstrap.workflow_parse_failed` | `parseWorkflow` throws, error injected | `error_message` |
| `bootstrap.tool_trigger_failed` | `ToolTriggerEngine` throws, error injected | `error_message` |

Bootstrap loop errors are span events (loop retries). Unhandled exceptions escaping the loop: `recordException` + `SpanStatusCode.ERROR`.

#### `flow.node.advance`

Created as first action in `FlowOrchestrator.advanceFlow`; closed in `finally`.
Kind: `SpanKind.INTERNAL`.

**Attributes at creation:**

| Attribute | Type | Value |
|---|---|---|
| `flow.id` | string | `flowRun.flowId` |
| `node.id` | string | `nodeId` |
| `role` | string | `currentNodeDef.role` — set after `parseWorkflow` resolves it |
| `role_key` | string | `${flowRun.projectNamespace}__${currentNodeDef.role}` |
| `session.id` | string | `${flowRun.flowId}__${nodeId}` |
| `node.session_resumed` | boolean | true if `loadRoleSession` returned non-null |
| `node.artifact_count` | int | count of `resolvedArtifacts` |

**Attributes at completion:**

| Attribute | Type | Value |
|---|---|---|
| `node.outcome` | string | `"handoff"`, `"forward_pass_closed"`, `"awaiting_human"`, `"null_return"`, `"error"` |
| `handoff.kind` | string | Present when `node.outcome = "handoff"` |
| `flow.awaiting_human` | boolean | true when `flowRun.status` set to `"awaiting_human"` |

**Events:**

| Event | When | Attributes |
|---|---|---|
| `store.session_loaded` | After `loadRoleSession` | `session.id`, `session.resumed` |
| `store.flow_saved` | After each `saveFlowRun` changing flow status | `flow.status` |
| `store.session_saved` | After `saveRoleSession` | `session.id` |
| `store.turn_saved` | After `saveTurnRecord` | `session.id`, `turn_number` |
| `handoff.parse_error_injected` | When `HandoffParseError` / `WorkflowError` caught and injected | `error_type`, `error_message` (first 500 chars) |
| `node.awaiting_human_suspended` | When `flowRun.status` set to `"awaiting_human"` | `suspension_reason`: `"prompt_human_signal"` or `"null_session_return"` |
| `human_input.received` | After `readHumanInput` returns non-null | — |
| `human_input.exit` | When `readHumanInput` returns null | — |

**Error recording:** Non-`HandoffParseError`/`WorkflowError` exceptions: `recordException` + `SpanStatusCode.ERROR`.

#### `session.interaction` [NEW]

Created at the start of `runInteractiveSession` — first action after `session` object construction.
Closed in a `finally` block before return.
Kind: `SpanKind.INTERNAL`.

This span wraps the complete invocation of `runInteractiveSession`. In autonomous mode it will have exactly one `session.turn` child. In interactive mode (readline loop) it may have multiple.

**Attributes at creation:**

| Attribute | Type | Value |
|---|---|---|
| `session.id` | string | `session.sessionId` |
| `role_key` | string | `roleKey` parameter |
| `autonomous` | boolean | `autonomous` parameter |

**Attributes at completion:**

| Attribute | Type | Value |
|---|---|---|
| `session.interaction.outcome` | string | `"handoff"`, `"awaiting_human"`, `"aborted"`, `"null_return"`, `"error"` |
| `session.interaction.turn_count` | int | Total number of `session.turn` child spans created within this interaction |

**Events:**

| Event | When | Attributes |
|---|---|---|
| `session.auth_error` | When `LLMGatewayError` with `type === 'AUTH_ERROR'` is caught | — |

**Payload capture (opt-in, `A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE=true`):**

| Event | When | Attributes |
|---|---|---|
| `session.system_prompt` | Once, at function entry, before the first LLM call | `content`: first 2000 chars of `systemPrompt` |

The guard must prevent evaluation of the content expression, not merely skip the `addEvent` call:
```typescript
if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
  span.addEvent('session.system_prompt', { content: systemPrompt.slice(0, 2000) });
}
```

**Error recording:** Unhandled exceptions propagating out: `recordException` + `SpanStatusCode.ERROR`. AUTH_ERROR causes `null` return — recorded as `session.auth_error` event, not span error status.

#### `session.turn` [REVISED]

One span per LLM API call within an interaction. Created immediately before each `llm.executeTurn` call; closed immediately after the `HandoffInterpreter.parse` attempt that follows it. Closed in a `try/finally` block wrapping both the `executeTurn` call and the `parse` attempt.

There are three LLM call sites in `runInteractiveSession`:
1. **Empty history initial turn** (lines 50–87): span wraps `llm.executeTurn(systemPrompt, [initialUserMsg])` through the subsequent `HandoffInterpreter.parse` attempt.
2. **Resume turn** (lines 95–126): span wraps `llm.executeTurn(systemPrompt, history)` through the subsequent parse attempt.
3. **Readline loop per-iteration** (lines 166–196 within `promptUser`): span wraps `llm.executeTurn(systemPrompt, history)` through the subsequent parse attempt. A new `session.turn` span is created on each `promptUser` invocation, not once for the entire `promptUser` function.

Kind: `SpanKind.INTERNAL`.

**Attributes at creation:**

| Attribute | Type | Value |
|---|---|---|
| `turn.index` | int | 0-based index within this `session.interaction` — incremented by a local counter in `runInteractiveSession` and passed into each `session.turn` span at creation |
| `autonomous` | boolean | `autonomous` parameter (repeated from parent for query convenience) |

**Attributes at completion:**

| Attribute | Type | Value |
|---|---|---|
| `session.turn.outcome` | string | `"handoff"` (parse succeeded and returned a result), `"no_handoff"` (parse failed, interactive loop continues), `"aborted"` (LLM call threw ABORTED), `"error"` (other error) |

**Events:**

| Event | When | Attributes |
|---|---|---|
| `session.turn.handoff_detected` | `HandoffInterpreter.parse` returns successfully | `handoff_kind` |
| `session.turn.parse_failed` | `HandoffParseError` caught for this turn | `error_message` (first 500 chars) |
| `session.turn.aborted` | `LLMGatewayError` with `type === 'ABORTED'` caught | `partial_text_available` (bool) |

**Payload capture (opt-in):**

| Event | When | Attributes |
|---|---|---|
| `session.user_turn` | For the user message(s) being sent in this LLM call — emitted before `executeTurn` | `content`: full message text |
| `session.assistant_turn` | After successful `executeTurn` returns | `content`: full response text |

**Error recording:** ABORTED: `SpanStatusCode.OK` + `session.turn.aborted` event. AUTH_ERROR and other errors that cause early `null` return: `recordException` + `SpanStatusCode.ERROR`. The `session.interaction` AUTH_ERROR event is emitted from the `session.interaction` span's error handler, not from `session.turn`.

**Modal symmetry declaration:** `session.turn` spans are created identically for autonomous and interactive execution paths. The distinction is that autonomous interactions have exactly one `session.turn` child per `session.interaction`; interactive interactions may have many. The `autonomous` attribute carries this context.

**Implementation note — ABORTED in readline loop:** In the readline loop, ABORTED causes `promptUser()` to recurse (lines 172–177), not return. The `session.turn` for the aborted iteration closes with `outcome = "aborted"`; the next `promptUser()` call creates a fresh `session.turn`.

#### `llm.gateway.execute_turn`

Unchanged from `03-ta-phase0-design.md §3`. This span is a child of `session.turn`.

#### `provider.execute_turn`

Unchanged from `03-ta-phase0-design.md §3`. This span is a child of `llm.gateway.execute_turn`.

#### `handoff.parse`

Unchanged from `03-ta-phase0-design.md §3`, with one correction: this span is present under `session.turn` for all call sites, including improvement meta-analysis and synthesis sessions. `HandoffInterpreter.parse` is called after every `llm.executeTurn` return in `runInteractiveSession`, regardless of session type. The `handoff.result_kind` attribute records the parsed form — `'meta-analysis-complete'` for meta-analysis sessions, `'targets'` or `'forward-pass-closed'` for forward-pass sessions.

#### `tool_trigger.execute`

Unchanged from `03-ta-phase0-design.md §3`.

#### `improvement.orchestrate`

Unchanged from `03-ta-phase0-design.md §3`.

### Payload capture in spans

Unchanged from `03-ta-phase0-design.md §3` except that `session.system_prompt` is now on `session.interaction` and `session.user_turn` / `session.assistant_turn` are on `session.turn`. Refer to the span definitions above for exact event placement.

---

## §4 — Metrics Model [REVISED]

### Required Phase 1 counters

| Metric name | Unit | Description | Dimensions | Emit location |
|---|---|---|---|---|
| `a_society.flow.started` | `{flow}` | Incremented when a flow run begins | `project_namespace` | `FlowOrchestrator.startUnifiedOrchestration`, after `flowRun` established |
| `a_society.flow.completed` | `{flow}` | Incremented when flow reaches terminal status | `project_namespace`, `status` | `FlowOrchestrator.startUnifiedOrchestration`, when main loop exits |
| `a_society.session.turn.started` | `{turn}` | **One per LLM API call.** Incremented at the start of each `session.turn` span — i.e., immediately before each `llm.executeTurn` call in `runInteractiveSession`. In autonomous mode this is once per `runInteractiveSession` invocation; in interactive mode it is once per readline loop iteration. | `role_key`, `autonomous` (string: `"true"` or `"false"`) | `orient.ts` — `runInteractiveSession`, at the start of each `session.turn` span |
| `a_society.handoff.parse_failure` | `{failure}` | Incremented when `HandoffInterpreter.parse` throws `HandoffParseError`. | `role_key` — the `roleKey` parameter of the enclosing `runInteractiveSession` call; always available as a direct local variable at every `HandoffParseError` catch site in `orient.ts` | `orient.ts` — at each `HandoffParseError` catch block, **before** the `if (autonomous) throw e` check. This means the counter is emitted for both autonomous and interactive modes, regardless of whether the error is rethrown. **Not emitted in `handoff.ts`.** |
| `a_society.provider.token.input` | `{token}` | Input tokens per provider turn | `provider`, `model` | Both providers, on completion |
| `a_society.provider.token.output` | `{token}` | Output tokens per provider turn | `provider`, `model` | Both providers, on completion |

### Required Phase 1 histograms

| Metric name | Unit | Bucket boundaries | Dimensions | Emit location |
|---|---|---|---|---|
| `a_society.provider.latency` | `ms` | `[50, 100, 250, 500, 1000, 2000, 5000, 10000]` | `provider`, `model` | Both providers, on completion |
| `a_society.session.turn.duration` | `ms` | `[100, 500, 1000, 5000, 10000, 30000, 60000]` | `role_key`, `autonomous` | `orient.ts` — on `session.turn` span completion. **Measures individual LLM call duration** (one `executeTurn` plus its `handoff.parse` attempt), not the duration of the full `runInteractiveSession` invocation. |

### Cardinality notes, Phase 1 omissions, metric-to-trace correlation

Unchanged from `03-ta-phase0-design.md §4`.

---

## §5 — Payload Capture and Privacy Policy

Unchanged from `03-ta-phase0-design.md §5`, with one cross-reference update: `session.system_prompt` is now an event on `session.interaction`; `session.user_turn` and `session.assistant_turn` are events on `session.turn`. The safe/unsafe classification and the opt-in enablement mechanism are unchanged.

---

## §6 — Testing and Validation Seam [REVISED]

### In-memory exporter approach

Unchanged from `03-ta-phase0-design.md §6`. `TelemetryManager.initForTest(traceExporter)` is the test entry point.

### Test helper module: `a-society/runtime/test/telemetry-test-helper.ts`

Unchanged from `03-ta-phase0-design.md §6`. The five helper functions (`setupTestTelemetry`, `clearTestSpans`, `getSpansByName`, `getSpan`, `getEvents`) are identical.

### Required test scenarios: `a-society/runtime/test/observability.test.ts`

Five named test scenarios. The span names and assertion targets reflect the two-level session model.

| Scenario | Spans and assertions required |
|---|---|
| **Successful node handoff** | Assert: `flow.node.advance` with `node.outcome = "handoff"`; `session.interaction` child with `session.interaction.outcome = "handoff"` and `session.interaction.turn_count = 1`; `session.turn` child of `session.interaction` with `session.turn.outcome = "handoff"` and event `session.turn.handoff_detected`; `handoff.parse` grandchild of `session.turn` with `handoff.parse.success = true`. |
| **Prompt-human suspension** | Assert: `flow.node.advance` with `node.outcome = "awaiting_human"` and event `node.awaiting_human_suspended` with `suspension_reason = "prompt_human_signal"`; `session.interaction` child with `session.interaction.outcome = "awaiting_human"`. |
| **Provider tool-call round** | Assert: `llm.gateway.execute_turn` (child of `session.turn`) with `llm.tool_round_count >= 1` and event `llm.tool_round` with `round_index = 0`; at least two `provider.execute_turn` spans (one per round). |
| **Handoff parse failure path** | Assert: `handoff.parse` child of first `session.turn` with `handoff.parse.success = false` and exception event; `session.turn` with event `session.turn.parse_failed`; `flow.node.advance` with event `handoff.parse_error_injected`; a second `session.interaction` child of `flow.node.advance` (the retry after error injection in `advanceFlow`'s while-loop); `a_society.handoff.parse_failure` counter incremented in the in-memory meter reader (if phase-1 metric validation is included). |
| **Forward-pass closure to improvement** | Assert: `improvement.orchestrate` span exists as child of `flow.node.advance`; event `improvement.mode_selected` present; at least one `session.interaction` child within `improvement.orchestrate`; at least one `session.turn` grandchild; at least one `handoff.parse` great-grandchild within the improvement session. |

All assertions are programmatic via test helper functions. No screenshots or third-party UI required.

---

## §7 — Operator Surface

Unchanged from `03-ta-phase0-design.md §7`. Telemetry env vars, local development setup options, LangSmith instructions, and terminal behavior for configuration errors are identical.

---

## §8 — Files Changed [REVISED]

| File | Action | Required behavioral changes |
|---|---|---|
| `a-society/runtime/src/observability.ts` | Create (new) | Unchanged from `03-ta-phase0-design.md §8`. Implement `TelemetryManager` with `init()`, `initForTest(traceExporter)`, `shutdown()`, `getTracer()`, `getMeter()`. All bootstrap logic per §2. Required imports listed in prior row. |
| `a-society/runtime/bin/a-society.ts` | Modify | Unchanged from `03-ta-phase0-design.md §8`. `TelemetryManager.init()` immediately after dotenv; `TelemetryManager.shutdown()` in finally. |
| `a-society/runtime/src/cli.ts` | Modify | Unchanged from `03-ta-phase0-design.md §8`. `TelemetryManager.init()` after dotenv, before `SessionStore.init()`. |
| `a-society/runtime/src/orchestrator.ts` | Modify | `flow.run` and `bootstrap.session` spans unchanged from `03-ta-phase0-design.md §8`. `flow.node.advance` span unchanged from `03-ta-phase0-design.md §8`. `a_society.flow.started` and `a_society.flow.completed` counters unchanged. **No `session.interaction` or `session.turn` spans are created in `orchestrator.ts`** — those are created in `orient.ts`. Required imports: `TelemetryManager` from `'./observability.js'`; `SpanStatusCode`, `SpanKind` from `'@opentelemetry/api'`. |
| `a-society/runtime/src/orient.ts` | Modify | **Two-level span model.** (1) `session.interaction` span: created at function entry after `session` object construction; closed in a `finally` block before all return paths; attributes `session.id`, `role_key`, `autonomous` at creation; `session.interaction.outcome` and `session.interaction.turn_count` set before closing; `session.auth_error` event on AUTH_ERROR catch; payload capture guard for `session.system_prompt` at function entry; unhandled exception recording. (2) `session.turn` spans: a local `turnIndex` counter (initialized to 0) tracks turn count within the interaction; a new `session.turn` span is opened immediately before each of the three `llm.executeTurn` call sites (empty-history path, resume-turn path, readline loop iteration); each span is closed in a `try/finally` wrapping both the `executeTurn` call and the `HandoffInterpreter.parse` attempt that follows it; attributes `turn.index` (from `turnIndex`, post-increment) and `autonomous` at creation; `session.turn.outcome` set before closing; `session.turn.handoff_detected` event with `handoff_kind` when parse succeeds; `session.turn.parse_failed` event (first 500 chars of error message) when `HandoffParseError` caught; `session.turn.aborted` event when ABORTED; payload capture guards for `session.user_turn` (before `executeTurn`) and `session.assistant_turn` (after response received); ABORTED: `SpanStatusCode.OK`; AUTH_ERROR and other non-ABORTED errors: `recordException` + `SpanStatusCode.ERROR`. (3) `session.interaction.turn_count` must be set to the final value of `turnIndex` before the `session.interaction` span closes. (4) `a_society.session.turn.started` counter: incremented at the start of each `session.turn` span, with `role_key` and `autonomous` dimensions. (5) `a_society.session.turn.duration` histogram: observed on `session.turn` span completion with duration in ms. (6) **`a_society.handoff.parse_failure` counter: incremented at every `HandoffParseError` catch block in `runInteractiveSession` — all three call sites — using `role_key` (direct function parameter) as the dimension, before the `if (autonomous) throw e` check.** The counter is emitted regardless of whether the error is rethrown; both paths (interactive loop continues, autonomous rethrows) increment the counter at the same catch site. Required imports: `TelemetryManager` from `'./observability.js'`; `SpanStatusCode` from `'@opentelemetry/api'`. Non-happy-path behaviors named in this row: ABORTED must emit `session.turn.aborted` event with `SpanStatusCode.OK` (not recordException); AUTH_ERROR must emit `session.auth_error` on `session.interaction` AND `recordException` + `SpanStatusCode.ERROR` on `session.turn`; readline-loop ABORTED must close the current `session.turn` before `promptUser()` recurse (new turn span on next iteration). |
| `a-society/runtime/src/llm.ts` | Modify | Unchanged from `03-ta-phase0-design.md §8`. `llm.gateway.execute_turn` span with all attributes and events per §3. Required imports: `TelemetryManager` from `'./observability.js'`; `SpanStatusCode`, `SpanKind` from `'@opentelemetry/api'`. |
| `a-society/runtime/src/providers/anthropic.ts` | Modify | Unchanged from `03-ta-phase0-design.md §8`. `provider.execute_turn` span with all attributes and events per §3; `a_society.provider.token.input`, `a_society.provider.token.output` counters; `a_society.provider.latency` histogram. Required imports: `TelemetryManager` from `'../observability.js'`; `SpanStatusCode`, `SpanKind` from `'@opentelemetry/api'`. |
| `a-society/runtime/src/providers/openai-compatible.ts` | Modify | Unchanged from `03-ta-phase0-design.md §8`. Cross-provider symmetry applies. Required imports: `TelemetryManager` from `'../observability.js'`; `SpanStatusCode`, `SpanKind` from `'@opentelemetry/api'`. |
| `a-society/runtime/src/handoff.ts` | Modify | `handoff.parse` span per §3: `handoff.text_length` at creation; `handoff.parse.success` and `handoff.result_kind` set before closing; on `HandoffParseError`: `recordException` + `SpanStatusCode.ERROR`, then rethrow; close in `finally`. **The `a_society.handoff.parse_failure` counter is NOT emitted here** — it is emitted in `orient.ts` where `role_key` is directly available. Non-happy-path: every `HandoffParseError` throw path must call `span.recordException(e)` and set status to ERROR before rethrowing. Required imports: `TelemetryManager` from `'./observability.js'`; `SpanStatusCode` from `'@opentelemetry/api'`. |
| `a-society/runtime/src/store.ts` | No change | Unchanged from `03-ta-phase0-design.md §8`. Store I/O represented via caller events. |
| `a-society/runtime/src/triggers.ts` | Modify | Unchanged from `03-ta-phase0-design.md §8`. `tool_trigger.execute` span per §3. Required imports: `TelemetryManager` from `'./observability.js'`; `SpanStatusCode` from `'@opentelemetry/api'`. |
| `a-society/runtime/src/improvement.ts` | Modify | `improvement.orchestrate` span per §3. **No change to the improvement path itself is required for `handoff.parse` coverage** — `HandoffInterpreter.parse` is already called inside `runInteractiveSession`, which now creates `session.turn` and `handoff.parse` child spans automatically. The improvement orchestrator's contribution is the `improvement.orchestrate`, `improvement.meta_analysis.step`, and `improvement.synthesis_started` spans/events per §3. Required imports: `TelemetryManager` from `'./observability.js'`; `SpanStatusCode` from `'@opentelemetry/api'`. |
| `a-society/runtime/src/types.ts` | No change | Unchanged. |
| `a-society/runtime/package.json` | Modify | Unchanged from `03-ta-phase0-design.md §8`. Add seven OTel dependencies to `dependencies`. |
| `a-society/runtime/INVOCATION.md` | Modify | Unchanged from `03-ta-phase0-design.md §8`. Add `## Telemetry and Observability` section with env vars table, local development setups, LangSmith example, terminal warnings. |
| `a-society/runtime/test/telemetry-test-helper.ts` | Create (new) | Unchanged from `03-ta-phase0-design.md §8`. Five helper functions. |
| `a-society/runtime/test/observability.test.ts` | Create (new) | Implement the five test scenarios from §6 (revised). Assertions must use the two-level `session.interaction` → `session.turn` span model. The parse-failure scenario must assert `session.turn.parse_failed` event and a second `session.interaction` child on `flow.node.advance` (the retry). The improvement scenario must assert `handoff.parse` within improvement session turns. |

---

## Record-Folder Requirement Exemption

No new record-folder schema requirements. No bootstrapping exemption needed.

## Coupling Map Consultation

No tooling component (Components 1–6) is modified. Coupling map consultation not triggered.

---

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260408-runtime-observability-foundation/05-ta-phase0-design-revised.md
```
