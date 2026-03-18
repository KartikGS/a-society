**Subject:** Developer completion report — utils.ts + Component 4 trigger prompt extension
**Role:** Tooling Developer
**Date:** 2026-03-18
**Record:** 20260318-utils-bp-trigger-tool

---

## 1. What Was Implemented

### Item 1 — utils.ts

Created `tooling/src/utils.ts` with a single exported function:

```typescript
export function extractFrontmatter(content: string): string | null
```

Updated three component files per the spec:

| File | Change |
|---|---|
| `workflow-graph-validator.ts` | Removed own `extractFrontmatter` definition and its export; added import from `./utils.js` |
| `plan-artifact-validator.ts` | Removed private `extractFrontmatter` definition; added import from `./utils.js` |
| `backward-pass-orderer.ts` | Updated import source from `./workflow-graph-validator.js` to `./utils.js` for `extractFrontmatter`; continues importing `validateWorkflowFile` and `WorkflowDocument` from `./workflow-graph-validator.js` |

Added `test/utils.test.ts` with 7 tests covering: valid frontmatter extraction, no-frontmatter input, content-before-delimiter input, CRLF line endings, empty frontmatter block, first-block-only extraction, and multiline values.

Updated `test/workflow-graph-validator.test.ts`: import of `extractFrontmatter` redirected to `../src/utils.js` (the 3 existing extractFrontmatter tests in that file remain unchanged; they now test via utils.ts).

Added `test/utils.test.ts` to the npm test script in `package.json`.

---

### Item 2 — Component 4 trigger prompt extension

Added to `tooling/src/backward-pass-orderer.ts`:

**Interfaces:**
- `TriggerPromptOptions` — optional `flowName` and `recordFolderPath` fields
- `BackwardPassTriggerEntry` — extends `BackwardPassEntry` with `trigger_prompt: string`

**Functions:**
- `generateTriggerPrompts(order, options?)` — pure function; generates per-role trigger prompts from a computed backward pass order
- `orderWithPromptsFromFile(filePath, firedNodeIds?, options?)` — convenience wrapper combining `orderFromFile` + `generateTriggerPrompts`

Both Owner corrections applied:
- Template uses `"You are the [role] agent..."` (not `"a"`)
- Path is `a-society/a-docs/agents.md` (no leading slash)

Added 12 new tests in `test/backward-pass-orderer.test.ts` covering: output shape, "the" vs "a" for both roles, no-leading-slash path, options inclusion (non-synthesis and synthesis), options omission with no consecutive empty lines, handoff naming (including `(synthesis)` suffix), synthesis-specific text, field preservation, and `orderWithPromptsFromFile` with and without options.

---

## 2. Deviations

**One deviation from the advisory — test file scope:**

The advisory notes that `extractFrontmatter` was previously exported from `workflow-graph-validator.ts` and that `backward-pass-orderer.ts` already imported from there. The `workflow-graph-validator.test.ts` also imported `extractFrontmatter` directly from `workflow-graph-validator.js`. The advisory's spec table did not address this test file import — only the source files.

Removing the export from `workflow-graph-validator.ts` broke `workflow-graph-validator.test.ts`. The fix was to update that test file's import to `../src/utils.js`. This is a consequence of the approved change, not a new design decision. No TA escalation required — the test file change is mechanical and follows directly from the approved export removal.

**Spec update required:** None. The advisory's source-file change table is complete and accurate. The test file update is an implementation detail, not a spec gap.

---

## 3. Test Results

All suites pass:

| Suite | Result |
|---|---|
| utils | 7 passed, 0 failed |
| path-validator | 9 passed, 0 failed |
| plan-artifact-validator | 18 passed, 0 failed |
| consent-utility | 18 passed, 0 failed |
| workflow-graph-validator | 18 passed, 0 failed |
| backward-pass-orderer | 28 passed, 0 failed |
| scaffolding-system | 27 passed, 0 failed |
| integration | 16 passed, 0 failed |

version-comparator: 3 pre-existing failures (fixture drift documented in addendum Phase 1 note — fixtures record v11.1, VERSION.md has since advanced). These failures pre-date this work and are unrelated to any change made here.

---

## 4. Handoff

Per `04-owner-to-developer.md`: TA reviews Component 4 implementation against the spec; Owner is informed when complete.

Switch to: existing TA session.

```
Next action: TA reviews Component 4 implementation against 03-ta-advisory.md and 04-owner-to-developer.md
Read: a-society/a-docs/records/20260318-utils-bp-trigger-tool/05-developer-completion.md
      a-society/tooling/src/backward-pass-orderer.ts
      a-society/tooling/src/utils.ts
Expected response: TA confirms no deviations (or flags any); Owner informed when complete
```
