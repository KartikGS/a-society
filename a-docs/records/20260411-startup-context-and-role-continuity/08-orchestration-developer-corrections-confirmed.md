**Subject:** Startup Context-Read Timing and Same-Role Session Continuity — Corrections Confirmed
**Type:** Orchestration Developer → Technical Architect
**Status:** CORRECTIONS COMPLETE
**Date:** 2026-04-11
**Flow:** `20260411-startup-context-and-role-continuity`

---

## Status

All three corrections required by the Owner gate (`07-owner-integration-corrections.md`) have been implemented and verified. `npm test` in `a-society/runtime/` exits clean across the full suite.

---

## Correction 1 — Improvement-session namespace and path resolution aligned to live `FlowRun` contract

**File:** `a-society/runtime/src/improvement.ts`

**What was wrong:**

The improvement step derived its namespace from `path.basename(flowRun.projectRoot)` and resolved instruction files from the workspace root alone, contradicting the live `FlowRun` contract where `projectRoot` is the workspace root and `projectNamespace` is the project folder name.

**Fix applied:**

| Old | New |
|---|---|
| `const namespace = path.basename(flowRun.projectRoot);` | *(removed)* |
| `const roleKey = \`${namespace}__${entry.role}\`` | `const roleKey = \`${flowRun.projectNamespace}__${entry.role}\`` |
| `path.join(flowRun.projectRoot, 'a-docs', 'improvement', 'meta-analysis.md')` | `path.join(flowRun.projectRoot, flowRun.projectNamespace, 'a-docs', 'improvement', 'meta-analysis.md')` |
| `path.join(flowRun.projectRoot, 'a-docs', 'improvement', 'synthesis.md')` | `path.join(flowRun.projectRoot, flowRun.projectNamespace, 'a-docs', 'improvement', 'synthesis.md')` |

**Test fixture corrected (`a-society/runtime/test/observability.test.ts`):**

The fixture that masked the bug was updated to use the real `FlowRun` shape:

- `flowRun.projectNamespace = path.basename(tmpDir)` added explicitly
- `flowRun.projectRoot = tmpDir` (workspace root, unchanged)
- Improvement instruction files moved from `tmpDir/a-docs/improvement/...` to `tmpDir/${improvementNamespace}/a-docs/improvement/...`
- Role files moved from `tmpDir/a-docs/roles/...` to `tmpDir/${improvementNamespace}/a-docs/roles/...`

**Verification:**

1. `const roleKey = \`${flowRun.projectNamespace}__${entry.role}\`` — confirmed in `improvement.ts`
2. `path.join(flowRun.projectRoot, flowRun.projectNamespace, 'a-docs', 'improvement', ...)` — confirmed for both meta-analysis and synthesis paths
3. Test fixture no longer builds directories around the basename-derived assumption

---

## Correction 2 — Improvement initialization preserved at schema version 3

**File:** `a-society/runtime/src/improvement.ts`

**What was wrong:**

Improvement initialization wrote `flowRun.stateVersion = '2'` immediately before persisting, downgrading flows that had already been created or migrated as v3.

**Fix applied:**

Changed `flowRun.stateVersion = '2'` → `flowRun.stateVersion = '3'` at the improvement initialization site.

**Regression coverage added (`a-society/runtime/test/observability.test.ts`):**

The existing improvement closure scenario was extended with:

```typescript
assert.strictEqual(flowRun.stateVersion, '3', 'improvement initialization must not regress stateVersion below v3');
```

This assertion is present in the "ImprovementOrchestrator repairs synthesis until terminal handoff" test and fails immediately if the stateVersion regression re-enters.

**Verification:**

1. No improvement initialization path writes `stateVersion = '2'` — confirmed in `improvement.ts`
2. Automated coverage asserts `stateVersion === '3'` after improvement mode is selected — confirmed in `observability.test.ts`

---

## Correction 3 — Repeated-role coverage strengthened at orchestrator seam

**File:** `a-society/runtime/test/integration/same-role-continuity.test.ts`

**What was wrong:**

The existing tests covered helper and store surfaces only: `buildForwardNodeEntryMessage` called directly, `continuityEntries: undefined` passed directly, `flowRun.roleContinuity` mutated manually.

**Fix applied:**

Three new orchestrator-seam tests added (Tests 8–10), using the `LLMGateway.prototype.executeTurn` patching pattern established in `observability.test.ts`:

**Test 8 — Successful targets handoff appends entry to `roleContinuity` ledger:**

- Configures a workflow with `owner-intake → ta`
- `advanceFlow` at `owner-intake` with a targets handoff mock provider
- After advance, reloads the flowRun via `SessionStore.loadFlowRun` and asserts `roleContinuity['a-society-test__owner'].completedNodes` has one entry with the expected `nodeId` and `outputArtifactPath`

**Test 9 — Later same-role node entry message contains continuity section:**

- Pre-populates `flowRun.roleContinuity` with a completed entry for the Owner role
- Configures `owner-gate` as the active node (same Owner role, different node)
- Provides a prompt-human mock so the session suspends without terminal handoff
- Closes the input stream so readline does not block
- Reads back the transcript and asserts `transcriptHistory[0].content` includes `"Role continuity from earlier nodes in this flow:"`

**Test 10 — Parallel same-role activation suppresses continuity in node-entry message:**

- Configures both `owner-intake` and `owner-gate` as simultaneously active nodes
- Pre-populates `roleContinuity` with a completed entry for the Owner role
- Provides a prompt-human mock at `owner-intake` and closes input stream
- Asserts `transcriptHistory[0].content` does NOT include `"Role continuity"` — isolation enforced

**Scope boundary confirmed:** Same-role parallel continuity remains disabled. Test 10 asserts the isolation behavior is in effect, not that parallel continuity should be added.

**Final test count:** 10 tests, 10 passed.

**Verification:**

All three orchestrator seams are now exercised through `advanceFlow`, not through direct helper calls or manual state mutation.

---

## Test Run

```
npm test in a-society/runtime/

same-role-continuity integration
  ✓ Fresh Owner bootstrap message matches approved text
  ✓ Context bundle uses RUNTIME-LOADED framing, not MANDATORY CONTEXT LOADING
  ✓ Same-node resume: existing session transcript is preserved intact
  ✓ buildForwardNodeEntryMessage: later same-role entry includes continuity and artifact
  ✓ buildForwardNodeEntryMessage: parallel same-role node — no continuity section when entries absent
  ✓ Store: roleContinuity persisted and reloaded correctly
  ✓ Store: loading a v2 flow migrates it to v3 with empty roleContinuity
  ✓ Orchestrator: successful targets handoff appends entry to roleContinuity ledger
  ✓ Orchestrator: later same-role node entry message contains continuity section
  ✓ Orchestrator: parallel same-role activation suppresses continuity in node-entry message

  10 passed, 0 failed

observability-foundation integration corrections (Pass 2)
  ✓ Scenario: LLMGateway.executeTurn with tool rounds (REAL CODE)
  ✓ Scenario: runInteractiveSession with empty history returns null (no auto-seed)
  ✓ Scenario: Prompt-human suspension in orient.ts (REAL CODE)
  ✓ Scenario: Handoff parse failure in orient.ts requests repair (REAL CODE)
  ✓ Scenario: ToolTriggerEngine.evaluateAndTrigger (REAL CODE)
  ✓ Scenario: ImprovementOrchestrator closure (REAL CODE)
  ✓ Scenario: ImprovementOrchestrator repairs synthesis until terminal handoff (REAL CODE)

  7 passed, 0 failed

Full suite: all suites pass, 0 failures.
```

---

## No Deviations

All three corrections were implemented exactly as specified in the Owner gate artifact. No additional changes were made.

```handoff
role: Technical Architect
artifact_path: a-society/a-docs/records/20260411-startup-context-and-role-continuity/08-orchestration-developer-corrections-confirmed.md
```
