---
type: owner-workflow-plan
date: "2026-04-07"
complexity:
  domain_spread: high
  shared_artifact_impact: high
  step_dependency: elevated
  reversibility: elevated
  scope_size: high
tier: 3
path:
  - Owner — Intake & Briefing
  - Curator — Proposal
  - Owner — Review
  - Curator — Implementation & Registration
  - Owner — Forward Pass Closure
known_unknowns:
  - "Placement of extracted owner.md content (Brief-Writing Quality, Constraint-Writing Quality, TA Advisory Review, Forward Pass Closure Discipline, Review Artifact Quality) — Curator proposes structure at Phase 1"
  - "Whether any extracted owner.md content qualifies for general/ now or defers for later generalization — Curator evaluates and flags"
  - "Whether general/a-docs-design.md is structurally identical to the A-Society instance or needs a different framing as a project-agnostic template"
---

**Subject:** a-docs Design Principles — JIT context model, agents.md cleanup, owner.md restructure, meta-analysis scope expansion
**Type:** Owner Workflow Plan
**Date:** 2026-04-07

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches framework design (new principle documents), documentation layer (agents.md, owner.md), improvement layer (meta-analysis ×2), general library (new instruction + template), and index registration in both indexes | high |
| **2. Shared artifact impact** | `agents.md` is universal required reading for all agents; `general/improvement/meta-analysis.md` is distributable to all adopting projects; both indexes are shared singletons. Modifications to all four of these in one flow. | high |
| **3. Step dependency** | The a-docs-design principles must be finalized before the cleanup and restructure can be specified precisely. Meta-analysis additions depend on the principles being approved. | elevated |
| **4. Reversibility** | Removing sections from agents.md and owner.md is moderately reversible (content can be restored), but a direction decision is embedded — the JIT context model changes how future a-docs is authored across all adopting projects. | elevated |
| **5. Scope size** | 3 new files, 5 existing files modified, 2 indexes updated, a-docs-guide updated. Owner + Curator. Multi-phase pipeline. | high |

**Verdict:** Tier 3 — Four axes at elevated or high; direction decision embedded; shared artifact impact across universal required readings and distributable templates requires full proposal-review-implementation pipeline.

---

## Routing Decision

Tier 3, Framework Development workflow. This flow establishes a new architectural principle (JIT context disclosure) for how a-docs is authored and maintained across A-Society and all adopting projects. The principle is then applied immediately to `agents.md` and `owner.md`, and embedded as obligations in the meta-analysis phase. Because this touches universal required readings, the general library, and the improvement framework simultaneously, the full Owner-proposal-review-implementation pipeline is required. The `[LIB][ADR]` scope confirms: Owner approval before any general/ content is created.

**Intake Validity Sweep:** One Next Priorities item overlaps with this flow's scope — "Repeated-header matching guidance in `$GENERAL_IMPROVEMENT_META_ANALYSIS`" targets the same file as our meta-analysis additions. Compatible authority, same workflow path. Absorbed into this flow; removed from Next Priorities at Forward Pass Closure.

---

## Path Definition

1. Owner — Intake & Briefing (Phase 0): produce this plan, `workflow.md`, and the Owner-to-Curator brief
2. Curator — Proposal (Phase 1): draft all new files, propose cleanup and restructure, include update report draft
3. Owner — Review (Phase 2): evaluate against five review tests; issue decision
4. Curator — Implementation & Registration (Phases 3–4): implement approved content, publish update report, register in both indexes, update a-docs-guide
5. Owner — Forward Pass Closure (Phase 5): verify all tasks executed, update log, absorb the repeated-header Next Priorities item

---

## Known Unknowns

1. **Placement of extracted owner.md content** — Brief-Writing Quality, Constraint-Writing Quality, TA Advisory Review, Forward Pass Closure Discipline, and Review Artifact Quality are being removed from `owner.md` and replaced with pointers. Where do the extracted documents live? (`a-docs/roles/` as owner-phase documents? workflow-organized subfolders?) Curator proposes at Phase 1; Owner decides at Phase 2.

2. **General template framing** — Is `general/a-docs-design.md` structurally identical to the A-Society instance, or does a project-agnostic template need different framing? Curator evaluates during proposal.

3. **Extraction scope of "Review Artifact Quality"** — This section governs Owner review behavior. It may belong in a review-phase document or may be owner-universal enough to stay. Curator flags recommendation in proposal.
