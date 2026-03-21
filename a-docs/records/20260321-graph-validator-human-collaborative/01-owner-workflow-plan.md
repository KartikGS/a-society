---
type: owner-workflow-plan
date: "2026-03-21"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: elevated
  reversibility: low
  scope_size: moderate
tier: 2
path:
  - Owner - Intake & TA Brief
  - TA - Schema Advisory
  - Owner - Advisory Review
  - Developer - Component 3 Schema Update
  - TA - Implementation Review
  - Owner - Implementation Approval
  - Curator - Registration + Coupling Map Update
  - Owner - Forward Pass Closure
known_unknowns:
  - "TA determines exact field definition for human-collaborative in the Component 3 schema (type, allowed values, required vs. optional)."
  - "TA determines whether Component 4 or any other component requires a companion change to handle human-collaborative in traversal logic."
---

**Subject:** Graph validator: allow human-collaborative as optional node field — Component 3 schema update
**Type:** Owner Workflow Plan
**Date:** 2026-03-21

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single domain: tooling schema (Component 3) plus registration documentation (coupling map, invocation). | low |
| **2. Shared artifact impact** | Component 3 is a published invocable tool — schema change affects any agent invoking the graph validator. | moderate |
| **3. Step dependency** | TA advisory → Owner approves → Developer implements → TA reviews → Owner approves → Curator registers. Long sequential chain; each step gates the next. | elevated |
| **4. Reversibility** | TypeScript schema change, easily reverted; coupling map and invocation doc update equally reversible. | low |
| **5. Scope size** | 2–3 files (Component 3 implementation, coupling map, invocation doc); 4 roles (Owner, TA, Developer, Curator). | moderate |

**Verdict:** Tier 2 — scope is narrow (one schema field addition) but elevated step dependency requires a multi-step sequential pipeline. Tier 3 overhead would be disproportionate to the change size.

---

## Routing Decision

Tier 2 via the Tooling Development workflow. The Next Priorities log explicitly requires Technical Architect assessment first before Developer implements. The TA defines the exact schema change; Owner approves; Developer implements; TA confirms; Owner approves; Curator registers. The Tooling Development workflow's post-Phase-6 component update pattern governs this flow.

---

## Path Definition

1. **Owner** — Intake: produce workflow plan and TA brief.
2. **TA** — Schema advisory: assess the `human-collaborative` field definition in `$INSTRUCTION_WORKFLOW`, propose the exact schema addition to Component 3, and identify any companion implications for other components (particularly Component 4).
3. **Owner** — Review TA advisory; issue approval or revision request.
4. **Developer** — Implement the approved schema change in Component 3; run tests.
5. **TA** — Review implementation against the approved advisory; confirm no deviations.
6. **Owner** — Approve implementation.
7. **Curator** — Update `$A_SOCIETY_TOOLING_INVOCATION` if the invocation contract changes; update `$A_SOCIETY_TOOLING_COUPLING_MAP`; assess update report obligation per `$A_SOCIETY_UPDATES_PROTOCOL`.
8. **Owner** — Forward Pass Closure.

---

## Known Unknowns

- TA determines the exact field definition for `human-collaborative` in the Component 3 schema: type, allowed values, required vs. optional.
- TA determines whether Component 4 or any other component requires a companion change to handle `human-collaborative` in traversal logic or output.
