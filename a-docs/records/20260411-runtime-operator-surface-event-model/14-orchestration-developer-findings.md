# Backward Pass Findings: Orchestration Developer — 20260411-runtime-operator-surface-event-model

**Date:** 2026-04-11
**Task Reference:** 20260411-runtime-operator-surface-event-model
**Role:** Orchestration Developer
**Depth:** Full

---

## Findings

### Conflicting Instructions
- None.

### Missing Information

**ImprovementOrchestrator I/O contract not documented for test authors or integration consumers.**

Writing `forward-pass-closure.test.ts` required knowing that `ImprovementOrchestrator.handleForwardPassClosure` reads from `inputStream` via `readline` (blocking on user selection) and writes the improvement-mode prompt to `outputStream`. This is not stated in the TA design, INVOCATION.md, or any role context. I had to read `improvement.ts` to discover the I/O model and then infer that pre-writing `"3\n"` to a `PassThrough` stream would satisfy readline's buffering behavior.

The gap matters beyond this test: any future operator-surface or forward-pass work that touches the improvement path will need to understand this contract and will have no canonical place to find it. The TA design's coverage of `forward-pass-closed` stopping at the `flow.forward_pass_closed` event emission — before the improvement orchestrator — left the downstream I/O undocumented.

### Unclear Instructions
- None.

### Redundant Information
- None.

### Scope Concerns
- None.

### Workflow Friction

**The TERMINAL_FORWARD_PASS trigger was an implicit side-effect of the linear-role-active test.**

Writing `linear-role-active.test.ts` to verify the duplicate `role.active` suppression required calling `advanceFlow('next')` for a terminal node. This triggered `TERMINAL_FORWARD_PASS` via `ToolTriggerEngine`, which called `computeBackwardPassPlan`. The trigger chain was not relevant to what the test was measuring (role.active count), but it was unavoidable. Understanding whether it would pass or throw required reading `triggers.ts` and `backward-pass-orderer.ts`.

This is not a blocking problem — the trigger chain handled the test workflow cleanly — but it illustrates that integration tests for orchestrator behavior must account for trigger side-effects that are not mentioned in the design document being implemented. The implementation spec listed which events to emit but did not describe the trigger side-effects of the terminal path.

### Role File Gaps

No gaps in the Orchestration Developer role file itself. Both issues below are structural gaps in the implementation process, not the role document.

---

## Externally-Caught Errors (Priority Analysis)

Both of the following were caught by the TA integration review, not by me before submission.

---

**Error 1: `console.log('\nSession closed.')` on stdout violated the stream contract.**

The Owner integration gate (07) identified this as a blocking deviation. The contract — runtime/system notices on stderr, assistant text on stdout — was explicit in both the TA Phase 0 design (§4) and the Owner approval (§5). The `rl.on('close', ...)` handler in `orient.ts` predated the stream-separation design. I implemented the new event taxonomy and routed all new code paths through the operator renderer, but I did not audit existing `console.log` / `process.stdout.write` calls in the files I modified.

**Why wasn't this caught by me?**

The implementation scope in the TA design (`03-ta-phase0-design.md`) listed specific behaviors to add to `orient.ts` (add `operatorRenderer` param, emit `usage.turn_summary`, emit `human.awaiting_input`, remove the "Handoff detected" console.log). The close-handler `console.log` was not in the list because it was not a new addition — it was existing code. The spec described what to add, not what to audit. I treated the listed changes as exhaustive rather than additive.

**Root cause:** No explicit "audit all existing stdout/stderr writes in modified files against the new stream contract" step existed in the spec or in my implementation approach. I caught the new-code violations (the ones I added) but missed the legacy violation that predated the design.

**Structural gap:** When a new invariant is introduced over existing code (here: stream separation applied retroactively to `orient.ts`), the implementation spec should include an explicit audit step, not only a list of additions. The TA design implicitly assumed I would audit, but the audit was not in scope as stated.

*This finding is potentially framework-generalizable: any flow introducing a new cross-cutting invariant over existing code should include a dedicated "audit files touched by this change for existing violations" step. Flagged as a potential framework contribution.*

---

**Error 2: Duplicate `role.active` for linear successor was only detectable by a two-call integration sequence.**

The Owner integration gate (07) identified that a linear successor received `role.active` twice — once from `applyHandoffAndAdvance` (at handoff boundary) and once from `advanceFlow` (at session entry). Neither the unit tests nor the existing integration test (which called `advanceFlow('start')` only, never `advanceFlow('next')`) could detect this. The bug required a test that called `advanceFlow` for both nodes in sequence.

**Why wasn't this caught by me?**

The architecture for `role.active` emission split responsibility between `applyHandoffAndAdvance` (emitting for the successor at handoff time) and `advanceFlow` (emitting before session start). I designed both intentionally — the handoff-boundary emit was an approved design requirement, and the advanceFlow emit was present for the first node and for fork branches. The duplication in the linear case was an emergent behavior from their combination that required end-to-end reasoning across both call sites.

The integration test I wrote covered the repair loop and linear handoff, but stopped after the first `advanceFlow` returned. There was no design guidance specifying what integration sequence scenarios to cover — I chose the most critical path (repair + handoff) and did not include a full two-node linear run.

**Root cause:** The approved design did not specify that `role.active` should be emitted from exactly one site per node entry. Both emission sites were individually correct against the spec; the conflict was only visible at their interaction. The integration test I wrote did not exercise the interaction.

**Structural gap:** For orchestration designs with multiple independent event-emission sites for the same event, the implementation spec should state the authoritative site explicitly and call out the interaction risk. "Emit `role.active` in `advanceFlow` and `applyHandoffAndAdvance`" without saying "and `advanceFlow` must not duplicate what `applyHandoffAndAdvance` already emitted" left the conflict implicit.

---

## Top Findings (Ranked)

1. **Spec omitted audit step for existing code violations of new invariant** — `03-ta-phase0-design.md` (stream-contract section). The `orient.ts` close-handler violation was caught externally; the spec's change list was additive, not audit-inclusive. Framework-generalizable: new-invariant flows need an explicit legacy-audit step.

2. **Role.active dual-emission architecture required two-call integration coverage not included in the spec** — `03-ta-phase0-design.md` (event taxonomy section). The interaction between `applyHandoffAndAdvance` and `advanceFlow` emissions was only visible in a full two-node sequence; no guidance specified this coverage gap.

3. **ImprovementOrchestrator I/O contract undocumented** — gap between `orchestrator.ts` (`forward-pass-closed` handling) and `improvement.ts` implementation. Blocks test authors and future operator-surface work that integrates with the improvement path.

4. **TA design did not call out test-migration cost of HandoffParseError API change** — `03-ta-phase0-design.md`. Changing a class's message field from string to struct breaks all existing message-based assertions. Minor friction but predictable; could have been pre-flagged.

---

## Template Maintenance

*This template aligns with the reflection categories in `$GENERAL_IMPROVEMENT_META_ANALYSIS` as read on 2026-04-11.*
