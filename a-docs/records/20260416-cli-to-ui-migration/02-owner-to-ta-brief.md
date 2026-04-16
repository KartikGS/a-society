**Subject:** CLI-to-UI migration — executable design
**Status:** BRIEFED
**Date:** 2026-04-16

---

## Requirement

Replace the A-Society CLI operator entry point with a local web server and browser UI. The new operator surface serves a two-mode interface: a chat interface for the Owner bootstrap session and per-node agent interaction, and a graph interface for workflow visualization once a flow is in progress. The underlying orchestration logic does not change — only the operator surface changes.

### → Executable Lead (Technical Architect)

**Requirement:** Design the server/WebSocket architecture, UI component contract, and file-level change map for the CLI-to-UI migration. The design must be complete enough for the Orchestration Developer to implement without architectural decisions.

**Quality bar:** The design is approved when it:
1. Specifies every new file to be created, every existing file to be deleted, and every existing file to be modified — with the reason for each
2. Defines the WebSocket (or SSE) message protocol precisely enough that frontend and backend can be implemented independently from the spec
3. Confirms or revises the `OperatorRenderSink` interface as the correct abstraction boundary between the orchestration layer and the new operator surface
4. Addresses all open design questions below without leaving architectural choices to the OD

---

## What Must Happen

**Operator surface replacement — required outcomes:**

1. The new entry point starts a local HTTP server, performs project discovery (same logic as the current `discoverProjects()` in `bin/a-society.ts` — scan for `a-docs/agents.md`), and opens or instructs the operator to open a browser
2. The browser UI presents the project list; selecting a project starts the Owner bootstrap session as a chat interface
3. When the Owner triggers a workflow and a handoff occurs, the UI transitions to graph mode — displaying the full workflow graph with node state coloring:
   - Green: completed nodes
   - Blue: active/running nodes
   - Grey: nodes paused on a backward handoff
   - Red: nodes in corrective action after receiving a backward handoff
4. Clicking a node in graph mode opens the node's session transcript as a chat interface
5. Human input (the `awaiting_human` state the orchestrator already tracks) is accepted through the UI chat interface and delivered to the orchestrator — replacing the current readline interaction model
6. The `OperatorEvent` stream (already fully typed in `types.ts`) is the real-time data source for both the spinner-equivalent notices and graph state updates
7. `FlowRun` state (already serialized in `.state/flow.json`) is the authoritative source for graph rendering — `activeNodes`, `completedNodes`, `completedEdgeArtifacts`

**Files to be completely removed — not deprecated:**
- `bin/a-society.ts` — CLI entry point with `@inquirer/prompts` project selector
- `src/cli.ts` — CLI command dispatcher (`run`, `flow-status` commands)
- `src/spinner.ts` — CLI spinner (used only by the stderr renderer)
- `@inquirer/prompts` — removed from `package.json` dependencies

**What must not change:**
- All files under `src/` except the operator surface: `orchestrator.ts`, `store.ts`, `types.ts`, `injection.ts`, `improvement.ts`, `handoff.ts`, `orient.ts`, `llm.ts`, `observability.ts`, `paths.ts`, `registry.ts`, `session-entry.ts`, `visualization.ts`, `workflow-file.ts`, `providers/`, `tools/`, `framework-services/` — these are untouched
- The `OperatorRenderSink` interface in `types.ts` — it is the abstraction boundary; the new implementation implements this interface, it does not replace the interface
- The `FlowRun` and `RoleSession` state schemas — the UI reads from these; they are not changed in this flow

---

## Constraints (Non-Negotiable)

1. The orchestration layer's session API (`startUnifiedOrchestration` and related methods) is not modified to accommodate the UI. The server wraps the existing API.
2. The `OperatorRenderSink` interface remains the boundary between orchestration and operator surface. A new sink implementation (WebSocket/SSE) implements this interface alongside the existing stderr implementation (which may be retained as a debug fallback or removed — TA's call).
3. Project discovery reuses the existing `discoverProjects()` logic directly — same filesystem check (`a-docs/agents.md`), same workspace-root scan model.
4. The three CLI files listed above and `@inquirer/prompts` are completely removed. There is no CLI fallback path after this flow lands.

---

## Design Preferences (TA Has Authority)

The following were discussed with the human during intake and represent the Owner's informed preferences. The TA may adopt, revise, or replace them — but must address each one explicitly in the design artifact:

- **Transport:** WebSocket preferred over SSE because human input needs to travel back to the server (bidirectional). If the TA sees a cleaner SSE + REST hybrid that handles bidirectionality without WebSocket, that is acceptable with justification.
- **Frontend framework:** React + Vite preferred — largest ecosystem for the graph library below.
- **Graph library:** React Flow preferred — purpose-built for directed workflow graphs with custom node state rendering.
- **HTTP library:** No preference — `express`, `fastify`, or Node's built-in `http` module are all acceptable.
- **Package structure:** The UI package may live within `runtime/` (e.g., `runtime/ui/`) or alongside it — TA determines what fits the build and serving model cleanly.

---

## Open Design Questions

The TA must resolve all of the following in the design artifact:

1. **UI package placement** — Does the frontend live within `runtime/` (e.g., `runtime/ui/`) or alongside it? What are the implications for `package.json`, the build pipeline, and how the server locates and serves the built assets?
2. **Chat ↔ graph transition** — How does the frontend know when to switch from chat mode to graph mode? Is this driven by a specific `OperatorEvent` (e.g., `handoff.applied` after Owner bootstrap closes)? Or does the server expose explicit state that the client polls?
3. **Human input path** — The current `orient.ts` uses readline for interactive turns. What is the server-side mechanism that routes WebSocket messages from the browser back into the session's input stream without changing the orchestrator API?
4. **Session transcript access** — `RoleSession.transcriptHistory` is stored in `.state/sessions/`. How does the node-detail view retrieve and format a session transcript for display? Does the server expose a REST endpoint, or is the transcript pushed over WebSocket at node activation?
5. **Server startup and browser launch** — Does the new entry point automatically open the browser, or does it print the URL and wait? What is the operator experience on first start vs. resume?
6. **`INVOCATION.md` scope** — Does the new operator surface warrant an in-place update to `INVOCATION.md`, or does the new entry point justify a structural rework of that document? The TA should flag this so the Curator knows the registration scope at the integration gate.

---

## Return Condition

Return to Owner when the executable design artifact is complete and all six open design questions above are resolved. The Owner will review the design at the Phase 0 gate before authorizing the Orchestration Developer track.
