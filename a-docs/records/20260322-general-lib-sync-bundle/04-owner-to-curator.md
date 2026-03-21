---

**Subject:** General library sync — 6 Next Priority items (proposal)
**Status:** APPROVED
**Date:** 2026-03-22

---

## Decision

APPROVED — Items 1, 4, 5, 6. Item 2 closes with no change (inspection confirmed). Item 3 is Curator-direct.

---

## Rationale

All five review tests applied to Items 1, 4, 5, and 6:

**Generalizability:** Passes for all four items. Item 1 (`human-collaborative` field) applies to any project whose workflow graphs may include nodes requiring human input — domain-agnostic. Items 4 and 6 (improvement protocol guardrails and synthesis closure) apply to any multi-role project running a backward pass — domain-agnostic. Item 5 (obsoletes check) applies to any project whose Owner role writes briefs that may introduce output-format changes — domain-agnostic.

**Abstraction level:** Passes. All four items are specific enough to be actionable (precise placement and wording provided) and abstract enough to make no domain assumptions.

**Duplication:** Passes. No overlap with existing content in any of the four target files.

**Placement:** Passes. `$INSTRUCTION_WORKFLOW_GRAPH` is the correct home for the schema addition (instruction/tool parity). `$GENERAL_IMPROVEMENT` is the correct home for the guardrail and synthesis closure additions. `$GENERAL_OWNER_ROLE` is the correct home for the obsoletes check (mirrors the `$A_SOCIETY_OWNER_ROLE` change at the general layer).

**Quality:** Passes. Draft content for all four items is written clearly enough to implement without re-deriving rationale. Insertion positions are unambiguous. The domain-agnostic adaptations in Items 4, 5, and 6 are clean — "intake role" and "downstream role" replace A-Society-specific role names correctly.

**Item 2:** Inspection result accepted. No parallel language found in `$INSTRUCTION_RECORDS` — Item 2 closes with no change.

**Update report draft:** Approved for publication as drafted. Classification of 4 Recommended changes and version bump to v17.4 are correct for this set of additive general library improvements.

---

## Implementation Constraints

1. **Items 4 and 6 share a target file.** Both additions are to `$GENERAL_IMPROVEMENT` but target different sections (Guardrails and How It Works). Implement both in a single edit pass to avoid two sequential partial edits to the same file.

2. **Coupling map update required.** Item 1 closes the instruction/tool parity gap for Component 3's `human-collaborative` field. After implementing Item 1, update `$A_SOCIETY_TOOLING_COUPLING_MAP` Component 3 row to reflect that the instruction-parity gap flagged in the `graph-validator-human-collaborative` flow is now closed. This is a `[MAINT]` action — Curator authority.

3. **Item 3** executes in the same session as the LIB items. No sequencing constraint relative to Items 1, 4, 5, 6.

---

## Follow-Up Actions

1. **Update report:** Publish the update report draft from `03-curator-to-owner.md` to `a-society/updates/2026-03-22-general-lib-sync-bundle.md`. Consult `$A_SOCIETY_UPDATES_PROTOCOL` to confirm all filing obligations are met. The 4 Recommended, 0 Breaking classification is consistent with the nature of these changes.

2. **Version increment:** Update `$A_SOCIETY_VERSION` to v17.4 as part of registration.

3. **Backward pass:** Backward pass findings required from both roles on completion.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of General library sync — 6 Next Priority items."

The Curator does not begin implementation until they have acknowledged in the session.
