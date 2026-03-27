---
type: owner-workflow-plan
date: "2026-03-27"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: moderate
  reversibility: low
  scope_size: moderate
tier: 2
path:
  - Owner — Intake & briefing
  - Curator — Proposal
  - Owner — Review
  - Curator — Implementation & registration
  - Owner — Forward pass closure
known_unknowns:
  - "Runtime Development workflow: depth of phase specification before TA architecture design is complete — Curator to propose based on guidance in brief; Owner adjudicates at review"
---

**Subject:** Runtime development structural setup — Runtime Developer role and Runtime Development workflow
**Type:** Owner Workflow Plan
**Date:** 2026-03-27

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single domain — A-Society a-docs additions only (role doc + workflow doc) | low |
| **2. Shared artifact impact** | `$A_SOCIETY_INDEX`, `$A_SOCIETY_WORKFLOW`, and `$A_SOCIETY_AGENT_DOCS_GUIDE` all require new entries | moderate |
| **3. Step dependency** | Workflow document references the role; both need Owner review before any file is created | moderate |
| **4. Reversibility** | New files only; no existing documents substantively modified | low |
| **5. Scope size** | 2 new files + index rows + a-docs-guide entries + workflow directory entry | moderate |

**Verdict:** Tier 2 — ADR tag drives this above Tier 1. Both outputs carry design decisions (new role authority boundaries, new workflow structure) that require Owner review before files are created.

---

## Routing Decision

Tier 2. The role document establishes authority and scope for a new implementation role that does not exist in the current structure. The workflow document establishes the routing structure for a new class of work (runtime development). Both carry directional decisions requiring Owner review. Scope and reversibility are low, but ADR classification is non-negotiable.

Context: this flow was triggered by the Structural Gap Protocol after the Runtime orchestrator MVP item (`[L][ADR]`) failed structural routability — no role has authority to implement `runtime/`, and no workflow covers runtime development. This setup flow creates the structural container. The MVP flow re-enters intake as a new flow once this setup flow closes.

---

## Path Definition

1. Owner — Intake & briefing
2. Curator — Proposal (draft Runtime Developer role doc + Runtime Development workflow doc)
3. Owner — Review
4. Curator — Implementation & registration
5. Owner — Forward pass closure

---

## Known Unknowns

- Runtime Development workflow phase depth: how granular to specify implementation phases before the TA architecture design (which happens in the MVP flow's Phase 0) is complete. The brief provides guidance; Curator proposes; Owner adjudicates at review.
