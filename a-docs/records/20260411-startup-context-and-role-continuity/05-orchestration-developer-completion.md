**Subject:** Startup Context-Read Timing and Same-Role Session Continuity — Orchestration Developer Completion Report
**Type:** Orchestration Developer → Owner
**Date:** 2026-04-11
**Flow:** `20260411-startup-context-and-role-continuity`

---

## Modified Files

| File | Action |
|---|---|
| `a-society/runtime/src/types.ts` | Modified — added `RoleContinuityEntry`, `RoleContinuityState`; added `roleContinuity` field to `FlowRun`; updated `stateVersion` comment to `"3"` as current schema |
| `a-society/runtime/src/session-entry.ts` | Created — new helper module owning exact text templates for `buildOwnerBootstrapMessage`, `buildForwardNodeEntryMessage`, and `buildImprovementEntryMessage` |
| `a-society/runtime/src/injection.ts` | Modified — removed `activeArtifactPath` parameter from `buildContextBundle`; changed required-reading heading from `MANDATORY CONTEXT LOADING` to `RUNTIME-LOADED REQUIRED READING`; added explicit already-loaded statement |
| `a-society/runtime/src/orient.ts` | Modified — removed generic empty-history auto-seed behavior from `runInteractiveSession` |
| `a-society/runtime/src/store.ts` | Modified — `loadFlowRun` silently migrates state versions `"1"` and `"2"` to `"3"` by initializing an empty `roleContinuity` ledger; no session-file rename or transcript rewrite |
| `a-society/runtime/src/orchestrator.ts` | Modified — imported `buildOwnerBootstrapMessage` and `buildForwardNodeEntryMessage` from `session-entry.ts`; pushed Owner bootstrap message into `bootstrapHistory` before first `runInteractiveSession` call; replaced flat artifact-path node-entry message with `buildForwardNodeEntryMessage` including parallel-isolation check and role-continuity entries; added `roleContinuity` ledger update before `applyHandoffAndAdvance` on successful targets handoff; changed `stateVersion` in new flow creation from `"2"` to `"3"`; initialized `roleContinuity: {}` in new flow object |
| `a-society/runtime/src/improvement.ts` | Modified — imported `buildImprovementEntryMessage` from `session-entry.ts`; removed instruction and findings files from `buildContextBundle` calls for both meta-analysis and synthesis steps; delivery now via `buildImprovementEntryMessage` as the initial user message |
| `a-society/runtime/INVOCATION.md` | Modified — added "Session Startup and Continuity" section documenting: required reading loaded once at startup, fresh Owner bootstrap behavior, same-node prompt-human resume, same-role later-node return with continuity summary, and same-role parallel isolation |
| `a-society/runtime/test/context-injection.test.ts` | Modified — replaced prior tests with assertions for stable-only bundle (no active artifact content), new RUNTIME-LOADED heading, already-loaded statement, and deterministic hash |
| `a-society/runtime/test/observability.test.ts` | Modified — added test proving `runInteractiveSession` with empty history returns `null` and records `invalid_history` outcome (no auto-seed) |
| `a-society/runtime/test/session-entry.test.ts` | Created — 13 tests asserting exact text for all three message builders across: Owner bootstrap content, forward-node entry header/continuity/artifact/human-input rendering, and improvement entry file-block rendering |
| `a-society/runtime/test/integration/same-role-continuity.test.ts` | Created — 7 tests covering: approved Owner bootstrap text, RUNTIME-LOADED bundle framing, same-node resume transcript preservation, later-same-role continuity section + artifact rendering, parallel isolation suppression, ledger persistence round-trip, and v2→v3 migration |
| `a-society/runtime/test/invocation-doc.test.ts` | Created — 4 doc-contract assertions checking `INVOCATION.md` for required-reading already-loaded statement, prompt-human resume, later-same-role continuity, and parallel isolation |
| `a-society/runtime/package.json` | Modified — added `session-entry.test.ts`, `invocation-doc.test.ts`, and `integration/same-role-continuity.test.ts` to the test script |

---

## Implemented Behavior

**Stable system bundle narrowed.** `buildContextBundle` now assembles only: role announcement, date, runtime handoff contract, and required-reading files. Active artifacts, improvement instruction files, and findings files are no longer injected here.

**Required-reading framing updated.** The bundle heading changed from `--- MANDATORY CONTEXT LOADING FOR <roleKey> ---` to `--- RUNTIME-LOADED REQUIRED READING FOR <roleKey> ---`, immediately followed by: `These files are already loaded into this session by the runtime. Use them directly. Do not spend your first turn rereading or re-listing them unless the current task specifically requires close inspection of one file.`

**Generic auto-seed removed from `orient.ts`.** `runInteractiveSession` no longer injects a startup user message when history is empty. It returns `null` if the last message is not a user message. Callers are responsible for providing the initial user message.

**Owner bootstrap message is caller-owned.** The orchestrator pushes the approved Owner bootstrap message into `bootstrapHistory` before the first `runInteractiveSession` call. The message uses the already-loaded framing and does not tell the Owner to reread injected authority files.

**Node-entry user message.** On first entry to a workflow node (empty transcript), the orchestrator builds one combined user message via `buildForwardNodeEntryMessage` containing: node header, non-startup distinction line, optional role-continuity section (when safe), current task inputs with rendered file blocks, optional human input, and closing instruction. On same-node resume, only the human reply is appended.

**Same-role parallel isolation.** Before building the node-entry message, the orchestrator checks whether any other active node shares the same `roleKey`. If one does, `continuityEntries` is passed as `undefined` and no continuity section is injected.

**Role-continuity ledger.** `FlowRun.roleContinuity` (keyed by `roleKey = ${projectNamespace}__${role}`) accumulates `RoleContinuityEntry` records on each successful `targets` handoff. The update happens before `applyHandoffAndAdvance` so the single save inside that method persists it. New flows initialize `roleContinuity: {}` and `stateVersion: "3"`.

**State migration.** `SessionStore.loadFlowRun` detects state versions `"1"` and `"2"`, initializes `roleContinuity: {}` if absent, and sets `stateVersion = "3"`. Persisted on next normal save. No transcript rewrite or session-file rename.

**Improvement session task delivery.** Both meta-analysis and synthesis now call `buildImprovementEntryMessage` for their first user message. The message includes: step label, record folder path, instruction file as a `[FILE: ...]` block with inline content, findings file blocks with inline content, and the completion signal. The stable bundle for improvement sessions contains only role context, not these task-scoped files.

**`$A_SOCIETY_RUNTIME_INVOCATION` updated.** `INVOCATION.md` has a new "Session Startup and Continuity" section documenting all four session behaviors shipped in this flow.

---

## Verification Summary

Full test suite run: **126 assertions, 0 failures** across 21 test files.

**Verification obligation 1 — System bundle contains only stable runtime-owned context.**
Confirmed by `context-injection.test.ts`: bundle contains role announcement, date, handoff contract, and required-reading files; does not contain active artifact content; uses `RUNTIME-LOADED REQUIRED READING` heading; includes already-loaded statement.

**Verification obligation 2 — Fresh Owner bootstrap uses the explicit Owner message, not a generic empty-history branch.**
Confirmed by `observability.test.ts` (empty history → `null`, `invalid_history` span; no auto-seed executes) and `session-entry.test.ts` (bootstrap message contains approved text and does not tell the model to read files). The orchestrator's `bootstrapHistory.push(buildOwnerBootstrapMessage())` is the sole source.

**Verification obligation 3 — Same-node `prompt-human` resume reuses transcript, does not regenerate node-entry.**
Confirmed by `same-role-continuity.test.ts` test 3: a persisted session with two history entries loads intact; the first entry remains the original node-entry message, not a regenerated one. The `injectedHistory.length !== 0` branch in `advanceFlow` appends only the human reply.

**Verification obligation 4 — Later same-role node receives non-startup framing, continuity summary, and current artifact.**
Confirmed by `session-entry.test.ts` (continuity section rendered correctly with prior node entries) and `same-role-continuity.test.ts` test 4: message contains non-startup distinction line, `Role continuity from earlier nodes in this flow:`, prior node ID and artifact path, and current node artifact content.

**Verification obligation 5 — Active node artifacts and improvement files are delivered as user input, not system bundle.**
Confirmed by `context-injection.test.ts` (`does not include active artifact content` test) and `session-entry.test.ts` (file blocks render correctly in improvement entry messages).

**Verification obligation 6 — Same-role parallel activation remains isolated.**
Confirmed by `same-role-continuity.test.ts` test 5: when `continuityEntries` is `undefined` (parallel isolation path), the message contains no `Role continuity from earlier nodes in this flow:` section. The orchestrator's parallel-check logic (`flowRun.activeNodes.filter(id !== nodeId).some(...)`) is the gate.

**Verification obligation 7 — `INVOCATION.md` matches implemented startup/resume semantics.**
Confirmed by `invocation-doc.test.ts`: all four required semantic areas are present in the document. Manually verified the section wording matches implemented behavior.

---

## Deviations and Resolution Status

No deviations. All approved design decisions from `03-ta-phase0-design.md` were implementable as specified. No escalation to the TA was required.

---

## Standing Spec and Coupling Doc Update Status

`$A_SOCIETY_RUNTIME_INVOCATION` (`a-society/runtime/INVOCATION.md`) was updated in this implementation pass as required by the implementation discipline and the coupling-map obligation. No new coupling-map row is required for this flow (Type C executable behavior change per TA assessment).

The following Curator-managed surfaces identified in §7 of the TA advisory are **not** updated by this role and remain as downstream work in this same flow:

| File | Change required |
|---|---|
| `a-society/a-docs/roles/owner.md` | Remove explicit `$A_SOCIETY_WORKFLOW` reread instruction; preserve routing authority without a default reread cue |
| `a-society/general/instructions/roles/required-readings.md` | Add reusable rule: runtime-injected required reading counts as already loaded in runtime-managed sessions |

```handoff
role: Owner
artifact_path: a-society/a-docs/records/20260411-startup-context-and-role-continuity/05-orchestration-developer-completion.md
```
