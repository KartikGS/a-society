# Backward Pass Findings: Curator — 20260318-utils-bp-trigger-tool

**Date:** 2026-03-18
**Task Reference:** 20260318-utils-bp-trigger-tool
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions

- **Backward pass order in `09-owner-to-curator.md` conflicts with the `$A_SOCIETY_IMPROVEMENT` algorithm.** The 09 artifact specified: Developer (10), TA (11), Owner (12), Curator synthesis (13). The algorithm — deduplicate by first occurrence, reverse, Owner second-to-last, synthesis last — produces: Curator (10), Developer (11), TA (12), Owner (13), Curator synthesis (14). The root cause: the Owner correctly identified the Curator as synthesis-last but treated the Curator's non-synthesis first occurrence (position 4 in the forward pass) as if it were absorbed into the synthesis slot. The Curator's non-synthesis forward position should have yielded backward position 1 (last into the forward pass → first out), producing a separate Curator findings step before the synthesis. The conflict was caught by the human before I produced findings at the wrong position.

### Missing Information

- **`$A_SOCIETY_IMPROVEMENT` references `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`, a variable not registered in `$A_SOCIETY_INDEX`.** The Component 4 mandate section reads: "When Component 4 (`$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`) is available..." This variable cannot be resolved via the index — it appears in no row. The correct registered path for Component 4's invocation reference is `$A_SOCIETY_TOOLING_INVOCATION`. An agent following the mandate and attempting to resolve the variable would fail. This is a pre-existing issue, not introduced in this flow; flagging for correction. The fix: either register `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER` in the index (pointing to the backward-pass-orderer source file or INVOCATION.md), or replace the variable with `$A_SOCIETY_TOOLING_INVOCATION` and a note to find Component 4 there.

### Unclear Instructions

- **Item 4's brief did not specify which text in `$GENERAL_IMPROVEMENT` was being assessed.** The brief said "assess whether `$GENERAL_IMPROVEMENT`'s reference to Component 4 should specifically name this capability." `$GENERAL_IMPROVEMENT` does not explicitly name Component 4 — it describes a tool type ("a Backward Pass Orderer tool") and redirects to project tooling documentation. I needed to read both `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` to identify which passage the watch item was referring to. Once both were loaded the assessment was straightforward, but the brief would have been more precise if it had quoted the target passage or confirmed which document's language was in question.

### Redundant Information

- None.

### Scope Concerns

- None. The brief's in-scope and out-of-scope lists were unambiguous; no boundary decisions required.

### Workflow Friction

- **Pre-read set for Curator doc updates is large relative to the change surface.** To implement three targeted edits (INVOCATION.md, architecture.md, coupling map), I loaded seven files: 03-ta-advisory.md, 04-owner-to-developer.md, 06-ta-review.md, and four target files. The three record artifacts are required because the brief designates them as the source of truth over the source code. This is correct procedure — the approved spec is canonical for documentation — but the load is proportionally heavy for changes of this size. Observation only; the brief's source-of-truth designation is sound.

---

## Top Findings (Ranked)

1. **Backward pass order algorithm misapplied in 09** — `$A_SOCIETY_IMPROVEMENT` / `09-owner-to-curator.md`: the Curator's non-synthesis forward occurrence was absorbed into the synthesis slot rather than generating a separate backward findings position. Required human correction.
2. **Unregistered variable `$A_SOCIETY_TOOLING_BACKWARD_PASS_ORDERER`** — `$A_SOCIETY_IMPROVEMENT`, Component 4 mandate section: violates Index-Before-Reference invariant; agents cannot resolve it via `$A_SOCIETY_INDEX`.
3. **Item 4 watch item brief lacked target text citation** — `07-owner-to-curator.md`: ambiguity about which passage in `$GENERAL_IMPROVEMENT` was under assessment; resolved by reading both improvement documents.
