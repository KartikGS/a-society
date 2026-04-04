# Backward Pass Findings: Runtime Developer — 20260404-project-scoped-improvement-instructions

**Date:** 2026-04-04
**Task Reference:** project-scoped-improvement-instructions
**Role:** Runtime Developer
**Depth:** Full

---

## Findings

### Conflicting Instructions
- **None** — the briefing correctly identified that hardcoded paths were non-canonical and should be derived from `flowRun.projectRoot`.

### Missing Information
- **None** — the required `flowRun.projectRoot` context was readily available in the orchestration call path.

### Unclear Instructions
- **None** — the target replacement sites in `improvement.ts` were exactly as described in the briefing.

### Redundant Information
- **None** — the co-maintenance JSDoc comments were redundant with the new dynamic derivation, but the briefing correctly instructed their removal.

### Scope Concerns
- **Tooling-Runtime Sync Error:** I was briefed only to work in `improvement.ts`, but the `runtime/` module failed to compile because `triggers.ts` was still attempting to import a deprecated/removed function from the tooling layer (`orderWithPromptsFromFile`). This required a scope expansion to fix `triggers.ts` so that completion could be verified as requested.

### Workflow Friction
- **Verification Blockers:** The requirement to "confirm the module compiles and tests pass" was blocked by a pre-existing error in a sibling file (`triggers.ts`). This signal suggests that tooling API changes are not being propagated to all runtime consumers before phase closure in previous flows.

---

## Top Findings (Ranked)

1. **Stale tooling imports in runtime layer** — `runtime/src/triggers.ts`
   - The `orderWithPromptsFromFile` removal in Component 4 (tooling) leaked into this session as a blocking compilation error. This indicates a gap in the tooling-to-runtime sync protocol during forward-pass implementation.
2. **Instruction-to-Reality Gap in Verification** — `runtime/INVOCATION.md`
   - While the runtime module passed `types.test.ts`, that test is extremely minimal. Full verification of path derivation changes in `improvement.ts` requires more robust integration testing than currently exists, as `unified-routing.test.ts` does not exercise the improvement phase.

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260404-project-scoped-improvement-instructions/07b-runtime-developer-finding.md
```
