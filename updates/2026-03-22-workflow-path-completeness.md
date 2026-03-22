# A-Society Framework Update — 2026-03-22

**Framework Version:** v20.0
**Previous Version:** v19.1

## Summary

The general Owner role template's Post-Confirmation Protocol has been extended with two mandatory obligations: (1) creating `workflow.md` at Phase 0 alongside `01-owner-workflow-plan.md` for projects using backward pass tooling, and (2) including predictable post-implementation steps (e.g., update report publication, version increment) explicitly in the `workflow.md` path at intake. Projects that instantiated the Owner role before this update are missing both obligations; their `workflow.md` paths may not reflect the full flow that actually ran, causing backward pass traversal order to be incomplete.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 2 | Gaps in your current Owner role — Curator must review |
| Recommended | 0 | — |
| Optional | 0 | — |

---

## Changes

### workflow.md Phase 0 creation obligation added to Owner role template

**Impact:** Breaking
**Affected artifacts:** [`general/roles/owner.md`]
**What changed:** The Post-Confirmation Protocol record-folder bullet now instructs the Owner to also create `workflow.md` alongside `01-owner-workflow-plan.md` at Phase 0, conditional on the project using records with backward pass tooling. This was not present in the prior template.
**Why:** Projects using backward pass tooling require `workflow.md` to exist in the record folder before the backward pass runs. Without an explicit Phase 0 instruction in the Owner role, the file was created inconsistently or treated as a post-intake artifact rather than a co-output of intake.
**Migration guidance:** Inspect your project's Owner role (`$[PROJECT]_OWNER_ROLE`) Post-Confirmation Protocol section. If the record-folder bullet does not include an instruction to create `workflow.md` at Phase 0 when the project uses backward pass tooling, add: "when the project uses records with backward pass tooling, also create `workflow.md` alongside `01-owner-workflow-plan.md` at this step — it is a required Phase 0 co-output, not a post-intake artifact." If your project does not use backward pass tooling, this change does not apply.

---

### Path-completeness obligation for predictable post-implementation steps added to Owner role template

**Impact:** Breaking
**Affected artifacts:** [`general/roles/owner.md`]
**What changed:** A new standalone bullet has been added to the Post-Confirmation Protocol instructing the Owner to include predictable post-implementation steps (e.g., publishing an update report, incrementing a version record) explicitly in `workflow.md` at intake. These steps were previously left as implied appendages.
**Why:** Predictable post-implementation steps are knowable at intake time. Leaving them out of `workflow.md` produces paths that do not reflect the full flow that ran, causing backward pass traversal order to be incomplete or incorrect.
**Migration guidance:** Inspect your project's Owner role (`$[PROJECT]_OWNER_ROLE`) Post-Confirmation Protocol section. If no bullet instructs the Owner to include predictable post-implementation steps in `workflow.md` at intake, add: "When the flow has a known post-implementation publication or registration step (e.g., publishing an update report, incrementing a version record), include that step in the path at intake. These steps are predictable at the time the plan is written and must not be left as implied appendages — they must appear explicitly so the backward pass traversal order reflects the full flow." Customize the examples to match the publication or registration patterns relevant to your project.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
