---
type: owner-workflow-plan
date: "2026-04-04"
complexity:
  domain_spread: high
  shared_artifact_impact: high
  step_dependency: elevated
  reversibility: moderate
  scope_size: high
tier: 3
path:
  - Owner — Intake & Briefing
  - Curator — Proposal (parallel with Runtime Developer)
  - Runtime Developer — Implementation (parallel with Curator Proposal)
  - Owner — Curator Proposal Review
  - Curator — Implementation & Registration
  - Owner — Forward Pass Closure
known_unknowns:
  - Exact runtime source files requiring change (Runtime Developer to enumerate at implementation)
  - Whether general/ role templates carry required_reading frontmatter or prose sections only (Curator to assess during proposal)
  - Whether the Initializer agent (a-society/agents/initializer.md) requires updating to produce required-readings.yaml during bootstrap (Curator to assess during proposal)
---

**Subject:** Required readings authority restructure — required-readings.yaml + runtime context overhaul
**Type:** Owner Workflow Plan
**Date:** 2026-04-04

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches runtime implementation, a-docs (all role files, agents.md), and general/ (new instruction, role templates, manifest) — three independent domains requiring parallel coordination | high |
| **2. Shared artifact impact** | agents.md is the universal entry point; all role files are loaded every session; general/ role templates are used by all adopting projects; manifest governs scaffolding | high |
| **3. Step dependency** | ADR on required-readings.yaml schema gates both tracks; Curator a-docs changes must align with approved general/ instruction form; runtime parser depends on schema | elevated |
| **4. Reversibility** | Removing prose from role files and agents.md is non-trivial to undo; runtime changes are code changes with test coverage obligations | moderate |
| **5. Scope size** | Multiple runtime source files, all a-docs role files, agents.md, new general/ instruction, manifest update, general/ role template updates, A-Society required-readings.yaml instance | high |

**Verdict:** Tier 3 — multi-phase, multi-domain, ADR + LIB scope with parallel implementation tracks and adopting-project impact.

---

## Routing Decision

Four axes at high and one at elevated. This is a structural change to how the runtime loads context — it affects every session in every project using A-Society. The `[LIB]` surface requires Owner approval before Curator writes to `general/`. The runtime and Curator tracks are independent once the ADR decision is recorded in this plan and the briefs, so they run in parallel. Tier 3.

This flow directly addresses and closes the Next Priorities item: **Role-file required-reading authority model** `[M][LIB][ADR]`.

---

## ADR Decision: Required Readings Authority Model

**Decision:** `a-docs/roles/required-readings.yaml` is the sole machine-readable authority for required readings. Frontmatter blocks (`required_reading`, `universal_required_reading`) in individual role files and `agents.md` are vestigial once this file exists and must be removed. Prose required-reading sections in role files and `agents.md` are also vestigial once the runtime handles injection programmatically and must be removed. The context confirmation ritual ("Context loaded: ...") is theater under runtime injection and must be removed from all injected content.

**Schema (authoritative):**

```yaml
universal:
  - $VAR_NAME       # loaded for every role
roles:
  owner:
    - $VAR_NAME
    - $VAR_NAME
  curator:
    - $VAR_NAME
  # one key per role; key matches role name used by runtime parser
```

Variable names reference entries in the project's index. Every project creates one instance at `a-docs/roles/required-readings.yaml`.

**Runtime behavior change:**
1. Role announcement before context injection: announce `"You are the [Role] agent for [project]."` before injecting required readings.
2. Date injection: inject current date at session start.
3. Parse `a-docs/roles/required-readings.yaml` for required readings (universal + role-specific), not role file frontmatter.
4. Return errors to model instead of stopping: workflow errors (missing record folder, missing workflow.md) are returned as a message to the model rather than terminating orchestration.

---

## Path Definition

1. Owner — Intake & Briefing (this artifact + workflow.md + briefs to Curator and Runtime Developer)
2. Curator — Proposal (parallel with Runtime Developer): draft general/ instruction for required-readings.yaml, update general/ role templates, update manifest, draft framework update report; scope Initializer assessment
3. Runtime Developer — Implementation (parallel with Curator Proposal): implement all four runtime behavior changes per Owner brief
4. Owner — Curator Proposal Review: apply five review tests + coupling check + manifest check
5. Curator — Implementation & Registration: implement approved general/ changes + all a-docs direct-authority changes (A-Society required-readings.yaml, role file cleanup, agents.md cleanup, Initializer update if scoped); register in indexes; update a-docs-guide; publish update report
6. Owner — Forward Pass Closure: verify all forward-pass work complete; update log

---

## Known Unknowns

- Exact runtime source files requiring change (Runtime Developer to enumerate at implementation)
- Whether general/ role templates carry required_reading frontmatter or prose sections only (Curator to assess during proposal)
- Whether the Initializer agent (a-society/agents/initializer.md) requires updating to produce required-readings.yaml during bootstrap (Curator to assess; scope if warranted)
