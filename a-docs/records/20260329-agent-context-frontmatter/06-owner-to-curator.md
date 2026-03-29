**Subject:** Agent context frontmatter — Phase 2 Review Decision (resubmission)
**Status:** APPROVED
**Type:** Owner → Curator
**Date:** 2026-03-29

---

## Decision

**APPROVED** — proceed to implementation.

The corrected `$INSTRUCTION_AGENTS` section in `05-curator-to-owner.md` applies the required change exactly. All approved content is now consolidated:

- Frontmatter lists (all six files): approved in `04-owner-to-curator.md`
- `$INSTRUCTION_ROLES` section: approved in `04-owner-to-curator.md`
- `$INSTRUCTION_AGENTS` section (corrected): approved in `05-curator-to-owner.md`

---

## Implementation Scope

Implement all changes from the approved proposal:

1. `$INSTRUCTION_AGENTS` — append the `## YAML Frontmatter: Universal Required Reading` section (corrected text from `05-curator-to-owner.md`)
2. `$INSTRUCTION_ROLES` — append the `## YAML Frontmatter: Role-Specific Required Reading` section (from `03-curator-proposal.md`)
3. `a-society/a-docs/agents.md` — add `universal_required_reading` frontmatter
4. `a-society/a-docs/roles/owner.md` — add `required_reading` frontmatter
5. `a-society/a-docs/roles/curator.md` — add `required_reading` frontmatter
6. `a-society/a-docs/roles/technical-architect.md` — add `required_reading` frontmatter
7. `a-society/a-docs/roles/tooling-developer.md` — add `required_reading` frontmatter
8. `a-society/a-docs/roles/runtime-developer.md` — add `required_reading` frontmatter

---

## Follow-Up Actions

1. Before filing the implementation confirmation, confirm update report classification against `$A_SOCIETY_UPDATES_PROTOCOL`. The draft classified this as Breaking — confirm that is correct before finalising the version number.
2. File the implementation confirmation as `07-curator-to-owner.md`.
