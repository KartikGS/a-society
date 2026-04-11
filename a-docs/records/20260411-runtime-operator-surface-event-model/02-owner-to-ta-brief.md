**Subject:** Runtime Operator Surface — TA Phase 0 Design
**Type:** Owner → Technical Architect Brief
**Date:** 2026-04-11
**Flow:** `20260411-runtime-operator-surface-event-model`

---

## Context

The human-directed trigger is the open Next Priorities item:

- `[L][ADR][RUNTIME]` **Runtime operator-surface event model and parallel-track visibility**

At intake, this flow also absorbs:

- `[S][RUNTIME]` **Runtime schema/repair prompt single-source alignment**

The operator surfaced a structural UX gap during and after an interactive A-Society runtime flow. The current runtime already emits fragments of operator-visible behavior, but those fragments do not form a coherent surface:

- provider-level liveness spinners exist in `runtime/src/providers/anthropic.ts` and `runtime/src/providers/openai-compatible.ts`
- token usage lines are emitted in `runtime/src/orient.ts`
- tool-call notices are emitted in `runtime/src/llm.ts`
- bootstrap/completion and warning lines are emitted in `runtime/src/orchestrator.ts`
- `a-society flow-status` can render active nodes and pending joins via `runtime/src/visualization.ts`
- handoff/validator repair messaging lives in `runtime/src/handoff.ts` and `runtime/src/orchestrator.ts`

What is missing is a first-class operator/system event model that tells the runtime:

1. which notices are intentionally operator-visible
2. where each notice renders
3. how assistant/model output is separated from runtime/system output
4. how repair/retry behavior is surfaced
5. how active roles, joins, and future parallel tracks appear
6. how token unavailability or partial availability is signaled

The concrete operator pain points reported from the recent flow were:

1. repair behavior was effectively hidden
2. handoff success and next-role activation were ambiguous
3. forward-pass closure/runtime-state transitions were not surfaced clearly enough
4. token reporting had no explicit fallback state when usage was unavailable
5. the runtime had no declared model for future parallel-track live output
6. repair guidance still drifted from the live schema surface in at least one place (`workflow.md` repair text still referenced `description`)

This is not a request for cosmetic logging. It is a request for an operator-facing contract: what the runtime tells the human while it runs, and what remains available only via deeper inspection.

---

## Files Changed Summary

| File | Expected Action | Why it is in scope |
|---|---|---|
| `a-society/runtime/src/orchestrator.ts` | modify | Flow lifecycle notices, node activation/defer/join visibility, closure signaling, and repair/retry surfacing at orchestration boundaries |
| `a-society/runtime/src/orient.ts` | modify | Turn-level operator output, handoff-success notices, token-status display/fallback, prompt-human and abort visibility |
| `a-society/runtime/src/handoff.ts` | modify | Validation outcome wording and single-source repair guidance for malformed handoffs vs typed-signal errors |
| `a-society/runtime/src/llm.ts` | modify | Tool-call activity notices and propagation of token/liveness availability into the operator surface |
| `a-society/runtime/src/providers/anthropic.ts` | modify | Provider event hooks if first-token, usage-availability, or liveness state remains provider-originated |
| `a-society/runtime/src/providers/openai-compatible.ts` | modify | Provider event hooks if first-token, usage-availability, or liveness state remains provider-originated |
| `a-society/runtime/src/visualization.ts` | modify | `flow-status` alignment with the live event model for active nodes, pending joins, and parallel-track visibility |
| `a-society/runtime/src/cli.ts` | modify | Top-level operator surface bootstrapping and any shared renderer wiring |
| `a-society/runtime/src/types.ts` | modify | Event/rendering contracts if the design introduces typed operator-event payloads or renderer options |
| `a-society/runtime/src/spinner.ts` | modify or replace | Liveness rendering if the existing spinner becomes part of a broader operator-event renderer |
| `a-society/runtime/src/[new operator-event-renderer module].ts` | add if needed | Dedicated rendering/formatting layer if the TA decides ad hoc console writes should be consolidated |
| `a-society/runtime/INVOCATION.md` | modify | Operator-facing description of the event model, live notices, `flow-status`, token fallback behavior, and any new flags |
| `a-society/runtime/test/` | add/modify | Automated validation of event surfacing, repair visibility, transition notices, and parallel-state rendering |

---

## Hard Constraints

1. **Executable Dev / Orchestration Developer path.** Scope this as an executable flow implemented by the Orchestration Developer unless you identify a concrete framework-service slice that truly does not belong to orchestration.
2. **Do not pre-commit the presentation surface.** Phase 1 must define a coherent operator surface for the runtime, but the advisory should decide whether that surface lives entirely in the current terminal experience or warrants an additional operator surface.
3. **Assistant output and runtime notices must be distinguishable by design.** The advisory must define channel and formatting boundaries so runtime/system messages do not blend into model text.
4. **Repair-loop visibility is in scope.** The operator must be able to tell when the runtime is repairing, retrying, or blocking on malformed handoff / workflow validation issues.
5. **Parallel-track visibility is in scope.** Even if most current flows are single-track, the design must state how active nodes, deferred nodes, and pending joins are surfaced or explicitly deferred.
6. **Single-source repair guidance.** Because this flow absorbs the schema/repair-alignment item, the advisory must define how repair prompts and operator notices stay aligned with the live validator/schema contract rather than drifting into stale examples.
7. **Operator-facing documentation is part of the deliverable.** Any new notice classes, toggles, or changed `flow-status` semantics must be reflected in `$A_SOCIETY_RUNTIME_INVOCATION`.
8. **Do not pre-specify update report classification.** That remains Curator-determined post-implementation via `$A_SOCIETY_UPDATES_PROTOCOL`.

---

## Owner Preferences for TA Evaluation

These are preferences, not non-negotiable constraints.

1. **Prefer a small explicit event taxonomy over more ad hoc `console.log` growth.** If a dedicated renderer/helper is the cleanest way to get there, that is preferable to duplicating formatting logic across orchestration and provider files.
2. **Prefer positive transition notices, not only failure notices.** The operator should be able to see successful handoffs, active-role activation, and forward-pass closure without inferring them from silence.
3. **Prefer a reusable taxonomy that a future richer operator surface could consume.** The event model should not box us into a dead-end output scheme.

---

## What the Advisory Must Cover

### §1 — Operator Goals and Success Criteria

Define what "a first-class operator surface" means for this runtime in concrete terms. At minimum, after this flow the operator should be able to tell:

- which role/node is active now
- whether the runtime is waiting, streaming, repairing, retrying, suspended for human input, or closing the forward pass
- when a handoff succeeded
- when a repair/retry is happening and why
- whether token usage is known, partially known, or unavailable
- how many nodes are concurrently active and whether a join is waiting on unfinished predecessors

State the minimum success criteria for both live execution and `flow-status`.

### §2 — Event Taxonomy and Rendering Model

Specify the runtime's operator-visible event taxonomy. Name the event classes and the required concrete events. At minimum, evaluate:

- bootstrap/start notices
- active-role activation
- tool-call activity
- handoff success
- handoff repair/retry
- prompt-human suspension and resume
- forward-pass closure
- token-status summary or fallback
- parallel-track activation, deferred nodes, and pending joins

For each required event, specify:

- whether it is shown live, in `flow-status`, or both
- whether it renders on `stdout`, `stderr`, or a coordinated dual-channel surface
- its formatting boundary relative to assistant text
- newline / separation rules so event notices do not visually corrupt model output

### §3 — Repair and Validator Contract

Because the absorbed schema/repair item is in scope, define the repair contract explicitly:

- how repair guidance derives from the live workflow/handoff validator or schema contract
- how malformed handoffs differ from unsupported typed signals in both model-facing repair text and operator-facing notices
- how workflow schema failures (including stale examples) are surfaced
- whether the runtime should surface a summarized repair reason to the operator while keeping the full corrective prompt model-facing only

If the design uses one canonical validation/repair message source, name that ownership boundary.

### §4 — Parallel-Track Visibility Model

Define how the runtime should surface concurrent work:

- what the operator sees when a fork activates multiple nodes
- how active nodes are surfaced during live execution
- how deferred or queued nodes are surfaced, if at all
- how pending joins are surfaced
- whether `flow-status` is the authoritative parallel-state view, or whether live execution must also emit inline parallel-state notices

If you conclude the current terminal/runtime surfaces cannot express this clearly enough, specify the exact failure point and the smallest acceptable phase-1 operator contract before any richer follow-on surface.

### §5 — Token, Liveness, and Tool Activity Model

Specify how the existing fragmented surfaces become one operator contract:

- liveness indication before first token
- tool-call notices
- per-turn token reporting
- fallback behavior when usage is unavailable or partial
- provider symmetry requirements

Name the exact boundary between provider-originated events and orchestration-owned rendering.

### §6 — Files Changed

Provide a files-changed table naming the exact repo-relative files to modify or create, with expected action per file. If you recommend a dedicated renderer or event module, name it explicitly and state which existing runtime files call into it.

### §7 — Verification and Test Boundary

Specify how the Orchestration Developer should verify the operator surface. The verification scope must name content, not only command execution.

At minimum, define automated validation expectations for:

- successful handoff and next-role activation notice
- malformed-handoff repair visibility
- prompt-human suspend/resume visibility
- forward-pass closure notice
- token fallback / unavailable state
- parallel-state rendering (`flow-status` and any live notices you require)

### §8 — Operator Documentation Surface

Specify what `$A_SOCIETY_RUNTIME_INVOCATION` must say after implementation:

- what live notices the operator should expect
- what `flow-status` represents
- whether any new env vars or flags exist
- how token-unavailable states are represented
- any warning or compatibility caveats relevant to the operator

---

## Open Questions for TA Resolution

1. What is the cleanest rendering boundary: `stderr` for runtime/system events and `stdout` for assistant text, or a different split?
2. What is the smallest event taxonomy that still makes repairs, transitions, and parallel-state legible?
3. Should successful handoff and active-role activation be separate events, or one combined transition notice?
4. How much of parallel-state visibility belongs inline during live execution versus only in `flow-status`?
5. When token usage is unavailable from a provider, what exact fallback should the operator see?
6. At what point does future parallel-track output exceed the current runtime terminal surface and justify a richer follow-on operator surface?

---

## Deliverable

A single TA advisory artifact filed as `03-ta-phase0-design.md` in this record folder.

The advisory must be specific enough that the Orchestration Developer can implement the operator-surface event model without inventing event classes, output boundaries, repair-surfacing rules, or parallel-visibility semantics during implementation.

Return to Owner when the advisory is complete.
