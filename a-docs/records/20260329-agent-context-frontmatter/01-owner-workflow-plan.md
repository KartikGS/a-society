---
type: owner-workflow-plan
date: "2026-03-29"
complexity:
  domain_spread: moderate
  shared_artifact_impact: elevated
  step_dependency: elevated
  reversibility: moderate
  scope_size: moderate
tier: 2
path:
  - "Owner — Intake & Brief"
  - "Curator — Proposal"
  - "Owner — Review"
  - "Curator — Implementation"
  - "Owner — Forward Pass Closure"
known_unknowns: []
---

**Subject:** Agent context frontmatter — YAML required-reading schema for `agents.md` and role files
**Type:** Owner Workflow Plan
**Date:** 2026-03-29

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches `$INSTRUCTION_AGENTS`, `$INSTRUCTION_ROLES`, all A-Society role files, and `agents.md` | moderate |
| **2. Shared artifact impact** | `agents.md` and role files are universal required reading for every agent session; format change propagates to all adopting projects | elevated |
| **3. Step dependency** | This Framework Dev flow must close before the follow-on Runtime Dev flow (replacing `registry.ts`) can be briefed | elevated |
| **4. Reversibility** | Frontmatter additions are reversible; a framework update report is required for adopting projects | moderate |
| **5. Scope size** | Eight files in scope — two `general/` instructions and six A-Society `a-docs/` files — all additive | moderate |

**Verdict:** Tier 2 — two elevated axes (shared artifact impact, step dependency) with a clear sequential multi-step path.

---

## Routing Decision

Tier 2. Shared artifact impact is elevated because `agents.md` and role files are loaded at the start of every agent session — a schema change here propagates immediately to all adopting projects. Step dependency is elevated because the Runtime Dev follow-on (replacing the static `registry.ts` with a frontmatter reader) cannot be briefed until this flow's schema spec is approved and implemented. Routed through Framework Development workflow.

The Runtime Dev follow-on is a separate flow; it is not part of this record.

---

## Path Definition

1. Owner — Intake & Brief (this artifact + `02-owner-to-curator-brief.md`)
2. Curator — Proposal (draft schema additions and rendered frontmatter for each target file; include update report draft)
3. Owner — Review
4. Curator — Implementation
5. Owner — Forward Pass Closure

---

## Known Unknowns

None.
