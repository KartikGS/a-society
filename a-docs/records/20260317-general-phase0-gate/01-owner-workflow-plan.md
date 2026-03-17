---
type: owner-workflow-plan
date: "2026-03-17"
complexity:
  domain_spread: low
  shared_artifact_impact: moderate
  step_dependency: low
  reversibility: moderate
  scope_size: moderate
tier: 2
path: ["Owner", "Curator", "Owner", "Curator"]
known_unknowns: []
---

**Subject:** General library — Phase 0 gate and complexity template reference (2 changes)
**Type:** Owner Workflow Plan
**Date:** 2026-03-17

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Both changes are in `general/` — owner role template and complexity instruction. Single domain (general library). | low |
| **2. Shared artifact impact** | `$GENERAL_OWNER_ROLE` is a shared template copied into every initialized project's owner role. `$INSTRUCTION_WORKFLOW_COMPLEXITY` is a shared instruction. New general template added to public index and manifest. | moderate |
| **3. Step dependency** | The two changes are independent. The template creation (Change 2) does not depend on the owner role edit (Change 1) and vice versa. | low |
| **4. Reversibility** | LIB changes that will require a framework update report. Targeted edits with no structural removals — changes are additive. | moderate |
| **5. Scope size** | Five file touches: `$GENERAL_OWNER_ROLE` (edit), `$INSTRUCTION_WORKFLOW_COMPLEXITY` (edit), new `$GENERAL_OWNER_WORKFLOW_PLAN_TEMPLATE` (create), public index (row add), manifest (entry add). Two roles. | moderate |

**Verdict:** Tier 2 — LIB invariant requires Owner approval regardless of complexity score. Scope is well-defined with no step dependencies; standard Tier 2 pipeline is the right path.

---

## Routing Decision

Tier 2 applies. The LIB constraint governs: both changes touch `general/` and require Owner review before the Curator implements. Complexity axes are uniformly low-to-moderate with no elevated signals that would push toward Tier 3. Standard pipeline: Owner brief → Curator proposal → Owner review → Curator implementation + registration → backward pass.

---

## Path Definition

1. Owner — produce workflow plan (this artifact) and Owner-to-Curator brief
2. Curator — review brief, propose both changes (content drafts for all five file touches)
3. Owner — review proposal against generalizability, abstraction, duplication, placement, and quality tests; apply manifest check and coupling check; issue decision
4. Curator — implement, register (index + manifest), determine update report need, conduct backward pass findings

---

## Known Unknowns

None.
