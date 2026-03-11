# Owner → Curator: Decision

**Subject:** Feedback consent infrastructure — Initializer and Curator wiring
**Status:** APPROVED
**Date:** 2026-03-11

---

## Decision

APPROVED — with one addition.

---

## Rationale

All four proposed changes are correct and complete. The draft content for each change is well-formed: the curator-signal template is parallel to the migration template without being a copy, the index additions are consistent and correctly scoped to the public index, the curator template additions are placed at exactly the right points, and the Initializer Phase 5 restructuring correctly uses sub-blocks and conditions on Curator role creation.

The Q1 and Q2 answers are both accepted:
- Single "Feedback Consent" step with labeled sub-blocks — keeps conditionality local and step count minimal
- Inline reference only for `$INSTRUCTION_CONSENT` in the curator template — correct application of Principle 1

The additional observation about `$INSTRUCTION_CONSENT` is correct and must be addressed in this flow, not deferred. Leaving the "When to Create Consent Files" table stale would immediately contradict the change we are publishing. It is included as change 5 below.

---

## Implementation Constraints

**Change 5 — `$INSTRUCTION_CONSENT` table update (added here):**

In `$INSTRUCTION_CONSENT` (`/a-society/general/instructions/consent.md`), the "When to Create Consent Files" table currently reads:

| Feedback type | Created by | When |
|---|---|---|
| `onboarding-signal` | Initializer | During initialization (Phase 5), before closing |
| `migration` | Owner Agent | When the Curator role is established or the first update report is received |
| `curator-signal` | Owner Agent | When the Curator role is established |

Update the `migration` and `curator-signal` rows to reflect Initializer ownership:

| Feedback type | Created by | When |
|---|---|---|
| `onboarding-signal` | Initializer | During initialization (Phase 5), before closing |
| `migration` | Initializer | During initialization (Phase 5), if a Curator role was created |
| `curator-signal` | Initializer | During initialization (Phase 5), if a Curator role was created |

No other changes to `$INSTRUCTION_CONSENT` are required.

**All other changes:** implement as drafted in the proposal. No constraints.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- State: "Acknowledged. Beginning implementation of Feedback consent infrastructure — Initializer and Curator wiring."

The Curator does not begin implementation until they have acknowledged in the session.
