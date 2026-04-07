---
type: owner-workflow-plan
date: "2026-04-07"
complexity:
  domain_spread: moderate
  shared_artifact_impact: moderate
  step_dependency: low
  reversibility: moderate
  scope_size: elevated
tier: 2
path:
  - Owner — Intake & Briefing
  - Curator — Proposal
  - Owner — Review & Approval
  - Curator — Implementation & Registration
  - Owner — Forward Pass Closure
known_unknowns:
  - "How to decompose the TA advisory standards into JIT documents — by phase type (design vs. integration review) or by topic"
  - "Whether Curator Standing Checks and Developer Escalation Triggers qualify as phase-specific (JIT) or universal role invariants (keep inline)"
---

**Subject:** role-jit-extraction — Apply adocs design principles JIT extraction to all remaining role documents
**Type:** Owner Workflow Plan
**Date:** 2026-04-07

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Single domain (a-docs/roles/); affects all five role files plus new JIT documents under role subfolders | moderate |
| **2. Shared artifact impact** | Role files are shared session-start context for all agents; index additions required for every new JIT file; required-readings.yaml change for Tooling Developer | moderate |
| **3. Step dependency** | Changes to each role are largely independent; no role's JIT extraction blocks another | low |
| **4. Reversibility** | Role doc changes are consequential but reversible; established pattern from prior Owner role restructuring | moderate |
| **5. Scope size** | Five role files modified; six or more new JIT documents created; index and agent-docs-guide updated; required-readings.yaml revised | elevated |

**Verdict:** Tier 2 — Scope is broad but the pattern is well-established from the Owner role restructuring in the previous flow. No novel structural decisions except the TA advisory standards decomposition structure. Multi-step but no significant step dependencies between tracks.

---

## Routing Decision

Tier 2. The Owner brief scopes all changes and directs the Curator on Owner-decided questions. The Curator proposes the TA advisory standards decomposition structure and evaluates whether Curator Standing Checks and Developer Escalation Triggers are universal invariants or phase-specific. Owner reviews and approves before implementation.

---

## Path Definition

1. Owner — Intake and briefing (this document)
2. Curator — Proposal (TA decomposition structure; Standing Checks and Escalation Triggers evaluation; full proposed content for all new JIT documents)
3. Owner — Review and approval (evaluate TA decomposition, Standing Checks verdict, Escalation Triggers verdict; approve full scope)
4. Curator — Implementation and registration (all role file edits; new JIT files created; index and agent-docs-guide updated; required-readings.yaml revised)
5. Owner — Forward pass closure

---

## Known Unknowns

- How to decompose the TA advisory standards into JIT documents: by phase type (design advisory standards vs. integration review standards) or by topic (output specification, pre-work verification, interface specification, multi-path standards, etc.). The Curator should read the full advisory standards section and propose the decomposition structure.
- Whether Curator "Standing Checks" are universal role invariants (apply to all Curator work, keep inline) or phase-specific (apply only when entering proposal or implementation phase, extract to JIT). The Curator has direct stake and should evaluate and propose.
- Whether Tooling Developer and Runtime Developer "Escalation Triggers" sections are universal role invariants (every session) or phase-specific (only when a deviation or scope question arises). Same evaluation.
