**Subject:** Startup Context-Read Timing and Same-Role Session Continuity Guidance Alignment — Curator Proposal Decision
**Status:** APPROVED
**Type:** Owner → Curator
**Date:** 2026-04-11
**Flow:** `20260411-startup-context-and-role-continuity`

---

## Decision

**APPROVED.** The proposal is correctly scoped and can proceed to implementation, with the implementation constraints below.

The core shape is right:

- the A-Society-local wording fix is correctly limited to `a-society/a-docs/roles/owner.md`
- the reusable rule is correctly placed in `a-society/general/instructions/roles/required-readings.md`
- `a-society/general/roles/owner.md` remains out of scope
- same-role parallelism and further runtime redesign remain out of scope

The update-report trigger is also correctly identified: this flow changes an existing `general/` instruction in a way that affects initialized projects' guidance, and the new runtime-managed-session rule is not a typo-level clarification.

---

## Implementation Constraints

### Constraint 1 — Correct the registration statement

The proposal says:

> No index or registration updates are required.

That is too broad. The correct reading is:

- **No index-row changes are expected** unless the Curator finds actual description drift during implementation.
- **Registration work is still required** because the proposal also correctly concludes that an update report is required.

Phase 4 must therefore include:

1. publishing the update report in `a-society/updates/`
2. updating `a-society/VERSION.md` in the same atomic step, per `$A_SOCIETY_UPDATES_PROTOCOL`

Do not carry forward the "no registration updates" wording into the implementation artifact.

### Constraint 2 — Keep migration guidance scoped to runtime-managed sessions

The new rule is specifically about **runtime-managed sessions** where required-reading files are startup-injected.

So in the update report, do **not** frame the migration guidance as a blanket audit of all role docs in all projects. The guidance should say, in substance:

- if a project uses runtime-managed sessions, review role docs and runtime-owned startup prompts for default reread cues targeting files already injected from `required-readings.yaml`
- preserve the underlying authority/routing rule while removing the redundant reread instruction
- manual orientation remains allowed to follow the ordered reading sequence in `required-readings.yaml`

That keeps the migration guidance precise and avoids overstating the impact for projects not using runtime-managed sessions.

### Constraint 3 — Preserve the manual-orientation rule explicitly

The proposed `required-readings.md` change is approved in direction, but the implementation must preserve all three parts of the contract together:

1. runtime-injected required reading counts as already loaded in runtime-managed sessions
2. role docs and runtime-owned startup prompts must not instruct default rereads of those injected files
3. humans or agents doing manual orientation may still follow the ordered reading sequence in `required-readings.yaml`

If you retitle the section to `Context-Read Timing Rules`, that is acceptable. Just do not let the runtime rule crowd out the manual-orientation rule or the anti-duplication warning.

### Constraint 4 — Keep the Owner-role edit minimal

In `a-society/a-docs/roles/owner.md`, limit the change to removing the explicit reread cue while preserving the Owner's workflow-routing authority.

Do not broaden this into a wider rewrite of the Owner role wording in the same pass.

---

## Registration Note

The update report classification is approved as **Breaking**.

At implementation time, resolve the actual `Framework Version` / `Previous Version` fields from the live `a-society/VERSION.md` at the moment of publication. During this review, the current version is `v33.0`, but follow the protocol's publication-time rule rather than hardcoding from this approval artifact.

No new index entries are expected from this flow. If the Curator finds that the existing descriptions for `$A_SOCIETY_OWNER_ROLE` or `$INSTRUCTION_REQUIRED_READINGS` become materially misleading after the final wording lands, update them and call that out explicitly in the implementation report. Otherwise, leave them unchanged.

---

## Proceed

Implement the approved guidance changes and return with `13-curator-to-owner.md` covering:

1. implementation status
2. files changed
3. update-report publication condition and status
4. any index-row decision, including an explicit "none required" if unchanged

```handoff
role: Curator
artifact_path: a-society/a-docs/records/20260411-startup-context-and-role-continuity/12-owner-to-curator.md
```
