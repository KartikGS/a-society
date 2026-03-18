# Backward Pass Findings: Tooling Developer — 20260318-utils-bp-trigger-tool

**Date:** 2026-03-18
**Task Reference:** 20260318-utils-bp-trigger-tool
**Role:** Tooling Developer
**Depth:** Full

---

## Findings

### Missing Information

**1. Advisory change table did not cover test file import dependencies.**

The advisory's Item 1 change table listed three source files (workflow-graph-validator.ts, plan-artifact-validator.ts, backward-pass-orderer.ts) as the complete set of required changes. Removing `extractFrontmatter` from workflow-graph-validator.ts's exports caused `workflow-graph-validator.test.ts` to fail — it was importing the now-removed export. This wasn't in the change table.

The fix was mechanical and clearly within Developer authority (test harness design is explicitly Developer-owned per the role doc). The TA correctly assessed it as a non-deviation consequence of the approved change. But from an implementation standpoint: a change table that touches an exported symbol should note whether test files importing that symbol also need updating. The gap surfaced as an unexpected breakage rather than a planned step.

**Practical impact:** Low — caught immediately by the test run. But for future refactors of this kind, a complete change table would include: source files affected, tests importing removed exports.

---

**2. No specified behavior for synthesis-absent orders in `generateTriggerPrompts`.**

The advisory specified the `nextEntry = order[N]` formula for non-synthesis entries. When `firedNodeIds` excludes the synthesis node, the result contains no synthesis entry, and the last non-synthesis entry's `order[N]` resolves to `undefined` — causing a TypeError at `nextEntry.is_synthesis`.

The advisory was silent on this case. I had no guidance and implemented exactly what was specified. The TA flagged the gap in the review and confirmed the edge case is narrow and that no remediation was required before Curator doc updates proceed.

From my implementation perspective: the fix is a one-line guard (`if (!nextEntry)`) at the `nextEntry` access, with a documented contract on what happens when the synthesis node is excluded (either error, or omit the handoff line). The current behavior is a latent runtime crash. Should be addressed in a follow-on flow before `generateTriggerPrompts` is used in synthesis-excluding contexts.

---

### Unclear Instructions

**3. Section 3d's `nextRole` description read as two cases but collapses to one.**

The advisory described `nextRole` as: "`order[N].role` for non-synthesis entries; the synthesis role's name for the last non-synthesis entry." On first reading this implied two separate code paths — a general case and a special case for the final non-synthesis entry. It took a second pass to confirm these are the same formula: `order[N]` at the last non-synthesis position naturally resolves to the synthesis entry, so `nextEntry.is_synthesis` handles the suffix without a special case.

The implementation is one line: `const nextEntry = order[N]`. The spec's two-part description was accurate but not the clearest path to that line. A formulation like: "`nextEntry = order[N]`; use `nextEntry.role` as the next role; append `' (synthesis)'` if `nextEntry.is_synthesis`" would have been unambiguous on first reading.

---

### Conflicting Instructions

- None.

---

### Redundant Information

- None.

---

### Scope Concerns

- None. The brief's in-scope and out-of-scope lists were clear. The boundary between Developer (implementation, tests, `tooling/` only) and Curator (documentation changes) was well-defined and held throughout.

---

### Workflow Friction

**4. Duplication count mismatch between plan and advisory.**

The workflow plan stated "grep confirms three" duplicating components. The TA's advisory corrected this: backward-pass-orderer.ts was already delegating via import — only two definitions existed. This correction was accurate and required no rework, but the mismatch between the plan's framing ("three components to deduplicate") and the actual scope ("two definitions to remove") caused a brief reorientation at the start of implementation.

The correction was the right call; the plan was working from a log description, not a code read. The TA's source verification is exactly what the scoping advisory is for. No process change warranted — this resolved correctly.

---

## Top Findings (Ranked)

1. **Advisory change table incomplete for export removals** — `03-ta-advisory.md` Item 1 change table: test files importing removed exports were not listed; emerged as an unexpected test breakage during implementation.
2. **Synthesis-absent edge case unspecified in `generateTriggerPrompts`** — `03-ta-advisory.md` Section 3d: `order[N]` is `undefined` when synthesis is excluded via `firedNodeIds`; latent runtime crash; requires a follow-on guard.
3. **nextRole two-part description caused initial misread** — `03-ta-advisory.md` Section 3d: accurate but not the most direct path to the single-formula implementation; rephrase for future specs of this pattern.
