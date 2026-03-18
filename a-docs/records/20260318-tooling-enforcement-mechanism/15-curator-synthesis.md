# Curator Synthesis — 20260318-tooling-enforcement-mechanism

**Date:** 2026-03-18
**Task Reference:** 20260318-tooling-enforcement-mechanism
**Role:** Curator
**Source Artifacts:** 11-developer-findings.md, 12-curator-findings.md, 13-ta-findings.md, 14-owner-findings.md

---

## Overview

Four roles produced findings. This synthesis consolidates cross-role convergences, identifies all actionable items, and routes each to its appropriate bucket: Curator-direct (no Owner approval required) or Owner-required (proposal needed before implementation).

**Distinct themes identified:** 14
**Curator-direct:** 2 (implement immediately after synthesis)
**Owner-required:** 7 proposal groups (Owner decision needed before implementation)

---

## Cross-Role Convergences

Three findings were raised independently by multiple roles and warrant explicit acknowledgment before routing.

**Convergence 1 — Existing-session handoff format undocumented**
Developer #5 · Curator #4 · TA #5 · Owner #4 — all four roles flagged independently. User corrected multiple roles mid-flow. Every role's handoff section specifies the new-session copyable prompt format but omits the existing-session equivalent. Both Curator and TA flagged this as a `general/roles/` contribution; Owner confirmed it as the highest-frequency friction point and most clearly generalizable finding in the flow.

**Convergence 2 — Backward pass ordering for multi-role flows has no single authoritative source**
Curator #3 · TA #3 · Owner #2. Owner computed the order manually and got it wrong twice before human correction. `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` (Component 4) was built exactly for this problem but was never invoked because the protocol does not require it. Owner flagged as generalizable to `$GENERAL_IMPROVEMENT`.

**Convergence 3 — Record has no Developer completion artifact and no TA non-involvement record**
Developer #5 · TA #4 · Owner #6. The record jumps from Curator pre-implementation approval (`07-`) to Owner post-implementation routing (`08-`) with no Developer-authored artifact. TA non-involvement between design (`03-`) and findings (`13-`) is also unrecorded from the TA's perspective. Owner named this a design question — the record convention has no lightweight artifact type for either case.

---

## Curator-Direct Items

These are maintenance corrections within Curator authority. No Owner approval required.

### C1. Correct coupling map header scope statement

**Source:** TA finding #2
**Current state:** The coupling map header reads "which `general/` elements each tooling component parses programmatically." Component 7 introduced an `a-docs/` dependency (`$A_SOCIETY_COMM_TEMPLATE_PLAN`), already annotated `[a-docs]` in the table. The header implies `general/`-only scope and is now inaccurate.
**Action:** Update the header to read "which framework elements (in `general/` or `a-docs/`) each tooling component parses programmatically" or equivalent phrasing that reflects current reality. Header and column description only — no structural change to the table.
**Scope:** `$A_SOCIETY_TOOLING_COUPLING_MAP`, format-dependency table header.

---

### C2. Document pre-existing npm test failures in a-docs/

**Source:** Developer finding #1
**Current state:** Version-comparator tests produce 3 failures caused by fixture drift (fixtures record v11.1 as current; `VERSION.md` is at v12.0). No documented record exists in `tooling/` or `a-docs/`. Every future Developer session faces the same investigation cost before confirming their own implementation is clean. Developer also noted this means Phase 6 Integration Validation cannot currently pass with `npm test` without first resolving or documenting the fixture drift.
**Action:** Add a note to `$A_SOCIETY_TOOLING_ADDENDUM` (under Phase 6 or in a known-state addendum) documenting: which tests fail, the cause (fixture drift: fixtures record v11.1; `VERSION.md` has moved to v12.0), and that these failures pre-date Phase 1A. This is a maintenance task — recording known state in a-docs/ so future Developer sessions have a documented reference.
**Scope:** One section addition to `$A_SOCIETY_TOOLING_ADDENDUM` (or `$A_SOCIETY_TOOLING_PROPOSAL` Component 1 section — Curator judgment on placement).

---

## Owner-Required Proposals

Each proposal group below requires Owner approval before implementation. Items are grouped by affected document cluster. All affect either `general/`, role hard rules, or structural rules — each is a direction decision.

---

### P1. Existing-session handoff format — all role documents and general/roles/

**Sources:** Developer #5, Curator #4, TA #5, Owner #4 (all four roles; flagged generalizable by Curator, TA, Owner)
**Gap:** Every role document's handoff section specifies the new-session copyable prompt format (`"You are a [Role] agent for [Project Name]. Read [path to agents.md]."`) but says nothing about what "copyable inputs" means when handing off to an existing session — the common case for intra-flow handoffs. The result: roles produced incomplete handoffs throughout this flow and the user supplied the missing format live.
**Proposed fix:** Define a named format for existing-session handoffs. Proposed rule: when handing off to an existing session, copyable input consists of (a) the receiving role's next action, (b) which artifact(s) to read, and (c) what response is expected — without a role-assignment prompt. Add this rule to:
- `$A_SOCIETY_CURATOR_ROLE` — handoff output section
- `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` — handoff output section
- `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` — handoff output section
- `$GENERAL_CURATOR_ROLE` and `$GENERAL_OWNER_ROLE` in `general/roles/`
- `$INSTRUCTION_ROLES` archetypes, so new role documents inherit the format

**Why Owner-required:** Affects `general/roles/` (hard rule: never write to `general/` without Owner approval). Also adds a new rule to role documents — direction decision, not maintenance.

---

### P2. Backward pass ordering for multi-role flows — $A_SOCIETY_IMPROVEMENT and Component 4 mandate

**Sources:** Curator #3, TA #3, Owner #2 (flagged generalizable by Owner)
**Gap:** `$A_SOCIETY_IMPROVEMENT` describes only the two-role Owner/Curator backward pass. `$A_SOCIETY_TOOLING_ADDENDUM` Phase 7 describes a specific order for the full tooling launch. Neither provides a generalizable rule for flows where additional roles fire. Owner derived the order manually and got it wrong twice. Component 4 (`$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`) was built to compute this programmatically but was never invoked — the protocol does not require it.
**Proposed fix — two parts:**
1. Update `$A_SOCIETY_IMPROVEMENT` backward pass traversal section to state the generalizable rule for multi-role flows (first-occurrence-reversed, excluding roles that did not fire), and require Component 4 invocation when available — citing `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`.
2. Update `$A_SOCIETY_TOOLING_ADDENDUM` Phase 7 to reference Component 4 invocation as required for backward pass ordering, not optional.

**Generalizable scope:** Owner flagged `$GENERAL_IMPROVEMENT` for an equivalent update. If `$GENERAL_IMPROVEMENT` covers backward pass protocol, it should receive a parallel update.

**Why Owner-required:** Both documents contain structural rules. `$GENERAL_IMPROVEMENT` is in `general/` — requires Owner approval.

---

### P3. INVOCATION.md update obligation — coupling map taxonomy and addendum registration checklist

**Sources:** Curator findings #2 and #5
**Gap:** The coupling map's change taxonomy Type B covers `general/` instruction updates when a new tool is built, but not updates to `tooling/INVOCATION.md` — the consolidated invocation reference. When Component 7 was registered, the Curator missed the INVOCATION.md obligation; the Owner added it at approval time. The addendum's Phase 7 Curator registration checklist also omits INVOCATION.md, leaving ownership of that update in a gap between Developer (Phase 6 closed) and Curator (checklist does not mention it).

A secondary gap surfaced by TA finding #2: after the coupling map header is corrected (C1), there is still no guidance for a future TA on how to represent and recommend handling of an `a-docs/` format dependency at design time. The header fix records the current state; a TA guidance note would prevent the same ad-hoc resolution recurring.

**Proposed fix:**
1. Add a change type to the coupling map taxonomy (or extend Type B) to explicitly cover: "A new component is added → `INVOCATION.MD` requires a new entry." This closes the gap between Type B (`general/` instruction) and the invocation reference in `tooling/`.
2. Add "`INVOCATION.md` — add entry for new component" to the Phase 7 Curator registration checklist in `$A_SOCIETY_TOOLING_ADDENDUM`.
3. Add a note in `$A_SOCIETY_TOOLING_PROPOSAL` (or `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE`) that when a component has an `a-docs/` format dependency, the TA proposal should explicitly name the dependency type and the Curator should annotate it `[a-docs]` in the coupling map format-dependency table.

**Why Owner-required:** Coupling map taxonomy additions and addendum registration checklist additions both add new rules governing role behavior — direction decisions.

---

### P4. Brief-authoring conventions — item authority marking and condition vs. action

**Sources:** Curator finding #1, Owner findings #3 and #7
**Gap 1 (bundling):** `08-owner-to-curator.md` stated "Curator-authority; implement directly" for one item, then immediately directed the Curator to submit all three items as a single proposal. The signals were contradictory. `$A_SOCIETY_COMM_TEMPLATE_BRIEF` has no rule for marking each item's authority level when a brief bundles Curator-authority and proposal-required items together. Owner acknowledged this as a brief-authoring error on their part.
**Gap 2 (condition vs. action):** The same brief gave the Curator both the gate condition for Session C and the Developer session prompt — enough information to open Session C without returning to the Owner first. The Curator acted on it directly. The brief should provide conditions, not complete next-role-session instructions that allow the Curator to execute a multi-step handoff unilaterally.

**Proposed fix:**
1. Add a convention to `$A_SOCIETY_COMM_TEMPLATE_BRIEF`: when bundling items with mixed authority levels, each item must be explicitly marked — e.g., "(Curator-authority — include for record)" vs. "(proposal-required — Owner review needed)".
2. Add a note to `$A_SOCIETY_COMM_TEMPLATE_BRIEF` (under brief scope or session routing guidance): the brief specifies gate conditions and scope; it does not provide complete next-role-session instructions. Downstream session-opening actions belong in Owner decisions, not Curator briefs.
3. Add a hard rule to `$A_SOCIETY_CURATOR_ROLE`: "A brief that states a gate condition is not authorization to open the downstream session. Return to the Owner when the gate condition is met; the Owner authorizes the next session."

Additionally, TA finding #1 identified a related gap: the TA brief for this flow did not state the current implementation status, requiring the TA to infer it from the coupling map. Phase placement (OQ3) depends critically on implementation state. Propose adding an "Implementation status" field to `$A_SOCIETY_COMM_TEMPLATE_BRIEF` for flows where phase placement is an explicit open question.

**Why Owner-required:** Changes to `$A_SOCIETY_COMM_TEMPLATE_BRIEF` (structural) and `$A_SOCIETY_CURATOR_ROLE` hard rules (direction decision).

---

### P5. Records convention — decision artifact naming rule for non-Curator proposals

**Source:** Owner finding #1
**Gap:** The records convention's non-standard slot rule (`NN-[role]-[descriptor].md`) has no rule distinguishing "Owner is handing work back to a role" from "Owner is recording a decision in response to a role whose work is now complete." `04-owner-to-ta.md` was named as if the TA had a next action; user caught and renamed it `04-owner-decision.md`. The rule that should have prevented this is not written.
**Proposed fix:** Add a rule to `$A_SOCIETY_RECORDS` (non-standard slot section): use `NN-owner-decision.md` when the Owner responds to a non-Curator proposal and the proposing role has no subsequent action in the flow. Reserve `NN-owner-to-[role].md` for artifacts where the named role has an explicit next action. The two forms should be mutually exclusive.
**Why Owner-required:** Adds a new rule to the records convention — direction decision.

---

### P6. Tooling addendum — post-Phase-6 component gate conditions and the record gap design question

**Sources:** TA finding #3, Developer finding #3, Developer finding #5, TA finding #4, Owner finding #6
**Gap 1 (advisory mode generalization):** The addendum's Phase 1 and advisory mode language was written for the original six-component tooling launch. For Phase 1A — a component added after the initial phases close — the addendum does not describe the gate condition, the TA advisory trigger, or the Developer session-open criteria. The Owner resolved these correctly in `04-owner-decision.md` C3, but a future Developer or TA reading only the addendum has no guidance. Developer finding #3 identified the same gap for the Developer role doc's Phase 0 gate clause — it also names only the original four gate artifacts and does not describe the gate for subsequent component additions.
**Gap 2 (record gap — design question):** The record convention has no lightweight artifact type for "role completed work cleanly" (Developer's Phase 1A completion) or "advisory role was available but not invoked" (TA non-involvement during Phase 1A). Whether to add such an artifact type is a design question: the cost is more artifacts per flow; the benefit is a record that can be audited without relying on Owner paraphrase.

**Proposed fix (advisory mode):** Update `$A_SOCIETY_TOOLING_ADDENDUM` to add a "Post-Phase-6 Component Additions" subsection or note under Phase 7, describing: (a) Developer session opens after Owner-approved spec entry in `$A_SOCIETY_TOOLING_PROPOSAL`; (b) TA advisory mode is on-demand only when deviation is escalated — not required at phase completion if no deviation occurred; (c) Phase 0 gate for the Developer role doc should be updated or annotated to describe the gate for post-initial-launch additions.

**Proposed fix (record gap) — Owner decision required:** Surface as a design question: should `$A_SOCIETY_RECORDS` add a lightweight artifact type (e.g., `NN-[role]-status.md`) for clean-completion and advisory-non-involvement outcomes? This is a structural decision about the record convention; the Curator will implement whatever the Owner decides.

**Why Owner-required:** Both items involve structural changes to the addendum and/or the records convention — direction decisions.

---

### P7. Tooling scope questions — shared utils and backward pass trigger prompt tool

**Sources:** Developer finding #2, Owner finding #5
**Gap 1 (shared utils):** `extractFrontmatter()` is duplicated verbatim in two components. No `tooling/src/utils.ts` exists for genuinely generic functions with no component-specific logic. The no-cross-component-dependencies constraint is correct per spec for Component 7, but the absence of a sanctioned shared utility location means duplication will accumulate as components grow.
**Gap 2 (backward pass trigger prompt tool):** The backward pass trigger prompt is fully deterministic given the record folder identifier and backward pass role list. Owner identified a thin tool — either a Component 4 extension or a standalone utility — that generates the ordered role list and a copyable trigger prompt for each role. The current manual composition process produced inconsistencies across sessions in this flow.

Both items require Owner authorization as new tooling scope before any Developer session is opened.

**Why Owner-required:** Both involve structural additions to `tooling/` — new scope decisions.

---

## Generalizable Findings Log

Per `$A_SOCIETY_IMPROVEMENT`, findings flagged as potentially generalizable to `a-society/general/` are recorded here so they are not lost pending availability of a submission mechanism.

| Theme | Sources | Proposed general/ target |
|---|---|---|
| Existing-session handoff format | Developer #5, Curator #4, TA #5, Owner #4 | `general/roles/` templates; `$INSTRUCTION_ROLES` |
| Backward pass ordering for multi-role flows | Owner #2 | `$GENERAL_IMPROVEMENT`; `$INSTRUCTION_IMPROVEMENT` (if exists) |

Both are covered in P1 and P2 respectively.

---

## Routing Summary

| Item | Source(s) | Routing | Affected Document(s) |
|---|---|---|---|
| C1. Coupling map header fix | TA #2 | Curator-direct | `$A_SOCIETY_TOOLING_COUPLING_MAP` |
| C2. Document known test failures | Developer #1 | Curator-direct | `$A_SOCIETY_TOOLING_ADDENDUM` or `$A_SOCIETY_TOOLING_PROPOSAL` |
| P1. Existing-session handoff format | All four roles | Owner approval | All role docs; `general/roles/`; `$INSTRUCTION_ROLES` |
| P2. Multi-role backward pass ordering | Curator, TA, Owner | Owner approval | `$A_SOCIETY_IMPROVEMENT`; `$A_SOCIETY_TOOLING_ADDENDUM`; `$GENERAL_IMPROVEMENT` |
| P3. INVOCATION.md obligation + a-docs/ dependency TA guidance | Curator #2, #5; TA #2 | Owner approval | `$A_SOCIETY_TOOLING_COUPLING_MAP`; `$A_SOCIETY_TOOLING_ADDENDUM`; `$A_SOCIETY_TOOLING_PROPOSAL` or `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` |
| P4. Brief-authoring conventions | Curator #1; Owner #3, #7; TA #1 | Owner approval | `$A_SOCIETY_COMM_TEMPLATE_BRIEF`; `$A_SOCIETY_CURATOR_ROLE` |
| P5. Decision artifact naming rule | Owner #1 | Owner approval | `$A_SOCIETY_RECORDS` |
| P6. Post-Phase-6 gate conditions + record gap design question | TA #3; Developer #3, #5; TA #4; Owner #6 | Owner approval | `$A_SOCIETY_TOOLING_ADDENDUM`; `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`; `$A_SOCIETY_RECORDS` |
| P7. Shared utils.ts + trigger prompt tool | Developer #2; Owner #5 | Owner approval | `tooling/` (new scope) |

---

## Handoff

C1 and C2 are Curator-direct — implementing after this synthesis is filed.

P1–P7 require Owner decision. Switch to the Owner's existing session (Session A). The Owner should read this synthesis and respond with a decision on each proposal group — approving as stated, approving with modifications, or deferring to a future flow with a stated reason. Respond at `16-owner-to-curator.md` in this record folder.

Copyable input for Owner session:
> Read `a-society/a-docs/records/20260318-tooling-enforcement-mechanism/15-curator-synthesis.md`. This is the Curator synthesis for the backward pass. For each proposal group P1–P7, provide your decision: approve as stated, approve with modifications (specify), or defer to a future flow (give reason). Respond at `16-owner-to-curator.md` in the same record folder.
