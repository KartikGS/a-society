**Subject:** Startup Context-Read Timing and Same-Role Session Continuity — Integration Gate Corrections
**Type:** Owner → Orchestration Developer
**Status:** CORRECTIONS REQUIRED
**Date:** 2026-04-11
**Flow:** `20260411-startup-context-and-role-continuity`

---

## Status

The TA integration review ([`06-ta-integration-review.md`](a-society/a-docs/records/20260411-startup-context-and-role-continuity/06-ta-integration-review.md)) is accepted. I compared the live implementation directly against the approved design in [`03-ta-phase0-design.md`](a-society/a-docs/records/20260411-startup-context-and-role-continuity/03-ta-phase0-design.md), the Owner gate in [`04-owner-phase0-approval.md`](a-society/a-docs/records/20260411-startup-context-and-role-continuity/04-owner-phase0-approval.md), and the TA review findings.

I also reran `npm test` in `a-society/runtime/` outside the sandbox because the sandbox blocked `tsx` IPC startup. The suite exits cleanly. That confirms the runtime is stable enough to revise, but it does not clear the integration gate by itself.

Approval is withheld because two blocking contract deviations remain in the live improvement path, and one repeated-role verification gap should be closed in the same revision pass.

---

## Required Correction 1 — Align improvement-session namespace and path resolution to the live `FlowRun` contract

**File:** `a-society/runtime/src/improvement.ts`

**Problem:** The forward-pass runtime now uses the approved contract where:

1. `flowRun.projectRoot` is the workspace root
2. `flowRun.projectNamespace` is the project folder name

The improvement path still derives its namespace and project-scoped document paths from the wrong source:

- `const namespace = path.basename(flowRun.projectRoot);`
- `const roleKey = \`${namespace}__${entry.role}\`;`
- `path.join(flowRun.projectRoot, 'a-docs', 'improvement', 'meta-analysis.md')`
- `path.join(flowRun.projectRoot, 'a-docs', 'improvement', 'synthesis.md')`

That is not aligned to the live contract already used by the orchestrator. In this workspace it would derive `Metamorphosis` as the namespace and search improvement docs at the workspace root instead of under `a-society/`.

The current coverage in `a-society/runtime/test/observability.test.ts` masks the problem by constructing fixture directories around the mistaken derivation rather than the real `FlowRun` shape.

**Fix:**

1. Derive the improvement role key from `flowRun.projectNamespace`, not `path.basename(flowRun.projectRoot)`.
2. Resolve improvement instruction files from the project-scoped root:
   `path.join(flowRun.projectRoot, flowRun.projectNamespace, 'a-docs', 'improvement', ...)`
3. Update the affected tests so they use the real orchestration contract:
   `projectRoot = workspace root`
   `projectNamespace = project folder`

**Required verification:**

1. Confirm the improvement role key resolves as `${flowRun.projectNamespace}__${entry.role}`.
2. Confirm improvement instructions are loaded from `path.join(flowRun.projectRoot, flowRun.projectNamespace, 'a-docs', 'improvement', ...)`.
3. Confirm the updated tests no longer rely on basename-derived namespace fixtures.

---

## Required Correction 2 — Keep improvement initialization on persisted schema version 3

**File:** `a-society/runtime/src/improvement.ts`

**Problem:** Improvement initialization still writes:

```typescript
flowRun.stateVersion = '2';
```

That contradicts the approved continuity design and the live runtime contract:

- new forward-pass flows initialize as v3 in `a-society/runtime/src/orchestrator.ts`
- loaded flows migrate to v3 in `a-society/runtime/src/store.ts`
- the `FlowRun` type documents v3 in `a-society/runtime/src/types.ts`

Because the downgraded value is persisted immediately afterward, an improvement run can rewrite `flow.json` with the wrong schema marker.

**Fix:**

1. Keep improvement initialization at `stateVersion = '3'`.
2. Add direct automated coverage for improvement-mode initialization preserving v3.

**Required verification:**

1. Confirm no improvement initialization path writes `stateVersion = '2'`.
2. Confirm automated coverage fails if the improvement path regresses the schema marker again.

---

## Required Correction 3 — Strengthen repeated-role coverage at the orchestrator seam

**File:** `a-society/runtime/test/integration/same-role-continuity.test.ts`

**Problem:** The new repeated-role test file proves useful pieces of the design, but several key checks still stop at helper or direct-state level:

- later same-role return is asserted by calling `buildForwardNodeEntryMessage(...)` directly
- same-role parallel isolation is asserted by passing `continuityEntries: undefined` directly into the builder
- ledger persistence is asserted by manually mutating `flowRun.roleContinuity`

That is not the full runtime-seam coverage the design asked for.

**Fix:**

1. Add orchestrator-path coverage for later same-role node entry.
2. Add orchestrator-path coverage for the same-role parallel-isolation gate.
3. Add execution-path coverage for the successful-handoff path that appends to `flowRun.roleContinuity`.

Keep the approved scope boundary intact: do not design or enable same-role parallel continuity. The desired behavior remains isolation for that case.

---

## Verification After Fixing

Before resubmitting:

1. Run `npm test` in `a-society/runtime/`.
2. Confirm the improvement path uses `projectRoot + projectNamespace` for project-scoped files.
3. Confirm improvement initialization preserves `stateVersion: '3'`.
4. Confirm repeated-role coverage now exercises orchestrator/runtime seams rather than only helper-level surfaces.

File `08-orchestration-developer-corrections-confirmed.md` summarizing the fixes and verification evidence, then return to Technical Architect for re-review.

```handoff
role: Orchestration Developer
artifact_path: a-society/a-docs/records/20260411-startup-context-and-role-continuity/07-owner-integration-corrections.md
```
