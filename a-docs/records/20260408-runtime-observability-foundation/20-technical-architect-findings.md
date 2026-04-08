# Backward Pass Findings: Technical Architect — 20260408-runtime-observability-foundation

**Date:** 2026-04-08
**Task Reference:** 20260408-runtime-observability-foundation
**Role:** Technical Architect
**Depth:** Full

---

## Findings

### Conflicting Instructions

- none

### Missing Information

**No criterion for when attribute name divergence is blocking vs. acceptable deviation.**

In `11-ta-integration-review-2.md`, I documented D1 (`llm.ts` emitting `llm.gateway.tool_rounds` instead of the spec-required `llm.tool_round_count`) and D2 (providers using `provider.usage.input_tokens` instead of `provider.input_tokens`) as "documented deviations" and passed the integration gate. The Owner's `12-owner-integration-corrections-2.md` then mandated fixing both, triggering a third correction cycle.

The advisory-standards I read before producing each review have no rule about attribute name divergence. I applied implicit judgment that naming differences are non-blocking if telemetry is present and functional. That judgment was wrong: an observability layer where attribute names differ from the spec silently breaks every downstream operator and tooling query. The missing criterion should read: any attribute name that differs from the approved spec is a blocking finding, not an approved deviation.

**No integration-vs-synthetic distinction in observability test specifications.**

My advisory (`05-ta-phase0-design-revised.md`) specified five named test scenarios with assertions but did not state whether those tests must invoke production code or could construct spans directly. The Runtime Developer wrote 5/5 passing tests using synthetic `tracer.startActiveSpan(...)` calls in the test file. These passed my first integration review — I flagged test scenario 3's synthetic construction only as a non-blocking D1 item. The Owner's second mandate had to explicitly require production-path execution, triggering another correction cycle.

The advisory produced the schema shape requirements correctly but omitted the implementation constraint. The missing language should have been: "Test scenarios must exercise the production call path — tests that construct spans directly are not acceptable because they verify schema shape, not instrumentation coverage."

### Unclear Instructions

**No explicit call-site enumeration requirement before defining span boundaries.**

My initial design advisory (`03-ta-phase0-design.md`) defined `session.turn` as covering "each prompt-response cycle in the readline loop." The Owner's REVISE identified that orient.ts has three distinct LLM call sites (empty-history initial turn, resume turn when history ends with a user message, and each `promptUser` iteration in the readline loop), and that `session.turn` must wrap each individual call, not the loop. This caused a full redesign of the two-level span model.

I read orient.ts before writing the advisory, but at the "what does this file do" level, not at "enumerate every invocation of the target function." The advisory-standards require verifying declared-operational dependencies but do not require enumerating all call sites of a target function before specifying its span boundary. I had no signal that this level of enumeration was needed.

The gap in the standard: when an instrumentation point (like a span boundary) is defined for a function that is called from multiple code paths, the spec author must enumerate all invocation paths before defining the boundary. This would have surfaced the three-site structure before the advisory was submitted.

### Redundant Information

- none

### Scope Concerns

- none

### Workflow Friction

**Stale required reading produced false orientation that persisted into the advisory.**

My orientation summary stated "the runtime layer is planned but not yet implemented (TypeScript/Node.js, calls LLM APIs directly)" — a direct quote from `a-society/a-docs/project-information/architecture.md`. The Owner corrected this: the runtime is live and active. I had no mechanism to detect that the required reading was stale before relying on it.

This didn't block any gate, but it means I entered the advisory phase with a false model of what was operational. Required readings are treated as authoritative; when they contradict actual codebase state, an agent reading them will confidently produce incorrect context. No instruction in the TA role file or required-readings contract directs me to spot-check required-reading currency against the actual codebase.

---

## Top Findings (Ranked)

1. **No blocking criterion for attribute name mismatches** — TA approved spec-divergent attribute names as "documented deviations"; Owner mandated correction, adding a full correction cycle. Fix: advisory-standards must state that attribute names in an approved schema are contract terms, not preferences; any divergence is blocking. *(Generalizable — applies to any observability advisory in any project type.)*

2. **Observability test spec omitted execution requirement** — Advisory specified test assertions but not "tests must invoke production code, not construct spans directly"; Runtime Developer wrote syntactically-valid but coverage-free tests that passed the first integration review. Fix: advisory-standards must require the test specification section to explicitly distinguish schema-compliance tests from instrumentation-coverage tests, and must require the latter for integration gate passage. *(Generalizable.)*

3. **Call-site enumeration missing from span boundary design procedure** — Defining `session.turn` without enumerating orient.ts's three LLM invocation paths caused a blocking redesign. Fix: when a span boundary is defined for a function called from multiple code paths, the spec must enumerate all invocation paths explicitly. This should be added to advisory-standards as a mandatory check before defining any span scope.

4. **Stale architecture.md content produced false orientation** — architecture.md said runtime was "planned; not yet implemented." I quoted it. Fix: role orientation documents should include a codebase-currency spot-check step for any claims asserting runtime behavior. The agent should be directed to verify "X is operational" claims against the actual filesystem before treating them as established facts. *(Generalizable — any project where role orientation documents can fall behind the codebase.)*

---

*Findings 1 and 2 are flagged as potential framework contributions. They are not specific to this observability flow — they would apply equally to any project (software, writing, research) that requires an advisory to specify a queryable schema or a test specification.*

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260408-runtime-observability-foundation/20-technical-architect-findings.md
```
