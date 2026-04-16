**Subject:** CLI-to-UI migration — Phase 0 gate decision
**Status:** APPROVED
**Date:** 2026-04-16

---

## Review

Design reviewed against the brief requirements and TA advisory review guidance. All six open design questions are resolved. The file-level change map is complete. The WebSocket protocol is specified with sufficient precision for independent frontend/backend implementation. The `OperatorRenderSink` interface is confirmed as the correct abstraction boundary.

**One inconsistency requires an OD constraint** (see below). No revision of the TA design is needed — the design intent is correct; the spec language is contradictory.

---

## Inconsistency: `startUnifiedOrchestration` Signature

The design states two things that cannot both be true:

1. *"The server calls `orchestrator.startUnifiedOrchestration(workspaceRoot, projectNamespace, 'Owner', inputBridge, outputBridge)`"*
2. *"`startUnifiedOrchestration`'s method signature is not changed"*

The stream bridge model requires the method to accept `inputStream` and `outputStream` parameters. The current method does not have them. This is a signature change.

**OD constraint:** Add `inputStream` and `outputStream` as optional parameters to `startUnifiedOrchestration`, defaulting to `process.stdin` and `process.stdout` respectively. Thread them through to wherever `process.stdin`/`process.stdout` are currently referenced internally in the orchestration flow. This is a compatible extension — existing callers (including any test harnesses) continue to work unchanged with the defaults. The threading path from these parameters to the internal `readHumanInput` call must be traceable in the completion report.

This is the only change to `orchestrator.ts` beyond the type widening already specified.

---

## Additional OD Constraint: `bin/a-society.ts`

The file-level change map lists `bin/a-society.ts` under both "New Files" and "Deleted Files," which is the correct intent (complete content replacement at the same path) but may cause confusion. To be explicit: `bin/a-society.ts` is a full content replacement. The path and the `package.json` `bin` field remain unchanged. The OD replaces the file contents entirely rather than creating a new file or renaming.

---

## OD Track Authorization

The Orchestration Developer track is authorized. Proceed with implementation against the approved design, incorporating the two constraints above.

**Scope summary for OD:**

Implement:
- `runtime/src/server.ts` — HTTP + WebSocket server per component contract
- `runtime/src/ws-operator-sink.ts` — `WebSocketOperatorSink` implementing `OperatorRenderSink`
- `runtime/vite.config.ts` — React build configuration
- `runtime/ui/` — React + Vite frontend (project selector, chat interface, graph view, node detail)
- `runtime/bin/a-society.ts` (replacement) — server entry point with browser launch and URL print

Modify:
- `runtime/src/orchestrator.ts` — type widening (`OperatorEventRenderer` → `OperatorRenderSink`) **plus** optional `inputStream`/`outputStream` parameters on `startUnifiedOrchestration`, defaulting to `process.stdin`/`process.stdout`
- `runtime/package.json` — add/remove dependencies and add build scripts per TA spec
- `runtime/INVOCATION.md` — full structural rework; OD drafts the replacement; Curator reviews at registration

Delete:
- `runtime/src/cli.ts`
- `runtime/src/spinner.ts`

Note on `OperatorEventRenderer`: `spinner.ts` is deleted, so `OperatorEventRenderer` must be updated to not depend on it. The OD may either simplify it to write wait notices as plain stderr lines or delete it entirely. Either is acceptable; confirm no tests depend on it before deleting.

Implement the `GET /api/workflow` endpoint (added by TA in the component contracts section) using the existing `parseWorkflow` utility.

Return to Owner with the completion report when implementation is done.
