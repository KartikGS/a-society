**Subject:** Compulsory complexity gate — programmatic enforcement of intake analysis
**Status:** BRIEFED
**Date:** 2026-03-17

---

## Agreed Change

The Owner currently has an instructional requirement to perform a complexity analysis at intake and produce a workflow plan before any other artifact. In practice this step is skippable — there is no structural gate, no required artifact, and no tooling enforcement. A session that opens and goes straight to a brief has no friction to overcome.

The agreed change is to make this gate structural and eventually machine-verifiable:

1. **A new required pre-Phase-1 node** is added to `$A_SOCIETY_WORKFLOW`: the Owner must produce a plan artifact before writing a brief. The workflow graph reflects this as a required step with a defined edge carrying the plan artifact.
2. **A plan artifact template** is created with machine-readable YAML frontmatter — fields for each complexity axis, tier decision, path definition, and known unknowns. This is what the Owner produces at every intake.
3. **The Owner role doc** is updated to reference the new required step and the plan template.

A fourth element — tooling enforcement (programmatic validation that the plan artifact exists and contains required fields) — is a subsequent track. The TA scopes the tooling mechanism after the plan artifact format is approved. The Curator does not propose or implement the tooling piece.

The motivation: the Owner skipped the complexity analysis for the `20260316-tooling-ts-migration` flow. The omission was not caught because there was no gate. The fix is structural, not instructional — the instruction already exists and was ignored.

---

## Scope

**In scope:**
1. New plan artifact template — with required YAML frontmatter covering all five complexity axes, tier decision, path definition, and known unknowns. Register in `$A_SOCIETY_INDEX` with a new `$A_SOCIETY_COMM_TEMPLATE_PLAN` variable.
2. `$A_SOCIETY_WORKFLOW` — add `owner-phase-0-plan` node (Owner, pre-Phase-1); add edge from `owner-phase-0-plan` → `owner-phase-1-briefing` carrying the plan artifact; update the session model prose to reflect the new step; update the workflow YAML frontmatter graph.
3. `$A_SOCIETY_OWNER_ROLE` — update "Workflow routing" (line 28) to explicitly reference `$A_SOCIETY_COMM_TEMPLATE_PLAN`; update the post-confirmation protocol to state that a plan artifact must be produced before any brief is written.
4. Index registration of the new template in `$A_SOCIETY_INDEX`.

**Out of scope:**
- Tooling enforcement mechanism — TA scopes this after the plan artifact format is approved. Do not propose or stub a tooling implementation.
- Changes to `$INSTRUCTION_WORKFLOW_COMPLEXITY` — the instruction is correct as written. The gap was structural, not instructional.
- Any changes to the Curator role or the Phase 1 entry conditions — the new gate is an Owner pre-condition, not a Curator check.

---

## Likely Target

- New file: `/a-society/a-docs/communication/conversation/TEMPLATE-owner-workflow-plan.md` — plan artifact template
- `$A_SOCIETY_WORKFLOW` — `/a-society/a-docs/workflow/main.md`
- `$A_SOCIETY_OWNER_ROLE` — `/a-society/a-docs/roles/owner.md`
- `$A_SOCIETY_INDEX` — `/a-society/a-docs/indexes/main.md` — new row for `$A_SOCIETY_COMM_TEMPLATE_PLAN`

---

## Open Questions for the Curator

1. **Plan artifact frontmatter schema:** The template must have machine-readable YAML frontmatter. Propose the exact fields and their allowed values for each axis (e.g., `low | moderate | elevated | high` or a numeric scale), the tier field, the path field (list of roles), and the known unknowns field. The schema must be specific enough that a validator can check for required fields and reject a plan that is missing them — while remaining readable by an agent filling it out.

2. **Workflow graph update — node placement:** The new `owner-phase-0-plan` node precedes Phase 1. Verify whether this belongs inside Phase 1 (as a pre-condition step of the Proposal phase) or as a new Phase 0. Check how `$INSTRUCTION_WORKFLOW_COMPLEXITY` describes the intake step relative to the phases — it should be consistent.

3. **`$A_SOCIETY_WORKFLOW` session model prose:** The How It Flows section currently begins at Step 1 with the Owner writing a brief. Propose updated language that makes the plan artifact the first act in Session A, before the brief.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Compulsory complexity gate — programmatic enforcement of intake analysis."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
