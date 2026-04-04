---
type: owner-workflow-plan
date: "2026-04-03"
complexity:
  domain_spread: high
  shared_artifact_impact: high
  step_dependency: high
  reversibility: high
  scope_size: high
tier: 3
path:
  - Owner — Intake & TA briefing
  - Technical Architect — Advisory
  - Owner — TA Review
  - Tooling Developer — Component 4 implementation (parallel with Runtime Dev)
  - Runtime Developer — Improvement orchestration implementation (parallel with Tooling Dev)
  - Technical Architect — Integration review
  - Owner — Integration gate
  - Curator — Proposal
  - Owner — Curator approval
  - Curator — Implementation
  - Owner — Forward pass closure
known_unknowns:
  - "Exact schema for the new 'forward pass closed' handoff signal — TA to design"
  - "Component 4 output interface: what data structure best serves runtime context injection per role in graph-based mode — TA to spec"
  - "Whether general/ role templates (e.g., general/roles/owner.md) contain backward pass initiation language requiring minimal removal — Curator to verify at implementation"
  - "How new improvement orchestration state integrates with the existing FlowRun shape — TA to assess in relation to the open runtime persisted-state versioning item"
---

**Subject:** Programmatic Improvement System
**Type:** Owner Workflow Plan
**Date:** 2026-04-03
**Scope tags:** [L][LIB][ADR][RUNTIME]

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches framework docs (`general/improvement`, workflow docs, role docs), tooling (Component 4), and runtime (new improvement orchestration) — three distinct implementation layers | high |
| **2. Shared artifact impact** | `general/improvement` is used by all adopting projects; runtime changes affect every forward-pass-closing flow; role doc changes affect every agent session | high |
| **3. Step dependency** | TA advisory must precede Tooling Dev and Runtime Dev; Component 4 interface must align with runtime context-injection needs; Curator documentation depends on implementation completing | high |
| **4. Reversibility** | Splitting `general/improvement` is a breaking structural change for adopters; removing backward pass initiation from docs is a behavioral change to all role sessions; runtime improvement orchestration is load-bearing once deployed | high |
| **5. Scope size** | ~10+ files modified, 2 new files created (split improvement docs), 5 roles, 3 workflow layers | high |

**Verdict:** Tier 3 — high signal across all five axes. Multi-domain with parallel implementation tracks and ADR-level decisions on the forward-pass/backward-pass architectural boundary.

---

## Routing Decision

Multi-domain development pattern (`$A_SOCIETY_WORKFLOW_MULTI_DOMAIN`). The work spans three layers — framework docs, tooling, and runtime — that are independent after TA design and can run in parallel. A single flow with parallel tracks prevents fragmentation of one coherent design change.

The proposal is an architectural redesign of the improvement system:

- **After forward pass closure:** runtime presents the user with three options — graph-based improvement, parallel improvement, or no improvement.
- **Graph-based improvement:** backward pass agents receive the meta-analysis instruction file plus findings from their direct successors in the forward pass graph, subject to a role-appearance check (if a role appeared before the current agent in the forward pass, that role's findings are excluded even if it is a direct successor).
- **Parallel improvement:** all agents receive only the meta-analysis instruction file; all run simultaneously.
- **Synthesis (both cases):** fresh Curator session with the synthesis instruction file and all findings injected.
- **No improvement:** record closes with forward pass artifacts only.

The current combined improvement instruction document (`$GENERAL_IMPROVEMENT`) is split into two files: meta-analysis guidance and synthesis guidance. The runtime injects the appropriate file per phase.

Forward pass closure phases in workflow docs and role docs are updated with minimal removal: only explicit "initiate backward pass after forward pass closure" instructions are removed. No other backward pass knowledge is touched.

---

## Path Definition

1. **Owner** — Intake, workflow plan, TA brief
2. **Technical Architect** — Advisory: new handoff signal type for "forward pass closed"; Component 4 redesign to support context injection per role; runtime improvement orchestration design
3. **Owner** — TA review and approval; parallel track kickoff
4. **Tooling Developer** — Component 4 implementation per TA spec *(parallel with Runtime Dev)*
5. **Runtime Developer** — Improvement orchestration implementation per TA spec *(parallel with Tooling Dev)*
6. **Technical Architect** — Integration review of parallel track completion reports
7. **Owner** — Integration gate; Curator brief
8. **Curator** — Proposal: split `$GENERAL_IMPROVEMENT` into meta-analysis and synthesis files; minimal backward pass initiation removal from workflow docs and role docs; invocation/index updates; update report draft
9. **Owner** — Curator approval
10. **Curator** — Implementation
11. **Owner** — Forward pass closure (version increment, update report publication instruction, log update)

---

## Known Unknowns

1. Exact schema for the new "forward pass closed" handoff signal — TA to design.
2. Component 4 output interface: what data structure best serves the runtime's per-role context injection requirements in graph-based mode — TA to spec.
3. Whether `general/` role templates contain explicit backward pass initiation language requiring minimal removal — Curator to verify at implementation.
4. How new improvement orchestration state integrates with the existing `FlowRun` shape, in relation to the open runtime persisted-state versioning item — TA to assess.
