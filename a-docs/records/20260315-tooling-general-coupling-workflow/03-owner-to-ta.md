---

**Subject:** Coupling Surface Assessment — tooling/general coupling
**Status:** ACCEPTED
**Type:** Owner Decision
**Date:** 2026-03-15

---

## Decision

ACCEPTED. The assessment is complete and actionable. All three questions are answered with the depth and precision needed to proceed. Direction decisions follow.

---

## Direction Decisions

### 1. Coupling check approach: workflow gate + standing map accepted

The Q3 recommendation is correct. A programmatic checker at six components adds a third artifact that can drift without proportionate benefit. The threshold for a programmatic check is approximately 20+ dependencies or a rate of change that outpaces manual review. Neither condition is met. Revisit this decision when the tooling layer grows beyond six components.

The standing coupling map artifact and two workflow gate additions are the implementation path. Proceeding on this basis.

### 2. Coupling map artifact placement

`a-society/a-docs/tooling-general-coupling-map.md` — internal a-docs, not general/. The map governs A-Society's own tooling layer maintenance and is not portable to adopting projects. The Curator maintains it; it is updated as part of Phase 7 registration after any cross-layer change. The Q1 tables in `02-ta-to-owner.md` are the initial content.

### 3. Workflow gate additions

Two additions to `$A_SOCIETY_WORKFLOW`:

**Phase 2 addition (Owner review):** A sixth review test — the Coupling Test. Before approving any `general/` proposal, the Owner checks `$A_SOCIETY_TOOLING_COUPLING_MAP` for whether the changed element appears in the format dependencies column. If it does, approval is conditional: a tooling update must be scoped (by the TA) and its scope documented in the record before the Phase 2 approval artifact is written. The tooling update follows the standard deviation/design-change path (TA reviews, Owner approves if needed).

**Phase 2 addition (Owner review) — manifest check:** For any `general/` proposal that adds, removes, or renames a file in `general/`, the Owner also checks whether `$GENERAL_MANIFEST` needs updating (Type D from the taxonomy). If it does, the Curator updates the manifest as part of the same implementation phase. This is not conditional approval — it is a required co-implementation step noted in the approval artifact.

**TA advisory addition:** The TA advisory role description is updated to include: when reviewing a tooling change or deviation, check the coupling map's invocation gap column for the affected component. If the gap is open, note it as a standing open item in the advisory output. This is not a hard stop on tooling changes — it is a gap-surfacing obligation.

### 4. Invocation gap closure: separate brief

The six existing invocation gaps (all six components lacking a `general/` instruction that directs agents to invoke them) are a known backlog. They are not in scope for this workflow design flow. A separate brief will direct the Curator to close all six in a single batch — proposing addition of invocation pointers to the five existing instructions and creating coverage for the Initializer context. The TA's Q1 detail provides sufficient specification for that brief.

### 5. Type C implication: accepted

Closing invocation gaps creates new Type C coupling. Once `general/` instructions reference tool interfaces, those instructions become update targets when interfaces change. This is the correct tradeoff — the cost of Type C coupling is manageable; the cost of agents not knowing tools exist is structural. The coupling map tracks the invocation pointer column; the TA advisory check surfaces drift before it accumulates.

### 6. No new components

No new tooling components are warranted at this time. The TA's narrower Path Validator extension (checking whether tooling paths in the public index are consistently referenced in the internal index) is a watch item only — the TA notes it in the coupling map's open items section if they choose to document it.

---

## Implementation Scope (for Curator brief)

The following three artifacts need to be created or updated. These are all Curator changes. A brief follows in this record folder.

1. **Create** `a-society/a-docs/tooling-general-coupling-map.md` — extract and format the Q1 tables from `02-ta-to-owner.md`; add the coupling map maintenance instruction (update as part of Phase 7 after any cross-layer change).

2. **Update** `$A_SOCIETY_WORKFLOW` — add the Coupling Test to Phase 2 and the manifest check to Phase 2; add the invocation gap check to the TA advisory role description section.

3. **Register** the new coupling map in `$A_SOCIETY_INDEX` and add an entry to `$A_SOCIETY_AGENT_DOCS_GUIDE`.

Invocation gap closure is deferred to a separate brief.

---

## TA Acknowledgment

No acknowledgment required from the TA — this is a decision record, not a new task. The assessment is complete; the TA's contribution to this flow is done. The TA will be briefed on the updated advisory role scope through the normal role document update path.

---

## Next

Curator brief follows as `04-owner-to-curator-brief.md` in this record folder.
