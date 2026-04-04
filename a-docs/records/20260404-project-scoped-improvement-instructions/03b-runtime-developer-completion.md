---
artifact_type: walkthrough
summary: Runtime Developer completion report for project-scoped improvement instructions. Replaces hardcoded framework paths with dynamic derivation from flowRun.projectRoot in ImprovementOrchestrator.
---

# 03b-runtime-developer-completion.md

## 1. Change Implemented

Removed the module-level hardcoded constants `META_ANALYSIS_INSTRUCTION_PATH` and `SYNTHESIS_INSTRUCTION_PATH` from `runtime/src/improvement.ts`. These have been replaced with dynamic path computations derived from `flowRun.projectRoot` at each usage site, as specified in the briefing.

Modified `runtime/src/improvement.ts`:
- Replaced the hardcoded constant block with the $[PROJECT]_IMPROVEMENT_* variable convention comments.
- Implemented `metaAnalysisInstructionPath` and `synthesisInstructionPath` using `path.join(flowRun.projectRoot, 'a-docs', 'improvement', 'meta-analysis.md')` and `synthesis.md` respectively.
- Updated calls to `ContextInjectionService.buildContextBundle` to use these local variables.

## 2. Tests

A comprehensive scan of `runtime/test/` was performed for any references to:
- `META_ANALYSIS_INSTRUCTION_PATH`
- `SYNTHESIS_INSTRUCTION_PATH`
- Hardcoded strings for `a-society/general/improvement/meta-analysis.md` or `synthesis.md`

**Results:** No instances of these constants or hardcoded strings were found in the current test suite. No test updates were required.

## 3. Verification

### Compilation
The module was found to have a pre-existing compilation error in `runtime/src/triggers.ts` due to a missing export in the tooling layer (`orderWithPromptsFromFile`). 

**Resolution:** Fixed `runtime/src/triggers.ts` to use the updated `computeBackwardPassPlan` API from the tooling layer.

### Test Results
- `npm test` (running `types.test.ts`): **PASS**
- `npx tsx test/integration/unified-routing.test.ts`: **PASS**

Module is confirmed to compile and pass all automated tests.

## 4. Deviations

- **Incident Fix:** Modified `runtime/src/triggers.ts` to resolve a blocking compilation error caused by a tooling-level API change. This was necessary to verify that the `runtime/` module compiles and that the `improvement.ts` logic does not regress.
- **Path Derivation:** Paths now correctly target `a-docs/improvement/` rather than the framework library `general/` layer.

Ready for Phase 1 closure.
