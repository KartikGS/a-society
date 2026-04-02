# Curator Synthesis — c7-removal-c3-extension-synthesis-hardcode

**Date:** 2026-04-02
**Task Reference:** c7-removal-c3-extension-synthesis-hardcode
**Role:** Curator
**Phase:** Synthesis

---

## Direct Maintenance Applied (`a-docs/`)

Implemented the in-scope maintenance item directly in `$A_SOCIETY_OWNER_ROLE`:

1. **Removed type surfaces require consumer enumeration.** Added a Brief-Writing Quality rule requiring Owner briefs to enumerate consuming call sites when removing or renaming a union variant, enum value, interface member, event type, or other consumed program element.
2. **Public-index variable retirement requires a reference sweep.** Added a Constraint-Writing Quality rule requiring Owner briefs / convergence decisions to sweep `a-society/` for `$VARIABLE_NAME` references before retiring a public-index variable or deleting a publicly registered artifact, and to scope any dependent `general/` files up front.

These are the A-Society-specific direct fixes for the two scoping failures surfaced in `02-owner-to-developer-brief.md` and `04-owner-convergence-decision.md`.

---

## Next Priorities Actions

Applied merge assessment against the current `$A_SOCIETY_LOG` Next Priorities list:

1. **Merged into existing item:** `Component 4 parallel-flow correctness bundle`
   - Merge basis: same target component (`backward-pass-orderer.ts`), same prompt-generation design area, same Tooling Dev workflow path.
   - Log update: added the current flow as a fresh source citation and clarified that the predicted-filename behavior produced a concrete `08-*` collision after a missing earlier artifact.

2. **Merged into existing item:** `Role guidance precision bundle`
   - Merge basis: same target file (`$GENERAL_OWNER_ROLE`), same brief-writing precision design area, same Framework Dev workflow path, compatible `[LIB]` authority.
   - Log update: expanded the bundle with two new general-layer follow-ups:
     - enumerate consuming call sites when removing a type surface
     - require `$VARIABLE_NAME` reference sweeps when retiring a public-index variable or publicly registered artifact

3. **Added new item:** `Tooling version-comparator hermeticity`
   - Merge assessment: no existing Next Priorities item targets `tooling/test/version-comparator.test.ts`, the version-comparator fixtures, or tooling-test hermeticity.
   - Routing: Tooling Dev workflow.

---

## Findings Disposition

- **Runtime positive finding (interface pre-specification):** no new action filed. This is a reusable positive pattern, but it does not surface a new structural gap beyond the Owner brief-quality guidance already strengthened in this synthesis.
- **Tool/platform terminology overlap ("artifact"):** no action filed. The collision is platform-specific to an external tool surface rather than an A-Society framework rule, so it is not a suitable framework follow-up item.

Backward pass synthesis is complete. The flow closes here.
