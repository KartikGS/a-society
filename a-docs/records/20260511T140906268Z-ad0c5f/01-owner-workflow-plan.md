---
type: owner-workflow-plan
date: "2026-05-11"
complexity:
  domain_spread: high
  shared_artifact_impact: high
  step_dependency: elevated
  reversibility: moderate
  scope_size: elevated
tier: 3
path:
  - Owner - Manual intake and proxy implementation
  - Owner - Closure
known_unknowns: []
---

**Subject:** Runtime a-docs manifest relocation
**Type:** Owner Workflow Plan
**Date:** 2026-05-11

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches runtime contracts, framework-service scaffolding, runtime health checks, public/internal indexes, executable coupling docs, update/version surfaces, and the project log. | high |
| **2. Shared artifact impact** | Retires `$GENERAL_MANIFEST`, introduces a new runtime-owned contract variable, and changes the runtime initialization/health contract. | high |
| **3. Step dependency** | Code path updates depend on the contract move; index and documentation registration depend on the new variable and path; version/update publication depends on final impact classification. | elevated |
| **4. Reversibility** | Reversible through a file move and reference updates, but public variable retirement and runtime health semantics make rollback non-trivial. | moderate |
| **5. Scope size** | Multi-file change across runtime code, tests, a-docs references, indexes, update report, version record, and log. | elevated |

**Verdict:** Tier 3 — This is a coordinated cross-domain contract relocation with executable and registration consequences.

---

## Routing Decision

Normal routing would activate Framework Services Developer, Orchestration Developer, Curator registration, and Owner closure. Because this session is not being run through the A-Society runtime and the human explicitly authorized the Owner to implement, the Owner will proxy the implementation and registration work directly, then verify the touched surfaces before closure.

---

## Touched Surfaces and Truth Owners

- `runtime/contracts/` — Orchestration Developer default runtime surface; runtime contract placement
- `runtime/src/framework-services/` — Framework Services Developer implementation truth for scaffolding and health checks
- `runtime/src/projects/` — Orchestration Developer default runtime implementation surface for initialization bootstrap wiring
- `runtime/test/` — executable verification truth for touched runtime behavior
- `index.md` and `a-docs/indexes/main.md` — Curator stewardship
- `a-docs/executable/` — Technical Architect design/coupling truth with Curator stewardship
- `a-docs/a-docs-guide.md` — Curator stewardship
- `updates/` and `VERSION.md` — Curator stewardship
- `a-docs/project-information/log.md` — Owner closure-owned lifecycle surface

---

## Path Definition

1. Owner — Confirm direction and manual process exception.
2. Owner — Move the manifest into runtime contracts and retire the old public variable.
3. Owner — Update runtime code and tests so initialization and health checks use the runtime contract.
4. Owner — Update active documentation, indexes, coupling references, update report, version, and log.
5. Owner — Verify with focused runtime tests and reference sweeps.

---

## Known Unknowns

None.
