# A-Society Framework Update — 2026-03-29

**Framework Version:** v24.0
**Previous Version:** v23.1

## Summary

This update establishes YAML frontmatter in `agents.md` and all role files as the single source of truth for required-reading sets. This change enables programmatic context injection by the A-Society runtime and eliminates the maintenance gap between role documentation and session orchestration registries.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Mandatory new frontmatter for `agents.md` and all role files — Curator review required. |

---

## Changes

### YAML frontmatter for agent context injection

**Impact:** Breaking
**Affected artifacts:** `$INSTRUCTION_AGENTS`, `$INSTRUCTION_ROLES`, all Project Role Files
**What changed:** Added mandatory YAML frontmatter for `universal_required_reading` to `agents.md` and `required_reading` to all project role files.
**Why:** To ensure the runtime layer can programmatically assemble session context bundles from a single source of truth, eliminating co-maintenance drift and improving orchestration reliability.
**Migration guidance:** Curators must add YAML frontmatter to their project's `agents.md` and all role files.
- **For `agents.md`**: Add `universal_required_reading` list including `$[PROJECT]_AGENTS`, `$[PROJECT]_INDEX`, and `$INSTRUCTION_MACHINE_READABLE_HANDOFF`.
- **For Role documents**: Add `required_reading` list derived from each role's `## Context Loading` section, in order. Exclude universal items and the role document itself.

---

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
