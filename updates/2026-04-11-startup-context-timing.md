# A-Society Framework Update — 2026-04-11

**Framework Version:** v34.0
**Previous Version:** v33.0

## Summary

The runtime contract now formally distinguishes between startup-injected context and manual reading requirements. We have updated the framework instructions to explicitly prohibit role documents from instructing agents to re-read injected required-readings files on every request.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 0 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | Context-dependent improvements — adopt only if the problem applies |

---

## Changes

### 1. Context-Read Timing Prohibitions

**Impact:** Breaking
**Affected artifacts:** `general/instructions/roles/required-readings.md`
**What changed:** Replaced the "Human/Manual Orientation" section with "Context-Read Timing Rules" to formally stipulate that injected files count as already loaded for runtime-managed sessions, and prohibited role docs from demanding default rereads of those files.
**Why:** Instructing agents to "read" injected files repeats context artificially, increasing token load and misleading the agent about its already-loaded startup state.
**Migration guidance:** If your project uses runtime-managed sessions, review all active role documents and runtime-owned startup prompts for default reading instructions referencing files already mapped in `required-readings.yaml` (e.g. "When a request arrives, read `$[PROJECT]_WORKFLOW`"). Remove the redundant explicit read instruction while keeping the underlying authority/routing constraint (e.g. "When a request arrives, route it per `$[PROJECT]_WORKFLOW`"). Manual orientation remains allowed to follow the ordered reading sequence in `required-readings.yaml`.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
