---
type: owner-workflow-plan
date: "2026-03-26"
complexity:
  domain_spread: low
  shared_artifact_impact: elevated
  step_dependency: moderate
  reversibility: moderate
  scope_size: low
tier: 2
path:
  - Owner - Intake & Briefing
  - Curator - Proposal
  - Owner - Review
  - Curator - Implementation & Registration
  - Owner - Forward Pass Closure
known_unknowns:
  - "Whether structure.md needs a new top-level entry for runtime/ or whether the runtime framing is conceptual at this stage (Curator to assess during proposal)"
  - "Whether any existing general/ instructions reference A-Society's scope in ways that would become stale after the vision update (Curator to scan during proposal)"
---

**Subject:** runtime-layer-vision — Vision and architecture update to acknowledge the runtime layer
**Type:** Owner Workflow Plan
**Date:** 2026-03-26

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single domain — project-information documents | low |
| **2. Shared artifact impact** | Vision and architecture are foundational reference docs loaded by every role at session start | elevated |
| **3. Step dependency** | Architecture update depends on vision framing; both written by same Curator session | moderate |
| **4. Reversibility** | Document prose is easily reverted; directional framing, once absorbed into role context, is harder to walk back | moderate |
| **5. Scope size** | 2–3 files in `a-docs/project-information/` | low |

**Verdict:** Tier 2 — Shared artifact impact is elevated (these documents anchor every agent's orientation), warranting Curator drafting and Owner review. Direction is already agreed with the human; scope is small.

---

## Routing Decision

Tier 2. The elevated shared artifact impact means a second perspective (Curator reviewing placement and prose) is valuable. The Owner and human have already aligned on direction during the freeform discussion in this session, so the brief will be fully specified with no open design questions. The Curator's job is accurate prose execution and placement verification — not direction-finding.

---

## Path Definition

1. **Owner** — Intake, workflow plan, and brief (this session)
2. **Curator** — Proposal: draft the vision and architecture updates, verify no stale scope references in other docs
3. **Owner** — Review the proposed updates against the five tests
4. **Curator** — Implementation and registration
5. **Owner** — Forward pass closure, log update, backward pass initiation

---

## Known Unknowns

- Whether `structure.md` needs a new top-level entry for a `runtime/` folder or whether the runtime framing is conceptual at this stage (Curator to assess during proposal)
- Whether any existing `general/` instructions reference A-Society's scope in ways that become stale after the vision update (Curator to scan during proposal — if found, flag for a separate flow rather than expanding this one)
