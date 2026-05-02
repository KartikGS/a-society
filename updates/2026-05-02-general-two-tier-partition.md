# A-Society Framework Update — 2026-05-02

**Framework Version:** v35.0
**Previous Version:** v34.0

## Summary

`general/` is now an explicit two-tier library: a universal layer for content that applies to every project type, and a category layer at `general/project-types/<type>/` for content that is reusable across a recognizable category of projects but not universally. The Portability Constraint has been revised to admit the category layer, the Technical Architect role template has been relocated under `general/project-types/executable/` as the first category-layer migration, and adding a new project-type category now requires explicit Owner approval.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 2 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 0 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | Context-dependent improvements — adopt only if the problem applies |

---

## Changes

### Portability Constraint replaced with two-tier model

**Impact:** Breaking
**Affected artifacts:** `$A_SOCIETY_ARCHITECTURE`, `$A_SOCIETY_STRUCTURE`, `$A_SOCIETY_PRINCIPLES`, `$A_SOCIETY_AGENTS` (all are A-Society-internal — adopting projects update only the equivalent surfaces in their own `a-docs/` if they mirrored the prior universal-only constraint)
**What changed:** A-Society's prior Portability Hard Constraint required that anything in `general/` apply without modification to *any* project type. That constraint has been replaced with an explicit two-tier model:

- **Universal layer** — the `general/` root and all non-`project-types/` sub-folders. Content here must still apply without modification to any project type.
- **Category layer** — `general/project-types/<type>/`. Content here must apply without modification to any project of the named category, but is not required to apply universally.

Adding a new `general/project-types/<type>/` category is a scope decision and requires explicit Owner approval. Project-specific patterns continue to belong in the adopting project's own `a-docs/` and must not be added to `general/` at any tier.

**Why:** The prior universal-only constraint was overstated relative to the framework's actual contents. The Technical Architect role template was already category-shaped (it presupposes an executable layer to design) and does not apply to every project type. Pretending the universality constraint was strict while shipping category-shaped content created a hidden inconsistency and offered no sanctioned home for category-shaped patterns observed through real-world feedback.

**Migration guidance:** If your project's `a-docs/` carries a portability-style invariant for a `general/`-equivalent layer (for example, in `$[PROJECT]_ARCHITECTURE`, `$[PROJECT]_STRUCTURE`, `$[PROJECT]_PRINCIPLES`, or `$[PROJECT]_AGENTS`) that mirrors A-Society's prior universal-only language, your Curator should review that invariant against the new two-tier model and decide whether the same partition applies in your project. Adopting projects that do not mirror this invariant in their own `a-docs/` are unaffected by this change. Your Owner should be involved if your project decides to introduce its own category layer, since adding a category is a scope decision in any project.

---

### `$GENERAL_TA_ROLE` and `$GENERAL_TA_ADVISORY_STANDARDS` relocated under `general/project-types/executable/`

**Impact:** Breaking
**Affected artifacts:** `$GENERAL_TA_ROLE` (path change), `$GENERAL_TA_ADVISORY_STANDARDS` (path change), `$GENERAL_MANIFEST` (source-path entries updated)
**What changed:** The Technical Architect role template and its advisory-standards support doc moved from `a-society/general/roles/technical-architect/` to `a-society/general/project-types/executable/roles/technical-architect/`. The variable names (`$GENERAL_TA_ROLE`, `$GENERAL_TA_ADVISORY_STANDARDS`) are unchanged; only the resolved paths change. The manifest's `source_path` entries for both files have been updated accordingly. The descriptions in `$A_SOCIETY_INDEX` and `$A_SOCIETY_PUBLIC_INDEX` have been clarified to note the executable-layer scope.

**Why:** The Technical Architect role only makes sense for projects that have an executable layer to design. Keeping it under universal-layer `general/roles/` violated the new category-layer rule. Relocating it under `general/project-types/executable/roles/technical-architect/` makes its scope explicit and establishes the first category-layer partition by migrating an existing template, rather than by introducing speculative empty structure.

**Migration guidance:** Adopting projects that referenced these variables by name (`$GENERAL_TA_ROLE`, `$GENERAL_TA_ADVISORY_STANDARDS`) require no changes — variable resolution is unchanged. Adopting projects that hardcoded the prior path (`a-society/general/roles/technical-architect/...`) anywhere in their own `a-docs/` must update those references to the new path or replace them with variable references resolved through their own index. Adopting projects whose own scaffolding manifest pointed at the prior `source_path` (for example, a `$[PROJECT]_MANIFEST` carrying the same TA entry) must update those `source_path` fields to `general/project-types/executable/roles/technical-architect/main.md` and `general/project-types/executable/roles/technical-architect/advisory-standards.md`. Adopting projects that already instantiated their own Technical Architect role file inside their `a-docs/roles/` are unaffected — instantiated copies do not move.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
