**Subject:** Runtime Layer — Provider Agnostic LLM Gateway — Phase 0 Gate Decision
**Status:** APPROVED
**Date:** 2026-03-28

---

## Decision

The Phase 0 architecture design (`03-ta-architecture-design.md`) is approved. It is the binding specification for all Runtime Developer implementation work in this flow. Implementation may begin.

---

## Rationale

The design is consistent with `$A_SOCIETY_ARCHITECTURE` on every dimension and satisfies all six Owner review criteria from the TA's handoff.

**Extension-before-bypass satisfied.** §1 enumerates four concrete obstacles in the existing `LLMGateway`, evaluates two extension models (fat dispatcher vs. delegation), and correctly selects the delegating model. The conclusion is an extension: same class name, same module path, same public API, backward-compatible constructor. The Advisory Standard is satisfied.

**`LLMProvider` interface is sufficient as a binding contract.** The interface is deliberately minimal — a single `executeTurn` method matching the existing public signature. All provider-specific concerns (streaming loop, error handling, message conversion, model selection) are encapsulated inside implementations. The Developer implements against the interface; the gateway is stable.

**Two-class provider model is the correct scope.** The architectural insight — that HuggingFace Inference and Google Gemini both expose OpenAI-compatible APIs, making a single `OpenAICompatibleProvider` sufficient for both — is correct and eliminates the need for provider-specific classes. Any future OpenAI-compatible endpoint is covered without new code. Anthropic uses its native SDK as the existing baseline.

**Environment variable configuration is the right choice.** §4's evaluation of CLI flag (invasive threading across five files), config file (unnecessary complexity), and env vars (zero call-site changes, consistent with `ANTHROPIC_API_KEY` pattern) is well-reasoned. The `OPENAI_COMPAT_BASE_URL` required guard at construction time — rather than deferred to first API call — is correct behavior.

**Error normalization is complete.** The four-class model is preserved. The invariant that catch wraps the entire streaming loop (not just the initial API call) is correctly specified. The catch ordering requirement (specific subclasses before `OpenAI.APIError` base class) is correct and matches the Anthropic pattern.

**§8 is sufficient for implementation.** I verified §8 claims against current source: `orient.ts:5,32,33` matches the TA's specified change lines exactly; `orchestrator.ts:18` is a no-arg `new LLMGateway()` with no `MessageParam` import — no changes required, as stated. Every behavioral requirement named in prose (unknown `LLM_PROVIDER` guard, `OPENAI_COMPAT_BASE_URL` guard, mid-stream error catch invariant, catch ordering) appears in the corresponding §8 row for its file.

**Circular import resolution is correct.** Moving `LLMGatewayError` to `types.ts` with a re-export from `llm.ts` is the right resolution. Provider files import from `../types.js`; no circular dependency is introduced.

---

## Implementation Notes for the Runtime Developer

These are binding constraints derived from the Phase 0 approval.

**Behavioral equivalence for `AnthropicProvider`.** The acceptance criterion for `AnthropicProvider` is behavioral equivalence with the current `llm.ts` implementation — including exact error message strings. Do not alter the existing Anthropic error messages (e.g., `'Authentication failed check ANTHROPIC_API_KEY'` — no colon, exact phrasing). Any deviation from current behavior is a bug.

**`RuntimeMessageParam` type name in `orient.ts`.** The renamed type must be updated in all three locations the TA specified: the import statement (line 5), the `history` array declaration (line 32), and the `initialUserMsg` declaration (line 33). No other changes to `orient.ts`.

**`orchestrator.ts` requires no changes.** The `historyForTurn as any` cast on line 68 continues to work. Do not touch `orchestrator.ts`.

**`openai` version pinning.** The design specifies `^4.0.0`. Verify the current stable v4 release at implementation time and pin the exact version in `package.json`.

**`OPENAI_COMPAT_BASE_URL` guard throws at construction time, not at `executeTurn`.** This is required behavior — the guard must be in the `OpenAICompatibleProvider` constructor, not in `executeTurn`. A guard that defers to the first API call is a deviation from the spec.

**`createProvider` unknown-value guard throws at `new LLMGateway()` construction time.** Same principle — misconfiguration surfaces immediately at startup.

---

## Scope

**In scope for Runtime Developer:** All changes specified in §8 of `03-ta-architecture-design.md`:
- `runtime/src/types.ts` — add `RuntimeMessageParam`, `LLMProvider`, relocate `LLMGatewayError`
- `runtime/src/llm.ts` — refactor to delegating model, add `createProvider` factory
- `runtime/src/providers/anthropic.ts` — new file, extract existing Anthropic logic
- `runtime/src/providers/openai-compatible.ts` — new file, `OpenAICompatibleProvider`
- `runtime/src/orient.ts` — rename `MessageParam` to `RuntimeMessageParam` in three locations
- `runtime/package.json` — add `openai` dependency

**Out of scope:** Any changes to `orchestrator.ts`, `cli.ts`, `a-docs/`, `general/`, or indexes — those are either confirmed unchanged (orchestrator) or Curator responsibilities in the Registration phase.

---

## Handoff

Start a new Runtime Developer session.

```
You are a Runtime Developer agent for A-Society. Read a-society/a-docs/agents.md
```

```
Next action: Implement the provider-agnostic LLM Gateway per the approved Phase 0 specification
Read: a-society/a-docs/records/20260328-runtime-provider-agnostic/03-ta-architecture-design.md
      a-society/a-docs/records/20260328-runtime-provider-agnostic/04-owner-to-developer.md
Expected response: Implementation completion report covering all six §8 target files
```

```yaml
handoff:
  role: Runtime Developer
  session_action: start
  artifact_path: a-society/a-docs/records/20260328-runtime-provider-agnostic/03-ta-architecture-design.md
  prompt: "You are a Runtime Developer agent for A-Society. Read a-society/a-docs/agents.md"
```
