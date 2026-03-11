# Owner → Curator: Decision

**Subject:** Initializer quality hardening — shell prohibition, Phase 2 scope, Phase 4 disclosure, and agents.md instruction fixes
**Status:** APPROVED
**Date:** 2026-03-11

---

## Decision

APPROVED.

---

## Rationale

All five review tests pass across both target files.

For `$A_SOCIETY_INITIALIZER_ROLE` changes (Gaps 1–3): generalizability test does not apply (not a `general/` artifact). The remaining tests pass. Each change is precisely targeted, non-duplicative, and placed correctly. Change 2 (Phase 2 scope boundary) is particularly well-drafted — the explicit wrong/right examples make the distinction unambiguous for agents executing the protocol.

For `$INSTRUCTION_AGENTS` changes (Gap 4):
- **Generalizability:** Both the reading order fix (index before vision) and the authority hierarchy (vision → structure → role → agents.md) apply equally to any project type — software, writing, research, or other. Pass.
- **Abstraction level:** The changes are specific enough to be actionable and general enough to apply without domain assumptions. Pass.
- **Duplication:** No overlap. These add guidance the instruction currently lacks.
- **Placement:** `$INSTRUCTION_AGENTS` is the correct and only home for these corrections.
- **Quality:** The revised language in both Step 4 and the "What Every agents.md Must Contain" section is clear and directly corrects the gap. The Curator's note to leave the examples section unchanged is correct — the examples are illustrative reading lists, not templates for the mandatory structure, and do not need mechanical correction.

---

## If APPROVED — Implementation Constraints

- For `$INSTRUCTION_AGENTS`: apply changes in both the "What Every agents.md Must Contain" section and the "How to Write One" section for each affected step. The Curator has correctly identified both locations for each change — both must be updated, not just one.
- Do not modify the examples in "Examples Across Project Types." The Curator correctly identified these as out of scope.

---

## If APPROVED — Follow-Up Actions

After implementation is complete:

1. **Update report:** The `$INSTRUCTION_AGENTS` changes are in `general/` and affect what adopting projects already have in their `a-docs/`. Existing projects initialized before this fix likely have incorrect reading orders and authority hierarchies in their `agents.md` files. Assess this against `$A_SOCIETY_UPDATES_PROTOCOL` — my read is that this qualifies as Recommended (not Breaking, since the incorrect order does not prevent functionality, but it is worth correcting). Verify before concluding. The `$A_SOCIETY_INITIALIZER_ROLE` changes are a separate matter — assess them independently.
2. **Backward pass:** Required from both roles.
3. **Version increment:** Handle per Phase 4 registration if an update report is produced.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- If APPROVED: state "Acknowledged. Beginning implementation of Initializer quality hardening — shell prohibition, Phase 2 scope, Phase 4 disclosure, and agents.md instruction fixes."

The Curator does not begin implementation until they have acknowledged in the session.
