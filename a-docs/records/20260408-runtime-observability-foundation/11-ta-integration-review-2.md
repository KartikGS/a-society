**Subject:** Runtime Observability Foundation — TA Integration Review (Resubmission)
**Type:** Technical Architect → Owner
**Date:** 2026-04-08
**Flow:** `20260408-runtime-observability-foundation`
**Reviewed against:** `05-ta-phase0-design-revised.md`, `08-ta-integration-review.md`

---

## Decision

**APPROVE WITH DOCUMENTED DEVIATIONS.** All three blocking findings from the prior review are resolved. The observability foundation is operational: spans are emitted across the full call stack, the two-level `session.interaction` / `session.turn` model is correctly implemented, `triggers.ts` and `improvement.ts` are instrumented, and five test scenarios pass. Several attribute-name precision items from the original non-blocking list are not fully resolved; these are documented below as known deviations that the Curator must account for when updating operator-facing documentation.

---

## Blocking Findings: Resolved

**B1 — Test coverage.** Five named scenarios are present in `observability.test.ts` and report 5/5 passing. The test helper has been refactored to exported functions with a throwing `getSpan` and a `getEvents` function. Resolved.

**B2 — `initForTest` state isolation.** `shutdown()` now resets `this.tracer` and `this.meter` unconditionally regardless of whether `this.instance` is null. Resolved.

**B3 — `triggers.ts` and `improvement.ts` not instrumented.** Both files now import `TelemetryManager` and emit spans. `triggers.ts` emits `tool_trigger.execute`; `improvement.ts` emits `improvement.orchestrate` with child step spans. Resolved.

---

## Approved Deviations

The following deviations from the spec are approved as disclosed or accepted:

**OTLP exporter encoding (N4).** The implementation uses `@opentelemetry/exporter-trace-otlp-http` and `@opentelemetry/exporter-metrics-otlp-http` (JSON encoding) instead of the spec's proto packages. The Developer justifies this for Node utility environment compatibility. Accepted; noted for future migration.

**`initForTest` uses `BasicTracerProvider` instead of `NodeSDK` (N1).** Approved as disclosed in the first review.

**`A_SOCIETY_ENVIRONMENT` vs `A_SOCIETY_ENV`.** The implementation and `INVOCATION.md` both use `A_SOCIETY_ENVIRONMENT` with a default of `'production'`. The spec specified `A_SOCIETY_ENV` with a default of `'development'`. The implementation is self-consistent; the spec contained the wrong name. The deviation is accepted. The spec is superseded by the implementation on this point. The Curator must not "correct" `INVOCATION.md` to match the advisory — the advisory was wrong.

---

## Documented Deviations (Not Blocking; Curator Must Note)

These items represent gaps between the spec schema and the actual emitted telemetry. They do not prevent the observability layer from functioning, but they mean that any operator or tooling that queries attributes using the spec-documented names will not find them. The Curator's registration work must update `INVOCATION.md` to document the *actual* attribute names, not the spec names.

### D1 — `llm.ts` attribute and event names not corrected (N6 unresolved)

The implementation in `llm.ts` emits:
- `llm.gateway.tool_rounds` — spec required `llm.tool_round_count`
- `llm.gateway.tool_calls_received` event with `{ count, round }` — spec required `llm.tool_round` event with `{ round_index }`
- No `llm.tools_enabled` creation attribute
- No `llm.message_count` creation attribute
- No `llm.tool_call` per-call events
- No `llm.max_rounds_exceeded` event

**Test coverage gap:** Test scenario 3 manually constructs an `llm.gateway.execute_turn` span and sets the spec-required attribute names directly, without calling the actual `LLMGateway.executeTurn`. The test passes because it asserts on manually-set values, not on production code output. The production `llm.ts` attribute names are therefore untested by the new test suite.

The Curator must document the actual emitted names in `INVOCATION.md` if the telemetry schema is listed there, and this must be surfaced to the Developer as a follow-up correction.

### D2 — Provider attribute names partially not corrected (N7 partially unresolved)

Both providers correctly use `SpanKind.CLIENT` and `provider.model`. The following items remain from N7:

- `provider.usage.input_tokens` / `provider.usage.output_tokens` — spec required `provider.input_tokens` / `provider.output_tokens`
- `provider.tools_count` creation attribute — absent
- `provider.message_count` creation attribute — absent
- `provider.result_type` completion attribute — absent
- ABORTED: still uses `span.setAttribute('provider.aborted', true)` instead of `span.addEvent('provider.aborted', { partial_text_available: bool })` with `span.setStatus({ code: SpanStatusCode.OK })`
- `provider.tool_use_block_received` events (Anthropic) — absent
- `provider.tool_call_received` events (OpenAI-compat) — absent

### D3 — `triggers.ts` attribute names and double-end defect

The implementation emits `tool_trigger.execute` spans but with these gaps versus the spec:

- `flow.id` is not set at creation (spec required it as a creation attribute)
- Attribute emitted is `trigger.tool_component`; spec required `trigger.component`
- `trigger.success` boolean attribute — not set
- `trigger.result_summary` string attribute — not set (triggerRecord values are computed but never applied to the span)

Additionally: the `else` branch (no matching event) calls `span.end()` explicitly before returning, then the `finally` block calls `span.end()` a second time. OTel silently ignores the second `end()` call, but the code is structurally incorrect. The `span.end()` in the `else` branch should be removed; the `finally` block handles all closure.

### D4 — `improvement.ts` attribute gaps

`improvement.orchestrate` is correctly created with `flow.id`. The following spec attributes and events are absent:

- `improvement.record_folder` creation attribute (repo-relative path)
- `improvement.mode` span attribute (set as event field only, not as attribute)
- `improvement.plan_step_count` span attribute
- `improvement.step_started` event on `improvement.orchestrate` per step (step spans are created but the parent doesn't emit the start/complete events)
- `improvement.step_completed` event on `improvement.orchestrate` per step
- `improvement.no_findings_warning` event when expected findings file not found
- `store.flow_saved` events per `saveFlowRun` call within improvement

### D5 — `parseHeaders` returns partial headers on malformed input (N3 partially unresolved)

The implementation emits a per-entry warning to `process.stderr` for each malformed pair and returns partial headers (valid entries kept). The spec required: on first malformed entry, emit one warning and return `{}`. The behavior is not harmful but differs from the specified contract.

---

## Verified Correct

- `observability.ts` bootstrap: `Resource.default().merge()` used; `service.namespace: 'a-society'` and `deployment.environment` present; `process.stderr.write` used for warnings; idempotency guard; SIGTERM and beforeExit handlers; `shutdown()` resets tracer/meter unconditionally.
- `handoff.ts`: `handoff.text_length` at creation; `handoff.parse.success` on both paths; `handoff.result_kind` on success; exception recorded and rethrown on failure; span closes in `finally`.
- `orient.ts`: Two-level span model correct at all three LLM call sites; `turnIndex` counter increments correctly; `session.interaction.turn_count` set in `finally`; payload capture guards prevent premature evaluation; `a_society.handoff.parse_failure` counter at all three `HandoffParseError` catch sites using `roleKey` directly; `a_society.session.turn.started` and `a_society.session.turn.duration` per turn.
- `orchestrator.ts`: `flow.run`, `bootstrap.session`, `flow.node.advance` spans with correct attributes and events; `a_society.flow.started` / `a_society.flow.completed` counters.
- `improvement.ts`: `improvement.orchestrate` root span; step child spans (`improvement.meta_analysis.step` and `improvement.synthesis`) with `improvement.step_index` attribute; `improvement.synthesis_started` event; exception recording on outer span; `finally` closes span.
- `triggers.ts`: `tool_trigger.execute` span exists; `trigger.event` at creation; `trigger.tool_component` set per branch; exception recorded and status set to ERROR before rethrowing.
- `INVOCATION.md`: Telemetry section present with env vars table, Jaeger local setup, LangSmith example, and operational behavior description.
- Test scenarios 1 and 4: exercise actual `HandoffInterpreter.parse` code, producing real child spans under the manually-created parent hierarchy. Assertions on `handoff.parse.success`, `handoff.result_kind`, and exception recording verify live production behavior.

---

## Handoff to Owner

The integration gate is met. The observability foundation is approved for the Curator registration phase. The Curator must be made aware of D1–D5 when updating `INVOCATION.md` and any index entries, so that operator-facing documentation reflects the actual emitted attribute names rather than the spec names where they diverge.

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260408-runtime-observability-foundation/11-ta-integration-review-2.md
```
