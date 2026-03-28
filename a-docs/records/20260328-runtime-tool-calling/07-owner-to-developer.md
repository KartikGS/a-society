**Subject:** runtime-tool-calling — Integration Gate: Two Remediation Items
**Type:** Owner → Runtime Developer
**Date:** 2026-03-28
**Record:** `a-society/a-docs/records/20260328-runtime-tool-calling/`

---

## Gate Status

Integration gate does not close yet. Two targeted changes are required before closure. No re-review by the TA is needed — apply the changes, confirm compile passes, and file `08-runtime-developer-completion.md` confirming both are done.

---

## Item 1 — Parse Error Sentinel: Option B (typed field)

**Decision:** Add `parseError?: string` to the `ToolCall` interface in `types.ts`. Update the two sites that use the sentinel to use this field instead of the implicit `_parseError` key on `input`.

**Required changes:**

1. `runtime/src/types.ts` — Add one optional field to `ToolCall`:
   ```typescript
   export interface ToolCall {
     id: string;
     name: string;
     input: Record<string, unknown>;
     parseError?: string;             // ← add this
   }
   ```

2. `runtime/src/providers/openai-compatible.ts` — Where a JSON parse failure currently sets `input: { _parseError: rawArgs }`, instead set:
   ```typescript
   { id: ..., name: ..., input: {}, parseError: rawArgs }
   ```

3. `runtime/src/llm.ts` — Where the gateway currently checks `call.input._parseError`, instead check `call.parseError`.

**Why Option A was not accepted:** Adding a code comment mitigates discoverability but not the false-positive collision risk. A model returning valid JSON arguments with a key named `_parseError` would be silently mishandled. `parseError?: string` is the correct scope: it is a first-class property of a tool call, not a hidden encoding inside the `input` map.

---

## Item 2 — Silent Empty-String Fallback: Option B (throw)

**Decision:** Replace the `return ''` fallback in the no-tool path of `LLMGateway.executeTurn` with a `LLMGatewayError` throw.

**Required change:**

`runtime/src/llm.ts` — In the no-tool path:

```typescript
// Before
if (result.type === 'text') return result.text;
return '';

// After
if (result.type === 'text') return result.text;
throw new LLMGatewayError('PROVIDER_MALFORMED', 'Provider returned tool_calls but no tools were configured.');
```

**Why Option A was not accepted:** A provider returning `tool_calls` when no tools were configured is a provider bug. The current fallback produces an empty string that propagates silently: in `orient.ts` the user sees a blank response; in `orchestrator.ts` the handoff parser subsequently throws a contract violation that does not mention the actual root cause. The throw produces `PROVIDER_MALFORMED` immediately, which maps to the `failed` flow status and gives operators an accurate diagnostic.

---

## Item 3 — Missing Newline (UX note)

No action required in this flow. Accepted as a known cosmetic gap; can be addressed in a follow-on pass.

---

## After Remediation

File `08-runtime-developer-completion.md` confirming:
1. Both changes applied as specified
2. `npx tsc --noEmit` passes with no errors

No integration re-review by the TA is needed. The gate will close on the Developer's confirmation.

---

## Handoff

Resume the existing Runtime Developer session:

```
Next action: Apply the two remediation items and file confirmation
Read: a-society/a-docs/records/20260328-runtime-tool-calling/07-owner-to-developer.md
Expected response: 08-runtime-developer-completion.md confirming both changes applied and compile passes
```
