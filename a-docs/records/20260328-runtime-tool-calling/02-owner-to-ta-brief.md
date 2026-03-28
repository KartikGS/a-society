**Subject:** runtime-tool-calling — Phase 0 Architecture Design Brief
**Type:** Owner → Technical Architect
**Date:** 2026-03-28
**Record:** `a-society/a-docs/records/20260328-runtime-tool-calling/`

---

## Context

The A-Society runtime currently operates as a text-in / text-out loop. At session start, the `ContextInjectionService` assembles a static system prompt from pre-registered required-reading documents and injects it once. After that, the agent has no mechanism to read additional files, write artifacts, or inspect directory contents mid-session.

This is a significant functional gap. The Owner role in orient mode can only work with what was pre-loaded. The full flow orchestration (`start-flow`) injects one active artifact at startup but cannot load further files on demand. Roles that need to read target files before editing them — the Curator, the Developers — cannot do so at all through the runtime.

The fix is tool calling: a controlled set of file I/O tools that agents can invoke mid-conversation, with the runtime executing them and returning results as tool result messages.

---

## Minimum Required Tool Set

Three tools are required. No others are in scope for this flow.

| Tool | Signature | Purpose |
|---|---|---|
| `read_file` | `(path: string) → string` | Read any file relative to workspace root |
| `write_file` | `(path: string, content: string) → void` | Write or create a file relative to workspace root |
| `list_directory` | `(path: string) → string[]` | List contents of a directory relative to workspace root |

All paths are relative to the workspace root known at session start. Absolute paths and path traversal (`../`) outside the workspace root must be rejected.

---

## Current Architecture — Key Files

Read these files before designing. They are the change surface.

| File | What to note |
|---|---|
| `a-society/runtime/src/types.ts` | `LLMProvider` interface (`executeTurn` signature), `RuntimeMessageParam` type (`role: 'user' \| 'assistant'` only), `LLMGatewayError` |
| `a-society/runtime/src/llm.ts` | `LLMGateway.executeTurn` — thin wrapper over `this.provider.executeTurn`; provider selected at construction |
| `a-society/runtime/src/providers/anthropic.ts` | Anthropic SDK tool calling uses `tools: Tool[]` parameter + `tool_use` / `tool_result` message blocks |
| `a-society/runtime/src/providers/openai-compatible.ts` | OpenAI SDK tool calling uses `tools: ChatCompletionTool[]` + `tool_calls` in assistant messages + `role: 'tool'` result messages |
| `a-society/runtime/src/orient.ts` | Calls `llm.executeTurn(systemPrompt, history)` in a readline loop — `history` is `RuntimeMessageParam[]` |
| `a-society/runtime/src/orchestrator.ts` | Full flow orchestration — also calls `executeTurn` |

The two providers have meaningfully different tool calling APIs. The Anthropic SDK uses content block arrays (`tool_use`, `tool_result`); the OpenAI SDK uses `tool_calls` on the assistant message and `role: 'tool'` result messages. This divergence is the central architectural challenge.

---

## Design Questions for Phase 0

The architecture document must answer all of the following. These are not open for the Developer to decide — they are Phase 0 outputs.

**1. Turn loop placement**
Does the agentic tool loop (call LLM → if tool calls → execute tools → call LLM again with results → repeat) live inside each provider's `executeTurn`, or in `LLMGateway`? The tradeoff: placing it in the providers keeps the `LLMProvider` interface unchanged but duplicates the loop logic; placing it in `LLMGateway` means a single loop but requires the provider interface to expose whether a response contains tool calls vs. final text.

**2. `RuntimeMessageParam` representation**
The current type is `{ role: 'user' | 'assistant'; content: string }`. Tool call and tool result messages require richer structure. Options:
- Extend `RuntimeMessageParam` to support a `tool` role and structured content
- Keep `RuntimeMessageParam` as text-only and handle the richer internal representation entirely within each provider's private message format, never surfacing it in the shared type
- Something else the TA identifies

Whichever option is chosen, specify what changes to `types.ts` are needed.

**3. Tool executor placement**
Who executes the actual file I/O — the provider, `LLMGateway`, or a new module? The executor needs the workspace root (known at session start) to validate paths. Specify where the executor lives, how it receives the workspace root, and how errors (file not found, path-traversal attempt, write failure) are communicated back to the model.

**4. `orient.ts` impact**
`orient.ts` passes `workspaceRoot` to `ContextInjectionService` but does not pass it further to `LLMGateway`. If the tool executor needs the workspace root, how does it get it? Specify whether `orient.ts` requires changes and what they are.

**5. `orchestrator.ts` impact**
The orchestrator also calls `executeTurn`. Specify whether it needs changes for tool calling, or whether the tool loop is fully encapsulated below it.

**6. Path sandboxing**
Specify the exact sandboxing logic: what check is applied to paths before any file I/O, what happens when the check fails (error returned to model vs. exception vs. something else), and whether `../` normalization (via `path.resolve`) is the mechanism or something stricter.

**7. `max_tokens` adequacy**
`openai-compatible.ts` hardcodes `max_tokens: 8192`. Tool-call turns may receive large file content as tool results and must generate a further response. Assess whether 8192 is sufficient or whether this needs to be configurable.

---

## Phase 0 Output Required

The architecture document (`03-ta-to-owner.md` in the record folder) must include:

**§1 — Design Decision Summary**
One paragraph per design question above (7 total), stating the decision and its rationale.

**§2 — Type Changes**
Exact TypeScript type definitions for any new or modified types in `types.ts`. The Developer implements from these definitions verbatim.

**§3 — Tool Definitions**
Exact tool schemas for `read_file`, `write_file`, and `list_directory` in both Anthropic and OpenAI formats (or a shared intermediate format if the TA proposes one). Include parameter descriptions as they will appear in the tool definition sent to the model.

**§4 — Interface Changes**
For every function whose signature changes, state the new signature. For every parameter that must be threaded through to an internal call, specify the full threading path — not just the top-level change. Per Advisory Standards: parameter threading belongs here, not only in the Files Changed table.

**§5 — Files Changed**
A table listing every file to be created or modified, with the expected action (new / modify) and a row-level behavioral requirements checklist — covering both happy-path and non-happy-path behavior. Per Advisory Standards: every behavioral requirement named in §1–§4 prose must appear in the corresponding §5 row.

**§6 — Co-maintenance Dependencies**
Any `a-docs/` format dependencies introduced (i.e., if the tool executor reads any structured `a-docs/` content). If none, state "None."

**§7 — Open Questions for Owner**
Any decision that implies a framework direction change or that the TA cannot resolve from the existing architecture. If none, state "None."

---

## Constraints

- Do not scope beyond the three tools listed. Additional tools are a future flow.
- The Anthropic provider and the OpenAI-compatible provider must both support the tool set — neither is optional.
- The solution must not break the existing no-tool path. Agents that do not use tools must continue to work exactly as they do today. This is a backward-compatibility hard constraint.
- No `general/` changes are expected. If the TA identifies a needed `general/` change, flag it to the Owner before proceeding — do not include it in scope.

---

## No Proposal Round

This is a Phase 0 architecture design brief. The TA produces a design document (`03-ta-to-owner.md`) and submits it for Owner review. There is no Curator proposal round before implementation — the TA's approved architecture is the specification the Developer implements against directly. The Owner's Phase 0 gate (step 3 in the path) is the approval event.
