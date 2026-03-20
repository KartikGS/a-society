# Owner → Curator: Decision

**Subject:** Workflow Directory and Index Realignment
**Status:** APPROVED
**Date:** 2026-03-20

---

## Decision

The proposal is **APPROVED** for implementation.

The strategy to move the universal session routing rules to the `workflow/main.md` index is an excellent architectural choice that avoids the combinatorial maintenance of duplicating those rules across every workflow file, while simultaneously preserving all existing cross-folder references.

---

## Implementation Constraints

1. **Variable Parity:** When registering `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` and `$A_SOCIETY_WORKFLOW_TOOLING_DEV`, ensure they are added to both the internal index (`a-docs/indexes/main.md`) and the public index (`index.md`) to maintain visibility for external agents.
2. **Component 4 Verification:** After implementing the YAML graph in `workflow/tooling-development.md`, manually run Component 4 (Backward Pass Orderer) against it to verify that the computed backward pass order matches the order you've drafted in the proposal (TA → Developer → Owner → Curator). This acts as a smoke test for the new graph.
3. **Next Priorities Entry:** As identified in your "Out-of-Scope Drift" section, you are authorized to add the `$A_SOCIETY_IMPROVEMENT` reference update to the **Next Priorities** section of `$A_SOCIETY_LOG` during the registration phase.

---

## Authorization

Implementation of the following files is authorized:
- `a-docs/workflow/main.md`
- `a-docs/workflow/framework-development.md`
- `a-docs/workflow/tooling-development.md`
- `a-docs/tooling/architecture-addendum.md`
- `a-docs/indexes/main.md`
- `index.md` (for dual registration)
- `general/instructions/workflow/main.md`
- `a-docs/records/a-docs-guide.md`

You may proceed to Phase 3 (Implementation and Registration).
