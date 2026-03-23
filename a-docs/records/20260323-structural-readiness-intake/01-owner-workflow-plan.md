---
type: owner-workflow-plan
date: "2026-03-23"
complexity:
  domain_spread: moderate
  shared_artifact_impact: elevated
  step_dependency: low
  reversibility: moderate
  scope_size: moderate
tier: 2
path:
  - "Owner — Intake & Briefing"
  - "Curator — Proposal"
  - "Owner — Review"
  - "Curator — Implementation & Registration"
  - "Curator — Update Report & Version Increment"
  - "Owner — Forward Pass Closure"
known_unknowns:
  - "Whether structural readiness content fits within complexity.md as a new section or warrants a companion document — Curator to assess based on drafting volume"
  - "Whether any existing complexity.md content needs updating to reflect structural gaps as a first-class known unknown type"
---

**Subject:** Structural Readiness Assessment at Intake
**Type:** Owner Workflow Plan
**Date:** 2026-03-23

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Primarily workflow/intake domain; also touches Owner role definition in both `general/` and `a-docs/` | moderate |
| **2. Shared artifact impact** | Modifies `$INSTRUCTION_WORKFLOW_COMPLEXITY` and `$GENERAL_OWNER_ROLE` — shared instructions consumed by all projects using the framework | elevated |
| **3. Step dependency** | Additive changes; detection criteria and handling guidelines are co-located in the same section; no cross-role dependency on prior decisions | low |
| **4. Reversibility** | Additive sections; can be removed, but affects shared templates adopted by other projects | moderate |
| **5. Scope size** | Three files: `$INSTRUCTION_WORKFLOW_COMPLEXITY`, `$GENERAL_OWNER_ROLE`, `$A_SOCIETY_OWNER_ROLE`; two roles (Owner, Curator) | moderate |

**Verdict:** Tier 2 — elevated shared artifact impact on `general/` content requires Curator proposal and Owner review before implementation.

---

## Routing Decision

Tier 2. The shared artifact impact axis is the deciding factor: `$INSTRUCTION_WORKFLOW_COMPLEXITY` and `$GENERAL_OWNER_ROLE` are consumed by every project using the framework. Additions to them require Owner review before creation per the Approval Invariant. Scope is bounded and additive, which keeps this at Tier 2 rather than Tier 3. `[LIB]` tag applies — all `general/` files require update report assessment post-implementation.

---

## Path Definition

1. Owner — Intake & Briefing
2. Curator — Proposal
3. Owner — Review
4. Curator — Implementation & Registration
5. Curator — Update Report & Version Increment
6. Owner — Forward Pass Closure

---

## Known Unknowns

1. Whether the structural readiness content fits within `$INSTRUCTION_WORKFLOW_COMPLEXITY` as a new section or warrants a companion document — the Curator should assess this based on content volume during drafting. If a companion document is proposed, it must satisfy the namespace parity exception or wait until three related documents exist (per `$A_SOCIETY_STRUCTURE`).
2. Whether any existing content in `$INSTRUCTION_WORKFLOW_COMPLEXITY` (e.g., the "known unknowns" guidance) needs updating to reflect structural gaps as a first-class known unknown type.
