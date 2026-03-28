**Subject:** Runtime Layer — Provider Agnostic LLM Gateway — Phase 0 Architecture Design
**Status:** BRIEFED
**Date:** 2026-03-28

---

## Phase 0 Scope

The Technical Architect produces the binding architecture design for making the runtime layer's LLM Gateway provider-agnostic. The current implementation is hardwired to Anthropic (`@anthropic-ai/sdk`, `ANTHROPIC_API_KEY`, `claude-3-5-sonnet-20241022`). The goal is a design that allows the runtime to operate with different LLM providers — the user cited Gemini and Hugging Face as motivating cases alongside the current Anthropic integration.

No implementation begins until the Owner explicitly approves the design.

---

## Current State

The LLM Gateway (`runtime/src/llm.ts`) is the single interface through which the runtime calls LLMs. It is consumed by:
- `runtime/src/orient.ts` — orient session loop
- `runtime/src/orchestrator.ts` — flow orchestration loop

Current implementation characteristics:
- Hardcodes `@anthropic-ai/sdk` as the client library
- Reads `ANTHROPIC_API_KEY` from the environment
- Hardcodes the model `claude-3-5-sonnet-20241022`
- Error handling wraps Anthropic-specific error types into four generic classes: `AUTH_ERROR`, `RATE_LIMIT`, `PROVIDER_MALFORMED`, `UNKNOWN`
- `MessageParam` type is imported from the Anthropic SDK and re-exported — consumers depend on this type for message history

The error class names are already provider-neutral by name; the catch blocks that produce them are not.

---

## What the Architecture Design Must Cover

1. **Extension path evaluation** — per Advisory Standards, explicitly enumerate why the existing `LLMGateway` class can or cannot be extended in place. If a resolvable obstacle exists (a hardcoded import, a configuration gap), the conclusion should be to extend rather than bypass. If refactoring to a new pattern is warranted, enumerate the specific obstacles that make extension insufficient.

2. **Provider abstraction interface** — the interface (or type contract) that enables the runtime to swap providers. Consider: where does the interface live, what methods does it define, and how does the existing `MessageParam` type (currently Anthropic SDK-specific) factor into the contract? Provider implementations must normalize to a shared message type.

3. **Provider scope** — which providers are in scope for this flow. At minimum: Anthropic (must remain functional; existing behavior is the baseline). User cited Gemini and Hugging Face. The TA should recommend which are in scope, with rationale, and explicitly defer any that cannot be delivered within this flow without undue complexity.

4. **Provider selection configuration** — how the runtime selects a provider at startup. Evaluate: environment variable, config file, or CLI flag. The design must be usable by both the `start-flow`/`resume-flow`/`flow-status` commands (via `cli.ts`) and the `orient` command.

5. **Error normalization** — how provider-specific error types (e.g., `Anthropic.AuthenticationError`, equivalent Gemini error types) are normalized into the existing four-class error model. Each provider implementation must map its errors to `AUTH_ERROR | RATE_LIMIT | PROVIDER_MALFORMED | UNKNOWN`.

6. **Model selection** — the current model (`claude-3-5-sonnet-20241022`) is hardcoded. The design should address how model selection is handled per provider — whether hardcoded per provider, configurable, or deferred.

7. **Files Changed (§8)** — for each file affected, specify: (a) the change, (b) any non-happy-path behavioral requirements (error conditions, guards, fallback behavior), and (c) the full threading path for any new parameter added to a public function. Every behavioral requirement named in prose must be named in the §8 row for its file.

---

## Constraints

- **Technology:** TypeScript/Node.js (tsx runtime, ESM). No technology change is in scope.
- **Backward compatibility:** Existing Anthropic behavior must be preserved as the default. A runtime with no provider configuration change must continue to work as before.
- **Type export:** `MessageParam` or its replacement must remain exported from the LLM module — `orient.ts` and `orchestrator.ts` depend on it for message history typing.
- **Path convention:** No hardcoded paths in implementation. All paths via registered index variables.
- **Advisory Standards:** All seven Advisory Standards from `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` apply to this design. Pay particular attention to §8 completeness (every behavioral requirement named in prose must be named in the §8 row) and extension-before-bypass (enumerate explicitly why the existing path cannot be extended before proposing a refactor).

---

## Required Reading

Before producing the architecture design, read:

- `a-society/runtime/src/llm.ts` — current LLM Gateway implementation
- `a-society/runtime/src/orient.ts` — orient session consumer of LLMGateway
- `a-society/runtime/src/orchestrator.ts` — flow orchestration consumer of LLMGateway
- `a-society/runtime/src/types.ts` — existing runtime types; confirm no provider-specific types are present
- `a-society/runtime/package.json` — current dependencies; the design must account for what new packages are needed
- `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` — workflow governing this flow; what Phase 0 must produce and what the Owner reviews against

---

## Open Questions for the TA

These are design decisions to resolve in the Phase 0 architecture document. They do not require pre-authorization — the TA proposes; the Owner gates at Phase 0 review.

1. **Extension vs. refactor** — can the existing `LLMGateway` class be made provider-agnostic by adding a provider parameter or injection point, or does it require a structural refactor to a strategy/interface pattern? Recommend with explicit enumeration of why the extension path is or is not viable.

2. **Provider scope** — are Gemini and Hugging Face both in scope for this flow, or should one be deferred? Assess the SDK availability and API compatibility for each; recommend a scope with rationale.

3. **Message type portability** — `MessageParam` is currently an Anthropic type. Should the runtime define its own message type that all providers map to, or is there a sufficiently compatible shared type (e.g., an OpenAI-compatible interface that both Gemini and HuggingFace can use)? The decision here affects the public interface of the abstraction layer.

4. **Model configuration** — should the default model per provider be hardcoded in the provider implementation, or should it be configurable (env var, config file)? What is the right tradeoff for this flow?

---

## Gate Condition

When the architecture design is complete, return to the Owner. The Owner reviews against `$A_SOCIETY_ARCHITECTURE` (architectural invariants) and `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` for consistency with the runtime layer structure.

**Do not proceed to implementation planning until the Owner explicitly approves the architecture design.**

---

## TA Confirmation Required

Before beginning Phase 0 design, the Technical Architect must acknowledge this brief:

> "Brief acknowledged. Beginning Phase 0 architecture design for Runtime Provider Agnostic LLM Gateway."

The TA does not begin drafting until this brief has been read in full and acknowledgment is confirmed.
