---
type: owner-workflow-plan
date: "2026-03-28"
complexity:
  domain_spread: elevated
  shared_artifact_impact: elevated
  step_dependency: low
  reversibility: low
  scope_size: elevated
tier: 2
path:
  - "Owner - Intake & Briefing"
  - "Curator - Proposal"
  - "Owner - Review"
  - "Curator - Implementation & Registration"
  - "Owner - Forward Pass Closure"
known_unknowns:
  - "Item 11 target form: whether to create a new general/roles/technical-architect.md or add advisory-producing-role standards to an existing general/ document; and whether standard (4) — typed extraction errors for model-output types — passes the portability constraint for general/"
  - "Item 13 placement: whether the completion report template and integration test record format belong as new sections in $INSTRUCTION_DEVELOPMENT or as entries pointing to new sub-files in the development folder"
---

**Subject:** General documentation bundle — 6 log items closed
**Type:** Owner Workflow Plan
**Date:** 2026-03-28

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches six distinct `general/` areas: improvement protocol, Owner role template, Curator role template, records instruction, machine-readable handoff instruction, advisory standards (new artifact), and development instruction | elevated |
| **2. Shared artifact impact** | Six `general/` documents modified; `$GENERAL_OWNER_ROLE` and `$GENERAL_CURATOR_ROLE` are base templates that adopting projects have instantiated, making changes there high-signal for update report assessment | elevated |
| **3. Step dependency** | The six log items are fully independent — no item's implementation depends on another being completed first | low |
| **4. Reversibility** | Documentation-only changes; all reversible via git with no structural reorganization | low |
| **5. Scope size** | Six log items, six or more target files, potentially one new file (item 11 advisory standards) | elevated |

**Verdict:** Tier 2 — three elevated axes, but low step dependency and low reversibility concern. The standard Owner → Curator Framework Dev pipeline handles this without the full Tier 3 overhead.

---

## Routing Decision

Tier 2. All six items modify `general/` content (Approval Invariant applies to each). Items are sufficiently well-specified for a single brief + proposal cycle. No direction decisions — changes are additive or clarifying within known scope. The Curator proposes, Owner reviews, Curator implements.

---

## Path Definition

1. Owner — Intake & Briefing: creates record folder, produces this plan and `workflow.md`, writes `02-owner-to-curator-brief.md`
2. Curator — Proposal: drafts all six changes plus update report draft (classification TBD), resolves items 11 and 13 open questions
3. Owner — Review: evaluates proposal against five review tests and coupling check
4. Curator — Implementation & Registration: implements approved content, publishes update report, registers new/modified files
5. Owner — Forward Pass Closure: verifies all tasks executed, updates log, initiates backward pass

---

## Known Unknowns

1. **Item 11 target form:** Should the generalizable advisory-producing-role standards (§8 completeness, extension-before-bypass code, extension-before-bypass dependencies, typed extraction errors) go into a new `general/roles/technical-architect.md`, or as additions to an existing `general/` document? Also: does standard (4) — typed extraction errors for model-output types — pass the portability constraint for `general/`, or does it need to be excluded or reformulated at a higher abstraction level?

2. **Item 13 placement:** Where in `$INSTRUCTION_DEVELOPMENT` do the two improvements (completion report template with "Incomplete or stubbed implementations" check; integration test record format requiring reproducible evidence) belong — as new sections in the existing file, or as entries in the "What Belongs Here" table pointing to new sub-files within the development folder?
