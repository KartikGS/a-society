# Backward Pass Findings: Curator — 20260316-workflow-dynamic-complexity

**Date:** 2026-03-16
**Task Reference:** 20260316-workflow-dynamic-complexity
**Role:** Curator
**Depth:** Standard

---

## Phase Reflection

### Phase 1 — Proposal

The brief's three open questions were tightly scoped: each named the decision to be made, the options available, and the evaluation criteria. This gave the proposal a clear frame and allowed all three questions to be resolved without a revision cycle. The brief format worked well here — the separation between "Agreed Change" and "Open Questions" kept direction and decision distinct.

One observation: the brief embedded the likely target file path (`complexity.md`) but flagged it as "subject to the Curator's placement assessment." This was the right pattern — direction without over-specification, with the Curator holding the assessment responsibility. Worth noting as a positive signal that the brief format handles design uncertainty correctly.

### Phase 3 — Implementation

The Tier 1 record artifacts constraint from Phase 2 was a correct and necessary catch. The presence of "The implementation files" in the record artifacts list was a conceptual slip — conflating implementation work product with record artifacts. The correction was straightforward and the Owner's framing ("implementation files are produced at their permanent locations; the record folder holds only the plan and findings artifacts") was incorporated directly.

Manifest check outcome: correctly determined to be a no-op. The manifest enumerates `a-docs/` output artifacts, not `general/instructions/` source files. This distinction was not obvious from the manifest's description alone — it required reading the manifest's actual entries to confirm.

---

## Cross-Layer Consistency Check

Two gaps identified — both align with the Owner's findings:

**1. Owner role documents are disconnected from `$INSTRUCTION_WORKFLOW_COMPLEXITY`.**

The Owner's role document (both `$A_SOCIETY_OWNER_ROLE` and `$GENERAL_OWNER_ROLE`) defines what the Owner does but will not reference complexity analysis as an intake responsibility until updated. This is a direct cross-layer gap: a new general instruction exists that defines a core Owner behavior, but the role documents that govern Owner agents are unaware of it. This is the higher-priority fix.

**2. `$INSTRUCTION_WORKFLOW` has no pointer to `$INSTRUCTION_WORKFLOW_COMPLEXITY`.**

The workflow creation instruction is the natural entry point for any agent approaching workflow guidance. An agent reading `main.md` to understand workflows will not discover the complexity instruction. The cross-reference added to `$INSTRUCTION_WORKFLOW_MODIFY` helps agents already in modification mode, but doesn't address agents at the broader entry point.

Both gaps are outside the current brief's scope — the brief explicitly scoped cross-references to `$INSTRUCTION_WORKFLOW_MODIFY` only. They are flagged here as candidates for follow-up maintenance proposals.

---

## Findings

### Missing Information

**1. Owner role documents (`$A_SOCIETY_OWNER_ROLE`, `$GENERAL_OWNER_ROLE`) do not reference complexity analysis.**

An Owner agent instantiated in any project has no indication from their role document that intake complexity analysis is expected. The instruction exists; the role is unaware. This is the most impactful gap — the Owner is the sole executor of the complexity model, and the disconnection means the capability will be underused.

**Candidate for follow-up maintenance proposal (priority 1).**

**2. `$INSTRUCTION_WORKFLOW` (main.md) has no reference to `$INSTRUCTION_WORKFLOW_COMPLEXITY`.**

The primary workflow instruction entry point does not surface the new instruction. Discovery depends on a reader already being in `$INSTRUCTION_WORKFLOW_MODIFY` and reading its relationship section. This is navigational friction.

**Candidate for follow-up maintenance proposal (priority 2).**

### Conflicting Instructions

None.

### Unclear Instructions

None identified during implementation. The Hard Rules applicability table in the draft resolved the ambiguities most likely to arise at read time.

### Redundant Information

None.

### Scope Observations

The manifest determination required reading the manifest file directly — the manifest's own description ("update this file when a new artifact type is added to `general/instructions/`") could be read as implying an update was required. The Owner's approval artifact correctly deferred this to the Curator's judgment during implementation. The resolution was correct but the manifest's maintainer comment is mildly ambiguous about whether instruction files themselves (vs. the a-docs artifacts they produce) fall within scope. This is not an actionable finding for this flow — noting it in case the manifest's description is revisited.

---

## Top Findings (Ranked)

1. Owner role documents (`$A_SOCIETY_OWNER_ROLE`, `$GENERAL_OWNER_ROLE`) do not reference complexity analysis — Owner agents have no path from their role document to `$INSTRUCTION_WORKFLOW_COMPLEXITY`; follow-up maintenance proposal required
2. `$INSTRUCTION_WORKFLOW` has no pointer to `$INSTRUCTION_WORKFLOW_COMPLEXITY` — primary workflow entry point does not surface the new instruction; one-line addition in follow-up maintenance proposal
