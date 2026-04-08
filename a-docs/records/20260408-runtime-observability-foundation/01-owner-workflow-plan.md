---
type: owner-workflow-plan
date: "2026-04-08"
complexity:
  domain_spread: low
  shared_artifact_impact: high
  step_dependency: high
  reversibility: low
  scope_size: high
tier: 3
path:
  - Technical Architect
  - Owner
  - Runtime Developer
  - Technical Architect
  - Owner
  - Curator
  - Owner
known_unknowns:
  - "Exporter topology: direct OTLP from the runtime, collector-first topology, or direct OTLP with collector documented as the recommended deployment shape"
  - "Payload-capture policy: metadata-only by default, or explicit opt-in prompt/completion/tool payload events for deep debugging"
  - "Initial implementation slice: traces only, traces plus core metrics, or traces plus metrics plus limited log correlation"
  - "Root trace model: one trace per flow run, one trace per session turn, or both with explicit parentage"
  - "Test seam: in-memory exporter inside runtime tests, dedicated telemetry test helper, or collector-backed local fixture"
---

**Subject:** Runtime observability foundation — traces, metrics, exporter topology
**Type:** Owner Workflow Plan
**Date:** 2026-04-08

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single implementation domain — runtime only, plus operator-facing runtime invocation documentation | low |
| **2. Shared artifact impact** | Cross-cutting runtime surfaces: orchestration, session loop, provider gateway, provider adapters, handoff parsing, state persistence, tooling triggers, improvement orchestration, and operator docs | high |
| **3. Step dependency** | High — the TA must define the observability architecture, span/metric model, exporter topology, and safe capture policy before the Runtime Developer instruments multiple layers consistently | high |
| **4. Reversibility** | Low — span names, metric names, resource attributes, env vars, enablement defaults, and payload-capture policy become operator and test contracts once shipped | low |
| **5. Scope size** | High — likely touches `orchestrator.ts`, `orient.ts`, `llm.ts`, both providers, `handoff.ts`, `store.ts`, `triggers.ts`, `improvement.ts`, runtime bootstrap, `package.json`, `INVOCATION.md`, and new test coverage | high |

**Verdict:** Tier 3 — full Runtime Dev workflow. The work is cross-cutting and architecture-sensitive: if we instrument ad hoc, we will get provider-level traces that do not line up with flow-level behavior, and we will still be blind at the orchestration boundary the human is trying to debug.

---

## Routing Decision

Tier 3 via the Runtime Dev workflow. The Phase 0 TA design gate is mandatory because this work establishes a runtime-wide observability contract: bootstrap location, tracer and meter lifecycle, span hierarchy, metric schema, exporter topology, capture policy, and test seam. Those decisions must be coherent before implementation begins.

**Direction already resolved:** OpenTelemetry is the runtime's instrumentation substrate. LangSmith may be supported as a downstream OTLP destination or documented operator option, but it is not the primary runtime abstraction and must not become a dependency that reshapes the runtime around LangSmith-specific primitives.

**Merge assessment:** The existing Next Priorities item `Runtime integration test infrastructure` is adjacent but not merged into this flow. Both items aim to improve runtime debuggability, but the open log item targets reusable test harness and integration-record format, while this flow targets runtime observability architecture and instrumentation boundaries. Same workflow path, compatible authority, different primary design area and target files.

---

## Path Definition

1. **Technical Architect** — Phase 0 design: specify the runtime observability architecture, including bootstrap location, tracer and meter lifecycle, root span model, required child spans and events, metrics surface, exporter topology, payload/redaction policy, test seam, and operator-facing configuration.
2. **Owner** — Phase 0 gate: review the TA design against the human's goal ("runtime must become observable enough to test effectively"), the runtime architecture, and the OpenTelemetry-first direction before any implementation begins.
3. **Runtime Developer** — Implementation: add the observability substrate and instrument the runtime per the approved design.
4. **Runtime Developer** → **Technical Architect** — Integration validation and TA review.
5. **Owner** — Integration gate.
6. **Curator** — Registration and accuracy updates: update `$A_SOCIETY_RUNTIME_INVOCATION` and any affected index/guide surfaces required by the shipped operator-facing observability surface.
7. **Owner** — Forward pass closure.

---

## Known Unknowns

- Exporter topology: direct OTLP from the runtime, collector-first topology, or direct OTLP with collector documented as the recommended production shape.
- Payload-capture policy: metadata-only by default, or explicit opt-in prompt/completion/tool payload events for deep debugging.
- Initial implementation slice: traces only, traces plus core metrics, or traces plus metrics plus limited log correlation.
- Root trace model: one trace per flow run, one trace per session turn, or both with explicit parentage.
- Test seam: in-memory exporter inside runtime tests, dedicated telemetry test helper, or collector-backed local fixture.
