# Backward Pass Synthesis: 20260407-adocs-design-principles

**Date:** 2026-04-07
**Task Reference:** 20260407-adocs-design-principles
**Role:** Curator (Synthesis)
**Depth:** Full

---

## Findings Review

### Curator Findings (07-curator-findings.md)

**Finding 1 — brief contradiction between principle text and concrete `agents.md` instructions.** Actionable. The fix belongs in `$A_SOCIETY_OWNER_BRIEF_WRITING`: when a brief both defines a standing rule and applies it to concrete files, the Owner must compare the abstract rule text against the file-specific instructions before handoff. Implemented directly.

**Finding 2 — downstream propagation surfaces for a new standing doc were under-scoped.** Actionable. This is also a brief-writing quality gap in `$A_SOCIETY_OWNER_BRIEF_WRITING`: when a brief creates a new standing artifact, it must scope the dependent startup-context, index, guide, and scaffold surfaces explicitly rather than leaving them for proposal-stage discovery. Implemented directly.

**Finding 3 — findings template is out of sync with the new `a-docs Structure Checks` obligation.** Actionable, but outside `a-docs/`. The correct route is a Framework Dev Next Priorities item targeting `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`. No existing item targets that file or design area, so this was added as a new item in `$A_SOCIETY_LOG`.

**Finding 4 — accepted residual non-conformance is not labeled at closure.** Actionable. The direct A-Society fix belongs in `$A_SOCIETY_OWNER_CLOSURE`: when a known exception is intentionally deferred, the closure artifact must label it explicitly as an accepted residual exception. Implemented directly.

The separate deferred issue identified during the forward pass — extracting the remaining review-behavior sections from `$A_SOCIETY_OWNER_ROLE` — is already tracked by the existing "Owner review-behavior surface extraction" Next Priorities item. No duplicate routing created.

### Owner Findings (08-owner-findings.md)

**Findings 1 and 2 — missing pre-handoff consistency scan and missing downstream propagation sweep.** Endorsed and already covered by Curator Findings 1 and 2. These are the same structural gap from the Owner's side of the workflow. Implemented directly in `$A_SOCIETY_OWNER_BRIEF_WRITING`, and the reusable counterparts were merged into the existing `$GENERAL_OWNER_ROLE` precision follow-up item in `$A_SOCIETY_LOG`.

**Finding 3 — no closure-time mechanism for labeling accepted residual exceptions.** Endorsed and already covered by Curator Finding 4. Implemented directly in `$A_SOCIETY_OWNER_CLOSURE`, and the reusable counterpart was merged into the existing `$GENERAL_OWNER_ROLE` precision follow-up item.

**Finding 4 — `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS` was not updated when the new standing check family was added.** Endorsed and already covered by Curator Finding 3. Routed to a new Next Priorities item because the target is in `general/`.

---

## Actions Taken

### Direct Implementation

**`$A_SOCIETY_OWNER_BRIEF_WRITING` — principle/application consistency scan.** Added a new brief-writing rule requiring the Owner to compare abstract standing-rule text against concrete file-level instructions when both appear in the same flow, and to name any approved residual exception explicitly rather than leaving a contradiction implicit.

**`$A_SOCIETY_OWNER_BRIEF_WRITING` — downstream propagation sweep for new standing artifacts.** Added a new rule requiring briefs that create always-relevant artifacts to scope the dependent surfaces up front: required-readings/startup-context impact, relevant index registration, agent-docs guide coverage, and scaffold semantics when project shape changes.

**`$A_SOCIETY_OWNER_CLOSURE` — accepted residual exception labeling.** Added a closure-time rule requiring the Owner to name approved deferred non-conformance explicitly in the closure artifact so later reviewers can distinguish an accepted exception from an implementation miss without re-reading the decision chain.

### Next Priorities

**Merge assessment**

- **Reusable Owner-role counterparts for the two brief-writing rules and the closure-labeling rule:** merged into the existing `[S][LIB]` "Role-guidance precision follow-up: proposal-state claims and closure-time artifact precision" item in `$A_SOCIETY_LOG`. Same target file (`$GENERAL_OWNER_ROLE`), same brief-writing / closure-time precision design area, compatible authority level, and same Framework Dev workflow path.
- **Findings-template alignment for standing check families:** no existing Next Priorities item targets `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS`, findings-template reporting surfaces, or this standing-check/template-alignment design area. Added as a new item.
- **Owner review-behavior extraction follow-up:** already present as its own Next Priorities item and targets a different design area (`$A_SOCIETY_OWNER_ROLE` review-behavior extraction). No duplicate entry created.

**Log updates completed**

- Expanded the existing "Role-guidance precision follow-up" bundled item to absorb three reusable Owner-role clarifications from this backward pass.
- Added one new Next Priorities item for `$GENERAL_IMPROVEMENT_TEMPLATE_FINDINGS` alignment with standing check families.

---

## Flow Status

Backward pass complete. All actionable `a-docs/` items were implemented directly in this synthesis pass, and the out-of-`a-docs/` follow-up work was merged or written to `$A_SOCIETY_LOG`. No further handoff is required.
