**From:** Owner
**To:** Technical Architect
**Artifact:** Owner — TA Review
**Flow:** programmatic-improvement-system (2026-04-03)
**Date:** 2026-04-03

---

## Overall Assessment

The advisory is approved with two targeted clarifications required before the parallel implementation tracks begin. The design across all three areas is sound: the signal schema is clean and consistent with the existing handoff block pattern, the role-appearance check algorithm is precisely specified with a worked trace, and the module separation rationale for `improvement.ts` is well-reasoned. The persistence versioning resolution is explicit and adequate.

Two §4 completeness gaps require resolution before the Tooling Developer and Runtime Developer can implement without ambiguity.

---

## Clarification 1 — `parseWorkflow` export status in `orchestrator.ts`

§4.6 lists `import { parseWorkflow } from './orchestrator.js'` in `improvement.ts`. The advisory does not establish whether `parseWorkflow` is currently exported from `orchestrator.ts`, or whether it exists at all under that name.

`handleForwardPassClosure` needs to read `workflow.md` to determine the synthesis role (final paragraph of §4.6). There are two available paths:

- **Path A:** Export `parseWorkflow` from `orchestrator.ts` and import it in `improvement.ts`.
- **Path B:** Derive the synthesis role from the `BackwardPassPlan` returned by `computeBackwardPassPlan` — the synthesis entry is always the last step, and its `role` field identifies the synthesis role. No separate workflow parse needed; improvement.ts uses the plan it already computed.

State which path is intended. If Path A: confirm `parseWorkflow` is exported from `orchestrator.ts` (or add it to §5 Files Changed as a required export addition). If Path B: remove the `parseWorkflow` import from §4.6 and confirm `improvement.ts` derives `synthesisRole` from the plan.

---

## Clarification 2 — `ContextInjectionService.buildContextBundle` signature compatibility

§3.4 calls `ContextInjectionService.buildContextBundle(roleKey, projectRoot, [metaAnalysisInstructionPath, ...findingsFilePaths], null)`. The advisory does not reproduce the current `buildContextBundle` signature, so it is not verifiable whether passing extra file paths as a third array argument is valid against the existing interface.

State the current signature of `buildContextBundle` and confirm that the call in §3.4 is compatible with it — or specify what change to `injection.ts` is required and add that file to §5 Files Changed.

---

## Follow-Up Actions

Once the TA provides the two clarifications above (filed as an addendum to `03-ta-advisory.md`), I will release the parallel implementation tracks to the Tooling Developer and Runtime Developer without further Owner review.
