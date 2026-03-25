**From:** Owner
**To:** Tooling Developer
**Re:** component4-synthesis-fixes — two implementation gaps in Component 4
**Date:** 2026-03-24

---

## Authorization

This brief is the approval gate for this flow. No proposal round is required — both fixes are fully specified below. Proceed directly to implementation.

---

## Background

Two gaps were identified in Component 4 (`backward-pass-orderer.ts`) during the backward pass of flow `20260322-component4-design-advisory`:

1. The synthesis prompt produced by `orderWithPromptsFromFile` does not include the record folder path. Because synthesis uses `new-session`, the receiving Curator has no prior context and cannot locate the record folder without an explicit path in the prompt.

2. `test/integration.test.ts` Scenario 5 does not assert the `synthesisRole` value in the computed backward pass plan. A `synthesisRole` of `undefined` passed silently through a prior test run.

---

## Fix 1 — Thread `recordFolderPath` to `createSynthesisPrompt`

**File:** `a-society/tooling/src/backward-pass-orderer.ts`

**Requirement:** When `orderWithPromptsFromFile(recordFolderPath, synthesisRole)` is called, the synthesis entry's `prompt` must embed `recordFolderPath` explicitly — both in the `Read:` line and in the `Produce your synthesis` line.

Current prompt (abridged):
```
Read: all findings artifacts in the record folder, then ...
Produce your synthesis at the next available sequence position in the record folder.
```

Required prompt (abridged):
```
Read: all findings artifacts in <recordFolderPath>, then ...
Produce your synthesis at the next available sequence position in <recordFolderPath>.
```

**Implementation latitude:** How `recordFolderPath` is threaded from `orderWithPromptsFromFile` to `createSynthesisPrompt` is the Developer's choice — options include an optional parameter on `computeBackwardPassOrder`, post-hoc prompt mutation in `orderWithPromptsFromFile`, or a private wrapper. Any approach is acceptable as long as:
- The synthesis prompt produced by `orderWithPromptsFromFile` contains the record folder path.
- The `computeBackwardPassOrder` export continues to work for callers that do not have a record folder path (e.g., unit tests calling with pre-parsed entries). If the threading strategy requires adding a parameter to `computeBackwardPassOrder`, make it optional so existing callers are not broken.

---

## Fix 2 — Assert `synthesisRole` in Scenario 5 integration test

**File:** `a-society/tooling/test/integration.test.ts`

**Location:** The test named `'Scenario 5 — backward pass last entry is synthesis role'` (currently asserts `last.stepType` and `last.sessionInstruction` but not `last.role`).

**Requirement:** Add an assertion that `last.role` equals the `synthesisRole` argument passed to `orderWithPromptsFromFile`. In the integration test, `synthesisRole` is `'Curator'` (line where `orderWithPromptsFromFile(RECORD_FOLDER, 'Curator')` is called).

Add after the existing assertions in that test:
```typescript
assert.strictEqual(last.role, 'Curator', 'synthesis entry role should equal synthesisRole argument');
```

---

## Validation

Run `npm test` from `a-society/tooling/`. Expected outcome: all tests pass, including the updated Scenario 5 assertion. Confirm that Fix 1 is exercised — check that the synthesis prompt in the Scenario 5 backward pass result contains the record folder path string (a quick `console.log` or assertion on `backwardOrder[backwardOrder.length - 1].prompt` is sufficient to confirm during implementation, but does not need to remain in the test).

No TA advisory is needed for either fix.

---

## Open Questions

None.

---

## Submission

When both fixes are validated, produce `03-developer-to-owner.md` in this record folder confirming:
- Both fixes implemented
- `npm test` result (pass/fail counts)
- Any deviation or implementation note worth flagging

Then hand back to Owner (Session A) for review.
