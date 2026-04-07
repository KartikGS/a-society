---
type: owner-to-curator
date: "2026-04-07"
---

**Subject:** role-jit-extraction — Owner approval of Curator proposal
**Status:** APPROVED
**Date:** 2026-04-07

---

## Decision

APPROVED — with one implementation correction added below. All three open question resolutions are accepted. All draft content is accepted. The additional scope item identified in Pre-Proposal Verification §4 is accepted.

---

## Open Question Resolutions

**OQ-1 — TA advisory standards decomposition: one JIT document**

Accepted. `$A_SOCIETY_TA_ADVISORY_STANDARDS` as a single extracted document is correct. The rationale holds: one cohesive surface, only one integration-review-specific rule, clean verbatim extraction. Including `## a-docs/ Format Dependencies` in the same document is correct — it is advisory-execution guidance, not role identity. The trigger text ("When producing a technical advisory, component design, or integration review") is appropriately broad and covers all three work types. Variable name confirmed: `$A_SOCIETY_TA_ADVISORY_STANDARDS`.

**OQ-2 — Curator Standing Checks: extract with Implementation Practices**

Accepted. The Standing Checks are phase-specific (drafting/implementing), not universal session-start invariants. Extracting them into `$A_SOCIETY_CURATOR_IMPL_PRACTICES` alongside Implementation Practices is correct. The trigger text ("When preparing a proposal, implementing approved changes, or completing registration work") covers the full applicable surface. Variable name confirmed: `$A_SOCIETY_CURATOR_IMPL_PRACTICES`.

**OQ-3 — Developer Escalation Triggers: keep inline**

Accepted. These are role-level routing rules, not phase-specific execution detail. Consistent with the inline treatment of `## Escalate to Owner When` across all roles. Every Developer session is an implementation session; the triggers are always relevant.

---

## Additional Scope Item (Pre-Proposal Verification §4)

Accepted. The Curator correctly identified that three existing `$A_SOCIETY_AGENT_DOCS_GUIDE` entries will become inaccurate if only new-file entries are added. The accuracy updates to `$A_SOCIETY_OWNER_ROLE`, the `roles/owner/` folder entry, and `$A_SOCIETY_CURATOR_ROLE` are in scope for this implementation pass alongside the new-file entries. The TA entry accuracy refinement is also accepted.

---

## Implementation Correction

**C1 — Post-Confirmation Protocol section in `$A_SOCIETY_OWNER_ROLE`**

The proposal correctly removes `$INSTRUCTION_WORKFLOW_COMPLEXITY` from the workflow-routing bullet (line 29). However, `$INSTRUCTION_WORKFLOW_COMPLEXITY` also appears in the Post-Confirmation Protocol section (line 93):

> "Then route per `$A_SOCIETY_WORKFLOW` and `$INSTRUCTION_WORKFLOW_COMPLEXITY`. If the human explicitly asks to discuss or stay outside the workflow, the Owner may do so."

This is the same P2 violation at a second site. Remove `and $INSTRUCTION_WORKFLOW_COMPLEXITY` from this line. After the edit, the sentence should read:

> "Then route per `$A_SOCIETY_WORKFLOW`. If the human explicitly asks to discuss or stay outside the workflow, the Owner may do so."

This correction is part of the `$A_SOCIETY_OWNER_ROLE` implementation pass — no separate file or approval needed.

---

## Full Implementation Scope

The Curator is authorized to implement all items from the proposal plus correction C1:

**Files to modify:**
- `$A_SOCIETY_OWNER_ROLE` — workflow routing bullet; Post-Confirmation Protocol section (C1); project-log bullet; remove "## How the Owner Reviews an Addition" and "## Review Artifact Quality"; expand "## Just-in-Time Reads"
- `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` — add "## Just-in-Time Reads"; remove "## Advisory Standards" and "## a-docs/ Format Dependencies"
- `$A_SOCIETY_CURATOR_ROLE` — add "## Just-in-Time Reads"; remove "## Standing Checks", "## Implementation Practices", "## Current Active Work"
- `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` — add "## Just-in-Time Reads"; remove "## Implementation Discipline"
- `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` — add "## Just-in-Time Reads"; remove "## Tooling Invocation Discipline"
- `$A_SOCIETY_REQUIRED_READINGS` — remove `$A_SOCIETY_TOOLING_PROPOSAL` and `$A_SOCIETY_TOOLING_ADDENDUM` from `tooling-developer` list
- `$A_SOCIETY_INDEX` — add six new variable registrations
- `$A_SOCIETY_AGENT_DOCS_GUIDE` — six new-file entries plus accuracy updates to Owner role entry, Owner folder entry, Curator role entry, and TA role entry

**New files to create:**
- `a-society/a-docs/roles/owner/log-management.md` → `$A_SOCIETY_OWNER_LOG_MANAGEMENT`
- `a-society/a-docs/roles/owner/review-behavior.md` → `$A_SOCIETY_OWNER_REVIEW_BEHAVIOR`
- `a-society/a-docs/roles/technical-architect/advisory-standards.md` → `$A_SOCIETY_TA_ADVISORY_STANDARDS`
- `a-society/a-docs/roles/curator/implementation-practices.md` → `$A_SOCIETY_CURATOR_IMPL_PRACTICES`
- `a-society/a-docs/roles/runtime-developer/implementation-discipline.md` → `$A_SOCIETY_RUNTIME_DEV_IMPL_DISCIPLINE`
- `a-society/a-docs/roles/tooling-developer/invocation-discipline.md` → `$A_SOCIETY_TOOLING_DEV_INVOCATION`

Subfolders `a-docs/roles/technical-architect/`, `a-docs/roles/curator/`, `a-docs/roles/runtime-developer/`, and `a-docs/roles/tooling-developer/` are to be created as needed.

---

## Draft Content Approval

All six new JIT document drafts are approved as submitted. Content moves verbatim. No rewrites.

All role-file modification drafts (sections 3A–3E of the proposal) are approved as submitted, with the C1 correction added to the `$A_SOCIETY_OWNER_ROLE` pass.

The required-readings replacement for `tooling-developer` is approved as submitted.

All six index rows are approved as submitted.

All six new guide entries and four existing guide accuracy updates are approved as submitted.

---

## Implementation Notes

- Use the `Write` tool (not `Edit`) for `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` and `$A_SOCIETY_CURATOR_ROLE` — both require large section removals.
- Re-read each target file's current section before constructing `old_string` for any `Edit` call.
- After completing the required-readings edit, confirm the YAML parses correctly (no dangling entries or broken indentation).
- No `$A_SOCIETY_PUBLIC_INDEX` changes are required — none of the new variables are public-index entries.
- No framework update report is required for this flow (A-Society-internal maintenance, no `general/` content changes).
