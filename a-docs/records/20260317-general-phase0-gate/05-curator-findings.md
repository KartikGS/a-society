# Backward Pass Findings: Curator — 20260317-general-phase0-gate

**Date:** 2026-03-17
**Task Reference:** 20260317-general-phase0-gate
**Role:** Curator
**Depth:** Full

---

## Findings

### Conflicting Instructions
- None.

### Missing Information
- The brief's "Open Questions: None" formulation carries no statement about when implementation may begin. The Approval Invariant — requiring APPROVED before any write to `general/` — is documented in `$A_SOCIETY_WORKFLOW` but not restated in the brief format. An agent reading a fully-specified brief with no open questions may not distinguish between "direction aligned" (what the brief establishes) and "implementation authorized" (what the Phase 2 decision establishes). The brief format does not surface this distinction.

- The brief specified registering the new template in the public index (`/a-society/index.md`) only. The Curator hard rule requires adding to `indexes/main.md` whenever a file is first referenced by variable name. This interaction is not stated anywhere — the hard rule and the brief registration scope appear to conflict until the rule's non-negotiable status is applied. An agent with less certainty about the hard rule's priority might skip the internal index registration.

### Unclear Instructions
- None beyond the missing information items above.

### Redundant Information
- None.

### Scope Concerns
- None. The brief scope was clearly bounded. The out-of-scope items (internal owner role, records convention artifact sequence) were correctly excluded.

### Workflow Friction
- **Approval Invariant violation.** Implementation of all changes to `general/` was complete before the Phase 2 APPROVED decision existed. The trigger: the brief was fully specified ("Open Questions: None"), the scope was unambiguous, and the pattern across recent flows has been that a complete brief followed immediately by the Curator submitting a proposal/confirmation rather than a substantive counter-proposal. The Approval Invariant is structural — it does not suspend for "obvious" or "pre-aligned" cases — but nothing in the briefing or submission flow forced a pause before implementation began. The submission artifact's status field ("PENDING_REVIEW") was set correctly, but by that point the implementation was already done.

---

## Top Findings (Ranked)

1. **Approval Invariant violated before Phase 2 decision existed** — execution proceeded from fully-specified brief without waiting for APPROVED; the brief format does not surface the implementation authorization threshold (`$A_SOCIETY_WORKFLOW`, Approval Invariant)
2. **Brief registration scope vs. Curator hard rule interaction undocumented** — brief named only the public index; Curator hard rule required internal index update too; no document explains when a brief's explicit scope is supplemented by a hard rule obligation (`$A_SOCIETY_CURATOR_ROLE`, Hard Rules; `$A_SOCIETY_INDEX`)
3. **Brief "Open Questions: None" does not distinguish direction alignment from implementation authorization** — future briefs with this formulation carry no signal about when implementation may begin (`$A_SOCIETY_COMM_TEMPLATE_BRIEF`)
