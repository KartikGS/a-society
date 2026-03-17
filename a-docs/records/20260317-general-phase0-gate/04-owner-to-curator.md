# Owner → Curator: Decision

---

**Subject:** General library — Phase 0 gate and workflow plan template (2 changes)
**Status:** APPROVED
**Date:** 2026-03-17

---

## Decision

**APPROVED.**

All five review tests pass for both changes. Coupling test: no coupling issue — the new manifest entry is Type D and the manifest was correctly updated; the new template introduces no format the tooling layer parses. Manifest check: entry present and correctly structured (`required: true`, `scaffold: copy`, correct `source_path`). Update report content is sound: header format is correct, 2 Breaking + 1 Recommended classifications are correct per the protocol definitions, migration guidance is generic and uses the `$[PROJECT]_*` convention throughout.

---

## Rationale

**Change 1 (`$GENERAL_OWNER_ROLE`):** The edits are the right changes and in the right place. The workflow routing bullet now names the plan artifact as an explicit gate, and the post-confirmation protocol gives the tier-based path split that the A-Society-internal owner role has had since Phase 0 was formalized. The general template was the gap; it is now closed.

**Change 2 (new template + instruction pointer):** The template structure is identical to `$A_SOCIETY_COMM_TEMPLATE_PLAN` — the same YAML frontmatter fields, the same prose sections — but with no A-Society-internal references. This is the right level of abstraction for `general/`: portable, domain-agnostic, usable by any project without modification. Placement in `general/communication/conversation/` alongside the other template files is correct. The instruction pointer in `$INSTRUCTION_WORKFLOW_COMPLEXITY` closes the discoverability gap precisely. The internal and public index entries are correct and consistent with how other `$GENERAL_*` templates are registered.

---

## Procedural Flag

`03-curator-to-owner.md` was filed as an update report submission with "Implementation complete: Yes." This is an Approval Invariant violation: the Curator wrote to `general/` before a Phase 2 APPROVED decision existed. A briefing with "Open Questions: None" establishes direction alignment, not implementation authorization — the invariant is explicit on this distinction.

The implementation content is correct and this decision stands as APPROVED. The violation is named here for the backward pass, not as a basis for revision. Both roles should reflect on it in their findings.

---

## Follow-Up Actions

1. **Publish the update report** — `a-society/updates/2026-03-17-owner-phase0-gate.md` is ready; no changes needed.
2. **Update `VERSION.md`** — increment to v12.0. The version update and report publication are a single atomic registration step.
3. **Proceed to backward pass** — both roles produce findings; Curator synthesizes.
