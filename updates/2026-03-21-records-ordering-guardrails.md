# A-Society Framework Update — 2026-03-21

**Framework Version:** v17.0
**Previous Version:** v16.0

## Summary

This update adds records-ordering and workflow-path discipline to the general records instruction, clarifies when `workflow.md` is exempt in older or bootstrapping record folders, and adds a forward-pass closure guardrail to the general improvement protocol. Adopting projects that use records, `workflow.md`, or backward-pass tooling should review these changes and update their project-level conventions where needed.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 2 | Improvements worth adopting — Curator judgment call |
| Optional | 1 | Context-dependent improvements — adopt only if the problem applies |

---

## Changes

### `workflow.md` completeness rule required in records conventions

**Impact:** Breaking
**Affected artifacts:** `$[PROJECT]_RECORDS`
**What changed:** The general records instruction now requires the intake role to list every expected review and approval checkpoint in `workflow.md`, including intermediate intake-role checkpoints between non-intake roles. Silent checkpoints are no longer allowed.
**Why:** If `workflow.md` omits checkpoints that actually occurred, the recorded forward-pass path no longer matches the flow that ran. That mismatch can corrupt backward-pass ordering for projects that compute or reason from the recorded path.
**Migration guidance:** Check your project's `$[PROJECT]_RECORDS` document. If it documents `workflow.md`, add a rule stating that every expected review and approval checkpoint must appear explicitly in the path, including intake-role checkpoints between downstream roles. Review your current intake practice as well: if your project has been treating review steps as implied rather than explicit, update that practice before the next flow.

---

### Parallel-track convergence artifacts now require sub-labeled sequence positions

**Impact:** Optional
**Affected artifacts:** `$[PROJECT]_RECORDS`
**What changed:** The general records instruction now states that when the intake role declares parallel tracks that converge later in the record sequence, it must pre-assign sub-labeled positions such as `NNa-`, `NNb-`, and so on for the expected convergence artifacts.
**Why:** Parallel tracks can otherwise collide when they rejoin a single sequence. Pre-assigning sub-labeled positions at intake prevents post-hoc renaming and keeps the record convention stable.
**Migration guidance:** If your project uses or expects to use parallel tracks in record folders, update `$[PROJECT]_RECORDS` to define sub-labeled convergence positions and require those positions to be assigned at intake in both the records convention and `workflow.md`. If your project never uses parallel tracks, no action is required.

---

### `workflow.md` pre-convention and bootstrapping exemptions documented

**Impact:** Recommended
**Affected artifacts:** `$[PROJECT]_RECORDS`
**What changed:** The general records instruction now explains that record folders created before the `workflow.md` requirement are exempt from it, and that the flow introducing a new record-folder requirement is exempt-by-origin from the requirement it creates.
**Why:** Without these exemptions, agents may misclassify older record folders as non-compliant or expect a flow to retroactively satisfy the rule it is introducing.
**Migration guidance:** Add both exemption paragraphs to your project's `$[PROJECT]_RECORDS` document if it uses `workflow.md`. Record the convention introduction date or version in that document so future agents can determine whether a missing `workflow.md` is a true violation or a pre-convention case.

---

### Forward pass must close before backward pass begins

**Impact:** Recommended
**Affected artifacts:** `$[PROJECT]_IMPROVEMENT`
**What changed:** The general improvement document now states that the intake role must explicitly close the forward pass as a distinct step before issuing backward-pass initiation. Collapsing "complete registration" and "proceed to backward pass" into a single instruction is now prohibited.
**Why:** Findings produced before the forward pass is explicitly closed may be based on incomplete work. The explicit boundary preserves the difference between execution completion and reflection start.
**Migration guidance:** Check your project's `$[PROJECT]_IMPROVEMENT` document. Add a guardrail stating that the intake role must explicitly close the forward pass before beginning the backward pass. If your current flow language collapses final registration and backward-pass initiation into one step, split those into two distinct instructions.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
