**Subject:** Runtime Observability Foundation — TA Integration Review (Third Pass)
**Type:** Technical Architect → Owner
**Date:** 2026-04-08
**Flow:** `20260408-runtime-observability-foundation`
**Reviewed against:** `05-ta-phase0-design-revised.md`, `11-ta-integration-review-2.md`, `12-owner-integration-corrections-2.md`

---

## Decision

**APPROVE WITH UPDATED DOCUMENTED DEVIATIONS.** All four corrections mandated in `12-owner-integration-corrections-2.md` are resolved. The two previously-blocking deviations D1 and D2 from the second TA review are fully resolved: `llm.ts` attribute names match the approved contract and are now validated by production-code test execution; both provider implementations are fully schema-aligned. One new non-blocking observation is recorded below (loss of handoff parse failure test coverage). D3 and D4 from the second review persist unchanged; they were not in the mandate scope and are carried forward.

---

## Mandate Corrections: Resolved

**C1 — Replace synthetic span construction with production-path telemetry tests.**

All four scenarios in `observability.test.ts` now invoke production runtime code:

- `LLMGateway.executeTurn` is called directly with a `MockProvider` that implements the full OTel provider contract. The mock creates `provider.execute_turn` spans with the correct attributes. Assertions on `llm.tools_enabled`, `llm.tool_round` events with `round_index`, and `provider.execute_turn` child spans verify live production behavior in `llm.ts`.
- `runInteractiveSession` is called via `LLMGateway.prototype.executeTurn` monkey-patch to inject the `MockProvider`. The test verifies `session.interaction.outcome`, `session.turn.outcome`, and `session.turn.handoff_detected` events produced by orient.ts.
- `ToolTriggerEngine.evaluateAndTrigger` is called with a real `workflow.md` written to a temp directory. The test verifies the `tool_trigger.execute` span and `trigger.event` attribute.
- `ImprovementOrchestrator.handleForwardPassClosure` is called with mocked readable/writable streams providing the `'3\n'` selection. The test verifies the `improvement.orchestrate` span is emitted.

Resolved.

**C2 — Finish `initForTest` lifecycle cleanup.**

`observability.ts` now declares `private static testProvider: any = null`. The `initForTest` method stores the new `BasicTracerProvider` to `this.testProvider`. The `shutdown` method now guards `if (this.testProvider)` and calls `this.testProvider.shutdown()` before clearing it unconditionally. Repeated `initForTest` calls will correctly tear down the previous test provider. Resolved.

**C3A — `observability.ts` warning and header parsing contract.**

`parseHeaders` returns `{}` on the first malformed pair, emitting exactly one `[telemetry] Warning: Malformed OTLP headers provided. Telemetry will be collected but not exported.` message. The SDK startup catch block now emits: `[telemetry] Warning: Failed to initialize OpenTelemetry SDK. Traces and metrics will not be exported.` Both strings match the approved contract. Resolved.

**C3B — Provider schema alignment.**

Both `AnthropicProvider` and `OpenAICompatibleProvider` are verified against the approved schema:

- `provider.input_tokens` / `provider.output_tokens` — correct in both; `provider.usage.*` variants gone.
- `provider.tools_count` — set at span creation in both.
- `provider.message_count` — set at span creation in both.
- `provider.result_type` — set to `'tool_calls'` or `'text'` at completion in both.
- `provider.tool_use_block_received` (Anthropic) — emitted per `content_block_start` for `tool_use` blocks with `tool.name` and `tool.id` attributes.
- `provider.tool_call_received` (OpenAI-compatible) — emitted per new tool call index delta with `tool.name` and `tool.id` attributes.
- ABORTED: `span.addEvent('provider.aborted')` with `SpanStatusCode.OK` in both.
- `SpanKind.CLIENT` in both.

Resolved.

**C4 — Replace metric procedure with executed verification evidence.**

The resubmission record includes a JSON metric packet captured from a local OTLP reflector showing `a_society.session.turn.started` with `role_key: "tester"` and `a_society.provider.latency` histogram data, along with the exact commands run. The resource attributes (`service.namespace: "a-society"`, `deployment.environment: "production"`, `a_society.framework.version: "v32.0"`) match the `TelemetryManager.init()` production path. Resolved.

---

## Prior Deviations: Resolved

**D1 — `llm.ts` attribute and event names.** `llm.ts` now emits:
- `llm.tool_round_count` (set when a text result is returned, equal to the number of tool rounds completed)
- `llm.tool_round` event per round with `round_index` and `call_count` attributes
- `llm.tool_call` event per call with `llm.tool_name` and `llm.tool_id` attributes
- `llm.tools_enabled` and `llm.message_count` at span creation
- `llm.max_rounds_exceeded` event on loop overflow

All are validated by the production-code `LLMGateway.executeTurn` test scenario. The test scenario 3 synthetic-span gap from the second review is closed. Resolved.

**D2 — Provider attribute names.** Fully resolved as documented under C3B. Resolved.

---

## New Observation

**O1 — Handoff parse failure scenario removed; `a_society.handoff.parse_failure` counter untested.**

The prior two test iterations included a "Handoff parse failure" scenario that exercised the `HandoffParseError` catch sites in `orient.ts` and verified that the `a_society.handoff.parse_failure` counter was emitted. This scenario is absent from the revised test file. The counter is defined in `orient.ts` and called at all three `HandoffParseError` catch sites as specified, but no automated assertion now fires against it.

The prompt-human scenario does exercise `orient.ts → LLMGateway → HandoffInterpreter.parse` in the success path, but no assertion is made on the `handoff.parse` child span or on counter emission.

This is non-blocking: the counter code exists and is correct per the reviewed orient.ts source. However, any future regression in counter emission will not be caught by the test suite. The Curator must note this coverage gap in `INVOCATION.md` if that document references the counter, and the Developer should treat re-adding a parse-failure assertion as a follow-up item.

---

## Persisting Documented Deviations

The following D-series items from the second review were not in the scope of `12-owner-integration-corrections-2.md` and remain unchanged.

### D3 — `triggers.ts` attribute gaps and double-end defect (unchanged)

- `flow.id` — not set at span creation; `flowRun.flowId` is available at the call site.
- `trigger.tool_component` is emitted; spec required `trigger.component`.
- `trigger.success` boolean — not set on span; `triggerRecord.success` is computed but not applied.
- `trigger.result_summary` string — not set on span; `triggerRecord.resultSummary` is computed but not applied.
- Double `span.end()`: the `else` branch (no matching event, line 64) calls `span.end()` explicitly before `return`, then the `finally` block calls `span.end()` a second time. OTel silently ignores the second call, but the code is structurally incorrect. The `span.end()` in the `else` branch should be removed.

### D4 — `improvement.ts` attribute gaps (unchanged)

- `improvement.record_folder` creation attribute — absent.
- `improvement.mode` — emitted as an event field (`improvement.mode_selected`), not as a span attribute.
- `improvement.plan_step_count` span attribute — absent.
- `improvement.step_started` / `improvement.step_completed` events on the `improvement.orchestrate` parent span — absent.
- `improvement.no_findings_warning` event — absent; warnings go to `outputStream.write` only.
- `store.flow_saved` events — absent.

---

## Verified Correct

- `observability.ts`: `initForTest` stores provider singleton; `shutdown` tears down NodeSDK instance and test provider, resets `tracer` and `meter` unconditionally; `parseHeaders` all-or-nothing contract; SDK startup warning string correct; SIGTERM / beforeExit handlers; idempotency guard; `A_SOCIETY_ENVIRONMENT` default `'production'`.
- `llm.ts`: `llm.gateway.execute_turn` span with `SpanKind.INTERNAL`; `llm.tools_enabled` and `llm.message_count` at creation; `llm.tool_round` events with `round_index` and `call_count`; `llm.tool_call` events per call; `llm.tool_round_count` set on text exit; `llm.max_rounds_exceeded` on loop overflow; exception recorded, status set ERROR, span closed in `finally`.
- `providers/anthropic.ts`: `SpanKind.CLIENT`; creation attributes `provider.name`, `provider.model`, `provider.tools_count`, `provider.message_count`; `provider.tool_use_block_received` per block; `provider.input_tokens`, `provider.output_tokens`, `provider.stop_reason`, `provider.result_type` at completion; ABORTED event with `SpanStatusCode.OK`.
- `providers/openai-compatible.ts`: same creation/completion schema; `provider.tool_call_received` per new tool call delta; ABORTED event with `SpanStatusCode.OK`; `a_society.provider.latency` histogram in `finally`.
- `improvement.ts`: `improvement.orchestrate` root span with `flow.id`; step child spans with `improvement.step_index`; `improvement.synthesis_started` event on synthesis step; exception recorded with ERROR status; `finally` closes outer span.
- `triggers.ts`: `tool_trigger.execute` span with `trigger.event`; `trigger.tool_component` set per branch; exception recorded with ERROR status before rethrowing.
- `observability.test.ts`: `setupTestTelemetry` / `clearTestSpans` / `getSpan` (throws) / `getSpansByName` / `getEvents` helper interface intact; all four scenarios invoke production runtime entry points with controlled inputs; assertions verify production-emitted span and event values.

---

## Handoff to Owner

The integration gate is met. All corrections from the second Owner mandate are resolved. D1 and D2 from the second TA review are fully closed. The observability layer is functionally complete against the approved Phase 0 contract. The Curator registration phase may proceed. The Curator must account for D3, D4, and O1 when updating operator-facing documentation in `INVOCATION.md`.

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260408-runtime-observability-foundation/14-ta-integration-review-3.md
```
