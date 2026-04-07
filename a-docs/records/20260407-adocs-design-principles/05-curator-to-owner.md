**Subject:** a-docs Design Principles — JIT context model, agents.md cleanup, owner.md restructure, meta-analysis scope expansion — Implementation and Registration Complete
**Status:** SUBMITTED
**Date:** 2026-04-07

---

## Implementation Status

Complete. All approved changes implemented, update report published, required-readings updated, both indexes updated, and version registration complete.

---

## Files Changed

| File | Variable | Action |
|---|---|---|
| `a-society/a-docs/a-docs-design.md` | `$A_SOCIETY_ADOCS_DESIGN` | Created — A-Society a-docs design principles |
| `a-society/general/a-docs-design.md` | `$GENERAL_ADOCS_DESIGN` | Created — ready-made general a-docs design principles template |
| `a-society/general/instructions/a-docs-design.md` | `$INSTRUCTION_ADOCS_DESIGN` | Created — instruction for creating and maintaining `a-docs-design.md` |
| `a-society/a-docs/agents.md` | `$A_SOCIETY_AGENTS` | Removed vision-link line, File Path Index section, Roles section, and Required Readings Authority section |
| `a-society/a-docs/roles/owner.md` | `$A_SOCIETY_OWNER_ROLE` | Slimmed workflow-routing and post-confirmation content, removed four inline phase sections, added `## Just-in-Time Reads` |
| `a-society/a-docs/roles/owner/brief-writing.md` | `$A_SOCIETY_OWNER_BRIEF_WRITING` | Created — extracted `## Brief-Writing Quality` and `## Constraint-Writing Quality` verbatim |
| `a-society/a-docs/roles/owner/ta-advisory-review.md` | `$A_SOCIETY_OWNER_TA_REVIEW` | Created — extracted `## TA Advisory Review` verbatim |
| `a-society/a-docs/roles/owner/forward-pass-closure.md` | `$A_SOCIETY_OWNER_CLOSURE` | Created — extracted `## Forward Pass Closure Discipline` verbatim |
| `a-society/a-docs/improvement/meta-analysis.md` | `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` | Inserted `### a-docs Structure Checks` section |
| `a-society/general/improvement/meta-analysis.md` | `$GENERAL_IMPROVEMENT_META_ANALYSIS` | Inserted `### a-docs Structure Checks` section and repeated-header matching guidance |
| `a-society/a-docs/roles/required-readings.yaml` | `$A_SOCIETY_REQUIRED_READINGS` | Added `$A_SOCIETY_ADOCS_DESIGN` to Owner and Curator role-specific lists |
| `a-society/a-docs/indexes/main.md` | `$A_SOCIETY_INDEX` | Inserted all six approved new variables and updated `$A_SOCIETY_OWNER_ROLE` description |
| `a-society/index.md` | `$A_SOCIETY_PUBLIC_INDEX` | Inserted `$GENERAL_ADOCS_DESIGN` and `$INSTRUCTION_ADOCS_DESIGN` |
| `a-society/a-docs/a-docs-guide.md` | `$A_SOCIETY_AGENT_DOCS_GUIDE` | Added entries for `$A_SOCIETY_ADOCS_DESIGN`, `roles/owner/`, and the three extracted Owner phase docs; updated rationale entries for `$A_SOCIETY_AGENTS`, `$A_SOCIETY_OWNER_ROLE`, and `$A_SOCIETY_IMPROVEMENT_META_ANALYSIS` |
| `a-society/general/manifest.yaml` | `$GENERAL_MANIFEST` | Added required `a-docs-design.md` copy entry and updated the `agents.md` description for consistency with the new design model |
| `a-society/updates/2026-04-07-adocs-design-principles.md` | — | Published — framework update report |
| `a-society/VERSION.md` | `$A_SOCIETY_VERSION` | Updated — version header v31.0 → v32.0; History row added |

---

## Update Report

**Published:** `a-society/updates/2026-04-07-adocs-design-principles.md`  
**Classification resolved:** 2 Breaking, 0 Recommended, 0 Optional  
**Version:** v31.0 → v32.0

Classification rationale:
- **Breaking 1 — new required artifact type:** `$GENERAL_ADOCS_DESIGN` and `$INSTRUCTION_ADOCS_DESIGN`, together with the `$GENERAL_MANIFEST` entry, add a new required initialized artifact (`a-docs-design.md`). This creates a structural gap in projects initialized before the change.
- **Breaking 2 — new mandatory template section:** `$GENERAL_IMPROVEMENT_META_ANALYSIS` gains a new standing `a-docs Structure Checks` section. Existing project-specific instantiations are incomplete until they adopt the new section.

---

## Publication Condition

No conditions outstanding. Update report is published and version is updated. Ready for Owner Forward Pass Closure.

---

## Scope Notes

- The approved scope refinements were implemented in full: `$A_SOCIETY_REQUIRED_READINGS`, `$A_SOCIETY_INDEX` registration for the new general variables, and `$A_SOCIETY_AGENT_DOCS_GUIDE` entries for all four new `a-docs/` files.
- `$A_SOCIETY_INDEX` and `$A_SOCIETY_PUBLIC_INDEX` were compared directly after registration. The shared general variables now align across both indexes.
- `$GENERAL_MANIFEST`'s existing `agents.md` description was updated in the same pass because the new a-docs design model would otherwise leave that in-scope row internally stale. This was a consistency edit within an already approved target file, not a scope expansion to `$INSTRUCTION_AGENTS`.
- The approved follow-on remains untouched: `## How the Owner Reviews an Addition` and `## Review Artifact Quality` are still inline in `$A_SOCIETY_OWNER_ROLE` for a future stricter Principle 4 pass.
