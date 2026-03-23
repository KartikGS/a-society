# Owner → Curator: Decision

**Subject:** Structural Readiness Assessment at Intake — 3 file changes
**Status:** APPROVED
**Date:** 2026-03-23

---

## Decision

APPROVED for Items 1 and 2. Item 3 is Curator authority and proceeds independently of this decision.

---

## Rationale

All seven Phase 2 review checks applied and passed.

1. **Generalizability test** — The three checks (feasibility, role authority, workflow routability) and the Structural Gap Protocol are domain-agnostic. They apply equally to a writing project, a software project, and a research project. No domain-specific assumptions.

2. **Abstraction level test** — The checks are actionable without being prescriptive. "Does any defined role have authority for this task?" is concrete enough to use, abstract enough to generalize. The handling table and protocol are specific enough to act on.

3. **Duplication test** — No overlap with existing content. The Curator's Q2 analysis was thorough and correct: known unknowns in the complexity instruction cover within-flow deferred decisions, not pre-flow structural gaps.

4. **Placement test** — New section in `$INSTRUCTION_WORKFLOW_COMPLEXITY` is the correct placement; it gates entry into complexity analysis, which is exactly what this document governs. Bullet additions in both owner role files are correctly placed.

5. **Quality test** — The proposed text is clear and sequential. The behavioral property consistency check in the proposal confirms no contradictions between checks: Check 1 gates Check 2, Check 2 gates Check 3, the handling table is exhaustive, and the user-override row is distinct from the protocol path.

6. **Coupling test** — `$INSTRUCTION_WORKFLOW_COMPLEXITY` appears in the coupling map's Invocation Status table only (Component 7 invocation reference, already closed). It does not appear in the Format Dependencies table. Component 7 parses the plan artifact frontmatter, not the instruction document. This change does not touch the plan artifact format or any parsed schema. No coupling concern.

7. **Manifest check** — No new files are being created in `general/`. No manifest update required.

---

## Implementation Constraints

**Item 1 — `$INSTRUCTION_WORKFLOW_COMPLEXITY`:** One directed adjustment required before or during implementation.

Step 4 of the Structural Gap Protocol currently reads:

> "Add the deferred task to Next Priorities in the project log with a dependency note: 'depends on: [setup flow identifier].'"

The setup flow identifier does not exist at step 4 — the record folder (and its identifier) is created at step 5 (intake of the setup flow). Implement step 4 with the following wording instead:

> "Add the deferred task to Next Priorities in the project log with a dependency note (e.g., 'depends on: structural setup — flow to be opened'). Update the entry with the setup flow identifier once the record folder is created in step 5."

All other proposed content for Item 1 is approved as written.

**Item 2 — `$GENERAL_OWNER_ROLE`:** Implement exactly as proposed. The junction rephrasing ("This includes") is approved — it is meaning-preserving and grammatically correct.

**Item 3 — `$A_SOCIETY_OWNER_ROLE`:** Curator authority. Implement as proposed.

---

## Follow-Up Actions

After implementation is complete:

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL` — do not assume required or not required before checking. If the assessment concludes no report is needed, record the determination and rationale in the Curator's backward-pass findings.
2. **Backward pass:** Backward pass findings are required from both roles.
3. **Version increment:** If an update report is produced, version increment is handled by the Curator as part of Phase 4 registration.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of Structural Readiness Assessment at Intake."

The Curator does not begin implementation until they have acknowledged in the session.
