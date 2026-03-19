**Subject:** Clarifying Tooling Developer test ownership
**Status:** BRIEFED
**Date:** 2026-03-19

---

## Agreed Change

`[Curator authority — implement directly]`

Based on the backward pass synthesis of the `20260319-components-3-4-tooling-realignment` flow, the role boundary between the Technical Architect and Tooling Developer drifted regarding test fixture ownership. The Tooling Developer must independently adapt test assertions and fixtures when implementing a TA specification change, without expecting explicit unit-test rewrite instructions from the TA.

---

## Scope

**In scope:**
- Update `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` (`a-docs/roles/tooling-developer.md`) to explicitly add "test fixture data and test assertion adaptation" to the Developer's absolute implementation ownership.
- Update `$A_SOCIETY_TOOLING_ADDENDUM` (`a-docs/tooling/architecture-addendum.md`) extending the Developer's scope definition to reiterate that internal test-harness design and internal format couplings are out of bounds for the TA's structural advisories.

**Out of scope:**
- Changes to the general library or other project governance structures.

---

## Likely Target

- `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` (`a-docs/roles/tooling-developer.md`)
- `$A_SOCIETY_TOOLING_ADDENDUM` (`a-docs/tooling/architecture-addendum.md`)

---

## Open Questions for the Curator

None. This is a highly mechanical maintenance update to prevent future friction.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Clarifying Tooling Developer test ownership."

*(Note: Because the items are marked [Curator authority — implement directly] and Open Questions are None, the Curator may proceed straight to implementation without awaiting a Phase 2 Owner decision artifact after acknowledging the brief).*
