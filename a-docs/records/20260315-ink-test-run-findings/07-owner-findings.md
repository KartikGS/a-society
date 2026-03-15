---

**Subject:** Three agent reliability gaps — Ink test run (handoff paths, context confirmation, deep-link prohibition)
**Type:** Owner Backward-Pass Findings
**Date:** 2026-03-15

---

## Curator Finding Assessed: Archetype Template Drift

The Curator flagged that the six archetype templates in `$INSTRUCTION_ROLES` still carry the old Handoff Output item 4 text — the Section 7 canonical definition was updated, but the per-archetype templates were not in scope.

**Assessment: Brief warranted.** The gap is real and directly undercuts the fix. An agent building a new role document from an archetype template copies the template text, not the canonical definition — so the path portability requirement will not reach new role documents created after v11.0. The Curator correctly scoped this out of the present flow; a targeted brief is the right next step.

**Disposition:** Owner will file a brief in a new flow. No direction decision required — this is mechanical consistency maintenance within `$INSTRUCTION_ROLES`. The brief will direct the Curator to update all six archetype Handoff Output sections to match the Section 7 language verbatim.

---

## Flow Assessment

**Brief quality:** The three gaps were each stated with observed evidence, exact target locations, and clear scope boundaries. The proposal round was a straight confirmation of the brief's direction — no judgment calls were needed. This is the intended brief quality outcome.

**Approval decision:** The only non-trivial judgment call was the cross-layer consistency constraint (extend changes to `$A_SOCIETY_OWNER_ROLE` and `$A_SOCIETY_CURATOR_ROLE`). That constraint was correct and the Curator applied it cleanly. No deviations.

**Update report:** Classification was assessed correctly before submission. Two Breaking changes (directly instantiated templates) and one Recommended (instruction document). The publication condition — withholding publication until Owner approval — worked as designed.

**Test methodology:** A full-lifecycle test run on a minimal two-role project (Ink) surfaced three framework gaps in a single pass. The approach is validated. The minimal project scope kept the test tractable while still exercising all major flow segments (initialization, brief, draft, review, backward pass, curator synthesis).

---

## No Other Findings

No additional direction concerns, drift, or follow-up items identified within this flow's scope beyond the archetype template brief noted above.

---

## Flow Status

Closed. All artifacts complete:
- `01-owner-to-curator-brief.md` — brief filed
- `02-curator-to-owner.md` — proposal submitted
- `03-owner-to-curator.md` — APPROVED
- `04-curator-update-report.md` — update report submitted
- `05-owner-update-report.md` — APPROVED
- `06-curator-findings.md` — Curator backward pass complete
- `07-owner-findings.md` — Owner backward pass complete

**Next action:** File brief for archetype template drift (new flow).
