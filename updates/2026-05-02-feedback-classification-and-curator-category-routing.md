# A-Society Framework Update — 2026-05-02

**Framework Version:** v36.0
**Previous Version:** v35.0

## Summary

Upstream feedback artifacts now require an explicit generality classification — universal, category-shaped (with a named category), or project-specific — for every framework-improvement candidate, so A-Society's intake can route contributions correctly into the new two-tier `general/` model. The Curator role template gains matching scope-routing rules: two-tier placement classification at proposal time, and an explicit Owner-approval gate before any new `general/project-types/<type>/` category folder is created.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 4 | Gaps or contradictions in your current `a-docs/` — Curator must review |
| Recommended | 0 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | Context-dependent improvements — adopt only if the problem applies |

---

## Changes

### Generality classification required in upstream feedback artifacts

**Impact:** Breaking
**Affected artifacts:** `$A_SOCIETY_RUNTIME_FEEDBACK`, `$GENERAL_FEEDBACK_TEMPLATE`
**What changed:** The runtime-owned feedback contract and the upstream feedback report template now require every framework-improvement candidate to carry a generality label. Three buckets:

- **Universal** — applies without modification to every project type
- **Category-shaped (`<category>`)** — applies without modification across a recognizable category of projects but not universally; the category must be named, and a category that does not yet exist under `a-society/general/project-types/` implies a category-creation request that requires Owner approval
- **Project-specific** — only applies to the originating project; included for context, not for inclusion in `general/`

The report template now carries a dedicated Generality column. Reports that omit the classification for any framework-improvement candidate are malformed.

**Why:** The two-tier `general/` model introduced in v35.0 (universal layer plus `general/project-types/<type>/` category layer) only delivers value if upstream contributions are classified by generality at the source. Without classification, A-Society's intake either over-promotes category-shaped patterns into the universal layer (violating portability) or under-routes universal patterns into a single category (limiting reuse). Requiring the source to classify each candidate puts the judgment at the moment closest to the evidence and reduces re-classification work downstream.

**Migration guidance:** Adopting projects whose runtime configuration uses the runtime-owned feedback contract receive the new contract automatically when they update their runtime — no project-side changes are required for the runtime path. Adopting projects that maintain their own copy of the feedback template (for example, a customized `$[PROJECT]_FEEDBACK_TEMPLATE`) must update their template to add the Generality column and the classification guidance, and update any local feedback-authoring instructions to require classification of each framework-improvement candidate. Adopting projects that produced feedback reports under the prior contract should leave those historical reports unchanged — historical artifacts are immutable. New reports must use the new format.

---

### Project-side feedback-phase template requires generality classification

**Impact:** Breaking
**Affected artifacts:** `$GENERAL_IMPROVEMENT_FEEDBACK`
**What changed:** Step 3 of the universal-layer feedback-phase template (the local Owner's final backward-pass step) now requires each framework-improvement candidate in the produced artifact to be labeled with a generality bucket — universal, category-shaped (with a named category), or project-specific — using the placement tests from the project's structure document. The artifact is malformed if any framework-improvement candidate is missing its classification.

**Why:** Adopting projects also produce upstream feedback artifacts when their final backward-pass step is the upstream feedback step (rather than the runtime-owned A-Society feedback step). The same classification requirement applies regardless of which contract the runtime invokes for that flow.

**Migration guidance:** Adopting projects that instantiated `$GENERAL_IMPROVEMENT_FEEDBACK` into their own `$[PROJECT]_IMPROVEMENT_FEEDBACK` (or the equivalent local feedback-phase document) must update Step 3 of the local document to require the generality classification per candidate, naming the three buckets and pointing at the project's structure document for the placement tests. Adopting projects that have not produced an upstream feedback artifact yet are unaffected for past flows but must apply the new contract to future flows.

---

### Curator scope-routing extended for the two-tier `general/` model

**Impact:** Breaking
**Affected artifacts:** `$GENERAL_CURATOR_IMPL_PRACTICES`
**What changed:** The Curator's Scope Routing section now declares the two-tier `general/` model explicitly and adds a category-layer gate: **creating a new `general/project-types/<type>/` category folder is a scope decision and requires explicit Owner approval before any content is placed under it.** Adding content to an already-approved category follows the same change-type rules as the universal layer (clarifications/precision fixes within direct Curator authority; new scope additions requiring an Owner proposal). The Proposal Stage gains a corresponding rule: when proposing any addition to `general/`, classify the placement as universal-layer or category-layer using the placement tests in the project's structure document, name the category for category-layer placements, and route any required category creation as a separate Owner-approval step rather than bundling it with content placement.

**Why:** Before this update, the Curator template described `general/` as a single tier, and "new scope additions" was the only category-creation gate. The introduction of `general/project-types/<type>/` in v35.0 created a second placement decision — universal versus category — that the Curator must make at proposal time, plus a third question (does the chosen category folder already exist?) that requires Owner approval at the highest authority level when the answer is "no." Without this rule, a Curator could legitimately read the template as authorizing creation of a new category folder under "new scope additions" without separating the category-creation decision from the content placement.

**Migration guidance:** Adopting projects that instantiated `$GENERAL_CURATOR_IMPL_PRACTICES` into their own `$[PROJECT]_CURATOR_IMPL_PRACTICES` (or the equivalent local Curator support doc) must update the local Scope Routing section to declare their own `general/`-equivalent two-tier model if their project carries one, including the category-creation Owner-approval gate. Projects that do not carry a category layer in their `general/`-equivalent surface (or do not have such a surface at all) may skip the additions, but their Curators should still understand the rule for any future contributions they classify and submit upstream to A-Society.

---

### Curator proposal-stage placement classification

**Impact:** Breaking
**Affected artifacts:** `$GENERAL_CURATOR_IMPL_PRACTICES` (proposal-stage bullet)
**What changed:** A new proposal-stage requirement: when proposing an addition to `general/`, classify the placement as universal-layer or category-layer at proposal time using the placement tests in the project's structure document; for category-layer placements, name the category, and treat creation of a new category folder as a separate scope decision requiring explicit Owner approval before any content is placed under it. A proposal that defaults to universal-layer placement without applying the placement test is incomplete.

**Why:** Curator proposals must be reviewable against placement choice. Without an explicit classification step, an Owner reviewing a proposal cannot tell whether the Curator considered category-layer placement at all; the default behavior is universal-layer placement, which over-claims portability when the content is actually category-shaped.

**Migration guidance:** Adopting projects that instantiated `$GENERAL_CURATOR_IMPL_PRACTICES` into their own `$[PROJECT]_CURATOR_IMPL_PRACTICES` should add the corresponding proposal-stage rule. If the project does not carry a category layer in its `general/`-equivalent surface, the rule may be reduced to "classify the placement using the placement tests" without the category-specific clauses.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
