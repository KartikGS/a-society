**Subject:** Startup Context-Read Timing and Same-Role Session Continuity — TA Phase 0 Design
**Type:** Owner → Technical Architect Brief
**Date:** 2026-04-11
**Flow:** `20260411-startup-context-and-role-continuity`

---

## Context

The human-directed trigger is the open Next Priorities item:

- `[M][ADR][RUNTIME]` **Startup context-read timing and same-role session continuity**

This flow exists because the current runtime/session contract creates two different kinds of friction during real A-Society work:

1. **Redundant startup rereads.** The runtime injects required reading at session start, but the first-turn prompt for a fresh interactive Owner session still says: "Read the project log in your context..." That causes the first turn to spend effort rereading a file the runtime has already injected.
2. **Wrong-time support-doc loads on same-role return.** The runtime persists transcript history by `flowId__nodeId`. When the same role returns later in the flow at a different node, that role gets a fresh transcript history and re-enters from its startup role contract instead of from its in-flow phase context. The result is later Owner nodes behaving like fresh Owner intake, which makes startup read cues and support-doc routing fire at the wrong time.

The current implementation surfaces behind this issue are:

- `a-society/runtime/src/injection.ts` — required reading is injected up front under a "MANDATORY CONTEXT LOADING" section
- `a-society/runtime/src/orient.ts` — fresh sessions seed the Owner with a first-turn message that explicitly tells it to read the project log in context and give status
- `a-society/runtime/src/orchestrator.ts` — forward-pass role sessions are stored and resumed by `sessionId = ${flowId}__${nodeId}`, so same-role returns at a new node start with empty transcript history
- `a-society/runtime/src/store.ts` / `a-society/runtime/src/types.ts` — current persisted session state reflects the node-keyed model
- `a-society/a-docs/roles/owner.md` — still includes startup wording that says "When the user makes a request, read `$A_SOCIETY_WORKFLOW` to route it," even though `$A_SOCIETY_WORKFLOW` is already in required reading for this role

This is not a request for ad hoc prompt polishing. It is a request for a coherent contract across:

1. what the runtime means by "required reading was injected"
2. how the first-turn prompt should use that injected context
3. how a role returning later in the same flow should regain continuity without breaking parallel-track isolation
4. which A-Society role/workflow surfaces must change so the doc layer does not keep nudging agents back into redundant rereads

One more constraint is load-bearing: the node-keyed isolation introduced in `20260402-parallel-track-orchestration` was deliberate. The runtime moved to `flowId__nodeId` sessions to keep concurrent same-role tracks from contaminating each other's transcript history. This flow must not regress that protection while restoring same-role continuity for later non-parallel returns.

Human direction narrows the scope in three important ways:

1. **Do not design same-role parallel continuity in this flow.** Treat that as a separate future design problem. This flow should optimize for the common case where a role returns later in the same flow and is the only active node for that role.
2. **The fresh-session bootstrap prompt is Owner-specific.** Do not leave Owner startup behavior behind a generic `history.length === 0` check that can accidentally apply to other roles.
3. **Task-scoped node inputs should not live in the system-prompt bundle.** The runtime-owned bundle should carry stable role/required-reading context. Active node artifacts should be delivered as user-message input appended at node entry, especially if transcript history is preserved across nodes.

---

## Files Changed Summary

| File | Expected Action | Why it is in scope |
|---|---|---|
| `a-society/runtime/src/orient.ts` | modify | Fresh-session startup prompt contract for the first turn |
| `a-society/runtime/src/orchestrator.ts` | modify | Same-role return behavior, continuity injection/derivation, and handoff-to-next-node session startup behavior |
| `a-society/runtime/src/injection.ts` | modify | Bundle framing if the runtime needs a clearer already-loaded contract or continuity payload insertion point |
| `a-society/runtime/src/store.ts` | modify | Persistence of any role-scoped continuity state or carried-forward summaries |
| `a-society/runtime/src/types.ts` | modify | Flow/session state types if the continuity model introduces new persisted or injected surfaces |
| `a-society/runtime/src/improvement.ts` | assess/modify | If task-scoped inputs move out of `buildContextBundle(...)`, improvement-phase instruction/findings injection may need the same delivery model |
| `a-society/runtime/INVOCATION.md` | modify | Operator-facing description if startup/resume behavior or continuity semantics change |
| `a-society/a-docs/roles/owner.md` | assess/modify | A-Society-local startup wording that currently encourages rereading `$A_SOCIETY_WORKFLOW` |
| `a-society/general/roles/owner.md` | assess/modify | Reusable counterpart if the startup-wording change generalizes beyond A-Society |

If the advisory concludes that additional Curator-managed surfaces must change, name them explicitly in §7 rather than leaving them implicit.

---

## Hard Constraints

1. **This is a multi-domain flow.** The runtime contract is the primary design problem, but the advisory must also name the companion framework-guidance surfaces that need Curator alignment afterward.
2. **Same-role parallel continuity is out of scope.** Do not design a multi-agent same-role parallel model in this flow. If that case exists in the future, preserving current node-keyed isolation or rejecting the case explicitly is acceptable.
3. **Fresh-session bootstrap prompt is Owner-specific.** Do not key Owner bootstrap behavior off `history.length === 0` alone.
4. **Injected required reading counts as already loaded.** The approved startup contract must not instruct the model to reread a required-reading authority file as its first move when the runtime has already injected that file into the session bundle.
5. **Task-scoped inputs do not belong in the system-prompt bundle.** The design should move active node artifacts out of `buildContextBundle(...)` and deliver them as appended user-message input at node entry. Evaluate whether the same rule should apply to improvement-phase task inputs.
6. **Same-role returns must be explicit by design.** Resolve them with a deliberate continuity mechanism for the single-active-role case. Fresh node-scoped restart may remain correct for some cases, but only if the advisory names those cases and defines how later same-role nodes regain the right phase context.
7. **Do not solve this by bloating required reading.** Phase-specific support docs remain workflow-delivered/JIT. The fix is not "load more docs at startup."
8. **Runtime prompting, continuity state, task-input delivery, and doc-side wording must align.** The advisory must name any required Curator-managed updates rather than assuming the docs will infer the new contract later.
9. **State migration must be addressed if persistence changes.** If the continuity model changes stored session/flow state, specify the versioning or migration expectation.
10. **Do not pre-specify update report classification.** That remains Curator-determined post-implementation via `$A_SOCIETY_UPDATES_PROTOCOL`.

---

## Owner Preferences for TA Evaluation

These are preferences, not non-negotiable constraints.

1. **Prefer same-role continuity that feels like "resume within the live flow" when safe.** A role returning later in one flow should not feel like a brand-new orientation session unless the design has a concrete reason.
2. **Prefer the smallest runtime-owned continuity mechanism that actually works.** If a compact carried-forward summary is cleaner than reopening full prior transcripts, say so.
3. **Prefer an explicit Owner bootstrap message.** The intended shape is: "Summarize the project log and give a brief status of where the project is at, ask what the user wants to work on, and end with a `type: prompt-human` handoff block."
4. **Prefer task inputs as conversational input, not system context.** New node artifacts should read like newly delivered work, not like part of the role's stable authority bundle.
5. **Prefer no new operator flags or env vars unless the design truly needs them.**

---

## What the Advisory Must Cover

### §1 — Success Criteria

Define what "fixed" means for this flow. At minimum, after implementation:

- a fresh Owner startup turn should not spend time rereading already injected authority files just because the startup prompt told it to
- a role returning later in the same flow should regain the right phase context without behaving like a brand-new role session
- concurrently active same-role nodes, if they exist, must remain isolated
- the A-Society doc layer must no longer contain startup wording that contradicts the approved runtime contract

### §2 — Current-State Boundary Evaluation

Analyze the current surfaces and divide the problem correctly:

- what the runtime currently injects
- what the first-turn prompt currently asks for
- what the node-keyed session model currently preserves
- what the A-Society Owner role currently says about rereading workflow/log surfaces

State which parts of the fix belong to runtime orchestration behavior and which belong to Curator-managed wording alignment.

### §3 — Startup Context Contract

Specify the runtime's contract for a genuinely new session:

- what the prompt may assume about already injected required reading
- whether the runtime should make that "already loaded" status explicit in bundle framing, prompt wording, or both
- the exact intended startup behavior for the Owner's first turn
- where the Owner-specific bootstrap trigger lives so it does not apply to non-Owner roles accidentally
- whether any reusable runtime-owned startup pattern should exist underneath the Owner-specific wording, or whether the behavior should remain explicitly Owner-only

If you recommend different startup behaviors for fresh startup vs resumed same-node sessions vs same-role-new-node returns, define those distinctions explicitly.

### §4 — Same-Role Continuity Model

This is the core design decision. Compare and resolve the candidate models:

- **Role-scoped continuity layer** — some runtime-owned continuity keyed beyond the node
- **Explicit carried-forward summary** — the runtime or prior role state injects a summary when the same role returns later
- **Alternative approach** — if you find a better model, define it precisely

For the selected model, specify:

- the continuity keying boundary
- what data is carried forward (full transcript, summary, both, or something narrower)
- when that data is produced or updated
- how new active artifacts are presented relative to prior continuity
- how same-node human pause/resume behaves under the same contract
- how the design behaves when same-role parallel activation is not being solved in this flow

### §5 — Task Input Delivery Model

Specify the boundary between stable runtime-owned context and task-scoped inputs:

- what remains in `buildContextBundle(...)`
- what moves out of the system-prompt bundle and into appended user-message input
- how active node artifacts are formatted when delivered as user input
- how the same mechanism should behave for resumed same-node sessions, same-role-new-node returns, and improvement-phase task inputs
- whether continuity summaries and active artifacts should be separate user messages or one combined node-entry message

### §6 — State, Persistence, and Resume Behavior

Specify the persistence consequences:

- which runtime state objects change
- whether existing `stateVersion: "2"` data can be read as-is, silently migrated, or must branch by version
- what survives process restart vs what can be reconstructed from artifacts/transcripts
- whether turn records or stored transcripts remain node-keyed even if continuity becomes role-scoped at another layer

### §7 — Framework-Guidance Alignment Surface

Name the exact Curator-managed surfaces that must align with the approved runtime contract. At minimum, evaluate:

- `a-society/a-docs/roles/owner.md`
- `a-society/general/roles/owner.md`

If the advisory concludes additional workflow, rationale, or role-authoring instruction surfaces must change, name them explicitly. Also state whether the wording change is A-Society-local only or whether it has a reusable counterpart worth carrying into `general/`.

### §8 — Files Changed

Provide a files-changed table naming the exact repo-relative files to modify or create, with expected action per file. If the continuity model introduces a new runtime helper/module, name it explicitly.

### §9 — Verification and Test Boundary

Specify how the Orchestration Developer should verify this work. The verification scope must name content, not only command execution.

At minimum, define automated validation expectations for:

- fresh Owner startup prompt/output behavior using the Owner-specific bootstrap contract rather than a generic empty-history trigger
- fresh Owner startup prompt/output behavior not instructing or depending on rereading the already injected log/workflow
- same-node `prompt-human` pause/resume preserving continuity
- same-role return at a later node regaining correct context without a blank restart
- active node artifacts being delivered as user input rather than part of the system-prompt bundle
- same-role parallel path remaining either explicitly unsupported or explicitly isolated, without silent transcript mixing
- operator-facing documentation staying accurate if session-start or resume semantics change

---

## Open Questions for TA Resolution

1. What is the cleanest same-role continuity mechanism for the single-active-role case: reuse prior transcript state directly, inject a summarized carry-forward layer, or combine both?
2. Where should the Owner-specific bootstrap prompt be triggered so non-Owner roles do not inherit it accidentally?
3. What is the cleanest boundary between stable system context and task-scoped user input once active node artifacts leave `buildContextBundle(...)`?
4. Which doc surfaces actually need wording changes once the runtime contract changes, and which ones should simply remain silent about rereading?
5. Does the approved model require a persisted state migration, or can continuity be derived at runtime from existing state and artifacts?

---

## Deliverable

A single TA advisory artifact filed as `03-ta-phase0-design.md` in this record folder.

The advisory must be specific enough that:

- the **Orchestration Developer** can implement the startup and continuity contract without inventing the continuity boundary, persistence model, or startup prompt rules during implementation
- the **Curator** can identify the companion A-Society guidance changes required to keep the documentation layer aligned with the runtime contract

Return to Owner when the advisory is complete.
