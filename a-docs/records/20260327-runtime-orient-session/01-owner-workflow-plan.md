---
type: owner-workflow-plan
date: "2026-03-27"
complexity:
  domain_spread: moderate
  shared_artifact_impact: moderate
  step_dependency: elevated
  reversibility: moderate
  scope_size: elevated
tier: 3
path:
  - "Owner - Intake & TA Briefing"
  - "Technical Architect - Phase 0 Architecture Design"
  - "Owner - Phase 0 Review & Approval"
  - "Runtime Developer - Implementation"
  - "Runtime Developer - Integration Validation"
  - "Technical Architect - Integration Review"
  - "Owner - Integration Gate"
  - "Curator - Registration"
  - "Owner - Forward Pass Closure"
known_unknowns:
  - "Whether the orient session model reuses a stripped-down FlowRun or requires a distinct OrientSession type — TA to decide in Phase 0"
  - "Where the a-society CLI entry point lives — inside runtime/src/ as an additional CLI command, or as a separate top-level binary — TA to decide in Phase 0"
  - "How project discovery handles edge cases: nested or partially-initialized projects, and whether the discovery path is configurable or fixed to workspace root"
  - "Install script approach — npm link, shell symlink to PATH, or global npm install — TA to evaluate and decide in Phase 0"
  - "Whether the orient session requires a persistent Session Store entry or is ephemeral (no record folder, no FlowRun state)"
---

**Subject:** runtime-orient-session — a-society CLI entry point with orient command
**Type:** Owner Workflow Plan
**Date:** 2026-03-27

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches the runtime layer (new orient command on the existing CLI) and the distribution/install layer (new a-society CLI binary and install script) | moderate |
| **2. Shared artifact impact** | Modifies `runtime/src/cli.ts` (shared entry point), updates `runtime/INVOCATION.md`, and adds entries to `$A_SOCIETY_PUBLIC_INDEX` | moderate |
| **3. Step dependency** | Phase 0 TA architecture design gates all implementation — orient session model, CLI entry point placement, install script approach, and project discovery are all design decisions that implementation depends on | elevated |
| **4. Reversibility** | Changes are primarily additive (new command, new binary, new script); reversing requires removing those additions and undoing index registration | moderate |
| **5. Scope size** | Multiple runtime source files, new CLI entry point, install script, INVOCATION.md update, public index registration; four roles involved | elevated |

**Verdict:** Tier 3 — elevated step dependency (Phase 0 gate) and elevated scope size, across the Runtime Development workflow's full pipeline.

---

## Routing Decision

Routes through the Runtime Development workflow. The Runtime Dev workflow mandates a Phase 0 TA architecture design gate before any implementation begins — this is non-negotiable for any new runtime capability. The step dependency axis confirms this: the orient session model, install approach, and CLI placement are all design decisions that the Developer cannot make mid-implementation without a prior approved design.

The full pipeline applies: TA design → Owner gate → Developer implementation → Developer integration validation → TA integration review → Owner integration gate → Curator registration → Owner forward pass closure.

---

## Path Definition

1. Owner — Intake & TA Briefing (this artifact + 02-owner-to-ta-brief.md)
2. Technical Architect — Phase 0 Architecture Design (produces architecture document for the orient command and a-society CLI)
3. Owner — Phase 0 Review & Approval (reviews TA design against vision and existing runtime architecture)
4. Runtime Developer — Implementation (implements orient command, a-society CLI binary, and install script)
5. Runtime Developer — Integration Validation (end-to-end test of the full user flow)
6. Technical Architect — Integration Review (validates implementation against approved Phase 0 design)
7. Owner — Integration Gate (final approval before registration)
8. Curator — Registration (registers new runtime paths in public index, updates INVOCATION.md)
9. Owner — Forward Pass Closure (log update, backward pass initiation)

---

## Known Unknowns

1. Whether the orient session model reuses a stripped-down FlowRun or requires a distinct OrientSession type — TA to decide in Phase 0.
2. Where the a-society CLI entry point lives — inside runtime/src/ as an additional CLI command, or as a separate top-level binary — TA to decide in Phase 0.
3. How project discovery handles edge cases: nested or partially-initialized projects, and whether the discovery path is configurable or fixed to workspace root.
4. Install script approach — npm link, shell symlink to PATH, or global npm install — TA to evaluate and decide in Phase 0.
5. Whether the orient session requires a persistent Session Store entry or is ephemeral (no record folder, no FlowRun state).

---

*Note: Component 7 (Plan Artifact Validator) is not documented in `$A_SOCIETY_TOOLING_INVOCATION` — this is a known open gap in Next Priorities. YAML frontmatter validated manually before proceeding. All required fields present and non-null.*
