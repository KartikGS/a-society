# UI Developer Implementation Discipline

## Implementation Discipline

**Completion reports must be structurally comparable.** Upon completing an implementation phase, produce `NN-developer-completion.md` in the active record folder with explicit labeled sections: modified files, implemented behavior, verification summary, deviations and resolution status, and whether any standing spec or coupling doc requires an update.

**Exact-path discipline.** In completion reports and backward-pass findings, use the exact repo-relative path for every cited file as it exists on disk. Do not abbreviate parent directories, use absolute paths, or use `file://` URLs.

**Server/WebSocket contract boundary is a hard stop.** The server API and WebSocket protocol are owned by the Orchestration Developer and governed by TA design. If a UI change requires a modification to the event types, message formats, or endpoint contracts in `runtime/src/server.ts` or `runtime/src/ws-operator-sink.ts`, surface the dependency to the TA before implementation. Do not implement the backend change; coordinate the cross-role dependency explicitly.

**UI state must not duplicate server-authoritative state.** Operator state that the server controls (session status, workflow node activation, handoff routing) should be reflected in the UI, not re-derived. If the UI needs state the server does not currently expose, surface this as a server-contract gap to the TA rather than computing it locally from side-channel evidence.

**One-shot diagnostic scripts do not belong at `runtime/ui/`.** Temporary diagnostics created to probe UI behavior must live in a dedicated diagnostics subdirectory, not alongside durable component files. Remove them before phase completion unless the approved design promotes them into standing test infrastructure.
