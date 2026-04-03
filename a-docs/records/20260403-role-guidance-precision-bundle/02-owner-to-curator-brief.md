---
type: owner-to-curator-brief
date: "2026-04-03"
scope_status: complete
approved_change: "Yes"
---

**Subject:** Role guidance precision bundle: 9 additions to general Owner and Curator role templates
**Type:** Owner-to-Curator Brief
**Date:** 2026-04-03

---

## Agreed Change

Implement 9 precision additions to `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE`, derived from backward pass synthesis findings across multiple prior flows.

### Items for `$GENERAL_OWNER_ROLE`

| # | Source Flow | Finding | Status |
|---|---|---|---|
| 1 | `20260329-owner-protocol-and-role-guidance-bundle` | Brief-state-claim verification — verify current file state before making specific state claims in briefs | A-Society role already has this; general-layer counterpart needed |
| 2 | `20260331-session-routing-removal` | Schema-code coupling check — when documentation change defines schema with programmatic consumer, scope both docs and code changes in same flow | A-Society role already has this; general-layer counterpart needed |
| 3 | `20260331-session-routing-removal` | Removal-of-dependents scoping — when removing item from structured list, enumerate all dependent content for removal across target files | A-Society role already has this; general-layer counterpart needed |
| 4 | `20260402-parallel-track-orchestration` | Multi-track path portability — for parallel-track flows, verify no machine-specific absolute paths or `file://` URLs at closure | A-Society role already has this; general-layer counterpart needed |
| 5 | `20260402-parallel-track-orchestration` | Mixed-scope brief timing — when brief combines approval-scoped work with direct-authority items, state whether direct items are immediate or batched | A-Society role already has this; general-layer counterpart needed |
| 6 | `20260401-c7-removal-c3-extension-synthesis-hardcode` | Removed-type-surface consumer enumeration — when removing/renaming consumed program element, enumerate both definition site and consuming call sites | A-Society role already has this; general-layer counterpart needed |
| 7 | `20260401-c7-removal-c3-extension-synthesis-hardcode` | Public-index variable retirement reference sweeps — when removing publicly registered artifact, sweep for `$VARIABLE_NAME` references and scope dependent files for upfront authorization | A-Society role already has this; general-layer counterpart needed |
| 8 | Next Priorities entry (item 6) | Structured-entry replacement-boundary — when directing change within structured documentation entry, state whether replacement is description-only or applies to whole entry | **Not yet implemented** — new |

### Items for `$GENERAL_CURATOR_ROLE`

| # | Source Flow | Finding | Status |
|---|---|---|---|
| 1 | `20260329-owner-protocol-and-role-guidance-bundle` | Implementation portability gap — when adapting text from project-specific to general (or vice versa), verify variable references, terminology, and examples are valid in target context | A-Society role already has this; general-layer counterpart needed |

---

## Scope

The Curator produces a proposal (Phase 1 artifact) that:

1. Adds 8 items to `$GENERAL_OWNER_ROLE` — all traced to prior findings with A-Society-role precedents
2. Adds 1 item to `$GENERAL_CURATOR_ROLE` — traced to prior finding with A-Society-role precedent

**Item 8 (structured-entry replacement-boundary)** is the only item without a prior A-Society-role implementation — the Curator should evaluate the appropriate phrasing and placement by reviewing the existing guidance structure in `$A_SOCIETY_OWNER_ROLE` for consistency.

The proposal must also identify whether any item requires a framework update report, and if so, include the draft update report section.

---

## Constraints

- All items must be placed in the appropriate section of each role template (Brief-Writing Quality, Implementation Practices, Forward Pass Closure Discipline, etc.)
- Items should follow the phrasing and structural conventions established in the prior bundles
- The proposal must not duplicate what already exists — verify against the existing content in `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` before proposing

---

## Timeline

Produce the proposal artifact in this record folder by the next session.