---
type: owner-workflow-plan
date: "2026-03-28"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: elevated
  reversibility: moderate
  scope_size: elevated
tier: 3
path:
  - Owner — Intake & Briefing
  - Technical Architect — Phase 0 Architecture Design
  - Owner — Phase 0 Review & Gate
  - Runtime Developer — Implementation
  - Runtime Developer — Integration Validation
  - Technical Architect — Integration Assessment
  - Owner — Integration Gate
  - Curator — Registration
  - Owner — Forward Pass Closure
known_unknowns:
  - "Whether the agentic tool loop belongs in each provider or in the shared LLMGateway"
  - "How RuntimeMessageParam should represent tool call and tool result messages across provider formats"
  - "Whether orient.ts requires modification or if the tool loop is transparent through executeTurn"
  - "Exact path sandboxing strategy for the file tools"
  - "Whether max_tokens: 8192 in openai-compatible.ts is sufficient for tool-call turns with large file payloads"
---

**Subject:** runtime-tool-calling — Add file tool calling capability to the runtime layer
**Type:** Owner Workflow Plan
**Date:** 2026-03-28

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single domain — all changes in `runtime/src/`. No `general/` changes; Curator registration only. | low |
| **2. Shared artifact impact** | `LLMProvider` interface and `RuntimeMessageParam` type in `types.ts` are shared across all runtime components; both providers must be updated. `INVOCATION.md` update required. | moderate |
| **3. Step dependency** | Phase 0 TA design is non-negotiable — the interface design (turn loop placement, type changes, tool schemas) drives everything the Developer implements. Cannot begin implementation without it. | elevated |
| **4. Reversibility** | Changes are isolated to `runtime/` but break the existing `LLMProvider` interface contract across both providers. Rollback requires reverting all provider changes simultaneously. | moderate |
| **5. Scope size** | ~6 existing files modified (`types.ts`, `llm.ts`, `orient.ts`, `anthropic.ts`, `openai-compatible.ts`, `INVOCATION.md`), one or more new modules (tool executor). Three roles: TA, Runtime Developer, Curator. | elevated |

**Verdict:** Tier 3 — Step dependency and scope size are elevated; the Runtime Dev workflow mandates the full pipeline by design. Phase 0 gate is structural.

---

## Routing Decision

Routes through the Runtime Development workflow (`$A_SOCIETY_WORKFLOW_RUNTIME_DEV`). Tier 3 is confirmed by the workflow structure itself: Phase 0 TA architecture design gate, Developer implementation phases, integration validation gate, Curator registration, and forward pass closure are all mandatory for any runtime implementation. The two elevated axes (step dependency, scope size) are consistent with this tier.

---

## Path Definition

1. Owner — Intake & Briefing (this artifact + TA brief)
2. Technical Architect — Phase 0 Architecture Design
3. Owner — Phase 0 Review & Gate
4. Runtime Developer — Implementation
5. Runtime Developer — Integration Validation
6. Technical Architect — Integration Assessment
7. Owner — Integration Gate
8. Curator — Registration
9. Owner — Forward Pass Closure

---

## Known Unknowns

1. Whether the agentic tool loop (call → tool calls → execute → call again) belongs inside each provider's `executeTurn` or in the shared `LLMGateway` — key architectural decision with implications for interface stability.
2. How `RuntimeMessageParam` should represent tool call and tool result messages — the Anthropic and OpenAI SDK formats differ; the TA must decide whether to normalize to a common internal representation or handle the divergence at the provider boundary.
3. Whether `orient.ts` requires modification or whether the tool loop is fully transparent through the existing `executeTurn` call signature.
4. Exact path sandboxing strategy for `read_file` and `write_file` — workspace root constraint enforcement, path traversal prevention.
5. Whether `max_tokens: 8192` in `openai-compatible.ts` is sufficient for tool-call turns where file content may be large.
