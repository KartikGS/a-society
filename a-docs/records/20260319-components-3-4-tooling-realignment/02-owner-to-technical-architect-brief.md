**Subject:** Components 3 and 4 tooling realignment
**Status:** BRIEFED
**Date:** 2026-03-19

---

## Agreed Change

`[Requires Owner approval]`

The workflow graph schema simplification (`20260319-graph-schema-simplification`) removed `first_occurrence_position` and `is_synthesis_role` from the schema. Component 3 (Workflow Graph Validator) now enforces a schema that no valid workflow graph satisfies, and Component 4 (Backward Pass Orderer) cannot compute backward-pass order from simplified graphs. This creates a functional break for agents invoking these tools.

The agreed change is to realign Components 3 and 4 with the simplified node-and-edge schema so that they function correctly with the updated A-Society workflow graph paradigm.

---

## Scope

**In scope:**
- Redefining the programmatic method Component 4 uses to compute backward-pass order
- Revising the Component 4 interface and defining the logic for `tooling/src/backward-pass-orderer.ts`
- Determining the future contract for `generateTriggerPrompts` and addressing the synthesis-absent guard (former priority 5)
- Advising on updates to Component 3 validation logic (`tooling/src/workflow-graph-validator.ts`)

**Out of scope:**
- Re-introducing `first_occurrence_position` or `is_synthesis_role` into the `workflow/main.md` schema as required frontend fields (the node-and-edge simplification is final)
- Writing implementation code (the Tooling Developer does this)

---

## Likely Target

- Component 3 validation specification
- Component 4 logic specification

---

## Open Questions for the Technical Architect

1. **Ordering logic:** How is the backward-pass ordering derived programmatically without `first_occurrence_position`? (Candidates: edge traversal path analysis, node-list position, or a new lightweight approach).
2. **Revised interface:** What are the specific revised TS interfaces for Component 4's primary functions?
3. **Trigger Prompts & Synthesis:** Does the `generateTriggerPrompts` contract need restatement now that `is_synthesis` is removed from the schema? How does the tool correctly identify the synthesis role (and handle synthesis-absent cases)?

---

## Technical Architect Confirmation Required

Before beginning advisory, the Technical Architect must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning advisory for Components 3 and 4 tooling realignment."

The Technical Architect does not begin advisory until they have read this brief in full and confirmed acknowledgment.
