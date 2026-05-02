---
type: owner-workflow-plan
date: "2026-05-02"
complexity:
  domain_spread: elevated
  shared_artifact_impact: elevated
  step_dependency: moderate
  reversibility: moderate
  scope_size: elevated
tier: 2
path:
  - Owner - Manual intake, migration execution, verification, and closure
known_unknowns:
  - Whether full runtime integration tests are already clean before this migration.
---

**Subject:** Runtime tree placement migration
**Type:** Owner Workflow Plan
**Date:** 2026-05-02

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches runtime contracts, source imports, tests, indexes, operator references, and executable docs. | elevated |
| **2. Shared artifact impact** | Moves public/internal registered runtime contract paths and changes the source-tree organization standard in-place. | elevated |
| **3. Step dependency** | File moves must precede import rewrites; verification depends on all path updates. | moderate |
| **4. Reversibility** | Mechanical moves are reversible, but broad import churn raises caution. | moderate |
| **5. Scope size** | Many runtime files and references are affected. | elevated |

**Verdict:** Tier 2 — targeted executable migration using the already-approved placement standard as the design boundary.

---

## Routing Decision

The prior manual flow stored the placement rule and filed this migration as `[M][RUNTIME]`. The user now asks to perform it. Because the runtime is not orchestrating this session and the design boundary is already established, this manual flow proceeds directly to migration and verification.

---

## Touched Surfaces and Truth Owners

- `runtime/contracts/` — Orchestration Developer-owned runtime contracts
- `runtime/src/` — Orchestration Developer-owned runtime implementation, with existing Framework Services / providers / tools subfolders retained
- `runtime/test/` — runtime verification surface
- `$A_SOCIETY_RUNTIME_INVOCATION` — Orchestration Developer operator reference
- `$A_SOCIETY_INDEX` and `$A_SOCIETY_PUBLIC_INDEX` — Curator-owned registrations
- `$A_SOCIETY_EXECUTABLE_ADDENDUM`, `$A_SOCIETY_EXECUTABLE_COUPLING_MAP`, `$A_SOCIETY_EXECUTABLE_OVERVIEW`, `$A_SOCIETY_EXECUTABLE_PROPOSAL` — executable standing references
- `$A_SOCIETY_LOG` — Owner-owned lifecycle and Next Priorities
- Active record folder — Owner-produced artifacts

---

## Path Definition

1. Owner — Manual intake, migration execution, verification, and closure

---

## Known Unknowns

- Whether full runtime integration tests are already clean before this migration.
