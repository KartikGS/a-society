# A-Society Framework Update Report: Required Readings Authority

**Date:** 2026-04-04
**Impact:** Breaking
**Status:** Published

---

## Summary

This update transitions A-Society's context injection model from decentralized, prose-based "Context Loading" rituals and frontmatter reading lists to a single, machine-readable authority: `required-readings.yaml`.

This change eliminates structural drift across sessions and enables the runtime to programmatically ensure every session starts with the correct required context — without requiring agents to manually verify or perform confirmation rituals.

---

## Impact Classification

| Change | Impact | Rationale |
|---|---|---|
| Centralized `required-readings.yaml` | **Breaking** | New mandatory file for all projects; runtime now depends on this file for session initialization. |
| Role Template Cleanup | **Breaking** | `required_reading` frontmatter and `## Context Loading` sections removed from all general role templates. |
| Ritual Removal | **Recommended** | Manual "Context loaded" confirmation strings removed from protocol instructions; context confirmation is now handled by the runtime-injected identity. |
| Instruction Cleanup | **Recommended** | Orientation guidance in `$INSTRUCTION_AGENTS` and `$INSTRUCTION_ROLES` updated to point to the new authority. |

---

## Changes

### 1. New Authority File: `roles/required-readings.yaml`
- **Variable:** `$[PROJECT]_REQUIRED_READINGS`
- **Schema:** 
  - `universal`: sequence of `$VAR` strings for all sessions.
  - `roles`: map keyed by lowercase role identifier, each value a sequence of role-specific `$VAR` strings.
- **Maintenance:** Managed via `$INSTRUCTION_REQUIRED_READINGS`.

### 2. General Template Updates
- **$GENERAL_OWNER_ROLE**, **$GENERAL_CURATOR_ROLE**, **$GENERAL_TA_ROLE**:
  - Removed `required_reading` YAML frontmatter.
  - Removed `## Context Loading` prose and checklists.
  - Removed legacy confirmation rituals from `## Post-Confirmation Protocol`.
- **$INSTRUCTION_AGENTS**:
  - Removed guidance directing authors to add reading lists or rituals to `agents.md`.
  - Added directive to point to `required-readings.yaml` as the source of truth.
- **$INSTRUCTION_ROLES**:
  - Removed guidance directing authors to add context-loading prose or confirmation strings to role files.

### 3. Manifest Update
- Added `a-docs/roles/required-readings.yaml` to `$GENERAL_MANIFEST`. Adopting projects must now include this file as part of a complete `a-docs/` structure.

---

## Migration Guidance

### For Project Owners/Curators

1. **Create the Authority:** Add `a-docs/roles/required-readings.yaml` to your project.
2. **Migrate Readings:** 
   - Move the universal reading list from `agents.md` to the `universal` key in the YAML.
   - For each role in `a-docs/roles/*.md`, move its `required_reading` frontmatter list to the corresponding key under `roles` in the YAML.
3. **Cleanup Rituals:** 
   - Remove the `universal_required_reading` frontmatter and the `## Required Reading` / `## Context Confirmation` prose from `agents.md`.
   - Remove the `## Context Loading` section from all role documents.
4. **Scaffolding:** If using the Scaffolding System, `$GENERAL_MANIFEST` will now automatically include a stub for this file.

### For Developers

Ensure your project's runtime is updated to support the new `required-readings.yaml` injection path before applying this framework update.
