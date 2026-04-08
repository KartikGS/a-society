**Subject:** Runtime Observability Foundation — Phase 0 Design Advisory
**Type:** Technical Architect → Owner
**Date:** 2026-04-08
**Flow:** `20260408-runtime-observability-foundation`

---

## Open Question Resolutions

Six open questions from the brief are resolved here. Each resolution drives downstream design decisions.

**Q1 — Root trace boundary?** Both flow-level and turn-level. One root trace per flow run, with child spans per node advancement and nested turn spans within each node. This gives simultaneous end-to-end flow visibility and per-turn debugging granularity without sacrificing either.

**Q2 — Production topology: collector-first or direct OTLP?** Direct OTLP/HTTP from the runtime, with the OTel Collector documented as the recommended production topology for fan-out. At A-Society's current scale (single-operator development runtime), direct OTLP to a local service is the right default — a collector is not required for Phase 1 operation.

**Q3 — LangSmith in Phase 1 operator docs?** Yes. LangSmith supports OTLP ingest natively. Document it as a worked OTLP destination example. The runtime's instrumentation substrate is LangSmith-agnostic; documenting it as an optional downstream consumer is low-cost and reduces operator friction for the expected primary use case.

**Q4 — Metadata-only default + opt-in payload?** Confirmed as correct design. The runtime injects project-specific context and artifacts into every session. Default external export of that content is not an appropriate baseline. Explicit opt-in enables deep debugging without making it the default exposure posture.

**Q5 — Traces + minimal metrics in Phase 1?** Both. Traces alone answer the diagnostic questions; a small core metric set (flow starts/completions, provider latency, token usage, handoff failures) adds operational visibility at low cost. Full log ingestion/correlation is deferred.

**Q6 — SessionStore operations: spans, metric-only, or mixed?** Span events on the parent span, not dedicated child spans. `SessionStore` operations are synchronous filesystem writes/reads taking sub-millisecond time. Child spans would add noise without diagnostic value. Events attached to the enclosing `flow.node.advance` span provide the relevant correlation at zero child-span overhead. No changes to `store.ts` are required; the events are emitted by callers in the orchestration layer.

---

## §1 — Observability Objectives and Success Criteria

### Questions that must be answerable after Phase 1

After implementation, the following questions must have deterministic answers in trace data without inspecting log files or source code:

1. **Why did a node advance or fail to advance?** The `flow.node.advance` span captures node ID, role, handoff kind (or error), and terminal outcome. Handoff parse failures appear as span events with the raw error message.

2. **Why did a session abort or enter `awaiting_human`?** The `session.turn` span captures terminal outcome (`handoff_kind`, `aborted`, `awaiting_human`) as span attributes. ABORTED events record partial-text availability.

3. **Which provider and model ran?** Every `provider.execute_turn` span carries `provider.name` and `provider.model` attributes.

4. **Whether a tool-call round occurred?** The `llm.gateway.execute_turn` span carries `llm.tool_round_count` as an attribute, incremented per round.

5. **Why a handoff parse failed?** `handoff.parse` spans record `handoff.parse.success = false` and an exception event with the raw parse error.

6. **Why the runtime entered `awaiting_human`?** The `flow.node.advance` span records `flow.awaiting_human = true` and the suspension reason (`prompt_human_signal` vs. `null_return_from_session`).

7. **Where latency accumulated?** The span hierarchy (flow → node → session turn → llm gateway → provider) allows exact latency attribution to any layer.

### Execution paths the design must cover

All of the following execution paths must produce spans covering their complete lifecycle:

- Interactive bootstrap session (Owner bootstrapping a new flow)
- Autonomous session turn (advancing an active node)
- Prompt-human loop (autonomous node pausing for human input)
- Human input resumption (human reply appended, session continues)
- Forward-pass closure signal
- Improvement-phase meta-analysis sessions (per-role backward pass)
- Improvement-phase synthesis session
- Tool-call rounds within a provider turn (any number, up to MAX_TOOL_ROUNDS)
- Handoff parse failure and error feedback loop (agent receives error, retries)
- ABORTED turn (Ctrl+C during generation)

### Minimum operator outcomes

After Phase 1, an operator must be able to:

1. Trace a single flow end-to-end — from `flow.run` through all nodes to completion, with all child spans visible in one trace view.
2. See provider latency and token usage in trace context — every `provider.execute_turn` span carries latency (via span duration), `provider.input_tokens`, and `provider.output_tokens`.
3. Assert expected spans in integration tests — using an in-memory span exporter without a running backend, verifying span names, attributes, and events programmatically.

---

## §2 — Telemetry Bootstrap and Export Architecture

### Bootstrap module: `a-society/runtime/src/observability.ts`

A dedicated module `src/observability.ts` is required. Both `bin/a-society.ts` and `src/cli.ts` call `TelemetryManager.init()` as the first action after dotenv configuration, before any traced code runs.

**Why a dedicated module:** Both entry points need the same bootstrap logic. Inline duplication would create a maintenance divergence risk between the two entry points. The module also provides `initForTest()` for the test seam (§6).

**Why NodeSDK, not low-level tracer:** `NodeSDK` from `@opentelemetry/sdk-node` handles async context propagation via `AsyncLocalStorage`. This means child spans created inside `runInteractiveSession` and `LLMGateway.executeTurn` are automatically parented to the enclosing `flow.node.advance` span — without threading span context through function parameters. No parameter threading is required anywhere in the codebase. Low-level tracer setup would require manual context management, which is error-prone across the async call chain.

`NodeSDK` is initialized with `instrumentations: []` — no automatic HTTP/Node.js instrumentation. The runtime needs only manual spans; automatic instrumentation would produce noise from the OTel exporter's own HTTP calls and internal Node.js activity.

### `TelemetryManager` public interface

`TelemetryManager` is a static class with these public methods:

```typescript
// Initializes telemetry for production use.
// Idempotent — safe to call multiple times; subsequent calls are no-ops.
// Must be called at entry-point startup, before any traced code runs.
TelemetryManager.init(): void

// Initializes telemetry with a caller-provided trace exporter for tests.
// Shuts down any previously initialized SDK first (synchronous shutdown with 5s timeout).
// Resets singleton state before reinitializing.
// tracer and meter are scoped to the provided exporter.
TelemetryManager.initForTest(traceExporter: SpanExporter): void

// Shuts down the active SDK and flushes pending spans/metrics.
// Returns a Promise that resolves when shutdown is complete.
// No-op if no SDK is initialized.
TelemetryManager.shutdown(): Promise<void>

// Returns the active tracer for this instrumentation scope.
// Instrumentation name: 'a-society-runtime'; version: matches package.json "version" field.
// If telemetry is disabled, returns the OTel API's NOOP tracer.
TelemetryManager.getTracer(): Tracer

// Returns the active meter for this instrumentation scope.
// Instrumentation name: 'a-society-runtime'; version: matches package.json "version" field.
// If telemetry is disabled, returns the OTel API's NOOP meter.
TelemetryManager.getMeter(): Meter
```

### Bootstrap logic

`TelemetryManager.init()` must implement the following behavior in this order:

1. If already initialized: return immediately (idempotent).
2. Read `A_SOCIETY_TELEMETRY_ENABLED`. If the value is the string `'false'`: do not initialize the SDK. `getTracer()` returns `trace.getTracer('a-society-runtime')` (which is NOOP when no global provider is set). `getMeter()` returns `metrics.getMeter('a-society-runtime')` (NOOP). Emit no message.
3. Read `A_SOCIETY_OTLP_ENDPOINT`.
   - If absent: configure `traceExporter` as a no-export exporter (use `new SimpleSpanProcessor(new NoopSpanExporter())` or equivalent). Configure `metricReader` as a no-export reader.
   - If present: configure `traceExporter` as `new OTLPTraceExporter({ url: `${endpoint}/v1/traces`, headers: parseOtlpHeaders() })`. Configure `metricReader` as `new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter({ url: `${endpoint}/v1/metrics`, headers: parseOtlpHeaders() }), exportIntervalMillis: 60_000 })`.
4. `parseOtlpHeaders()` reads `A_SOCIETY_OTLP_HEADERS`. If present, parse as comma-separated `key=value` pairs into a `Record<string, string>`. If the string is malformed (any entry is not `key=value`), emit one warning to `process.stderr`: `[a-society-runtime] Telemetry warning: A_SOCIETY_OTLP_HEADERS could not be parsed — proceeding without headers.` and return an empty object. Never throw.
5. Construct `NodeSDK` with:
   - `resource`: `Resource.default().merge(new Resource({ 'service.name': 'a-society-runtime', 'service.version': <package.json version field>, 'service.namespace': 'a-society', 'deployment.environment': process.env.A_SOCIETY_ENV ?? 'development' }))`
   - `traceExporter`: as configured above
   - `metricReader`: as configured above
   - `instrumentations: []`
6. Call `sdk.start()`. If `sdk.start()` throws, emit one warning to `process.stderr`: `[a-society-runtime] Telemetry warning: SDK initialization failed — telemetry is inactive. Error: <message>`. Catch the error; do not rethrow.
7. Register `process.on('beforeExit', () => { TelemetryManager.shutdown(); })`.
8. Register `process.on('SIGTERM', () => { TelemetryManager.shutdown().then(() => process.exit(0)); })`.

**`initForTest(traceExporter)` behavior:**
1. If an SDK is already initialized: call `sdk.shutdown()` with a 5-second timeout. Wait synchronously (block via a synchronous-compatible pattern, or accept that the test helper does this in async context). Reset the singleton state.
2. Initialize a new `NodeSDK` with the provided `traceExporter` and a no-op metric reader.
3. Call `sdk.start()`.
4. Do not register process signal handlers.

**Startup behavior when `A_SOCIETY_OTLP_ENDPOINT` is set but the endpoint is unreachable:** The OTel SDK retries silently. No additional startup warning is needed beyond what the SDK emits internally.

### Export topology

Default: direct OTLP/HTTP (protobuf) from the runtime process to `A_SOCIETY_OTLP_ENDPOINT`. No collector required.

**Why OTLP/HTTP over gRPC:** The `@opentelemetry/exporter-trace-otlp-proto` and `@opentelemetry/exporter-metrics-otlp-proto` packages avoid gRPC native binary dependencies, which cause installation friction in Node.js environments. OTLP/HTTP is universally supported by OTel Collectors, Jaeger, Grafana Tempo, and LangSmith.

**Recommended production topology:** An OTel Collector sits between the runtime and the backend. The runtime exports to the collector (`A_SOCIETY_OTLP_ENDPOINT=http://localhost:4318`); the collector fans out to one or more backends. This decouples the runtime from backend choice and enables sampling without redeployment.

**LangSmith:** LangSmith accepts OTLP/HTTP traces. To route directly to LangSmith, set `A_SOCIETY_OTLP_ENDPOINT=https://api.smith.langchain.com/otel` and `A_SOCIETY_OTLP_HEADERS=x-api-key=<LANGSMITH_API_KEY>`. LangSmith is not referenced in the runtime's bootstrap code — it is a downstream consumer of standard OTLP.

### Resource attributes

| Attribute key | Value source |
|---|---|
| `service.name` | `'a-society-runtime'` (hardcoded) |
| `service.version` | Read from `package.json` `version` field at module initialization |
| `service.namespace` | `'a-society'` (hardcoded) |
| `deployment.environment` | `process.env.A_SOCIETY_ENV ?? 'development'` |

`Resource.default()` is merged before the above to include Node.js process information automatically.

---

## §3 — Trace Model

### Root trace strategy

One root trace per flow run. A `flow.run` root span is created at the start of `FlowOrchestrator.startUnifiedOrchestration` and closes when `startUnifiedOrchestration` returns. All spans for the flow — bootstrap, node advancements, improvement phase — are children of this root span.

Turn-level spans are children of the node-level span. OTel's `AsyncLocalStorage`-based context propagation makes this automatic: no span context needs to be threaded through function parameters.

### Span hierarchy (complete)

```
flow.run                                         [FlowOrchestrator.startUnifiedOrchestration]
├── bootstrap.session                            [bootstrap while-loop, before flowRun established]
│   ├── session.turn × N                         [each runInteractiveSession call in bootstrap]
│   │   ├── llm.gateway.execute_turn
│   │   │   └── provider.execute_turn × rounds
│   │   └── handoff.parse
│   └── tool_trigger.execute                     [START event, after workflow validates]
├── flow.node.advance × N                        [FlowOrchestrator.advanceFlow per node]
│   ├── session.turn × M                         [runInteractiveSession per retry or human loop]
│   │   ├── llm.gateway.execute_turn
│   │   │   └── provider.execute_turn × rounds
│   │   └── handoff.parse
│   └── improvement.orchestrate                  [if forward-pass-closed signal received]
│       ├── improvement.meta_analysis.step × K   [per backward-pass plan step group]
│       │   └── session.turn × roles in group
│       │       └── llm.gateway.execute_turn
│       └── improvement.synthesis
│           └── session.turn
│               └── llm.gateway.execute_turn
└── tool_trigger.execute                         [TERMINAL_FORWARD_PASS, in applyHandoffAndAdvance]
```

**Notes:**
- The `bootstrap.session` span wraps the `while (true)` loop in `startUnifiedOrchestration` that executes before `flowRun` is established.
- `tool_trigger.execute` for the START event is a child of `bootstrap.session`.
- `tool_trigger.execute` for TERMINAL_FORWARD_PASS is a child of the active `flow.node.advance` span, created in `applyHandoffAndAdvance` when `outgoingEdges.length === 0`.
- `handoff.parse` is a child of `session.turn`. It is called inside `runInteractiveSession`, so the `session.turn` span must be active when `HandoffInterpreter.parse` is called.
- Meta-analysis sessions do not have a `handoff.parse` child because they emit typed signals (`meta-analysis-complete`), not routing handoffs parsed by `HandoffInterpreter`.

### Span definitions

#### `flow.run`

Created in `FlowOrchestrator.startUnifiedOrchestration` — first action after `SessionStore.init()`.
Closed in `FlowOrchestrator.startUnifiedOrchestration` — in a `finally` block.
Kind: `SpanKind.INTERNAL`.

**Attributes set at creation:**

| Attribute | Type | Value |
|---|---|---|
| `flow.id` | string | `"pending"` — updated via `span.setAttribute('flow.id', flowRun.flowId)` once `flowRun` is established |
| `flow.resumed` | boolean | `true` if `SessionStore.loadFlowRun()` returned non-null; `false` if bootstrap begins |

**Attributes set on completion:**

| Attribute | Type | Value |
|---|---|---|
| `flow.project_namespace` | string | `flowRun.projectNamespace` (set once established) |
| `flow.status` | string | Final `flowRun.status` |

**Events:**

| Event name | When | Additional attributes |
|---|---|---|
| `flow.started` | Immediately after span creation | `flow.resumed` |
| `store.flow_loaded` | When `SessionStore.loadFlowRun()` returns non-null | `flow.id` |
| `flow.bootstrapping` | When bootstrap loop begins | — |
| `flow.established` | When `flowRun` is created after successful bootstrap | `flow.id`, `record_folder_path` (repo-relative: `path.relative(workspaceRoot, recordFolderPath)`) |

**Error recording:** If an unhandled error propagates out of `startUnifiedOrchestration`, call `span.recordException(e)` and `span.setStatus({ code: SpanStatusCode.ERROR, message: e.message })` before the finally block closes the span.

#### `bootstrap.session`

Created in `FlowOrchestrator.startUnifiedOrchestration` — when bootstrap loop begins (no prior `flowRun`).
Closed on `break` from the bootstrap loop (after `SessionStore.saveFlowRun`).
Kind: `SpanKind.INTERNAL`.

**Attributes set at creation:**

| Attribute | Type | Value |
|---|---|---|
| `role_key` | string | `roleKey` parameter |

**Attributes set on completion:**

| Attribute | Type | Value |
|---|---|---|
| `bootstrap.retry_count` | int | Number of loop iterations before break |
| `bootstrap.workflow_path` | string | Repo-relative path to `workflow.md` once established |

**Events:**

| Event name | When | Additional attributes |
|---|---|---|
| `bootstrap.workflow_not_found` | When workflow.md is not found and error is injected into bootstrap history | `record_folder_path` |
| `bootstrap.workflow_parse_failed` | When `parseWorkflow` throws and error is injected | `error_message` |
| `bootstrap.tool_trigger_failed` | When `ToolTriggerEngine.evaluateAndTrigger` throws and error is injected | `error_message` |

**Error recording:** Bootstrap errors that cause loop iteration are recorded as span events (the loop retries). Only unhandled exceptions propagating out of the loop set span status to ERROR via `span.recordException(e)` and `span.setStatus({ code: SpanStatusCode.ERROR })`.

#### `flow.node.advance`

Created in `FlowOrchestrator.advanceFlow` — first action.
Closed in `FlowOrchestrator.advanceFlow` — in a `finally` block.
Kind: `SpanKind.INTERNAL`.

**Attributes set at creation:**

| Attribute | Type | Value |
|---|---|---|
| `flow.id` | string | `flowRun.flowId` |
| `node.id` | string | `nodeId` parameter |
| `role` | string | `currentNodeDef.role` (resolved from workflow graph after `parseWorkflow`) |
| `role_key` | string | `roleKey` (constructed as `${flowRun.projectNamespace}__${currentNodeDef.role}`) |
| `session.id` | string | `sessionId` (constructed as `${flowRun.flowId}__${nodeId}`) |
| `node.session_resumed` | boolean | `true` if `SessionStore.loadRoleSession` returned non-null |
| `node.artifact_count` | int | Count of `resolvedArtifacts` |

**Attributes set on completion:**

| Attribute | Type | Value |
|---|---|---|
| `node.outcome` | string | One of: `"handoff"`, `"forward_pass_closed"`, `"awaiting_human"`, `"null_return"`, `"error"` |
| `handoff.kind` | string | Present when `node.outcome = "handoff"`: populated from `applyHandoffAndAdvance` result |
| `flow.awaiting_human` | boolean | `true` when `flowRun.status` is set to `"awaiting_human"` |

**Events:**

| Event name | When | Additional attributes |
|---|---|---|
| `store.session_loaded` | After `SessionStore.loadRoleSession` call | `session.id`, `session.resumed` (bool) |
| `store.flow_saved` | After each `SessionStore.saveFlowRun` call that changes flow status | `flow.status` |
| `store.session_saved` | After `SessionStore.saveRoleSession` | `session.id` |
| `store.turn_saved` | After `SessionStore.saveTurnRecord` | `session.id`, `turn_number` |
| `handoff.parse_error_injected` | When `HandoffParseError` or `WorkflowError` is caught and injected into history | `error_type` (`'HandoffParseError'` or `'WorkflowError'`), `error_message` (first 500 chars) |
| `node.awaiting_human_suspended` | When `flowRun.status` is set to `"awaiting_human"` | `suspension_reason`: `"prompt_human_signal"` (when `handoffResult.kind === 'awaiting_human'`) or `"null_session_return"` (when `handoffResult` is null) |
| `human_input.received` | After `readHumanInput` returns a non-null string | — |
| `human_input.exit` | When `readHumanInput` returns null | — |

**Error recording:** Errors not of type `HandoffParseError` or `WorkflowError` that propagate out of `advanceFlow` call `span.recordException(e)` and `span.setStatus({ code: SpanStatusCode.ERROR, message: e.message })`.

#### `session.turn`

Created in `runInteractiveSession` — immediately after the `session` object is created.
Closed in `runInteractiveSession` — in a `finally` block, before returning.
Kind: `SpanKind.INTERNAL`.

**Attributes set at creation:**

| Attribute | Type | Value |
|---|---|---|
| `session.id` | string | `session.sessionId` |
| `role_key` | string | `roleKey` parameter |
| `autonomous` | boolean | `autonomous` parameter |

**Attributes set on completion:**

| Attribute | Type | Value |
|---|---|---|
| `session.turn.outcome` | string | One of: `"handoff"`, `"awaiting_human"`, `"aborted"`, `"null_return"`, `"error"` |
| `session.turn.history_length` | int | `history.length` at function return |

**Events:**

| Event name | When | Additional attributes |
|---|---|---|
| `session.turn.aborted` | When `LLMGatewayError` with `type === 'ABORTED'` is caught | `partial_text_available`: boolean (true if `error.partialText` is non-empty) |
| `session.turn.handoff_detected` | When `HandoffInterpreter.parse` returns successfully | `handoff_kind` |
| `session.turn.auth_error` | When `LLMGatewayError` with `type === 'AUTH_ERROR'` is caught | — |

**Modal symmetry declaration:** The `session.turn` span applies identically to both autonomous and interactive execution paths. In autonomous mode, the span covers a single turn (one `executeTurn` call plus handoff parse attempt) and closes when `runInteractiveSession` returns or throws. In interactive mode, the span covers the entire readline conversation loop and closes when the loop exits (handoff found, user exits, or unhandled error). The `autonomous` attribute distinguishes modes in trace analysis. There are no span operations that apply to only one mode.

**Out-parameter mutation note:** `runInteractiveSession` mutates `providedHistory` (out-parameter) when ABORTED — partial text is pushed to `providedHistory` before returning null. Telemetry does not alter this behavior; the `session.turn.aborted` event is emitted after the mutation, not before.

**Error recording:** `LLMGatewayError` cases that cause a `null` return (ABORTED, AUTH_ERROR) are recorded as span events, not as span status errors. Only errors that propagate out of `runInteractiveSession` as unhandled exceptions set span status to ERROR.

#### `llm.gateway.execute_turn`

Created in `LLMGateway.executeTurn` — first action.
Closed in `LLMGateway.executeTurn` — in a `finally` block.
Kind: `SpanKind.CLIENT`.

**Attributes set at creation:**

| Attribute | Type | Value |
|---|---|---|
| `llm.provider` | string | `process.env.LLM_PROVIDER ?? 'anthropic'` |
| `llm.tools_enabled` | boolean | `true` if `this.tools` is populated |
| `llm.message_count` | int | `messageHistory.length` |

**Attributes set on completion:**

| Attribute | Type | Value |
|---|---|---|
| `llm.tool_round_count` | int | Number of tool-call rounds executed (0 if no tools or no tool calls occurred) |
| `llm.input_tokens` | int | Accumulated `accInputTokens` (0 if no usage data available) |
| `llm.output_tokens` | int | Accumulated `accOutputTokens` (0 if no usage data available) |

**Events:**

| Event name | When | Additional attributes |
|---|---|---|
| `llm.tool_round` | At the start of each tool-call round, when `result.type === 'tool_calls'` | `round_index` (0-based), `tool_call_count` |
| `llm.tool_call` | Per tool call within a round | `tool_name`, `tool_path` (value of `call.input?.path` as string if present; omit if absent) |
| `llm.max_rounds_exceeded` | When `MAX_TOOL_ROUNDS` is reached | `rounds: 50` |

**Error recording:** All `LLMGatewayError` types that propagate out of `executeTurn` call `span.recordException(e)` and `span.setStatus({ code: SpanStatusCode.ERROR, message: e.type })`.

#### `provider.execute_turn`

Created in `AnthropicProvider.executeTurn` and `OpenAICompatibleProvider.executeTurn` — first action.
Closed in each provider's `executeTurn` — in a `finally` block.
Kind: `SpanKind.CLIENT`.

**Attributes set at creation:**

| Attribute | Type | Value |
|---|---|---|
| `provider.name` | string | `'anthropic'` (hardcoded in AnthropicProvider) or `'openai-compatible'` (hardcoded in OpenAICompatibleProvider) |
| `provider.model` | string | `this.model` |
| `provider.tools_count` | int | `tools?.length ?? 0` |
| `provider.message_count` | int | `messages.length` |

**Attributes set on completion:**

| Attribute | Type | Value |
|---|---|---|
| `provider.result_type` | string | `'text'` or `'tool_calls'` |
| `provider.input_tokens` | int | `inputTokens` if captured from the provider response; omit attribute if undefined |
| `provider.output_tokens` | int | `outputTokens` if captured; omit attribute if undefined |
| `provider.stop_reason` | string | `stopReason` (Anthropic) or `finishReason` (OpenAI-compat); omit if null |

**Events:**

| Event name | When emitted | Additional attributes |
|---|---|---|
| `provider.truncated` | When `stopReason === 'max_tokens'` (Anthropic) or `finishReason === 'length'` (OpenAI-compat) | `stop_reason` |
| `provider.tool_use_block_received` | Anthropic only: when `content_block_start` has `block.type === 'tool_use'` | `tool_name` |
| `provider.tool_call_received` | OpenAI-compat only: when a new tool call accumulator entry is initialized (first `tc.id` or `tc.function.name` received for a new index) | `tool_name` (value of `tc.function.name`) |
| `provider.aborted` | When ABORTED — NOT an error event | `partial_text_available`: boolean |

**ABORTED handling (both providers):** When ABORTED, call `span.setStatus({ code: SpanStatusCode.OK })` and emit `provider.aborted` event. Do NOT call `span.recordException`. ABORTED is normal operator behavior, not an error.

**Error recording for all other `LLMGatewayError` types:** Call `span.recordException(e)` and `span.setStatus({ code: SpanStatusCode.ERROR, message: e.type })`.

**Cross-provider symmetry requirement:** Both `AnthropicProvider` and `OpenAICompatibleProvider` must emit every required attribute and event listed above for their respective completion paths. The `provider.name` and `provider.model` values differ; all other required attributes must be present in both implementations. ABORTED handling must be identical in both implementations.

#### `handoff.parse`

Created in `HandoffInterpreter.parse` — first action.
Closed in `HandoffInterpreter.parse` — in a `try/finally` block.
Kind: `SpanKind.INTERNAL`.

**Attributes set at creation:**

| Attribute | Type | Value |
|---|---|---|
| `handoff.text_length` | int | `text.length` |

**Attributes set on completion:**

| Attribute | Type | Value |
|---|---|---|
| `handoff.parse.success` | boolean | `true` on success; `false` on `HandoffParseError` |
| `handoff.result_kind` | string | Present on success: `'targets'`, `'forward-pass-closed'`, `'meta-analysis-complete'`, or `'awaiting_human'` |

**Error recording:** When `HandoffParseError` is thrown, call `span.recordException(e)` and `span.setStatus({ code: SpanStatusCode.ERROR, message: 'HandoffParseError' })` in the catch block, then rethrow. The exception is always rethrown — the span records it but does not suppress it.

**Import note for `handoff.ts`:** `HandoffInterpreter.parse` is a static method called directly from module-level code. The tracer is obtained via `TelemetryManager.getTracer()`. Import `TelemetryManager` from `'./observability.js'`.

#### `tool_trigger.execute`

Created in `ToolTriggerEngine.evaluateAndTrigger` — first action.
Closed in `ToolTriggerEngine.evaluateAndTrigger` — in a `finally` block.
Kind: `SpanKind.INTERNAL`.

**Attributes set at creation:**

| Attribute | Type | Value |
|---|---|---|
| `trigger.event` | string | `event` parameter: `'START'`, `'TERMINAL_FORWARD_PASS'`, or `'INITIALIZATION'` |
| `flow.id` | string | `flowRun.flowId` |

**Attributes set on completion:**

| Attribute | Type | Value |
|---|---|---|
| `trigger.component` | string | `triggerRecord.toolComponent` |
| `trigger.success` | boolean | `true` on success; `false` on exception |
| `trigger.result_summary` | string | `triggerRecord.resultSummary` (first 500 chars) |

**Error recording:** When `ToolTriggerEngine.evaluateAndTrigger` throws, call `span.recordException(e)` and `span.setStatus({ code: SpanStatusCode.ERROR, message: e.message })` before rethrowing. The exception is always rethrown.

#### `improvement.orchestrate`

Created in `ImprovementOrchestrator.handleForwardPassClosure` — first action.
Closed in `ImprovementOrchestrator.handleForwardPassClosure` — in a `finally` block.
Kind: `SpanKind.INTERNAL`.

**Attributes set at creation:**

| Attribute | Type | Value |
|---|---|---|
| `flow.id` | string | `flowRun.flowId` |
| `improvement.record_folder` | string | Repo-relative form of `signal.recordFolderPath`. Compute as `path.relative(flowRun.projectRoot, path.resolve(signal.recordFolderPath))` if absolute; use as-is if already relative |

**Attributes set after mode selection:**

| Attribute | Type | Value |
|---|---|---|
| `improvement.mode` | string | `'graph-based'`, `'parallel'`, or `'none'` |
| `improvement.plan_step_count` | int | `plan.length` (0 if mode is `'none'`) |

**Events:**

| Event name | When | Additional attributes |
|---|---|---|
| `improvement.mode_selected` | After mode selection | `mode` |
| `improvement.step_started` | At start of each `plan[i]` group | `step_index`, `roles_in_group` (comma-separated role names) |
| `improvement.step_completed` | After each `plan[i]` group completes | `step_index` |
| `improvement.synthesis_started` | When synthesis entry is processed | `role_key` |
| `improvement.no_findings_warning` | When a role's expected findings file is not found | `role`, `expected_role` |
| `store.flow_saved` | After each `SessionStore.saveFlowRun` call within improvement | `flow.status` |

**Error recording:** Errors propagating out of `handleForwardPassClosure` call `span.recordException(e)` and `span.setStatus({ code: SpanStatusCode.ERROR, message: e.message })`.

### Payload capture in spans

By default, span attributes and events do not include system prompt content, message content, tool call arguments (beyond `tool_name` and `tool_path`), tool results, or injected context body.

When `A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE=true`, these additional events are added to `session.turn` spans:
- `session.system_prompt` — attribute `content`: first 2000 chars of the system prompt
- `session.user_turn` — per user message in history at turn start; attribute `content`: full message text
- `session.assistant_turn` — per completed assistant response; attribute `content`: full response text

The payload capture guard must be evaluated before any string operations, not after:

```typescript
if (process.env.A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true') {
  span.addEvent('session.system_prompt', { content: systemPrompt.slice(0, 2000) });
}
```

This guard must prevent evaluation of the payload expression, not merely skip the `addEvent` call after constructing the string.

---

## §4 — Metrics Model

### Required Phase 1 counters

All metrics use the `a_society.` prefix. Counter units use the `{flow}`, `{turn}`, `{failure}`, `{token}` convention.

| Metric name | Unit | Description | Dimensions | Emit location |
|---|---|---|---|---|
| `a_society.flow.started` | `{flow}` | Incremented when a flow run begins | `project_namespace` | `FlowOrchestrator.startUnifiedOrchestration`, after `flowRun` is established |
| `a_society.flow.completed` | `{flow}` | Incremented when flow reaches terminal status | `project_namespace`, `status` (`"completed"` / `"failed"` / `"awaiting_human"`) | `FlowOrchestrator.startUnifiedOrchestration`, when main loop exits |
| `a_society.session.turn.started` | `{turn}` | Incremented at start of each `runInteractiveSession` call | `role_key`, `autonomous` (string: `"true"` or `"false"`) | `runInteractiveSession`, at function entry |
| `a_society.handoff.parse_failure` | `{failure}` | Incremented when `HandoffInterpreter.parse` throws `HandoffParseError` | `role_key` — obtain the current role via the active `session.turn` span attribute; if unavailable, use `"unknown"` | `HandoffInterpreter.parse`, in catch block before rethrowing |
| `a_society.provider.token.input` | `{token}` | Input tokens per provider turn | `provider`, `model` | `provider.execute_turn`, on completion (both providers) |
| `a_society.provider.token.output` | `{token}` | Output tokens per provider turn | `provider`, `model` | `provider.execute_turn`, on completion (both providers) |

### Required Phase 1 histograms

| Metric name | Unit | Bucket boundaries | Dimensions | Emit location |
|---|---|---|---|---|
| `a_society.provider.latency` | `ms` | `[50, 100, 250, 500, 1000, 2000, 5000, 10000]` | `provider`, `model` | `provider.execute_turn`, on completion; value = span duration in ms |
| `a_society.session.turn.duration` | `ms` | `[100, 500, 1000, 5000, 10000, 30000, 60000]` | `role_key`, `autonomous` | `runInteractiveSession`, on completion; value = span duration in ms |

### Cardinality notes

- `model` dimension: High cardinality if operators use many model names. In practice, the runtime configures one model per provider via env vars, limiting distinct values to ≤2. Acceptable for Phase 1.
- `role_key` dimension: Bounded by the number of distinct roles (typically ≤10). Acceptable.
- `status` on `a_society.flow.completed`: Three fixed values. No concern.

### Phase 1 omissions and rationale

- **`awaiting_human` suspensions** — Better as `node.awaiting_human_suspended` span events on `flow.node.advance`. Frequency is low and trace context is more informative than a counter.
- **Tool-trigger success/failure** — Better as `trigger.success` span attribute on `tool_trigger.execute`. Low frequency; trace context captures component, event, and error.
- **Improvement phase dedicated metrics** — Flow-level and session-level metrics already cover the improvement phase. Dedicated improvement metrics are deferred.

### Metric correlation to trace model

Metric dimensions align with trace span attributes to enable trace-to-metric correlation:
- `provider` and `model` match `provider.name` and `provider.model` span attributes
- `role_key` matches `role_key` on `session.turn` spans
- `project_namespace` matches `flow.project_namespace` on `flow.run`

---

## §5 — Payload Capture and Privacy Policy

### Safe by default

| Identifier | Safe? | Rationale |
|---|---|---|
| `flow.id` (UUID) | Yes | Random UUID, no PII |
| `session.id` (UUID) | Yes | Random UUID, no PII |
| `role` / `role_key` | Yes | Framework identifiers |
| `node.id` | Yes | Workflow graph identifier |
| `provider` / `model` | Yes | Config values, not secrets |
| `autonomous` (boolean) | Yes | Execution mode flag |
| `handoff.kind` / `handoff.result_kind` | Yes | Framework signal type |
| `trigger.event` / `trigger.component` | Yes | Framework identifiers |
| `improvement.mode` | Yes | Operator-selected value |
| Token counts | Yes | Usage integers, no content |
| Repo-relative `artifact_path` values | Yes | See rule below |

**Repo-relative path rule:** Artifact paths that are repo-relative (e.g., `a-society/a-docs/records/...`) are safe to emit as span attributes. They are derived from operator-provided workspace root, do not expose system paths, and are the natural identifier for tracing record-folder activity.

**Absolute path rule:** `flowRun.projectRoot` and `flowRun.recordFolderPath` are absolute OS paths. Do not emit them as span attributes. When a span attribute requires a path reference, use the repo-relative form. For `improvement.record_folder`, compute `path.relative(flowRun.projectRoot, path.resolve(signal.recordFolderPath))` if the value is absolute. For `bootstrap.workflow_path`, use the value relative to `workspaceRoot`.

### Not safe by default

The following are never emitted unless `A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE=true`:
- System prompt content (injected context bundle)
- User message content
- Assistant response content
- Tool call arguments (beyond `tool_name` and `tool_path`)
- Tool result content (`FileToolExecutor` result bodies)

### Opt-in payload capture

**Enablement:** `A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE=true`. Default: `false`.

**Scope when enabled:** Adds three event types to `session.turn` spans only:
- `session.system_prompt` — attribute `content`: first 2000 chars of the system prompt
- `session.user_turn` — per user message at turn start; attribute `content`: full text
- `session.assistant_turn` — per completed assistant response; attribute `content`: full text

Tool call arguments and results are NOT included even in opt-in mode.

### GenAI semantic conventions

The OpenTelemetry GenAI semantic conventions (`@opentelemetry/semantic-conventions/incubating`) are currently experimental and subject to breaking changes.

**Phase 1 policy:** GenAI semantic conventions are NOT required in Phase 1. Use the attribute names specified in this advisory. These names are the runtime's own stable schema. A future advisory may migrate to GenAI convention names if A-Society's observability tooling integrates with backends that depend on the standardized spec. If the Developer chooses to use the `@opentelemetry/semantic-conventions` package for resource attribute keys (`SEMRESATTRS_SERVICE_NAME`, etc.), they may do so — those are in the stable package and do not require the `incubating` path.

---

## §6 — Testing and Validation Seam

### In-memory exporter approach

Tests use `InMemorySpanExporter` from `@opentelemetry/sdk-trace-base`. This exporter collects all finished spans in memory, enabling programmatic assertion on span names, attributes, and events without a running backend.

`TelemetryManager.initForTest(traceExporter: SpanExporter)` is the test entry point. It shuts down any prior SDK, resets singleton state, and initializes a new `NodeSDK` with the provided exporter. Tests call this in their setup with `new InMemorySpanExporter()`.

### Test helper module: `a-society/runtime/test/telemetry-test-helper.ts`

This file must export:

```typescript
// Initializes TelemetryManager with InMemorySpanExporter for test use.
// Safe to call multiple times — reinitializes on each call.
// Returns the exporter for span assertions.
export function setupTestTelemetry(): InMemorySpanExporter

// Clears all spans from the exporter. Call between individual tests.
export function clearTestSpans(exporter: InMemorySpanExporter): void

// Returns all finished spans matching the given span name.
export function getSpansByName(exporter: InMemorySpanExporter, name: string): ReadableSpan[]

// Returns the first finished span matching the given name.
// Throws with a descriptive message if no matching span is found.
export function getSpan(exporter: InMemorySpanExporter, name: string): ReadableSpan

// Returns all events on a span matching the given event name.
export function getEvents(span: ReadableSpan, eventName: string): TimedEvent[]
```

Imports required in `telemetry-test-helper.ts`:
- `InMemorySpanExporter`, `ReadableSpan` from `@opentelemetry/sdk-trace-base`
- `TimedEvent` from `@opentelemetry/sdk-trace-base`
- `TelemetryManager` from `'../src/observability.js'`
- `SpanExporter` from `@opentelemetry/api`

### Required test scenarios: `a-society/runtime/test/observability.test.ts`

Five named test scenarios, each using the mock HTTP server pattern from `a-society/runtime/test/integration/unified-routing.test.ts` for provider mocking. Each test calls `setupTestTelemetry()` in setup.

| Scenario | Spans and assertions required |
|---|---|
| **Successful node handoff** | Assert: `flow.node.advance` with `node.outcome = "handoff"`, `handoff.kind` present; `session.turn` child with `session.turn.outcome = "handoff"`; `handoff.parse` grandchild with `handoff.parse.success = true`. |
| **Prompt-human suspension** | Assert: `flow.node.advance` with `node.outcome = "awaiting_human"`, event `node.awaiting_human_suspended` with `suspension_reason = "prompt_human_signal"`; `session.turn` with `session.turn.outcome = "awaiting_human"`. |
| **Provider tool-call round** | Assert: `llm.gateway.execute_turn` with `llm.tool_round_count >= 1`; event `llm.tool_round` with `round_index = 0`; at least two `provider.execute_turn` child spans (one per tool round plus one final text return). |
| **Handoff parse failure path** | Assert: `handoff.parse` with `handoff.parse.success = false` and exception event recorded; `flow.node.advance` with event `handoff.parse_error_injected` present; a second `session.turn` child (retry after error injection). |
| **Forward-pass closure to improvement** | Assert: `improvement.orchestrate` span exists as child of `flow.node.advance`; event `improvement.mode_selected` present; at least one `session.turn` child within improvement.orchestrate. |

All assertions use programmatic span attribute access:

```typescript
const spans = getSpansByName(exporter, 'flow.node.advance');
assert(spans.length >= 1);
assert(spans[0].attributes['node.outcome'] === 'handoff');
```

No screenshots, no Jaeger/Tempo UI, no third-party inspection required.

---

## §7 — Operator Surface

### Telemetry environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `A_SOCIETY_TELEMETRY_ENABLED` | No | enabled | Set to `'false'` to disable telemetry entirely. No-op tracer, zero overhead, no output. |
| `A_SOCIETY_OTLP_ENDPOINT` | No | — | OTLP/HTTP endpoint base URL (e.g., `http://localhost:4318`). Absent = telemetry active but spans discarded. |
| `A_SOCIETY_OTLP_HEADERS` | No | — | Comma-separated `key=value` HTTP headers for OTLP requests (e.g., `x-api-key=abc,x-tenant=foo`). |
| `A_SOCIETY_ENV` | No | `development` | Deployment environment label; emitted as `deployment.environment` resource attribute. |
| `A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE` | No | `false` | Set to `'true'` to enable opt-in prompt/completion capture in `session.turn` spans. |

### Local development setup

**Option A — Jaeger all-in-one (traces only, zero configuration):**
```bash
docker run --rm -p 16686:16686 -p 4318:4318 jaegertracing/all-in-one:latest
```
Set `A_SOCIETY_OTLP_ENDPOINT=http://localhost:4318`. View traces at `http://localhost:16686`. Service name: `a-society-runtime`.

**Option B — Grafana + Tempo (traces + metrics):**
Use the official Grafana LGTM docker-compose stack. Set `A_SOCIETY_OTLP_ENDPOINT=http://localhost:4318`. Traces visible in Tempo; metrics in Prometheus/Grafana.

**Option C — OTel Collector with console exporter (no backend required):**
Configure a local OTel Collector with a `logging` or `debug` exporter. The collector prints span summaries to the terminal. Useful when no backend is available.

### LangSmith as OTLP destination

LangSmith accepts OTLP/HTTP trace ingest at `https://api.smith.langchain.com/otel`.

```bash
A_SOCIETY_OTLP_ENDPOINT=https://api.smith.langchain.com/otel
A_SOCIETY_OTLP_HEADERS=x-api-key=<LANGSMITH_API_KEY>
```

Traces appear in the LangSmith dashboard under service name `a-society-runtime`. Note: LangSmith's OTLP ingest may not support metrics export in all configurations. If metrics export errors appear in the runtime logs, route metrics to a separate backend by running an OTel Collector between the runtime and LangSmith.

### Terminal behavior for telemetry configuration errors

All telemetry startup warnings are emitted by `TelemetryManager.init()` in `src/observability.ts`. No other module emits telemetry-related warnings. This prevents duplicate messages from the same failure path.

- `A_SOCIETY_OTLP_HEADERS` malformed: `[a-society-runtime] Telemetry warning: A_SOCIETY_OTLP_HEADERS could not be parsed — proceeding without headers.`
- SDK initialization throws: `[a-society-runtime] Telemetry warning: SDK initialization failed — telemetry is inactive. Error: <message>`
- `A_SOCIETY_TELEMETRY_ENABLED=false`: No message.
- `A_SOCIETY_OTLP_ENDPOINT` absent: No message.
- Endpoint unreachable at runtime: OTel SDK retries silently; no additional runtime warning.

Telemetry failures never terminate the runtime. All telemetry errors are isolated.

---

## §8 — Files Changed

| File | Action | Required behavioral changes |
|---|---|---|
| `a-society/runtime/src/observability.ts` | Create (new) | Implement `TelemetryManager` static class with `init()`, `initForTest(traceExporter)`, `shutdown()`, `getTracer()`, `getMeter()`. Idempotency guard on `init()`. Reset-before-reinit in `initForTest()`. Bootstrap logic per §2: env var reading (`A_SOCIETY_TELEMETRY_ENABLED`, `A_SOCIETY_OTLP_ENDPOINT`, `A_SOCIETY_OTLP_HEADERS`, `A_SOCIETY_ENV`), OTLP/HTTP exporter construction, no-export fallback when endpoint absent, `NodeSDK` construction with `instrumentations: []`, `sdk.start()` with error catch and stderr warning, SIGTERM and beforeExit shutdown handlers. `parseOtlpHeaders()` helper with malformed-input warning to stderr per §2. No startup message when disabled or endpoint absent. Required imports: `NodeSDK` from `@opentelemetry/sdk-node`; `OTLPTraceExporter` from `@opentelemetry/exporter-trace-otlp-proto`; `OTLPMetricExporter` from `@opentelemetry/exporter-metrics-otlp-proto`; `PeriodicExportingMetricReader` from `@opentelemetry/sdk-metrics`; `Resource` from `@opentelemetry/resources`; `SEMRESATTRS_SERVICE_NAME`, `SEMRESATTRS_SERVICE_VERSION`, `SEMRESATTRS_SERVICE_NAMESPACE` from `@opentelemetry/semantic-conventions`; `trace`, `metrics`, `Tracer`, `Meter`, `SpanExporter` from `@opentelemetry/api`. |
| `a-society/runtime/bin/a-society.ts` | Modify | Add `import { TelemetryManager } from '../src/observability.js'` after the `dotenv` config block (lines 1–3). Call `TelemetryManager.init()` synchronously immediately after dotenv, before `discoverProjects`. In the `main()` catch or finally block, add `await TelemetryManager.shutdown()`. Non-happy-path behavior: if `TelemetryManager.init()` throws (it must not per §2, but as a safety net), catch and log to stderr; do not halt startup. |
| `a-society/runtime/src/cli.ts` | Modify | Add `import { TelemetryManager } from './observability.js'` after the `dotenv` config block (lines 1–3). Call `TelemetryManager.init()` synchronously after dotenv, before `SessionStore.init()`. No explicit shutdown call needed — the `beforeExit` handler registered by `TelemetryManager.init()` handles shutdown for `cli.ts`'s execution path. |
| `a-society/runtime/src/orchestrator.ts` | Modify | Add `import { TelemetryManager } from './observability.js'` and `import { SpanStatusCode, SpanKind } from '@opentelemetry/api'`. In `startUnifiedOrchestration`: wrap entire body in `TelemetryManager.getTracer().startActiveSpan('flow.run', ...)` per §3; `flow.id = "pending"` at creation, updated once `flowRun` established; `flow.resumed` attribute; all events per §3 (`flow.started`, `store.flow_loaded`, `flow.bootstrapping`, `flow.established`); final `flow.status` attribute set before span closes; unhandled exception recording per §3; close in `finally`. Wrap bootstrap while-loop in `bootstrap.session` child span per §3; bootstrap error events per §3 (NOT span status errors); retry count and workflow path attributes set before closing. In `advanceFlow`: wrap entire body in `flow.node.advance` span per §3; all creation attributes (note: `role` attribute is available only after `parseWorkflow` resolves `currentNodeDef`, so it must be set after that line via `span.setAttribute`); all span events per §3 (`store.session_loaded`, `store.flow_saved`, `store.session_saved`, `store.turn_saved`, `handoff.parse_error_injected`, `node.awaiting_human_suspended`, `human_input.received`, `human_input.exit`); `node.outcome` and `flow.awaiting_human` attributes set before closing; unhandled exception recording per §3; close in `finally`. Non-happy-path: `HandoffParseError` and `WorkflowError` caught in the inner while-loop must emit `handoff.parse_error_injected` event before continuing; `awaiting_human` suspension paths must emit `node.awaiting_human_suspended` event with correct `suspension_reason`. In `applyHandoffAndAdvance`: when `outgoingEdges.length === 0`, create and await `tool_trigger.execute` span (delegated to `ToolTriggerEngine.evaluateAndTrigger` which owns its own span — the span is created inside that method, not here). Counter increment for `a_society.flow.started` and `a_society.flow.completed` metrics added to `startUnifiedOrchestration`. |
| `a-society/runtime/src/orient.ts` | Modify | Add `import { TelemetryManager } from './observability.js'` and `import { SpanStatusCode } from '@opentelemetry/api'`. In `runInteractiveSession`: wrap entire function body in `TelemetryManager.getTracer().startActiveSpan('session.turn', ...)` per §3; `session.id`, `role_key`, `autonomous` attributes at creation; `session.turn.outcome` and `session.turn.history_length` set before closing; all events per §3 (`session.turn.aborted`, `session.turn.handoff_detected`, `session.turn.auth_error`); payload capture guard per §5 (check `A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE === 'true'` before emitting `session.system_prompt`, `session.user_turn`, `session.assistant_turn` events — guard must prevent string evaluation, not just skip `addEvent`); unhandled exception recording for exceptions that propagate out; close in `finally`. Modal symmetry: span opens and closes for both `autonomous = true` and `autonomous = false` paths with identical attribute/event logic. Out-parameter contract: existing `providedHistory` mutation on ABORTED path is unchanged; `session.turn.aborted` event is emitted after mutation. Counter increment for `a_society.session.turn.started` metric at function entry. |
| `a-society/runtime/src/llm.ts` | Modify | Add `import { TelemetryManager } from './observability.js'` and `import { SpanStatusCode, SpanKind } from '@opentelemetry/api'`. In `LLMGateway.executeTurn`: wrap entire body in `llm.gateway.execute_turn` span (Kind: `SpanKind.CLIENT`) per §3; `llm.provider`, `llm.tools_enabled`, `llm.message_count` at creation; `llm.tool_round_count`, `llm.input_tokens`, `llm.output_tokens` set before closing; `llm.tool_round` event per round when `result.type === 'tool_calls'`; `llm.tool_call` event per call in each round; `llm.max_rounds_exceeded` event when max rounds hit; `LLMGatewayError` exception recording per §3; close in `finally`. |
| `a-society/runtime/src/providers/anthropic.ts` | Modify | Add `import { TelemetryManager } from '../observability.js'` and `import { SpanStatusCode, SpanKind } from '@opentelemetry/api'`. In `AnthropicProvider.executeTurn`: wrap entire body in `provider.execute_turn` span (Kind: `SpanKind.CLIENT`, `provider.name = 'anthropic'`) per §3; all required creation attributes; `provider.result_type`, `provider.input_tokens`, `provider.output_tokens`, `provider.stop_reason` set before closing; `provider.truncated` event when `stopReason === 'max_tokens'`; `provider.tool_use_block_received` event per tool-use block start in streaming loop; ABORTED: `SpanStatusCode.OK` + `provider.aborted` event, NOT `recordException`; all other `LLMGatewayError`: `recordException` + `SpanStatusCode.ERROR`; close in `finally`. Counter increments for `a_society.provider.token.input` and `a_society.provider.token.output` metrics on completion. Histogram observation for `a_society.provider.latency` on completion. |
| `a-society/runtime/src/providers/openai-compatible.ts` | Modify | Add `import { TelemetryManager } from '../observability.js'` and `import { SpanStatusCode, SpanKind } from '@opentelemetry/api'`. In `OpenAICompatibleProvider.executeTurn`: wrap entire body in `provider.execute_turn` span (Kind: `SpanKind.CLIENT`, `provider.name = 'openai-compatible'`) per §3; all required creation attributes; `provider.result_type`, `provider.input_tokens`, `provider.output_tokens`, `provider.stop_reason` set before closing; `provider.truncated` event when `finishReason === 'length'`; `provider.tool_call_received` event per new tool call accumulator entry; ABORTED: `SpanStatusCode.OK` + `provider.aborted` event, NOT `recordException`; all other `LLMGatewayError`: `recordException` + `SpanStatusCode.ERROR`; close in `finally`. Counter increments for `a_society.provider.token.input` and `a_society.provider.token.output` on completion. Histogram observation for `a_society.provider.latency` on completion. Cross-provider symmetry: every required attribute and event from §3 must be present (see Anthropic row for the required set). |
| `a-society/runtime/src/handoff.ts` | Modify | Add `import { TelemetryManager } from './observability.js'` and `import { SpanStatusCode } from '@opentelemetry/api'`. In `HandoffInterpreter.parse`: wrap entire body in `handoff.parse` span per §3; `handoff.text_length` at creation; `handoff.parse.success` and `handoff.result_kind` set before closing; on `HandoffParseError`: `span.recordException(e)`, `span.setStatus({ code: SpanStatusCode.ERROR })`, then rethrow; span must close in a `finally` block to ensure closure on both success and exception paths. Counter increment for `a_society.handoff.parse_failure` metric in the `HandoffParseError` catch block, before rethrowing. |
| `a-society/runtime/src/store.ts` | No change | Store I/O telemetry requirement is satisfied via span events emitted by callers in `orchestrator.ts` and `improvement.ts`. This avoids introducing an OTel import into `store.ts` and concentrates telemetry concern in the orchestration layer. All store operations that are diagnostically meaningful are covered by events on the enclosing `flow.node.advance` or `improvement.orchestrate` spans. |
| `a-society/runtime/src/triggers.ts` | Modify | Add `import { TelemetryManager } from './observability.js'` and `import { SpanStatusCode } from '@opentelemetry/api'`. In `ToolTriggerEngine.evaluateAndTrigger`: wrap entire body in `tool_trigger.execute` span per §3; `trigger.event` and `flow.id` at creation; `trigger.component`, `trigger.success`, `trigger.result_summary` (first 500 chars) set before closing; unhandled exception: `recordException` + `SpanStatusCode.ERROR` before rethrowing; close in `finally`. |
| `a-society/runtime/src/improvement.ts` | Modify | Add `import { TelemetryManager } from './observability.js'` and `import { SpanStatusCode } from '@opentelemetry/api'`. In `ImprovementOrchestrator.handleForwardPassClosure`: wrap entire body in `improvement.orchestrate` span per §3; `flow.id` and `improvement.record_folder` (repo-relative path per §5 absolute path rule) at creation; `improvement.mode` and `improvement.plan_step_count` set after mode selection; all events per §3 (`improvement.mode_selected`, `improvement.step_started`, `improvement.step_completed`, `improvement.synthesis_started`, `improvement.no_findings_warning`, `store.flow_saved` per saveFlowRun call); unhandled exception recording per §3; close in `finally`. |
| `a-society/runtime/src/types.ts` | No change | No new types required. Telemetry configuration is read entirely from environment variables in `observability.ts`. The existing `FlowRun`, `RoleSession`, `TurnRecord`, and other types do not need telemetry fields. |
| `a-society/runtime/package.json` | Modify | Add to `dependencies`: `"@opentelemetry/api": "^1.7.0"`, `"@opentelemetry/sdk-node": "^0.51.0"`, `"@opentelemetry/sdk-trace-base": "^1.24.0"`, `"@opentelemetry/exporter-trace-otlp-proto": "^0.51.0"`, `"@opentelemetry/exporter-metrics-otlp-proto": "^0.51.0"`, `"@opentelemetry/resources": "^1.24.0"`, `"@opentelemetry/semantic-conventions": "^1.24.0"`. Note: `0.x` version numbers for OTel SDK packages reflect the OTel JS project's versioning convention for experimental-status packages (following the OTel spec stabilization cadence); this is normal and production-stable. The Developer must run `npm install` and verify resolved versions before implementation. If any package cannot be resolved at the specified semver range, resolve against the nearest higher version and note the deviation. |
| `a-society/runtime/INVOCATION.md` | Modify | Add a new section `## Telemetry and Observability` after the existing `## Configuration and Errors` section. The new section must contain: (1) a table of all five telemetry env vars from §7 with required/optional, default, and description columns; (2) the three local development setup options from §7 with exact docker/config commands; (3) the LangSmith OTLP destination setup from §7 with exact env var values; (4) the terminal behavior for telemetry errors from §7; (5) the payload capture opt-in from §7. |
| `a-society/runtime/test/telemetry-test-helper.ts` | Create (new) | Implement the five helper functions per §6: `setupTestTelemetry()`, `clearTestSpans()`, `getSpansByName()`, `getSpan()` (throws if no match), `getEvents()`. Required imports: `InMemorySpanExporter`, `ReadableSpan`, `TimedEvent` from `@opentelemetry/sdk-trace-base`; `SpanExporter` from `@opentelemetry/api`; `TelemetryManager` from `'../src/observability.js'`. |
| `a-society/runtime/test/observability.test.ts` | Create (new) | Implement the five test scenarios from §6 (successful node handoff, prompt-human suspension, provider tool-call round, handoff parse failure path, forward-pass closure to improvement). Each scenario: calls `setupTestTelemetry()` in setup, uses mock HTTP server pattern per `unified-routing.test.ts`, runs the relevant orchestrator or session method, asserts on spans and attributes via test helper functions. All assertions are programmatic. Non-happy-path behaviors that appear only in §3–§6 prose (error injection, awaiting_human suspension, parse failure) must each have a dedicated named assertion, not only the happy-path span check. |

---

## Record-Folder Requirement Exemption

This advisory does not establish any new record-folder schema requirements. No bootstrapping exemption note is needed.

## Coupling Map Consultation

This advisory instruments the runtime layer. It does not modify any tooling component (Components 1–6). `ToolTriggerEngine` invokes tooling components; this advisory adds spans around those invocations but does not alter the tooling interface or output format. Coupling map consultation is not triggered for this advisory.

---

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260408-runtime-observability-foundation/03-ta-phase0-design.md
```
