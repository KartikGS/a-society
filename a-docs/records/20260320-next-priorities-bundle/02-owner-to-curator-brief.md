# Owner → Curator: Briefing

**Subject:** Next Priorities Bundle (Priorities 2-6)
**Status:** BRIEFED
**Date:** 2026-03-20

---

## Agreed Change

**1. `$A_SOCIETY_UPDATES_TEMPLATE` version field annotations**
`[Curator authority — implement directly]`
The template includes trailing text annotations on the two version field lines (`*(A-Society's version...)*`). The protocol prohibits trailing text on these lines for programmatic parsing. Remove both annotations from `$A_SOCIETY_UPDATES_TEMPLATE`.

**2. Variable pre-registration check in brief template**
`[Requires Owner approval]`
Add a standing pre-send prompt to `$A_SOCIETY_COMM_TEMPLATE_BRIEF` requiring the Owner to verify that every variable referenced in proposed content is already registered in the relevant index.

**3. Per-file summary + edit-mode fields in brief template**
`[Requires Owner approval]`
To streamline implementation of multi-file bundles:
- Add a "Files Changed" per-file summary table to `$A_SOCIETY_COMM_TEMPLATE_BRIEF`.
- Add an explicit edit-mode field (e.g., `[additive]` / `[replace]` / `[insert before X]`) to the change items section in the same template.

**4. Function-based backward-pass artifact references**
`[Requires Owner approval]`
Sequence-number references to backward-pass artifacts in Owner handoffs are provisional when post-implementation submissions intervene. Replace fixed sequence-number references with function-based references ("backward-pass findings after all submissions resolved"). 

**5. `$A_SOCIETY_IMPROVEMENT` Component 4 mandate bundle**
`[Requires Owner approval]`
Update the Component 4 mandate section in `$A_SOCIETY_IMPROVEMENT`:
- The referent `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` is not registered in `$A_SOCIETY_INDEX` — fix this documentation mapping gap.
- The interface for Component 4 has been realigned in recent tooling work (adding `generateTriggerPrompts` and `orderWithPromptsFromFile`). Update the mandate to reflect this new interface rather than prohibiting prompt generation.

---

## Scope

**In scope:** 
- Template modifications for updates and briefings.
- Documentation rules in Owner role, records conventions, and general instructions.
- Component 4 documentation updates matching the realigned TypeScript tool interface.

**Out of scope:** 
- Any modifications to the `tooling/` TypeScript source files.
- Modifying previously archived record logs or templates.

---

## Likely Target

- `$A_SOCIETY_UPDATES_TEMPLATE`
- `$A_SOCIETY_COMM_TEMPLATE_BRIEF`
- `$A_SOCIETY_OWNER_ROLE`
- `$A_SOCIETY_RECORDS`
- `$A_SOCIETY_IMPROVEMENT`
- Potentially: `$GENERAL_OWNER_ROLE`, `$INSTRUCTION_ROLES`, `$INSTRUCTION_RECORDS`

---

## Open Questions for the Curator

- Does `$GENERAL_OWNER_ROLE`'s Brief-Writing Quality section require a corresponding update to reflect the "Files Changed" table and edit-mode fields additions made to `$A_SOCIETY_COMM_TEMPLATE_BRIEF`?
- Do `$INSTRUCTION_ROLES` and `$INSTRUCTION_RECORDS` require the same function-based backward-pass artifact reference rule being introduced to `$A_SOCIETY_RECORDS`?

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Next Priorities Bundle (Priorities 2-6)."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
