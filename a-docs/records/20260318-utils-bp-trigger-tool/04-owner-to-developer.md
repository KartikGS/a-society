**Subject:** Shared utils.ts + Component 4 trigger prompt extension — Owner approval decision
**To:** Tooling Developer
**Status:** APPROVED
**Date:** 2026-03-18

---

## Decision

APPROVED. The TA advisory (03-ta-advisory.md) is the binding specification for this implementation. All items in the advisory summary table are confirmed. Proceed to implementation per the spec, incorporating the two corrections below.

---

## Confirmations

- **Tooling Developer role document:** Unchanged. Existing scope covers this extension.
- **Architecture component table:** Update required. Component 4 description changes from "Computes correct backward pass traversal order from a workflow graph" to "Computes correct backward pass traversal order from a workflow graph and generates per-role session trigger prompts." The Curator updates this row after implementation is complete.
- **Binding spec form:** TA advisory is sufficient. No formal proposal amendment to `$A_SOCIETY_TOOLING_PROPOSAL` is required.
- **Coupling map:** Type C change. No new rows in either table. Curator updates at Phase 7. TA watch item on trigger prompt capability noted.

---

## Required Corrections to the Trigger Prompt Templates (Section 3d)

The advisory specifies two trigger prompt templates. Two corrections are required in the implementation — both are fixes to the template strings; the spec is correct in all other respects.

**Correction 1 — Article handling:**

The advisory template reads: `"You are a [role] agent for A-Society."` This produces grammatically wrong output when role = "Owner" ("You are a Owner agent..."). The Developer must use `"the"` instead of `"a"`:

```
You are the [role] agent for A-Society. Read a-society/a-docs/agents.md.
```

This form is grammatically correct for all role names and does not require runtime article selection.

**Correction 2 — Path format:**

The advisory template uses `/a-society/a-docs/agents.md` (leading slash). Per the handoff protocol, paths must be relative to the repository root — never machine-specific absolute paths. The correct form is `a-society/a-docs/agents.md` (no leading slash).

Both corrections apply to both the non-synthesis and synthesis templates in Section 3d.

---

## Implementation Scope (summary)

**Item 1 — utils.ts:**
- Create `tooling/src/utils.ts` with single export `extractFrontmatter(content: string): string | null`
- `workflow-graph-validator.ts`: remove own definition; import from `./utils.js`; remove `extractFrontmatter` from module exports
- `plan-artifact-validator.ts`: remove private definition; import from `./utils.js`
- `backward-pass-orderer.ts`: update import source from `./workflow-graph-validator.js` to `./utils.js` for `extractFrontmatter` (continue importing `validateWorkflowFile` and `WorkflowDocument` from `./workflow-graph-validator.js`)
- Add unit test file for utils.ts covering `extractFrontmatter`

**Item 2 — Component 4 extension:**
- Add to `backward-pass-orderer.ts`: interfaces `TriggerPromptOptions` and `BackwardPassTriggerEntry`; functions `generateTriggerPrompts` and `orderWithPromptsFromFile`
- Apply both trigger prompt template corrections above
- Add unit tests for both new functions in `test/backward-pass-orderer.test.ts` (or a new file if the existing file becomes unwieldy); cover: non-synthesis role with and without options; synthesis role; full sequence; options omission (no empty lines)
- Full test suite must pass after both items are implemented

---

## Scope Limits

- Developer writes to `tooling/` only. Documentation changes (`$A_SOCIETY_TOOLING_INVOCATION`, architecture component table, coupling map) are Curator responsibility and follow after implementation.
- No changes to `a-docs/` or `general/` are within Developer scope for this flow.
- If any ambiguity in the spec arises during implementation, escalate to TA before implementing a workaround.

---

## After Implementation

When implementation and tests are complete, TA reviews Component 4 implementation against this spec. Then return to Owner Session A:

```
Next action: TA reviews Component 4 implementation; then Owner is informed when complete
Expected response: TA confirms no deviations; Owner routes to Curator for doc updates
```
