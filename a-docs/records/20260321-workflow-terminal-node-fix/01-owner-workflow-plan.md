---
type: owner-workflow-plan
date: "2026-03-21"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: low
  reversibility: low
  scope_size: low
tier: 2
path:
  - Owner — Intake & Briefing
  - Curator — Proposal
  - Owner — Review
  - Curator — Implementation & Registration
  - Owner — Terminal Review
known_unknowns:
  - "Whether the tooling workflow requires an Owner terminal node after curator-phase7, or whether owner-phase6-gate already satisfies the Owner-as-terminal principle given Phase 7 is execution-only work already gate-approved."
  - "Whether prose in the session model or role documents within the two workflow files needs updating beyond the YAML graph changes."
---

**Subject:** Workflow YAML graph terminal node correction — two workflow files
**Type:** Owner Workflow Plan
**Date:** 2026-03-21

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | a-docs/ workflow files only; no general/ changes | low |
| **2. Shared artifact impact** | Two shared workflow documents used by all agents working on A-Society | moderate |
| **3. Step dependency** | Changes to each file are independent of each other; no decision in one affects the other | low |
| **4. Reversibility** | YAML frontmatter changes are easily undone | low |
| **5. Scope size** | Two files, two roles (Owner + Curator) | low |

**Verdict:** Tier 2 — `$INSTRUCTION_WORKFLOW_MODIFY` explicitly requires workflow modifications to go through the proposal-review path ("the modification itself must go through the workflow"). The shared artifact impact (two workflow YAML graphs) and the role separation requirement for implementation also support Tier 2. Tier 1 is excluded by the modification protocol.

---

## Routing Decision

Tier 2. The complexity axes are predominantly low, but the workflow modification protocol is a project-level constraint that requires proposal and Owner review before implementation regardless of complexity score. Standard Tier 2 path: Owner brief → Curator proposal → Owner review → Curator implementation + registration → backward pass.

---

## Path Definition

1. Owner — Intake & Briefing (this artifact + `02-owner-to-curator-brief.md`)
2. Curator — Proposal (draft modified YAML graphs; validate against `$INSTRUCTION_WORKFLOW_MODIFY` principles and hard rules; surface any prose updates needed)
3. Owner — Review (apply standard review tests; issue decision)
4. Curator — Implementation & Registration (update both workflow files; update indexes if needed; assess update report trigger)
5. Owner — Terminal Review (clear any update report submissions; acknowledge flow closure)

---

## Known Unknowns

- Whether the tooling workflow requires an Owner terminal node after `curator-phase7`, or whether `owner-phase6-gate` already satisfies the Owner-as-terminal principle given Phase 7 is execution-only work already gate-approved. Deferred to Curator during proposal.
- Whether any prose in the session model sections of either workflow file needs updating beyond the YAML graph changes. Curator should scan both documents during proposal formulation.
