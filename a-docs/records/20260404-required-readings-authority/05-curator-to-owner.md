# Curator → Owner: Proposal (Required Readings Authority) [REVISED]

**Subject:** Required readings authority restructure — required-readings.yaml + context injection cleanup
**Status:** PROPOSED
**Date:** 2026-04-04
**Record:** `a-society/a-docs/records/20260404-required-readings-authority/`

---

## Analysis & Assessment

The transition to a single `required-readings.yaml` authority addresses the "Context is a Scarce Resource" principle and reduces structural duplication. By moving required readings from role-file frontmatter and prose into a unified schema, we enable the runtime to load context more efficiently and eliminate the drift risk between machine-readable and natural-language declarations.

### Scoping Adjustments (Revised)

1.  **$INSTRUCTION_AGENTS scope:** I will remove any guidance that directs authors to add required-reading lists or a context confirmation statement. A note will be added that required readings are declared in `a-docs/roles/required-readings.yaml` per `$INSTRUCTION_REQUIRED_READINGS`.
2.  **$INSTRUCTION_ROLES scope:** I will remove any guidance that directs role authors to add `required_reading` frontmatter or `## Context Loading` prose sections to role files. If the section survives, it will redirect to `required-readings.yaml` as the sole authority and state explicitly that role files do not carry these declarations.
3.  **Role key naming convention:** Role keys in `required-readings.yaml` must be lowercase, hyphenated strings matching the role name as registered in the `agents.md` roles table.
4.  **Initializer assessment:** The Initializer (`$A_SOCIETY_INITIALIZER_ROLE`) will be updated to produce and populate `required-readings.yaml` during bootstrap.

---

## Proposed Changes (LIB Scope)

### 1. New Instruction: `$INSTRUCTION_REQUIRED_READINGS`
**Target:** `a-society/general/instructions/roles/required-readings.md`

This document defines the purpose and schema of the required readings authority.
- **Authority:** Single machine-readable source of truth.
- **Registry:** `a-docs/roles/required-readings.yaml`.
- **Schema:** `universal` list + `roles` map.

### 2. General Role Templates Update
**Targets:** `$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE`, `$GENERAL_TA_ROLE`
- Remove `required_reading` / `roles` frontmatter.
- Remove `## Context Loading` sections.
- Remove the context confirmation ritual string.

### 3. Instruction Updates
**Target:** `$INSTRUCTION_AGENTS`
- Remove `## YAML Frontmatter: Universal Required Reading` section.
- Remove guidance directed at authors to add required-reading lists or context confirmation statements.
- Add note directing authors to perform declaration in `a-docs/roles/required-readings.yaml`.

**Target:** `$INSTRUCTION_ROLES`
- Remove `## YAML Frontmatter: Role-Specific Required Reading` section.
- Remove guidance directed at authors to add `required_reading` frontmatter or prose-based `Context Loading` sections.
- Update all Archetype templates within the instruction to remove frontmatter and `Context Loading` prose.

### 4. Manifest Update
**Target:** `$GENERAL_MANIFEST`
- Add `path: roles/required-readings.yaml` as a `required: true`, `scaffold: stub` entry under the **Roles** section.

---

## Direct Authority Items (Post-Approval)

The following will be implemented directly during the implementation pass:
- **A-Society Instance:** Create `a-society/a-docs/roles/required-readings.yaml`.
- **A-Society a-docs Cleanup:** Remove frontmatter, rituals, and context loading sections from all role files and `agents.md`.
- **A-Society Index:** Register `$A_SOCIETY_REQUIRED_READINGS` and `$INSTRUCTION_REQUIRED_READINGS`.
- **A-Society Agent Docs Guide:** Add rationale for `required-readings.yaml`.
- **Initializer Update:** Update `Phase 3 — Draft` to include population of `required-readings.yaml`.

---

## Framework Update Report Draft

**Target:** `a-society/updates/2026-04-04-required-readings-authority.md`

### Summary
Restructuring required-readings declaration into a single authoritative `a-docs/roles/required-readings.yaml` file. Removes frontmatter and context-loading prose from role files and `agents.md`.

### Impact Classification
| Domain | Level | Rationale |
|---|---|---|
| **Runtime** | Breaking | Runtime v30.0+ requires `required-readings.yaml` for context injection. |
| **Documentation** | Recommended | Removal of vestigial frontmatter and prose reduces clutter and drift risk. |

### Migration Guidance
1. Create `a-docs/roles/required-readings.yaml` using the new schema defined in `$INSTRUCTION_REQUIRED_READINGS`.
2. Migrate all universal and role-specific reading lists from role file/agents.md frontmatter to the new file.
3. Remove `required_reading` frontmatter and `Context Loading` sections from all role files and `agents.md`.
4. Update the project log and version record.

---

Next action: Owner review.
Read: `a-society/a-docs/records/20260404-required-readings-authority/05-curator-to-owner.md`
Expected response: `06-owner-review-decision.md` in the same record folder.
