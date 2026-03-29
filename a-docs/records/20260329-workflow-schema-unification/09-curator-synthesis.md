# Backward Pass Synthesis — 20260329-workflow-schema-unification

**Date:** 2026-03-29
**Task Reference:** `20260329-workflow-schema-unification`
**Role:** Curator (Synthesis)
**Depth:** Full

---

## Findings Reviewed

- `07-curator-findings.md` — Curator (full)
- `08-owner-findings.md` — Owner (full)

---

## Findings Review

### Shared finding cluster — schema migrations need explicit parity and terminology handling

The two findings artifacts converge on the same failure mode: schema changes were scoped as structural edits, but the surrounding maintenance obligations were only partially explicit. One gap sits at briefing time: when a project-specific convention mirrors a reusable general instruction, the brief must explicitly assess whether the general counterpart changes too. The second gap sits across briefing and implementation: schema migrations need an explicit vocabulary sweep so legacy terms do not survive around the updated schema.

**Routing:**
- `$A_SOCIETY_OWNER_ROLE` Brief-Writing Quality — within `a-docs/` → implement directly
- `$A_SOCIETY_CURATOR_ROLE` Implementation Practices — within `a-docs/` → implement directly
- `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` counterparts — outside `a-docs/` → merge into `$A_SOCIETY_LOG` Next Priorities

### Items reviewed but not queued separately

The anchor-drift observation remains an operational reality already mitigated by the existing adjacent-anchor guidance, so no new item is warranted. The Component 4 incompatibility remains already tracked under the existing workflow-schema-unification tooling/runtime follow-on, so no duplicate Next Priorities item is filed.

---

## Direct Implementation

### `$A_SOCIETY_OWNER_ROLE`

Implemented two synthesis-authority fixes in `$A_SOCIETY_OWNER_ROLE`:

1. **Project-specific convention changes require mirror assessment**
Added a brief-writing rule requiring explicit assessment of the reusable general-instruction counterpart whenever a brief modifies a project-specific convention that instantiates it. The brief must either scope the general counterpart as a co-change or declare it out of scope with rationale.

2. **Schema migrations require a vocabulary sweep**
Added a brief-writing rule requiring schema-migration briefs to scope a surrounding prose sweep for deprecated terminology, so field-name and structural-vocabulary changes do not stop at the schema block.

### `$A_SOCIETY_CURATOR_ROLE`

Implemented one synthesis-authority fix in `$A_SOCIETY_CURATOR_ROLE`:

1. **Implementation-stage terminology sweep for schema changes**
Added an Implementation Practices rule requiring the Curator to sweep adjacent prose for deprecated structural vocabulary when implementing schema migrations or other renames of fields, nodes, or related terms.

---

## Next Priorities Update

### Merge assessment

The generalizable follow-ons from both findings artifacts target `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE`, carry compatible `[LIB]` authority, and follow the same Framework Dev path as the existing **Role guidance precision bundle** entry in `$A_SOCIETY_LOG`. They are the same design area: role-guidance precision that prevents correction rounds caused by under-scoped briefs or incomplete terminology updates. Therefore, no new standalone item was created.

### Applied update

Merged the workflow-schema-unification follow-ons into the existing `[M][LIB]` **Role guidance precision bundle** entry in `$A_SOCIETY_LOG`, expanding it with three additional sub-points:

- `$GENERAL_OWNER_ROLE` should require explicit mirror assessment when a brief modifies a project-specific convention that instantiates a general instruction
- `$GENERAL_OWNER_ROLE` should require schema-migration briefs to scope a vocabulary sweep for deprecated terminology in surrounding prose
- `$GENERAL_CURATOR_ROLE` should require an implementation-stage terminology sweep when schema changes rename structural terms

Source citations from `07-curator-findings.md` and `08-owner-findings.md` were appended to that existing log item.

---

## Flow Status

Backward pass complete. Flow closed.
