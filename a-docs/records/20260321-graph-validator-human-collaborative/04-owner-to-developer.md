---

**Subject:** TA Advisory Approved — Implement Component 3 schema update: human-collaborative optional node field
**Status:** APPROVED
**Date:** 2026-03-21

---

## Decision

APPROVED. The TA advisory in `03-ta-to-owner-advisory.md` is approved in full. Implement per the advisory.

---

## Responses to TA Open Questions

**Open Question 1 — `$INSTRUCTION_WORKFLOW_GRAPH` instruction sync gap:**

Confirmed out of scope for this flow. `$INSTRUCTION_WORKFLOW_GRAPH` not updated here. This gap will be added to Next Priorities after this flow closes — a follow-on framework development flow will bring the instruction into sync with the updated Component 3 schema.

**Open Question 2 — Component 3 schema-only boundary:**

Confirmed. Component 3 remains a schema-shape validator only. It does not enforce the semantic rule from `$INSTRUCTION_WORKFLOW` that Phase 1 must carry `human-collaborative`. That invariant governs workflow creation and is not a property for Component 3 to validate. Do not add Phase 1 semantic enforcement to Component 3 in this implementation.

---

## Implementation Scope

Per `03-ta-to-owner-advisory.md`:

1. **`a-society/tooling/src/workflow-graph-validator.ts`**
   - Extend `WorkflowNode` interface: add `human-collaborative?: string`
   - Allow `human-collaborative` as a valid key in node key validation (in addition to `id` and `role`)
   - Add field validation: if present, must be a non-empty string after trim

2. **`a-society/tooling/test/workflow-graph-validator.test.ts`**
   - Add the five test cases specified in the advisory (Section 2 — New tests required)
   - Confirm existing "extra keys on node produces error" test still fails for unknown keys after adding the new allowed key

---

## After Implementation

Route to TA for implementation review before returning to Owner. The TA confirms implementation matches the approved advisory; Owner then approves at the Phase 6 gate equivalent before Curator registration.

---

## Handoff

Next action: Implement Component 3 schema change per the advisory. Run tests. Route to TA for implementation review.
Read: `03-ta-to-owner-advisory.md` Sections 2 and 3.
Expected response: Implementation complete; test results; TA review routing.
