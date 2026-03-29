**Subject:** Agent context frontmatter — YAML required-reading schema for `agents.md` and role files
**Status:** PENDING_PROPOSAL
**Type:** Owner → Curator Brief
**Date:** 2026-03-29

---

## Context

The runtime's `registry.ts` is a static TypeScript object that manually duplicates each role's required-reading list. When a role's `## Context Loading` section changes, `registry.ts` must also be updated — a co-maintenance obligation with no structural enforcement, and a violation of the single-source-of-truth principle.

This flow establishes YAML frontmatter in `agents.md` and role files as the single source of truth for required-reading sets. The runtime follow-on (a separate flow) will replace the static registry with a function that reads this frontmatter dynamically at session start.

The handoff schema injection gap is bundled into this flow: `$INSTRUCTION_MACHINE_READABLE_HANDOFF` is included in the universal list below, making it part of every role's context bundle programmatically.

---

## Scope

`[M][LIB]` — additive additions to `agents.md`, all five A-Society role files, `$INSTRUCTION_AGENTS`, and `$INSTRUCTION_ROLES`. No existing content in any target file is modified or removed.

---

## YAML Frontmatter Schema

### In `agents.md` — universal required reading

Add the following YAML frontmatter block at the very top of `agents.md`, before the `# A-Society: Agent Orientation` heading:

```yaml
---
universal_required_reading:
  - $A_SOCIETY_AGENTS
  - $A_SOCIETY_INDEX
  - $INSTRUCTION_MACHINE_READABLE_HANDOFF
---
```

`universal_required_reading` is the set of documents every role reads regardless of assignment. The runtime injects these for all roles as the baseline context bundle.

- `$A_SOCIETY_AGENTS` first — agents.md itself; orientation, invariants, and role table.
- `$A_SOCIETY_INDEX` second — path resolution reference.
- `$INSTRUCTION_MACHINE_READABLE_HANDOFF` third — handoff block contract every role must follow when producing a pause-point output.

### In each role file — role-specific required reading

Add the following YAML frontmatter block at the very top of each role file, before the `# Role:` heading:

```yaml
---
required_reading:
  - $VAR_NAME_1
  - $VAR_NAME_2
  ...
---
```

**Derivation rule:** The list is derived from the role file's existing `## Context Loading` section. List every `$VAR` reference from that section in the order given, with two exclusions:
1. Any item already in `universal_required_reading` (`$A_SOCIETY_AGENTS`, `$A_SOCIETY_INDEX`, `$INSTRUCTION_MACHINE_READABLE_HANDOFF`)
2. The role file itself — the runtime injects role file content automatically since it reads the file to extract the frontmatter

The runtime combines `universal_required_reading` (from `agents.md`) + `required_reading` (from the role file) to assemble the full context bundle for a session.

---

## Files Changed

| File | Action | Notes |
|---|---|---|
| `$INSTRUCTION_AGENTS` | Additive | Add a new section at end: `## YAML Frontmatter: Universal Required Reading` — field name, value format (`$VAR` names as a YAML list), semantics (baseline for all roles), and placement rule (top of `agents.md` before all existing content) |
| `$INSTRUCTION_ROLES` (`a-society/general/instructions/roles/main.md`) | Additive | Add a new section at end: `## YAML Frontmatter: Role-Specific Required Reading` — field name, value format, derivation rule (from Context Loading section, excluding universal items and self-reference), and placement rule (top of role file before all existing content) |
| `a-society/a-docs/agents.md` | Additive | Add `universal_required_reading` frontmatter as specified above |
| `a-society/a-docs/roles/owner.md` | Additive | Add `required_reading` frontmatter derived from `## Context Loading` section |
| `a-society/a-docs/roles/curator.md` | Additive | Add `required_reading` frontmatter derived from `## Context Loading` section |
| `a-society/a-docs/roles/technical-architect.md` | Additive | Add `required_reading` frontmatter derived from `## Context Loading` section |
| `a-society/a-docs/roles/tooling-developer.md` | Additive | Add `required_reading` frontmatter derived from `## Context Loading` section |
| `a-society/a-docs/roles/runtime-developer.md` | Additive | Add `required_reading` frontmatter derived from `## Context Loading` section |

---

## Proposal Requirements

The proposal must:

1. Show the rendered frontmatter block for every target file — the exact text as it would appear in the file. Verify rendered frontmatter against the target file at proposal time: confirm the `$VAR` names in each role file's `required_reading` list are actually present in `$A_SOCIETY_INDEX` (they should be, but confirm before proposing).

2. Show the exact section text proposed for `$INSTRUCTION_AGENTS` and `$INSTRUCTION_ROLES`.

3. Include an update report draft as a named section `## Framework Update Report Draft`. Classification fields should be marked `TBD` at proposal stage; resolve by consulting `$A_SOCIETY_UPDATES_PROTOCOL` at Phase 4 before implementation confirmation.

---

## Open Questions

None.
