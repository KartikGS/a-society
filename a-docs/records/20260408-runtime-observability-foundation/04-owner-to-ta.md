**Subject:** Runtime Observability Foundation — Phase 0 Design Review
**Status:** REVISE
**Type:** Owner → Technical Architect
**Date:** 2026-04-08

---

## Decision

REVISE. The advisory is directionally strong and most of the design is usable, but three load-bearing issues block Phase 0 approval. The runtime developer would otherwise be asked to implement against contradictory span semantics and one technically under-specified metric path.

The OpenTelemetry-first substrate decision is approved. The OTLP export topology, metadata-only default, and the requirement for a deterministic in-memory test seam are also approved. The revision is about design correctness and implementation precision, not overall direction.

---

## Required Revisions

### 1. `session.turn` currently contradicts the stated per-turn trace model

The advisory's top-level design claim is "one root trace per flow run, with child spans per node advancement and nested turn spans within each node" and the operator outcome is per-turn debugging granularity. But the `session.turn` definition then states that in interactive mode the span covers the entire readline conversation loop until exit or handoff.

Those two claims are incompatible.

If one `session.turn` span covers multiple interactive user/assistant exchanges, then it is not a turn span and it does not provide the per-turn debugging granularity the design promises. It also makes the proposed `a_society.session.turn.started` counter semantically incorrect in interactive mode, because it would count session invocations rather than actual turns.

Revise the design so one of the following is true, explicitly and consistently:

1. `session.turn` is genuinely one span per interactive/autonomous turn, with repeated spans inside the readline loop for interactive mode, or
2. the design deliberately uses a `session.run` / `session.interaction` span for the enclosing loop and a separate per-turn child span for each LLM turn.

Whichever option you choose, update:

- the trace-model narrative in `## §1` and `## §3`
- the `session.turn` span definition
- the `a_society.session.turn.started` metric semantics
- the required tests in `## §6`
- the `orchestrator.ts` / `orient.ts` rows in `## §8`

Do not leave the runtime developer to reconcile "per-turn" with "whole interactive loop."

### 2. Improvement meta-analysis sessions do use `HandoffInterpreter.parse`

The span hierarchy note says meta-analysis sessions do not have a `handoff.parse` child because they emit typed signals rather than routing handoffs. That is incorrect relative to the live runtime.

`runInteractiveSession` calls `HandoffInterpreter.parse` for typed signals as well as routing handoffs, and `meta-analysis-complete` is one of the supported typed signal kinds in `runtime/src/handoff.ts`. So meta-analysis sessions still traverse the handoff parser and should be represented accordingly.

Revise the span hierarchy and the surrounding prose so the improvement path matches the actual runtime behavior. If you want a different parsing boundary for improvement sessions, specify the implementation change explicitly; otherwise reflect the current path faithfully.

Update:

- the hierarchy diagram in `## §3`
- the note excluding `handoff.parse` from meta-analysis sessions
- any affected test assertions in `## §6`
- any affected file rows in `## §8`

### 3. The `handoff.parse_failure` metric dimension rule is not mechanically implementable as written

The metrics section says `a_society.handoff.parse_failure` should carry `role_key` by "obtain[ing] the current role via the active session.turn span attribute; if unavailable, use unknown."

That is not a mechanically reliable implementation instruction. The active span API does not give the developer a clean "read the parent's attributes" contract to build against here, and the advisory should not force them to discover whether this is possible through SDK-specific internals.

Revise this part so the implementation path is explicit and ordinary. Acceptable approaches include:

1. drop `role_key` from this metric in Phase 1,
2. record the metric at the `runInteractiveSession` caller boundary where `role_key` is directly available, or
3. introduce an explicit helper/context contract that makes the role available to `handoff.ts` without requiring attribute introspection.

Pick one and propagate it consistently through:

- the metric table in `## §4`
- the `handoff.ts` row in `## §8`
- any test expectations affected by the chosen path

Do not leave this as "read it from the active span attribute."

---

## Approved As-Is

The following parts are approved and should remain unless your correction to the three issues above requires a local adjustment:

- OpenTelemetry as the runtime substrate; LangSmith only as optional downstream OTLP destination
- dedicated `src/observability.ts` bootstrap module
- collector-compatible OTLP design with direct OTLP default
- metadata-only default plus opt-in payload capture
- traces plus a minimal metric set in Phase 1
- store I/O represented by parent-span events rather than dedicated child spans
- operator-facing documentation requirements in `$A_SOCIETY_RUNTIME_INVOCATION`
- in-memory exporter test seam and dedicated telemetry test helper

---

## Resubmission Scope

Please resubmit a revised TA advisory artifact at the next available sequence position in this record folder.

The revision does not need a fresh redesign of the whole document. It should:

1. preserve the approved substrate and topology decisions,
2. correct the interactive-turn trace model,
3. correct the improvement-path parsing model, and
4. replace the under-specified handoff-parse metric dimension rule with a mechanically implementable one.

Once those are corrected, this should be ready for Phase 0 approval.

---

```handoff
role: Technical Architect
artifact_path: a-society/a-docs/records/20260408-runtime-observability-foundation/04-owner-to-ta.md
```
