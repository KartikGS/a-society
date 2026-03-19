**Subject:** Workflow graph schema simplification — proposal and scope assessment
**Status:** APPROVED
**Date:** 2026-03-19

---

## Decision

APPROVED.

---

## Rationale

All seven review tests pass:

1. **Generalizability** — the simplified schema (nodes with `id` + `role`, edges with `from`/`to`/optional `artifact`) applies identically to a software project, a writing project, and a research project. No domain assumptions.
2. **Abstraction level** — correct. `id` + `role` is the minimum structural contract that enables tools and agents to reason about the graph. Nothing is missing; nothing is extraneous.
3. **Duplication** — modifications to existing documents only; no new duplication introduced.
4. **Placement** — all targets correct: `$INSTRUCTION_WORKFLOW_GRAPH` in `general/`, `$A_SOCIETY_WORKFLOW` in `a-docs/`, `$A_SOCIETY_TOOLING_INVOCATION` in `tooling/`, `$A_SOCIETY_TOOLING_COUPLING_MAP` in `a-docs/`.
5. **Quality** — draft content is complete and actionable. The replacement schema, field definitions, and revised how-to steps are sufficient for an unfamiliar agent to produce a correct simplified graph.
6. **Coupling** — correctly classified as Type A for Components 3 and 4. Coupling map entries proposed; TA advisory correctly noted as out of scope for this flow.
7. **Manifest** — no files added to or removed from `general/`; no manifest update required.

Open-question assessments are all correct. The decision to leave `$A_SOCIETY_IMPROVEMENT` and `$A_SOCIETY_TOOLING_ADDENDUM` unchanged is sound.

---

## Implementation Constraints

**Trigger Sources prose:** When updating the backward-pass bullet in the Trigger Sources section of `$A_SOCIETY_WORKFLOW`, align the language with how `$A_SOCIETY_IMPROVEMENT` actually describes findings re-entry. The proposed phrasing ("new flows started only when Owner judgment or a new tracked change is required") is directionally correct but imprecise. Use language that matches the two-path model in `$A_SOCIETY_IMPROVEMENT`: Curator-authority findings are implemented directly; Owner-judgment findings enter the standard workflow as new trigger inputs.

**Ink project:** When the update report is produced (see Follow-Up Actions), include a note that the Ink project workflow uses the old schema and will need migration. This surfaces the adoption impact to any Curator working in that project.

---

## Follow-Up Actions

1. **Update report:** Consult `$A_SOCIETY_UPDATES_PROTOCOL` to determine whether a framework update report is required. Do not pre-assume classification. The change modifies `$INSTRUCTION_WORKFLOW_GRAPH` in `general/`, which is a foundational schema document — a report is likely, but classification is determined by the protocol, not by anticipation. If no report is required, record the determination in backward-pass findings.
2. **Backward pass:** Required from both roles.
3. **Version increment:** If an update report is produced, handle version increment as part of Phase 4 registration.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of Workflow graph schema simplification — proposal and scope assessment."

The Curator does not begin implementation until they have acknowledged in the session.
