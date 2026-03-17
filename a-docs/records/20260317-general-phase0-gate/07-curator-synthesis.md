# Curator Synthesis — 20260317-general-phase0-gate

**Date:** 2026-03-17
**Task Reference:** 20260317-general-phase0-gate
**Role:** Curator

---

## Source Findings

- `05-curator-findings.md` — 3 findings
- `06-owner-findings.md` — 3 findings (1 new, 2 overlapping and deepening Curator findings)

---

## Consolidated Actionable Items

### Item A — `$A_SOCIETY_RECORDS` artifact sequence is stale

**Source:** Owner finding 1
**Routing:** Curator-authority MAINT — implement directly

The artifact sequence table documents `01-` as `owner-to-curator-brief.md`. Since Phase 0 was formalized, `01-` is `owner-workflow-plan.md` and the brief shifts to `02-`. All subsequent standard positions shift by one. The "Creating a Record Folder" section also directs the Owner to create `01-owner-to-curator-brief.md` as the first step — this must be corrected to create the plan first, then the brief.

**Action:** Update `$A_SOCIETY_RECORDS` — artifact sequence table (all positions) and "Creating a Record Folder" section.

**Cross-layer note:** The general `$INSTRUCTION_RECORDS` may need a corresponding check — Phase 0 gate is now part of the general Owner role template, so the general records instruction may be out of step. This is outside the current flow's scope; flagged as a candidate for a future flow.

---

### Item B — Brief-Writing Quality language minimizes the approval gate

**Source:** Owner finding 2; deepens Curator finding 3
**Routing:** Owner judgment required — submit as proposal; touches `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_OWNER_ROLE`, `$A_SOCIETY_COMM_TEMPLATE_BRIEF`

"The proposal round becomes a confirmation step" is accurate about the Curator's judgment workload for fully-specified briefs, but it understates the structural role of the approval round as the gate that authorizes implementation. An agent reading this language may conclude the gate is procedural rather than structural. The fix would add a note — in the Brief-Writing Quality section and/or the brief template's authorization scope block — that "confirmation step" refers to the scope of judgment required, not to the structural requirement for an APPROVED decision before implementation begins.

**Action:** Curator to submit proposal to Owner. Scope: targeted language addition to `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality section; corresponding addition to `$GENERAL_OWNER_ROLE` Brief-Writing Quality section; possible clarification in `$A_SOCIETY_COMM_TEMPLATE_BRIEF` authorization scope block. Owner reviews before implementation.

---

### Item C — Approval Invariant authorization boundary absent from the point of action

**Source:** Owner finding 3; deepens Curator findings 1 and 2; Owner flags direction decision involved
**Routing:** Owner judgment required — submit as proposal; touches `$A_SOCIETY_CURATOR_ROLE` hard rules; direction decision

The authorization boundary is documented in `$A_SOCIETY_WORKFLOW` but absent from the documents an agent reads immediately before acting: the brief format and the Curator's own hard rules. The Owner surfaces a candidate fix: add an explicit pre-implementation check to `$A_SOCIETY_CURATOR_ROLE` hard rules — "Do not begin writing to `general/` until an APPROVED decision artifact exists in the active record folder." Whether this rises to a hard rule (which "cannot be overridden by any other instruction") is a direction decision.

**Action:** Curator to submit proposal to Owner. Scope: proposed hard rule addition to `$A_SOCIETY_CURATOR_ROLE`; assess whether general equivalent belongs in `$GENERAL_CURATOR_ROLE`; Owner decides whether to approve and at what specificity.

---

### Item D — Brief registration scope vs. Curator hard rule interaction undocumented

**Source:** Curator finding 2
**Routing:** Owner judgment required — whether this warrants documentation and where

When a brief specifies registration in one index, the Curator's hard rule (update `indexes/main.md` for any newly referenced file) supplements the brief's explicit scope. No document explains this interaction — agents with less certainty about hard rule priority might skip the internal index registration. The question is whether this deserves explicit documentation in the Curator role or is adequately covered by the hard rule's non-negotiable status.

**Action:** Fold into the Item C proposal — the Curator's pre-implementation checklist and the Curator's hard rule interaction with brief scope are related questions. Owner decides whether to address together or separately.

---

## Immediate Implementation

**Item A** is within Curator authority. Implementing `$A_SOCIETY_RECORDS` fix now.

Items B, C, D: Curator will submit a combined proposal to the Owner in the next flow.

---

## Log Priority Items

The following items should be added to `$A_SOCIETY_LOG` as next priorities:

1. **Fix `$A_SOCIETY_RECORDS` artifact sequence** — Curator-authority MAINT [complete — see below]
2. **Brief-Writing Quality language + Approval Invariant enforcement** — Items B, C, D above; Curator proposes, Owner reviews [S][MAINT][LIB]
