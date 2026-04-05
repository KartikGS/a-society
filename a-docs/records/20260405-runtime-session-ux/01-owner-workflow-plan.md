---
type: owner-workflow-plan
date: "2026-04-05"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: high
  reversibility: low
  scope_size: moderate
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
  - "Interrupt behavior: whether abort discards the in-flight turn and resumes the session, or presents a menu (discard / exit / pause)"
  - "How abort interacts with mid-tool-round execution — whether in-progress tool calls are allowed to complete before abort is honored"
  - "Liveness display form: spinner-before-first-token only, or a persistent status line that survives throughout streaming"
  - "Token accumulation granularity: per-turn display only, or cumulative session total, or both"
  - "Whether stream_options: { include_usage: true } is safe to assume universal across OpenAI-compatible endpoints, or requires a capability check"
---

**Subject:** Runtime session UX — interrupt, liveness, token visibility
**Type:** Owner Workflow Plan
**Date:** 2026-04-05

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single domain — runtime only; all changes live within `runtime/src/` and `runtime/INVOCATION.md` | low |
| **2. Shared artifact impact** | `LLMProvider` interface (`types.ts`) is an internal contract shared by both providers; `runtime/INVOCATION.md` is the operator-facing surface | moderate |
| **3. Step dependency** | High — the TA must define the interface contract (abort signal threading, usage fields in `ProviderTurnResult`, liveness hook) before either provider can implement; the two providers must implement symmetrically against the same contract | high |
| **4. Reversibility** | Abort signal adds new behavior to the interactive session loop; liveness display hooks into the streaming path; poorly reversible once callers depend on the new contract | low |
| **5. Scope size** | `types.ts`, `providers/anthropic.ts`, `providers/openai-compatible.ts`, `llm.ts`, at minimum one of `orient.ts` / `orchestrator.ts` for liveness and interrupt wiring, `INVOCATION.md` | moderate |

**Verdict:** Tier 3 — Step dependency is the primary driver: the TA must design the interface contract before implementation can begin across both providers. The cross-provider symmetry requirement and operator-facing surface changes confirm the full pipeline is warranted.

---

## Routing Decision

Tier 3 via the Runtime Dev workflow. The TA Phase 0 design gate is mandatory: the interface contract changes (`LLMProvider`, `ProviderTurnResult`, abort signal threading) must be specified before either provider implements anything. Implementing without this gate would produce two providers with incompatible abort and usage-reporting shapes that the gateway would then need to reconcile.

**Absorbed Next Priorities item:** `[S][RUNTIME]` Runtime invocation / CLI surface convergence — merged into this flow. The TA Phase 0 design scope explicitly includes resolving the legacy wrapper / CLI surface reconciliation question. Same target file (`$A_SOCIETY_RUNTIME_INVOCATION`), compatible authority, same workflow path. Removing from Next Priorities.

---

## Path Definition

1. **Technical Architect** — Phase 0 design: specify the full interface contract for (a) abort signal threading from session layer through gateway to provider, (b) usage reporting shape in `ProviderTurnResult` and accumulation model, (c) liveness hook design (where spinner starts/stops relative to streaming pipeline), (d) CLI surface resolution — decide legacy wrapper disposition and design the operator-facing surface for the new UX features together.
2. **Owner** — Phase 0 gate: review and approve the TA design before any implementation begins.
3. **Runtime Developer** — Implementation: implement across both providers and the gateway/session layer per the approved design.
4. **Runtime Developer** → **Technical Architect** — Integration validation and TA review.
5. **Owner** — Integration gate.
6. **Curator** — Registration: update `$A_SOCIETY_RUNTIME_INVOCATION` and `$A_SOCIETY_INDEX` for any newly registered artifacts; update `$A_SOCIETY_AGENT_DOCS_GUIDE`.
7. **Owner** — Forward pass closure.

---

## Known Unknowns

- Interrupt behavior: whether abort discards the in-flight turn and resumes the session, or presents a menu (discard / exit / pause). The TA should decide based on what preserves session state correctly.
- How abort interacts with mid-tool-round execution — whether in-progress tool calls are allowed to complete before abort is honored, or the loop is cut immediately.
- Liveness display form: spinner-before-first-token only, or a persistent status line (agent name, phase, elapsed time, token count) that persists throughout streaming.
- Token accumulation granularity: per-turn display only, cumulative session total, or both — and whether the display appears inline with output or as a distinct line at turn end.
- Whether `stream_options: { include_usage: true }` is safe to assume universal across OpenAI-compatible endpoints, or whether a capability check / opt-in env var is needed.
