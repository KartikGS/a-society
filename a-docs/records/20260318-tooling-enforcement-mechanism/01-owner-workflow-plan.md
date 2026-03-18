---
type: owner-workflow-plan
date: "2026-03-18"
complexity:
  domain_spread: elevated
  shared_artifact_impact: elevated
  step_dependency: elevated
  reversibility: moderate
  scope_size: elevated
tier: 3
path: [Owner, Technical Architect, Owner, Tooling Developer, Curator, Owner]
known_unknowns:
  - "New Component 7 vs. extension of existing Component 3 (Workflow Graph Schema Validator) — different implications for the proposal spec and the architecture component count"
  - "Invocation model: which role invokes the validator, at which workflow step, and whether invocation is a hard gate or an available check"
  - "Phase placement within the existing tooling implementation workflow (addendum) — whether this adds a new phase or slots alongside an existing one"
  - "Coupling map entry: whether the plan artifact format belongs in the format dependency table and which instruction needs an invocation reference"
---

**Subject:** Plan artifact validator — scope and component design
**Type:** Owner Workflow Plan
**Date:** 2026-03-18

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches the TypeScript tooling layer (new component design and implementation), the plan artifact schema already defined in `$A_SOCIETY_COMM_TEMPLATE_PLAN`, the tooling proposal (binding spec requiring extension), the tooling addendum (phase workflow requiring update), the coupling map, and public index registration | elevated |
| **2. Shared artifact impact** | `$A_SOCIETY_TOOLING_PROPOSAL` is a binding spec and must be extended with a new component entry; `$A_SOCIETY_TOOLING_ADDENDUM` needs a new phase slot; `$A_SOCIETY_ARCHITECTURE` currently names six components and must be updated; coupling map will need a new format-dependency row and invocation-status row after implementation completes | elevated |
| **3. Step dependency** | TA must produce an approved component design before Developer can implement; the component design may surface open questions requiring Owner decisions before the design is final; invocation model depends on decisions about which role invokes and when — these are sequential, not parallelisable | elevated |
| **4. Reversibility** | The TypeScript implementation can be removed cleanly; spec updates (proposal, addendum, architecture) persist but carry low structural risk; no adopting-project-facing format changes are introduced | moderate |
| **5. Scope size** | TA design session + Owner review gate + Developer implementation session + Curator documentation updates (proposal extension, addendum update, architecture count, coupling map, index registration) + backward pass across all engaged roles | elevated |

**Verdict:** Tier 3 — Four elevated axes (domain spread, shared artifact impact, step dependency, scope size), three distinct role types engaged (Technical Architect, Tooling Developer, Curator), multi-session execution with Owner review gates at multiple points.

---

## Routing Decision

Tier 3. The step dependency axis is the deciding factor: the TA must produce a scoped component design before the Owner can approve, and the Developer cannot implement before both the TA design and Owner approval exist. This is a three-role sequential chain, not a single-session Owner action. The four elevated axes confirm that even without the step dependency, the scope and shared artifact impact would push this to Tier 2 minimum.

---

## Path Definition

1. **Owner** — creates record folder, writes this plan and the TA brief; opens TA session
2. **Technical Architect** — scopes the component: new vs. extension decision, invocation model, interface definition, phase placement in the addendum, coupling map assessment; submits design proposal to Owner
3. **Owner** — reviews TA design proposal against tooling architecture invariants; approves, revises, or rejects
4. **Tooling Developer** — implements the approved component in `tooling/`; escalates any spec deviations to TA before implementing workarounds
5. **Curator** — updates all documentation artifacts: tooling proposal (new component entry), tooling addendum (phase slot), architecture doc (component count), coupling map (new rows), public index registration; follows standard proposal flow for any `general/` changes
6. **Owner** — backward pass terminal; reviews Curator registration, confirms flow complete

---

## Known Unknowns

1. New Component 7 vs. extension of existing Component 3 (Workflow Graph Schema Validator) — different implications for the proposal spec and the architecture component count
2. Invocation model: which role invokes the validator, at which workflow step, and whether invocation is a hard gate or an available check
3. Phase placement within the existing tooling implementation workflow (addendum) — whether this adds a new phase or slots alongside an existing one
4. Coupling map entry: whether the plan artifact format belongs in the format dependency table and which instruction needs an invocation reference
