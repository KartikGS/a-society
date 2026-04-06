**From:** Owner
**To:** Technical Architect
**Subject:** Phase 0 Architecture Design — In-Flow Human Interaction
**Record:** `a-society/a-docs/records/20260405-inflow-human-interaction/`
**Date:** 2026-04-05

---

## Context

In-flow agents (nodes executing in `advanceFlow`) are currently called with `autonomous: true`. This causes any response without a handoff block to throw `HandoffParseError`, which `advanceFlow` catches and injects back into session history as an error message — the model sees it as if the user replied with the error string. The agent never actually pauses for human input.

This means an in-flow agent cannot ask the human a clarification question. The framework's intent is that agents should be able to pause at any point during a flow to ask the human for input.

A related bug — the bootstrap Owner session was also being called with `autonomous: true`, causing the same looping behavior before a flow even started — has already been fixed separately (bootstrap now passes `autonomous: false`). This flow addresses the in-flow case only.

---

## The Core Design Problem

`HandoffParseError` is currently thrown for two distinct situations, but they require different responses:

| Situation | Desired behavior |
|---|---|
| No handoff block in response (agent asking a question or still working) | Pause — prompt the human for input, add their reply to history, continue the session |
| Handoff block present but malformed YAML or invalid fields | Retry — inject error message back to model, re-run the turn automatically |

Currently both cases produce the same `HandoffParseError` from `HandoffInterpreter.parse`. In `advanceFlow`, both are handled identically: inject error, retry. This is correct for the malformed case and wrong for the missing case.

---

## Files Involved

| File | Role |
|---|---|
| `runtime/src/handoff.ts` | `HandoffInterpreter.parse` — throws `HandoffParseError` for both cases (line 26 for malformed YAML, line 29 for no block found) |
| `runtime/src/orient.ts` | `runInteractiveSession` — catches `HandoffParseError` and rethrows when `autonomous: true` |
| `runtime/src/orchestrator.ts` | `advanceFlow` — catches `HandoffParseError`/`WorkflowError` and injects as user-turn error message |

---

## Design Question for Phase 0

Design the interface change that lets the orchestrator distinguish between these two cases and respond appropriately to each.

The most likely direction is splitting the error surface in `handoff.ts` so the two cases are structurally distinct — but the TA should evaluate all viable approaches and select the one with the cleanest boundary across the three affected files.

Things the design must satisfy:

1. When an in-flow agent responds with no handoff block (clarification question or otherwise), the orchestrator must pause and prompt the human for input before continuing the session.
2. When an in-flow agent responds with a handoff block that is present but malformed, the orchestrator must inject the error and retry automatically — without surfacing it to the human as a question.
3. The fix must not break the bootstrap path (already using `autonomous: false`) or the improvement-phase orchestration (backward pass sessions).
4. The fix must not require in-flow agents to use a special signal or syntax to indicate they're asking a question — the behavior should be derived entirely from whether a handoff block is present.

---

## Expected Output

An architecture advisory covering:

1. **Interface design** — what changes in `handoff.ts`, `orient.ts`, and `orchestrator.ts`; specific type/function signatures where they change
2. **Behavioral contract** — how the two error cases are distinguished and handled at each layer
3. **Files Changed** — complete list with expected action per file
4. **Open questions** — anything that requires Owner direction before implementation begins

No proposal round is required — the TA advisory goes directly to Owner for Phase 0 Gate review.
