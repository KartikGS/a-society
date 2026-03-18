# Backward Pass Findings: Technical Architect — 20260318-utils-bp-trigger-tool

**Date:** 2026-03-18
**Task Reference:** 20260318-utils-bp-trigger-tool
**Role:** Technical Architect
**Depth:** Full

---

## Findings

### Missing Information

**1. Advisory change table did not account for test files importing removed exports.**

The Item 1 change table in `03-ta-advisory.md` listed three source files as the complete set of required changes: `workflow-graph-validator.ts`, `plan-artifact-validator.ts`, and `backward-pass-orderer.ts`. Removing `extractFrontmatter` from `workflow-graph-validator.ts`'s exports predictably breaks any test file that imports that export — specifically `workflow-graph-validator.test.ts`. This file was not in the change table.

The Developer caught this via test run failure, assessed it correctly as within their authority, and handled it without escalation. The outcome was correct. But the breakage was avoidable: when a change table removes a named export from a module, test files importing that symbol are deterministically affected. They belong in the change table.

For future TA advisories that include an export removal: the affected components list should include test files that import the removed export, noting that these require an import source update (not a behavioral change).

---

**2. Advisory was silent on `generateTriggerPrompts` behavior when synthesis is excluded from the order.**

Section 3d specified `nextEntry = order[N]` for non-synthesis entries, where `N` is 1-based and `order[N]` is the next item at 0-based index `N`. The spec did not address the case where `firedNodeIds` excludes the synthesis node — in that case, the last non-synthesis entry at position `total` resolves `order[total]` to `undefined`, causing a TypeError at `nextEntry.is_synthesis`.

The Developer implemented exactly what was specified and had no guidance on this case. I caught it during the implementation review and correctly assessed it as a spec gap rather than a deviation. The edge case will not occur in documented workflows — backward passes include synthesis, and the workflow graph validator requires exactly one synthesis node — but the latent crash is still a correctness issue.

The spec should have addressed the synthesis-absent case explicitly: either state that `generateTriggerPrompts` requires a synthesis entry in the order (throw if absent, with a clear error message), or specify reduced behavior (omit the handoff line for the last non-synthesis entry). Silence on edge cases leaves the Developer without a decision boundary and produces code that will eventually surprise a caller.

---

### Unclear Instructions

**3. The `nextRole` description in Section 3d was phrased as two cases when it is one formula.**

Section 3d described `nextRole` as: "`order[N].role` for non-synthesis entries; the synthesis role's name for the last non-synthesis entry." This reads as two cases requiring separate handling. The Developer's findings (Finding 3) confirmed that a second pass was required to recognize these as the same formula: `order[N]` at the last non-synthesis position naturally resolves to the synthesis entry, so no special case is needed.

The clearer formulation: "`nextEntry = order[N]`; use `nextEntry.role` as the handoff target; append `' (synthesis)'` if `nextEntry.is_synthesis`." This maps directly to the implementation without an intermediate inference step.

When specifying a function's internal variable derivation, describe the formula — not a verbal description of what the formula produces in different cases.

---

### Conflicting Instructions

**4. Two errors in the advisory's trigger prompt template strings required Owner correction.**

`03-ta-advisory.md` Section 3d specified the session-start line as `"You are a [role] agent for A-Society."` and the agents.md path as `/a-society/a-docs/agents.md`. Both were wrong:

- The article: "a" is grammatically incorrect for role names ("You are a Owner agent..."). The correct form per the handoff protocol is "the."
- The path: a leading slash produces an absolute path interpretation. The handoff protocol prescribes a repository-relative path without a leading slash.

Both errors were caught by the Owner in `04-owner-to-developer.md` before implementation. The review step worked as designed — Owner review is the mechanism for catching exactly this kind of spec-level error. But both errors were preventable: the prescribed session-start format appears in the TA role doc's own handoff protocol section. Verifying a template string against a prescribed format means reading the format specification before writing the template, not after.

For future advisories specifying exact string output (trigger prompts, session-start lines, handoff formats): verify the format against the prescribing document before submission. The relevant prescriptions live in the TA role doc's handoff section and in `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`.

---

### Redundant Information

- None.

---

### Scope Concerns

- None. The brief's in-scope and out-of-scope lists were clear throughout. The boundary between TA (spec) and Developer (implementation) held with no ambiguity.

---

### Workflow Friction

- None notable. The two-phase TA involvement (advisory at intake, review after implementation) was well-suited to the flow. The Developer escalation model worked: the test file update was assessed correctly as within Developer authority without requiring TA involvement. The Owner correction mechanism caught the two template errors cleanly.

---

## Top Findings (Ranked)

1. **Advisory change table incomplete for export removals** — `03-ta-advisory.md` Item 1: test files importing removed exports belong in the change table; their absence produced an unexpected breakage during implementation.
2. **Synthesis-absent edge case unspecified** — `03-ta-advisory.md` Section 3d: `order[N]` is `undefined` when synthesis is excluded; spec should have specified the contract explicitly (throw with clear message, or defined reduced behavior).
3. **Template string errors required Owner correction** — `03-ta-advisory.md` Section 3d: two errors (article, path format) were caught by Owner review; both were preventable by verifying against the prescribing format documents before submission.
4. **`nextRole` two-case description obscured single formula** — `03-ta-advisory.md` Section 3d: a formula-first description would have mapped directly to implementation without the intermediate inference step.

---

## Handoff

Switch to: Owner Session A (existing session).

```
Next action: Owner produces backward pass findings at 13-owner-findings.md
Read: a-society/a-docs/records/20260318-utils-bp-trigger-tool/12-ta-findings.md
      a-society/a-docs/records/20260318-utils-bp-trigger-tool/10-curator-findings.md
      a-society/a-docs/records/20260318-utils-bp-trigger-tool/11-developer-findings.md
Expected response: Owner findings at 13-owner-findings.md; hand off to Curator for synthesis
```
