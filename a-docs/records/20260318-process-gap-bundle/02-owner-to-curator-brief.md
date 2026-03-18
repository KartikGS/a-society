---
**Subject:** Process gap bundle — 4 sections, 11 changes + 1 MAINT inline
**Status:** BRIEFED
**Date:** 2026-03-18

> **Count verify:** Subject line states 4 sections; 4 sections in Agreed Change — verified.

---

## Agreed Change

This brief covers Next Priorities 1–9 in a single flow. Priority 3 (`.js` → `.ts` correction) is Curator-authority MAINT — fold it into the Phase 4 registration pass; no proposal content needed for it. Priority 10 is not in scope. Sections are ordered by logical coherence; files touched by multiple sections must be edited in a single pass per file.

---

### Section 1 — Brief and Approval Process (Priorities 1 and 7)

Three items from Priority 1 (Items B, C, D) and two from Priority 7.

**Item 1a — Remove "confirmation step" framing (Priority 1, Item B)**

The Brief-Writing Quality section in both `$A_SOCIETY_OWNER_ROLE` and `$GENERAL_OWNER_ROLE` currently reads that a fully-specified brief "reduces the proposal round to a confirmation step." This framing minimizes the approval gate — it implies the Curator's proposal is a formality rather than a genuine Phase 2 prerequisite. Remove or replace this framing so the language does not suggest that a well-specified brief collapses Phase 2.

**Item 1b — Add Approval Invariant to Curator hard rules (Priority 1, Item C)**

The Approval Invariant is established in `$A_SOCIETY_WORKFLOW` and in the brief template authorization note, but it is not enforced at the Curator's point of action. Add an explicit hard rule to `$A_SOCIETY_CURATOR_ROLE`: the Curator does not begin implementation on any item without a Phase 2 `APPROVED` decision artifact — not on briefing language, not on directional alignment, and not on "fully-specified brief" framing. This closes the enforcement gap at the role level.

**Item 1c — Document brief-scope vs. hard-rule interaction (Priority 1, Item D)**

When a brief registers a change as Curator-authority MAINT, the Curator may implement it directly without Owner approval — this is by design. But this is not stated anywhere the Curator can find it at point of action, creating ambiguity about whether the Approval Invariant applies. Add a note to `$A_SOCIETY_CURATOR_ROLE` (co-located with Item 1b's hard rule) that clarifies: the Approval Invariant applies to LIB changes and all items that require Owner review; items explicitly marked `[MAINT]` or `[Curator authority]` in the brief are exempt and may be implemented directly.

**Item 1d — Item authority marking in brief template (Priority 7, gap 1)**

When a brief bundles Curator-authority items with proposal-required items, there is currently no convention for marking each item's authority level. Add a convention to `$A_SOCIETY_COMM_TEMPLATE_BRIEF`: each item in the Agreed Change section must be marked with its authority level — either `[Requires Owner approval]` or `[Curator authority — implement directly]`. This makes the Approval Invariant's scope unambiguous for every item in the brief without requiring the Curator to infer it.

**Item 1e — "Condition not action" note for handoff instructions in briefs (Priority 7, gap 2)**

A brief that tells the Curator which session to switch to next — rather than stating the gate condition the Curator should return to the Owner upon meeting — enables the Curator to bypass the Owner-as-waypoint. Add a note to `$A_SOCIETY_COMM_TEMPLATE_BRIEF`: briefs must state gate conditions ("return to Owner when X is complete"), not next-role-session instructions ("switch to Session A and point it at Y"). The Owner provides session routing at the point of decision, not in the brief. Also add a corresponding hard rule to `$A_SOCIETY_CURATOR_ROLE`: when a gate condition is met, return to Owner for session routing; do not self-authorize a session switch or implement the next-role-session instructions in the brief.

**Files:** `$A_SOCIETY_OWNER_ROLE`, `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_COMM_TEMPLATE_BRIEF`, `$A_SOCIETY_CURATOR_ROLE`

---

### Section 2 — Existing-Session Handoff Format (Priority 4)

All four A-Society roles independently flagged mid-flow that the Handoff Output sections document the new-session copyable prompt format but say nothing about the existing-session case — which is the common case for intra-flow transitions. The user had to correct the format manually for multiple roles.

**Item 2 — Define and add the existing-session handoff format**

Define a named existing-session handoff format and add it to all A-Society role documents and the `$INSTRUCTION_ROLES` canonical definition. The format:

```
Next action: [what the receiving role should do]
Read: [path to artifact(s)]
Expected response: [what the receiving role produces next]
```

No role-assignment prompt is included — the session is already running with the correct role. This format applies whenever the handoff is to a session that already exists (the default case per `$A_SOCIETY_WORKFLOW`). The new-session format (copyable session-start prompt) continues to apply only when a new session is required per the criteria in `$A_SOCIETY_WORKFLOW`.

Update the Handoff Output section in each role to present both cases explicitly:
- **Existing session (default):** use the existing-session format above
- **New session (criteria apply):** use the copyable session-start prompt + artifact path (current documented behavior)

**Files:** `$A_SOCIETY_CURATOR_ROLE`, `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`, `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`, `$GENERAL_CURATOR_ROLE`, `$GENERAL_OWNER_ROLE`, `$INSTRUCTION_ROLES`

Note: `$A_SOCIETY_OWNER_ROLE` also has a Handoff Output section and must receive the same update. Add it to the file list.

---

### Section 3 — Records (Priorities 2 and 8)

**Item 3a — `$INSTRUCTION_RECORDS` Phase 0 alignment check (Priority 2)**

Phase 0 is now formalized in the general Owner role template (`$GENERAL_OWNER_ROLE`). Check whether `$INSTRUCTION_RECORDS` is out of step — specifically whether the artifact sequence, the "Creating a Record Folder" instructions, or any prose in that document fails to account for the `01-owner-workflow-plan.md` as the Phase 0 gate artifact that precedes all other artifacts. If gaps are found, propose LIB changes. If the check finds no gaps, state that explicitly in your proposal and no change is needed for this item.

**Item 3b — Decision artifact naming rule (Priority 8)**

The non-standard slot naming convention in `$A_SOCIETY_RECORDS` (`NN-[role]-[descriptor].md`) does not distinguish between two different Owner situations:
- Owner recording a final decision after a role's work is complete (the proposing role has no further action)
- Owner handing work back to a role with a next action

Add a named rule to `$A_SOCIETY_RECORDS`: use `NN-owner-decision.md` when the Owner is recording a decision and the previously active role has no subsequent action in this flow. Use `NN-owner-to-[role].md` only when the named role has a next action in the flow. This prevents mislabeling that occurred in the `20260318-tooling-enforcement-mechanism` record.

**Files:** `$INSTRUCTION_RECORDS` (conditional on Item 3a finding gaps), `$A_SOCIETY_RECORDS`

---

### Section 4 — Tooling Governance (Priorities 5, 6, 9)

**Item 4a — Multi-role backward pass rule + Component 4 mandate (Priority 5)**

`$A_SOCIETY_IMPROVEMENT` currently describes only the two-role Owner/Curator backward pass case. No generalizable rule exists for flows with additional roles. The Owner computed ordering manually in a recent flow and got it wrong twice.

Add to `$A_SOCIETY_IMPROVEMENT`: a generalizable multi-role backward pass ordering rule that covers flows with three or more participating roles. The rule should specify how to determine ordering when non-standard roles are present (e.g., TA, Developer) and how to handle parallel forks. Also add a mandate: when Component 4 (Backward Pass Orderer) is available and the flow has more than two participating roles, invoke Component 4 to compute the traversal order — do not compute manually.

Update `$A_SOCIETY_TOOLING_ADDENDUM` Phase 7 to require Component 4 invocation under the same condition.

Update `$GENERAL_IMPROVEMENT` with the same generalizable multi-role rule (LIB change). Ensure the rule in `$GENERAL_IMPROVEMENT` is expressed without reference to A-Society-specific components — the general version should describe the rule; the A-Society-specific mandate to invoke Component 4 stays in `$A_SOCIETY_IMPROVEMENT` and `$A_SOCIETY_TOOLING_ADDENDUM`.

**Files:** `$A_SOCIETY_IMPROVEMENT`, `$A_SOCIETY_TOOLING_ADDENDUM`, `$GENERAL_IMPROVEMENT`

**Item 4b — INVOCATION.md obligation + TA `a-docs/` dependency guidance (Priority 6)**

Two gaps in the tooling governance process:

*(i)* When a new component is added, updating `tooling/INVOCATION.md` is not covered by the coupling map taxonomy — Type B covers `general/` instructions only — and is absent from the Phase 7 Curator registration checklist in `$A_SOCIETY_TOOLING_ADDENDUM`. The Path Validator (Component 5) fails on all entries that are not registered in `INVOCATION.md`. Add a Type (or extend an existing type) in `$A_SOCIETY_TOOLING_COUPLING_MAP` to cover the `INVOCATION.md` update obligation. Add the `INVOCATION.md` update step to the Phase 7 Curator registration checklist in `$A_SOCIETY_TOOLING_ADDENDUM`.

*(ii)* The TA has no documented guidance on how to represent and recommend handling of a component dependency on an `a-docs/` format (as opposed to a `general/` format). When a component reads `a-docs/` content, the coupling map taxonomy does not apply (Type B is `general/`-only), and the TA has no framework for advising on it. Add a section or note to `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` covering: how to identify an `a-docs/` format dependency, how to document it in a component design, and what to recommend (e.g., whether the component should read `a-docs/` directly or whether the dependency should be resolved differently).

**Files:** `$A_SOCIETY_TOOLING_COUPLING_MAP`, `$A_SOCIETY_TOOLING_ADDENDUM`, `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`

**Item 4c — Post-Phase-6 component additions + Developer completion artifact (Priority 9)**

Two gaps introduced by the original 6-component launch framing:

*(i)* The Addendum's advisory mode and gate language was written for the initial launch of six components. It does not describe conditions or process for adding subsequent components (Phase 6+). Add a "Post-Phase-6 Component Additions" section to `$A_SOCIETY_TOOLING_ADDENDUM` that defines: when a new component may be added after the original launch, what the Phase 0 gate conditions are, and how the advisory/non-advisory mode applies. Also update the Developer role Phase 0 gate clause in `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` to reference these post-Phase-6 conditions.

*(ii)* The Developer currently has no obligation to produce a completion artifact. Completion was recorded only as Owner paraphrase in a prior flow's record. Add a completion report obligation to `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` Handoff Output: upon completing implementation, the Developer produces `NN-developer-completion.md` in the active record folder summarizing: what was implemented, any deviations from the spec, and whether the spec requires an update. This creates a first-party implementation record that the Owner and Curator can cite.

**Files:** `$A_SOCIETY_TOOLING_ADDENDUM`, `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`

---

### Priority 3 — MAINT Inline (no proposal needed) [Curator authority — implement directly]

All six tooling component entries in `$A_SOCIETY_PUBLIC_INDEX` use `.js` extensions; actual files on disk are `.ts`. Correct all six rows during the Phase 4 registration pass. No Owner approval required — this is a factual correction.

**File:** `$A_SOCIETY_PUBLIC_INDEX`

---

## Scope

**In scope:**
- All items described in Sections 1–4 above
- Priority 3 MAINT inline (Phase 4)
- `$A_SOCIETY_OWNER_ROLE` for Section 2 handoff format update (listed under Item 2 above)
- Post-implementation update report eligibility check per `$A_SOCIETY_UPDATES_PROTOCOL`

**Out of scope:**
- Priority 10 (Shared utils.ts + backward pass trigger prompt tool) — gated on this flow completing; TA scoping required; separate flow
- Any changes to tooling implementation code
- Any content in project folders outside `a-society/`

---

## Likely Target

| Section | Files |
|---|---|
| Section 1 | `$A_SOCIETY_OWNER_ROLE`, `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_COMM_TEMPLATE_BRIEF`, `$A_SOCIETY_CURATOR_ROLE` |
| Section 2 | `$A_SOCIETY_OWNER_ROLE`, `$A_SOCIETY_CURATOR_ROLE`, `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`, `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`, `$GENERAL_CURATOR_ROLE`, `$GENERAL_OWNER_ROLE`, `$INSTRUCTION_ROLES` |
| Section 3 | `$INSTRUCTION_RECORDS` (conditional), `$A_SOCIETY_RECORDS` |
| Section 4 | `$A_SOCIETY_IMPROVEMENT`, `$A_SOCIETY_TOOLING_ADDENDUM`, `$GENERAL_IMPROVEMENT`, `$A_SOCIETY_TOOLING_COUPLING_MAP`, `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`, `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` |
| MAINT inline | `$A_SOCIETY_PUBLIC_INDEX` |

**Files touched by multiple sections — edit in a single pass per file:**
- `$A_SOCIETY_CURATOR_ROLE` — Sections 1 and 2
- `$A_SOCIETY_OWNER_ROLE` — Sections 1 and 2
- `$GENERAL_OWNER_ROLE` — Sections 1 and 2
- `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` — Sections 2 and 4
- `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` — Sections 2 and 4
- `$A_SOCIETY_TOOLING_ADDENDUM` — Items 4a, 4b, 4c

---

## Open Questions for the Curator

None. All items are fully specified from the log. Item 3a is conditional on what the check finds — if no gaps, state that and close the item; no judgment call is required.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Process gap bundle — 4 sections, 11 changes + 1 MAINT inline."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
