**Subject:** Runtime Orchestrator MVP — TA Integration Assessment (Updated)
**Status:** APPROVED
**Type:** Technical Architect Assessment
**Date:** 2026-03-27
**Supersedes:** `12-ta-assessment.md`

---

## Assessment Basis

- Approved Phase 0 architecture: `03-ta-to-owner.md`
- Phase 0 Gate Decision: `04-owner-to-developer.md`
- Owner remediation directive: `13-owner-to-developer.md`
- Remediation completion report: `14-developer-completion.md`
- Implementation under review: `a-society/runtime/src/` (10 source files, updated)

---

## Verdict

**Approved for Owner integration gate.**

All seven items from the remediation scope (`12-ta-assessment.md §5`) have been addressed. Code inspection confirms the claims in `14-developer-completion.md` are accurate. The four critical gaps are closed, the undeclared deviation is resolved, and the two minor issues are remediated. The runtime now implements the full execution model specified in Phase 0.

---

## §1. Remediation Verification

### C-1 — Tool Trigger Engine: RESOLVED

`src/triggers.ts` now imports and calls actual tooling components in-process:

- `START` → `validateWorkflowFile(payload.workflowDocumentPath)` — checks `res.valid`, throws on failure
- `ACTIVE_ARTIFACT` → `validatePlanArtifact(recordFolder)` — derives record folder from artifact path, checks `res.valid`
- `TERMINAL_FORWARD_PASS` → `orderWithPromptsFromFile(flowRun.recordFolderPath, 'Curator')`
- `INITIALIZATION` → `scaffoldFromManifestFile(...)` with correct manifest path resolution

On any component failure, the error propagates, is saved to the trigger record with `success: false`, and re-thrown to the orchestrator. `SessionStore.saveTriggerRecord` now correctly uses `flowRun.flowId` (M-1 fix applied here simultaneously). Trigger records reflect real execution.

**One observation flagged for backward pass (not a blocker):** The TERMINAL_FORWARD_PASS trigger calls `orderWithPromptsFromFile(flowRun.recordFolderPath, 'Curator')` with `'Curator'` hardcoded as the second argument. If this parameter governs the backward-pass traversal starting point, it may not generalize to workflows whose last forward-pass node is not Curator-proximate. This should be evaluated in the backward pass against Component 4's actual interface contract (`$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`). Not a gate blocker.

### C-2 — Flow Orchestrator edge routing: RESOLVED

`src/orchestrator.ts` now:

1. Parses the workflow YAML graph at the start of each `advanceFlow` call via `parseWorkflow(flowRun.workflowDocumentPath)`
2. Finds the current node object in `wf.nodes` — throws if not found
3. Filters `wf.edges` for outgoing edges from `flowRun.currentNode`
4. If zero outgoing edges: fires TERMINAL_FORWARD_PASS, sets `status = 'completed'`, returns
5. For each outgoing edge, resolves the target node and tests `targetNode.role === proposedRole`
6. If no edge matches: sets `status = 'failed'`, throws `Unauthorized transition: workflow limits successors to [...], but proposed role was '...'`
7. If an edge matches: advances `flowRun.currentNode = nextNode.id` and persists

The edge-rejection error message is explicit and actionable. The terminal detection is correct. Multi-node flow orchestration is now functional.

### C-3 — `human-collaborative` pause: RESOLVED

The orchestrator reads `currentNodeHeader['human-collaborative']` immediately after resolving the current node, before any session or LLM activity. If the field is a non-empty string and no `humanInput` argument is present, it sets `status = 'awaiting_human'`, persists the flow, logs a console message, and returns — the LLM Gateway is never called.

`cli.ts` `resume-flow` now accepts an optional trailing argument: `rest.join(' ')` is passed as `humanInput` to `advanceFlow`. The human's input is injected as part of the `userMessageContent` and correctly enters the transcript as a user message, not as a system prompt.

The pause-before-turn order is correct: the check runs before context assembly and before the session is loaded, so no unnecessary work occurs at collaborative nodes.

### C-4 — Context bundle double-injection: RESOLVED

`bundleContent` is passed as the `systemPrompt` argument to `llm.executeTurn` and is never added to `session.transcriptHistory`. The user message is now built separately:

```
userMessageContent = humanInput (if present) + "Active artifact: <path>"
```

Only this `userMsg` is pushed to `session.transcriptHistory`. On subsequent turns, the transcript contains only the role's actual task inputs and outputs — not the full context bundle. Context will not compound across turns.

### D-1 — `start` normalization removed: RESOLVED

`src/handoff.ts` now accepts only `start_new` and `resume`. The `HandoffBlock` type reflects `session_action: 'resume' | 'start_new'`. The error message reads: `'"session_action" must be one of: start_new, resume.'` Any block submitting `start` will be rejected as malformed. ✓

### M-1 — `flowId` added: RESOLVED

`FlowRun` now carries `flowId: string`. In `cli.ts`, `startFlow` assigns `flowId: crypto.randomUUID()`. `SessionStore.saveTriggerRecord` takes `flowRunId: string` (called with `flowRun.flowId`), so trigger records from different flow runs on the same record folder are correctly isolated. ✓

### M-2 — Runtime Developer registry entry: RESOLVED

`src/registry.ts` `a-society__Runtime Developer` entry now includes `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` alongside the workflow document. The co-maintenance comment on `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` is retained as context. ✓

---

## §2. Integration Test Record Assessment

`14-developer-completion.md` reports five test scenarios matching the requirements in `13-owner-to-developer.md`. The implementation structure supports each:

1. **Multi-node flow** — edge routing now advances `currentNode`; the reported `owner-intake-briefing` → `curator-proposal` transition is consistent with a valid workflow graph edge ✓
2. **`human-collaborative` pause and resume** — the pause-before-turn logic and the `resume-flow` humanInput parameter are correctly implemented ✓
3. **Component 3 validation failure** — `validateWorkflowFile` throws on invalid input, `start-flow` exits before the first role turn ✓
4. **Handoff edge rejection** — unauthorized transition throws with an explicit error, flow marked `failed` ✓
5. **Trigger records reflect real execution** — stubs removed, actual component return values used in `resultSummary` ✓

---

## §3. Residual Observations (Backward Pass Only)

These are not integration gate blockers. They are flagged for the backward pass record.

**BP-1 — `orderWithPromptsFromFile` hardcoded role argument.** See C-1 note above. The backward pass should evaluate whether `'Curator'` is the correct argument for this Component 4 call, or whether the argument should be derived from the terminal workflow node's role.

**BP-2 — Starting node resolution picks first matching role.** `startFlow` in `cli.ts` finds the starting node by scanning for the first node whose `role` matches `startingRole`. If a workflow has the same role at multiple nodes (e.g., Owner at nodes 1, 3, 7, 9), `start-flow` always starts at that role's first occurrence. This is a usability limitation for mid-flow entry points but is consistent with the MVP scope definition (a single starting point per `start-flow` invocation). Note for future increment.

**BP-3 — `resume-flow` human input is a single CLI string.** Multi-line human input cannot be passed via CLI args. Acceptable for MVP; note for next runtime increment.

---

## §4. Architecture Conformance Summary

| Dimension | Status |
|---|---|
| Seven runtime components present and structurally correct | ✓ |
| Provider adapter boundary (Anthropic-only, `LLMGateway` interface) | ✓ |
| File-backed state in `runtime/.state`, not in record folders | ✓ |
| Context injection via `roleContextRegistry`, not prose parsing | ✓ |
| Framework paths resolved from index, never hardcoded | ✓ |
| In-process tooling invocation (not subprocess shell) | ✓ |
| Workflow edge routing: linear, validated against graph | ✓ |
| `human-collaborative` pause before model turn | ✓ |
| Terminal node detection triggers Component 4 | ✓ |
| `start-flow` triggers Component 3 pre-flight | ✓ |
| Handoff schema strictly enforced (no repair, no undeclared aliases) | ✓ |
| Unique `flowId` per flow run | ✓ |
| All three supported roles in `roleContextRegistry` with role files | ✓ |
| State isolation: transcript history contains task I/O only | ✓ |

---

## Handoff

Artifact ready for Owner review:

`a-society/a-docs/records/20260327-runtime-orchestrator-mvp/15-ta-assessment.md`

**What the Owner needs to evaluate:**

1. Confirm the remediation findings above are sufficient for the integration gate condition to be met.
2. Review the three backward-pass observations (§3) — no action required before the gate, but BP-1 (the hardcoded `'Curator'` argument in Component 4 invocation) may warrant a follow-on Runtime Developer task depending on Component 4's interface contract.

**Open questions for Owner at the gate (not blockers):**

- BP-1 should be assessed against Component 4's interface. If `'Curator'` is not the correct argument, a small follow-on correction will be needed post-registration. The Owner should decide whether to resolve this before or after the Curator registration phase.

No further TA action is required before the Owner integration gate.
