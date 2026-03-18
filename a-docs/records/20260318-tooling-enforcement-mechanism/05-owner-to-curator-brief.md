**Subject:** Plan artifact validator — Curator documentation track
**Status:** BRIEFED
**Date:** 2026-03-18

---

## Context

Component 7 (Plan Artifact Validator) has been approved by the Owner in `04-owner-to-ta.md`. The TA's full component design is in `03-ta-to-owner.md`. Read all three before beginning.

This brief opens the Curator's documentation track for this component. Two sub-tracks operate in sequence: pre-implementation documentation (now), then post-implementation registration (after the Developer completes implementation).

---

## Track 1 — Pre-Implementation Documentation (begin now)

The following documentation artifacts may be proposed and approved before the Tooling Developer begins implementation. The Curator proposes each through the standard flow; Owner reviews. These are the pre-conditions for opening Session C.

**1. `$A_SOCIETY_TOOLING_PROPOSAL` — new Component 7 entry**

Add a Component 7 entry to the tooling proposal, consistent with the existing six component entries. The entry must cover: what the component does, its inputs and outputs (per the interface in `03-ta-to-owner.md`), exit codes, what it does NOT do, and the co-maintenance dependency on `$A_SOCIETY_COMM_TEMPLATE_PLAN`.

**2. `$A_SOCIETY_TOOLING_ADDENDUM` — new Phase 1A slot and session model update**

Add a Phase 1A slot to the implementation workflow. The TA's recommendation: Phase 1-class dependency profile (no cross-component dependencies, read-only), standalone implementation sprint, concurrent with Phases 1–3 logically. Propose the final naming and placement language for the phase slot and update the session model table to reflect Session C's expanded scope.

**3. `$A_SOCIETY_ARCHITECTURE` — component count**

Update the component count from six to seven in the tooling layer overview table. Add the Component 7 row to the table.

---

## Track 2 — Post-Implementation Registration (after Developer implementation is complete)

Do not begin Track 2 until the Owner confirms implementation is complete.

**4. `$A_SOCIETY_TOOLING_COUPLING_MAP` — two new rows plus one structural decision**

Add one format dependency row and one invocation status row per the TA's OQ4 resolution. Additionally, the coupling map's format dependency table currently covers only `general/` elements — `$A_SOCIETY_COMM_TEMPLATE_PLAN` is an `a-docs/` file. The Curator must propose a concrete representation for this co-maintenance dependency (options include a table header note, a row annotation such as `[a-docs]`, or a separate `a-docs/` co-maintenance section). The structural decision must be stated explicitly in the proposal — not deferred.

**5. `$INSTRUCTION_WORKFLOW_COMPLEXITY` — invocation reference**

Add an invocation reference directing agents to invoke Component 7 after completing the plan artifact. This is a `general/` change: standard proposal flow applies (Curator proposes, Owner reviews, Owner approval required before creation). This is a Type B coupling obligation — not optional.

---

## Scope

**In scope:** The five documentation artifacts above, in the sequence specified.
**Out of scope:** Implementation in `tooling/` (Developer only); any changes to `$A_SOCIETY_COMM_TEMPLATE_PLAN` or the plan artifact schema (fixed); the invocation documentation written by the Developer at Phase 6.

---

## Open Questions for the Curator

The `a-docs/` co-maintenance representation in the coupling map (Track 2, item 4). The Curator determines the concrete approach and states it in the proposal. All other items are fully derivable from `03-ta-to-owner.md` and the approved constraints in `04-owner-to-ta.md`.

---

## Curator Confirmation Required

Before beginning Track 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning pre-implementation documentation for Component 7."

The Curator does not begin drafting until they have read this brief, `03-ta-to-owner.md`, and `04-owner-to-ta.md` in full.
