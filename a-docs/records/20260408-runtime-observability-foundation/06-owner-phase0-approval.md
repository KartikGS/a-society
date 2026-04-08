**Subject:** Runtime Observability Foundation — Phase 0 Approval
**Type:** Owner → Runtime Developer
**Status:** APPROVED
**Date:** 2026-04-08
**Flow:** `20260408-runtime-observability-foundation`

---

## Approval

The revised TA Phase 0 design advisory ([`05-ta-phase0-design-revised.md`](a-society/a-docs/records/20260408-runtime-observability-foundation/05-ta-phase0-design-revised.md)) is approved.

The three blocking issues from `04-owner-to-ta.md` are resolved:

1. The interactive session trace model is now coherent: `session.interaction` wraps the full `runInteractiveSession` invocation and `session.turn` is one span per LLM call.
2. The improvement path now correctly includes `handoff.parse` coverage for typed signals.
3. The `a_society.handoff.parse_failure` metric now has a mechanically implementable emission point in `orient.ts`, where `roleKey` is directly available.

Implementation may begin.

---

## Owner Correction — Phase 1 Metric Validation Boundary

One ambiguity remains in the revised advisory: traces and metrics are both part of Phase 1, but the automated test seam is fully specified only for traces. The revised test section still phrases metric assertions as optional ("if phase-1 metric validation is included"), which leaves the Runtime Developer to decide whether metrics are part of the automated gate.

That decision is now closed:

**Phase 1 automated test gate = trace assertions only.**

Metrics remain in implementation scope for Phase 1, but they are **not** part of the required automated test harness in `runtime/test/observability.test.ts` for this flow. Metric validation is instead an **integration-record obligation** using a reproducible local telemetry sink.

Apply this correction during implementation:

- `TelemetryManager.initForTest()` remains trace-exporter-only. Do not extend the Phase 1 test seam solely to add a metric assertion harness.
- `runtime/test/observability.test.ts` must implement the trace assertions required in `05-ta-phase0-design-revised.md §6`. Do not treat in-memory metric assertions as required for gate passage in this flow.
- The parenthetical metric assertion in the "Handoff parse failure path" test scenario is **not required** in Phase 1.
- Metrics must still be implemented exactly as specified in `05-ta-phase0-design-revised.md §4`.

This is a phase-boundary decision, not a reduction in implementation scope. The observability substrate ships with both traces and minimal metrics; only the **automated validation seam** is narrowed for this flow.

---

## Implementation Scope

Implement the files and behaviors listed in `05-ta-phase0-design-revised.md §8`, subject to the metric-validation correction above.

Primary work items:

| File | Action |
|---|---|
| `runtime/src/observability.ts` | New |
| `runtime/bin/a-society.ts` | Modify |
| `runtime/src/cli.ts` | Modify |
| `runtime/src/orchestrator.ts` | Modify |
| `runtime/src/orient.ts` | Modify |
| `runtime/src/llm.ts` | Modify |
| `runtime/src/providers/anthropic.ts` | Modify |
| `runtime/src/providers/openai-compatible.ts` | Modify |
| `runtime/src/handoff.ts` | Modify |
| `runtime/src/triggers.ts` | Modify |
| `runtime/src/improvement.ts` | Modify |
| `runtime/package.json` | Modify |
| `runtime/INVOCATION.md` | Modify |
| `runtime/test/telemetry-test-helper.ts` | New |
| `runtime/test/observability.test.ts` | New |

No changes to `runtime/src/store.ts` or `runtime/src/types.ts` are required unless implementation reveals a real necessity that the advisory missed. If that happens, flag it as a deviation rather than extending scope silently.

---

## Verification Obligations

Before filing the integration record:

1. Confirm the full `runtime/` module compiles cleanly after the OpenTelemetry dependency additions and all instrumentation changes.
2. Run the new observability test file and confirm all required **trace** assertions pass.
3. Produce a reproducible local metric verification for at least:
   - `a_society.session.turn.started`
   - `a_society.provider.latency`
   The verification may use a local collector, Jaeger/Tempo-compatible OTLP sink, or another operator-local destination documented in `runtime/INVOCATION.md`, but it must be reproducible from the integration record rather than asserted narratively.
4. Confirm default behavior with `A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE` unset does **not** export prompt/completion content.
5. Confirm `A_SOCIETY_TELEMETRY_ENABLED=false` leaves the runtime functional and produces no telemetry startup warning.

Return to Owner with the integration record at `07-runtime-developer-integration-record.md`.

---

## No Proposal Required

This flow has no Proposal phase. The approved TA advisory plus this approval artifact are the implementation gate.

---

```handoff
role: Runtime Developer
artifact_path: a-society/a-docs/records/20260408-runtime-observability-foundation/06-owner-phase0-approval.md
```
