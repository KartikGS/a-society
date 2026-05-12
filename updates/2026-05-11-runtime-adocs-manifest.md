# A-Society Framework Update — 2026-05-11

**Framework Version:** v37.0
**Previous Version:** v36.0

## Summary

The a-docs manifest is now a runtime-owned contract at `$A_SOCIETY_RUNTIME_ADOCS_MANIFEST`, not a `general/` library artifact. Runtime initialization and runtime health checks now use the same contract for required project `a-docs/` surfaces, so scaffold behavior and health validation no longer drift through separate hardcoded assumptions.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 2 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 0 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | Context-dependent improvements — adopt only if the problem applies |

---

## Changes

### Runtime a-docs manifest replaces the general manifest

**Impact:** Breaking
**Affected artifacts:** `$A_SOCIETY_RUNTIME_ADOCS_MANIFEST`, `$A_SOCIETY_INDEX`, `$A_SOCIETY_PUBLIC_INDEX`
**What changed:** The manifest that defines the runtime-created project `a-docs/` file set moved from `general/manifest.yaml` to `runtime/contracts/a-docs-manifest.yaml`. The old `$GENERAL_MANIFEST` variable has been retired. The new `$A_SOCIETY_RUNTIME_ADOCS_MANIFEST` variable is registered in both the public and internal indexes.
**Why:** The manifest is executable input, not reusable guidance. It tells the runtime what to scaffold and what required file set should remain healthy. Keeping it in `general/` made it look like a human-facing library artifact and duplicated the role already served by guide and instruction documents.
**Migration guidance:** If your project copied A-Society index rows, role guidance, workflow guidance, or maintenance docs that reference `$GENERAL_MANIFEST`, replace those references with `$A_SOCIETY_RUNTIME_ADOCS_MANIFEST` only where the text is referring to the A-Society runtime scaffold/health contract. Do not create a project-local `$[PROJECT]_GENERAL_MANIFEST` replacement unless your project has its own executable scaffold manifest with an actual runtime consumer. Historical records and already-published reports should remain unchanged.

---

### Runtime health checks now use the runtime a-docs manifest

**Impact:** Breaking
**Affected artifacts:** `$A_SOCIETY_RUNTIME_ADOCS_MANIFEST`, runtime initialization behavior, runtime health checks
**What changed:** Runtime health checks now read the required entries from `$A_SOCIETY_RUNTIME_ADOCS_MANIFEST` instead of carrying a separate hardcoded minimum-file list. The runtime manifest now marks `improvement/meta-analysis.md` and `improvement/feedback.md` as required entries, so new runtime initializations scaffold those files and existing runtime-managed projects are expected to have them.
**Why:** Runtime initialization and runtime health validation are the same contract at two different moments. If the runtime creates one minimum file set but later validates another, agents receive contradictory guidance and healthy projects can fail only because the executable layer drifted from its own scaffold contract.
**Migration guidance:** Existing runtime-managed projects should ensure every required entry in `$A_SOCIETY_RUNTIME_ADOCS_MANIFEST` exists under their project `a-docs/`. In particular, projects initialized before this update should check for `a-docs/improvement/meta-analysis.md` and `a-docs/improvement/feedback.md`. If either file is missing, create it from `$GENERAL_IMPROVEMENT_META_ANALYSIS` or `$GENERAL_IMPROVEMENT_FEEDBACK` respectively, then customize any project placeholders. After repair, the normal runtime health check should pass without needing any local manifest copy.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
