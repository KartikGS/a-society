**Subject:** Runtime Session UX — TA Phase 0 Design Advisory
**Type:** Owner → Technical Architect Brief
**Date:** 2026-04-05
**Flow:** `20260405-runtime-session-ux`

---

## Context

The A-Society runtime's interactive session UX has three gaps identified by the human operator:

1. **No interrupt capability** — when an agent goes in the wrong direction, the only option is to kill the entire session. There is no way to abort the current agent turn without losing session state.
2. **No liveness indication** — the terminal appears frozen during the latency between the API call and the first streaming token. There is no signal that the runtime is alive and working.
3. **No token / context visibility** — the operator has no indication of how much context has been consumed or how many tokens have been used. Sessions can hit the context wall without warning.

The runtime has two LLM providers behind a common `LLMProvider` interface: `AnthropicProvider` (`@anthropic-ai/sdk`) and `OpenAICompatibleProvider` (`openai` SDK with configurable `baseURL`). Both providers stream responses directly to `process.stdout`. All three UX features must be implemented symmetrically across both providers.

**Also in scope:** The "Runtime invocation / CLI surface convergence" item is absorbed into this flow. The TA's CLI surface design (§5 below) must resolve the legacy wrapper disposition alongside the new UX operator surface.

**Decisions already made (Owner direction — not open for TA redesign):**

1. All three features are implemented at the `LLMProvider` interface level — shared contract changes (usage fields, abort signal) are defined in `types.ts` so both providers implement against the same shape.
2. The interrupt mechanism uses `AbortController` / `AbortSignal` — the standard Node.js primitive, compatible with both SDKs.
3. Token usage is returned from `executeTurn` via `ProviderTurnResult` so the gateway can accumulate across turns without each provider needing to own display logic.
4. The liveness indicator starts before the API call and stops on first token — not a persistent status line unless the TA determines a persistent line is clearly superior.

---

## What the Advisory Must Cover

### §1 — `LLMProvider` Interface and `ProviderTurnResult` Type Changes

Specify the exact type changes to `runtime/src/types.ts`:

- The abort signal parameter: how is `AbortSignal` passed into `executeTurn`? New optional parameter? Wrapped options object? Specify the full updated `LLMProvider` interface signature.
- Usage fields in `ProviderTurnResult`: what shape? At minimum `inputTokens` and `outputTokens` as optional numbers (absent when the provider cannot report them). Are these on the `text` result only, or also on `tool_calls` results?
- Any other type surface changes required by the liveness or interrupt design.

### §2 — Abort / Interrupt Design

Specify the full interrupt contract:

- **Signal threading path:** How does the `AbortSignal` flow from the session layer (`orient.ts` or `orchestrator.ts`) through `LLMGateway.executeTurn` to the provider's streaming loop?
- **Abort behavior on the `text` path:** When the signal fires mid-stream, what is the observable outcome? Partial text discarded? Partial text returned with an `aborted` flag? Exception thrown?
- **Abort behavior on the tool-call path:** `LLMGateway` runs a `MAX_TOOL_ROUNDS` loop. If abort fires mid-round (after a tool call starts but before results are returned), is the round allowed to complete, or is the loop cut immediately? Specify the exact point where the abort is checked in the loop.
- **Session state after abort:** What state is the session in after a successful abort? Can the session continue with a new turn, or is it considered terminated?
- **Operator trigger:** How does the operator signal interrupt? `Ctrl+C` SIGINT interception? A keypress on a separate input channel? Specify the mechanism and where it is wired in.
- **Interaction with `autonomous` mode:** `orient.ts` has an `autonomous` flag for automated error handling. Does abort behave differently in autonomous vs. interactive mode?

### §3 — Liveness Display Design

Specify the liveness indicator:

- **Form:** Spinner-before-first-token only (appears during API call latency, clears when streaming begins), or a persistent status line (agent name, phase, elapsed time, token count) that remains during streaming. State the rationale for the chosen form.
- **Integration point:** Where in the provider's `executeTurn` does the indicator start and stop? Specify this for both providers — the Anthropic provider's first-token signal is `content_block_delta` with `text_delta`; the OpenAI-compatible provider's is `delta.content` being non-empty. Name the exact events.
- **stdout interference:** The providers write tokens directly to `process.stdout`. The spinner must not corrupt or interleave with streamed token output. Specify how the spinner is cleared before the first token is written.
- **Tool call turns:** During tool-call rounds, the agent does not stream text. Specify whether the liveness indicator is shown during tool-call API calls and what it displays (e.g., "Calling tool: read_file").

### §4 — Token Usage Accumulation

Specify the usage tracking model:

- **Anthropic provider:** Usage is available in the `message_start` event (`input_tokens`) and `message_delta` event (`output_tokens`). Specify which event(s) to read and how they map to the `ProviderTurnResult` usage fields.
- **OpenAI-compatible provider:** Usage requires `stream_options: { include_usage: true }` on the API call. Specify whether this should be added unconditionally, or gated behind a capability check / env var. Specify which chunk carries the usage data and how to extract it.
- **Accumulation in `LLMGateway`:** The gateway runs a tool-call loop with multiple `provider.executeTurn` calls per `gateway.executeTurn` call. Specify where usage accumulation happens and what is returned to the caller.
- **Display:** When and where is the token count displayed to the operator? At turn end? After every provider call in the tool loop? As part of the liveness status line? Specify the output format.
- **Context window utilization:** Should the display include a context window percentage (requires knowing the model's context limit)? If yes, how is the limit determined — hardcoded per known model name, configurable via env var, or omitted when unknown?

### §5 — CLI Surface Resolution

Specify the resolved CLI surface:

- **Legacy wrapper disposition:** The current runtime exposes wrapper commands alongside the primary `a-society` entry point. Decide: are these intentionally supported, deprecated-but-retained, or to be removed? State the rationale.
- **New UX operator documentation:** What does the operator-facing documentation in `$A_SOCIETY_RUNTIME_INVOCATION` need to say about the interrupt mechanism (key / signal), the liveness display (no configuration needed, or env var to disable), and the token output (format, where it appears)?
- **Environment variables:** If any new env vars are introduced (e.g., to disable the spinner, to opt out of usage reporting), list them with their defaults and semantics.

### §6 — Files Changed

Provide a summary table of all files to be modified, with expected action (additive, replace, insert) per file.

---

## Constraints

- The advisory must be implementable by the Runtime Developer as a single implementation track — no external dependencies.
- `ProviderTurnResult` is returned from both providers and consumed by `LLMGateway`. Any type change must be backward-compatible with the existing `LLMGateway.executeTurn` return type (`Promise<string>`), or the advisory must explicitly scope the gateway return type change.
- The abort mechanism must not break the `autonomous` mode error-handling path in `orient.ts`, which currently catches `HandoffParseError` and `WorkflowError` and appends them to session history for model self-correction.
- `stream_options: { include_usage: true }` may not be supported by all OpenAI-compatible endpoints. The advisory must not assume universal support without addressing this.
- Do not pre-specify update report classification. That is Curator-determined post-implementation by consulting `$A_SOCIETY_UPDATES_PROTOCOL`.

---

## Open Questions for TA Resolution

1. Is a persistent status line (agent + elapsed + tokens) clearly superior to a spinner-only approach, given that it must coexist with streamed token output without visual interference?
2. Should abort produce a resumable session (operator can send a new message) or always terminate the session after interrupt?
3. Is context window utilization percentage worth the complexity of maintaining a model-to-context-limit map, or should the display show raw token counts only?
4. Should the OpenAI-compatible usage opt-in be unconditional (`stream_options` always added) or configurable — given that a failing endpoint would currently silently omit usage rather than error?

---

## Deliverable

A single TA advisory artifact filed as `03-ta-phase0-design.md` in the record folder. The advisory must cover §1–§6 with enough specificity that the Runtime Developer can implement from §4 (Interface Changes) alone without further TA consultation.

Return to Owner when the advisory is complete.
