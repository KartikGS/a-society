# A-Society Framework Update Report

**Framework Version:** v3.0
**Previous Version:** v2.1
**Date:** 2026-03-11
**Report:** 2026-03-11-agents-md-reading-order

---

## Summary

Two corrections to `$INSTRUCTION_AGENTS` affecting what adopting projects were instructed to produce in their `agents.md` files:

- **[Breaking]** Required reading order corrected: the index must come second (before vision and structure), not fourth.
- **[Recommended]** Authority hierarchy now specified: project vision → project structure → role document → agents.md.

Projects initialized before this report were produced using the incorrect instruction. The reading order gap is functional — agents following the old sequence cannot resolve `$VAR` references in vision and structure documents before they appear in the required reading list.

Known adopting projects at time of publication: LLM Journey.

---

## Changes

### Change 1 — Required reading order in agents.md [Breaking]

**What changed:** `$INSTRUCTION_AGENTS` previously specified the required reading sequence as: agents.md → vision → structure → index → role file. The correct sequence is: agents.md → index → vision → structure → role file. The index must come second so that `$VAR` references in vision and structure documents can be resolved as agents read them.

**Why Breaking:** Any project initialized before this fix has an agents.md where the index is listed after vision and structure. An agent following this sequence encounters `$VAR` references in vision and structure before loading the index, making those references unresolvable in order. This is a live functional gap in the orientation sequence.

**Migration guidance:**

1. Open your project's `a-docs/agents.md`.
2. Find the Required Reading section.
3. Check whether the index (e.g., `$[PROJECT]_INDEX` or `indexes/main.md`) is listed before vision and structure.
4. If not, move the index entry to second position, immediately after agents.md itself.
5. The corrected sequence should read: agents.md → index → vision → structure → [any additional universal reads] → role file.

---

### Change 2 — Authority hierarchy specification in agents.md [Recommended]

**What changed:** `$INSTRUCTION_AGENTS` previously told implementers to "state the resolution order explicitly" without specifying what that order should be. The instruction now specifies: project vision (highest precedence) → project structure → role document → agents.md. Implementers must not invert this hierarchy.

**Why Recommended:** Existing agents.md files may be missing the hierarchy entirely, or may specify it in an incorrect order. Either case can lead to incorrect conflict resolution — e.g., a role document overriding the project vision. This does not prevent sessions from functioning, but it undermines the framework's intended authority structure.

**Migration guidance:**

1. Open your project's `a-docs/agents.md`.
2. Find the Authority and Conflict Resolution section.
3. Check whether it specifies a precedence order for document authority.
4. If absent or incorrect, update it to state: project vision takes highest precedence, followed by project structure, then the role document, then agents.md. End with: "if the conflict cannot be resolved using these sources, stop and ask the human."

---

## Delivery Note

Distribution mechanism for framework update reports is an open problem. Until resolved, Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
