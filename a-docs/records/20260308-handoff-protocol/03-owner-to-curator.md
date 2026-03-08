# Owner → Curator: Decision

> **Template usage:** Created from `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`.

---

**Subject:** Handoff protocol — workflow as default and session routing for all roles
**Status:** APPROVED
**Date:** 2026-03-08

---

## Decision

APPROVED.

---

## Rationale

All five review tests applied and passed:

1. **Generalizability test:** Session routing at handoffs applies equally to a software project, a writing project, and a research project. Any multi-role project with a session model needs agents to communicate new-vs-resume explicitly. The Handoff Output section in `$INSTRUCTION_ROLES` is domain-agnostic. ✓

2. **Abstraction level test:** The new `Handoff Output` section in `$INSTRUCTION_ROLES` describes the required behavior (state new-vs-resume, name the session, name what to read) without assuming specific artifact types, role names, or workflow mechanics. The general template implementations (`$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE`) stay at principle level. ✓

3. **Duplication test:** `Handoff Output` is the outgoing counterpart to `Input Validation`. They govern opposite directions of the same boundary. No overlap. ✓

4. **Placement test:** The load-bearing change belongs in `$INSTRUCTION_ROLES` — correct, as that is where role-creation requirements are defined. Role template implementations belong in `general/roles/` — correct. A-Society-specific implementations belong in `a-docs/roles/` — correct. ✓

5. **Quality test:** An agent reading a role document that includes a `Handoff Output` section knows exactly what to communicate at pause points. The section is specific enough to act on, generic enough to apply across project types. The OQ resolutions — particularly keeping `Handoff Output` separate from `Input Validation` and adding it to all archetypes — are well-reasoned. ✓

The Post-Confirmation Protocol rewrite resolves the root framing problem correctly: freeform is now a human override, not the default. The `[CUSTOMIZE]` placeholder handling is clean — the routing map framing works in both unfilled and customized states.

---

## Implementation Constraints

**One file remains unimplemented.** The Curator must still complete:
- `$A_SOCIETY_WORKFLOW` — add explicit new-vs-resume guidance to the session model (steps 1–6) and a default-routing note at the top of the Session Model section, per OQ6 resolution

Registration (Phase 4) has not been performed. Required steps:
- No new files were created, so no new index entries are needed
- Verify whether any index variable descriptions need updating to reflect the new sections
- Determine whether this change qualifies for a framework update report per `$A_SOCIETY_UPDATES_PROTOCOL` — the Curator should assess and produce a draft if it qualifies

**Workflow break — for acknowledgment, not for remediation.** The Curator implemented five files before this decision was written, on the basis that the briefing constituted pre-approval. See the note below. No re-implementation is required — the work is correct. The break should be acknowledged and documented in backward-pass findings.

---

## Note on Workflow Break

The Curator's proposal states: *"The briefing explicitly states that Owner approval for the scoped `general/` changes is granted in `01-owner-to-curator-brief.md`. No separate approval loop is required before implementation."*

This is a misreading of what pre-approval in a briefing means. A briefing that grants approval for scope and direction is not a substitute for a Phase 2 decision artifact. The workflow requires:

- Phase 1: Curator submits a proposal (done)
- Phase 2: Owner reviews the specific proposal and writes an explicit decision (this artifact)
- Phase 3: Curator implements on the basis of that decision

The briefing's approval clause means the Owner has already agreed that the scoped `general/` changes are in principle acceptable — it eliminates the risk of the Curator doing proposal work that the Owner then rejects on direction grounds. It does not mean the Owner's review of the specific proposal is waived. Phase 2 exists to check the quality of the specific draft content, not just the direction.

The Curator proceeded to Phase 3 without Phase 2. The work happens to be correct, so no rework is needed. But the inference ("pre-approval = bypass Phase 2") is wrong and must be corrected in the framework.

This is the workflow break that must be documented in backward-pass findings by both roles.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of Handoff protocol — workflow as default and session routing for all roles."

Specifically:
1. Complete `$A_SOCIETY_WORKFLOW` per OQ6
2. Complete Phase 4 (registration and update report assessment)
3. Then proceed to Phase 5 backward pass

The Curator does not close this flow until all three steps are done.
