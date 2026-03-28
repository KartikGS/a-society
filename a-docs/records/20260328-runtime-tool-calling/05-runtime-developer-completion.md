**Subject:** runtime-tool-calling — Implementation Completion
**Type:** Runtime Developer → Owner
**Date:** 2026-03-28
**Record:** `a-society/a-docs/records/20260328-runtime-tool-calling/`

---

## 1. Implementation Summary

The tool calling specification has been implemented across the runtime layer. The `LLMGateway` now orchestrates a tool call loop, delegating individual rounds to the model providers and executing file-system operations via a sandboxed `FileToolExecutor`.

### Key Components Implemented:
- **`FileToolExecutor` (`src/tools/file-executor.ts`)**: Implements `read_file`, `write_file`, and `list_directory` with strict sandboxing and automated directory creation for writes.
- **`LLMGateway` (`src/llm.ts`)**: Implements the `MAX_TOOL_ROUNDS = 10` loop. Successfully encapsulates tool execution rounds from high-level callers (`orient.ts`, `orchestrator.ts`).
- **Provider Updates**: `AnthropicProvider` and `OpenAICompatibleProvider` now support non-streaming tool turns and correctly translate between `RuntimeMessageParam` and their respective native formats.
- **Contract Adherence**: The no-tool path remains the default when `workspaceRoot` is absent, preserving backward compatibility and reducing API surface risk for non-tool sessions.

---

## 2. Evidence of Integration Validation

Validation was performed using a real `FileToolExecutor` bound to the `runtime` directory with mock model responses to verify the multi-round orchestration logic.

### 2.1. Tool Calls & Real File Content
Demonstrates `read_file` (returning real `package.json` content) and `list_directory` (correct entries for `src/`).

```json
[Provider Round 2] Received Messages:
[
  { "role": "user", "content": "Do file ops" },
  {
    "role": "assistant_tool_calls",
    "calls": [
      { "id": "call_1", "name": "read_file", "input": { "path": "package.json" } },
      { "id": "call_2", "name": "list_directory", "input": { "path": "./src" } }
    ]
  },
  {
    "role": "tool_result",
    "callId": "call_1",
    "toolName": "read_file",
    "content": "{\n  \"name\": \"a-society-runtime\",\n  \"version\": \"0.1.0\", ... }",
    "isError": false
  },
  {
    "role": "tool_result",
    "callId": "call_2",
    "toolName": "list_directory",
    "content": "[\"cli.ts\",\"handoff.ts\",\"injection.ts\",\"llm.ts\", ...]",
    "isError": false
  }
]
```

### 2.2. Sandbox Violation Attempt
Demonstrates a path traversal attempt `../package.json` being blocked by the in-process sandbox check.

```json
{
  "role": "tool_result",
  "callId": "call_4",
  "toolName": "read_file",
  "content": "Error: path '../package.json' is outside the workspace root and cannot be accessed.",
  "isError": true
}
```

### 2.3. No-Tool Path Validation
Demonstrates that when `LLMGateway` is initialized without a `workspaceRoot`, the `tools` array is not sent to the provider and no tool rounds are attempted.

```text
[No Tool Provider] Received Messages: [...]
[No Tool Provider] Received Tools array is undefined: true
Final output: I am responding without any tools enabled.
```

---

## 3. Verified Files

The following files were modified/created according to the §5 requirements:
1. `runtime/src/types.ts` (Modified: Discriminated unions for messages and turn results)
2. `runtime/src/llm.ts` (Modified: Tool loop and `workspaceRoot` threading)
3. `runtime/src/providers/anthropic.ts` (Modified: Tool schema translation and non-streaming branch)
4. `runtime/src/providers/openai-compatible.ts` (Modified: Tool schema translation and non-streaming branch)
5. `runtime/src/orient.ts` (Modified: Integrated `workspaceRoot`)
6. `runtime/src/orchestrator.ts` (Modified: Localized `llm` instance with `projectRoot`)
7. `runtime/src/tools/file-executor.ts` (New: File I/O logic and sandboxing)

---

## 4. Compile Check

```bash
$ npx tsc --noEmit
# No errors
```

The implementation is verified and ready for deployment.
