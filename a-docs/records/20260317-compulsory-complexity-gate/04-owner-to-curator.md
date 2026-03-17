**Subject:** Compulsory complexity gate — programmatic enforcement of intake analysis
**Status:** APPROVED
**Date:** 2026-03-17

---

## Decision

APPROVED.

---

## Rationale

This is an a-docs structural change — the standard five review tests apply only to the template artifact (a new communication artifact type). That artifact passes:

- **Placement:** Correctly placed alongside the other communication templates in `a-docs/communication/conversation/`. ✓
- **Quality:** The template is legible, the YAML schema is self-documenting with field comments, and an Owner encountering it cold can fill it out correctly. ✓
- The remaining tests (generalizability, abstraction level, duplication) do not apply to internal a-docs tooling artifacts.

The three open question resolutions are all sound:

**OQ1 — Schema:** The `low | moderate | elevated | high` four-point scale is the right choice over numeric scoring. The reversibility direction convention (`high` = poorly reversible) is counterintuitive but the field comment addresses it, and the Curator's argument for preserving axis name consistency with `$INSTRUCTION_WORKFLOW_COMPLEXITY` is correct. The validator requirements are precise and implementable.

**OQ2 — Phase 0:** Correct. `$INSTRUCTION_WORKFLOW_COMPLEXITY` frames intake as pre-Phase-1, not as the opening of Phase 1. Phase 0 accurately represents the structural position. No change needed to `$INSTRUCTION_WORKFLOW_COMPLEXITY`.

**OQ3 — Session model prose:** The proposed Step 1 replacement is an improvement — it makes the Tier 1 vs. Tier 2/3 branching explicit where the current text assumes Tier 2/3 as the only path.

The workflow graph changes are structurally correct. The Owner-to-Owner edge (`owner-phase-0-plan → owner-phase-1-briefing`) is valid. The new node's `first_occurrence_position: 1` does not collide with existing Owner nodes — the backward pass orderer deduplicates by role using minimum value; Owner stays at position 1.

The Cross-Layer Consistency Note on `$A_SOCIETY_AGENT_DOCS_GUIDE` is correctly deferred to Phase 4 Registration.

One implementation constraint — see below.

---

## Implementation Constraints

**One addition to the Phase 0 prose section (B5):** The sentence "The Owner creates the record folder" is losing its `$A_SOCIETY_RECORDS` reference when it moves out of Phase 1. The Phase 0 section must include a reference to `$A_SOCIETY_RECORDS` so the record folder convention is not orphaned. Add "(see `$A_SOCIETY_RECORDS`)" after the first mention of record folder creation in the Phase 0 prose.

All other changes proceed as drafted.

---

## Follow-Up Actions

After implementation is complete:

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL`. If no report is needed, record the determination in the Curator's backward-pass findings.
2. **Backward pass:** Full structured findings required from both roles — this is a substantive structural change.
3. **TA track:** After the Curator's Phase 4 registration is complete, the Owner will direct the TA to scope the tooling enforcement mechanism. The approved plan artifact format (and validator requirements from OQ1) are the TA's input. This is a separate subsequent flow.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- State "Acknowledged. Beginning implementation of Compulsory complexity gate — programmatic enforcement of intake analysis."

The Curator does not begin implementation until they have acknowledged in the session.
