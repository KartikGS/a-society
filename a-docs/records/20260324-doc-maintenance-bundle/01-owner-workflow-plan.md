---
type: owner-workflow-plan
date: "2026-03-24"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: low
  reversibility: low
  scope_size: moderate
tier: 2
path:
  - "Owner — Intake & Briefing"
  - "Curator — Implementation, Registration & Update Report Assessment"
  - "Owner — Forward Pass Closure"
known_unknowns:
  - "Whether post-implementation update report assessment triggers a framework update report (Curator determines via $A_SOCIETY_UPDATES_PROTOCOL); version bump follows if a report is published"
---

**Subject:** doc-maintenance-bundle — Priorities 2–5 bundled
**Type:** Owner Workflow Plan
**Date:** 2026-03-24

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | All items touch framework documentation — role docs, improvement docs, workflow docs, and log. Single domain. | low |
| **2. Shared artifact impact** | Four `general/` files touched (`$GENERAL_CURATOR_ROLE`, `$GENERAL_OWNER_ROLE`, `$INSTRUCTION_LOG`, `$GENERAL_IMPROVEMENT`) — shared library artifacts. | moderate |
| **3. Step dependency** | All four priorities are independent; none depends on the output of another. Sequence is clear at intake. | low |
| **4. Reversibility** | Documentation changes are easily reversed. | low |
| **5. Scope size** | ~9 files, two roles (Owner, Curator). No new structural elements or folders. | moderate |

**Verdict:** Tier 2 — Shared-artifact impact (moderate) drives Tier 2; the LIB items require Owner authorization before the Curator writes to `general/`. All other axes are low, supporting a lightweight pipeline with no Proposal phase.

---

## Routing Decision

Tier 2 — Lightweight Pipeline. All four priorities are fully specified with no open questions; the brief constitutes authorization per the topology check (no Proposal phase declared in this plan). The Curator implements all items in a single session and assesses the update report obligation post-implementation.

---

## Path Definition

1. Owner — Intake & Briefing (this session)
2. Curator — Implementation, Registration & Update Report Assessment
3. Owner — Forward Pass Closure

**No Proposal phase.** Per the topology check, this brief constitutes authorization for all LIB and MAINT items. No proposal artifact is required before implementation begins.

---

## Known Unknowns

- Whether post-implementation update report assessment triggers a framework update report (Curator determines via `$A_SOCIETY_UPDATES_PROTOCOL`); version bump follows if a report is published.
