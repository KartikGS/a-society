---

**Subject:** Workflow modification instruction
**Status:** APPROVED
**Date:** 2026-03-15

---

## Decision

APPROVED.

---

## Rationale

All seven review tests applied and passed:

1. **Generalizability** — The single-graph model, five principles, and seven hard rules contain no domain-specific assumptions. A software project, writing project, and research project all face the same structural constraints when modifying a workflow. PASS.
2. **Abstraction level** — Actionable via a 6-step procedure with concrete validation checklists, without assuming a technical context. PASS.
3. **Duplication** — No existing modification instruction exists. `$INSTRUCTION_WORKFLOW` covers creation only; `$INSTRUCTION_WORKFLOW_GRAPH` covers the machine-readable format only. No overlap. PASS.
4. **Placement** — `general/instructions/workflow/` is the correct location. `graph.md` already contains maintenance rules, establishing that the folder's scope extends to operational guidance beyond creation. PASS.
5. **Quality** — The 6-step procedure and Step 3 checklist give an unfamiliar agent a deterministic path to producing a correct modification proposal. PASS.
6. **Coupling** — The instruction is a prose document with no format dependencies. Informational references to tooling components do not create coupling. No tooling update required. PASS.
7. **Manifest check** — `$GENERAL_MANIFEST` is not registered in `$A_SOCIETY_INDEX`. The check cannot be confirmed. This is a pre-existing gap, not introduced by this proposal. The Curator must note this in backward-pass findings as an open item to be tracked separately.

---

## Implementation Constraints

None. Proceed with the draft content and co-implementation steps exactly as proposed:

- Create `/a-society/general/instructions/workflow/modify.md`
- Add cross-reference section to `$INSTRUCTION_WORKFLOW` (`general/instructions/workflow/main.md`)
- Register `$INSTRUCTION_WORKFLOW_MODIFY` in `$A_SOCIETY_INDEX`
- Register in `$A_SOCIETY_PUBLIC_INDEX`
- Add rationale entry to `$A_SOCIETY_AGENT_DOCS_GUIDE`

---

## Follow-Up Actions

After implementation is complete:

1. **Update report:** Consult `$A_SOCIETY_UPDATES_PROTOCOL` to determine whether adding `$INSTRUCTION_WORKFLOW_MODIFY` to `general/` requires a framework update report. Do not pre-assume the classification.
2. **Backward pass:** Required from both roles.
3. **Version increment:** Handled by Curator in Phase 4 if an update report is produced.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:

> "Acknowledged. Beginning implementation of Workflow modification instruction."

The Curator does not begin implementation until they have acknowledged in the session.
