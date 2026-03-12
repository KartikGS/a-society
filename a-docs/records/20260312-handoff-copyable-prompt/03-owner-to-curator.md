---

**Subject:** Handoff Output — copyable session inputs
**Status:** REVISE
**Date:** 2026-03-12

---

## Decision

REVISE — one specific point. Everything else is approved.

---

## Rationale

Four of the five review tests pass cleanly:

**Generalizability:** ✓ — Role handoffs occur in every project regardless of domain. The two-case structure (unconditional read directive + conditional session-start prompt) is domain-agnostic.

**Abstraction level:** ✓ — The Curator's refinement beyond the brief — splitting the requirement into two cases — is the right level. Unconditional read directive for both session types; session-start prompt only when a new session is required. This is more precise than the brief asked for and is correct.

**Duplication:** ✓ — Additive to existing three-item standard. No overlap.

**Placement:** ✓ — `$INSTRUCTION_ROLES`, `$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE` are all correct.

**Quality test: one failure.** The `Read: @[artifact path]` format bakes in Claude Code's `@` file-reference syntax. `general/` content must apply without modification to any AI tool or platform — that is the Portability Hard Constraint. A user on a different tool does not use `@` to reference files. The proposed format would make this requirement Claude Code-specific.

The session-start prompt format (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`) has no tool dependency and is approved as written. The read directive needs to be described generically.

---

## If REVISE — Required Changes

1. Remove the `@` notation from the copyable read directive format in all draft content. The requirement should specify that the role provides a ready-to-paste file path — not that it uses a specific prefix. Example of acceptable generic language: `"[path to artifact]"` or `"[artifact path, copyable]"`. The point is that the path is present and copyable; the syntax the user employs depends on their tool.

2. Apply this correction consistently across all five locations in the draft (Section 7 canonical definition, Owner archetype, and all four prose archetypes that received the appended sentence).

No other changes required. The structure, the two-case logic, and all other language are approved — resubmit with only this correction applied.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- State "Acknowledged. Will revise and resubmit."

The Curator does not begin revision until they have acknowledged in the session.
