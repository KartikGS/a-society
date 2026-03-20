---
type: owner-workflow-plan
date: "2026-03-20"
complexity:
  domain_spread: elevated
  shared_artifact_impact: elevated
  step_dependency: high
  reversibility: elevated
  scope_size: elevated
tier: 3
path:
  - Owner - Intake & Briefing
  - TA - Advisory
  - Curator - Documentation Proposal
  - Owner - Review
  - Curator - Implementation & Registration
  - Developer - Component 4 Implementation
  - TA - Implementation Review
  - Owner - Gate
known_unknowns:
  - "Whether Component 4 modifications follow the Post-Phase-6 addendum path or a simplified TA-advisory + Developer path — TA should clarify in advisory output."
  - "Whether workflow.md in the record folder is created by the Owner at intake or by the first role that needs to record path additions — sequencing to be decided in the documentation proposal."
---

**Subject:** Backward Pass Orderer Redesign — Component 4 input model, enriched output format, and workflow.md records convention
**Type:** Owner Workflow Plan
**Date:** 2026-03-20

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches both the documentation layer (improvement protocol, records convention, general library) and the tooling layer (Component 4 implementation) — two distinct tracks with different roles | elevated |
| **2. Shared artifact impact** | `$A_SOCIETY_IMPROVEMENT`, `$GENERAL_IMPROVEMENT`, `$A_SOCIETY_RECORDS`, `$INSTRUCTION_RECORDS`, Component 4 interface, `$A_SOCIETY_TOOLING_INVOCATION` — all shared artifacts agents depend on | elevated |
| **3. Step dependency** | TA advisory must precede documentation spec; documentation spec must precede Developer implementation; each step's decisions gate the next | high |
| **4. Reversibility** | Component 4 interface change is breaking — input changes from workflow graph to record folder path; records convention change affects all future flows | elevated |
| **5. Scope size** | ~8 files across a-docs and general library, 4 roles, crosses documentation and tooling tracks | elevated |

**Verdict:** Tier 3 — multiple elevated axes and one high axis; requires TA advisory, Developer implementation, and documentation changes across both a-docs and general library.

---

## Routing Decision

Tier 3 driven by step dependency (high) and domain spread. The documentation and tooling tracks cannot run concurrently — TA advisory output shapes the documentation spec, and the documentation spec shapes the Developer's implementation target. This requires sequential gating rather than parallel execution.

---

## Path Definition

1. Owner — Intake & Briefing (this document + brief to TA)
2. TA — Advisory on Component 4 interface redesign
3. Curator — Documentation proposal (improvement protocol, records convention, general library)
4. Owner — Review
5. Curator — Implementation & Registration (documentation)
6. Developer — Component 4 implementation against approved spec
7. TA — Implementation review
8. Owner — Gate

---

## Known Unknowns

1. Whether Component 4 modifications follow the Post-Phase-6 addendum path or a simplified TA-advisory + Developer path — TA should clarify in advisory output.
2. Whether `workflow.md` in the record folder is created by the Owner at intake or by the first role that needs to record path additions — sequencing to be decided in the documentation proposal.
