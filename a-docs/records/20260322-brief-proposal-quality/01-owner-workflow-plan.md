---
type: owner-workflow-plan
date: "2026-03-22"
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
  - Owner - Proposal Review
  - Curator - Implementation & Registration
  - Owner - Forward Pass Closure
known_unknowns:
  - "Item 2a echo: $A_SOCIETY_CURATOR_ROLE Implementation Practices already contains a behavioral property consistency check for proposals. Curator should verify at implementation whether the existing text satisfies the echo requirement; if equivalent, no change needed."
---

**Subject:** brief-proposal-quality
**Type:** Owner Workflow Plan
**Date:** 2026-03-22

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Changes touch brief-writing quality (Owner role) and proposal quality (Curator role) — two related behaviors within a single thematic area | low |
| **2. Shared artifact impact** | 4 role files: 2 LIB (general library, may trigger update report), 2 MAINT (a-docs echoes) | moderate |
| **3. Step dependency** | Content is pre-specified in Next Priorities; MAINT echoes follow directly from LIB decisions without novel judgment calls | low |
| **4. Reversibility** | Documentation-only changes; easily revised | low |
| **5. Scope size** | 4 files, 5 additions (3 to Owner brief-writing quality, 2 to Curator proposal/approval quality) | low |

**Verdict:** Tier 2 — Low complexity overall, but LIB writes require Owner review before implementation.

---

## Routing Decision

LIB changes to `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` require Owner approval before implementation. MAINT echoes to `$A_SOCIETY_OWNER_ROLE` and `$A_SOCIETY_CURATOR_ROLE` follow directly and require no separate approval. The elevated shared artifact impact (LIB + potential update report) confirms Tier 2. No axes reach a level warranting Tier 3.

---

## Path Definition

1. Owner — Intake & Briefing
2. Curator — Proposal
3. Owner — Proposal Review
4. Curator — Implementation & Registration
5. Owner — Forward Pass Closure

---

## Known Unknowns

- Item 2a echo: `$A_SOCIETY_CURATOR_ROLE` Implementation Practices already contains a behavioral property consistency check for proposals. Curator should verify at implementation whether the existing text satisfies the echo requirement; if equivalent, no change needed — document the verification in the implementation notes.
