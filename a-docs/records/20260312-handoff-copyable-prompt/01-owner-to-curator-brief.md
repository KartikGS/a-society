---

**Subject:** Handoff Output — copyable session-start prompt
**Status:** BRIEFED
**Date:** 2026-03-12

---

## Agreed Change

Both `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` have a Handoff Output section with three items:
1. Resume vs. start new session
2. Which session/role to switch to
3. What the receiving role needs to read

Neither requires producing a copyable session-start prompt. The Initializer does this correctly — its Phase 5 handoff produces a ready-to-use prompt ("You are an Owner agent for [Project]. Read [agents.md path].") that the user can paste directly. Every other role handoff in the framework leaves the user to figure out the prompt themselves.

Evidence: in a promo-agency test run, every session switch after initialization required the user to improvise the prompt format. Users can derive it after one improvisation, but deriving it should not be required. The Initializer set the right standard; the role templates do not yet match it.

The fix: add a fourth item to the Handoff Output numbered list in both `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` requiring the role to produce a copyable session-start prompt for the receiving role, in the form:

> "You are a [Role] agent for [Project Name]. Read [path to agents.md]."

This closes the gap between the Initializer's handoff quality and every subsequent handoff in the framework.

---

## Scope

**In scope:**
- Update Section 7 (Handoff Output) in `$INSTRUCTION_ROLES` — the canonical definition of what a Handoff Output section must contain. This is the root fix: all future role documents created from this instruction will inherit the requirement.
- Update the Handoff Output sections in the archetype templates within `$INSTRUCTION_ROLES` (Owner archetype at minimum; apply consistently across all archetypes in the file)
- Add item 4 to the Handoff Output section in `$GENERAL_OWNER_ROLE`
- Add item 4 to the Handoff Output section in `$GENERAL_CURATOR_ROLE`
- As a concurrent Curator-authority MAINT item (no proposal needed): verify the same gap exists in `$A_SOCIETY_OWNER_ROLE` and `$A_SOCIETY_CURATOR_ROLE` and apply the equivalent update to both

**Out of scope:**
- Workflow documents (`$A_SOCIETY_WORKFLOW`, general workflow instructions)
- The Initializer — it already meets this standard
- Domain role files in adopting projects (Strategist, Copywriter, etc.) — those are project-specific instantiations; the update report will inform Curators to review their own role files

---

## Likely Target

- `$INSTRUCTION_ROLES`
- `$GENERAL_OWNER_ROLE`
- `$GENERAL_CURATOR_ROLE`

(Secondary MAINT: `$A_SOCIETY_OWNER_ROLE`, `$A_SOCIETY_CURATOR_ROLE`)

---

## Open Questions for the Curator

None. The gap is identified, the target files are known, the fix is a single addition to each file's Handoff Output section. The proposal round is mechanical — draft the item 4 language and apply it.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Handoff Output — copyable session-start prompt."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
