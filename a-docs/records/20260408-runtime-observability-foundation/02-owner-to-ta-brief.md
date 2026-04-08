**Subject:** Runtime Observability Foundation — TA Phase 0 Design
**Type:** Owner → Technical Architect Brief
**Date:** 2026-04-08
**Flow:** `20260408-runtime-observability-foundation`

---

## Context

The human reports a structural gap: the A-Society runtime is currently "flying completely blind," which makes effective runtime testing and debugging difficult. They asked whether LangSmith or OpenTelemetry is the better fit for this project. That direction decision is now complete:

- **OpenTelemetry is the better fit for the runtime's instrumentation substrate.**
- **LangSmith remains in scope only as an optional downstream OTLP destination or documented operator integration, not as the runtime's primary instrumentation model.**

The reason is architectural. A-Society's runtime is a custom TypeScript/Node orchestrator with its own flow state machine, handoff routing, session lifecycle, improvement orchestration, and provider abstraction. The observability target is the runtime as a system, not only the LLM calls. The current runtime has no telemetry packages or instrumentation surface in `runtime/package.json`; no bootstrap module for tracing or metrics; and no runtime-wide trace or metric model spanning:

- `runtime/src/orchestrator.ts`
- `runtime/src/orient.ts`
- `runtime/src/llm.ts`
- `runtime/src/providers/anthropic.ts`
- `runtime/src/providers/openai-compatible.ts`
- `runtime/src/handoff.ts`
- `runtime/src/store.ts`
- `runtime/src/triggers.ts`
- `runtime/src/improvement.ts`

The human's goal is not observability for observability's sake. The goal is to make the runtime observable enough that we can test it effectively, diagnose failures structurally, and compare behavior across interactive, autonomous, and improvement-phase execution paths.

---

## Files Changed Summary

| File | Expected Action | Why it is in scope |
|---|---|---|
| `a-society/runtime/src/orchestrator.ts` | modify | Flow-level orchestration spans, node-transition events, state/status transitions |
| `a-society/runtime/src/orient.ts` | modify | Session-turn spans, interactive/autonomous boundaries, abort and prompt-human behavior |
| `a-society/runtime/src/llm.ts` | modify | Gateway-level spans, tool-round events, token metrics correlation |
| `a-society/runtime/src/providers/anthropic.ts` | modify | Provider-level spans and usage metadata |
| `a-society/runtime/src/providers/openai-compatible.ts` | modify | Provider-level spans and usage metadata |
| `a-society/runtime/src/handoff.ts` | modify | Handoff parse success/failure telemetry |
| `a-society/runtime/src/store.ts` | modify | Persistence and state I/O telemetry |
| `a-society/runtime/src/triggers.ts` | modify | Tool-trigger invocation telemetry |
| `a-society/runtime/src/improvement.ts` | modify | Improvement-phase telemetry |
| `a-society/runtime/src/types.ts` | modify | Telemetry config/types if required by the design |
| `a-society/runtime/src/cli.ts` and/or `a-society/runtime/bin/a-society.ts` | modify | Telemetry bootstrap and shutdown hook location (TA to choose exact bootstrap point) |
| `a-society/runtime/src/observability.ts` | add if needed | Canonical telemetry bootstrap/helpers module if the TA recommends a dedicated module |
| `a-society/runtime/package.json` | modify | OpenTelemetry dependencies and any developer/test scripts |
| `a-society/runtime/INVOCATION.md` | modify | Operator-facing observability setup and configuration |
| `a-society/runtime/test/` | add/modify | Deterministic telemetry validation path |

---

## Hard Constraints

These are not open for redesign.

1. **OpenTelemetry is the instrumentation substrate.** The advisory may describe LangSmith only as an OTLP destination or operator-facing downstream option. Do not redesign the runtime around LangSmith-specific SDK primitives.
2. **Preserve the current custom runtime architecture.** Do not introduce LangChain, LangGraph, or another external agent framework as the means of obtaining observability.
3. **Instrument the runtime as a system, not only model calls.** The architecture must cover orchestration, session loop, provider calls, handoff parsing, tooling triggers, persistence, and improvement orchestration.
4. **The design must support local deterministic validation.** The Runtime Developer must be able to verify emitted telemetry in automated tests without requiring a commercial backend or a permanently running external observability service.
5. **Operator-facing configuration is in scope.** Any env vars, enablement defaults, endpoint assumptions, or recommended collector/backend shapes must be reflected in the runtime's operator surface.
6. **Cross-provider symmetry is required at the provider boundary.** Anthropic and OpenAI-compatible code paths should emit comparable provider-level telemetry for shared runtime concerns.

---

## Owner Preferences for TA Evaluation

These are preferences, not hard constraints. Evaluate them and surface a better alternative if one exists.

1. **Preferred initial slice:** traces are mandatory; a small core metric set is strongly preferred; full log ingestion/correlation is probably later-phase work unless the TA finds a clean low-cost design.
2. **Preferred default capture policy:** metadata-only by default, with explicit opt-in if prompt/completion/tool payload capture is offered. The runtime injects project-specific context and artifacts; default external export of raw content is not the preferred baseline.
3. **Preferred deployment shape:** standard OTLP exporter(s) with a collector-compatible topology so we can fan out to LangSmith or another backend later without rewriting instrumentation.

---

## What the Advisory Must Cover

### §1 — Observability Objectives and Success Criteria

Define what "runtime is observable enough to test effectively" means in concrete terms for this project:

- Which runtime questions must become answerable after Phase 1? Examples: why a node advanced, why a session aborted, which provider/model path ran, whether a tool-call round occurred, why a handoff parse failed, why the runtime entered `awaiting_human`, where latency accumulated.
- Which execution paths must the design cover explicitly? At minimum: interactive session turns, autonomous turns, prompt-human loops, forward-pass closure, and improvement-phase orchestration.
- What is the minimum operator outcome? Example categories: "I can trace a single flow end to end," "I can see provider latency and token usage in trace context," "I can assert expected spans in integration tests."

### §2 — Telemetry Bootstrap and Export Architecture

Specify the runtime's OpenTelemetry bootstrap shape:

- Where telemetry is initialized and shut down. Name the exact bootstrap point in the runtime entry path.
- Whether the runtime should use `NodeSDK` or a lower-level tracer/meter bootstrap, with rationale.
- Resource attributes and service identity: service name, runtime component/version identity, environment labeling, and any project/run identifiers that belong at the resource layer rather than span attributes.
- Export topology: direct OTLP from the runtime, collector-first, or direct OTLP with collector documented as the recommended deployment pattern.
- How LangSmith is represented in the design if included at all: direct OTLP destination, collector fan-out example, or explicit out-of-scope note for Phase 1.
- Startup behavior when telemetry is disabled, partially configured, or exporter initialization fails.

### §3 — Trace Model

Specify the trace architecture in enough detail that the Runtime Developer can implement it without inventing boundaries:

- Root trace strategy: one trace per flow run, one trace per session turn, or both with explicit parentage.
- Required spans, their parent/child relationships, and exact responsibilities for at least these operations:
  - `FlowOrchestrator.startUnifiedOrchestration`
  - `FlowOrchestrator.advanceFlow`
  - `runInteractiveSession`
  - `LLMGateway.executeTurn`
  - each provider `executeTurn`
  - `HandoffInterpreter.parse`
  - `ToolTriggerEngine.evaluateAndTrigger`
  - `SessionStore` load/save operations
  - `ImprovementOrchestrator.handleForwardPassClosure`
- Required span attributes and events. At minimum, address `flowId`, role, node id, session id, provider, model, autonomous vs. interactive, handoff kind, tool round count, token usage, and terminal outcome.
- Error and abnormal-path representation: aborts, parse failures, retryable errors, awaiting-human suspension, and forward-pass closure signals.
- Whether any message/tool payload bodies appear as span attributes or events, and under what enablement rules.

### §4 — Metrics Model

Specify the metric surface for the first implementation slice:

- Which counters, histograms, and gauges are required.
- Minimum categories to evaluate: flow starts/completions/failures, session turns, provider call latency, token usage, tool-call rounds, handoff parse failures, awaiting-human suspensions, and tool-trigger success/failure.
- Which dimensions/tags are allowed on metrics, and which are too high-cardinality to ship safely.
- Where each metric is emitted, and how it correlates to the trace model.
- Whether any phase-1 metrics should be omitted because they are better represented as trace events.

### §5 — Payload Capture and Privacy Policy

Specify the safe default and any opt-in deep-debug mode:

- Which identifiers are safe to emit by default and which are not.
- Whether repo-relative artifact paths are safe to export; if yes, state the rule. If no, specify the alternative representation.
- Whether project root paths, full prompts, full completions, tool results, or injected context bodies are emitted anywhere by default.
- If payload capture is available in an opt-in mode, specify the enablement mechanism, scope, and failure behavior when disabled.
- If the advisory recommends GenAI semantic conventions, specify how their current maturity affects the design and whether they are required or optional in Phase 1.

### §6 — Testing and Validation Seam

The human's stated reason for this work is effective runtime testing. The advisory must therefore define the validation seam, not only the production exporter:

- How tests collect telemetry deterministically: in-memory exporter, dedicated test helper, local collector fixture, or another concrete path.
- How the Runtime Developer should validate both traces and any phase-1 metrics without relying on screenshots or third-party UI inspection.
- Which runtime scenarios must have telemetry assertions in automated tests. At minimum evaluate: successful node handoff, prompt-human suspension/resume, provider tool-call turn, handoff parse failure path, and forward-pass closure to improvement selection.
- Whether the design should introduce a dedicated telemetry test module or helper and where it lives.

### §7 — Operator Surface

Specify what the operator-facing runtime documentation must say:

- How telemetry is enabled or disabled.
- Which env vars are required, optional, or unsupported.
- What a recommended local development setup looks like.
- How LangSmith is documented if supported as an OTLP destination.
- Whether there is any operator-visible terminal behavior associated with telemetry (for example, explicit startup warnings when telemetry is enabled but exporter config is invalid).

### §8 — Files Changed

Provide a files-changed summary table naming the exact repo-relative files to be modified or created, with expected action per file. If the design requires new imports in existing files, name them explicitly. If the design introduces a dedicated telemetry module, state whether all runtime layers call into it directly or whether wrappers/helpers mediate the calls.

---

## Constraints

- The advisory must be implementable as a single Runtime Developer implementation track.
- Do not assume a commercial backend is available during development or CI validation.
- Do not make OpenTelemetry JS logs a prerequisite for Phase 1 unless the advisory explicitly justifies that choice against current maturity and complexity cost.
- If the advisory uses GenAI semantic conventions, specify the version/opt-in expectation rather than assuming a stable default contract.
- Do not hardcode a single backend vendor into the runtime's primary telemetry interface.
- Telemetry bootstrap must not require duplicate initialization across repeated tests or resumed runtime sessions.
- Do not pre-specify update report classification. That remains Curator-determined post-implementation via `$A_SOCIETY_UPDATES_PROTOCOL`.

---

## Open Questions for TA Resolution

1. What is the correct root trace boundary for this runtime: flow-level, turn-level, or both?
2. Should the recommended production topology be collector-first, or is direct OTLP from the runtime the better default for A-Society at its current scale?
3. Should LangSmith appear in Phase 1 operator docs as a worked OTLP destination example, or remain outside the initial operator surface while the substrate stays vendor-neutral?
4. Is metadata-only default plus opt-in payload capture the right safety/performance tradeoff, or is there a cleaner design for deep debugging?
5. Which observability surface belongs in Phase 1: traces only, or traces plus a minimal metric set?
6. Are `SessionStore` and other filesystem operations better represented as spans, metric-only signals, or a mixed model?

---

## Deliverable

A single TA advisory artifact filed as `03-ta-phase0-design.md` in this record folder.

The advisory must give the Runtime Developer a complete Phase 0 design for the observability foundation: bootstrap architecture, trace model, metric model, payload policy, test seam, operator surface, and files-changed table. It should be specific enough that the Developer does not have to invent telemetry boundaries, attribute names, or enablement behavior during implementation.

Return to Owner when the advisory is complete.
