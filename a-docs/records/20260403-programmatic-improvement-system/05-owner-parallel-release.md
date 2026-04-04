**From:** Owner
**To:** Tooling Developer, Runtime Developer
**Artifact:** Owner — TA Advisory Approval & Parallel Track Release
**Flow:** programmatic-improvement-system (2026-04-03)
**Date:** 2026-04-03

---

## TA Advisory Status

**APPROVED.** The advisory (`03-ta-advisory.md`) inclusive of the addendum is the binding specification for both implementation tracks. All four known unknowns from the workflow plan are resolved. Both Owner clarifications are resolved.

Key resolutions carried into implementation:
- `parseWorkflow` import in `improvement.ts` is removed. Synthesis role is a module-level constant: `SYNTHESIS_ROLE = 'Curator'`.
- `buildContextBundle` array call is confirmed compatible with the existing signature. No change to `injection.ts`.
- `findingsRolesToInject = []` for synthesis entries; runtime uses `stepType === 'synthesis'` to choose `locateAllFindingsFiles`. No sentinel needed.

---

## Pre-Assigned Sequence Positions

Parallel track completion artifacts are pre-assigned:

| Position | Artifact | Role |
|---|---|---|
| `06a-tooling-developer-completion.md` | Completion report | Tooling Developer |
| `06b-runtime-developer-completion.md` | Completion report | Runtime Developer |

File these at the pre-assigned position regardless of which track completes first. Do not select the next available number at completion time.

---

## Tooling Developer — Implementation Scope

**Spec:** `03-ta-advisory.md` §2, §4.7 (new exports), §8 (Tooling Developer per-file requirements)

**Scope summary:**
- `tooling/src/backward-pass-orderer.ts` — replace with new API: remove `orderWithPromptsFromFile`, `computeBackwardPassOrder`, `createMetaAnalysisPrompt`, `createSynthesisPrompt`; remove `prompt` from `BackwardPassEntry`; add `findingsRolesToInject`; implement `computeBackwardPassPlan`, `buildBackwardPassPlan`, `locateFindingsFiles`, `locateAllFindingsFiles`; apply role-appearance check algorithm (§2.4)
- `tooling/test/backward-pass-orderer.test.ts` — replace with tests per §8; all seven required test cases must be present
- `tooling/INVOCATION.md` — replace Component 4 section per §8

**Completion report must include:** modified files list, summary of implemented algorithm with verification note on the worked trace case (§2.5), test results.

---

## Runtime Developer — Implementation Scope

**Spec:** `03-ta-advisory.md` §1 (handoff parser changes), §3, §4, §8 (Runtime Developer per-file requirements)

**Scope summary:**
- `runtime/src/types.ts` — add `HandoffResult`, `ImprovementPhaseState`; add `stateVersion` and `improvementPhase` to `FlowRun`; re-export `HandoffTarget`
- `runtime/src/handoff.ts` — `parse()` returns `HandoffResult`; implement three-form detection with guards per §1.3 and §8
- `runtime/src/orient.ts` — return type `HandoffResult | null`; no logic changes
- `runtime/src/orchestrator.ts` — `advanceFlow` dispatch on `HandoffResult.kind` per §3.2; `startUnifiedOrchestration` bootstrap path updated per §8
- `runtime/src/improvement.ts` (new) — `ImprovementOrchestrator` per §3, §4.6, addendum; `SYNTHESIS_ROLE = 'Curator'` constant; no `parseWorkflow` import
- `runtime/src/store.ts` — `loadFlowRun` migration check per §4.7
- `runtime/INVOCATION.md` — improvement orchestration section per §8

**Completion report must include:** modified/created files list, implementation notes on the `HandoffResult` dispatch path, `ImprovementOrchestrator` session lifecycle, and the `stateVersion` migration check.

---

## No Proposal Phase

No proposal artifact is required before implementation begins for either track. Implementation proceeds directly from this release.
