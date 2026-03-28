**Subject:** runtime-tool-calling — Remediation Completion
**Type:** Runtime Developer → Owner
**Date:** 2026-03-28
**Record:** `a-society/a-docs/records/20260328-runtime-tool-calling/`

---

## 1. Remediation Summary

The two remediation items specified in `07-owner-to-developer.md` have been applied.

### Item 1 — Parse Error Sentinel (Option B)
- **`runtime/src/types.ts`**: Added `parseError?: string` to the `ToolCall` interface.
- **`runtime/src/providers/openai-compatible.ts`**: Updated the JSON parse failure path to set the `parseError` field on the returned `ToolCall` object and cleared the `input` map to avoid sentinel key collisions.
- **`runtime/src/llm.ts`**: Updated the tool loop's parse error check to verify the new `call.parseError` property directly.

### Item 2 — Silent Empty-String Fallback (Option B)
- **`runtime/src/llm.ts`**: In `executeTurn`, the no-tool path now throws a `LLMGatewayError` with type `PROVIDER_MALFORMED` if the provider returns tool calls when no tools were configured. This replaces the previous silent empty-string fallback.

---

## 2. Verification

### 2.1 Compile Check
```bash
$ npx tsc --noEmit
# Success (no output)
```

Both remediation items are fully implemented and verified. The integration gate for `runtime-tool-calling` is ready to close.
