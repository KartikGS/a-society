# Owner → Runtime Developer: Brief

**Subject:** session-routing-removal — Track B: remove session_action and prompt from HandoffBlock and HandoffInterpreter
**Status:** BRIEFED
**Date:** 2026-03-31

---

## Context

This is Track B of a multi-domain flow. Track A (Curator, artifact 02) removes `session_action` and `prompt` from all documentation. This track removes those same fields from the runtime's type definition and validation logic. Both tracks are independent and can run in parallel; both must complete before the Owner closes the flow.

The direction is human-decided: the runtime determines session routing programmatically via `flowId + roleKey` session identity. The `session_action` and `prompt` fields in agent handoff output are therefore redundant — the runtime does not use them for routing and should not require agents to produce them.

---

## Agreed Change

**Files Changed:**

| Target | Action |
|---|---|
| `a-society/runtime/src/handoff.ts` | modify — remove session_action and prompt from HandoffBlock; remove all validation of these fields from HandoffInterpreter.parse() |

**Implementation instructions:**

In `handoff.ts`:

1. **`HandoffBlock` interface** — remove `session_action: 'resume' | 'start_new'` and `prompt: string | null`. The revised interface contains only `role: string` and `artifact_path: string | null`.

2. **`HandoffInterpreter.parse()` destructuring** — on the line `const { role, session_action, artifact_path, prompt } = parsed.handoff;`, remove `session_action` and `prompt` from the destructure.

3. **Validation block** — remove all lines that validate `session_action` and `prompt`: the `typeof session_action !== 'string'` check, the `isNew`/`isResume` variable declarations, the `!isNew && !isResume` check, the `isNew && prompt === null` check, and the `isResume && prompt !== null` check.

4. **Return value** — remove `session_action` and `prompt` from the returned object. The return statement should produce only `role` and `artifact_path`.

After making changes, grep for any remaining references to `session_action` or `prompt` across `runtime/src/` to confirm no consumers were missed.

---

## Scope

**In scope:** `runtime/src/handoff.ts` — type definition and validation logic only.

**Out of scope:** All other runtime source files. The orchestrator (`orchestrator.ts`) already derives session routing from `flowId + roleKey` and does not use `session_action` — no change needed there. Do not touch `types.ts`, `store.ts`, or any other file unless the grep reveals an unexpected reference.

---

## Completion Artifact

When implementation is complete, file `06b-runtime-developer-to-owner.md` in this record folder (`a-society/a-docs/records/20260331-session-routing-removal/`). This is a Track B convergence artifact. The Owner closes the flow after both `06a` (Curator) and `06b` (this track) are filed.

The completion artifact should confirm: fields removed from the type, validation removed from the parser, grep check passed.

---

## No Proposal Required

This brief authorizes implementation directly. No proposal artifact is required before implementation begins. The schema decision is Owner-made and human-directed; there is no design ambiguity for the Runtime Developer to resolve.
