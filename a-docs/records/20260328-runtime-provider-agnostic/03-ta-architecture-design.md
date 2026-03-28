**Subject:** Runtime Layer — Provider Agnostic LLM Gateway — Phase 0 Architecture Design
**Status:** READY FOR OWNER REVIEW
**Date:** 2026-03-28
**Author:** Technical Architect
**Revision note:** Initial design (same session) proposed named Gemini and HuggingFace provider classes each using native SDKs. Owner directed Option B: a single generic `OpenAICompatibleProvider` class using the `openai` npm package, covering any OpenAI-compatible endpoint. Anthropic remains a named provider using its native SDK. This document supersedes the initial draft.

---

## §1 — Extension Path Evaluation

The brief directs explicit enumeration of why the existing `LLMGateway` class can or cannot be extended in place before proposing any structural change. That enumeration follows.

### Obstacles in the existing `LLMGateway`

**Obstacle 1: `private client: Anthropic` field type**
The field is typed as `Anthropic` — the concrete SDK class. To support multiple providers, this field must hold a different object depending on which provider is active. **Resolvable:** change the field type to `LLMProvider` (the new interface defined in §2) and assign the appropriate implementation at construction time.

**Obstacle 2: Anthropic SDK import hardcoded at module top**
`import Anthropic from '@anthropic-ai/sdk'` and `import type { MessageParam } from '@anthropic-ai/sdk/resources/messages.mjs'` are at the top of `llm.ts`. **Resolvable:** these imports move to `providers/anthropic.ts`; `llm.ts` imports from `./types.js` and the new provider files instead.

**Obstacle 3: `MessageParam` is an Anthropic SDK type**
`llm.ts` currently imports and re-exports `MessageParam` from the Anthropic SDK. Consumers (`orient.ts`) depend on this re-export. **Resolvable:** define `RuntimeMessageParam` in `types.ts` (a runtime-owned structural equivalent: `{ role: 'user' | 'assistant', content: string }`), export it from `llm.ts`, and update the one consumer import in `orient.ts`. The Anthropic SDK's `MessageParam` is structurally identical to `RuntimeMessageParam` for the shapes the runtime uses — no data migration required.

**Obstacle 4: The streaming loop and error handling are provider-specific operations**
The `executeTurn` method contains an Anthropic-specific streaming loop (`content_block_delta` / `text_delta` chunk format) and Anthropic-specific catch blocks (`instanceof Anthropic.AuthenticationError`, etc.). These cannot be generalized in place — a second provider would require a second streaming loop and a second set of catch blocks inside the same method.

This is the key structural obstacle. It does not make extension impossible, but it determines the extension model:
- **Extension via accumulation (fat dispatcher):** Add a `providerName` parameter; branch on it inside `executeTurn`. Technically viable, but `executeTurn` becomes a provider-switch dispatcher that grows with every new provider added. Adding a third provider requires modifying `LLMGateway` itself.
- **Extension via delegation (strategy injection):** Define `LLMProvider` as an interface; `LLMGateway` holds an `LLMProvider` instance and delegates `executeTurn` to it. Adding a new provider requires only a new implementation file — `LLMGateway` itself is not modified.

Both are extensions of the existing class (not bypasses — the class name, module path, and public API are unchanged). The delegation model is the correct extension: it keeps `LLMGateway` stable across the provider set and isolates each provider's streaming and error-handling logic in its own file.

### Conclusion

**Extend the existing `LLMGateway` class using the delegating model.** Specifically:
- `LLMGateway` gains a constructor parameter `provider?: LLMProvider`
- If `provider` is absent, `LLMGateway` reads `LLM_PROVIDER` from the environment and constructs the appropriate implementation
- `executeTurn` delegates to `this.provider.executeTurn` — the method body shrinks to a single delegation call
- The public API (`executeTurn(systemPrompt, messageHistory): Promise<string>`) is unchanged
- Both existing call sites (`new LLMGateway()` in `orient.ts` and `orchestrator.ts`) continue to work without modification

No bypass. No replacement infrastructure. The existing class is extended.

---

## §2 — Provider Abstraction Interface

### `LLMProvider` interface

Defined in `runtime/src/types.ts`:

```typescript
export interface LLMProvider {
  executeTurn(systemPrompt: string, messages: RuntimeMessageParam[]): Promise<string>;
}
```

The interface is deliberately minimal. Each provider implementation is responsible for:
- Converting `RuntimeMessageParam[]` to its SDK-specific message format
- Streaming output to `process.stdout`
- Assembling the full response string
- Normalizing all errors to `LLMGatewayError`

The interface does not expose streaming internals, model selection, or error types — all provider-specific concerns are encapsulated.

### `RuntimeMessageParam` type

Defined in `runtime/src/types.ts`:

```typescript
export interface RuntimeMessageParam {
  role: 'user' | 'assistant';
  content: string;
}
```

This type is runtime-owned. It is structurally identical to Anthropic's `MessageParam` for the shapes the runtime uses. The Anthropic provider passes `RuntimeMessageParam[]` directly to the Anthropic SDK without conversion (structurally compatible). The `OpenAICompatibleProvider` prepends a `{ role: 'system', content: systemPrompt }` message and maps `RuntimeMessageParam[]` to the OpenAI `ChatCompletionMessageParam[]` format — the conversion is direct (role values `'user'` and `'assistant'` are unchanged).

**Export path:** `RuntimeMessageParam` is defined in `types.ts` and re-exported from `llm.ts`. The re-export in `llm.ts` preserves the existing import source for consumers — `orient.ts` imports from `'./llm.js'` today and continues to do so after this change. Only the imported name changes (`MessageParam` → `RuntimeMessageParam`).

### `LLMGatewayError` class — relocation

`LLMGatewayError` currently lives in `llm.ts`. Provider implementations (`providers/anthropic.ts`, `providers/openai-compatible.ts`) must throw `LLMGatewayError`. If they imported from `llm.ts`, a circular dependency would result: `llm.ts` imports from provider files; provider files import from `llm.ts`.

**Resolution:** Move `LLMGatewayError` to `types.ts`. Provider files import it from `../types.js`. `llm.ts` re-exports it from `./types.js` for any consumer that currently imports it from `llm.ts`. (Current consumers `orient.ts` and `orchestrator.ts` do not directly import `LLMGatewayError` — they check `error.name` and `error.type` at runtime — so the re-export is defensive insurance, not a required consumer-visible change.)

### Parameter threading: `provider` in `LLMGateway` constructor

The new `provider?: LLMProvider` parameter threads as follows:

1. **`new LLMGateway()` — no-arg call (existing callers):** Both `orient.ts` (`const llm = new LLMGateway()`) and `orchestrator.ts` (`private llm = new LLMGateway()`) call with no arguments. The parameter is optional; these calls compile and run unchanged. At runtime, the `LLMGateway` constructor calls the module-level `createProvider(process.env.LLM_PROVIDER ?? 'anthropic')` factory, which returns the appropriate `LLMProvider` instance. The factory is called once, at construction time.

2. **`new LLMGateway(provider)` — explicit injection (for testing or future use):** A caller passes a concrete `LLMProvider` directly. The constructor assigns it without reading `LLM_PROVIDER`. This path is not used by any current caller; it is available for test fixtures or future orchestration needs.

3. **`executeTurn` delegation:** `LLMGateway.executeTurn(systemPrompt, messageHistory)` calls `this.provider.executeTurn(systemPrompt, messageHistory)` and returns its result directly. No transformation at the gateway level. All streaming, error handling, and response assembly happen inside the provider implementation.

4. **The `provider` parameter does not thread to any caller of `LLMGateway`.** No changes to `orient.ts` or `orchestrator.ts` call signatures. The injection point is entirely within `llm.ts` and its factory.

### `createProvider` factory

Module-level function in `llm.ts`:

```typescript
function createProvider(name: string): LLMProvider {
  switch (name) {
    case 'anthropic':        return new AnthropicProvider();
    case 'openai-compatible': return new OpenAICompatibleProvider();
    default:
      throw new LLMGatewayError(
        'UNKNOWN',
        `Unknown provider: "${name}". Supported: anthropic, openai-compatible.`
      );
  }
}
```

Both `AnthropicProvider` and `OpenAICompatibleProvider` are statically imported at the top of `llm.ts`. The factory selects at runtime based on the name string. Static imports are required by ESM — dynamic `import()` is async and incompatible with the synchronous constructor pattern. Both provider packages are present in `node_modules` regardless of which provider is active; importing both statically has no runtime cost beyond parse time.

**Guard:** If `LLM_PROVIDER` is set to an unrecognized value, `createProvider` throws `LLMGatewayError('UNKNOWN', ...)` at `new LLMGateway()` construction time — not deferred to the first `executeTurn` call. This surfaces misconfiguration immediately at startup.

---

## §3 — Provider Scope

### Design basis

The provider set splits cleanly into two categories:

- **Anthropic:** Does not expose an OpenAI-compatible API. Requires its native SDK (`@anthropic-ai/sdk`). Named provider: `anthropic`.
- **OpenAI-compatible endpoints:** Any provider that implements the OpenAI Chat Completions API — including HuggingFace Inference, Google Gemini (via Google's OpenAI-compatibility layer), and others — can be accessed through a single `OpenAICompatibleProvider` implementation using the `openai` npm package with a `baseURL` override. Named provider: `openai-compatible`.

This eliminates the need for separate `GeminiProvider` and `HuggingFaceProvider` classes. Both are covered by `OpenAICompatibleProvider` with different configuration. Any future OpenAI-compatible provider is covered the same way, with zero new code.

### Anthropic — In scope

The current implementation is the behavioral baseline. `AnthropicProvider` is a direct extraction of the existing streaming loop and error-handling logic from `llm.ts`. Behavioral equivalence with the current implementation is the acceptance criterion for `AnthropicProvider`.

### OpenAI-compatible endpoints — In scope

The `openai` npm package supports any OpenAI-compatible endpoint via the `baseURL` constructor parameter. The streaming response format (`AsyncIterable<ChatCompletionChunk>`, with text in `chunk.choices[0]?.delta?.content`) is uniform across compliant endpoints.

**HuggingFace Inference API** (`https://api-inference.huggingface.co/v1/`) is OpenAI-compatible: it accepts `{ role, content }` messages, supports streaming via SSE, and returns `ChatCompletionChunk` objects. Model selection is a string parameter. Default model for this design: `mistralai/Mistral-7B-Instruct-v0.3`.

**Google Gemini** is accessible via Google's OpenAI-compatibility endpoint (`https://generativelanguage.googleapis.com/v1beta/openai/`), which accepts the same message format and streaming model. No native Gemini SDK is needed.

**Any other OpenAI-compatible endpoint** (Groq, Together AI, self-hosted vLLM, etc.) is covered by the same class. The operator sets `OPENAI_COMPAT_BASE_URL`, `OPENAI_COMPAT_API_KEY`, and `OPENAI_COMPAT_MODEL` to point at any compliant endpoint.

### System prompt handling difference

The Anthropic SDK takes `system` as a dedicated top-level parameter in the messages API. The OpenAI Chat Completions API takes the system prompt as a `{ role: 'system', content: systemPrompt }` message prepended to the messages array. Both `executeTurn` implementations accept `(systemPrompt, messages)` and handle this internally — the `LLMProvider` interface is identical.

---

## §4 — Provider Selection Configuration

### Evaluation of options

**CLI flag (`--provider anthropic`):** Would require modifying `cli.ts` to parse the flag and pass it through every command handler that ultimately constructs an `LLMGateway`. The threading path crosses `cli.ts` → `start-flow`/`resume-flow`/`orient` → `FlowOrchestrator`/`runOrientSession` → `LLMGateway`. This is an invasive change to five or more files for a configuration concern that does not vary within a single invocation.

**Config file:** Adds a file-read dependency at startup, a new file format to define, and a file location convention to establish. The added complexity is not justified when the configuration is a small set of strings that does not change at runtime.

**Environment variables:** Require no changes to `cli.ts`, command handlers, `FlowOrchestrator`, or `runOrientSession`. `LLMGateway` and provider constructors read them at construction time. Works transparently for all command paths. Consistent with the existing pattern (`ANTHROPIC_API_KEY` is already read from the environment).

**Recommendation: Environment variables throughout.**

### Specification

**Provider selection:**

| Variable | Values | Default |
|---|---|---|
| `LLM_PROVIDER` | `anthropic`, `openai-compatible` | `anthropic` |

**Anthropic-specific:**

| Variable | Purpose | Default |
|---|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key | `''` (auth error on first call if absent) |
| `ANTHROPIC_MODEL` | Model name override | `claude-3-5-sonnet-20241022` |

**OpenAI-compatible:**

| Variable | Purpose | Default | Required |
|---|---|---|---|
| `OPENAI_COMPAT_BASE_URL` | Endpoint base URL | — | Yes; throws at construction if absent |
| `OPENAI_COMPAT_API_KEY` | API key for the endpoint | `''` (auth error on first call if absent) | No |
| `OPENAI_COMPAT_MODEL` | Model name | `mistralai/Mistral-7B-Instruct-v0.3` | No |

**`OPENAI_COMPAT_BASE_URL` guard:** When `LLM_PROVIDER=openai-compatible`, if `OPENAI_COMPAT_BASE_URL` is absent or empty, `OpenAICompatibleProvider` constructor throws `LLMGatewayError('UNKNOWN', 'LLM_PROVIDER=openai-compatible requires OPENAI_COMPAT_BASE_URL to be set.')` at construction time. This surfaces misconfiguration at startup, not on the first API call.

**`OPENAI_COMPAT_API_KEY` behavior:** If absent, the `openai` SDK is initialized with an empty string. The endpoint may or may not require a key (some self-hosted endpoints do not). If the key is required and absent, the first `executeTurn` call returns an `OpenAI.AuthenticationError`, normalized to `AUTH_ERROR`. This is consistent with the Anthropic provider's behavior for an absent `ANTHROPIC_API_KEY`.

### Example configurations

HuggingFace Inference API:
```
LLM_PROVIDER=openai-compatible
OPENAI_COMPAT_BASE_URL=https://api-inference.huggingface.co/v1/
OPENAI_COMPAT_API_KEY=<hf_token>
OPENAI_COMPAT_MODEL=mistralai/Mistral-7B-Instruct-v0.3
```

Google Gemini via OpenAI-compat endpoint:
```
LLM_PROVIDER=openai-compatible
OPENAI_COMPAT_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
OPENAI_COMPAT_API_KEY=<gemini_api_key>
OPENAI_COMPAT_MODEL=gemini-1.5-pro
```

### Threading path for provider configuration

`LLM_PROVIDER` is read in `createProvider(process.env.LLM_PROVIDER ?? 'anthropic')` inside the `LLMGateway` constructor. The threading path is entirely within `llm.ts`:

```
process.env.LLM_PROVIDER
  → LLMGateway constructor (no-arg path)
    → createProvider(name: string)
      → new AnthropicProvider() | new OpenAICompatibleProvider()
      → assigned to this.provider
```

Provider-specific variables (`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `OPENAI_COMPAT_*`) are read inside the respective provider constructors — not by `LLMGateway` or the factory. No threading to callers. `orient.ts` and `orchestrator.ts` are unaware of which provider is active.

---

## §5 — Error Normalization

The four error classes (`AUTH_ERROR`, `RATE_LIMIT`, `PROVIDER_MALFORMED`, `UNKNOWN`) are the runtime's error contract. Each provider implementation's `executeTurn` method must catch all provider-specific exceptions and normalize them to `LLMGatewayError` before returning to the caller. No provider-specific exception type may escape a provider's `executeTurn`.

### Anthropic error mapping (existing behavior, extracted to `AnthropicProvider`)

| Caught type | Normalized to | Message |
|---|---|---|
| `Anthropic.AuthenticationError` | `AUTH_ERROR` | `'Authentication failed check ANTHROPIC_API_KEY'` |
| `Anthropic.RateLimitError` | `RATE_LIMIT` | `'Transient network or rate limit error'` |
| `Anthropic.APIConnectionError` | `RATE_LIMIT` | `'Transient network or rate limit error'` |
| `Anthropic.APIError` (other) | `PROVIDER_MALFORMED` | `'Provider API error: ${err.message}'` |
| Any other | `UNKNOWN` | `'Unexpected provider error: ${err?.message || err}'` |

These are the exact messages from the current implementation. Behavioral equivalence is preserved.

### OpenAI-compatible error mapping (new, in `OpenAICompatibleProvider`)

The `openai` npm package exports typed error classes with the same hierarchy pattern as the Anthropic SDK:

| Caught type | Normalized to | Message |
|---|---|---|
| `OpenAI.AuthenticationError` | `AUTH_ERROR` | `'Authentication failed: check OPENAI_COMPAT_API_KEY'` |
| `OpenAI.RateLimitError` | `RATE_LIMIT` | `'Transient network or rate limit error'` |
| `OpenAI.APIConnectionError` | `RATE_LIMIT` | `'Transient network or rate limit error'` |
| `OpenAI.APIError` (other) | `PROVIDER_MALFORMED` | `'Provider API error: ${err.message}'` |
| Any other | `UNKNOWN` | `'Unexpected provider error: ${err?.message || err}'` |

**Note on `isinstance` availability:** `OpenAI.AuthenticationError`, `OpenAI.RateLimitError`, `OpenAI.APIConnectionError`, and `OpenAI.APIError` are all exported from the `openai` package and support `instanceof` checks. The catch-block ordering must place more-specific subclasses before `OpenAI.APIError` (the base class) — same pattern as the Anthropic implementation.

**Note on endpoint variation:** The `openai` SDK normalizes HTTP responses from any `baseURL` into its own error classes. An authentication failure from HuggingFace (HTTP 401) and from Gemini (HTTP 401 or 403) both produce `OpenAI.AuthenticationError`. The operator does not need provider-specific error handling — the `openai` SDK handles it.

### Error normalization invariant

Both provider implementations must catch errors in a try/catch wrapping the entire streaming operation — not only around the initial API call. Errors can be raised mid-stream (e.g., during iteration of the streaming response). Any error that escapes the streaming loop must be caught and normalized before the method returns.

---

## §6 — Model Selection

### Anthropic

- Default: `claude-3-5-sonnet-20241022` (preserves existing behavior exactly)
- Override: `ANTHROPIC_MODEL` environment variable
- Read in: `AnthropicProvider` constructor
- `max_tokens`: `8192` (hardcoded; preserves existing behavior)

### OpenAI-compatible

- Default: `mistralai/Mistral-7B-Instruct-v0.3`
- Override: `OPENAI_COMPAT_MODEL` environment variable
- Read in: `OpenAICompatibleProvider` constructor
- `max_tokens`: `8192` (consistent with Anthropic; may be ignored or capped by some endpoints without error)

**Rationale for default:** `mistralai/Mistral-7B-Instruct-v0.3` is a well-maintained, instruction-following model available on HuggingFace's hosted inference with reliable chat completion behavior. For Gemini or other endpoints, the operator sets `OPENAI_COMPAT_MODEL` explicitly.

**Guard: model name validation:** No runtime validation of model names is performed. An invalid or unavailable model name causes the provider SDK to return an error on the first API call, normalized to `PROVIDER_MALFORMED`. Model name validation is the endpoint's responsibility.

---

## §7 — Open Questions: Resolved

All four open questions from the brief are resolved by this design.

**Q1 — Extension vs. refactor:** Resolved in §1. The existing `LLMGateway` class is extended using the delegating model — same class name, same module path, same public API, backward-compatible constructor. No bypass or replacement.

**Q2 — Provider scope:** Resolved in §3. Anthropic uses its native SDK. All OpenAI-compatible endpoints (HuggingFace, Gemini, others) are covered by a single `OpenAICompatibleProvider` using the `openai` npm package. No provider is deferred.

**Q3 — Message type portability:** Resolved in §2. The runtime defines its own `RuntimeMessageParam` in `types.ts`. The Anthropic provider passes it directly (structurally compatible). The `OpenAICompatibleProvider` prepends a system message and passes the remaining messages with unchanged role values — no structural conversion needed.

**Q4 — Model configuration:** Resolved in §6. Hardcoded default per provider class, overridable via environment variable. Anthropic: `ANTHROPIC_MODEL`. OpenAI-compatible: `OPENAI_COMPAT_MODEL`.

---

## §8 — Files Changed

### `runtime/src/types.ts` — Add `RuntimeMessageParam`, `LLMProvider`, relocate `LLMGatewayError`

**Changes:**
- Add `RuntimeMessageParam` interface: `{ role: 'user' | 'assistant'; content: string }`
- Add `LLMProvider` interface: `{ executeTurn(systemPrompt: string, messages: RuntimeMessageParam[]): Promise<string> }`
- Add `LLMGatewayError` class (moved from `llm.ts`): `class LLMGatewayError extends Error` with `type: 'AUTH_ERROR' | 'RATE_LIMIT' | 'PROVIDER_MALFORMED' | 'UNKNOWN'` and `name = 'LLMGatewayError'`. Content is identical to the current definition in `llm.ts` — this is a relocation, not a redesign.

**Non-happy-path behavior:** None. Pure type and class definitions.

**Import source note:** `LLMGatewayError` moves here from `llm.ts`. `llm.ts` re-exports it so any consumer importing `LLMGatewayError` from `llm.ts` continues to work. Provider files import `LLMGatewayError` from `../types.js` — not from `../llm.js` — to avoid circular imports.

---

### `runtime/src/llm.ts` — Refactor to delegating model

**Changes:**
- Remove: `import Anthropic from '@anthropic-ai/sdk'` and `import type { MessageParam } from '@anthropic-ai/sdk/resources/messages.mjs'`
- Remove: `export type { MessageParam }` (replaced by `RuntimeMessageParam` export)
- Remove: `LLMGatewayError` class definition (relocated to `types.ts`; re-exported here)
- Remove: all streaming logic and Anthropic-specific error handling from `executeTurn`
- Add: `import type { LLMProvider, RuntimeMessageParam } from './types.js'`
- Add: `export type { RuntimeMessageParam }` — consumers import the same name from the same module path
- Add: `export { LLMGatewayError } from './types.js'` — re-export for backward compatibility
- Add: `import { AnthropicProvider } from './providers/anthropic.js'`
- Add: `import { OpenAICompatibleProvider } from './providers/openai-compatible.js'`
- Add: module-level `createProvider(name: string): LLMProvider` function (see §2 for body)
- Modify: `LLMGateway` class — `private provider: LLMProvider`, constructor `(provider?: LLMProvider)`, `executeTurn` delegates to `this.provider.executeTurn`

**Constructor threading:** `provider?: LLMProvider` parameter is optional. No-arg callers (`orient.ts`, `orchestrator.ts`) are unaffected. Full threading path specified in §2 and §4.

**Non-happy-path behavior:**
- `LLM_PROVIDER` set to unrecognized string: `createProvider` throws `LLMGatewayError('UNKNOWN', 'Unknown provider: "${name}". Supported: anthropic, openai-compatible.')` at `new LLMGateway()` construction time, not deferred to `executeTurn`
- `LLM_PROVIDER` absent: defaults to `'anthropic'` — no error

---

### `runtime/src/providers/anthropic.ts` — New file

**Purpose:** Extracts the existing Anthropic streaming loop and error-handling logic from `llm.ts` into a standalone `LLMProvider` implementation. Behavioral equivalence with the current `llm.ts` implementation is required — no logic change, only relocation.

**Imports:**
- `import Anthropic from '@anthropic-ai/sdk'`
- `import { LLMGatewayError } from '../types.js'`
- `import type { LLMProvider, RuntimeMessageParam } from '../types.js'`

Note: `LLMGatewayError` must be imported as a value (not just a type) because the provider throws instances of it.

**Class:** `export class AnthropicProvider implements LLMProvider`

**Constructor:**
- Reads `process.env.ANTHROPIC_API_KEY ?? ''`
- Reads `process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022'`
- Instantiates `new Anthropic({ apiKey })` and assigns to `private client: Anthropic`
- Stores `private model: string`

**`executeTurn(systemPrompt, messages)` behavior:**
- Calls `this.client.messages.create({ model: this.model, max_tokens: 8192, system: systemPrompt, messages, stream: true })`
- `messages` is `RuntimeMessageParam[]`; Anthropic's SDK accepts `{ role: 'user' | 'assistant', content: string }[]` — structurally identical, no conversion required
- Streams to `process.stdout` via the `content_block_delta` / `text_delta` loop (exact loop from current `llm.ts`)
- Writes `'\n'` after stream finishes (exact behavior from current `llm.ts`)
- Returns `fullResponse: string`
- Catch wraps the entire streaming loop — errors raised mid-stream are caught and normalized

**Non-happy-path behavior (all in catch block of `executeTurn`):**
- `err instanceof Anthropic.AuthenticationError`: throw `LLMGatewayError('AUTH_ERROR', 'Authentication failed check ANTHROPIC_API_KEY')` — exact current message preserved
- `err instanceof Anthropic.RateLimitError || err instanceof Anthropic.APIConnectionError`: throw `LLMGatewayError('RATE_LIMIT', 'Transient network or rate limit error')`
- `err instanceof Anthropic.APIError`: throw `LLMGatewayError('PROVIDER_MALFORMED', 'Provider API error: ${err.message}')`
- Any other: throw `LLMGatewayError('UNKNOWN', 'Unexpected provider error: ${err?.message || err}')`

---

### `runtime/src/providers/openai-compatible.ts` — New file

**Purpose:** A single `LLMProvider` implementation covering any OpenAI-compatible endpoint — HuggingFace Inference API, Google Gemini via OpenAI-compat endpoint, and others. Uses the `openai` npm package with `baseURL` override.

**Imports:**
- `import OpenAI from 'openai'`
- `import { LLMGatewayError } from '../types.js'`
- `import type { LLMProvider, RuntimeMessageParam } from '../types.js'`

**Class:** `export class OpenAICompatibleProvider implements LLMProvider`

**Constructor:**
- Reads `process.env.OPENAI_COMPAT_BASE_URL` — if absent or empty, throws `LLMGatewayError('UNKNOWN', 'LLM_PROVIDER=openai-compatible requires OPENAI_COMPAT_BASE_URL to be set.')` immediately (construction-time guard)
- Reads `process.env.OPENAI_COMPAT_API_KEY ?? ''`
- Reads `process.env.OPENAI_COMPAT_MODEL ?? 'mistralai/Mistral-7B-Instruct-v0.3'`
- Instantiates `new OpenAI({ baseURL, apiKey })` and assigns to `private client: OpenAI`
- Stores `private model: string`

**`executeTurn(systemPrompt, messages)` behavior:**
1. Build `openAIMessages`: prepend `{ role: 'system' as const, content: systemPrompt }`, then map `messages` to `{ role: m.role as 'user' | 'assistant', content: m.content }`
2. Call `this.client.chat.completions.create({ model: this.model, messages: openAIMessages, stream: true, max_tokens: 8192 })`
3. For each chunk in the stream: extract `chunk.choices[0]?.delta?.content ?? ''`; if non-empty, write to `process.stdout` and append to `fullResponse`
4. Write `'\n'` after stream finishes
5. Return `fullResponse`
6. Catch wraps steps 2–5 — errors raised mid-stream are caught and normalized

**Non-happy-path behavior (catch block must follow this order — more-specific subclasses before `OpenAI.APIError`):**
- `err instanceof OpenAI.AuthenticationError`: throw `LLMGatewayError('AUTH_ERROR', 'Authentication failed: check OPENAI_COMPAT_API_KEY')`
- `err instanceof OpenAI.RateLimitError || err instanceof OpenAI.APIConnectionError`: throw `LLMGatewayError('RATE_LIMIT', 'Transient network or rate limit error')`
- `err instanceof OpenAI.APIError`: throw `LLMGatewayError('PROVIDER_MALFORMED', 'Provider API error: ${err.message}')`
- Any other: throw `LLMGatewayError('UNKNOWN', 'Unexpected provider error: ${err?.message || err}')`
- Construction-time guard (absent `OPENAI_COMPAT_BASE_URL`) throws before the try/catch — it is a pre-condition, not a caught error

---

### `runtime/src/orient.ts` — Update `MessageParam` import

**Changes:**
- Line 5: `import { LLMGateway, type MessageParam } from './llm.js'` → `import { LLMGateway, type RuntimeMessageParam } from './llm.js'`
- Line 32: `const history: MessageParam[] = []` → `const history: RuntimeMessageParam[] = []`
- Line 33: `const initialUserMsg: MessageParam = {` → `const initialUserMsg: RuntimeMessageParam = {`

**Non-happy-path behavior (existing, unchanged):**
- `LLMGatewayError` with `type === 'AUTH_ERROR'` on initial turn: logs `error.message`, exits with code 1
- Other errors on initial turn: logs `Error during initial turn: ${error.message}`, exits with code 1
- Errors on subsequent turns: logs `Error during turn: ${error.message}`, continues the prompt loop (does not exit)

---

### `runtime/src/orchestrator.ts` — No changes required

The `FlowOrchestrator` class constructs `new LLMGateway()` with no arguments (field initializer `private llm = new LLMGateway()`). The constructor change is backward-compatible — no-arg call continues to work. `MessageParam` is not imported; the `historyForTurn as any` cast on line 68 continues to work with `RuntimeMessageParam[]` (structurally identical). No changes required.

**Existing non-happy-path behavior (unchanged):**
- `err.type === 'RATE_LIMIT'`: sets `flowRun.status = 'awaiting_retry'`, saves, rethrows
- Other `LLMGatewayError` types: sets `flowRun.status = 'failed'`, saves, rethrows

---

### `runtime/package.json` — Add `openai` dependency

**Changes:**
- Add to `dependencies`: `"openai": "^4.0.0"`

The `@anthropic-ai/sdk` dependency remains. No other dependency changes. The `@google/generative-ai` package is not needed — Gemini is accessed via the `openai` SDK through Google's OpenAI-compatible endpoint.

**Note on `openai` version:** `^4.0.0` targets the v4 release line, which introduced the typed streaming iterator and the error class hierarchy used in this design. The Developer should verify the current stable v4 release at implementation time and pin accordingly.

---

## Coupling Map Note

This advisory modifies the runtime layer. The coupling map (`$A_SOCIETY_TOOLING_COUPLING_MAP`) covers tooling components 1–7 and their `general/` format dependencies. The LLM Gateway is a runtime component — it is not tracked in the coupling map. No coupling map rows are affected by this design. All invocation gaps in the coupling map are currently closed; none are opened by this change.

---

## Ready for Owner Review

This architecture design is ready for Owner gate review at `owner-phase0-gate`.

**Artifact path:** `a-society/a-docs/records/20260328-runtime-provider-agnostic/03-ta-architecture-design.md`

**What the Owner evaluates:**
1. Does the extension-path rationale in §1 satisfy the Advisory Standard (all obstacles resolvable; extension not bypass)?
2. Is the `LLMProvider` interface in §2 sufficient as a binding contract for the Developer?
3. Is the two-class provider model (Anthropic native + generic OpenAI-compatible) the right scope for this flow?
4. Are the environment variable names and guard behaviors in §4 correct for this runtime's usage pattern?
5. Is the error normalization mapping in §5 complete for the OpenAI-compatible provider?
6. Is the §8 file-by-file specification sufficient for the Runtime Developer to implement without ambiguity?

**Review references:** `$A_SOCIETY_ARCHITECTURE` (architectural invariants) and `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` (Phase 0 gate condition).
