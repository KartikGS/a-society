# A-Society Framework Update — 2026-03-09

**Framework Version:** v1.1 *(A-Society's version after this update is applied)*
**Previous Version:** v1.0 *(A-Society's version before this update)*

## Summary

This update introduces a `vMAJOR.MINOR` versioning scheme for A-Society. Every initialized project now holds a version record in its `a-docs/` that stamps the baseline framework version and logs applied update reports. Every future update report declares the version it represents. Together, these three changes allow any project's Curator to determine exactly which update reports are pending by comparing the project's recorded version against `a-society/VERSION.md`. All projects initialized before this update should be treated as having baseline v1.0.

Known adopters at publication time: LLM Journey. This report is addressed to all adopting project Curators. Migration guidance is written generically — map `$[PROJECT]_*` placeholders to your project's actual index variable names.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 0 | — |
| Recommended | 3 | Improvements worth adopting — Curator judgment call |
| Optional | 0 | — |

---

## Changes

### RECOMMENDED 1 — Project-level A-Society version record

**Impact:** Recommended
**Affected artifacts:** New file — `a-docs/a-society-version.md` (to be created in each adopting project)
**What changed:** A new artifact has been added to the standard `a-docs/` set: a version record that stamps the A-Society baseline version at initialization and logs applied update reports. The Initializer now creates this file during Phase 3. The instruction for creating it is at `$INSTRUCTION_A_SOCIETY_VERSION_RECORD`.
**Why:** Without a recorded version baseline, a Curator joining mid-lifecycle has no way to determine which update reports have already been applied and which are pending. The version record closes this gap.
**Migration guidance:** If your project does not have `a-docs/a-society-version.md`, create one now. Set **Baseline Version** to `v1.0` (the version at which this system was introduced) and **Initialized** to your project's original initialization date if known, or today's date if not. Leave the Applied Updates table with the placeholder row — do not retroactively log pre-versioning update reports that may or may not have been applied. Apply update reports from v1.0 forward as part of your next migration cycle. Register the file in your project's `$[PROJECT]_INDEX`. See `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` for the full file format.

---

### RECOMMENDED 2 — Curator role: version-aware migration protocol

**Impact:** Recommended
**Affected artifacts:** `$GENERAL_CURATOR_ROLE`
**What changed:** A new "Version-Aware Migration" section has been added to the general Curator role template. It specifies the five-step process for performing migrations in version order: read the project's version record, identify pending update reports by Previous Version, apply them sequentially, log each one in the version record, and do not mark migration complete until the recorded version matches `$A_SOCIETY_VERSION`. Includes bootstrapping guidance for projects initialized before versioning was introduced.
**Why:** Without this protocol, a Curator performing migrations has no principled basis for determining which update reports apply and in what order. As the number of update reports grows, ad-hoc migration becomes increasingly error-prone.
**Migration guidance:** Review your project's `$[PROJECT]_CURATOR_ROLE`. If it was produced from the general Curator role template and does not contain a "Version-Aware Migration" section, add the section now, adapting `$A_SOCIETY_VERSION` and `$INSTRUCTION_A_SOCIETY_VERSION_RECORD` references to their equivalents in your project's public index (or keep them as-is if your project resolves them via the A-Society public index).

---

### RECOMMENDED 3 — Update report template: version header fields

**Impact:** Recommended
**Affected artifacts:** `$A_SOCIETY_UPDATES_TEMPLATE`, `$A_SOCIETY_UPDATES_PROTOCOL`
**What changed:** The update report template now includes two header fields before the Summary section: **Framework Version** (the version A-Society is at after this update is applied) and **Previous Version** (the version before this update). The update report protocol has a new "Version Requirements" section specifying these fields and the atomic registration step (updating `$A_SOCIETY_VERSION` at the same time the report is published).
**Why:** Curators of adopting projects need to know the version sequence of update reports to apply them in order. Without version fields on the reports themselves, ordering requires inferring from publication dates, which is ambiguous when multiple reports are published on the same date.
**Migration guidance:** This change affects only future update reports produced by A-Society — it does not require changes to previously published reports or to adopting project `a-docs/`. No migration action required. If your project produces its own framework update reports (outbound to sub-projects), consider adding equivalent version fields for the same reasons.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle. A versioning scheme (`vMAJOR.MINOR`) is now established — compare your project's `a-docs/a-society-version.md` recorded version against `a-society/VERSION.md` to identify pending reports.
