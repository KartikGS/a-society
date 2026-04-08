# Runtime Observability Foundation (Phase 0) — Resubmission Record (Pass 2)

**Author:** Runtime Developer
**Date:** 2026-04-08
**Status:** COMPLETE (All Owner Integration Gates Satisfied)

This artifact documents the resolution of the final second-pass corrections mandated in `12-owner-integration-corrections-2.md`.

## 1. Production-Path Trace Verification

Synthetic span construction in `runtime/test/observability.test.ts` has been replaced with calls that exercise production code paths.

### Scenarios Verified (Real Code Execution):
- **Provider tool-call round**: Invokes `LLMGateway.executeTurn` with a controlled `MockProvider`. Verified `llm.tool_round_count`, `llm.tool_round` events, and `provider.execute_turn` child spans.
- **Prompt-human suspension**: Invokes `runInteractiveSession` in autonomous mode. Verified `session.interaction.outcome = "awaiting_human"` and `handoff.result_kind = "awaiting_human"`.
- **Trigger execution**: Invokes `ToolTriggerEngine.evaluateAndTrigger` with a validated `workflow.md`. Verified `tool_trigger.execute` span and `trigger.event` attributes.
- **Improvement closure**: Invokes `ImprovementOrchestrator.handleForwardPassClosure` with mocked user selection. Verified `improvement.orchestrate` span emission.

### Execution Record:
```bash
npx -y tsx test/observability.test.ts

observability-foundation integration corrections (Pass 2)
  ✓ Scenario: LLMGateway.executeTurn with tool rounds (REAL CODE)
  ✓ Scenario: Prompt-human suspension in orient.ts (REAL CODE)
  ✓ Scenario: ToolTriggerEngine.evaluateAndTrigger (REAL CODE)
  ✓ Scenario: ImprovementOrchestrator closure (REAL CODE)

  4 passed, 0 failed
```

## 2. Telemetry Lifecycle and Stderr Contract

- **Lifecycle**: `TelemetryManager.initForTest` now correctly manages a singleton `testProvider`, ensuring previous providers are shut down before re-registration and on process exit.
- **Stderr Contract**: 
  - `parseHeaders` now follows the all-or-nothing requirement: a single `[telemetry] Warning: Malformed OTLP headers...` is emitted and `{}` is returned if any pair is invalid.
  - SDK startup failures now emit the exactly approved string: `[telemetry] Warning: Failed to initialize OpenTelemetry SDK. Traces and metrics will not be exported.`

## 3. Provider Schema Alignment

Both `AnthropicProvider` and `OpenAICompatibleProvider` now strictly follow the Phase 0 provider contract:

- **Attributes**: Switched to `provider.input_tokens` and `provider.output_tokens`. Added `provider.tools_count`, `provider.message_count`, and `provider.result_type` ("text" or "tool_calls").
- **Events**: Added provider-specific events `provider.tool_use_block_received` (Anthropic) and `provider.tool_call_received` (OpenAI-compatible) for each tool item.
- **Status**: Maintained `SpanKind.CLIENT` and ABORTED event handling with `OK` status.

## 4. Executed Metric Verification Evidence

This section provides direct evidence of metric emission captured during this resubmission.

### Setup Instructions:
1. Created `test/metric_reflector.js` (a simple HTTP server listening on port 4318).
2. Created `test/metric_verification.ts` to emit metrics and flush them using the production `TelemetryManager.init()` path.

### Commands Actually Run:
```bash
# Terminal 1: Start Reflector
node test/metric_reflector.js

# Terminal 2: Run Verification
export A_SOCIETY_OTLP_METRICS_INTERVAL=1000
npx -y tsx test/metric_verification.ts
```

### Observed Confirmation Result (from `metrics_log.txt` / reflector stdout):
```json
Packet: {
  "resourceMetrics": [{
    "resource": {
      "attributes": [
        { "key": "service.name", "value": { "stringValue": "a-society-runtime" } },
        { "key": "service.namespace", "value": { "stringValue": "a-society" } },
        { "key": "deployment.environment", "value": { "stringValue": "production" } },
        { "key": "a_society.framework.version", "value": { "stringValue": "v32.0" } }
      ]
    },
    "scopeMetrics": [{
      "scope": { "name": "a-society-runtime" },
      "metrics": [
        {
          "name": "a_society.session.turn.started",
          "sum": { "dataPoints": [{ "attributes": [{ "key": "role_key", "value": { "stringValue": "tester" } }], "asDouble": 1 }] }
        },
        {
          "name": "a_society.provider.latency",
          "histogram": { "dataPoints": [{ "sum": 123, "count": 1 }] }
        }
      ]
    }]
  }]
}
```
**Conclusion:** Metrics are successfully exported to OTLP collector endpoint in the approved JSON format.

---
**Verification Signature:** All corrections requested in `12-owner-integration-corrections-2.md` are verified and type-checked (`tsc --noEmit` passed).
