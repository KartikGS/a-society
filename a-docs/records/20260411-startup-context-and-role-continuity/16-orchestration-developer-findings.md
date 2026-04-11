# Backward Pass Findings: Orchestration Developer — 20260411-startup-context-and-role-continuity

**Date:** 2026-04-11
**Task Reference:** 20260411-startup-context-and-role-continuity
**Role:** Orchestration Developer
**Depth:** Full

---

## Findings

### Conflicting Instructions

- None.

### Missing Information

- None. The approved design (`03-ta-phase0-design.md`) and FlowRun contract were clearly documented.

### Unclear Instructions

- None.

### Redundant Information

- None.

### Scope Concerns

- None.

### Workflow Friction

- None.

### Role File Gaps

**Gap 1 — No directive to audit all pre-existing field assignments when a contract changes.**

When `improvement.ts` was updated to add `buildImprovementEntryMessage` imports and calls, the existing line `flowRun.stateVersion = '2'` was not audited. The approved design (`03-ta-phase0-design.md:41-42`) and the live orchestrator and store both operated at v3. The completion report (`05`) explicitly claimed the runtime had moved to v3. Yet the old assignment persisted and was externally caught (TA review `06`, then Owner gate `07`).

The root cause is not that the rule was undocumented — it was documented in the design, the type comment, and the prior orchestrator code. The root cause is that when adding new logic to an existing file, I did not audit pre-existing lines for stale values that contradicted the contract being implemented. There is no directive in the Orchestration Developer role file or the implementation discipline guidance that names "audit all pre-existing assignments to fields changed by this design" as a required step when modifying an existing module during a contract migration.

The completion report claimed correctness on the stateVersion point without having verified that `improvement.ts` specifically was clean. That is where the gap became an externally-caught failure rather than a self-caught one.

**Gap 2 — No directive to cross-check local shadow variables against the live FlowRun contract.**

`improvement.ts` used a locally-scoped `const namespace = path.basename(flowRun.projectRoot)` variable, then derived both the roleKey and the instruction file paths from it. The approved design documented the FlowRun contract as `projectRoot = workspace root`, `projectNamespace = project folder name`, and this contract was already in use throughout `orchestrator.ts`. But when implementing the improvement path changes, the locally-scoped `namespace` variable was not cross-checked against `flowRun.projectNamespace`.

This is a different error class from the stateVersion miss: it was not a stale value from before the migration, it was a pre-existing local variable that happened to produce the right result when the workspace root and project root were the same path, and silently produced the wrong result in the live layout. The test fixture compounded this by being written from the implementation's behavior rather than from the spec, so the test could not distinguish the mistaken derivation from the correct one.

There is no role guidance that says: when updating a module that has locally-scoped namespace or root variables, verify each one against the live FlowRun field contract before filing the completion report.

---

## a-docs Structure Check Notes

*Not applicable. The reviewed artifacts are implementation files and test files, not a-docs content.*

---

## Top Findings (Ranked)

1. **Test fixtures written from implementation behavior, not from contract spec** — `observability.test.ts` (improvement scenario). The fixture directories were constructed to match what `improvement.ts` produced (namespace from `path.basename(projectRoot)`) rather than what the approved FlowRun contract required. This inverted the normal test-as-spec-verifier relationship and allowed a contract violation to pass the automated suite undetected. The error surface was: fixture writes directories to `tmpDir/${path.basename(tmpDir)}/a-docs/...` to match the implementation's derivation, instead of writing to `tmpDir/a-society/a-docs/...` and asserting the implementation must reach that path. **Potentially generalizable:** writing integration test fixtures from contract spec rather than from implementation behavior is a discipline applicable in any project.

2. **Completion report claimed v3 correctness without auditing improvement.ts specifically** — `05-orchestration-developer-completion.md`, verification section. When the completion report stated "stateVersion is '3' throughout," that claim was derived from inspecting `orchestrator.ts` and `store.ts` but not from verifying every `stateVersion` assignment in every modified file. The omission was not caught internally and required two external review rounds to surface. Root cause: the verification checklist covered the new code paths but not the pre-existing lines in files that were partially modified.

3. **No self-audit of pre-existing field assignments during contract migration** — `improvement.ts`. Both the stateVersion regression and the namespace derivation error share a structural root cause: when adding new logic to an existing module during a contract migration, pre-existing code that is not directly touched by the new additions is treated as implicitly correct. A targeted "audit all assignments to fields that changed meaning in this design" step, applied to every modified file before filing a completion report, would have caught both errors in-session.

4. **Same-role-continuity test coverage stopped at helper seam** — `test/integration/same-role-continuity.test.ts` (initial version). The later-node entry, parallel isolation, and ledger-update behaviors were each asserted by calling builders and mutating state directly rather than driving `FlowOrchestrator.advanceFlow`. These checks proved the helpers work but not that the orchestrator wires them correctly. This was caught as a non-blocking finding in review (`06`) and corrected in the corrections pass, but the initial implementation chose the easier surface without recognizing the seam distinction.

---

## Generalizable Finding (Framework Contribution Flag)

**Finding:** Integration test fixtures should be authored from the approved contract spec, not derived from the implementation's observable behavior.

When a fixture is constructed by running the implementation and recording what it produces, the test cannot detect cases where the implementation is consistently wrong in the same way the fixture is constructed. The fixture should be built from the documented contract (field names, path conventions, invariants), and the implementation must reach those fixture paths/values — not the reverse. This discipline applies equally in software, research, and writing project contexts wherever there is a contract and an implementation.

**Suggested placement:** `$GENERAL_IMPROVEMENT_META_ANALYSIS` or an implementation-verification guidance doc. Flagged for framework contribution review.

```handoff
type: meta-analysis-complete
findings_path: a-society/a-docs/records/20260411-startup-context-and-role-continuity/16-orchestration-developer-findings.md
```
