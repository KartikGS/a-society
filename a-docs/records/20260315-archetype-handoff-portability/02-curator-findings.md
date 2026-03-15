---

**Subject:** Archetype template Handoff Output drift — path portability missing from all six archetypes
**Type:** Curator Backward-Pass Findings
**Date:** 2026-03-15

---

## Implementation

All six archetype templates in `$INSTRUCTION_ROLES` updated. Changes applied:

- **Archetype 1 (Owner):** Item 4 extended with path portability sentence.
- **Archetypes 2–6 (Analyst, Implementer, Reviewer, Coordinator, Curator):** All five inline copyable-inputs sentences updated via `replace_all` — identical text, five occurrences, all corrected in one operation.

Wording is consistent with v11.0 language across all six archetypes and with Section 7 (already updated in v11.0).

---

## Update Report Assessment

**Determination: No standalone report required.**

This change is additive to `$INSTRUCTION_ROLES` — an instruction document, not a directly-instantiated template. Existing adopting projects' role documents were created from `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` (already corrected in v11.0), not from the archetype templates directly. This change affects future role creation only — agents building new role documents from archetypes will now get the correct path portability language.

Per `$A_SOCIETY_UPDATES_PROTOCOL`: additive changes to `general/` that adopting projects may optionally adopt are not standalone triggers — they are included as **Optional** entries in the next qualifying report. This change meets that criterion. No version increment.

**Recommendation:** Include as an Optional entry (completing the `$INSTRUCTION_ROLES` consistency work from v11.0) in the next qualifying framework update report.

---

## Flow Assessment

**Brief quality:** Fully specified, with exact current and replacement text for all six archetypes. Direct implementation was appropriate — no judgment calls or proposal round required.

**Implementation:** Clean. `replace_all: true` applied correctly to the five identical Archetype 2–6 instances; Archetype 1 handled separately due to its different (numbered-list) structure.

**No additional gaps or drift identified** within this flow's scope.
