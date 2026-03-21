---
**Subject:** TA Implementation Review Ruling: Component 3 `human-collaborative` schema update
**Status:** MATCH — READY FOR OWNER APPROVAL
**Date:** 2026-03-21
---

## TA Ruling

Implementation in `a-society/tooling/src/workflow-graph-validator.ts` matches the approved TA advisory in `03-ta-to-owner-advisory.md` (Section 2) for Component 3 scope.

## Verification Against Approved Scope

### 1) Type surface — MATCH

- `WorkflowNode` now includes optional `'human-collaborative'?: string`.

### 2) Allowed keys enforcement — MATCH

- Node-key allowlist now permits `id`, `role`, and `human-collaborative`.
- Unknown keys continue to be rejected.

### 3) Field validation behavior — MATCH

- When present, `human-collaborative` is validated as:
  - string type
  - non-empty after trim
- Error path/message aligns with intended behavior:
  - `workflow.nodes[i].human-collaborative must be a non-empty string if present`

### 4) Test coverage requested by advisory — MATCH

`a-society/tooling/test/workflow-graph-validator.test.ts` includes:

1. valid node with `human-collaborative` passes
2. non-string value rejected
3. empty/whitespace value rejected
4. unknown node keys still fail (regression)
5. backward compatibility case without `human-collaborative` remains valid

## Runtime Check

Executed:

- `npx tsx test/workflow-graph-validator.test.ts`

Result:

- `14 passed, 1 failed`
- Failing case: `live A-Society workflow passes validation`
- Failure reason: `a-society/a-docs/workflow/main.md` currently lacks YAML frontmatter at file start

Assessment:

- This failure is pre-existing and unrelated to the `human-collaborative` schema change.
- It does not indicate a mismatch between implementation and approved Component 3 scope.

## Companion Scope Confirmation

- Component 4 remains unchanged, consistent with approved advisory section on companion implications.

## Owner Decision Request

Approved advisory scope has been implemented faithfully for Component 3.

Owner can proceed with Phase 5 (Implementation Approval), with registration follow-through to ensure invocation/coupling documentation updates are completed in Curator phase.

