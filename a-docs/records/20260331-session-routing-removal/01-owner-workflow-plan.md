---
type: owner-workflow-plan
date: "2026-03-31"
complexity:
  domain_spread: elevated
  shared_artifact_impact: elevated
  step_dependency: moderate
  reversibility: moderate
  scope_size: elevated
tier: 2
path:
  - Owner - Intake & Briefing (parallel briefs to Curator and Runtime Developer)
  - Curator - Proposal & Draft [Track A]
  - Runtime Developer - Implementation [Track B, parallel with Curator]
  - Owner - Review (Curator proposal) [Track A]
  - Curator - Implementation & Registration [Track A]
  - Owner - Forward Pass Closure (both tracks complete)
known_unknowns:
  - "general/instructions/workflow/main.md 'Sessions and the Human Orchestrator' section: after removing session routing content, what (if anything) of that section remains meaningful? The Curator assesses whether the 'bidirectional mid-phase exchanges' paragraph and any other sub-content should be retained, revised, or the section collapsed entirely."
  - "Handoff output format blocks in general/instructions/roles/main.md currently include copyable session-start prompt templates. After removing session routing, the Curator determines the revised format and whether the format blocks collapse or retain structure."
  - "Framework update report obligation: this flow removes features from general/ that adopters currently document in their a-docs. The Curator assesses impact classification by consulting $A_SOCIETY_UPDATES_PROTOCOL and includes the draft in the proposal."
---

**Subject:** session-routing-removal
**Type:** Owner Workflow Plan
**Date:** 2026-03-31

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches workflow docs, role docs, handoff communication docs, general instructions, and runtime source code | elevated |
| **2. Shared artifact impact** | 15 documentation files + runtime/src/handoff.ts; includes $GENERAL_OWNER_ROLE, $GENERAL_CURATOR_ROLE, $INSTRUCTION_WORKFLOW (main.md), $INSTRUCTION_ROLES, handoff protocol and machine-readable handoff instruction | elevated |
| **3. Step dependency** | Changes across tracks are independent; the schema decision (Owner-made, human-directed) governs both tracks without inter-track sequencing | moderate |
| **4. Reversibility** | Deletions across 15 docs + ~15 lines of runtime code — reversible but spread | moderate |
| **5. Scope size** | 15 documentation files + 1 runtime source file, two parallel implementation tracks | elevated |

**Verdict:** Tier 2 — Three elevated axes; direction fully settled by the human; Curator authority required for general/ implementation; Runtime Developer track added to keep documentation and code changes in a single coherent flow.

---

## Routing Decision

Tier 2, multi-domain flow. Two parallel tracks:
- **Track A (Curator):** documentation changes across a-docs/ and general/ — follows standard Framework Dev proposal → review → implementation path.
- **Track B (Runtime Developer):** remove session_action and prompt from HandoffBlock type and HandoffInterpreter validation in runtime/src/handoff.ts — Owner-briefed directly, no TA advisory (change is fully specified by the schema decision with no design ambiguity).

Both tracks converge at Owner forward pass closure. No inter-track dependency.

**Dependency note (not a blocker for this flow):** Next Priorities item "Machine-readable handoff validator (Component 8)" targets building a validator for the handoff schema. Component 8's spec depends on the schema this flow finalizes. Component 8 should not begin until this flow closes.

**Parallel convergence sequence slots:** `06a-curator-to-owner.md` (Curator implementation complete), `06b-runtime-developer-to-owner.md` (Runtime Developer implementation complete).

---

## Path Definition

1. Owner — Intake & Briefing: produce plan, brief Curator (Track A) and Runtime Developer (Track B) in parallel
2. Curator — Proposal & Draft [Track A]: draft all documentation changes, include update report assessment
3. Runtime Developer — Implementation [Track B, parallel with Curator]: remove session_action and prompt from handoff.ts
4. Owner — Review: review Curator proposal (Track A); Track B does not require Owner review before implementation
5. Curator — Implementation & Registration [Track A]: implement approved changes, publish update report if warranted, register
6. Owner — Forward Pass Closure: confirm both tracks complete, update log, initiate backward pass

---

## Known Unknowns

1. `general/instructions/workflow/main.md` "Sessions and the Human Orchestrator" section: after the targeted removals, assess whether the section heading still accurately describes the remaining content and propose a revised heading or reorganization if warranted.
2. Handoff output format blocks in `general/instructions/roles/main.md` currently include copyable session-start prompt templates. After removing session routing, the Curator determines the revised format and whether the format blocks collapse or retain structure.
3. Framework update report obligation: this flow removes features from `general/` that adopters currently document in their a-docs. The Curator assesses impact classification by consulting `$A_SOCIETY_UPDATES_PROTOCOL` and includes the draft in the proposal.
