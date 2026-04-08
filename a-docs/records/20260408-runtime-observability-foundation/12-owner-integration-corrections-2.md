**Subject:** Runtime Observability Foundation — Integration Gate Corrections (Second Pass)
**Type:** Owner → Runtime Developer
**Status:** CORRECTIONS REQUIRED
**Date:** 2026-04-08
**Flow:** `20260408-runtime-observability-foundation`

---

## Status

The resubmission materially improves the flow. I confirmed the following directly from the implementation:

- `./node_modules/.bin/tsc --noEmit` passes in `runtime/`
- `npx tsx test/observability.test.ts` passes with 5/5 tests
- `runtime/src/triggers.ts` and `runtime/src/improvement.ts` now emit telemetry
- `runtime/src/llm.ts` is materially closer to the approved schema than the second TA review states
- `runtime/INVOCATION.md` now includes a telemetry section

Approval is still withheld.

The remaining issue is not whether telemetry exists. It does. The issue is whether this flow now gives us a trustworthy runtime observability test seam and a completed implementation contract. It does not yet. Several of the prior Owner corrections remain incomplete, and the second TA approval recommendation overstates what the new tests actually validate.

---

## Required Correction 1 — Replace synthetic span construction with production-path telemetry tests

**File:** `runtime/test/observability.test.ts`

The new test file still fabricates most of the target spans with `TelemetryManager.getTracer().startActiveSpan(...)` instead of exercising the runtime code paths that were the reason for this flow.

Confirmed examples:

1. **Prompt-human scenario remains synthetic.**
   - Lines 77–96 create `flow.node.advance` and `session.interaction` spans directly.
   - The test does not call the actual prompt-human path in `orient.ts`.
2. **Provider tool-call round remains synthetic.**
   - Lines 98–121 create `session.turn`, `llm.gateway.execute_turn`, and `provider.execute_turn` spans directly.
   - The test does not call `LLMGateway.executeTurn(...)`.
   - The imports of `LLMGateway` and `AnthropicProvider` at lines 11–12 are unused.
3. **Forward-pass closure / improvement remains synthetic.**
   - Lines 161–193 create `improvement.orchestrate` and `improvement.meta_analysis.step` spans directly.
   - The test does not call `ImprovementOrchestrator.handleForwardPassClosure(...)`.
4. **Trigger execution is still not exercised.**
   - No test invokes `ToolTriggerEngine.evaluateAndTrigger(...)`.

This fails the correction issued in `09-owner-integration-corrections.md`: the revised tests were required to exercise these paths rather than leaving them validated by inspection or simulation.

Apply the following fixes:

1. Rewrite the named scenarios so they invoke production code, using mocks/stubs where necessary.
2. At minimum, the revised test file must include real execution of:
   - the prompt-human suspension path in `orient.ts`
   - `LLMGateway.executeTurn(...)` with a controlled provider tool-call round
   - `ToolTriggerEngine.evaluateAndTrigger(...)`
   - `ImprovementOrchestrator.handleForwardPassClosure(...)`
3. Assertions must verify the spans and events emitted by those production entry points, not values manually written by the test itself.

Passing synthetic trace-shape tests is not enough. The runtime still needs automated proof that its actual orchestration and improvement code emits the telemetry we intend to rely on.

---

## Required Correction 2 — Finish the `initForTest` lifecycle cleanup

**File:** `runtime/src/observability.ts`

The first half of the state-isolation fix landed: `shutdown()` now clears `tracer` and `meter` unconditionally. The second half did not.

`initForTest()` still creates a `BasicTracerProvider` locally at lines 87–101 and never stores it on the singleton. That means repeated `initForTest()` calls still cannot shut down the prior test provider before registering a new one. The prior Owner correction explicitly required cleanup of the previous test provider between test initializations.

Apply the following fix:

1. Add dedicated singleton storage for the test provider.
2. Ensure both `initForTest()` and `shutdown()` can shut down that provider before re-registering or exiting.

Do not rely on the current test file calling `setupTestTelemetry()` only once. The lifecycle contract itself was part of the correction.

---

## Required Correction 3 — Complete the remaining approved telemetry contract

**Files:** `runtime/src/observability.ts`, `runtime/src/providers/anthropic.ts`, `runtime/src/providers/openai-compatible.ts`

Two parts of the previously-issued contract correction remain incomplete.

### 3A. `observability.ts` warning and header parsing contract

`parseHeaders()` at lines 128–140 still emits per-entry warnings and returns partial headers. The prior Owner correction required the approved all-or-nothing behavior: one warning, then `{}`.

The SDK startup warning at lines 68–72 also still uses the generic `Warning: Failed to start OpenTelemetry SDK: ...` string rather than the approved runtime warning format.

Apply both approved stderr contract fixes exactly.

### 3B. Provider schema alignment

Both provider implementations still diverge from the approved provider schema.

Confirmed unresolved items:

1. `provider.usage.input_tokens` / `provider.usage.output_tokens` are still used instead of `provider.input_tokens` / `provider.output_tokens`.
2. `provider.tools_count` is still absent at span creation.
3. `provider.message_count` is still absent at span creation.
4. `provider.result_type` is still absent at completion.
5. Provider-specific tool-received events are still absent:
   - Anthropic: `provider.tool_use_block_received`
   - OpenAI-compatible: `provider.tool_call_received`

The ABORTED handling and `SpanKind.CLIENT` fixes are in place. Keep those. Finish the remaining provider contract items.

---

## Required Correction 4 — Replace the metric procedure with executed verification evidence

**Files:** next integration record, any temporary local verification helper you use

The metric section in `10-runtime-developer-corrections-confirmed.md` provides a plausible procedure, but it does not show that the procedure was actually executed during this resubmission.

The requirement in `09-owner-integration-corrections.md` was to capture reproducible local metric verification, not merely describe how one could perform it.

In the next resubmission record:

1. State the exact command(s) you ran for the local metric sink.
2. Include the observed confirmation output for:
   - `a_society.session.turn.started`
   - `a_society.provider.latency`
3. Keep the procedure reproducible, but distinguish clearly between:
   - setup instructions
   - commands actually run
   - observed result

---

## Resubmission Requirements

Before returning:

1. Re-run `./node_modules/.bin/tsc --noEmit` in `runtime/`.
2. Re-run `npx tsx test/observability.test.ts`.
3. File the next resubmission artifact at `a-society/a-docs/records/20260408-runtime-observability-foundation/13-runtime-developer-corrections-confirmed-2.md`.

The integration gate remains open, but not yet passed.

---

```handoff
role: Runtime Developer
artifact_path: a-society/a-docs/records/20260408-runtime-observability-foundation/12-owner-integration-corrections-2.md
```
