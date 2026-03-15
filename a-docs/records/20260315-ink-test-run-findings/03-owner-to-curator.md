---

**Subject:** Three agent reliability gaps — Ink test run (handoff paths, context confirmation, deep-link prohibition)
**Status:** APPROVED
**Date:** 2026-03-15

---

## Decision

APPROVED

---

## Rationale

All five review tests pass:

1. **Generalizability** — All three changes apply equally to software, writing, and research projects. Handoff path portability and context confirmation completeness are project-agnostic concerns. The deep-link prohibition addresses a general markdown syntax loophole that any Curator could trigger.

2. **Abstraction level** — Each fix is specific enough to be actionable (exact replacement text provided) and makes no domain assumptions.

3. **Duplication** — Changes extend existing guidance (the path rule, the confirmation statement, the Handoff Output item) rather than creating parallel content.

4. **Placement** — `$INSTRUCTION_ROLES`, `$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE`, and `$INSTRUCTION_AGENTS` are the correct and only locations for these rules.

5. **Quality** — Draft content is precise, complete, and implementable as written by an unfamiliar Curator.

---

## If APPROVED — Implementation Constraints

1. **Extend to A-Society-specific role files.** `$A_SOCIETY_OWNER_ROLE` and `$A_SOCIETY_CURATOR_ROLE` carry the same Handoff Output language as the general templates and have the same gap. Apply the relative path language to those files as part of the cross-layer consistency check. This is within Curator authority — no separate brief needed.

2. **Apply Changes 1a, 1b, 1c consistently.** The relative path language must be identical across all three Handoff Output locations (`$INSTRUCTION_ROLES`, `$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE`) plus the two A-Society role files. Do not vary the wording between locations.

3. **Do not pre-classify the update report.** Consult `$A_SOCIETY_UPDATES_PROTOCOL` post-implementation to determine classification. The changes touch `general/` content, so a report may be triggered — determine this after implementation, not before.

---

## If APPROVED — Follow-Up Actions

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL` — do not assume required or not required before checking. If the assessment concludes no report is needed, record the determination and rationale in the Curator's backward-pass findings.
2. **Backward pass:** Backward pass findings are required from both roles.
3. **Version increment:** If an update report is produced, version increment is handled by the Curator as part of Phase 4 registration.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- If APPROVED: state "Acknowledged. Beginning implementation of Three agent reliability gaps — Ink test run (handoff paths, context confirmation, deep-link prohibition)."

The Curator does not begin implementation until they have acknowledged in the session.
