**Subject:** Startup Context-Read Timing and Same-Role Session Continuity — Integration Approved, Curator Proposal Brief
**Type:** Owner → Curator
**Status:** BRIEFED
**Date:** 2026-04-11
**Flow:** `20260411-startup-context-and-role-continuity`

---

## Integration Gate

The runtime integration gate is approved.

I reviewed the resubmission record [`08-orchestration-developer-corrections-confirmed.md`](a-society/a-docs/records/20260411-startup-context-and-role-continuity/08-orchestration-developer-corrections-confirmed.md), the second TA integration review [`09-ta-integration-review-2.md`](a-society/a-docs/records/20260411-startup-context-and-role-continuity/09-ta-integration-review-2.md), and the live runtime source directly.

The previously blocking runtime issues are resolved in live source:

1. the improvement path now derives role keys and improvement-doc paths from `flowRun.projectNamespace` plus the workspace root
2. improvement initialization now preserves `stateVersion = '3'`
3. repeated-role verification now reaches the orchestrator seam for later same-role entry, same-role parallel isolation, and ledger updates

The TA's remaining note is accepted as a non-blocking verification gap, not a reason to hold this flow open:

- `a-society/runtime/test/observability.test.ts` still uses a fixture where `projectNamespace === path.basename(projectRoot)`, so that one test would not distinguish a future regression back to basename-derived namespace logic

Do **not** reopen that gap during this Curator phase. It is a future runtime-test cleanup item, not a guidance-registration blocker.

---

## Curator Proposal Scope

This phase is **proposal-first**. Prepare one Curator proposal covering the downstream guidance changes this flow intentionally deferred after runtime implementation.

Do **not** implement the wording changes yet, even for the A-Society-local file. The local and reusable wording should be reviewed together before anything is written.

### Required Change 1 — A-Society Owner role wording

**File:** `a-society/a-docs/roles/owner.md`

Remove the explicit reread cue:

`When the user makes a request, read $A_SOCIETY_WORKFLOW to route it.`

Replace it with wording that preserves the Owner's workflow-routing authority without telling the Owner to default-reread a workflow document that the runtime already injects at startup for runtime-managed sessions.

Approved intent:

- the Owner still routes via `$A_SOCIETY_WORKFLOW` by default
- the role file should not tell the Owner to reread that file on every request
- the wording must stay compatible with non-runtime/manual use as well

### Required Change 2 — Reusable runtime contract rule for required readings

**File:** `a-society/general/instructions/roles/required-readings.md`

Add the reusable rule approved in Phase 0:

1. in runtime-managed sessions, required-reading files injected at startup count as already loaded
2. role docs and runtime-owned startup prompts must not instruct default rereads of those injected required-reading files
3. humans or agents doing manual orientation may still follow the ordered reading sequence in `required-readings.yaml`

Preserve the current schema and maintenance guidance. This flow is clarifying the runtime contract around startup-injected reading, not redesigning `required-readings.yaml`.

### Assessed and currently out of scope unless you find a concrete contradiction

- `a-society/general/roles/owner.md`
  This file was already assessed in Phase 0 as compatible with the approved runtime contract. Do not broaden the proposal into a general Owner role rewrite unless live source now shows a concrete contradiction that the TA assessment missed.

- Existing index rows
  No new index entries are expected from this flow. Assess the current descriptions for `$A_SOCIETY_OWNER_ROLE` and `$INSTRUCTION_REQUIRED_READINGS`, and update them only if the changed wording would make the current descriptions materially misleading.

---

## Update Report Assessment

Consult `$A_SOCIETY_UPDATES_PROTOCOL`.

Because this flow changes an existing `general/` instruction, the proposal must include one of:

1. a draft update report recommendation with classification rationale, or
2. a clear no-report rationale tied directly to the protocol

Do not assume the answer either way. Derive it from the protocol.

---

## Proposal Deliverable

Return to Owner with `11-curator-to-owner.md` containing:

1. the exact files to modify
2. the proposed wording change plan for each file
3. any needed index or registration updates, or an explicit statement that none are required
4. the update-report assessment and rationale
5. any scoped out-of-scope note needed to keep this proposal from drifting into same-role parallelism or further runtime redesign

---

## Constraints

1. Do not reopen the accepted runtime-test verification gap from `09-ta-integration-review-2.md`.
2. Do not expand this flow into same-role parallel continuity design.
3. Do not modify runtime source or runtime tests in this Curator phase.
4. Keep the wording aligned to the shipped runtime contract:
   startup-injected required reading is already loaded in runtime-managed sessions;
   phase-specific support docs remain workflow-delivered/JIT rather than startup-loaded by default.

---

## Curator Confirmation Required

State in the session:

> Briefing acknowledged. Beginning proposal for Startup Context-Read Timing and Same-Role Session Continuity guidance alignment.

Then proceed to the proposal artifact.

```handoff
role: Curator
artifact_path: a-society/a-docs/records/20260411-startup-context-and-role-continuity/10-owner-to-curator-brief.md
```
