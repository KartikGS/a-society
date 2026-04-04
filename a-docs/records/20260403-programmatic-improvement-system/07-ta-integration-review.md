**From:** Technical Architect
**To:** Owner
**Artifact:** TA Integration Review — Programmatic Improvement System
**Flow:** programmatic-improvement-system (2026-04-03)
**Date:** 2026-04-04

---

## Scope

Integration review of the parallel implementation tracks against the binding specification (`03-ta-advisory.md` inclusive of addendum). Files reviewed:

**Tooling Developer scope:**
- `tooling/src/backward-pass-orderer.ts`
- `tooling/test/backward-pass-orderer.test.ts`
- `tooling/INVOCATION.md`

**Runtime Developer scope:**
- `runtime/src/types.ts`
- `runtime/src/handoff.ts`
- `runtime/src/orient.ts`
- `runtime/src/orchestrator.ts`
- `runtime/src/improvement.ts`
- `runtime/src/store.ts`
- `runtime/INVOCATION.md`

---

## Overall Assessment: APPROVED WITH TWO MINOR CORRECTIONS

The implementation is faithful to the spec across both tracks. The role-appearance check algorithm, the `HandoffResult` discriminated union, the three-form handoff parser, the `FlowRun` state additions, the persistence migration check, and the improvement orchestration lifecycle are all implemented correctly and match the advisory exactly. Two minor issues in `improvement.ts` require correction before this review closes.

---

## Tooling Developer Track — No Findings

All Component 4 requirements met:

- `buildBackwardPassPlan` and `computeBackwardPassPlan` replace the deprecated API correctly
- Role-appearance check (§2.4) implemented via topological ordering + first-occurrence positions; verified against the §2.5 worked trace in the completion report
- `locateFindingsFiles` and `locateAllFindingsFiles` implement the correct regex (`/^(\d+)[a-z]?-(.*)-findings\.md$/i`), normalize role slugs consistently via `normalizeRoleSlug`, return repo-relative paths, and return `[]` on unreadable directory without throwing
- Parallel mode returns a single concurrent meta-analysis group followed by the synthesis step
- Synthesis entry: `stepType: 'synthesis'`, `sessionInstruction: 'new-session'`, `findingsRolesToInject: []` ✅
- `prompt` field removed; `GENERAL_IMPROVEMENT_PATH` constant removed ✅
- INVOCATION.md updated; Component 4 correctly described as runtime library ✅
- Test suite: 7 cases including the repeated-role case from §2.5 ✅

---

## Runtime Developer Track — Two Findings in `improvement.ts`

All files outside `improvement.ts` are correct:

- `types.ts`: `HandoffResult`, `ImprovementPhaseState`, `FlowRun` additions match spec exactly ✅
- `handoff.ts`: Three-form detection, guards, and error messages match §1.3 exactly ✅
- `orient.ts`: Return type updated to `HandoffResult | null`; all three parse call sites propagate the result directly ✅
- `orchestrator.ts`: `HandoffResult.kind` dispatch matches §3.2; bootstrap path handles non-targets kind; `stateVersion: '2'` set on new flow creation ✅
- `store.ts`: Migration check silent, sets `stateVersion: '1'` on absent field ✅
- `runtime/INVOCATION.md`: Three modes documented; synthesis as fresh Curator session noted ✅

### Finding 1 — `synthesisSessionId` unused variable (`improvement.ts` line 122)

**File:** `runtime/src/improvement.ts:122`

```typescript
const synthesisSessionId = `${flowRun.flowId}__bp-synthesis-${crypto.randomUUID()}`;
```

This variable is assigned but never passed to any function. `runInteractiveSession` does not accept a session ID parameter — it generates its own `crypto.randomUUID()` internally (`orient.ts:26`). The synthesis session freshness requirement IS met, but by `runInteractiveSession`'s own internal behavior, not by this variable.

**Correction:** Remove the unused `synthesisSessionId` assignment. The synthesis freshness requirement is satisfied structurally by `runInteractiveSession`'s internal session creation. No other changes needed. The co-maintenance note in the advisory (§3.5) that synthesis is "always a fresh session" remains accurate — just documented in the wrong place.

### Finding 2 — Approximate missing-findings warning check (`improvement.ts` lines 89–95)

**File:** `runtime/src/improvement.ts:91`

```typescript
const found = findingsFilePaths.some(p => p.toLowerCase().includes(normalizedExpected));
```

The warning check uses a substring `includes` on the full path string. The spec (§2.6) intends per-role detection — warn if no file was found for a specific role. This implementation is an approximation: a role slug that is a substring of a path component from another role (e.g., role `"TA"` substring-matching a path containing `"...technical-architect-..."`) could suppress a warning that should fire, or a path containing the slug in an unrelated component could suppress it.

**Correction:** Replace the `includes` check with a direct call to `locateFindingsFiles` per expected role:

```typescript
for (const expectedRole of findingsRoles) {
  const perRoleFiles = locateFindingsFiles(signal.recordFolderPath, [expectedRole]);
  if (perRoleFiles.length === 0) {
    outputStream.write(`[improvement] Role ${entry.role}: expected findings from ${expectedRole} but no matching file found in ${signal.recordFolderPath}. Proceeding without findings for this role.\n`);
  }
}
```

This is one additional `readdirSync` per expected role, but the call is cheap (the directory is small) and the correctness improvement is significant. The `findingsFilePaths` array (already computed) is still passed to `buildContextBundle` unchanged — only the warning logic changes.

---

## Required Actions

Both findings are confined to `runtime/src/improvement.ts`. No spec changes. No re-review required after correction — the corrections are mechanical and directly specified above.

1. **Remove `synthesisSessionId` at line 122.**
2. **Replace the `includes` warning check at lines 89–95 with the per-role `locateFindingsFiles` call specified above.**

---

Next action: Apply the two corrections to `runtime/src/improvement.ts`, then proceed to forward pass closure
Read: `a-society/a-docs/records/20260403-programmatic-improvement-system/07-ta-integration-review.md`
Expected response: `08-owner-forward-pass-closure.md` after confirming corrections applied

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260403-programmatic-improvement-system/07-ta-integration-review.md
```
