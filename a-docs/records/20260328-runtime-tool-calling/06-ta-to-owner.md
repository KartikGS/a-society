**Subject:** runtime-tool-calling — Integration Assessment
**Type:** Technical Architect → Owner
**Date:** 2026-03-28
**Record:** `a-society/a-docs/records/20260328-runtime-tool-calling/`
**Spec reviewed against:** `03-ta-to-owner.md`
**Files reviewed:** all 7 per §5

---

## Verdict

The implementation satisfies the specification's behavioral requirements. All seven files are conformant with their §5 checklists. Two items require Owner disposition before the integration gate closes; one UX note is filed for awareness.

---

## File-by-File Findings

| File | Status | Notes |
|---|---|---|
| `runtime/src/types.ts` | Conformant | All type changes match §2 verbatim. Existing types unchanged. |
| `runtime/src/llm.ts` | Conformant — see item 1, item 2 | Tool loop, MAX_TOOL_ROUNDS, re-exports all correct. Two items noted below. |
| `runtime/src/tools/file-executor.ts` | Conformant | Sandbox logic, error messages, directory creation, and FILE_TOOL_DEFINITIONS all match §3 and §5. |
| `runtime/src/providers/anthropic.ts` | Conformant — see item 3 | Message translation, non-streaming branch, stop_reason handling, error types all correct. Minor UX note. |
| `runtime/src/providers/openai-compatible.ts` | Conformant — see item 1, item 3 | Message translation, tool schema format, empty-choices guard, parse error handling all present. |
| `runtime/src/orient.ts` | Conformant | Single required change applied correctly. No other modifications. |
| `runtime/src/orchestrator.ts` | Conformant | Class field removed, local instantiation with `flowRun.projectRoot` in place. |

---

## Item 1 — Parse Error Sentinel (Owner disposition required)

**Files:** `runtime/src/providers/openai-compatible.ts` lines 77–82; `runtime/src/llm.ts` lines 58–61

**What the spec said:** §4 (openai-compatible.ts) and §5 (openai-compatible row) specified: if JSON parsing of `function.arguments` fails, produce an error tool result `{ content: "Error: could not parse tool arguments: <raw string>", isError: true }` for that call.

**What the spec did not say:** the `ProviderTurnResult` type has no mechanism to carry per-call parse errors alongside successful calls. The spec specified the observable behavior but left the implementation path to the Developer.

**What the Developer did:** On parse failure, the OpenAI provider sets `input = { _parseError: rawArgs }` on the `ToolCall` object. `LLMGateway.executeTurn` checks for this sentinel before calling the executor and, if present, constructs the error tool result directly.

**Observable behavior:** Correct. The model receives the specified error string as a `tool_result` with `isError: true`.

**The concern:** The sentinel `_parseError` is not a field in the `ToolCall` interface — it is an implicit convention between one specific provider and the gateway. Two risks follow:

1. **Hidden coupling.** Future developers reading `LLMGateway.executeTurn` or adding a third provider will not find this convention in the type system.
2. **False-positive collision.** If a model returns syntactically valid JSON arguments that happen to include a key named `_parseError`, the gateway will treat it as a parse error rather than a valid call input. The probability is low but the failure mode is silent and incorrect.

**Owner options:**
- **A — Accept as-is.** The behavior is correct and the collision risk is negligible for the three defined tools. Add a code comment in `LLMGateway.executeTurn` documenting the sentinel convention.
- **B — Require a type-level fix.** Add a typed field to `ToolCall` — e.g., `parseError?: string` — so the convention is explicit and type-safe. This is a small spec update and a small code change; no behavioral change.

---

## Item 2 — Silent Empty-String Fallback on No-Tool Path (Owner disposition required)

**File:** `runtime/src/llm.ts` lines 41–45

```typescript
if (!this.tools || !this.executor) {
  const result = await this.provider.executeTurn(systemPrompt, messageHistory, undefined);
  if (result.type === 'text') return result.text;
  return '';   // ← fallback
}
```

**What the spec said:** "No-tool path: single `provider.executeTurn` call; returns `result.text` directly." The spec did not address the case where a provider returns `{ type: 'tool_calls' }` when no tools were configured.

**The concern:** If a provider misbehaves and returns `tool_calls` when no tools were passed, the gateway returns `''` silently. The caller sees an empty string with no error. In `orient.ts` this produces a blank response; in `orchestrator.ts` the handoff parser subsequently fails with a contract violation error — a downstream failure that obscures the root cause.

**Owner options:**
- **A — Accept as-is.** The scenario requires a provider bug. Downstream errors (blank response, handoff parse failure) are detectable. No change required.
- **B — Require a throw.** Replace `return ''` with `throw new LLMGatewayError('PROVIDER_MALFORMED', 'Provider returned tool_calls but no tools were configured.')`. This makes the root cause immediately visible.

---

## Item 3 — Missing Newline After Non-Streaming Stdout Output (UX note, no action required)

**Files:** `runtime/src/providers/anthropic.ts` line 87; `runtime/src/providers/openai-compatible.ts` line 90

In both non-streaming tool paths, `process.stdout.write(text)` is called for the final text response but no trailing `\n` follows. The streaming paths both call `process.stdout.write('\n')` after the stream finishes. This produces inconsistent terminal output when the tool path completes: the final response runs into the next prompt or log line.

No action required. This is a UX inconsistency, not a behavioral spec violation. Flagged for awareness; the Developer can address in a follow-on pass.

---

## Summary for Owner

Two items require a disposition decision before the integration gate closes:

- **Item 1 (parse error sentinel):** Accept with a code comment, or require a typed `parseError?` field on `ToolCall`. Both options are valid. Option B is slightly more defensible long-term.
- **Item 2 (silent empty string):** Accept the silent fallback, or require a throw. Option B produces clearer diagnostics at low cost.

Item 3 (newline) requires no action.

If both items are accepted (Option A for each), the integration gate can close without further Developer work. If either Option B is chosen, a targeted one-line change is sufficient in each case and does not require re-review.

---

## Handoff

Artifact path: `a-society/a-docs/records/20260328-runtime-tool-calling/06-ta-to-owner.md`

The Owner evaluates items 1 and 2, records their dispositions, and routes to the Integration Gate.
