**Subject:** Startup Context-Read Timing and Same-Role Session Continuity — TA Integration Review
**Type:** Technical Architect → Owner
**Date:** 2026-04-11
**Flow:** `20260411-startup-context-and-role-continuity`
**Reviewed against:** `03-ta-phase0-design.md`, `04-owner-phase0-approval.md`

---

## Decision

**REVISE.** The core startup/continuity contract landed correctly in the forward-pass runtime:

- stable startup context was separated from task-scoped node input
- `orient.ts` no longer auto-seeds a generic first turn
- Owner bootstrap prompting is now caller-owned
- later same-role node entry has an explicit continuity surface
- `INVOCATION.md` reflects the new startup/resume model

The full runtime test suite also passes in review.

However, two blocking deviations remain in the in-scope improvement path:

1. `a-society/runtime/src/improvement.ts` still derives the project namespace and improvement-doc paths from the wrong root, so the new improvement-session delivery model is not aligned to the live `FlowRun` contract
2. `a-society/runtime/src/improvement.ts` still stamps `flowRun.stateVersion = '2'`, violating the approved v3 persistence contract

One additional non-blocking verification gap is listed for correction in the same revision pass.

---

## Verification Performed

I verified the implementation by:

- reading `a-society/a-docs/records/20260411-startup-context-and-role-continuity/05-orchestration-developer-completion.md`
- comparing the landed code against `a-society/a-docs/records/20260411-startup-context-and-role-continuity/03-ta-phase0-design.md`
- running `npm test` in `a-society/runtime/`

The runtime suite passed end to end in review. The findings below are therefore integration/design-alignment findings, not compilation failures.

---

## Blocking Findings

### B1 — Improvement-session delivery still uses the wrong root/namespace contract

The approved design required improvement-step task inputs to move out of the system bundle and into the first user message, but it still depended on the live flow contract:

- `FlowRun.projectRoot` is the workspace root
- `FlowRun.projectNamespace` is the project folder name

That contract is how forward-pass orchestration is already keyed. New flows are created with:

- `projectRoot: workspaceRoot`
- `projectNamespace: bootstrapNamespace`

at `a-society/runtime/src/orchestrator.ts:162-166`.

The improvement implementation still treats `projectRoot` as though it were the project folder:

- `const namespace = path.basename(flowRun.projectRoot);` at `a-society/runtime/src/improvement.ts:193`
- `const roleKey = \`${namespace}__${entry.role}\`;` at `a-society/runtime/src/improvement.ts:194`
- `path.join(flowRun.projectRoot, 'a-docs', 'improvement', 'meta-analysis.md')` at `a-society/runtime/src/improvement.ts:214`
- `path.join(flowRun.projectRoot, 'a-docs', 'improvement', 'synthesis.md')` at `a-society/runtime/src/improvement.ts:245`

In the live A-Society workspace, that would resolve to the wrong locations:

- role key namespace derived as `Metamorphosis`, not `a-society`
- required readings searched at `/home/kartik/Metamorphosis/Metamorphosis/a-docs/roles/required-readings.yaml` instead of `/home/kartik/Metamorphosis/a-society/a-docs/roles/required-readings.yaml`
- improvement docs searched at `/home/kartik/Metamorphosis/a-docs/improvement/...` instead of `/home/kartik/Metamorphosis/a-society/a-docs/improvement/...`

This is not hypothetical. The live repo contains the correct project-scoped files at the `a-society/` path and does not contain the workspace-root or basename-derived alternatives.

The current test harness masks the problem by shaping the test fixture around the wrong assumption:

- `a-society/runtime/test/observability.test.ts:313-316` creates `tmpDir/<basename(tmpDir)>/a-docs/roles/...`
- `a-society/runtime/test/observability.test.ts:320-322` creates `tmpDir/a-docs/improvement/...`
- `a-society/runtime/test/observability.test.ts:329-335` seeds `flowRun.projectRoot = tmpDir` with no matching `projectNamespace`

That proves the current code can run against a custom fixture that matches its mistaken derivation. It does not prove the code matches the live orchestration contract.

**Required fix:**

1. In `a-society/runtime/src/improvement.ts`, derive the role key from `flowRun.projectNamespace`, not `path.basename(flowRun.projectRoot)`.
2. Derive improvement instruction paths from the project-scoped root, not the workspace root. The approved path shape is `path.join(flowRun.projectRoot, flowRun.projectNamespace, 'a-docs', 'improvement', ...)`.
3. Update the affected tests so they use the real flow contract instead of constructing fixture directories around the wrong derivation.

This is blocking because the flow explicitly scoped improvement-step task delivery into this implementation pass, and the landed code does not align to the live `FlowRun` model on that path.

### B2 — Improvement initialization still regresses persisted flow schema back to version 2

The approved persistence contract was explicit:

- `FlowRun.stateVersion` advances from `"2"` to `"3"` (`03-ta-phase0-design.md:41-42`, `03-ta-phase0-design.md:444-468`)
- the runtime silently migrates earlier versions to `"3"`

The main flow path honors that:

- `a-society/runtime/src/orchestrator.ts:173-174` initializes new flows with `stateVersion: '3'` and `roleContinuity: {}`
- `a-society/runtime/src/store.ts:45-49` migrates loaded flows to `'3'`

But improvement initialization still writes:

- `flowRun.stateVersion = '2';`

at `a-society/runtime/src/improvement.ts:162`.

This directly contradicts:

- the approved design
- the `FlowRun` type comment in `a-society/runtime/src/types.ts:49-51`
- the completion report's claim that the runtime has moved to the v3 schema (`05-orchestration-developer-completion.md:12-18`, `05-orchestration-developer-completion.md:43-45`)

Because the field is persisted immediately afterward (`a-society/runtime/src/improvement.ts:163`), the runtime can write a downgraded schema marker into `flow.json` during an improvement run even after the forward-pass state was already created as v3.

**Required fix:**

1. Change `a-society/runtime/src/improvement.ts:162` to keep the flow at `stateVersion = '3'`.
2. Add direct automated coverage for improvement-mode initialization preserving schema version 3, so this regression cannot re-enter silently.

This is blocking because state-version handling was a load-bearing part of the approved continuity design, not an incidental comment cleanup.

---

## Non-Blocking Finding

### N1 — The new repeated-role verification file does not exercise the runtime seams it claims to cover

The approved verification boundary for `a-society/runtime/test/integration/same-role-continuity.test.ts` required actual proof of:

- later same-role node entry behavior
- same-role parallel isolation behavior
- role-continuity ledger update on successful handoff

Instead, several of the new checks stop at helper/store level:

- later same-role return is asserted by calling `buildForwardNodeEntryMessage(...)` directly at `a-society/runtime/test/integration/same-role-continuity.test.ts:177-185`
- parallel isolation is asserted by passing `continuityEntries: undefined` directly into the builder at `a-society/runtime/test/integration/same-role-continuity.test.ts:204-209`
- ledger persistence is asserted by manually mutating `flowRun.roleContinuity` and saving it at `a-society/runtime/test/integration/same-role-continuity.test.ts:226-240`

That is useful unit-level coverage, but it is not the repeated-role workflow harness the approved design asked for at `03-ta-phase0-design.md:565-566` and `03-ta-phase0-design.md:604-634`.

I am not blocking approval on this test gap alone because the forward-pass implementation itself is readable and the more serious issues are already sending the work back for revision. But this coverage should be strengthened in the same pass:

1. exercise the orchestrator's later same-role node-entry path
2. exercise the orchestrator's same-role parallel-isolation gate
3. exercise the actual successful-handoff path that appends to `flowRun.roleContinuity`

---

## Verified Correct

The following parts of the approved design are implemented correctly:

- `a-society/runtime/src/injection.ts` now limits the system bundle to stable runtime-owned context plus required-reading files and uses the approved already-loaded framing.
- `a-society/runtime/src/orient.ts` no longer auto-seeds a generic startup prompt.
- `a-society/runtime/src/orchestrator.ts` owns the Owner bootstrap message and first-entry node message construction.
- `a-society/runtime/src/orchestrator.ts` keeps node-scoped session keys and injects role continuity only on fresh node entry.
- `a-society/runtime/src/session-entry.ts` centralizes the runtime-authored textual fields introduced by this flow.
- `a-society/runtime/INVOCATION.md` accurately documents the startup/continuity contract for the forward-pass runtime path.

The downstream Curator-managed guidance surfaces identified in the Phase 0 advisory remain intentionally downstream work and are not treated as implementation findings in this review.

---

## Resubmission Requirements

Before resubmission, the Orchestration Developer should:

1. fix `a-society/runtime/src/improvement.ts` to derive the role key and improvement instruction paths from `flowRun.projectNamespace` plus the workspace root, not from `path.basename(flowRun.projectRoot)` or the workspace root alone
2. keep `stateVersion` at `"3"` throughout improvement initialization and add regression coverage for that exact path
3. strengthen `a-society/runtime/test/integration/same-role-continuity.test.ts` so the repeated-role runtime seams are exercised through orchestrator behavior, not only through helper calls and direct state mutation

On resubmission, the completion artifact should call out both improvement-path fixes explicitly and note the upgraded repeated-role coverage.

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260411-startup-context-and-role-continuity/06-ta-integration-review.md
```
