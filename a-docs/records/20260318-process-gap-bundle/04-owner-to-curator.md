---
**Subject:** Process gap bundle — 4 sections, 11 changes + 1 MAINT inline
**Status:** APPROVED
**Date:** 2026-03-18

---

## Decision

APPROVED

---

## Rationale

All seven review tests applied and passed.

**1. Generalizability test** — All `general/` changes are domain-agnostic. `$GENERAL_IMPROVEMENT` correctly replaces the A-Society-specific variable reference with a domain-agnostic "if the project has a Backward Pass Orderer tool" formulation. `$INSTRUCTION_RECORDS` Phase 0 alignment describes the workflow plan as a gate artifact in framework-agnostic terms. `$INSTRUCTION_ROLES` handoff format addition is universally applicable. PASSED.

**2. Abstraction level test** — All changes are appropriately specific: concrete enough to be actionable, not so specific as to assume a domain, technology, or team structure. PASSED.

**3. Duplication test** — All changes fill documented gaps in existing content. No proposed change overlaps with existing content. The backward pass traversal section replacement in `$A_SOCIETY_IMPROVEMENT` supersedes the existing content rather than duplicating it. PASSED.

**4. Placement test** — All changes target the correct files and folders per `$A_SOCIETY_STRUCTURE`. `a-docs/` role and process changes stay in `a-docs/`; `general/` changes are in `general/`. No misplacement. PASSED.

**5. Quality test** — Draft content is specific, well-scoped, and directly implementable. An unfamiliar Curator could execute these changes from the proposal without deriving rationale independently. PASSED.

**6. Coupling test** — No `general/` format changes affect formats parsed by tooling components. The coupling map change (Item 4b) improves the taxonomy's accuracy — it does not introduce a new format dependency that tooling reads. PASSED.

**7. Manifest check** — No new `general/` files are added, removed, or renamed. No manifest update required. PASSED.

---

## Implementation Constraints

**Constraint A — `$A_SOCIETY_TOOLING_INVOCATION` variable registration (Item 4b)**

The proposal uses `$A_SOCIETY_TOOLING_INVOCATION` in changes to `$A_SOCIETY_TOOLING_COUPLING_MAP` and `$A_SOCIETY_TOOLING_ADDENDUM`. Before writing these references into any `a-docs/` document, verify whether this variable is registered in `$A_SOCIETY_INDEX`. If it is not registered, register it first — Index-Before-Reference Invariant applies. If `INVOCATION.md` does not yet exist as a file, use a path reference rather than a variable until the file and its index entry exist.

**Constraint B — `$A_SOCIETY_IMPROVEMENT` section replacement (Item 4a)**

The proposal specifies "replace the current section in full." Before replacing, verify the exact section boundaries — confirm which heading begins the section and that no content adjacent to the target section is accidentally removed. A targeted replacement is preferable to a full-section overwrite if the section boundaries are ambiguous.

**Constraint C — `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` single-pass edit**

Items 2 (handoff format) and 4c (completion report + Phase 0 gate note) both touch this file. Implement all changes to this file in a single pass to avoid partial-state reads.

**Constraint D — `$A_SOCIETY_CURATOR_ROLE` single-pass edit**

Items 1b, 1c, 1e, and 2 all touch this file. Implement all changes in a single pass.

**Constraint E — `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` single-pass edit**

Items 2 and 4b both touch this file. Implement all changes in a single pass.

**Constraint F — `$GENERAL_OWNER_ROLE` single-pass edit**

Items 1a and 2 both touch this file. Implement all changes in a single pass.

---

## Follow-Up Actions

After implementation is complete:

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL` — do not assume required or not required before checking. If the assessment concludes no report is needed, record the determination and rationale in the Curator's backward-pass findings. No separate submission artifact is required.
2. **Backward pass:** Backward pass findings are required from both roles.
3. **Version increment:** If an update report is produced, version increment is handled by the Curator as part of Phase 4 registration.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of Process gap bundle — 4 sections, 11 changes + 1 MAINT inline."

The Curator does not begin implementation until they have acknowledged in the session.
