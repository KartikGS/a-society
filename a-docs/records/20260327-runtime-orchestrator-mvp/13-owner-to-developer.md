**Subject:** Runtime Orchestrator MVP — Remediation Direction
**Status:** REMEDIATION AUTHORIZED
**Date:** 2026-03-27

---

## Assessment Accepted

The TA's assessment (`12-ta-assessment.md`) is accepted in full. The four critical gaps (C-1 through C-4) are confirmed blockers. The integration gate cannot proceed until all four are resolved and the TA updates the assessment to APPROVED.

---

## D-1 Decision: Remove the normalization

The canonical `session_action` value for a new session is `start_new`. The value `start` is not in the schema defined by `$INSTRUCTION_MACHINE_READABLE_HANDOFF`. The instruction explicitly prohibits project-level enum changes ("Projects do not add fields, change field types, or alter enum values. The schema is fixed."). Adding `start` as a formal alias would require a Framework Dev flow — that is not appropriate here.

**Required action:** Remove the `start` → `start_new` normalization from `src/handoff.ts`. The parser must reject `start` as malformed, consistent with how it treats any other unrecognized `session_action` value.

No documentation change is needed — the spec already says `start_new`. No search for existing handoff blocks using `start` is required as a Developer task: the historical blocks in the record are consumed artifacts; they do not run through the parser. Going forward, all newly produced handoff blocks must use `start_new`.

**Owner note:** The Owner produced `session_action: start` in handoff blocks within this flow (`02-owner-to-ta-brief.md` and `04-owner-to-developer.md`). This is non-compliant output. The Owner will flag this as a backward pass finding. It does not affect remediation scope — those blocks are historical artifacts — but the error pattern warrants a backward pass observation.

---

## Remediation Scope

The Developer must address all seven items from `$12-ta-assessment.md §5` in the following priority order:

**Blocking (must complete before TA re-assessment):**

1. **C-2 — Flow Orchestrator edge routing.** This is the most structurally significant gap: the runtime cannot orchestrate multi-node flows without it. Implement it first. The orchestrator must: read the workflow YAML graph (already parsed at `start-flow`), identify the successor node for `handoff.role`, validate that the proposed role is the allowed successor, advance `flowRun.currentNode` when valid, and mark the flow `failed` when the proposed role does not match.

2. **C-3 — `human-collaborative` pause.** Implement immediately after C-2, because the orchestrator's node-read logic (from C-2) is the prerequisite: the `human-collaborative` field is on the current node object the orchestrator now reads. In `advanceFlow`: before running a model turn, check the current node's `human-collaborative` field. If present and non-empty, set `status = 'awaiting_human'`, persist, and return without calling the LLM Gateway. In `resume-flow`: accept the human's input and inject it as the user turn before delegating back to `advanceFlow`.

3. **C-1 — Tool Trigger Engine real invocations.** Remove all four stubs. Wire in-process calls to Components 3, 7, 4, and 1 at their declared trigger points. Do not write fabricated `resultSummary` strings. The tooling modules are in `a-society/tooling/src/`; consult `$A_SOCIETY_TOOLING_INVOCATION` for entry points and error conventions.

4. **C-4 — Context bundle transcript injection.** Do not store `bundleContent` as the user message in `session.transcriptHistory`. The transcript records the role's actual task input and output. Use the active artifact content or directive as the user message, or model system prompt injection separately from the user turn.

5. **D-1 — Remove `start` normalization** (as specified above).

**Non-blocking (address in same remediation session):**

6. **M-1 — Add unique `flowId` to `FlowRun`.** Use it as the trigger record directory key instead of `recordFolderPath`.

7. **M-2 — Add `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` to the Runtime Developer registry entry** in `src/registry.ts`. The workflow document is not a substitute for the role file.

---

## Updated Integration Test Requirements

After remediation, the Developer must produce an updated integration test record (`14-developer-completion.md`) demonstrating:

1. A **multi-node flow** advancing through at least two nodes — `currentNode` must change between turns, and the turn records must reflect distinct nodes.
2. A **`human-collaborative` pause and resume** — the flow must reach an `awaiting_human` state, halt without calling the LLM Gateway, and correctly resume when human input is injected.
3. A **Component 3 validation failure** — supply a malformed workflow document to `start-flow`; the flow must halt before the first role turn and report the Component 3 error.
4. A **non-terminal handoff rejection** — submit a handoff block proposing a role that is not the allowed successor; the flow must mark itself `failed` rather than advancing.
5. Confirm that **trigger records reflect actual tooling component execution** — not fabricated summaries.

The updated integration test record replaces the prior one as the input to the TA's re-assessment.

---

## Handoff

Resume the existing Runtime Developer session.

```
Next action: Remediate C-1 through C-4, D-1, M-1, M-2 per this decision and the TA assessment; then produce an updated integration test record
Read: a-society/a-docs/records/20260327-runtime-orchestrator-mvp/12-ta-assessment.md
      a-society/a-docs/records/20260327-runtime-orchestrator-mvp/13-owner-to-developer.md
Expected response: 14-developer-completion.md filed in the record folder with the updated integration test record
```

```yaml
handoff:
  role: Runtime Developer
  session_action: resume
  artifact_path: a-society/a-docs/records/20260327-runtime-orchestrator-mvp/13-owner-to-developer.md
  prompt: null
```
