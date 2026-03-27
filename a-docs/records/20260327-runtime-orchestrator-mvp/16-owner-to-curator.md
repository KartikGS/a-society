**Subject:** Runtime Orchestrator MVP — Integration Gate Decision & Registration Scope
**Status:** APPROVED
**Date:** 2026-03-27

---

## Integration Gate: APPROVED

The updated TA assessment (`15-ta-assessment.md`) is accepted. All four critical gaps, the undeclared deviation, and both minor issues are confirmed resolved. The implementation conforms to the Phase 0 architecture specification across all fourteen conformance dimensions in the TA's §4. The Curator may proceed to registration.

---

## TA Backward-Pass Observations: Owner Disposition

The TA flagged three non-blocking observations for the backward pass:

**BP-1 — `orderWithPromptsFromFile` hardcoded `'Curator'` argument.**
Checked against Component 4's interface: the second argument is `synthesisRole` — the designated synthesis role for the backward pass. `'Curator'` is correct for all current A-Society flows (the Curator always synthesizes, confirmed by the project log). The portability concern is real — if the runtime is ever extended to orchestrate non-A-Society projects with different synthesis roles, this argument must be derived from configuration rather than hardcoded. That is a future runtime increment, not an MVP gap. Not a blocker. Flagged for backward pass. Added to Next Priorities (see below).

**BP-2 — Starting node resolution picks first matching role.**
Consistent with the MVP scope definition (single starting point per `start-flow` invocation). Noted for next runtime increment. No action required before registration.

**BP-3 — `resume-flow` human input is a single CLI string.**
Multi-line input limitation is acceptable for MVP. Noted for next runtime increment.

---

## Registration Scope

**[Curator authority — implement directly]**

The Curator performs all registration tasks for this phase. No Owner proposal round precedes implementation.

### Required actions

**1. Create `a-society/runtime/INVOCATION.md`** `[additive]`

The runtime has no invocation reference document. Create one analogous to `$A_SOCIETY_TOOLING_INVOCATION`. It must cover:
- Runtime entry model: TypeScript source, tsx runtime, invoked via `tsx src/cli.ts <command>`
- Required environment: `ANTHROPIC_API_KEY` (for the LLM Gateway)
- The three commands with their required arguments and descriptions:
  - `start-flow <workflowDocumentPath> <recordFolderPath> <startingRole> <startingArtifactPath>` — creates a `FlowRun` and begins orchestration
  - `resume-flow <recordFolderPath> [humanInput]` — resumes a paused or retryable flow; `humanInput` is optional and required when resuming from `awaiting_human` state
  - `flow-status <recordFolderPath>` — inspects current node, role sessions, last trigger, and pause/failure reason
- Error conventions: the four error classes from §3 of the Phase 0 spec (`03-ta-to-owner.md`) and the runtime status values (`initialized`, `running`, `awaiting_human`, `awaiting_retry`, `completed`, `failed`)
- Session state location: `runtime/.state/` (not in record folders)

**2. Register in `$A_SOCIETY_PUBLIC_INDEX` (`a-society/index.md`)** `[additive]`

Add one new row:

| Variable | Path | Description |
|---|---|---|
| `$A_SOCIETY_RUNTIME_INVOCATION` | `a-society/runtime/INVOCATION.md` | Invocation reference for the A-Society runtime — entry points, CLI commands, error conventions |

Do not register individual `runtime/src/*.ts` source files in the public index. The INVOCATION.md is the external-facing reference; source files are implementation details.

**3. Update `$A_SOCIETY_AGENT_DOCS_GUIDE`** `[check and update as needed]`

The runtime developer role (`$A_SOCIETY_RUNTIME_DEVELOPER_ROLE`) and workflow (`$A_SOCIETY_WORKFLOW_RUNTIME_DEV`) were registered in the `runtime-dev-setup` flow. Verify both entries are present and accurate. Add an entry for `$A_SOCIETY_RUNTIME_INVOCATION` if the guide covers tooling invocation references (check for `$A_SOCIETY_TOOLING_INVOCATION` as the precedent pattern).

**4. Consult `$A_SOCIETY_UPDATES_PROTOCOL`** `[Curator-determined]`

Determine whether this flow warrants a framework update report. The runtime is a new work-product layer (no `general/` changes in this flow). Curator determines classification independently.

---

## Scope

**In scope:** Creating `runtime/INVOCATION.md`; registering it in the public index; verifying/updating the a-docs guide; consulting the updates protocol.

**Out of scope:** Modifying any `general/` library content. Modifying existing role or workflow documents. Any changes to the tooling layer or coupling map (the runtime dependency map is a deferred follow-on flow).

---

## Follow-on Item Added to Next Priorities

**Runtime `synthesisRole` parameterization** — `orderWithPromptsFromFile` in `src/triggers.ts` hardcodes `'Curator'` as the synthesis role for the TERMINAL_FORWARD_PASS trigger. Correct for all current A-Society flows, but not portable to non-A-Society projects or future flows with a different synthesis role. Parameterize: derive `synthesisRole` from runtime configuration or from the workflow document, rather than hardcoding the string. Source: `15-ta-assessment.md` BP-1.

---

## Handoff

Start a new Curator session.

```
You are a Curator agent for A-Society. Read a-society/a-docs/agents.md
```

```
Next action: Registration phase — create runtime/INVOCATION.md, register it in the public index, verify the a-docs guide, consult the updates protocol
Read: a-society/a-docs/records/20260327-runtime-orchestrator-mvp/16-owner-to-curator.md
Expected response: Curator-to-Owner completion confirmation filed in the record folder
```

```yaml
handoff:
  role: Curator
  session_action: start_new
  artifact_path: a-society/a-docs/records/20260327-runtime-orchestrator-mvp/16-owner-to-curator.md
  prompt: "You are a Curator agent for A-Society. Read a-society/a-docs/agents.md"
```
