---
type: owner-workflow-plan
date: "2026-03-18"
complexity:
  domain_spread: moderate
  shared_artifact_impact: elevated
  step_dependency: elevated
  reversibility: moderate
  scope_size: elevated
tier: 3
path:
  - Owner
  - Technical Architect
  - Owner
  - Tooling Developer
  - Technical Architect
  - Curator
  - Owner
known_unknowns:
  - "Component 4 extension interface: what inputs does the trigger prompt generator accept? Record folder path (Developer reads artifacts to derive the role list)? Or workflow file + an explicit fired-node list passed by the caller?"
  - "utils.ts scope: log describes two duplicating components, but grep confirms three (backward-pass-orderer, workflow-graph-validator, plan-artifact-validator). TA to confirm the boundary — whether any primitives beyond extractFrontmatter() belong in utils.ts."
  - "Binding spec form: whether the Component 4 spec amendment requires a formal tooling-proposal addendum or whether the TA advisory output serves as the binding spec for the Developer."
  - "Post-Phase-6 gate check: whether the architecture document Component 4 description requires updating to reflect the expanded output."
---

**Subject:** Shared utils.ts + backward pass trigger prompt tool (Component 4 extension)
**Type:** Owner Workflow Plan
**Date:** 2026-03-18

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches tooling implementation (TypeScript) and a-docs documentation (INVOCATION.md, architecture component table, possibly tooling-proposal). Two domains but both within the tooling ecosystem. | moderate |
| **2. Shared artifact impact** | `$A_SOCIETY_TOOLING_INVOCATION` requires a Type C update (existing component interface changes). `$A_SOCIETY_ARCHITECTURE` component table may need an updated description for Component 4. The coupling map needs updating. Possibly `$A_SOCIETY_TOOLING_PROPOSAL` for a Component 4 spec amendment. | elevated |
| **3. Step dependency** | TA must define the utils.ts boundary and Component 4 extension spec before the Developer implements. TA review of Component 4 implementation gates Curator doc updates. Owner gates both the TA scoping approval and the final implementation sign-off. | elevated |
| **4. Reversibility** | TypeScript code changes are git-reversible. The Component 4 output extension is additive (existing callers unaffected). Once INVOCATION.md is updated it creates agent expectations — not easily walked back without a follow-on change. | moderate |
| **5. Scope size** | Four TypeScript files (utils.ts new; backward-pass-orderer.ts, workflow-graph-validator.ts, plan-artifact-validator.ts deduped or extended). At minimum INVOCATION.md updated; potentially architecture and tooling-proposal too. Four roles: Owner, TA, Developer, Curator. | elevated |

**Verdict:** Tier 3 — Three elevated axes, four roles with sequential dependencies, and a blocking TA scoping gate before any Developer work begins.

---

## Routing Decision

Tier 3 — Full Pipeline. The TA scoping gate is blocking (Developer cannot start without a defined utils.ts boundary and Component 4 extension spec). Multiple shared a-docs artifacts are affected. The Approval Invariant requires Owner sign-off on the TA scoping output before implementation begins. Standard Tier 3 routing applies throughout.

The Post-Phase-6 component addition gate from `$A_SOCIETY_TOOLING_ADDENDUM` applies in spirit: this extends Component 4's public interface and adds a new internal module. The TA's advisory output must address the four gate conditions (role doc, architecture, manifest, naming convention) before the Developer session opens.

---

## Path Definition

1. Owner — Phase 0 plan (this document) + brief to Technical Architect
2. Technical Architect — scoping advisory: define utils.ts boundary (which primitives belong; confirm all three duplicating files); define Component 4 extension spec (new function signature, output structure, trigger prompt format); address Post-Phase-6 gate conditions
3. Owner — review TA scoping output; issue approval decision
4. Tooling Developer — implement: (a) utils.ts + deduplication across confirmed components; (b) Component 4 trigger prompt extension per TA spec
5. Technical Architect — review implementation against spec (required gate for Component 4)
6. Curator — doc updates: INVOCATION.md Type C entry for Component 4; architecture component table if description requires updating; tooling-proposal Component 4 spec amendment if TA advisory requires it; coupling map update (Type C)
7. Owner — final gate
8. Backward pass: Developer findings → TA findings → Owner findings → Curator (synthesis)

---

## Known Unknowns

1. Component 4 extension interface design — what inputs does the trigger prompt generator accept? Record folder path (component reads artifacts)? Or workflow file + explicit fired-node list? TA determines this.
2. utils.ts scope — log describes two duplicating components, but grep confirms three (backward-pass-orderer, workflow-graph-validator, plan-artifact-validator). TA to confirm the boundary and whether any other shared primitives belong.
3. Binding spec form for Component 4 extension — formal tooling-proposal addendum or TA advisory as binding spec? TA to recommend; Owner to confirm at approval gate.
4. Architecture update scope — Component 4's current description ("Computes correct backward pass traversal order from a workflow graph") may need expanding to name the trigger prompt capability.
