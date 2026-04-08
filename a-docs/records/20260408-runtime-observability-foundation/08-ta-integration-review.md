**Subject:** Runtime Observability Foundation — TA Integration Review
**Type:** Technical Architect → Owner
**Date:** 2026-04-08
**Flow:** `20260408-runtime-observability-foundation`
**Reviewed against:** `05-ta-phase0-design-revised.md`

---

## Decision

**REVISE.** The implementation delivers a working observability substrate and the `session.interaction` / `session.turn` two-level model is correctly implemented in `orient.ts`. However, three blocking findings prevent approval: the test coverage required by the spec is largely absent, the test infrastructure has a state-isolation defect that makes the test helper unreliable for multi-scenario use, and `triggers.ts` and `improvement.ts` were not instrumented despite being required by the spec. Eight additional non-blocking deviations are documented for the Developer to correct in the same revision pass.

---

## Blocking Findings

### B1 — Test coverage: three of five required scenarios absent; "Next Steps" defers required work

The spec required five named test scenarios in `observability.test.ts`:

1. Successful node handoff
2. Prompt-human suspension
3. Provider tool-call round
4. Handoff parse failure path
5. Forward-pass closure to improvement

The implementation contains three tests: Sanity (not in the spec but acceptable as an addition), Handoff Parse, and Parse Failure. Scenarios 1, 2, 3, and 5 are absent. The integration record lists them under "Next Steps."

This is not acceptable. The stated reason for this entire flow was to make the runtime observable enough to test effectively. The five required scenarios are the primary deliverable of the test seam — they cover the orchestration layer, the prompt-human loop, the provider tool-call path, and the improvement phase. The implementation delivers only the `handoff.parse` unit path. The orchestration layer has no automated telemetry assertions.

The Developer must implement all five scenarios before re-submission. The mock HTTP server pattern from `a-society/runtime/test/integration/unified-routing.test.ts` is already available as the model.

### B2 — `initForTest` state isolation defect: `shutdown()` is a no-op after `initForTest`

The `shutdown()` method only acts when `this.instance !== null`:

```typescript
static async shutdown(): Promise<void> {
  if (this.instance) {          // ← guards the reset
    await this.instance.shutdown();
    this.instance = null;
    this.tracer = null;
    this.meter = null;
  }
}
```

After `initForTest`, `this.instance` is null (the method uses `BasicTracerProvider`, not `NodeSDK`, and never assigns to `this.instance`). This means:

- `shutdown()` called after `initForTest` is a no-op.
- `this.tracer` is never reset to null between test runs.
- `getTracer()` returns the stale test tracer on all subsequent calls.
- If `initForTest` is called again, `await this.shutdown()` does nothing, and the prior `BasicTracerProvider` registration is not cleaned up before a new one registers.

The spec required: "Reset the singleton state before reinitializing." The reset does not execute when `this.instance` is null.

**Required fix:** `shutdown()` must reset `this.tracer` and `this.meter` unconditionally, not only when `this.instance` is non-null:

```typescript
static async shutdown(): Promise<void> {
  if (this.instance) {
    await this.instance.shutdown();
    this.instance = null;
  }
  this.tracer = null;
  this.meter = null;
}
```

Additionally, `initForTest` must track the `BasicTracerProvider` instance so that repeated calls can clean it up. The simplest approach: store the provider reference in a separate field (`private static testProvider: BasicTracerProvider | null = null`) and call `testProvider.shutdown()` at the start of `initForTest`.

### B3 — `triggers.ts` and `improvement.ts` not instrumented

The spec required `tool_trigger.execute` spans in `triggers.ts` and `improvement.orchestrate` spans (with step events) in `improvement.ts`. Neither file was modified. Both still lack any OTel import.

`triggers.ts` is invoked at START (bootstrap) and TERMINAL_FORWARD_PASS (end of forward pass) — two of the most diagnostically important moments in the flow. Without `tool_trigger.execute` spans, operators cannot determine from traces whether Component 3 or Component 4 ran, what they validated, or why they failed.

`improvement.ts` is the improvement phase orchestrator. Without `improvement.orchestrate` spans, the backward-pass improvement mode (the runtime's most complex execution path) is completely opaque in traces.

Both files must be instrumented per the spec before re-submission.

---

## Non-Blocking Findings

These must be corrected in the same revision pass but do not independently block approval. They are grouped by file.

### N1 — `observability.ts`: `initForTest` uses `BasicTracerProvider` instead of `NodeSDK`

The Developer used `BasicTracerProvider.register()` instead of `NodeSDK` in `initForTest`, with the stated reason being reliable global state registration in the `tsx` test environment. The deviation is disclosed in the integration record.

`BasicTracerProvider.register()` is an acceptable alternative for the test context — it registers a global tracer provider synchronously without the overhead of SDK service initialization. The deviation is approved as documented. However, the state-isolation defect (B2) must be fixed regardless of which provider is used.

### N2 — `observability.ts`: resource attributes incomplete; `Resource.default().merge()` not used

The spec required four resource attributes: `service.name`, `service.version`, `service.namespace`, and `deployment.environment`. The implementation provides `service.name` and `service.version` but omits `service.namespace: 'a-society'` and `deployment.environment: process.env.A_SOCIETY_ENV ?? 'development'`. An additional non-spec attribute `a_society.framework.version` was added.

The additional attribute is acceptable and useful. The two missing attributes must be added. The `Resource.default().merge(new Resource({...}))` pattern was specified to include Node.js process information automatically; the implementation uses `new Resource(...)` directly, losing process-level resource data. Use the merge pattern.

### N3 — `observability.ts`: startup warning format and `parseHeaders` behavior

**Warning format:** The spec specified `process.stderr.write('[a-society-runtime] Telemetry warning: SDK initialization failed — telemetry is inactive. Error: <message>')`. The implementation uses `console.error('Warning: Failed to start OpenTelemetry SDK:', e)`. Use `process.stderr.write` with the specified prefix for consistency with other runtime stderr output.

**`parseHeaders` behavior:** The spec said: if any entry is malformed, emit one warning to `process.stderr` and return an empty object. The implementation emits a per-entry warning and returns partial headers (valid entries kept, malformed entries skipped). Change to: on first malformed entry, emit the warning and return `{}`. The warning message must be `[a-society-runtime] Telemetry warning: A_SOCIETY_OTLP_HEADERS could not be parsed — proceeding without headers.`

### N4 — `observability.ts`: OTLP exporter package: HTTP/JSON used instead of HTTP/proto

The implementation imports `@opentelemetry/exporter-trace-otlp-http` and `@opentelemetry/exporter-metrics-otlp-http` (JSON encoding). The spec specified `@opentelemetry/exporter-trace-otlp-proto` and `@opentelemetry/exporter-metrics-otlp-proto` (protobuf encoding). The deviation is not reported in the integration record.

Both are OTLP/HTTP and compatible with standard collectors. The spec chose proto for encoding efficiency. Correct to the proto packages, or document the deviation explicitly with a rationale if there is a specific compatibility reason. If the deviation is kept, update `package.json` accordingly.

### N5 — `handoff.ts`: attribute names deviate from spec; `handoff.parse.success` and `handoff.text_length` missing

The spec defined:
- `handoff.text_length` (int) — set at span creation
- `handoff.parse.success` (boolean) — set at completion; `true` on success, `false` on error
- `handoff.result_kind` (string) — set on success

The implementation sets:
- `handoff.result.kind` (note: dot separator, not underscore) — set on success
- No `handoff.parse.success`
- No `handoff.text_length`

The test in `observability.test.ts` asserts `span.attributes['handoff.result.kind']`, which matches the implementation but not the spec. The test will need to be updated when the attribute name is corrected. Required changes:

1. Add `span.setAttribute('handoff.text_length', text.length)` at span creation.
2. Add `span.setAttribute('handoff.parse.success', true)` before `return result`.
3. Add `span.setAttribute('handoff.parse.success', false)` in the catch block.
4. Rename `handoff.result.kind` → `handoff.result_kind`.

### N6 — `llm.ts`: attribute and event names deviate from spec; creation attributes missing

| Spec | Implementation | Status |
|---|---|---|
| `llm.tools_enabled` (bool, creation) | absent | Missing |
| `llm.message_count` (int, creation) | absent | Missing |
| `llm.tool_round_count` (int, completion) | `llm.gateway.tool_rounds` | Wrong name |
| `llm.tool_round` event per round with `round_index` | `llm.gateway.tool_calls_received` event with `count` and `round` | Wrong event name and structure |
| `llm.tool_call` event per individual call with `tool_name`, `tool_path` | absent | Missing |
| `llm.max_rounds_exceeded` event when limit hit | absent | Missing |

Correct all six items. For `llm.tool_call`: emit one event per call in the round, after the `llm.tool_round` event, with attributes `tool_name: call.name` and `tool_path: (call.input?.path as string | undefined)` (omit `tool_path` if not present).

### N7 — `providers/anthropic.ts`: span kind wrong; attribute names deviate; ABORTED handling incomplete

**Span kind:** Implementation uses `SpanKind.SERVER`. Spec requires `SpanKind.CLIENT`. Provider calls are outbound client calls.

**Attribute names:** `provider.usage.input_tokens` / `provider.usage.output_tokens` instead of `provider.input_tokens` / `provider.output_tokens`. Missing creation attributes `provider.tools_count` and `provider.message_count`. Missing completion attribute `provider.result_type` (`'text'` or `'tool_calls'`).

**ABORTED handling:** The spec requires `provider.aborted` as a span *event*, not an attribute, and requires explicitly calling `span.setStatus({ code: SpanStatusCode.OK })`. The implementation sets `span.setAttribute('provider.aborted', true)` and does not set OK status (span status remains UNSET). The `provider.tool_use_block_received` event per tool-use block start is also absent.

`openai-compatible.ts` has the same span kind, attribute naming, and ABORTED handling issues — correct both providers symmetrically. The `provider.tool_call_received` event per new tool call accumulator entry is also absent from `openai-compatible.ts`.

### N8 — `telemetry-test-helper.ts`: class interface instead of spec function interface; `getEvents` not implemented

The spec defined five exported functions. The implementation provides a class with different method signatures. Key divergences:

- `getSpan(exporter, name)` must throw a descriptive message if no span is found. `findSpanByName` returns `undefined`.
- `getEvents(span, eventName)` — not implemented. Required for asserting span events in the five test scenarios.

Implement the module as specified: five exported functions, not a class. The tests should call `getSpan(...)` and get a thrown error rather than a silent `undefined`, and `getEvents(span, name)` must be available for event assertions.

---

## Verified Correct

The following aspects of the implementation are correct and need no changes:

- `session.interaction` and `session.turn` two-level model in `orient.ts` — correctly implemented, including all three LLM call sites. `turnIndex` counter increments correctly. Payload capture guards prevent string evaluation before the env var check.
- `a_society.handoff.parse_failure` counter — correctly emitted at all three `HandoffParseError` catch sites in `orient.ts` using `roleKey` as a direct parameter, before the `if (autonomous) throw e` check. No introspection.
- `a_society.session.turn.started` counter and `a_society.session.turn.duration` histogram — correctly emitted per `session.turn` span.
- `flow.run`, `bootstrap.session`, `flow.node.advance` spans in `orchestrator.ts` — correctly instrumented with required attributes and events.
- `session.interaction.turn_count` — correctly set in the `finally` block from `turnIndex`.
- `session.interaction.outcome` — correctly set on all exit paths in `orient.ts`.
- `handoff.parse` span structure — correct try/catch/finally pattern; exception recorded and rethrown on failure.
- `a_society.flow.started` and `a_society.flow.completed` counters — correctly placed and dimensioned.
- Idempotency guard on `init()` — correct.
- `A_SOCIETY_TELEMETRY_ENABLED=false` early return — correct.
- SIGTERM and beforeExit shutdown handler registration — correct.

---

## Operator-Facing Documentation

`INVOCATION.md` has not been updated to include the telemetry section. This must be done in the same revision pass, per the spec and per the §8 requirement.

---

## Resubmission Requirements

The Developer must address all three blocking findings and all eight non-blocking findings before resubmission. The resubmission integration record must confirm:

1. All five required test scenarios implemented and passing.
2. `initForTest` state isolation corrected; `shutdown()` resets tracer and meter unconditionally.
3. `triggers.ts` instrumented with `tool_trigger.execute` spans per spec.
4. `improvement.ts` instrumented with `improvement.orchestrate` span and step events per spec.
5. All attribute and event name corrections applied (N5, N6, N7).
6. `telemetry-test-helper.ts` refactored to exported functions with throwing `getSpan` and `getEvents`.
7. `INVOCATION.md` telemetry section added.
8. Remaining non-blocking items (N2, N3, N4) addressed.

---

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260408-runtime-observability-foundation/08-ta-integration-review.md
```
