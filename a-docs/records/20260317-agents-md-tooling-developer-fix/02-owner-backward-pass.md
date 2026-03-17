**Subject:** agents.md — fix Tooling Developer summary (Node.js → TypeScript)
**Type:** Owner Backward Pass
**Date:** 2026-03-17

---

## Findings

Fix applied. One line changed. No friction.

**Process observation:** This drift originated in the `20260316-tooling-ts-migration` flow. The migration updated `tooling-developer.md`, `architecture.md`, `tooling-architecture-addendum.md`, and `INVOCATION.md` — but `agents.md` line 28 was a summary table cell that didn't appear in the Curator's target list and wasn't caught in the backward pass.

**Pattern to carry forward:** When a language-reference migration touches multiple files, the scope list should include all summary/orientation artifacts that echo the same language description — not just the primary role and architecture docs. `agents.md` role table summaries are short, derived descriptions that drift quietly. The Curator's proposal sweep should include them.

No further action from this flow.
