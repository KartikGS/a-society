**Subject:** Runtime Observability Foundation — Integration Approved, Curator Registration
**Type:** Owner → Curator
**Status:** APPROVED
**Date:** 2026-04-08
**Flow:** `20260408-runtime-observability-foundation`

---

## Integration Gate Passed

The integration gate is approved.

I reviewed the third TA integration pass in [`14-ta-integration-review-3.md`](a-society/a-docs/records/20260408-runtime-observability-foundation/14-ta-integration-review-3.md), rechecked the implementation directly, and reran the current verification commands in `runtime/`:

- `./node_modules/.bin/tsc --noEmit`
- `npx tsx test/observability.test.ts`

Both passed on review.

The runtime now has a working OpenTelemetry substrate, production-path observability tests for the load-bearing runtime paths, corrected provider and gateway telemetry schema for the previously-blocking areas, updated operator-facing telemetry documentation in `runtime/INVOCATION.md`, and reproducible local metric verification evidence in the developer resubmission record.

---

## What This Flow Added

This flow establishes the first real observability foundation for the A-Society runtime:

1. **Runtime telemetry bootstrap** — OpenTelemetry initialization, OTLP export wiring, resource metadata, payload-capture guardrails, and shutdown handling.
2. **Trace coverage across the runtime stack** — orchestration spans, session/turn spans, handoff parsing, gateway/provider execution, trigger execution, and improvement orchestration.
3. **Minimal runtime metrics** — including `a_society.session.turn.started`, `a_society.session.turn.duration`, `a_society.flow.started`, `a_society.flow.completed`, `a_society.handoff.parse_failure`, and `a_society.provider.latency`.
4. **Operator-facing runtime documentation** — telemetry configuration, local OTLP setup, and runtime behavior notes in `runtime/INVOCATION.md`.
5. **A deterministic test seam** — dedicated telemetry test helpers plus production-path observability tests in `runtime/test/observability.test.ts`.

Primary runtime files touched by this flow include:
`runtime/src/observability.ts`, `runtime/src/orchestrator.ts`, `runtime/src/orient.ts`, `runtime/src/llm.ts`, `runtime/src/handoff.ts`, `runtime/src/triggers.ts`, `runtime/src/improvement.ts`, `runtime/src/providers/anthropic.ts`, `runtime/src/providers/openai-compatible.ts`, `runtime/bin/a-society.ts`, `runtime/src/cli.ts`, `runtime/INVOCATION.md`, `runtime/test/telemetry-test-helper.ts`, `runtime/test/observability.test.ts`

---

## Curator Registration Scope

### 1. Verify `$A_SOCIETY_RUNTIME_INVOCATION`

Read `runtime/INVOCATION.md` in full and verify it accurately reflects the implemented operator-facing telemetry surface.

Confirm at minimum:

- `A_SOCIETY_TELEMETRY_ENABLED`
- `A_SOCIETY_OTLP_ENDPOINT`
- `A_SOCIETY_OTLP_HEADERS`
- `A_SOCIETY_TELEMETRY_PAYLOAD_CAPTURE`
- `A_SOCIETY_ENVIRONMENT`
- the stated default of `production` for `A_SOCIETY_ENVIRONMENT`
- the local OTLP/Jaeger setup guidance
- the runtime warning behavior for malformed headers and SDK startup failure
- the note that payload capture is opt-in and potentially sensitive

Do not "correct" the documentation back to advisory-era names or defaults that the implementation does not use. The implementation is authoritative at registration time.

### 2. Account for known implementation observations without reopening the gate

The following are known, non-blocking observations carried forward from the TA review:

- `triggers.ts` still has telemetry attribute gaps relative to the original Phase 0 spec and contains a redundant `span.end()` in the no-match branch.
- `improvement.ts` still omits several non-critical telemetry attributes/events from the original Phase 0 spec.
- The latest observability test file no longer includes the earlier explicit parse-failure counter assertion.

These do **not** block registration. They are follow-up quality items, not integration-gate failures.

If `runtime/INVOCATION.md` or any index description references internal telemetry schema or test coverage in a way that would imply stronger guarantees than the implementation currently provides, correct the wording to match the actual runtime. If those internals are not described publicly, no extra prose is required.

### 3. Public index and records registration

Verify whether the description of `$A_SOCIETY_RUNTIME_INVOCATION` in `$A_SOCIETY_PUBLIC_INDEX` still adequately describes the now-expanded runtime invocation reference. Update it only if the current description is too narrow for the telemetry additions.

Register this flow's `a-docs/records/20260408-runtime-observability-foundation/` artifacts per normal Curator practice in `$A_SOCIETY_INDEX` and verify `$A_SOCIETY_AGENT_DOCS_GUIDE` remains accurate.

`runtime/src/` implementation files remain non-indexed implementation details.

### 4. Update report assessment

Consult `$A_SOCIETY_UPDATES_PROTOCOL` and determine whether this runtime observability foundation warrants a framework update report. The flow modified runtime behavior and operator documentation, but no `general/` library materials.

---

## Return Artifact

Return to Owner with the next artifact in this record folder after Curator registration is complete.

---

```handoff
role: Curator
artifact_path: a-society/a-docs/records/20260408-runtime-observability-foundation/15-owner-integration-approval.md
```
