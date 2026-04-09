---
type: owner-workflow-plan
date: "2026-04-09"
complexity:
  domain_spread: high
  shared_artifact_impact: high
  step_dependency: high
  reversibility: high
  scope_size: high
tier: 3
path:
  - Owner - Intake & Plan
  - Curator - Proposal
  - Owner - Review
  - Curator - Implementation & Registration
  - Owner - Forward Pass Closure
known_unknowns:
  - "Whether the merged executable layer keeps the `runtime/` folder name or is renamed to a broader umbrella such as `executable/`."
  - "Whether one permanent executable-development workflow replaces both tooling/runtime workflows, or whether one existing workflow survives with a rewritten responsibility model and parallel tracks."
  - "Exact retirement/remap strategy for `$A_SOCIETY_TOOLING_*` variables and tooling-specific standing references across the public index, internal index, instructions, and standing docs."
  - "Exact Next Priorities remap: which tooling/runtime items become obsolete, which are renamed into executable-layer items, and which stay unchanged."
  - "Whether `a-docs/tooling/` is retired, renamed, or repurposed as the standing design/reference surface for the merged executable layer."
---

**Subject:** Executable layer unification — structural setup
**Type:** Owner Workflow Plan
**Date:** 2026-04-09

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches A-Society architecture, structure, role model, workflow topology, public/internal index contracts, update-report policy, and the shape of the future executable implementation flow. | high |
| **2. Shared artifact impact** | Alters load-bearing shared artifacts: `$A_SOCIETY_ARCHITECTURE`, `$A_SOCIETY_STRUCTURE`, role docs, workflow docs, index variables, public-facing operator/documentation surfaces, and likely the log's active Next Priorities set. | high |
| **3. Step dependency** | The code migration cannot begin cleanly until the merged-layer contract, developer split, workflow replacement, and variable-retirement strategy are defined and approved. | high |
| **4. Reversibility** | Poorly reversible once published because the change restructures the framework's executable-layer story, public variable surface, and update-report obligations for adopters. | high |
| **5. Scope size** | Multi-file, multi-role, multi-flow initiative. Even the structural setup phase alone spans many standing documents and drives at least one follow-on implementation flow. | high |

**Verdict:** Tier 3 — This is a framework direction and structural-setup initiative, not a localized maintenance change. It requires a full proposal/review/implementation path before the executable migration itself can begin.

---

## Routing Decision

Route this as a Tier 3 Framework Development flow for **structural setup first**.

Reasoning:
- The desired end-state introduces a new executable-layer mental model and a new developer responsibility split that the current standing role/workflow structure does not yet define.
- A direct implementation flow using today's Tooling Developer / Runtime Developer split would force execution through a model the human has already decided to retire.
- Therefore the first flow should establish the merged executable-layer contract: architecture, structure, role set, workflow set, standing documentation surfaces, index/variable strategy, update-report requirement, and log-priority remap rules.

This setup flow is expected to be followed by a separate executable migration flow once the new standing structure is approved and registered.

---

## Path Definition

1. **Owner** — intake, structural-readiness judgment, workflow plan, and downstream setup framing.
2. **Curator** — propose the merged executable-layer documentation model, role/workflow replacement, index-variable strategy, standing-doc retirement/remap, and update-report draft.
3. **Owner** — review the proposal, decide the canonical migration shape, and approve or revise.
4. **Curator** — implement the approved framework/documentation changes, register all standing-surface updates, publish the update report, and file completion.
5. **Owner** — close the forward pass, reconcile affected Next Priorities, and determine the follow-on executable implementation flow intake.

---

## Known Unknowns

- Final merged-layer naming decision: keep `runtime/` as the umbrella executable layer or rename the folder/surfaces.
- Final permanent workflow topology: single new executable-development workflow vs. rewriting one existing workflow as the canonical executable workflow.
- Final standing developer role set and naming: the human's preferred split is Orchestration Developer + Framework-Services Developer, but the exact role-file scope boundaries still need formal proposal text.
- Exact public/internal variable retirement/remap plan for tooling-specific operator and component references.
- Exact treatment of `a-docs/tooling/` as a standing folder after unification.
- Exact Next Priorities cleanup once the setup proposal names the surviving implementation surfaces precisely.
