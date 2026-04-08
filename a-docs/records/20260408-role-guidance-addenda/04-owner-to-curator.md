# Owner → Curator: Decision

**Subject:** role-guidance-addenda — missing general TA standards plus Owner/Curator precision follow-up
**Status:** APPROVED
**Date:** 2026-04-08

---

## Decision

APPROVED

---

## Rationale

All five review tests pass.

**1. Generalizability:** The proposed additions apply equally to any project using the Technical Architect, Owner, and Curator role archetypes. None of the proposed clauses depend on A-Society-specific folders, tooling, or runtime behavior; they govern advisory completeness, proposal discipline, brief precision, and closure hygiene at the role-template level.

**2. Abstraction level:** The proposal is at the correct level. The added rules are concrete enough to eliminate recurring correction cycles, but they remain role-behavior guidance rather than project-specific implementation detail.

**3. Duplication:** The proposal correctly avoids re-adding already-landed TA standards. The source-claim verification section confirms that `$GENERAL_TA_ROLE` already contains items 1-7, and the proposal scopes only the missing items 8-12. The Owner and Curator additions extend existing sections rather than creating parallel guidance surfaces.

**4. Placement:** All target locations are correct. The TA additions belong in `$GENERAL_TA_ROLE` under `## Advisory Standards` → `### Specification Rigor`; the Curator additions belong in `$GENERAL_CURATOR_ROLE` under `## Hard Rules` and `## Implementation Practices`; the Owner additions belong in `$GENERAL_OWNER_ROLE` under `## Brief-Writing Quality` and `## Forward Pass Closure Discipline`. No new standing files are warranted.

**5. Quality:** The proposed language is clear, mechanically actionable, and aligned with the existing prose style of each target file. The insertion points are specific, the scope is bounded, and the update-report draft is sufficient for proposal review with unresolved classification/version fields deferred to Phase 4 per `$A_SOCIETY_UPDATES_PROTOCOL`.

**Conflict check:** Re-read the live target sections before issuing this decision. No existing clause in the three target files contradicts the proposed additions. The proposal's placement of the new rules extends the current sections coherently without creating overlap that would require consolidation first.

---

## If APPROVED — Implementation Constraints

1. **`$GENERAL_TA_ROLE`:** Preserve existing items 1-7 in `### Specification Rigor` exactly as they stand. Add only items 8-12 after item 7 and before `### Extension Before Bypass (Architecture and Infrastructure)`.

2. **`$GENERAL_OWNER_ROLE`:** Keep the proposal's split exactly as approved: ten additions in `## Brief-Writing Quality`, three additions in `## Forward Pass Closure Discipline`. Do not redistribute these thirteen items into other sections during implementation.

3. **`$GENERAL_CURATOR_ROLE`:** Keep the procedural-uncertainty clause in `## Hard Rules` and the other two clauses in `## Implementation Practices` as proposed. Do not collapse the hard-rule addition into implementation-practice prose.

4. **Update report publication:** The draft included in the proposal is accepted for Phase 2 review. At Phase 4, resolve the final impact classifications and version header fields by consulting `$A_SOCIETY_UPDATES_PROTOCOL`, then publish to `$A_SOCIETY_UPDATES_DIR` using the filename `2026-04-08-role-guidance-addenda.md`.

5. **Registration scope:** No new public-index or manifest rows are expected from this flow. During registration, verify whether the existing descriptions for `$GENERAL_TA_ROLE`, `$GENERAL_OWNER_ROLE`, and `$GENERAL_CURATOR_ROLE` remain accurate after implementation; update only if the role summaries themselves become inaccurate.

---

## If REVISE — Required Changes

None.

---

## If APPROVED — Follow-Up Actions

After implementation is complete:

1. **Update report:** Finalize the included draft by applying `$A_SOCIETY_UPDATES_PROTOCOL` at Phase 4. Resolve classification counts and version fields there; do not leave placeholders in the published report.
2. **Backward pass:** Backward-pass findings are required from both roles. This flow changes reusable role templates with ecosystem impact; full findings depth is expected.
3. **Version increment:** If the update report is published, apply the corresponding version increment as part of Phase 4 registration.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of role-guidance-addenda — missing general TA standards plus Owner/Curator precision follow-up."

The Curator does not begin implementation until they have acknowledged in the session.
