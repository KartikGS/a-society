**Subject:** Runtime Session UX — TA Phase 0 Design Advisory
**Type:** Technical Architect → Owner
**Date:** 2026-04-05
**Flow:** `20260405-runtime-session-ux`

---

## §1 — Open Question Resolutions

Four open questions were identified in the brief. Resolved here before the design sections that depend on them.

**Q1: Persistent status line vs. spinner-only?**
**Resolution: Spinner-only.**

A persistent status line requires active ANSI cursor management to update a fixed terminal row while tokens stream on stdout below it. This demands TTY mode detection, ANSI cursor-save/restore sequences, and tight coordination between stderr writes and the stdout stream — fragile across terminal emulators and inapplicable in non-TTY contexts (piped output, CI). The spinner solves the actual problem: the operator sees the terminal is alive during API call latency. It lives entirely on stderr, clears before the first token, and leaves no visual residue. Complexity/benefit is decisively in favor of spinner-only.

**Q2: Abort produces a resumable session or terminates?**
**Resolution: Resumable in both interactive and autonomous mode. Partial turn is preserved.**

Abort is an operator redirection tool, not a session end signal. The operator pressed Ctrl+C because the model went in the wrong direction — they want to send a corrective message, not start over. Discarding the partial turn would make the conversation incoherent: the model's next response would have no record of what it was doing or why it was interrupted.

After abort:
- The user message that triggered the turn stays in history.
- Any partial text streamed before the interrupt is appended to history as an assistant message. If no text was produced before abort (e.g., abort fired before the first token, or fired during a tool-call API response), nothing is appended for the assistant turn.
- The spinner clears.
- In interactive mode: the readline prompt reappears; the operator sends a corrective message.
- In autonomous mode: the session transitions to `awaiting_human` and state is persisted; the operator re-runs `a-society` to resume. The process exits cleanly — no crash, no lost state.

**Q3: Context window utilization percentage worth the complexity?**
**Resolution: Raw token counts only.**

The OpenAI-compatible endpoint can point at any model, including fine-tunes and custom deployments with unknown context limits. A model-to-context-limit map requires ongoing maintenance and is wrong for any model not in the map. Raw counts (`N in, M out`) give the operator all the information they can act on. If the operator needs to evaluate utilization, they know their model's context limit and can compute it themselves.

**Q4: OpenAI-compatible usage opt-in — unconditional or configurable?**
**Resolution: Unconditional (`stream_options: { include_usage: true }` always added).**

Endpoints that do not support `stream_options` silently omit the field — they do not error on unrecognized parameters. The optional `TurnUsage` fields handle absent usage gracefully: `undefined` rather than an error. A configurable opt-out adds a setting the operator will never need to turn off, and creates a footgun (usage always missing when accidentally disabled). Add unconditionally; tolerate silent omission.

---

## §2 — Type Surface Changes (`types.ts`)

Five additions and two replacements to `runtime/src/types.ts`.

### New: `TurnUsage`

```typescript
export interface TurnUsage {
  inputTokens?: number;
  outputTokens?: number;
}
```

Optional fields on both because some provider/endpoint combinations do not report usage. Callers must treat absent fields as unknown, not zero.

### New: `TurnOptions`

```typescript
export interface TurnOptions {
  signal?: AbortSignal;
}
```

Options object rather than a bare parameter: keeps `executeTurn` extensible without parameter-count growth. The object form is forward-compatible with future options (e.g., timeout, temperature override).

### New: `GatewayTurnResult`

```typescript
export interface GatewayTurnResult {
  text: string;
  usage?: TurnUsage;
}
```

Replaces `Promise<string>` as the return type of `LLMGateway.executeTurn`. The `usage` field accumulates across all provider calls in a tool-call loop — it is the total for the entire gateway turn, not a single provider call. Absent when no provider in the loop reported usage.

### Updated: `LLMGatewayError` type union and `partialText` field

Add `'ABORTED'` to the error type union and a `partialText` optional field:

```typescript
export class LLMGatewayError extends Error {
  constructor(
    public readonly type: 'AUTH_ERROR' | 'RATE_LIMIT' | 'PROVIDER_MALFORMED' | 'UNKNOWN' | 'ABORTED',
    message: string,
    public readonly partialText?: string
  ) {
    super(message);
    this.name = 'LLMGatewayError';
  }
}
```

`partialText` is only populated when `type === 'ABORTED'`. It carries whatever text the provider streamed to stdout before the abort signal fired. Absent (`undefined`) when abort fires before any text tokens — e.g., during a tool-call API response, or when the signal was already set before the stream started. Callers check for `partialText` and append it to history when non-empty (see §4 `orient.ts` abort handler).

Rationale for extending `LLMGatewayError` rather than a new class: abort is a provider-layer signal (fired from inside `executeTurn`), and `orient.ts` already pattern-matches on `LLMGatewayError` for error handling. Adding `'ABORTED'` to the existing union is a minimal, consistent extension. A new class would require importing and catching a second error type throughout the session layer.

### Updated: `ProviderTurnResult`

Add `usage?` to both variants:

```typescript
export type ProviderTurnResult =
  | { type: 'text';       text: string;                                                 usage?: TurnUsage }
  | { type: 'tool_calls'; calls: ToolCall[]; continuationMessages: RuntimeMessageParam[]; usage?: TurnUsage };
```

Usage is present on both variants. Tool-call API responses include token counts for the call that produced the tool use blocks; these count toward the total and must be accumulated.

### Updated: `LLMProvider` interface

Add `options?` as a fourth parameter:

```typescript
export interface LLMProvider {
  executeTurn(
    systemPrompt: string,
    messages: RuntimeMessageParam[],
    tools?: ToolDefinition[],
    options?: TurnOptions
  ): Promise<ProviderTurnResult>;
}
```

The existing three-parameter signature is fully backward-compatible: `options` is optional and absent in all existing callers. New callers pass `options.signal` to thread abort through.

---

## §3 — Abort / Interrupt Design

### Signal threading path

Two code paths create `AbortController` instances:

**Interactive mode** — `orient.ts` creates the controller inside `promptUser()`, once per turn:
```
orient.ts promptUser()
  → currentController = new AbortController(), rl.on('SIGINT') fires currentController.abort()
  → llm.executeTurn(systemPrompt, history, { signal: currentController.signal })
    → LLMGateway.executeTurn receives signal via TurnOptions
      → provider.executeTurn(..., { signal })
        → passed to SDK streaming call as RequestOptions { signal }
```

The `AbortController` must be created inside `promptUser()` (not at session level) so each turn gets a fresh, un-aborted signal. A session-level controller would fire once and permanently abort all subsequent turns.

**Autonomous mode** — `orchestrator.ts` creates the controller per `runInteractiveSession` call and installs a process-level SIGINT handler:
```
orchestrator.ts advanceFlow (while loop body)
  → controller = new AbortController()
  → process.once('SIGINT', sigintHandler)   // sigintHandler calls controller.abort()
  → runInteractiveSession(..., controller.signal)  // signal passed as new parameter
    → orient.ts autonomous path passes signal to llm.executeTurn
      → LLMGateway → provider → SDK (same path as interactive)
  → process.removeListener('SIGINT', sigintHandler)  // always, in finally
```

`runInteractiveSession` requires a new final parameter: `externalSignal?: AbortSignal`. In the autonomous path, this signal is passed directly to `llm.executeTurn`. In the interactive path, the internal per-turn controller (wired to readline SIGINT) is used instead; `externalSignal` is ignored in the interactive code path.

### Operator trigger

`rl.on('SIGINT', callback)` on the readline interface in `orient.ts`. When the operator presses Ctrl+C during a turn, readline fires this event instead of the default process exit. The callback calls `controller.abort()`. This is the correct mechanism: readline already intercepts Ctrl+C when `terminal: true` is set, and re-routing to abort avoids process termination.

The `SIGINT` listener must be added once per readline session (not per turn), since the interface is created once. The `AbortController` reference used by the listener must be the current turn's controller — use a `let currentController: AbortController | undefined` variable in the session scope, reassigned at the top of each `promptUser()` call.

### Abort behavior — `text` path

When `signal.aborted` fires during the `for await (const chunk of stream)` loop:
- The SDK cancels the in-flight HTTP request and throws an error with `name === 'AbortError'` (Anthropic) or an `OpenAI.APIUserAbortError` (OpenAI SDK).
- The provider's catch block detects this (see §4 for exact detection logic), throws `new LLMGatewayError('ABORTED', 'Turn aborted by operator', fullText || undefined)`.
- `fullText` at the time of the throw is whatever was streamed before the signal fired. This is passed as `partialText` on the error so `orient.ts` can append it to history.
- The spinner is stopped in the catch block before rethrowing. If abort fires before the first token (spinner not yet stopped by first-token logic), this catch-block `stop()` is the cleanup path.

### Abort behavior — tool-call path

The tool-call loop in `LLMGateway.executeTurn` checks `options?.signal?.aborted` at the start of each round, before calling `provider.executeTurn`. If the signal is already aborted (fired between rounds), the loop exits immediately by throwing `new LLMGatewayError('ABORTED', 'Turn aborted by operator')` — tool results from the just-completed round are discarded along with the partial turn.

If abort fires during a provider call inside a tool-call round, the SDK cancels the request and the provider throws `ABORTED`. This propagates out of the loop unchanged. Tool executions that may have started in `Promise.all` after a prior round are not affected — those are fast local filesystem operations that complete before the next API call begins.

### Session state after abort

The history array in `orient.ts` is preserved on abort — the user message is never removed. The flow:
1. `history.push({ role: 'user', content: line })` — already done when the turn starts.
2. `llm.executeTurn` throws `LLMGatewayError('ABORTED', ..., partialText)`.
3. Catch block detects `ABORTED`:
   - If `error.partialText` is non-empty: `history.push({ role: 'assistant', content: error.partialText })`.
   - If `error.partialText` is empty/undefined: no assistant entry appended. History ends with the user message, reflecting that the model was asked but did not respond before the interrupt.
   - Clears spinner (already stopped inside provider, but no-op call is safe).
   - Prints `\n[Aborted]\n` to stderr.
   - In interactive mode: calls `promptUser()` to resume the readline loop.
   - In autonomous mode: returns `null` (which causes `orchestrator.ts` to transition to `awaiting_human` and save state — see §4 `orchestrator.ts` section).

Preserving history is correct: the model's next response needs to know what was asked and what partial answer was in flight. Removing the user message would make the conversation incoherent — the model would have no record of the exchange that was interrupted.

### Interaction with autonomous mode

Autonomous mode abort is handled symmetrically with interactive mode. `orchestrator.ts` creates the `AbortController`, installs a process-level SIGINT handler, and passes the signal into `runInteractiveSession`. When abort fires:
- `orient.ts` autonomous path catches `ABORTED`, preserves `partialText` in history, returns `null`.
- `orchestrator.ts` sees `null` from `runInteractiveSession`, sets `status: 'awaiting_human'`, saves session history and flow state, breaks out of the loop.
- The process exits cleanly (the orchestrator's normal exit path). No crash. No lost state.
- On next `a-society` run, the flow resumes from the persisted state.

The autonomous error-handling path in `orchestrator.ts` (which catches `HandoffParseError` and `WorkflowError` and appends them to history for model self-correction) is unaffected. `ABORTED` is caught in `orient.ts` before it propagates to `orchestrator.ts` — it never reaches the `HandoffParseError`/`WorkflowError` catch in the orchestrator's `advanceFlow` loop.

---

## §4 — Interface Changes (implementation reference)

This section specifies the complete interface contracts, threading paths, and behavioral requirements the Runtime Developer implements against.

### `runtime/src/types.ts` — complete type additions

```typescript
// New type: per-turn token usage
export interface TurnUsage {
  inputTokens?: number;
  outputTokens?: number;
}

// New type: options passed to LLMProvider.executeTurn and LLMGateway.executeTurn
export interface TurnOptions {
  signal?: AbortSignal;
}

// New type: return value of LLMGateway.executeTurn (replaces Promise<string>)
export interface GatewayTurnResult {
  text: string;
  usage?: TurnUsage;
}

// Updated: ProviderTurnResult — usage added to both variants
export type ProviderTurnResult =
  | { type: 'text';       text: string;                                                   usage?: TurnUsage }
  | { type: 'tool_calls'; calls: ToolCall[]; continuationMessages: RuntimeMessageParam[]; usage?: TurnUsage };

// Updated: LLMProvider — options parameter added
export interface LLMProvider {
  executeTurn(
    systemPrompt: string,
    messages: RuntimeMessageParam[],
    tools?: ToolDefinition[],
    options?: TurnOptions
  ): Promise<ProviderTurnResult>;
}

// Updated: LLMGatewayError — 'ABORTED' added to type union; partialText field added
export class LLMGatewayError extends Error {
  constructor(
    public readonly type: 'AUTH_ERROR' | 'RATE_LIMIT' | 'PROVIDER_MALFORMED' | 'UNKNOWN' | 'ABORTED',
    message: string,
    public readonly partialText?: string
  ) {
    super(message);
    this.name = 'LLMGatewayError';
  }
}
```

### `runtime/src/spinner.ts` — full implementation spec

New file. Both providers import this module.

```typescript
export class Spinner {
  private static frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
  private index = 0;
  private timer?: NodeJS.Timeout;
  private running = false;

  start(label = 'Thinking...'): void {
    if (!process.stderr.isTTY) return;
    this.running = true;
    this.timer = setInterval(() => {
      const frame = Spinner.frames[this.index % Spinner.frames.length];
      process.stderr.write(`\r${frame} ${label}`);
      this.index++;
    }, 80);
  }

  stop(): void {
    if (!this.running) return;
    clearInterval(this.timer);
    this.running = false;
    if (process.stderr.isTTY) {
      process.stderr.write('\r\x1b[K');
    }
  }
}
```

Behavioral requirements:
- `start` is a no-op when `process.stderr.isTTY` is falsy (piped output, CI). `stop` must still be called in all code paths — it must also be a no-op when not running.
- `stop` clears the current line with `\r\x1b[K` (carriage return + erase to end of line). This must execute before any `process.stdout.write` calls in the same tick — call `spinner.stop()` synchronously before `process.stdout.write(delta.text)` to guarantee order.
- One `Spinner` instance per `executeTurn` call. Do not share a spinner across concurrent calls.

### `runtime/src/providers/anthropic.ts` — executeTurn signature and behavior

Updated signature:
```typescript
async executeTurn(
  systemPrompt: string,
  messages: RuntimeMessageParam[],
  tools?: ToolDefinition[],
  options?: TurnOptions
): Promise<ProviderTurnResult>
```

Abort signal threading:
```typescript
const stream = await this.client.messages.create(
  { model: this.model, max_tokens: 8192, system: systemPrompt, messages: nativeMessages,
    ...(nativeTools ? { tools: nativeTools } : {}), stream: true },
  { signal: options?.signal }   // ← second argument: RequestOptions
);
```

Usage extraction:
- `message_start` event: `(chunk as any).message?.usage?.input_tokens` → `inputTokens`
- `message_delta` event: `(chunk as any).usage?.output_tokens` → `outputTokens`
- Declare `let usage: TurnUsage | undefined` before the loop; populate inside the loop; include in the returned `ProviderTurnResult`.

Abort detection in catch block — this check must precede all SDK-specific error type checks:
```typescript
if (err?.name === 'AbortError' || options?.signal?.aborted) {
  spinner.stop();
  throw new LLMGatewayError('ABORTED', 'Turn aborted by operator', fullText || undefined);
}
```

First-token event: `chunk.type === 'content_block_delta'` AND `(chunk.delta as any).type === 'text_delta'` AND the accumulated `fullText` is currently empty (i.e., this is the first text delta). On this event, call `spinner.stop()` synchronously before `process.stdout.write(delta.text)`.

Tool-call turns (no text streamed): the spinner starts before the API call and is not stopped by a first-text-token event (none arrives). Stop the spinner after the `for await` loop completes normally — before the `toolUseBlocks.size > 0` check.

### `runtime/src/providers/openai-compatible.ts` — executeTurn signature and behavior

Updated signature: identical to Anthropic — add `options?: TurnOptions` as fourth parameter.

`stream_options` addition — unconditional:
```typescript
const stream = await this.client.chat.completions.create({
  model: this.model,
  messages: openAIMessages,
  stream: true,
  max_tokens: 8192,
  stream_options: { include_usage: true },   // ← always present
  ...(nativeTools ? { tools: nativeTools } : {})
}, { signal: options?.signal });
```

Usage extraction:
- Usage arrives on a trailing chunk where `chunk.choices` is empty and `chunk.usage` is populated (this is the behavior of OpenAI-compatible streaming with `include_usage: true`).
- Extract: `chunk.usage?.prompt_tokens` → `inputTokens`; `chunk.usage?.completion_tokens` → `outputTokens`.
- If `chunk.usage` is absent on all chunks (endpoint doesn't support `stream_options`), `usage` remains `undefined` — do not error.

Abort detection in catch block — precedes SDK-specific checks:
```typescript
if (err instanceof OpenAI.APIUserAbortError || options?.signal?.aborted) {
  spinner.stop();
  throw new LLMGatewayError('ABORTED', 'Turn aborted by operator', fullText || undefined);
}
```

First-token event: first chunk where `delta.content` is truthy AND `fullText` is currently empty. On this event, call `spinner.stop()` synchronously before `process.stdout.write(delta.content)`.

Tool-call turns: same as Anthropic — stop spinner after the `for await` loop exits normally.

### `runtime/src/llm.ts` — executeTurn signature, return type, abort threading

Updated `LLMGateway.executeTurn` signature:
```typescript
async executeTurn(
  systemPrompt: string,
  messageHistory: RuntimeMessageParam[],
  options?: TurnOptions
): Promise<GatewayTurnResult>
```

The `options` parameter is new; it was absent before. `GatewayTurnResult` replaces `Promise<string>`. All callers in `orient.ts` must be updated to destructure the result (see orient.ts section below).

Abort check at the start of each tool-call round:
```typescript
for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
  if (options?.signal?.aborted) {
    throw new LLMGatewayError('ABORTED', 'Turn aborted by operator');
  }
  const result = await this.provider.executeTurn(systemPrompt, messages, this.tools, options);
  // ...
}
```

Usage accumulation across tool-call rounds:
```typescript
let accInputTokens = 0;
let accOutputTokens = 0;
let anyUsage = false;

// inside the loop, after each provider.executeTurn call:
if (result.usage?.inputTokens !== undefined) { accInputTokens += result.usage.inputTokens; anyUsage = true; }
if (result.usage?.outputTokens !== undefined) { accOutputTokens += result.usage.outputTokens; anyUsage = true; }

// when returning:
const usage: TurnUsage | undefined = anyUsage
  ? { inputTokens: accInputTokens, outputTokens: accOutputTokens }
  : undefined;
return { text: result.text, usage };
```

On the no-tools path (single provider call, no loop), return the provider's usage directly:
```typescript
const result = await this.provider.executeTurn(systemPrompt, messageHistory, undefined, options);
if (result.type === 'text') return { text: result.text, usage: result.usage };
```

Tool-call notification — move from stdout to stderr:
```typescript
// Replace:
process.stdout.write(`[${call.name}${pathArg ? ': ' + pathArg : ''}]\n`);
// With:
process.stderr.write(`[${call.name}${pathArg ? ': ' + pathArg : ''}]\n`);
```

This prevents tool notifications from contaminating captured stdout in test or piped contexts, and is consistent with all other diagnostic output moving to stderr.

### `runtime/src/orient.ts` — abort wiring, result destructuring, usage display

**Updated `runInteractiveSession` signature** — add `externalSignal` as a final parameter:
```typescript
export async function runInteractiveSession(
  workspaceRoot: string,
  roleKey: string,
  providedSystemPrompt?: string,
  providedHistory?: RuntimeMessageParam[],
  inputStream: NodeJS.ReadableStream = process.stdin,
  outputStream: NodeJS.WritableStream = process.stdout,
  autonomous: boolean = false,
  externalSignal?: AbortSignal          // ← new
): Promise<HandoffResult | null>
```

**Interactive mode — session-scoped abort state** (declare after the readline interface is created):
```typescript
let currentController: AbortController | undefined;
rl.on('SIGINT', () => {
  currentController?.abort();
});
```

**Interactive mode — per-turn abort setup** (at the top of `promptUser()`, before `llm.executeTurn`):
```typescript
currentController = new AbortController();
const signal = currentController.signal;
```

**Autonomous mode — signal wiring**: In the autonomous paths (initial-turn block and history-resume block), use `externalSignal` directly:
```typescript
const { text: response, usage } = await llm.executeTurn(systemPrompt, [initialUserMsg], { signal: externalSignal });
```

**Updated `llm.executeTurn` calls** — pass signal and destructure result. Three call sites:
1. Initial turn (autonomous, lines ~47): `llm.executeTurn(systemPrompt, [initialUserMsg], { signal: externalSignal })`
2. History-resume turn (autonomous, lines ~73): `llm.executeTurn(systemPrompt, history, { signal: externalSignal })`
3. `promptUser` turn (interactive, line ~117): `llm.executeTurn(systemPrompt, history, { signal })`

All three must destructure `{ text, usage }` from the result.

**`ABORTED` catch handling** — applied at all three call sites, checked before existing error handling:
```typescript
if (error instanceof LLMGatewayError && error.type === 'ABORTED') {
  if (error.partialText) {
    history.push({ role: 'assistant', content: error.partialText });
  }
  process.stderr.write('\n[Aborted]\n');
  // Interactive mode: resume readline loop
  promptUser();
  return;
  // Autonomous mode: fall through to return null (existing null-return path)
}
```

For the autonomous paths (initial-turn catch and history-resume catch), the catch block appends `partialText` if present and then falls through to `return null`. The `null` return propagates to `orchestrator.ts`, which handles state persistence and transition to `awaiting_human` (see `orchestrator.ts` section below). Do not call `promptUser()` in autonomous paths — that function does not exist in that scope.

**Usage display** (after each successful `executeTurn` call, before handoff parsing):
```typescript
if (usage && process.stderr.isTTY) {
  const inStr  = usage.inputTokens  !== undefined ? String(usage.inputTokens)  : '?';
  const outStr = usage.outputTokens !== undefined ? String(usage.outputTokens) : '?';
  process.stderr.write(`[tokens: ${inStr} in, ${outStr} out]\n`);
}
```

Display once per `llm.executeTurn` call (per gateway turn). Do not display inside providers or inside the gateway's tool-call loop.

### `runtime/src/orchestrator.ts` — SIGINT wiring for autonomous sessions

In `advanceFlow`, the `runInteractiveSession` call (inside the `while (true)` loop) must be wrapped with a per-call `AbortController` and a process-level SIGINT handler:

```typescript
const controller = new AbortController();
const sigintHandler = () => controller.abort();
process.once('SIGINT', sigintHandler);

let handoffResult: HandoffResult | null = null;
try {
  handoffResult = await runInteractiveSession(
    flowRun.projectRoot, roleKey, bundleContent,
    injectedHistory as any,
    inputStream, outputStream,
    true,               // autonomous
    controller.signal   // ← externalSignal
  );
} finally {
  process.removeListener('SIGINT', sigintHandler);
}
```

The `finally` block is required — if the session returns normally or throws (e.g., `HandoffParseError`, `WorkflowError`), the SIGINT handler must be removed. Failing to remove it would leave a stale handler that fires `controller.abort()` on the next Ctrl+C even after the session has ended.

The existing `catch (e: any)` block for `HandoffParseError` / `WorkflowError` continues unchanged. `ABORTED` errors do not reach this block — they are caught inside `orient.ts` and converted to `null` returns.

When `runInteractiveSession` returns `null` (including after an abort): the existing `else` branch already handles this correctly — `status: 'awaiting_human'`, session history saved, flow state saved, loop breaks. No additional change needed in the `null` handling path.

---

## §5 — Liveness Display Design

### Form

Spinner-only (see §1 Open Question resolution Q1). The spinner appears from the moment the API call is initiated until the first streaming text token arrives. It is not a persistent status line.

### Integration points — per provider

**`AnthropicProvider`**: Start spinner immediately before `this.client.messages.create(...)`. Stop spinner on the first `content_block_delta` event where `delta.type === 'text_delta'` and `fullText === ''` (i.e., this is the first text character). Stop spinner in the catch block before any error rethrow (including `ABORTED`). Stop spinner after the `for await` loop exits normally for tool-call results (no text streamed).

**`OpenAICompatibleProvider`**: Start spinner immediately before `this.client.chat.completions.create(...)`. Stop spinner on the first chunk where `delta.content` is truthy and `fullText === ''`. Stop spinner in the catch block before any error rethrow. Stop spinner after the `for await` loop exits normally for tool-call results.

### stdout interference prevention

The spinner writes to `process.stderr` exclusively. Tokens write to `process.stdout`. These are separate file descriptors. No ANSI cursor management is required to prevent interleaving — the streams are independent. The `spinner.stop()` call before the first `process.stdout.write` ensures the spinner line is cleared from the terminal before text begins to appear. This ordering is enforced by calling `stop()` synchronously before the `write()` call in the same tick.

### Tool-call turns

During a tool-call API call, the agent returns tool use blocks — no text is streamed to stdout. The spinner label for tool-call turns is `'Thinking...'` (the default). The spinner stops after the `for await` loop completes (all chunks consumed). Tool call notifications (`[read_file: path]`) are written to stderr after the spinner has stopped.

---

## §6 — Token Usage Accumulation

### Anthropic provider

Usage events in the Anthropic streaming protocol:
- `message_start`: `event.message.usage.input_tokens` — prompt token count for this API call
- `message_delta`: `event.usage.output_tokens` — completion token count for this API call

Read both events and map to `TurnUsage`:
```typescript
let inputTokens: number | undefined;
let outputTokens: number | undefined;

// in the for-await loop:
if (chunk.type === 'message_start') {
  inputTokens = (chunk as any).message?.usage?.input_tokens;
}
if (chunk.type === 'message_delta') {
  outputTokens = (chunk as any).usage?.output_tokens;
}

// include in return:
const usage: TurnUsage | undefined = (inputTokens !== undefined || outputTokens !== undefined)
  ? { inputTokens, outputTokens }
  : undefined;
```

Both fields are optional: if a field is absent from the event (e.g., endpoint variant that omits it), leave it undefined.

### OpenAI-compatible provider

With `stream_options: { include_usage: true }`, usage appears on a trailing chunk after the last choice chunk:
```typescript
// in the for-await loop, add after the existing choices[0] handling:
if (!chunk.choices.length && chunk.usage) {
  inputTokens = chunk.usage.prompt_tokens ?? undefined;
  outputTokens = chunk.usage.completion_tokens ?? undefined;
}
```

If `chunk.usage` is never non-null across all chunks (endpoint does not support `stream_options`), both fields remain undefined. Return `usage: undefined` in `ProviderTurnResult`. This is the correct silent-failure behavior per Q4 resolution.

### Accumulation in `LLMGateway`

The gateway's tool-call loop calls `provider.executeTurn` up to 50 times. Each call may return usage. Accumulate additively using the `anyUsage` flag pattern defined in §4. Return a single `GatewayTurnResult.usage` representing the total for the entire gateway turn.

### Display

Token counts are displayed in `orient.ts` after each successful `llm.executeTurn` call returns. Format: `[tokens: N in, M out]`. Written to `process.stderr` only when `process.stderr.isTTY` is true — no display in piped/CI contexts. Display once per user turn (one `llm.executeTurn` call per prompt in interactive mode). When the provider does not report usage (`usage` is undefined on the result), skip the display entirely — do not print `[tokens: ? in, ? out]` unless at least one token field is defined.

### Context window utilization

Not displayed (see §1 Open Question resolution Q3). Raw counts only.

---

## §7 — CLI Surface Resolution

### Current state

Two entry points exist:
1. `bin/a-society.ts` (invoked via the `a-society` bin): project discovery → project selection → Owner session. This is the operator-facing entry.
2. `src/cli.ts` (invoked via `npm run a-society` or `tsx src/cli.ts`): accepts `run <workspaceRoot> <roleKey>` and `flow-status` sub-commands. This is the legacy entry — it predates the project-discovery UX.

`npm run a-society` (which calls `tsx src/cli.ts` with no args) currently prints `Available CLI commands: run, flow-status`. This is not useful operator UX and should not be documented.

### Resolved CLI surface

**Primary operator command: `a-society`**
Invokes `bin/a-society.ts`. No arguments needed for normal use. This is the only documented operator entry point.

**`flow-status` sub-command: `a-society flow-status`**
Add argument handling at the top of `main()` in `bin/a-society.ts`:
```typescript
async function main() {
  if (process.argv[2] === 'flow-status') {
    // inline the flow-status logic from cli.ts
    // (SessionStore.init, loadFlowRun, renderFlowStatus)
    return;
  }
  // existing project-discovery flow
}
```
The `flow-status` logic from `cli.ts` (lines ~12–26) is reproduced inline. This removes the dependency on `cli.ts` for any documented operator command.

**`src/cli.ts` disposition: retained, not documented.**
`cli.ts` retains its `run` and `flow-status` commands as internal/development tooling. It is not referenced in `INVOCATION.md`. The `run <workspaceRoot> <roleKey>` command remains available for programmatic invocation and test harnesses that need to start a session for a specific role without going through project discovery. No changes to `cli.ts`.

**`npm run a-society` disposition: removed from operator documentation.**
Remove from `INVOCATION.md`. The script entry in `package.json` (`start: "tsx src/cli.ts"`) remains unchanged — it is a development shortcut, not an operator command.

### New environment variables

None introduced. No env var to disable the spinner or opt out of usage reporting. The spinner and token display are TTY-gated via `process.stderr.isTTY` — they are automatically absent in non-interactive contexts without requiring configuration.

### INVOCATION.md changes

Replace the current content with updated documentation covering:
1. The `a-society` command (primary entry — project discovery and Owner session). Unchanged from current.
2. The `a-society flow-status` command (new). Shows current flow state from `.state/flow.json`.
3. Interrupt mechanism: "Press Ctrl+C during a model response to abort the current turn. The session remains active and you can send a new message."
4. Token display: "After each response, token usage is shown in the terminal (`[tokens: N in, M out]`). This appears on stderr and is visible only in interactive terminal sessions."
5. Required readings configuration — unchanged from current.
6. Error feedback loop — unchanged from current.
7. Remove the `npm run a-society` mention from the "Initiating a Session" section.

---

## §8 — Files Changed

| File | Action | Behavioral requirements |
|---|---|---|
| `runtime/src/types.ts` | Additive + replace | Add `TurnUsage`, `TurnOptions`, `GatewayTurnResult`. Update `ProviderTurnResult` to include `usage?: TurnUsage` on both variants. Update `LLMProvider.executeTurn` signature to add `options?: TurnOptions`. Add `'ABORTED'` to `LLMGatewayError` type union. Add `partialText?: string` field to `LLMGatewayError`. |
| `runtime/src/spinner.ts` | New file | Spinner writes to `process.stderr` only. `start()` is a no-op when `process.stderr.isTTY` is falsy. `stop()` is always safe to call (no-op when not running). `stop()` clears the current stderr line with `\r\x1b[K`. |
| `runtime/src/providers/anthropic.ts` | Replace | Thread `options?.signal` to `client.messages.create` RequestOptions. Extract `inputTokens` from `message_start` event, `outputTokens` from `message_delta` event. Start spinner before API call; stop spinner on first `text_delta` when `fullText === ''`; stop spinner in catch block (before rethrow); stop spinner after loop exits for tool-call result. Detect `AbortError` before SDK error type checks; throw `LLMGatewayError('ABORTED', ..., fullText \|\| undefined)` with `spinner.stop()` called first. Include `usage` on returned `ProviderTurnResult`. |
| `runtime/src/providers/openai-compatible.ts` | Replace | Thread `options?.signal` to `client.chat.completions.create` second-argument RequestOptions. Add `stream_options: { include_usage: true }` unconditionally. Extract usage from trailing chunk where `chunk.choices.length === 0 && chunk.usage` is defined. Start spinner before API call; stop spinner on first `delta.content` when `fullText === ''`; stop spinner in catch block; stop spinner after loop exits for tool-call result. Detect `OpenAI.APIUserAbortError` before SDK error type checks; throw `LLMGatewayError('ABORTED', ..., fullText \|\| undefined)` with `spinner.stop()` called first. Include `usage` on returned `ProviderTurnResult`. |
| `runtime/src/llm.ts` | Replace | Update `executeTurn` signature to `(systemPrompt, messageHistory, options?: TurnOptions): Promise<GatewayTurnResult>`. Thread `options` to `provider.executeTurn`. Add `options?.signal?.aborted` check at start of each tool-call round. Accumulate `TurnUsage` across rounds using `anyUsage` flag. Return `GatewayTurnResult` instead of `string`. Move tool-call notification from `process.stdout.write` to `process.stderr.write`. |
| `runtime/src/orient.ts` | Replace | Add `externalSignal?: AbortSignal` as final parameter to `runInteractiveSession`. Interactive mode: declare `let currentController` in session scope; add `rl.on('SIGINT', () => currentController?.abort())`; assign `new AbortController()` per `promptUser()` call; pass `{ signal }` to `llm.executeTurn`. Autonomous mode: pass `{ signal: externalSignal }` to `llm.executeTurn` at both autonomous call sites. Destructure `{ text, usage }` from all `llm.executeTurn` call sites. Add `ABORTED` catch handling at all three call sites: append `partialText` to history if non-empty; print `\n[Aborted]\n` to stderr; interactive: call `promptUser()`; autonomous: fall through to `return null`. Display token usage to stderr after each successful turn (TTY-gated). |
| `runtime/src/orchestrator.ts` | Replace | In `advanceFlow`, wrap each `runInteractiveSession` call with a per-call `AbortController`. Install `process.once('SIGINT', sigintHandler)` before the call; remove with `process.removeListener` in a `finally` block. Pass `controller.signal` as `externalSignal` to `runInteractiveSession`. No change to the `null`-result handling path (already transitions to `awaiting_human` and saves state). No change to `HandoffParseError`/`WorkflowError` catch path. |
| `runtime/bin/a-society.ts` | Additive | Add `flow-status` argument check at top of `main()`. Import `SessionStore`, `parseWorkflow`, `renderFlowStatus` (from `visualization.ts`). When `process.argv[2] === 'flow-status'`: call `SessionStore.init()`, load flow run, render and print status, return. |
| `runtime/INVOCATION.md` | Replace | Document interrupt (Ctrl+C, resumable session). Document token display format and stderr-only behavior. Add `a-society flow-status` as documented command. Remove `npm run a-society` from operator docs. |

---

**Record-folder bootstrapping exemption:** This advisory introduces no new record-folder requirements. The current flow folder (`a-society/a-docs/records/20260405-runtime-session-ux/`) is exempt-by-origin from any schema requirements that may apply to record folders in future flows.

**Coupling map consultation:** This advisory modifies runtime components, not tooling components. The coupling map taxonomy (Types A–F) covers `general/`–tooling coupling and does not apply to the runtime layer. No coupling map entry exists for runtime components. No coupling map update is required.

---

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260405-runtime-session-ux/03-ta-phase0-design.md
```
