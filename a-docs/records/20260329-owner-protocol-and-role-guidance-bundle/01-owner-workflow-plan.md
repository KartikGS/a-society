---
type: owner-workflow-plan
date: "2026-03-29"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: low
  reversibility: low
  scope_size: moderate
tier: 2
path:
  - Owner - Intake & Briefing
  - Curator - Proposal
  - Owner - Review & Decision
  - Curator - Implementation & Registration
  - Owner - Forward Pass Closure
known_unknowns:
  - "Whether the intake validity sweep obligation belongs in $INSTRUCTION_LOG alongside the Owner role files, or only in the Owner role files — the Curator should assess placement at proposal stage"
  - "Exact parity status of Group C items in $A_SOCIETY_OWNER_ROLE and $A_SOCIETY_CURATOR_ROLE — some may already be present from prior synthesis work; Curator should read current state before proposing to avoid duplication"
---

**Subject:** Owner protocol and role guidance bundle (11 items — Groups A, B, C)
**Type:** Owner Workflow Plan
**Date:** 2026-03-29

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single domain — framework documentation only (`general/` and `a-docs/`); no tooling or runtime changes | low |
| **2. Shared artifact impact** | `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` are distributable library artifacts affecting all adopters; changes are additive/insertive | moderate |
| **3. Step dependency** | Items within the flow are largely independent; Curator can implement all in one pass without sequencing constraints | low |
| **4. Reversibility** | All additive or insertive documentation changes; easily undone | low |
| **5. Scope size** | 5 files, 2 roles (Owner + Curator), 11 discrete changes | moderate |

**Verdict:** Tier 2 — Moderate shared-artifact impact and scope size warrant Curator proposal and Owner review, but no architectural decisions or complex unknowns require escalation to Tier 3.

---

## Routing Decision

Tier 2. Two axes at moderate (shared artifact impact, scope size); three at low. No ADR-level decisions. The changes are well-specified enough for a fully-specified brief with documented open questions deferred to Curator proposal stage. Standard Framework Dev path applies.

---

## Path Definition

1. Owner — Intake & Briefing: scope alignment, brief production
2. Curator — Proposal: draft proposed content for all 11 items across 5 files; include framework update report draft with TBD classification fields
3. Owner — Review & Decision: approve, revise, or reject the proposal
4. Curator — Implementation & Registration: implement approved changes, register any newly created files, produce update report
5. Owner — Forward Pass Closure: verify all approved tasks executed, update log, initiate backward pass

---

## Known Unknowns

- Whether the intake validity sweep obligation belongs in `$INSTRUCTION_LOG` alongside the Owner role files, or only in the Owner role files — the Curator should assess placement at proposal stage.
- Exact parity status of Group C items in `$A_SOCIETY_OWNER_ROLE` and `$A_SOCIETY_CURATOR_ROLE` — some may already be present from prior synthesis work; Curator should read current state before proposing to avoid duplication.
