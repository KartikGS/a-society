**Subject:** Runtime Observability Foundation — Integration Gate Corrections
**Type:** Owner → Runtime Developer
**Status:** CORRECTIONS REQUIRED
**Date:** 2026-04-08
**Flow:** `20260408-runtime-observability-foundation`

---

## Status

The TA integration review ([`08-ta-integration-review.md`](a-society/a-docs/records/20260408-runtime-observability-foundation/08-ta-integration-review.md)) is accepted. I reviewed the implementation directly in `runtime/` and confirmed the integration is not yet approvable.

The overall direction remains approved: OpenTelemetry is in place, the `session.interaction` / `session.turn` model is present, and the substrate is viable. The problem is gate completeness. The required test seam is still mostly absent, two required runtime surfaces are uninstrumented, several span and event names drift from the approved contract, and the operator-facing verification obligations from [`06-owner-phase0-approval.md`](a-society/a-docs/records/20260408-runtime-observability-foundation/06-owner-phase0-approval.md) are not yet satisfied.

Address all corrections below in one revision pass before resubmitting.

---

## Required Correction 1 — Complete the required telemetry test seam

**Files:** `runtime/test/observability.test.ts`, `runtime/test/telemetry-test-helper.ts`, `runtime/src/observability.ts`

The approved gate in [`05-ta-phase0-design-revised.md`](a-society/a-docs/records/20260408-runtime-observability-foundation/05-ta-phase0-design-revised.md) and [`06-owner-phase0-approval.md`](a-society/a-docs/records/20260408-runtime-observability-foundation/06-owner-phase0-approval.md) required the named Phase 1 trace scenarios. The current test file still covers only a sanity span plus `handoff.parse` success and failure. That leaves the orchestration layer, prompt-human loop, provider tool-call path, and improvement path effectively untested.

Apply the following fixes:

1. Implement the five required trace scenarios from `05-ta-phase0-design-revised.md §6`:
   - successful node handoff
   - prompt-human suspension
   - provider tool-call round
   - handoff parse failure path
   - forward-pass closure to improvement
2. Refactor `runtime/test/telemetry-test-helper.ts` to the approved exported-function interface, including:
   - throwing `getSpan(...)`
   - `getEvents(...)` for event assertions
3. Fix `TelemetryManager.initForTest()` / `shutdown()` state isolation:
   - `shutdown()` must clear `tracer` and `meter` even when no `NodeSDK` instance exists
   - repeated `initForTest()` calls must clean up the prior test provider before registering a new one
4. Remove the "Next Steps" deferral from the next integration record. These tests are part of this flow's required gate, not follow-up work.

---

## Required Correction 2 — Instrument the remaining required runtime paths

**Files:** `runtime/src/triggers.ts`, `runtime/src/improvement.ts`

The approved design explicitly required telemetry in both files. Neither is instrumented yet.

Apply the following fixes:

1. Add `tool_trigger.execute` spans in `runtime/src/triggers.ts` for the trigger execution path required by the approved design.
2. Add the `improvement.orchestrate` span and required step events in `runtime/src/improvement.ts`.
3. Ensure the revised tests exercise these paths instead of leaving them validated only by inspection.

Without these spans, bootstrap/forward-pass trigger execution and the improvement orchestration path remain opaque in traces.

---

## Required Correction 3 — Bring the telemetry schema back to the approved contract

**Files:** `runtime/src/observability.ts`, `runtime/src/handoff.ts`, `runtime/src/llm.ts`, `runtime/src/providers/anthropic.ts`, `runtime/src/providers/openai-compatible.ts`

Several files still diverge from the approved attribute, event, and span-kind contract. Correct them in the same revision pass.

Apply the following fixes:

1. In `runtime/src/observability.ts`:
   - add the missing resource attributes `service.namespace` and `deployment.environment`
   - use the `Resource.default().merge(...)` pattern
   - change the startup warning and `parseHeaders` behavior to the approved stderr contract
   - either switch to the OTLP proto exporters named in the approved design or explicitly document and justify the HTTP/JSON deviation in the next integration record
2. In `runtime/src/handoff.ts`:
   - add `handoff.text_length`
   - add `handoff.parse.success`
   - rename `handoff.result.kind` to `handoff.result_kind`
3. In `runtime/src/llm.ts`:
   - add creation attributes `llm.tools_enabled` and `llm.message_count`
   - rename `llm.gateway.tool_rounds` to `llm.tool_round_count`
   - replace the current round event shape with `llm.tool_round`
   - emit `llm.tool_call` per tool call
   - emit `llm.max_rounds_exceeded` when the limit is hit
4. In `runtime/src/providers/anthropic.ts` and `runtime/src/providers/openai-compatible.ts`:
   - use `SpanKind.CLIENT`
   - align provider attribute names to the approved schema
   - emit the required provider events
   - handle ABORTED via span event plus explicit OK status, not a bare attribute

Do not treat these as cosmetic. The approved design is the binding contract for trace interpretation and operator debugging.

---

## Required Correction 4 — Restore the operator-facing and verification obligations

**Files:** `runtime/INVOCATION.md`, next integration record

The current integration record does not satisfy the verification boundary set in `06-owner-phase0-approval.md`. Phase 1 narrowed the automated gate to traces only, but it did not remove the requirement for reproducible local metric verification.

Apply the following fixes:

1. Update `runtime/INVOCATION.md` with the telemetry section required by the approved design.
2. In the resubmission integration record, provide a reproducible local metric verification for at least:
   - `a_society.session.turn.started`
   - `a_society.provider.latency`
3. Do not use "manually verified via code inspection" as the metric evidence. This flow requires an operator-reproducible local sink procedure.
4. Reconfirm in the resubmission record that:
   - default behavior with `A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE` unset does not export prompt/completion content
   - `A_SOCIETY_TELEMETRY_ENABLED=false` leaves the runtime functional and produces no telemetry startup warning

---

## Resubmission Requirements

Before returning to Owner:

1. Run `npx tsc --noEmit`.
2. Run `npx tsx test/observability.test.ts`.
3. Capture the reproducible local metric verification required above.
4. File the resubmission artifact at `a-society/a-docs/records/20260408-runtime-observability-foundation/10-runtime-developer-corrections-confirmed.md`.

Approval is withheld until all four correction groups are complete.

---

```handoff
role: Runtime Developer
artifact_path: a-society/a-docs/records/20260408-runtime-observability-foundation/09-owner-integration-corrections.md
```
