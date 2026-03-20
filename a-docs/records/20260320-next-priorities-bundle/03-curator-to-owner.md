**Subject:** Next Priorities Bundle (Priorities 2-6)
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-20

---

## Trigger

Owner Phase 1 Briefing (`20260320-next-priorities-bundle/02-owner-to-curator-brief.md`), directing the bundle of five priorities into a single proposed update.

---

## What and Why

1. **Remove Trailing Annotations from Update Report Template:** The protocol prohibits trailing text on version fields to allow programmatic parsing. Removing `*(A-Society's version...)*` annotations from `$A_SOCIETY_UPDATES_TEMPLATE` enforces this.
2. **Variable Pre-Registration Prompt in Brief Template:** Prevents variable notation scope leaks by explicitly reminding the Owner to verify `$VAR` existence in the index *before* sending a brief. This ensures referencing integrity. 
3. **Per-File Summary & Edit-Mode Fields:** Adding a "Files Changed" summary table and forcing explicit edit-mode flags (`[additive]`, `[replace]`, `[insert before X]`) in the Agreed Change section of `$A_SOCIETY_COMM_TEMPLATE_BRIEF` streamlines multi-file implementations for the Curator, minimizing guesswork.
4. **Function-based Backward-Pass References:** Replaces rigid sequence numbers with function-based descriptions (e.g., "backward-pass findings after all submissions resolved") in `$A_SOCIETY_RECORDS`. Hardcoded sequence IDs inevitably break when optional submissions (like Update Reports or Revisions) are injected into the flow.
5. **Component 4 Interface Alignment:** Updates `$A_SOCIETY_IMPROVEMENT` to reflect Component 4's new capability (`generateTriggerPrompts` and `orderWithPromptsFromFile`) instead of prohibiting prompt generation. Also fixes the gap in `$A_SOCIETY_INDEX` where Component 4 was not registered.

**Generalizability resolutions (Owner Open Questions):**
- **$GENERAL_OWNER_ROLE:** Yes, the Brief-Writing Quality section should mirror the best practice introduced to the internal template. Incorporating explicit edit-mode requirements and summary tables scales well for adopting projects.
- **$INSTRUCTION_ROLES and $INSTRUCTION_RECORDS:** Yes, the function-based referencing rule applies generally. `$INSTRUCTION_RECORDS` requires a clause dictating that standing instructions and templates use functional references ("backward-pass findings") rather than hardcoded sequence IDs (`05-findings`), which drift.

---

## Where Observed

A-Society — internal execution flows where intermediate submissions disrupted hardcoded artifact paths, and where tooling refinements outpaced documentation mappings.

---

## Target Location

- `$A_SOCIETY_UPDATES_TEMPLATE`
- `$A_SOCIETY_COMM_TEMPLATE_BRIEF` 
- `$A_SOCIETY_OWNER_ROLE`
- `$A_SOCIETY_RECORDS`
- `$A_SOCIETY_IMPROVEMENT`
- `$A_SOCIETY_INDEX`
- `$GENERAL_OWNER_ROLE`
- `$INSTRUCTION_RECORDS`

---

## Draft Content

**1. `$A_SOCIETY_UPDATES_TEMPLATE`:**
```diff
- **Framework Version:** v[X.Y] *(A-Society's version after this update is applied)*
- **Previous Version:** v[X.Y-1] *(A-Society's version before this update)*
+ **Framework Version:** v[X.Y]
+ **Previous Version:** v[X.Y-1]
```

**2. `$A_SOCIETY_COMM_TEMPLATE_BRIEF`:**
```diff
  **Subject:** [Brief identifier for the work item...]
  **Status:** BRIEFED
  **Date:** [YYYY-MM-DD]

+ > **Pre-send check (Variables):** Verify that every `$VAR` referenced in the proposed content below is already registered in the relevant index. Unregistered variables must not be used.
+
  > **Count verify:** If the Subject line states a number of changes, confirm it matches the count of numbered items in the Agreed Change section before sending.

  ---

  ## Agreed Change

+ **Files Changed:**
+ | Target | Action |
+ |---|---|
+ | `$[VAR]` | [additive / replace / insert / modify] |
+

  > **Item authority marking:** Each item in this section must be marked with its authority level...
+ > **Edit-mode marking:** Where applicable, tag the requested change with its expected edit mode (e.g., `[additive]`, `[replace target X]`, `[insert before X]`) to streamline implementation.

```

**3. `$A_SOCIETY_OWNER_ROLE` & `$GENERAL_OWNER_ROLE` (Brief-Writing Quality section):**
Add to the multi-file scope guidance:
```diff
  A fully-specified brief eliminates revision cycles for straightforward changes. Reserve open questions for changes that genuinely require Curator judgment.
+
+ **Multi-file scopes:** When a brief spans multiple files, provide a "Files Changed" summary table naming the specific target files and the expected action (additive, replace, insert) to streamline the downstream role's implementation plan.
```

**4. `$A_SOCIETY_RECORDS` & `$INSTRUCTION_RECORDS` (Sequencing rules):**
Add rule regarding function-based referencing of trailing artifacts:
```diff
  **Example:** Main flow closes at `04-owner-to-curator.md`; update report submission takes `05-curator-update-report.md`...
+
+ **Reference stability:** Do not use hardcoded sequence IDs (e.g., `05-findings.md`) in standing instructions or templates to refer to trailing artifacts like backward-pass findings. Intermediate submissions or revisions will shift their sequence position. Always refer to them by function (e.g., "the backward-pass findings artifact after all submissions have resolved").
```

**5. `$A_SOCIETY_IMPROVEMENT`:**
```diff
  #### Component 4 mandate
  
- When Component 4 (`$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`) is available **and** the flow has more than two participating roles, invoke Component 4 to compute the traversal order — do not compute manually. Pass `$A_SOCIETY_WORKFLOW`. The orderer returns roles in backward pass order, excluding roles that did not fire in this instance.
+ When Component 4 (`$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`) is available **and** the flow has more than two participating roles, invoke Component 4 to generate the trigger prompts and order them. Use `generateTriggerPrompts` and `orderWithPromptsFromFile`, passing `$A_SOCIETY_WORKFLOW`. The orderer will programmatically assemble the roles in their backward-pass sequence based on their presence in the workflow.
```

**6. `$A_SOCIETY_INDEX`:**
Add the missing tooling component variable mapping:
```diff
  | `$A_SOCIETY_TOOLING_INVOCATION` | `/a-society/tooling/INVOCATION.md` | Invocation reference for all tooling components — quick start, entry points, and error conventions |
+ | `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` | `/a-society/tooling/src/backward-pass/orderer.ts` | Component 4: Computes the backward pass ordering based on the active workflow graph, returning trigger prompts. |
```

---

## Owner Confirmation Required

The Owner must respond in `owner-to-curator.md` with one of:
- **APPROVED** — with any implementation constraints
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `owner-to-curator.md` shows APPROVED status.
