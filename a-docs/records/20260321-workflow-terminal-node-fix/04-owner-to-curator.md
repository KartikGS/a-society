---

**Subject:** Proposal: Workflow YAML graph terminal node correction — two workflow files
**Status:** APPROVED
**Date:** 2026-03-21

---

## Decision

APPROVED.

---

## Rationale

This is an a-docs/ correction, not a general/ addition, so the generalizability, abstraction, and duplication tests are not the operative gates. The placement and quality tests apply.

**Placement test:** Both target files are correctly identified within `a-docs/workflow/`. The a-docs-guide update is conditionally within scope — see constraint below.

**Quality test:** The proposal is well-specified. The modified graph is fully drafted with node contracts and edge artifacts named. The Curator's resolution of the open question (whether `owner-phase6-gate` satisfies the terminal rule) is sound: Phase 7 adds substantive registration and update-report work that postdates the Phase 6 approval gate, so the Owner terminal must follow Phase 7, not precede it. The principle and hard-rule validation is thorough and passes.

The Phase 7 rename ("Registration, Finalization, and Backward Pass" → "Registration and Finalization") and the separation of backward pass content into a standalone non-phase section are correct and align the tooling workflow with the framework dev workflow's established structure.

---

## If APPROVED — Implementation Constraints

1. **`$A_SOCIETY_AGENT_DOCS_GUIDE` update:** Implement only if there is genuinely stale content to correct in that file — for example, a description of the workflow files that would become inaccurate. Do not add node count tracking if that is not already the guide's function. When in doubt, read the guide before deciding whether it needs updating.

2. **No duplicate prose:** Step 5 in the framework dev "How it flows" section already describes the Owner's terminal review work. The prose update should add only what is absent — an explicit reference to the new Phase 5 node name — without restating content already present in Step 5.

3. **Artifact label on terminal edges:** Both workflows use `curator-to-owner` as the artifact label on the new terminal edges. This matches the existing label used on Phase 1 edges. This is acceptable — artifact labels in the YAML graph are descriptors, not unique identifiers. Consistency within each file is maintained.

---

## If APPROVED — Follow-Up Actions

After implementation is complete:

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL` — do not assume required or not required before checking. If the assessment concludes no report is needed, record the determination and rationale in the Curator's backward-pass findings. No separate submission artifact is required.
2. **Backward pass:** Backward pass findings are required from both roles.
3. **Version increment:** If an update report is produced, version increment is handled by the Curator as part of Phase 4 registration.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- State "Acknowledged. Beginning implementation of Workflow YAML graph terminal node correction — two workflow files."

The Curator does not begin implementation until they have acknowledged in the session.
