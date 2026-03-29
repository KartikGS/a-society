# Framework Update: Owner routing + multi-domain workflow pattern

**Framework Version:** v25.0
**Previous Version:** v24.1
**Date:** 2026-03-29

## Summary

This update documents the **multi-domain parallel-track** workflow pattern in the general workflow instruction and records a **Breaking** change to the general Owner role template: work that spans multiple role types or domains should be modeled as **one flow with parallel tracks**, not as separate flows based on workflow type alone. Adopting projects must align instantiated Owner roles with the new routing language. The workflow instruction addition is **Recommended** for projects updating their workflow documentation practices.

## Impact Summary

| Classification | Count | What it means for your project |
|---|---|---|
| Breaking | 1 | Gap if your Owner role still encodes the old "separate flows per workflow type" rule — Curator must review |
| Recommended | 1 | Improved workflow design guidance — adopt when maintaining parity with `general/` |

## Changes

### Owner role — single flow with parallel tracks

**Impact:** Breaking  
**Affected artifacts:** [`general/roles/owner.md`]  
**What changed:** The rule directing the Owner to route work that spans multiple workflow types as **separate flows** was removed. It was replaced with guidance to design **one flow** that routes through all required roles, using **parallel tracks** where steps are independent.  
**Why:** Fragmenting one feature across separate flows obscures handoffs and accountability; parallel tracks within one graph preserve structural verification while allowing concurrent work.  
**Migration guidance:** Open your project's Owner role document (typically `$[PROJECT]_OWNER_ROLE` or the path registered in your index for the Owner role). Search for language that required **separate flows** when **multiple workflow types** or **domains** apply to the same unit of work. Replace that rule with the updated template language from the current `general/roles/owner.md` **Workflow routing** bullet — specifically the sentence that requires a **single flow** with **parallel tracks** where appropriate, and the prohibition on splitting **one feature** across separate flows **only** because it spans multiple role types. If your Owner role already matched the new intent, no edit is required.

### Workflow instruction — multi-domain parallel-track pattern

**Impact:** Recommended  
**Affected artifacts:** [`general/instructions/workflow/main.md`]  
**What changed:** A new subsection under **Extended Workflow Patterns** documents the **multi-domain parallel-track** pattern: one workflow, one unit of work, parallel forks and joins across domains, with explicit checkpoints when a track requires approval.  
**Why:** Without this pattern, project designers lack first-class guidance for coordinated cross-domain work in a single graph.  
**Migration guidance:** No mandatory edit. If your project maintains a local mirror or derivative of the workflow instruction, consider adding a cross-reference or adopting the same subsection for consistency. If you author project-specific workflow documents, use the pattern when one feature spans multiple domains and branches can run in parallel until a join.

## Delivery Note

No automated delivery mechanism exists yet. Curators of adopting projects should check `a-society/updates/` periodically as part of their maintenance cycle.
