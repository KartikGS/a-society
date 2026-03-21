---
type: owner-workflow-plan
date: "2026-03-21"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: moderate
  reversibility: low
  scope_size: moderate
tier: 2
path:
  - Owner - Intake & Briefing
  - Curator - Direct Implementation (A, C, Index) + Proposal (B, E)
  - Owner - Review (B, E)
  - Curator - Implementation (B, E) + Registration
  - Owner - Forward Pass Closure
known_unknowns:
  - "Curator determines exact prose placement and phrasing for B and E within the existing Brief-Writing Quality section to integrate cleanly without redundancy."
---

**Subject:** Next priorities bundle — guardrail ordering, records delimiter, index path adoption, brief placement guidance, classification scope
**Type:** Owner Workflow Plan
**Date:** 2026-03-21

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | All documentation framework content — a-docs and general library. No cross-domain reach. | low |
| **2. Shared artifact impact** | Modifies `$GENERAL_IMPROVEMENT`, `$GENERAL_OWNER_ROLE`, and `$INSTRUCTION_RECORDS` (distributed to adopters); `$A_SOCIETY_INDEX` (large internal registry — 98 rows); `$A_SOCIETY_OWNER_ROLE` and `$A_SOCIETY_IMPROVEMENT` (internal a-docs). | moderate |
| **3. Step dependency** | Items A, C, and Priority 2 are Curator-direct — no dependency. Items B and E require Curator draft → Owner review → Curator implement. One sequential dependency chain for two of the five items. | moderate |
| **4. Reversibility** | All documentation changes. No structural changes to folders or indexes beyond path format cleanup. Easily reverted. | low |
| **5. Scope size** | Six files; two roles (Owner + Curator). | moderate |

**Verdict:** Tier 2 — Items B and E require an Owner approval round (LIB additions to a general role template); items A, C, and Priority 2 are Curator-authority but bundled in the same flow for efficiency.

---

## Routing Decision

Tier 2. The B and E items are `[LIB]` additions to `$GENERAL_OWNER_ROLE` — these require the Approval Invariant to be satisfied via a Phase 2 decision artifact. The Curator-direct items (A, C, Priority 2) are bundled in the same Curator session to avoid three separate flows for closely related work. Two elevated axes (shared artifact impact, step dependency) support Tier 2 rather than Tier 1.

---

## Path Definition

1. **Owner** — Intake & Briefing: produce workflow plan and brief.
2. **Curator** — Implement A, C, and Priority 2 directly; draft wording for B and E; return in a single proposal artifact.
3. **Owner** — Review the B and E wording; issue APPROVED or REVISE.
4. **Curator** — Implement approved B and E; complete registration; assess update report obligation.
5. **Owner** — Forward Pass Closure: review update report if triggered; close.

---

## Known Unknowns

- Curator determines exact prose placement and phrasing for B and E within the existing Brief-Writing Quality section to integrate cleanly without redundancy.
