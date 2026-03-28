# Backward Pass Synthesis: Curator — 20260328-general-doc-bundle

**Date:** 2026-03-28
**Task Reference:** 20260328-general-doc-bundle
**Role:** Curator (Synthesis)
**Depth:** Full

---

## Findings Review

### Curator Findings (06-curator-findings.md)

**Finding 1 — proposal-stage rendered-content matching gap.** Actionable. The missing check belongs in the Curator role guidance. The A-Society-specific counterpart is within `a-docs/` and can be implemented directly in `$A_SOCIETY_CURATOR_ROLE`; the reusable counterpart for `$GENERAL_CURATOR_ROLE` belongs in Next Priorities.

**Finding 2 — non-adjacent prose-insertion anchors.** Actionable in part. The root issue is Owner guidance precision. The A-Society-specific counterpart belongs directly in `$A_SOCIETY_OWNER_ROLE`; the general counterpart for `$GENERAL_OWNER_ROLE` belongs in Next Priorities.

**Finding 3 — decision constraint #4 scope wording.** Actionable at the standards level, not on the historical artifact. The specific decision artifact remains immutable; the fix is to add Owner-side constraint-writing guidance so future registration constraints scope by file set rather than parent directory.

### Owner Findings (07-owner-findings.md)

**Finding 1 — no constraint-writing quality standard.** Actionable. Confirms the Curator's Finding 3 and identifies the correct A-Society maintenance target: `$A_SOCIETY_OWNER_ROLE`. The reusable counterpart belongs in Next Priorities for `$GENERAL_OWNER_ROLE`.

**Finding 2 — immediately-adjacent requirement implicit, not stated.** Actionable. Confirms the Curator's Finding 2 from the receiving end. The A-Society fix is to tighten the prose-insertion wording in `$A_SOCIETY_OWNER_ROLE`; the general counterpart belongs in the same future flow as Finding 1.

**Finding 3 — Component 7 invocation undocumented.** Already tracked. `$A_SOCIETY_LOG` already contains a Next Priorities item for adding Component 7 to `$A_SOCIETY_TOOLING_INVOCATION`, so no new item is filed from this synthesis.

---

## Actions Taken

### Direct Implementation

**`$A_SOCIETY_CURATOR_ROLE` — proposal-stage rendered-content matching added.** Added an Implementation Practices rule requiring the Curator to re-read adjacent exemplars in the target file and match their rendering pattern when proposing formatted blocks.

**`$A_SOCIETY_OWNER_ROLE` — prose-insertion precision tightened.** Updated Brief-Writing Quality so prose insertions must use immediately adjacent anchors on each side, not nearby landmarks elsewhere in the section.

**`$A_SOCIETY_OWNER_ROLE` — Constraint-Writing Quality added.** Added a new section requiring review constraints and registration checks to be scoped by newly created or modified files rather than parent directories.

### Next Priorities

**Merge assessment**

- **Role guidance precision bundle (`$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE`).** No existing Next Priorities item targets these files or this role-guidance precision area. Compatible authority level and workflow type exist, but criterion (1) does not match any current item. Added as a new item.
- **Component 7 invocation gap (`$A_SOCIETY_TOOLING_INVOCATION`).** Already tracked in `$A_SOCIETY_LOG` under the existing Next Priorities item for adding Component 7 to `$A_SOCIETY_TOOLING_INVOCATION`. No new item filed.

**Log updates completed**

- Updated `$A_SOCIETY_LOG` Recent Focus entry to mark the backward pass complete and record the A-Society role-doc maintenance clarifications implemented during synthesis.
- Added one new Next Priorities item for the general-library role-guidance precision bundle.

---

## Flow Status

Backward pass complete. Flow closed.
