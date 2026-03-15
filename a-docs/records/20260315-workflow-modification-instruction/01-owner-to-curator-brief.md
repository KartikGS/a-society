---

**Subject:** Workflow modification instruction
**Status:** BRIEFED
**Date:** 2026-03-15

---

## Agreed Change

Create a new general instruction document that defines how to modify a workflow in any a-society-initialized project.

The instruction must be built on one foundational insight, established during the Owner/Human conversation that produced this brief:

**A workflow is a single directed graph. The Owner node is the invariant entry point — it never changes. What appears to be "adding a new workflow" is structurally a graph modification: adding new branches from the Owner node. There is no add-vs-modify distinction. There is one operation: graph modification.**

This insight collapses a false binary and clarifies the design problem. The instruction should communicate this model clearly before stating any rules, because without it the rules are opaque.

The instruction must also document:

1. **Principles** — the "why" behind workflows. These are the evaluative criteria any modification must be held against. A modification that satisfies the hard rules but violates a principle is still a bad modification.

2. **Hard rules** — non-negotiable constraints that every node, edge, and phase in a modified or extended graph must satisfy.

The principles and hard rules were established during the Owner/Human session that produced this brief and are reproduced below as the authoritative source. The Curator must not derive them independently — the instruction is a transcription and formalization of what was already decided.

### Principles

1. Agents don't carry context between sessions — every modification must be completable from written artifacts alone.
2. Different expertise catches different problems — role separation must be preserved in any modified structure.
3. Quality gates prevent compounding errors — modifications cannot remove review steps.
4. Workflows are the structure that makes the core bet true — modifications must preserve or improve structure, never degrade it.
5. Traceability and reversibility — the modification itself must go through the workflow; records are always produced.

### Hard Rules

1. Every handoff must produce a written artifact.
2. Every workflow must have at least one approval gate before implementation.
3. Each step must be owned by exactly one role.
4. A workflow must be indexed before it can be referenced.
5. No step may require context that wasn't produced by a prior step.
6. Workflows must be role-defined, not agent-defined.
7. Records are immutable once produced.

---

## Scope

**In scope:**
- Draft `/a-society/general/instructions/workflow/modify.md` — the new instruction document containing the single-graph model, principles, and hard rules
- Register the new file in `$A_SOCIETY_INDEX` and `$A_SOCIETY_PUBLIC_INDEX` with an appropriate variable name (e.g., `$INSTRUCTION_WORKFLOW_MODIFY`)
- Add a rationale entry to `$A_SOCIETY_AGENT_DOCS_GUIDE`

**Out of scope:**
- Modifying `$A_SOCIETY_WORKFLOW` — this instruction describes how to approach modifications; it is not itself a workflow modification
- Changes to any existing workflow instruction documents (`$INSTRUCTION_WORKFLOW`, `$INSTRUCTION_WORKFLOW_GRAPH`, etc.) unless the Curator identifies a necessary cross-reference during proposal formulation

---

## Likely Target

`/a-society/general/instructions/workflow/modify.md`

To be registered as `$INSTRUCTION_WORKFLOW_MODIFY` in `$A_SOCIETY_INDEX`.

---

## Open Questions for the Curator

1. **Placement check:** Verify that `general/instructions/workflow/` accepts this addition per `$A_SOCIETY_STRUCTURE` — specifically that the governing principle for that folder includes modification guidance, not only creation guidance.
2. **Cross-reference:** Assess whether `$INSTRUCTION_WORKFLOW` (how to *create* a workflow) should reference this new document, and include any such cross-reference as an in-scope co-implementation step if warranted.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Workflow modification instruction."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
