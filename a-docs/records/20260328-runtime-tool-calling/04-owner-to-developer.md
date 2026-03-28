**Subject:** runtime-tool-calling — Phase 0 Gate: Approved
**Type:** Owner → Runtime Developer
**Date:** 2026-03-28
**Record:** `a-society/a-docs/records/20260328-runtime-tool-calling/`

---

## Decision

**Approved.** The Phase 0 architecture design in `03-ta-to-owner.md` passes the gate. Implement directly from that document. There is no Curator proposal round — the TA's approved architecture is the binding specification.

---

## TA Questions — Owner Responses

**Q1 — Loop in LLMGateway:** Accepted. Single loop in `LLMGateway` with providers as single-round primitives is the right tradeoff. Duplicating the loop across both providers would create two maintenance surfaces; the interface change to `LLMProvider.executeTurn` is bounded to `runtime/src/` and does not affect any external caller.

**Q2 — Non-streaming for tool-enabled turns:** Accepted for this flow. Tool calls require the full response to be parsed before execution can proceed; streaming is not composable with the tool loop in Phase 0. Streaming optimization is deferred.

**Q3 — MAX_TOOL_ROUNDS = 10:** Accepted. The error message specified in §5 (`'Tool call loop exceeded maximum rounds (10). The session has been aborted.'`) is the required implementation string — do not vary it.

**Q4 — write_file creating intermediate directories:** Accepted. `fs.mkdirSync(path.dirname(resolvedPath), { recursive: true })` before writing is the correct behavior. Agents writing new record folder artifacts should not need to pre-create directories.

---

## Implementation Notes

**Constructor signature change:** The `LLMGateway` constructor changes from `constructor(provider?: LLMProvider)` to `constructor(workspaceRoot?: string, provider?: LLMProvider)`. TypeScript will catch any caller that passes an `LLMProvider` as the first argument at compile time — this is not a silent runtime risk. Both existing caller sites (`orient.ts` and `orchestrator.ts`) are updated as part of this flow (§5), so no stale callers should remain after implementation. Verify this with a compile check before filing the integration test record.

**No-tool path is the backward-compatibility contract:** When `workspaceRoot` is absent from the `LLMGateway` constructor, tool calling must be completely absent from all API calls — no `tools` parameter in the request, no tool-call parsing in the response path. This must be a real conditional in `LLMGateway.executeTurn`, not a code path that happens to produce correct results by accident.

**Sandbox check must be a real function call:** Per §5 row for `file-executor.ts`: `sandboxPath` must execute on every file I/O operation before any `fs` call is made. The TA explicitly required "real in-process function calls, not stubs or comment placeholders." This is a binding requirement.

---

## Scope

Implement exactly the seven files in §5. Do not extend scope beyond the three tools (`read_file`, `write_file`, `list_directory`). If anything in the spec is ambiguous or impossible to implement as written, stop and raise it — do not resolve spec ambiguity with implementation judgment.

---

## Integration Validation

After implementation, produce an integration test record demonstrating:
1. An orient session using the file tools — at minimum a `read_file` call that returns real file content and a `list_directory` call that returns correct entries.
2. A sandbox violation attempt — a path traversal that returns the specified error string rather than throwing.
3. The no-tool path — a session where no tools are involved, confirming existing behavior is preserved.

Per the Next Priorities item on integration test infrastructure: the record must include reproducible evidence (command output, state file excerpts, or error traces) — narrative assertion without evidence does not satisfy the integration gate.

File the integration test record as `05-runtime-developer-completion.md` in this record folder.

---

## Handoff

Start a new Runtime Developer session:

```
You are a Runtime Developer agent for A-Society. Read a-society/a-docs/agents.md
```

Then:

```
Next action: Implement the tool calling spec and produce the integration test record
Read: a-society/a-docs/records/20260328-runtime-tool-calling/04-owner-to-developer.md
      a-society/a-docs/records/20260328-runtime-tool-calling/03-ta-to-owner.md
Expected response: 05-runtime-developer-completion.md filed in the record folder
```
