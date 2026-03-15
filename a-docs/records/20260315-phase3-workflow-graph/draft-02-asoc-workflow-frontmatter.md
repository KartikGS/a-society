# Draft: YAML Frontmatter for A-Society Workflow

This is the YAML frontmatter to be embedded at the top of `$A_SOCIETY_WORKFLOW` (`a-society/a-docs/workflow/main.md`), before the `# A-Society: Workflow` heading.

---

## Frontmatter Content

```yaml
---
workflow:
  name: A-Society Framework Development
  phases:
    - id: phase-1
      name: Proposal
    - id: phase-2
      name: Review
    - id: phase-3
      name: Implementation
    - id: phase-4
      name: Registration
    - id: phase-5
      name: Backward Pass
  nodes:
    - id: owner-phase-1-briefing
      role: Owner
      phase: phase-1
      first_occurrence_position: 1
      is_synthesis_role: false
    - id: curator-phase-1-proposal
      role: Curator
      phase: phase-1
      first_occurrence_position: 2
      is_synthesis_role: false
    - id: owner-phase-2-review
      role: Owner
      phase: phase-2
      first_occurrence_position: 1
      is_synthesis_role: false
    - id: curator-phase-3-implementation
      role: Curator
      phase: phase-3
      first_occurrence_position: 2
      is_synthesis_role: false
    - id: curator-phase-4-registration
      role: Curator
      phase: phase-4
      first_occurrence_position: 2
      is_synthesis_role: false
    - id: curator-phase-5-findings
      role: Curator
      phase: phase-5
      first_occurrence_position: 2
      is_synthesis_role: false
    - id: owner-phase-5-findings
      role: Owner
      phase: phase-5
      first_occurrence_position: 1
      is_synthesis_role: false
    - id: curator-phase-5-synthesis
      role: Curator
      phase: phase-5
      first_occurrence_position: 2
      is_synthesis_role: true
  edges:
    - from: owner-phase-1-briefing
      to: curator-phase-1-proposal
      artifact: owner-to-curator-brief
    - from: curator-phase-1-proposal
      to: owner-phase-2-review
      artifact: curator-to-owner
    - from: owner-phase-2-review
      to: curator-phase-3-implementation
      artifact: owner-to-curator
    - from: owner-phase-2-review
      to: curator-phase-1-proposal
      artifact: owner-to-curator
    - from: curator-phase-3-implementation
      to: curator-phase-4-registration
    - from: curator-phase-4-registration
      to: curator-phase-5-findings
    - from: curator-phase-5-findings
      to: owner-phase-5-findings
    - from: owner-phase-5-findings
      to: curator-phase-5-synthesis
---
```

---

## Derivation Notes

**Phase mapping:** Phases 1–5 correspond directly to the five phases in `workflow/main.md`.

**Node ordering:**
- Owner fires first in Phase 1 (writes the briefing, which is the trigger/entry point before handing to Curator)
- Curator fires second in Phase 1 (drafts the proposal)
- This gives Owner `first_occurrence_position: 1` and Curator `first_occurrence_position: 2`

**Backward pass verification (per `$A_SOCIETY_IMPROVEMENT`):**
- Roles sorted by first_occurrence_position ascending: Owner(1), Curator(2)
- Reversed: Curator(2), Owner(1)
- Synthesis role (Curator) moves to end regardless
- Backward pass order: Curator findings → Owner findings → Curator synthesis
- This matches the explicit protocol in `$A_SOCIETY_IMPROVEMENT`: "1. Curator produces findings first. 2. Owner produces findings second. 3. Curator synthesizes last." ✓

**Branching edge:** Two edges from `owner-phase-2-review` — one to `curator-phase-3-implementation` (Approved) and one back to `curator-phase-1-proposal` (Revise). The graph captures the existence of both branches; the prose captures the decision logic.

**Same-phase, same-role nodes in Phase 5:** Three Curator nodes fire in Phase 5 (findings, then synthesis). They share `first_occurrence_position: 2`. The synthesis node is distinguished by `is_synthesis_role: true`.
