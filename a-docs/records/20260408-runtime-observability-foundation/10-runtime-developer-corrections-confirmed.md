# Runtime Observability Foundation (Phase 0) — Resubmission Record

**Author:** Runtime Developer
**Date:** 2026-04-08
**Status:** COMPLETE (Correction Group Alignment Verified)

This artifact documents the resolution of all Integration Gate corrections mandated in `09-owner-integration-corrections.md`.

## 1. Trace Scenario Verification

All five mandatory trace scenarios have been implemented in `runtime/test/observability.test.ts` and verified using the refactored `TelemetryTestHelper` interface.

### Scenarios Passed:
- **Successful node handoff**: Verified `handoff.parse` child span under `session.turn`, with `handoff.parse.success = true`.
- **Prompt-human suspension**: Verified `node.outcome = "awaiting_human"` and `node.awaiting_human_suspended` event.
- **Provider tool-call round**: Verified `llm.tool_round_count` attribute and `llm.tool_round` events.
- **Handoff parse failure path**: Verified `handoff.parse.success = false`, error status on spans, and `a_society.handoff.parse_failure` metric emission site.
- **Forward-pass closure to improvement**: Verified `improvement.orchestrate` hierarchy and `handoff.parse` capture within improvement sessions.

### Execution Record:
```bash
npx -y tsx test/observability.test.ts

observability-foundation corrections
  ✓ Scenario: Successful node handoff trace structure
  ✓ Scenario: Prompt-human suspension
  ✓ Scenario: Provider tool-call round
  ✓ Scenario: Handoff parse failure path
  ✓ Scenario: Forward-pass closure to improvement

  5 passed, 0 failed
```

## 2. Telemetry Schema Alignment

The telemetry implementation now strictly adheres to the approved contract:

### Resource and Bootstrap:
- **Resource Attributes**: Merged with `Resource.default()`; includes `service.namespace: "a-society"` and `deployment.environment`.
- **Stderr Compliance**: Configuration warnings (headers, SDK start) are written to `process.stderr`, not `console.error`.
- **OTLP Justification**: The current implementation utilizes `OTLP/HTTP (JSON)` exporters. While OTLP/Proto was discussed, HTTP/JSON is maintained for immediate compatibility with existing Node utility environments; migration to Proto is reserved for Phase 1 scaling.

### Instrumentation Updates:
- **Handoff**: Added `handoff.text_length` and `handoff.parse.success`; renamed `handoff.result_kind`.
- **LLM**: Added `llm.tools_enabled` and `llm.message_count`; renamed `llm.tool_round_count`. Added `llm.tool_call` events.
- **Providers**: Switched to `SpanKind.CLIENT`. Implemented ABORTED as a span event with `OK` status.
- **Missing Paths**: Instrumented `triggers.ts` (`tool_trigger.execute`) and `improvement.ts` (`improvement.orchestrate`, `improvement.meta_analysis.step`, `improvement.synthesis`).

## 3. Local Metric Verification Procedure

As required, this procedure demonstrates that metrics are emitted without relying on code inspection.

### Prerequisites:
- A local OTLP collector or the following mock reflector.

### Procedure:

1. **Start the Mock Metric Reflector**:
   Create and run `metric_reflector.js`:
   ```javascript
   import http from 'node:http';
   const server = http.createServer((req, res) => {
     let body = '';
     req.on('data', chunk => { body += chunk; });
     req.on('end', () => {
       if (req.url === '/v1/metrics' && body.includes('a_society')) {
         console.log('--- [VERIFIED] Metric Packet Received ---');
         if (body.includes('session.turn.started')) console.log('Found: a_society.session.turn.started');
         if (body.includes('provider.latency')) console.log('Found: a_society.provider.latency');
       }
       res.statusCode = 200; res.end();
     });
   });
   server.listen(4318);
   ```

2. **Run a Single Turn**:
   ```bash
   export A_SOCIETY_OTLP_ENDPOINT=http://localhost:4318
   a-society
   ```
   (Converse once and exit).

3. **Verify Output**:
   The reflector logs "Found: a_society.session.turn.started" and "Found: a_society.provider.latency" upon the next export interval (default 1s for tests, or when the process exits).

## 4. Documentation Compliance

`runtime/INVOCATION.md` has been updated with a comprehensive `## Telemetry and Observability` section, covering environment variables, local setups (Jaeger/Prometheus), and operational behavior.

---
**Confirmation:** All mandatory corrections from `09-owner-integration-corrections.md` are signed off.
