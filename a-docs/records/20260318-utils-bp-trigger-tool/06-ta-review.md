**Subject:** TA Implementation Review — utils.ts + Component 4 trigger prompt extension
**To:** Owner (Session A)
**Status:** REVIEW COMPLETE — No deviations
**Date:** 2026-03-18
**Record:** 20260318-utils-bp-trigger-tool

---

## Verdict

**No deviations.** The implementation matches the approved spec (`03-ta-advisory.md`) and the two Owner corrections (`04-owner-to-developer.md`) exactly. All required artifacts are present and the test suite passes.

---

## Review Checklist

### Item 1 — utils.ts

| Check | Result |
|---|---|
| `tooling/src/utils.ts` created with single export `extractFrontmatter(content: string): string | null` | ✓ |
| Implementation: same regex (`/^---\r?\n([\s\S]*?)\r?\n---/`), same return type | ✓ |
| `workflow-graph-validator.ts`: imports from `./utils.js`; `extractFrontmatter` removed from own definitions and exports | ✓ |
| `plan-artifact-validator.ts`: imports from `./utils.js`; private copy removed | ✓ |
| `backward-pass-orderer.ts`: `extractFrontmatter` imported from `./utils.js`; `validateWorkflowFile` and `WorkflowDocument` continue from `./workflow-graph-validator.js` | ✓ |
| `test/utils.test.ts` created with 7 tests (valid extraction, no frontmatter, content-before-delimiter, CRLF, empty block, first-block-only, multiline) | ✓ |

### Item 2 — Component 4 extension

| Check | Result |
|---|---|
| `TriggerPromptOptions` interface: `recordFolderPath?: string`, `flowName?: string` | ✓ |
| `BackwardPassTriggerEntry` extends `BackwardPassEntry` with `trigger_prompt: string` | ✓ |
| `generateTriggerPrompts(order, options?)` signature and return type | ✓ |
| `orderWithPromptsFromFile(filePath, firedNodeIds?, options?)` signature and return type | ✓ |
| `orderWithPromptsFromFile` implementation matches spec: `generateTriggerPrompts(orderFromFile(filePath, firedNodeIds), options)` | ✓ |
| Owner Correction 1: templates use `"You are the [role] agent..."` (not `"a"`) | ✓ |
| Owner Correction 2: path is `a-society/a-docs/agents.md` (no leading slash) | ✓ |
| Synthesis template: opening line, position/total/final-step phrasing, optional context lines (omitted if absent), final instruction | ✓ |
| Non-synthesis template: opening line, findings review phrasing, position block with optional context, handoff line with `(synthesis)` suffix when appropriate | ✓ |
| `generateTriggerPrompts` is pure (no file I/O) | ✓ |
| All `BackwardPassEntry` fields preserved via spread (`{ ...entry, trigger_prompt }`) | ✓ |
| 12 new tests in `test/backward-pass-orderer.test.ts`; covers all spec-required cases | ✓ |

### Developer-reported deviation assessment

The Developer reported one deviation: updating `workflow-graph-validator.test.ts` to import `extractFrontmatter` from `../src/utils.js` after its export was removed from the source file.

**TA assessment: not a deviation.** This is a mechanical consequence of the approved export removal, not a new design decision. The test file update correctly follows from the approved change. No escalation required.

### Test results

All relevant suites pass (developer report confirmed):
- utils: 7/7
- workflow-graph-validator: 18/18
- backward-pass-orderer: 28/28 (16 pre-existing + 12 new)
- All other suites unchanged and passing

The 3 pre-existing version-comparator failures are documented fixture drift (addendum Phase 1 note). Unrelated to this work.

---

## One Observation (Spec Gap — Not a Deviation)

In `generateTriggerPrompts`, the line `const nextEntry = order[N]` would produce a TypeError if called with a synthesis-absent order (possible when `firedNodeIds` excludes the synthesis node) — `order[total]` is undefined, and `nextEntry.is_synthesis` would throw.

This is a **spec gap**: the advisory did not specify behavior for synthesis-absent orders. The Developer implemented exactly what was specified. The edge case will not occur in any documented workflow (backward pass always includes synthesis; the workflow graph validator requires exactly one synthesis node per graph, so synthesis is only absent if explicitly excluded via `firedNodeIds`).

Flagging for Owner awareness. No remediation required before Curator doc updates proceed.

---

## Coupling Map Note

Checking the invocation gap for Component 4 (standing obligation per TA role doc): gap remains closed (2026-03-15, `$GENERAL_IMPROVEMENT`). The trigger prompt capability is not yet named in `$GENERAL_IMPROVEMENT`. Per the watch item in the advisory: the Curator should evaluate at Phase 7 whether the capability warrants mention. This is a watch item, not a blocker.

---

## Handoff

Switch to: Owner Session A (existing session).

```
Next action: Owner receives TA confirmation — no deviations — and routes to Curator for doc updates
Read: a-society/a-docs/records/20260318-utils-bp-trigger-tool/06-ta-review.md
Expected response: Owner routes Curator session for: INVOCATION.md Type C update (Component 4 new functions);
  architecture component table update (Component 4 description); coupling map Type C update;
  TA watch item assessment (trigger prompt capability in $GENERAL_IMPROVEMENT)
```
