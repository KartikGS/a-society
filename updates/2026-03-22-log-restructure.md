# A-Society Framework Update — 2026-03-22

**Framework Version:** v17.5
**Previous Version:** v17.4

## Summary

Four changes to `general/` files: the project log instruction now describes a two-file model (main log + companion archive file), and a merge assessment rule for Next Priorities is added to the log instruction, the improvement protocol, and the Owner role template. Projects that have already initialized may adopt these changes at their discretion; none create a gap in existing `a-docs/` structures.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 4 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### Two-file log model — archive split

**Impact:** Recommended
**Affected artifacts:** `general/instructions/project-information/log.md`
**What changed:** The project log instruction now describes a two-file model. The main log has no `## Archive` section; archived entries live in a companion `log-archive.md` at `[project]/a-docs/project-information/log-archive.md`. The main log ends with a single pointer line. The archive file uses a compact one-liner format per entry. Step 5 of "How to Write One" updated accordingly.
**Why:** The inline archive section grows without bound as flows accumulate, eventually exceeding agent read limits. The archive is historical — agents do not need it at orientation. Moving it to a companion file keeps the main log within readable size while preserving traceability.
**Migration guidance:** Review your project's `a-docs/project-information/log.md`. If the `## Archive` section has grown large, adopt the two-file model:
1. Create `a-docs/project-information/log-archive.md`. Populate it with entries condensed from the current Archive section, in the one-liner format: `[scope-tags] — **slug** (YYYY-MM-DD): one sentence`. Most recent at top.
2. Register the new file in your project index under a variable such as `$[PROJECT]_LOG_ARCHIVE`.
3. Remove the `## Archive` section from the main log. Add a pointer line at the bottom: `Archived flows are recorded in $[PROJECT]_LOG_ARCHIVE. One entry per flow. Entries are immutable once written. Most recent at top.`
4. Update your project's Entry Lifecycle text (in the log or its instruction) to reference the archive file rather than the `## Archive` section.

If your project's Archive section is currently short, no immediate action is required — but adopt the two-file model before the Archive grows large.

---

### Merge assessment for Next Priorities — log instruction

**Impact:** Recommended
**Affected artifacts:** `general/instructions/project-information/log.md`
**What changed:** A "Merge Assessment" subsection has been added to the Next Priorities section of the log instruction. Before adding any Next Priorities item (at intake or from synthesis), the adding role scans existing items for merge opportunities. Two items are mergeable when: (1) same target files or same design area, and (2) compatible authority level (same implementing role or same approval path). When a merge is found, replace the existing item(s) with a single merged item retaining all source citations.
**Why:** Without a merge check, Next Priorities items accumulate as separate items for work that could be done cohesively. The result is multiple small flows where one would suffice.
**Migration guidance:** Add the merge assessment rule to your project's log management protocol — either in the log itself, in your log instruction, or in the Owner role where Next Priorities management is described. No retroactive merge of existing Next Priorities items is required.

---

### Merge assessment in synthesis output protocol

**Impact:** Recommended
**Affected artifacts:** `general/improvement/main.md`
**What changed:** In the "How It Works" section, step 5 (routing actionable items from synthesis), the bullet for "changes outside `a-docs/`" now includes a merge assessment step before filing. The same criteria apply: same target files/design area and compatible authority level.
**Why:** Synthesis is a common path for surfacing new Next Priorities items. Without the merge check at synthesis, the proliferation problem occurs even when the Owner applies the merge rule at intake.
**Migration guidance:** Update your project's `a-docs/improvement/main.md` (or equivalent improvement document) — in the synthesis routing step, add the merge assessment note before the "create an entry" instruction. The specific wording is in the updated `$GENERAL_IMPROVEMENT`.

---

### Merge assessment in Owner role template

**Impact:** Recommended
**Affected artifacts:** `general/roles/owner.md`
**What changed:** A new bullet has been added to the "The Owner owns" list in the Owner role template, describing project log ownership with an explicit merge assessment obligation when adding any Next Priorities item.
**Why:** The Owner is the primary role that manages Next Priorities — at intake, and when receiving synthesis findings. The merge obligation belongs in the Owner role where the responsibility is declared.
**Migration guidance:** Update your project's `a-docs/roles/owner.md` — in the "Authority & Responsibilities" section, add a log ownership bullet that includes the merge assessment obligation. The specific wording is in the updated `$GENERAL_OWNER_ROLE`.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
