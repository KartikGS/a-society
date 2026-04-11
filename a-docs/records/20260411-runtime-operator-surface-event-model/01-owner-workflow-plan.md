---
type: owner-workflow-plan
date: "2026-04-11"
complexity:
  domain_spread: low
  shared_artifact_impact: high
  step_dependency: high
  reversibility: high
  scope_size: high
tier: 3
path:
  - Owner
  - Technical Architect
  - Owner
  - Orchestration Developer
  - Technical Architect
  - Owner
  - Curator
  - Owner
known_unknowns:
  - "Event taxonomy: which operator-visible runtime notices are required, how they are categorized (status, warning, repair, closure), and which surfaces remain intentionally silent"
  - "Render boundary: whether operator events should be emitted as stderr status lines, stdout-delimited system lines, or through a small dedicated renderer that owns both channels"
  - "Parallel-track visibility model: how active nodes, deferred nodes, and pending joins should be surfaced during live execution, and whether `flow-status` is sufficient or needs complementary inline notices"
  - "Repair-loop contract: how malformed handoffs, validator repairs, and retry attempts should be shown to the operator without dumping raw internal prompts or creating output clutter"
  - "Token fallback policy: what the runtime should display when provider usage is unavailable or partial, and how to distinguish 'usage unavailable' from zero values"
  - "Presentation-surface boundary: whether the first-class event model should live entirely in the current runtime terminal surfaces or whether the TA should recommend an additional operator surface as a follow-on"
---

**Subject:** Runtime operator surface — event model, repair visibility, parallel tracks
**Type:** Owner Workflow Plan
**Date:** 2026-04-11

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single executable domain — runtime behavior plus the operator-facing runtime reference | low |
| **2. Shared artifact impact** | Cross-cutting operator surface: orchestration lifecycle, interactive turn loop, handoff/repair messaging, token/liveness display, `flow-status` visibility, and `$A_SOCIETY_RUNTIME_INVOCATION` | high |
| **3. Step dependency** | High — the TA must define one coherent event/rendering contract before the Orchestration Developer changes fragmented notices across `orchestrator.ts`, `orient.ts`, provider output, validation failures, and parallel-node surfacing | high |
| **4. Reversibility** | High — once the runtime ships a first-class event taxonomy, output-channel boundary, and repair/closure semantics, those become operator expectations and a standing surface contract | high |
| **5. Scope size** | High — likely touches orchestration, interactive session output, handoff parsing/repair messaging, visualization, provider-facing token/liveness hooks, operator docs, and test coverage | high |

**Verdict:** Tier 3 — full Executable Dev workflow. The work is cross-cutting, contract-setting, and architecture-sensitive. A TA design gate is required before implementation begins.

---

## Routing Decision

Tier 3 via the Executable Development workflow. The active implementation path is the **Orchestration Developer** track unless the TA identifies a genuine framework-service slice that cannot remain within orchestration.

The TA Phase 0 design gate is mandatory. The current runtime already has fragments of an operator surface — provider spinners, token lines, tool-call notices, bootstrap messages, and `flow-status` rendering — but no unified contract for which notices are operator-visible, where they render, or how repair loops and parallel nodes should appear. Implementing directly would harden more ad hoc console behavior instead of a deliberate operator surface.

**Absorbed Next Priorities item:** `[S][RUNTIME]` **Runtime schema/repair prompt single-source alignment** — merged into this flow. Same workflow type, same Orchestration Developer path, and same operator-facing repair/visibility design area. The Phase 0 design must define both the surfaced repair events and the validator/repair-message contract so repair notices reflect the live schema rather than stale hardcoded examples. Removed from Next Priorities at intake.

**Merge assessment:** `Runtime integration test infrastructure` remains separate. It is adjacent and should inform verification scope, but its primary design area is reusable test harness and validation format, not the operator event model itself.

---

## Path Definition

1. **Owner** — Intake complete: perform overlap sweep, create the record folder and `workflow.md`, remove merged Next Priorities items from the queue, and issue the TA Phase 0 brief.
2. **Technical Architect** — Phase 0 design: define the runtime event taxonomy, rendering/channel rules, repair-loop surfacing, active/pending parallel-track visibility model, presentation-surface boundary, files-changed table, and verification expectations.
3. **Owner** — Phase 0 gate: review the TA design against the human's operator-visibility goals, current runtime architecture, and executable-role boundaries before implementation begins.
4. **Orchestration Developer** — Implementation: implement the approved operator-surface event model in `runtime/`, including any required updates to `$A_SOCIETY_RUNTIME_INVOCATION`.
5. **Technical Architect** — Integration review: verify implementation alignment with the approved event contract, including repair-path surfacing, transition notices, token fallback behavior, and any parallel-track visibility surface.
6. **Owner** — Integration gate.
7. **Curator** — Registration and accuracy checks: verify any changed standing docs, index descriptions, and operator-facing references against the live implementation.
8. **Owner** — Forward pass closure.

---

## Known Unknowns

- Event taxonomy: which runtime/system notices are required, and which ones are intentionally omitted to avoid noise.
- Render boundary: whether operator events should live on `stderr`, `stdout`, or a coordinated dual-channel renderer.
- Parallel-track visibility model: how active nodes, deferred nodes, and pending joins should appear live and in `flow-status`.
- Repair-loop contract: how the runtime should show malformed handoff repairs, workflow validation failures, and retry attempts.
- Token fallback policy: what exact notice appears when provider token usage is unavailable or only partially known.
- Presentation-surface boundary: whether the current runtime terminal surfaces can express the full event model clearly enough, or whether an additional operator surface should be proposed as a follow-on.
