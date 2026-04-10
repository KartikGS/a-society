---
type: owner-workflow-plan
date: "2026-04-10"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: low
  reversibility: low
  scope_size: low
tier: 2
path:
  - Owner - Intake & Briefing
  - Curator - Proposal
  - Owner - Review
  - Curator - Implementation & Registration
  - Owner - Closure
known_unknowns: []
---

**Subject:** Backward-pass findings template alignment for standing analysis families
**Type:** Owner Workflow Plan
**Date:** 2026-04-10

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches `general/` only — single domain | low |
| **2. Shared artifact impact** | The findings template is a shared artifact used by all backward-pass sessions; structural change to reporting scaffold | moderate |
| **3. Step dependency** | Self-contained change; no complex dependencies between steps | low |
| **4. Reversibility** | Adding sections to a template is easily reversible | low |
| **5. Scope size** | One file (`general/improvement/reports/template-findings.md`) | low |

**Verdict:** Tier 2 — Single `general/` file, requires Curator proposal and Owner review per the Approval Invariant, but bounded scope with clear sequence.

---

## Routing Decision

Tier 2. The work targets a single `general/` file and follows the standard framework-development loop. The Approval Invariant applies: Curator will write to `general/`, so Owner review is required. No multi-domain coordination or parallel tracks needed.

---

## Path Definition

1. Owner — Intake & Briefing (current step)
2. Curator — Proposal: draft the template updates with rationale
3. Owner — Review: approve, revise, or reject
4. Curator — Implementation & Registration: write approved content, update index if needed
5. Owner — Closure: confirm completion, update log, determine backward-pass routing

---

## Known Unknowns

None. The source findings artifacts from `20260407-role-jit-extraction` clearly identify the gap and the required direction.
