**Subject:** Plan artifact validator — Owner review decision
**Status:** APPROVED
**Date:** 2026-03-18

---

## Decision

**APPROVED** — Component 7 design proceeds to implementation as specified in `03-ta-to-owner.md`, subject to the constraints below.

All four open questions resolved cleanly. The design is fully specified: the interface, exit codes, validation rules, and boundary conditions are clear enough for the Tooling Developer to implement without further scoping decisions.

---

## Rationale

**OQ1 (New Component 7):** Approved. The separation case is sound — different schema, different workflow step (Phase 0 intake vs. workflow graph management), different input model (presence check + field validation vs. document validation of a provided path). The extension-to-Component-3 option was correctly ruled out: Component 3's scope is bounded to workflow graph validation and must stay that way. The "unbounded scope" risk identified by the TA is real.

**OQ2 (On-demand check, protocol-layer gate):** Approved. Consistent with the agent-invoked model that governs all six existing components. The TA's observation is correct: the Curator invoking the tool as a precondition check on the Owner's work is a role reversal that the design should avoid. The gate lives in the protocol layer (Phase 0 gate in `$A_SOCIETY_WORKFLOW`, Owner post-confirmation protocol in `$A_SOCIETY_OWNER_ROLE`) — both of which already contain the required language from the compulsory-gate flow.

**OQ3 (Phase 1A):** Approved. The dependency profile is Phase 1-class: no cross-component dependencies, read-only, stable input schema. "Phase 1A" is an informal label used here for orientation — the Curator proposes the final naming and placement language when updating the addendum. The key constraint is: this is a standalone implementation sprint; it does not depend on any other component being complete, and no other component depends on it.

**OQ4 (Coupling map):** Approved. One format dependency row and one invocation status row are the correct additions. The Type B classification is correct — new tool that agents should invoke requires a `general/` instruction update. The TA correctly identified `$INSTRUCTION_WORKFLOW_COMPLEXITY` as the invocation home (not `$A_SOCIETY_RECORDS`).

---

## Implementation Constraints

**C1 — Coupling map: `a-docs/` co-maintenance dependency must be resolved, not deferred.**
The TA surfaced that `$A_SOCIETY_COMM_TEMPLATE_PLAN` is an `a-docs/` file, but the coupling map's format dependency table currently covers only `general/` elements. The Curator must determine and propose a concrete representation — options include a table header note, a row annotation (e.g., `[a-docs]` tag in the element column), or a separate `a-docs/` co-maintenance section. The Curator submits this determination as part of the coupling map update proposal at Phase 7. "Curator decides" is not sufficient — the decision must be stated and approved before the row is added.

**C2 — Sequencing for Curator documentation work:**
The following Curator documentation updates may proceed immediately after this approval (before Developer implementation):
- `$A_SOCIETY_TOOLING_PROPOSAL` — new Component 7 entry (standard proposal flow: Curator proposes, Owner reviews)
- `$A_SOCIETY_TOOLING_ADDENDUM` — new Phase 1A slot and session model update (standard proposal flow)
- `$A_SOCIETY_ARCHITECTURE` — component count updated from six to seven (standard proposal flow)

The following Curator updates must wait for their respective gates:
- `$A_SOCIETY_TOOLING_COUPLING_MAP` — two new rows plus C1 resolution: Phase 7 (Registration), after implementation is complete, per the addendum's convention
- `$INSTRUCTION_WORKFLOW_COMPLEXITY` — invocation reference: standard `general/` proposal flow; may proceed in parallel with Developer implementation but must be approved before landing in `general/`; this is a Type B obligation, not deferred

**C3 — Developer escalation path is unchanged.**
Any deviation from the approved design goes to the TA before any workaround is implemented. The Developer does not implement a workaround and report it afterward. The TA's advisory mode applies.

**C4 — YAML frontmatter parser reuse.**
The Developer checks for an existing frontmatter parser in the tooling project's dependency set before introducing a new one. Parser selection is within Developer authority if no prior one exists.

---

## Follow-Up Actions

**Session B (Curator):** Curator brief issued at `05-owner-to-curator-brief.md`. Point the Curator at that artifact. The Curator's pre-implementation documentation track (proposal entry, addendum phase slot, architecture count) begins immediately. Post-implementation registration (coupling map, invocation instruction) follows after Developer implementation completes.

**Session C (Tooling Developer):** Opens after the Curator's Component 7 spec entry in `$A_SOCIETY_TOOLING_PROPOSAL` is approved. Point the Developer at `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` and `03-ta-to-owner.md`.

---

## Handoff

**To start or resume Session B (Curator):**

> You are a Curator agent for A-Society. Read `a-society/a-docs/agents.md`.

Point the Curator at:

> `a-society/a-docs/records/20260318-tooling-enforcement-mechanism/05-owner-to-curator-brief.md`

Return to this session (Session A) after implementation is complete, for Phase 5 backward pass.
