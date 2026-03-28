**Subject:** runtime-tool-calling — Phase 0 Architecture Design
**Type:** Technical Architect → Owner
**Date:** 2026-03-28
**Record:** `a-society/a-docs/records/20260328-runtime-tool-calling/`

---

## §1 — Design Decision Summary

### Q1: Turn loop placement

The agentic tool loop lives in `LLMGateway`, not in each provider. `LLMProvider.executeTurn` becomes a single-round primitive: it makes one API call, translates the response into the shared `ProviderTurnResult` discriminated union, and returns. `LLMGateway.executeTurn` owns the loop — calling the provider, executing any tool calls, appending tool results, and calling the provider again until a final text response is received.

The alternative — loop in each provider — preserves the `LLMProvider` interface as `Promise<string>` but duplicates the loop logic across two providers. The loop is not trivial: it accumulates messages, executes tools, handles errors, and enforces a maximum-rounds guard. Duplicating this logic creates two maintenance surfaces, two test targets, and two divergence risks. The interface change to `LLMProvider.executeTurn` (returning `ProviderTurnResult` instead of `string`) is internal to the runtime and does not affect any caller outside the `runtime/src/` directory. The tradeoff favours the single loop.

**Why the existing `LLMProvider` interface cannot be extended without changing the return type:** The current interface returns `Promise<string>` — the final assistant text. There is no way to encode "here is a tool call request, not final text" in a `string`. The return type must change to a discriminated union. This is a breaking change to `LLMProvider`, but `LLMProvider` is an internal interface (not exported outside `runtime/`), so the impact is bounded to the two provider implementations.

`LLMGateway.executeTurn` retains its existing `Promise<string>` signature from the perspective of all callers (`orient.ts`, `orchestrator.ts`). The tool loop is fully encapsulated inside `LLMGateway` — callers see no change.

### Q2: RuntimeMessageParam representation

`RuntimeMessageParam` is extended to a four-variant discriminated union. The existing two variants (`user`, `assistant`) are unchanged — callers continue to construct and push only these variants. Two new variants are added (`assistant_tool_calls`, `tool_result`) and are created only inside `LLMGateway`'s tool loop. They are never pushed by `orient.ts` or `orchestrator.ts`.

The alternative — keeping `RuntimeMessageParam` as text-only and handling richer structure entirely within each provider's private message format — would require each provider to maintain its own accumulated message list across tool rounds. `LLMGateway` would need a second channel ("here are the tool calls; here are the results") separate from the messages list. This either duplicates the message accumulation or requires providers to maintain state across multiple `executeTurn` calls. The shared discriminated union avoids this: `LLMGateway` owns a single growing messages list, and each provider translates the full list to its native format on every call.

The new variants are created by `LLMGateway` and consumed by providers. Neither variant ever appears in the `history` arrays maintained by `orient.ts` or `orchestrator.ts` — callers continue to push plain `assistant` text entries after each `executeTurn` call resolves.

### Q3: Tool executor placement

The file I/O executor lives in a new module: `runtime/src/tools/file-executor.ts`. This module exports `FileToolExecutor` (the executor class) and `FILE_TOOL_DEFINITIONS` (the three `ToolDefinition` constants). `LLMGateway` instantiates `FileToolExecutor(workspaceRoot)` at construction time when `workspaceRoot` is provided, and invokes it when the provider returns `{ type: 'tool_calls' }`.

The executor receives the workspace root via its constructor. This is the only mechanism — the workspace root is not passed per-call, is not read from an environment variable, and is not resolved at execution time. Binding it at construction guarantees that every path check uses the same root for the lifetime of the gateway instance.

Errors (file not found, path traversal, write failure, unknown tool name) are communicated back to the model as tool results with `isError: true` and a descriptive error string. They are **not** thrown as exceptions and do not terminate the session. The model receives the error message, can acknowledge it, and continue. Exact error message formats are specified in §5 (file-executor row).

### Q4: orient.ts impact

`orient.ts` requires one change: `new LLMGateway()` becomes `new LLMGateway(workspaceRoot)`. The `workspaceRoot` value is already in scope at that line — it is the first parameter of `runOrientSession`. No other change to `orient.ts` is required. The tool loop, message accumulation, and tool execution are entirely encapsulated in `LLMGateway.executeTurn`. The `history` array in `orient.ts` continues to receive only `{ role: 'user', content }` and `{ role: 'assistant', content: finalText }` entries — tool call rounds are invisible to the caller.

### Q5: orchestrator.ts impact

`orchestrator.ts` requires one change: the class-level `private llm = new LLMGateway()` field is removed and replaced with a local `const llm = new LLMGateway(flowRun.projectRoot)` at the top of `advanceFlow`. The `flowRun.projectRoot` is already in scope. All subsequent calls from `advanceFlow` use the local `llm` variable.

The tool loop is fully encapsulated in `LLMGateway`. The call `this.llm.executeTurn(bundleContent, historyForTurn as any)` becomes `llm.executeTurn(bundleContent, historyForTurn as any)` — signature unchanged. The orchestrator does not need to handle tool call/result messages; those are invisible above `LLMGateway`.

### Q6: Path sandboxing

The sandboxing check uses `path.resolve` for normalization and then a `startsWith` prefix check:

1. Resolve: `const resolved = path.resolve(workspaceRoot, requestedPath)`
2. Normalize root: `const normalizedRoot = path.resolve(workspaceRoot)` (resolves any trailing slashes or `.` segments once at construction)
3. Check: `resolved === normalizedRoot || resolved.startsWith(normalizedRoot + path.sep)`

`path.resolve` handles `../` traversal by normalizing the path before the check — a path like `../../etc/passwd` resolves to an absolute path that will not start with the workspace root. Absolute paths in `requestedPath` are also handled correctly: `path.resolve('/workspace', '/etc/passwd')` returns `/etc/passwd`, which fails the `startsWith` check.

The `path.sep` suffix guard prevents false positives: without it, a workspace root of `/workspace` would incorrectly permit `/workspace-extras/file`.

**Failure mode:** Sandbox violations are caught inside `FileToolExecutor.execute` and returned as `{ content: <error string>, isError: true }`. They are never thrown as exceptions. The tool result is returned to the model, the session continues, and the model can acknowledge the rejection and attempt a different path.

### Q7: max_tokens adequacy

`max_tokens: 8192` is adequate as an output token limit for tool-calling turns and is not changed by this flow. The concern is correctly identified: tool results (file content) inflate the input, not the output. The model's output in a tool-call continuation turn is typically a further tool call request or a final summary — neither of which approaches 8192 tokens. The hardcoded `max_tokens` value controls the model's response length, not how much context it can receive.

The relevant risk is **input context overflow** from large file reads: if a file is very large, appending its content as a tool result may exhaust the model's context window (which is model-dependent and enforced by the provider, not by `max_tokens`). This is a known limitation of the file-reading pattern, not a `max_tokens` problem. It is not addressable in this flow; agents should read targeted paths rather than large binary or generated files. No change to `max_tokens` is required.

---

## §2 — Type Changes

All changes are in `a-society/runtime/src/types.ts`. Exact definitions to be implemented verbatim:

```typescript
// ── New: ToolDefinition ──────────────────────────────────────────────────────
// Shared intermediate format. Each provider translates to its native schema.
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

// ── New: ToolCall ────────────────────────────────────────────────────────────
// A single tool call returned by the model, in provider-agnostic form.
export interface ToolCall {
  id: string;                        // provider-assigned call ID
  name: string;                      // tool name
  input: Record<string, unknown>;    // parsed argument object
}

// ── Modified: RuntimeMessageParam ───────────────────────────────────────────
// Extends to four variants. Callers use only 'user' and 'assistant'.
// 'assistant_tool_calls' and 'tool_result' are created only inside LLMGateway.
export type RuntimeMessageParam =
  | { role: 'user';                content: string }
  | { role: 'assistant';           content: string }
  | { role: 'assistant_tool_calls'; calls: ToolCall[]; text?: string }
  | { role: 'tool_result';         callId: string; toolName: string; content: string; isError: boolean };

// ── New: ProviderTurnResult ──────────────────────────────────────────────────
// Discriminated union returned by LLMProvider.executeTurn (single-round call).
// LLMGateway inspects this to decide whether to loop or return.
export type ProviderTurnResult =
  | { type: 'text'; text: string }
  | { type: 'tool_calls'; calls: ToolCall[]; continuationMessages: RuntimeMessageParam[] };
  // continuationMessages: the assistant message(s) representing this round's
  // tool call(s), already translated to RuntimeMessageParam format by the
  // provider. LLMGateway appends these plus tool result messages before
  // calling the provider again.

// ── Modified: LLMProvider ────────────────────────────────────────────────────
// executeTurn now returns ProviderTurnResult and accepts optional tools.
export interface LLMProvider {
  executeTurn(
    systemPrompt: string,
    messages: RuntimeMessageParam[],
    tools?: ToolDefinition[]
  ): Promise<ProviderTurnResult>;
}

// LLMGatewayError — unchanged
export class LLMGatewayError extends Error {
  constructor(public readonly type: 'AUTH_ERROR' | 'RATE_LIMIT' | 'PROVIDER_MALFORMED' | 'UNKNOWN', message: string) {
    super(message);
    this.name = 'LLMGatewayError';
  }
}

// All other existing types (FlowStatus, FlowRun, RoleSession, TurnRecord,
// TriggerRecord, OrientSession) — unchanged.
```

---

## §3 — Tool Definitions

### Shared intermediate format (`ToolDefinition[]`)

These are the three `ToolDefinition` objects exported as `FILE_TOOL_DEFINITIONS` from `src/tools/file-executor.ts`. Providers translate them to their native schema format before each API call.

```typescript
export const FILE_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'read_file',
    description: 'Read the contents of a file at the given path, relative to the workspace root. Returns the raw file content as a string.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file, relative to the workspace root. Must not traverse outside the workspace root.'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'write_file',
    description: 'Write content to a file at the given path, relative to the workspace root. Creates the file and any intermediate directories if they do not exist. Overwrites the file if it already exists.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the file, relative to the workspace root. Must not traverse outside the workspace root.'
        },
        content: {
          type: 'string',
          description: 'The content to write to the file.'
        }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'list_directory',
    description: 'List the contents of a directory at the given path, relative to the workspace root. Returns a JSON array of entry names. Directory names are suffixed with "/". Entries are sorted lexicographically.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to the directory, relative to the workspace root. Must not traverse outside the workspace root.'
        }
      },
      required: ['path']
    }
  }
];
```

### Anthropic native format (produced by `AnthropicProvider`)

Each `ToolDefinition` translates to:

```typescript
// Anthropic.Tool
{
  name: def.name,
  description: def.description,
  input_schema: def.inputSchema   // key rename: inputSchema → input_schema
}
```

The Anthropic SDK `Tool` type uses `input_schema` (snake_case). The `inputSchema` value is structurally identical to what Anthropic expects — no property changes, only key rename.

### OpenAI native format (produced by `OpenAICompatibleProvider`)

Each `ToolDefinition` translates to:

```typescript
// OpenAI.Chat.ChatCompletionTool
{
  type: 'function',
  function: {
    name: def.name,
    description: def.description,
    parameters: def.inputSchema   // key rename: inputSchema → parameters
  }
}
```

The OpenAI SDK wraps the function schema under `{ type: 'function', function: { ... } }`. The schema itself (`def.inputSchema`) maps directly to `parameters`.

---

## §4 — Interface Changes

### `types.ts`

Full set of new/modified exports is in §2. Summary of changes:
- `RuntimeMessageParam`: `{ role: 'user' | 'assistant'; content: string }` → discriminated union (4 variants)
- `LLMProvider.executeTurn`: return type `Promise<string>` → `Promise<ProviderTurnResult>`; adds optional third parameter `tools?: ToolDefinition[]`
- New exports: `ToolDefinition`, `ToolCall`, `ProviderTurnResult`
- Import source for consumers: all new types are exported from `types.ts`. `llm.ts` re-exports `RuntimeMessageParam` (existing behaviour); it must also re-export `ToolDefinition` and `ToolCall` for any consumer importing from `llm.ts`.

### `llm.ts` — `LLMGateway`

**Constructor** (threading path: `orient.ts` / `orchestrator.ts` → `LLMGateway` constructor → `FileToolExecutor` constructor):

```typescript
constructor(workspaceRoot?: string, provider?: LLMProvider)
```

- If `workspaceRoot` is provided: instantiate `FileToolExecutor(workspaceRoot)` and set `this.tools = FILE_TOOL_DEFINITIONS`. Both are stored as private fields.
- If `workspaceRoot` is absent: `this.executor = undefined`; `this.tools = undefined`.
- The `provider` override parameter is preserved in the same position as today (callers passing a custom provider must now pass `workspaceRoot` first, or `undefined` as the first argument if tools are not needed).

**`executeTurn`** — signature unchanged from callers' perspective:

```typescript
async executeTurn(systemPrompt: string, messageHistory: RuntimeMessageParam[]): Promise<string>
```

Internal implementation when `this.tools` is defined (tool-enabled path):

```typescript
const MAX_TOOL_ROUNDS = 10;
let messages: RuntimeMessageParam[] = [...messageHistory];
for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
  const result = await this.provider.executeTurn(systemPrompt, messages, this.tools);
  if (result.type === 'text') {
    return result.text;
  }
  // Execute each tool call; collect results
  const toolResultMessages: RuntimeMessageParam[] = await Promise.all(
    result.calls.map(async (call) => {
      const { content, isError } = await this.executor!.execute(call);
      return { role: 'tool_result' as const, callId: call.id, toolName: call.name, content, isError };
    })
  );
  messages = [...messages, ...result.continuationMessages, ...toolResultMessages];
}
throw new LLMGatewayError('UNKNOWN', 'Tool call loop exceeded maximum rounds (10). The session has been aborted.');
```

Internal implementation when `this.tools` is undefined (no-tool path — existing behaviour preserved):

```typescript
const result = await this.provider.executeTurn(systemPrompt, messageHistory, undefined);
return result.text;  // provider always returns { type: 'text' } when no tools are passed
```

**Re-exports from `llm.ts`:** `RuntimeMessageParam` (existing), `ToolDefinition`, `ToolCall` (new). These additions ensure consumers importing from `llm.ts` have access to all types needed to construct messages.

### `providers/anthropic.ts` — `AnthropicProvider.executeTurn`

New signature:

```typescript
async executeTurn(
  systemPrompt: string,
  messages: RuntimeMessageParam[],
  tools?: ToolDefinition[]
): Promise<ProviderTurnResult>
```

**Threading path:** `LLMGateway.executeTurn` passes `this.tools` (may be `undefined`) as the third argument → `AnthropicProvider.executeTurn` receives it as `tools`.

**`RuntimeMessageParam[]` → Anthropic native message translation** (private helper, called at the top of `executeTurn`):

| `RuntimeMessageParam` variant | Anthropic native `MessageParam` |
|---|---|
| `{ role: 'user', content }` | `{ role: 'user', content: string }` |
| `{ role: 'assistant', content }` | `{ role: 'assistant', content: string }` |
| `{ role: 'assistant_tool_calls', calls, text? }` | `{ role: 'assistant', content: [...(text ? [{ type: 'text', text }] : []), ...calls.map(c => ({ type: 'tool_use', id: c.id, name: c.name, input: c.input }))] }` |
| `{ role: 'tool_result', callId, content, isError }` | `{ role: 'user', content: [{ type: 'tool_result', tool_use_id: callId, content, is_error: isError }] }` |

**Branch when `tools` is non-empty — non-streaming path:**

```typescript
const response = await this.client.messages.create({
  model: this.model,
  max_tokens: 8192,
  system: systemPrompt,
  messages: nativeMessages,
  tools: nativeTools,    // ToolDefinition[] translated to Anthropic Tool[]
  stream: false
});
```

Parse `response.content`:
- If `response.stop_reason === 'tool_use'`: collect all `tool_use` blocks → `ToolCall[]`; collect leading `text` block content → `text?`; return `{ type: 'tool_calls', calls, continuationMessages: [{ role: 'assistant_tool_calls', calls, text }] }`.
- If `response.stop_reason === 'end_turn'`: collect text content → print to stdout; return `{ type: 'text', text }`.

**Branch when `tools` is absent or empty — streaming path (existing behaviour, return type updated):**

Existing streaming implementation unchanged except final `return fullResponse` becomes `return { type: 'text', text: fullResponse }`.

### `providers/openai-compatible.ts` — `OpenAICompatibleProvider.executeTurn`

New signature:

```typescript
async executeTurn(
  systemPrompt: string,
  messages: RuntimeMessageParam[],
  tools?: ToolDefinition[]
): Promise<ProviderTurnResult>
```

**Threading path:** `LLMGateway.executeTurn` passes `this.tools` → `OpenAICompatibleProvider.executeTurn` receives it as `tools`.

**`RuntimeMessageParam[]` → OpenAI native message translation** (private helper):

| `RuntimeMessageParam` variant | OpenAI native `ChatCompletionMessageParam` |
|---|---|
| `{ role: 'user', content }` | `{ role: 'user', content }` |
| `{ role: 'assistant', content }` | `{ role: 'assistant', content }` |
| `{ role: 'assistant_tool_calls', calls, text? }` | `{ role: 'assistant', content: text \|\| null, tool_calls: calls.map(c => ({ id: c.id, type: 'function', function: { name: c.name, arguments: JSON.stringify(c.input) } })) }` |
| `{ role: 'tool_result', callId, content }` | `{ role: 'tool', content, tool_call_id: callId }` |

Note: `role: 'tool'` is an OpenAI-specific role that exists in the OpenAI SDK types but has no counterpart in `RuntimeMessageParam`. The translation produces it from `tool_result` entries; it is never placed in the shared `RuntimeMessageParam` type.

**Branch when `tools` is non-empty — non-streaming path:**

```typescript
const response = await this.client.chat.completions.create({
  model: this.model,
  messages: nativeMessages,
  tools: nativeTools,    // ToolDefinition[] translated to ChatCompletionTool[]
  stream: false,
  max_tokens: 8192
});
const message = response.choices[0].message;
```

Parse `message`:
- If `message.tool_calls` is present and non-empty: extract `ToolCall[]` from `message.tool_calls`; text is `message.content || undefined`; return `{ type: 'tool_calls', calls, continuationMessages: [{ role: 'assistant_tool_calls', calls, text }] }`.
- Otherwise: print `message.content` to stdout; return `{ type: 'text', text: message.content ?? '' }`.

**Branch when `tools` is absent or empty — streaming path (existing behaviour, return type updated):**

Existing streaming implementation unchanged except final `return fullResponse` becomes `return { type: 'text', text: fullResponse }`.

### `orient.ts`

Single change. Threading path: `workspaceRoot` is the first parameter of `runOrientSession` → passed to `LLMGateway` constructor.

```typescript
// Before
const llm = new LLMGateway();

// After
const llm = new LLMGateway(workspaceRoot);
```

No other changes. The `history` array, readline loop, and all `executeTurn` calls are unchanged.

### `orchestrator.ts`

Single structural change. Threading path: `flowRun.projectRoot` is available inside `advanceFlow` → passed to `LLMGateway` constructor.

```typescript
// Before (class field)
private llm = new LLMGateway();

// After (local variable at top of advanceFlow)
// Remove the class field entirely.
// Inside advanceFlow, before the first use of llm:
const llm = new LLMGateway(flowRun.projectRoot);
```

All references to `this.llm` inside `advanceFlow` become `llm`. The call signature `llm.executeTurn(bundleContent, historyForTurn as any)` is unchanged.

### `src/tools/file-executor.ts` (new module)

```typescript
export class FileToolExecutor {
  private readonly workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = path.resolve(workspaceRoot);  // normalise once at construction
  }

  async execute(call: ToolCall): Promise<{ content: string; isError: boolean }>
  // Dispatches to readFile / writeFile / listDirectory by call.name.
  // Unknown name → { content: "Error: unknown tool '<name>'", isError: true }

  private sandboxPath(requestedPath: string): string
  // Returns the resolved absolute path if within workspaceRoot.
  // Throws SandboxViolationError (internal) if outside.

  private async readFile(resolvedPath: string): Promise<{ content: string; isError: boolean }>
  private async writeFile(resolvedPath: string, content: string): Promise<{ content: string; isError: boolean }>
  private async listDirectory(resolvedPath: string): Promise<{ content: string; isError: boolean }>
}
```

Full sandboxing and error message specifications are in §5 (file-executor row).

---

## §5 — Files Changed

| File | Action | Behavioral requirements |
|---|---|---|
| `runtime/src/types.ts` | modify | (1) `RuntimeMessageParam` is a discriminated union with exactly four variants: `user`, `assistant`, `assistant_tool_calls`, `tool_result`. (2) `ToolDefinition`, `ToolCall`, `ProviderTurnResult` are exported. (3) `LLMProvider.executeTurn` returns `Promise<ProviderTurnResult>` and accepts optional `tools?: ToolDefinition[]`. (4) All existing types (`FlowStatus`, `FlowRun`, `RoleSession`, `TurnRecord`, `TriggerRecord`, `OrientSession`, `LLMGatewayError`) are unchanged. |
| `runtime/src/llm.ts` | modify | (1) `LLMGateway` constructor signature: `constructor(workspaceRoot?: string, provider?: LLMProvider)`. (2) When `workspaceRoot` is provided: `FileToolExecutor` and `FILE_TOOL_DEFINITIONS` are instantiated and stored as private fields. (3) When `workspaceRoot` is absent: `this.executor` and `this.tools` are `undefined`; no-tool path is used. (4) `executeTurn` signature is unchanged: `(systemPrompt: string, messageHistory: RuntimeMessageParam[]): Promise<string>`. (5) Tool-enabled path: loop runs up to `MAX_TOOL_ROUNDS = 10` iterations; on each iteration the provider is called with `this.tools`; if `tool_calls` result, all tool calls are executed via `this.executor`, results are appended as `tool_result` messages, and the loop continues; if `text` result, it is returned immediately. (6) When `MAX_TOOL_ROUNDS` is exceeded: throw `LLMGatewayError('UNKNOWN', 'Tool call loop exceeded maximum rounds (10). The session has been aborted.')`. (7) No-tool path: single `provider.executeTurn` call; returns `result.text` directly. (8) `RuntimeMessageParam`, `ToolDefinition`, and `ToolCall` are re-exported from this module. |
| `runtime/src/providers/anthropic.ts` | modify | (1) `executeTurn` signature updated: third optional parameter `tools?: ToolDefinition[]`; return type `Promise<ProviderTurnResult>`. (2) `RuntimeMessageParam[]` is translated to Anthropic native `MessageParam[]` using the four-variant mapping defined in §4 before each API call. (3) When `tools` is non-empty: `stream: false`; Anthropic `Tool[]` format is used (key `input_schema`, not `inputSchema`). (4) Non-streaming tool response: `stop_reason === 'tool_use'` → return `{ type: 'tool_calls', calls, continuationMessages: [{ role: 'assistant_tool_calls', calls, text? }] }`. (5) Non-streaming text response: `stop_reason === 'end_turn'` → print text to `process.stdout`; return `{ type: 'text', text }`. (6) When `tools` is absent or empty: streaming path preserved; final return changes from `return fullResponse` to `return { type: 'text', text: fullResponse }`. (7) Error handling (AUTH_ERROR, RATE_LIMIT, PROVIDER_MALFORMED, UNKNOWN) is unchanged. (8) Non-happy-path — `response.content` contains no text and no `tool_use` blocks (unexpected `stop_reason`): throw `LLMGatewayError('PROVIDER_MALFORMED', 'Unexpected stop_reason from Anthropic provider: <value>')`. |
| `runtime/src/providers/openai-compatible.ts` | modify | (1) `executeTurn` signature updated: third optional parameter `tools?: ToolDefinition[]`; return type `Promise<ProviderTurnResult>`. (2) `RuntimeMessageParam[]` is translated to OpenAI native `ChatCompletionMessageParam[]` using the four-variant mapping defined in §4. (3) When `tools` is non-empty: `stream: false`; OpenAI `ChatCompletionTool[]` format is used (`{ type: 'function', function: { name, description, parameters } }`). (4) Non-streaming tool response: `message.tool_calls` is present and non-empty → return `{ type: 'tool_calls', calls, continuationMessages: [{ role: 'assistant_tool_calls', calls, text? }] }`. Tool call `arguments` string is JSON-parsed to produce `call.input`; if parsing fails, return `{ content: "Error: could not parse tool arguments: <raw string>", isError: true }` for that call. (5) Non-streaming text response: `message.tool_calls` absent/empty → print `message.content` to `process.stdout`; return `{ type: 'text', text: message.content ?? '' }`. (6) When `tools` is absent or empty: streaming path preserved; final return changes from `return fullResponse` to `return { type: 'text', text: fullResponse }`. (7) Error handling unchanged. (8) Non-happy-path — `choices` is empty or `choices[0].message` is absent: throw `LLMGatewayError('PROVIDER_MALFORMED', 'OpenAI-compatible provider returned empty choices.')`. |
| `runtime/src/orient.ts` | modify | (1) `new LLMGateway()` is replaced with `new LLMGateway(workspaceRoot)`. (2) No other changes. The `history` array, readline loop, initial user message, and all `executeTurn` call sites are unchanged. (3) Backward-compatibility: if the LLM makes no tool calls during an `executeTurn` invocation, behaviour is identical to today. |
| `runtime/src/orchestrator.ts` | modify | (1) Class-level `private llm = new LLMGateway()` field is removed. (2) `const llm = new LLMGateway(flowRun.projectRoot)` is added at the top of `advanceFlow`, before the first `llm.executeTurn` call. (3) All references to `this.llm` inside `advanceFlow` become `llm`. (4) The `executeTurn` call signature is unchanged. (5) Backward-compatibility: if the LLM makes no tool calls, behaviour is identical to today. |
| `runtime/src/tools/file-executor.ts` | new | (1) Exports `FileToolExecutor` class and `FILE_TOOL_DEFINITIONS` constant. (2) Constructor stores `path.resolve(workspaceRoot)` as the normalised workspace root. (3) `execute(call: ToolCall)` dispatches by `call.name`; unknown tool name returns `{ content: "Error: unknown tool '<name>'", isError: true }`. (4) `sandboxPath(requestedPath)`: calls `path.resolve(this.workspaceRoot, requestedPath)`; checks that the result equals `this.workspaceRoot` OR starts with `this.workspaceRoot + path.sep`; on violation throws an internal error caught by each operation method and returned as `{ content: "Error: path '<requestedPath>' is outside the workspace root and cannot be accessed.", isError: true }`. This is a real in-process function call — not a stub or comment placeholder — executed on every file operation before any I/O. (5) `readFile`: success → raw file content string; file not found → `{ content: "Error: no such file: <resolvedPath>", isError: true }`; is a directory → `{ content: "Error: '<resolvedPath>' is a directory, not a file. Use list_directory to inspect directories.", isError: true }`; other I/O error → `{ content: "Error: could not read file: <err.message>", isError: true }`. (6) `writeFile`: creates intermediate directories with `fs.mkdirSync(path.dirname(resolvedPath), { recursive: true })` before writing; success → `{ content: "OK: wrote <byteCount> bytes to <resolvedPath>", isError: false }`; write failure → `{ content: "Error: could not write file: <err.message>", isError: true }`. (7) `listDirectory`: reads directory entries; appends `/` suffix to names that are directories; sorts lexicographically; serialises with `JSON.stringify`; success → `{ content: <jsonArrayString>, isError: false }`; not found → `{ content: "Error: no such directory: <resolvedPath>", isError: true }`; not a directory → `{ content: "Error: '<resolvedPath>' is not a directory.", isError: true }`; other I/O error → `{ content: "Error: could not list directory: <err.message>", isError: true }`. (8) `FILE_TOOL_DEFINITIONS` exports the three `ToolDefinition` objects specified in §3. |

---

## §6 — Co-maintenance Dependencies

**None.** The runtime components designed here do not read or parse any `a-docs/` structured content. `FileToolExecutor` reads arbitrary workspace files as directed by the agent at runtime — it does not parse the structure or fields of any `a-docs/` artifact.

The coupling map (`$A_SOCIETY_TOOLING_COUPLING_MAP`) covers `tooling/` component dependencies on `general/` formats. None of the files modified in this design are tooling components in the `tooling/` layer; they are runtime components in `runtime/src/`. The coupling map taxonomy does not apply to this change.

---

## §7 — Open Questions for Owner

**None.** All seven design questions are resolved from the existing architecture, the current source files, and the constraints stated in the brief. No decision in this design implies a change to what A-Society is or does, requires structural changes to `general/` or `agents/`, or requires adopting projects to change how they use the framework.

---

## Handoff

This document is ready for Owner review. Artifact path: `a-society/a-docs/records/20260328-runtime-tool-calling/03-ta-to-owner.md`.

The Owner needs to evaluate:
1. Whether the turn loop placement decision (loop in `LLMGateway`) is acceptable, given it requires changing the `LLMProvider` interface.
2. Whether non-streaming for all tool-enabled turns is acceptable for Phase 0, with streaming optimization deferred.
3. Whether the `MAX_TOOL_ROUNDS = 10` guard and its error message are appropriate.
4. Whether `write_file` creating intermediate directories automatically is the intended behaviour.

If approved, the Developer implements directly from this document. There is no Curator proposal round.
