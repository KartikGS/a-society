# A-Society Framework Update — 2026-03-15

**Framework Version:** v11.0
**Previous Version:** v10.0

## Summary

Three agent reliability gaps identified during the Ink project test run have been corrected in the framework. Two changes are Breaking: the Handoff Output item 4 definition in the Owner and Curator role templates now requires copyable paths to be relative to the repository root, and the Curator role template's Hard Rules now explicitly forbid markdown deep-link syntax as a form of path hardcoding. One change is Recommended: the `agents.md` instruction now requires context confirmation statements to enumerate every item in the required reading list by name. All projects initialized at v10.0 or earlier should review their Curator and Owner role files, and their `agents.md` confirmation statement.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 2 | Gaps in your current `a-docs/` — Curator must review |
| Recommended | 1 | Improvement worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### 1. Handoff Output: relative path requirement

**Impact:** Breaking
**Affected artifacts:** `$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE`, `$INSTRUCTION_ROLES`
**What changed:** Handoff Output item 4 in the Owner and Curator role templates now includes an explicit sentence: copyable paths must be relative to the repository root (e.g., `project-name/a-docs/agents.md`). Machine-specific absolute paths and `file://` URLs are forbidden. The canonical Handoff Output definition in `$INSTRUCTION_ROLES` Section 7 carries the same addition.
**Why:** In the Ink test run, four instances of machine-specific absolute paths appeared across three agents in a single run. The Handoff Output definition permitted this by omission — it required copyable paths without stating they must be portable. Any agent following the old template could produce absolute paths that break for any recipient whose local layout differs.
**Migration guidance:** Inspect your project's Owner role file (`$[PROJECT]_OWNER_ROLE`) and Curator role file (`$[PROJECT]_CURATOR_ROLE`). Find the Handoff Output section, item 4. If item 4 does not include path portability language, append the following to that item: "Paths must be relative to the repository root (e.g., `[your-project-name]/a-docs/agents.md`). Never use machine-specific absolute paths or `file://` URLs." Apply the same check to any other role documents in your project that include a Handoff Output section with item 4.

---

### 2. Context confirmation completeness

**Impact:** Recommended
**Affected artifacts:** `$INSTRUCTION_AGENTS`
**What changed:** The context confirmation guidance in `$INSTRUCTION_AGENTS` now requires that the confirmation statement enumerate every item in the required reading list by name. A fixed string that omits items is a confirmation failure. When a project's required reading list includes items beyond the standard set, those items must appear by name in the confirmation statement template. Step 5 of "How to Write One" carries the same requirement.
**Why:** In the Ink test run, all three agents omitted a custom required reading item from their confirmation statements because the template used a fixed string that predated the item's addition to the required reading list. The confirmation passed incorrectly — agents reported ready without having confirmed the custom document. The old guidance did not require the confirmation to enumerate items; it only required a verbatim statement.
**Migration guidance:** Inspect your project's `agents.md`. Find the Context Confirmation section and compare the listed confirmation statement against the Required Reading list above it. If the confirmation statement omits any item that appears in the Required Reading list, update the confirmation statement to include it by name. Then inspect each of your project's role files to confirm they produce confirmations that match their role-specific required reading.

---

### 3. Curator deep-link prohibition

**Impact:** Breaking
**Affected artifacts:** `$GENERAL_CURATOR_ROLE`
**What changed:** The Hard Rules section of the Curator role template now explicitly names markdown link syntax as a forbidden form of path hardcoding. The existing rule prohibited hardcoded paths but did not name `[text](/absolute/path)` and `[text](file:///path)` as violations. The updated rule adds: "This prohibition includes markdown link syntax: `[text](/absolute/path)` and `[text](file:///path)` are both violations. Use `$VARIABLE_NAME` references for any path that must be followed — never embed paths directly in link syntax."
**Why:** In the Ink test run, the Curator inserted a `file://` URL into a role document while intending to improve usability. The existing path rule was not violated by its letter — markdown link syntax was not explicitly named — so the agent had no basis to self-correct. The fix closes the loophole.
**Migration guidance:** Inspect your project's Curator role file (`$[PROJECT]_CURATOR_ROLE`). Find the Hard Rules section and the path hardcoding prohibition. If it does not include an explicit statement about markdown link syntax being forbidden, add the following sentence: "This prohibition includes markdown link syntax: `[text](/absolute/path)` and `[text](file:///path)` are both violations. Use `$VARIABLE_NAME` references for any path that must be followed — never embed paths directly in link syntax." Then scan your project's `a-docs/` for any existing markdown hyperlinks using absolute paths or `file://` URLs and replace them with `$VARIABLE_NAME` references.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
