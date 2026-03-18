---
type: owner-workflow-plan
date: "2026-03-18"
complexity:
  domain_spread: elevated
  shared_artifact_impact: elevated
  step_dependency: moderate
  reversibility: low
  scope_size: high
tier: 2
path:
  - Owner
  - Curator
  - Owner
  - Curator
  - Owner
  - Curator
known_unknowns:
  - "Priority 2 (INSTRUCTION_RECORDS Phase 0 alignment check) may find no gaps; if so, the Curator notes it and no LIB change is produced for that item."
  - "Whether any LIB changes trigger a framework update report is for the Curator to determine post-implementation per $A_SOCIETY_UPDATES_PROTOCOL."
---

**Subject:** Process gap bundle — Next Priorities 1–9
**Type:** Owner Workflow Plan
**Date:** 2026-03-18

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches role documents (Owner, Curator, TA, Developer), brief templates, records conventions, tooling governance, and improvement protocol — spread across five framework subsystems | elevated |
| **2. Shared artifact impact** | `$A_SOCIETY_COMM_TEMPLATE_BRIEF`, `$GENERAL_OWNER_ROLE`, `$GENERAL_CURATOR_ROLE`, `$INSTRUCTION_ROLES`, and `$A_SOCIETY_TOOLING_ADDENDUM` are all high-traffic shared artifacts affected | elevated |
| **3. Step dependency** | The four sections (brief/approval, handoff, records, tooling) are largely independent; Priorities 1 and 7 both touch the brief template and need internal coordination, but no section's decisions gate another | moderate |
| **4. Reversibility** | All documentation changes; no code; easily undone | low |
| **5. Scope size** | 9 active items, ~13–15 distinct files across `a-docs/`, `general/`, and `agents/` | high |

**Verdict:** Tier 2 — high scope size and elevated domain spread require the full Owner→Curator→Owner path; low reversibility and moderate step dependency keep it out of Tier 3.

---

## Routing Decision

High scope size drives the tier. Each section is a gap-fill with clearly scoped files and no direction decisions, making this Curator-executable with standard Owner review. The four sections are bundled into a single flow to avoid sequential file conflicts (several items touch the same files) and to clear the gate for Priority 10.

---

## Path Definition

1. **Owner** — produce Phase 0 plan (this document) and Phase 1 brief
2. **Curator** — verify Priority 2 scope, draft combined proposal covering all four sections
3. **Owner** — Phase 2 review and decision
4. **Curator** — Phase 3 implementation + Phase 4 registration (including Priority 3 MAINT inline)
5. **Owner** — Phase 5 findings
6. **Curator** — Phase 5 synthesis

---

## Known Unknowns

- Priority 2 (`$INSTRUCTION_RECORDS` Phase 0 alignment check) may find no gaps; if so, the Curator notes it and no LIB change is produced for that item.
- Whether any LIB changes trigger a framework update report is for the Curator to determine post-implementation per `$A_SOCIETY_UPDATES_PROTOCOL`.
