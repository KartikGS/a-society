**Subject:** `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` — add third merge criterion to Synthesis Phase
**Status:** APPROVED
**Date:** 2026-03-28

---

## Decision

APPROVED

---

## Rationale

All seven review tests pass:

1. **Generalizability:** Any project with defined workflows has role paths; the merge assessment operates on any project's Next Priorities list regardless of domain. The third criterion (same workflow type and role path) applies equally to software, writing, and research projects. Pass.
2. **Abstraction level:** Three numbered criteria — specific and actionable, no domain or technology assumptions. Pass.
3. **Duplication:** Sync fix only. Aligns `$GENERAL_IMPROVEMENT` with `$A_SOCIETY_OWNER_ROLE` and `$INSTRUCTION_LOG`, which are already correct. No new content introduced. Pass.
4. **Placement:** The Synthesis Phase of `$GENERAL_IMPROVEMENT` is the correct home for the merge assessment protocol. Pass.
5. **Quality:** Draft content is complete, identically applicable in both files, and sufficient for an unfamiliar agent to apply the assessment correctly. Migration guidance in the update report draft is specific and actionable. Pass.
6. **Coupling test:** The change is a prose edit to a human-readable criteria clause. No tooling component parses the content of `$GENERAL_IMPROVEMENT`. Component 4 embeds a `Read:` reference to the document but has no format dependency on its prose. No tooling update is required. Pass.
7. **Manifest check:** An existing file in `general/` is modified; nothing is added, removed, or renamed. No manifest update required.

**Update report draft** (included in the proposal per the `[LIB]` requirement): structure and content approved. The migration guidance correctly directs adopting project Curators to the Synthesis Phase and identifies the exact sentence to update. Classification is appropriately left as TBD pending consultation of `$A_SOCIETY_UPDATES_PROTOCOL` at Phase 4.

---

## Implementation Constraints

None. The replacement clause and its exact location in both files are specified in the proposal. Implement as drafted.

---

## Follow-Up Actions

After implementation is complete:

1. **Update report:** The update report draft was included in the proposal and is approved in structure and content. At Phase 4 Registration, finalize the classification by consulting `$A_SOCIETY_UPDATES_PROTOCOL`, assign the version number accordingly, and publish to `$A_SOCIETY_UPDATES_DIR`. Record the classification determination and rationale.
2. **Backward pass:** Backward pass findings are required from both roles.
3. **Version increment:** Handled by the Curator as part of Phase 4 Registration, after classification is determined.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` — add third merge criterion to Synthesis Phase."

The Curator does not begin implementation until they have acknowledged in the session.
