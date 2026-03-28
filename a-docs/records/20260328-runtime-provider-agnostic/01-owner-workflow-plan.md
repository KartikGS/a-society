---
type: owner-workflow-plan
date: "2026-03-28"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: elevated
  reversibility: moderate
  scope_size: moderate
tier: 3
path:
  - "Owner — Intake & Briefing"
  - "Technical Architect — Phase 0 Architecture Design"
  - "Owner — Phase 0 Gate"
  - "Runtime Developer — Implementation"
  - "Runtime Developer — Integration Validation"
  - "Technical Architect — Integration Review"
  - "Owner — Integration Gate"
  - "Curator — Registration"
  - "Owner — Forward Pass Closure"
known_unknowns:
  - "Provider abstraction interface design — which interface(s) are needed, how they compose with the existing LLMGateway class, and whether the strategy pattern or another approach is preferable"
  - "Provider scope — which providers (at minimum Anthropic; user requested Gemini and Hugging Face) are in scope for this flow vs. deferred to future flows"
  - "Provider selection configuration model — how the runtime selects a provider at startup (env var, config file, or CLI flag)"
  - "Whether runtime/INVOCATION.md requires structural changes or only additive content"
---

**Subject:** Runtime Layer — Provider Agnostic LLM Gateway
**Type:** Owner Workflow Plan
**Date:** 2026-03-28

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single domain — runtime layer only. No `general/` changes anticipated. | low |
| **2. Shared artifact impact** | Modifies `runtime/src/llm.ts` (core runtime component used by all sessions), `runtime/package.json` (new provider SDK dependencies), `runtime/INVOCATION.md` (documentation update). Public index may gain new entries if new source files are registered. | moderate |
| **3. Step dependency** | High dependency: the TA must design the provider abstraction interface — which interface(s) exist, how provider selection is configured, what the env var contract is — before any implementation can begin. Later phases execute against that design. | elevated |
| **4. Reversibility** | Architectural refactor of the core LLM Gateway; not trivially undone. Existing Anthropic behavior must be preserved as the default. | moderate |
| **5. Scope size** | Multiple runtime files (`llm.ts` refactored, new provider implementation files, `package.json`, `INVOCATION.md`). Four roles engaged. | moderate |

**Verdict:** Tier 3 — Full Pipeline. The Runtime Development workflow mandates a Phase 0 TA architecture design gate before any implementation; step dependency on the TA's interface design is elevated; scope spans multiple roles.

---

## Routing Decision

Routes through the **Runtime Development** workflow (full pipeline). The Phase 0 TA architecture design gate is the structural prerequisite: the provider abstraction interface, configuration model, and provider scope must be designed before implementation begins. The complexity-derived tier is 3; the Runtime Dev workflow enforces this by structure.

---

## Path Definition

1. Owner — Intake & Briefing (this artifact + TA brief)
2. Technical Architect — Phase 0 Architecture Design
3. Owner — Phase 0 Gate (TA design review & approval)
4. Runtime Developer — Implementation
5. Runtime Developer — Integration Validation
6. Technical Architect — Integration Review
7. Owner — Integration Gate
8. Curator — Registration
9. Owner — Forward Pass Closure

---

## Known Unknowns

1. **Provider abstraction interface design** — which interface(s) are needed, how they compose with the existing `LLMGateway` class, and whether a strategy pattern, interface-based polymorphism, or another approach is preferable. Left to the TA.
2. **Provider scope** — which providers are in scope for this flow. User cited Gemini and Hugging Face as motivating cases alongside Anthropic. The TA should recommend a scope with rationale; defer any providers not feasible within this flow.
3. **Provider selection configuration model** — how the runtime selects a provider at startup (env var, config file, CLI flag, or combination). Left to the TA.
4. **INVOCATION.md scope** — whether provider configuration documentation requires structural changes to the file or only additive content. Left to the TA's Files Changed assessment.
