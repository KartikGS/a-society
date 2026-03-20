# A-Society Framework Update — 2026-03-20

**Framework Version:** v15.0
**Previous Version:** v14.1

## Summary

This update codifies a strict behavioral limitation during the backward pass synthesis phase. The synthesis role (typically the Curator) is now explicitly forbidden from treating synthesis as a backlog generation exercise; instead, they must implement any fixes falling within their established authority directly in the active flow.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 0 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | Context-dependent improvements — adopt only if the problem applies |

---

## Changes

### 1. Prohibition on Backward Pass Backlog Generation

**Impact:** Breaking
**Affected artifacts:** `general/roles/curator.md`, `general/improvement/main.md`
**What changed:** Added a strict rule expressly prohibiting the synthesis role from queuing synthesis-authority items into a Next Priorities backlog. Added an explicit definition of this "backlog generation" failure mode to the Improvement protocol routing rules.
**Why:** To prevent minor maintenance issues from bloating project backlogs with trivial tasks that demand fully independent structural flows, enforcing the "Simplicity Over Protocol" principle.
**Migration guidance:** The Curator must review their project's role and improvement instructions.
1. In `$[PROJECT]_CURATOR_ROLE` (under the Hard Rules section), add the following strict rule:
`- **Never queue synthesis-authority items.** During a backward pass synthesis, maintenance items within your authority must be implemented directly. Do not generate a maintenance backlog. Do not add synthesis-authority fixes to the project log's Next Priorities queue. If you have the authority to fix an issue, fix it in the current flow.`
2. In `$[PROJECT]_IMPROVEMENT` (under Actionable items routing), update the instruction regarding changes within synthesis role authority to include the explicit failure mode: `"Failure mode: treating synthesis as an ideation exercise and generating a "backlog" of maintenance tickets for the Owner. If the synthesis role has the authority to make the change, they must make it during synthesis—never queue it."`

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
