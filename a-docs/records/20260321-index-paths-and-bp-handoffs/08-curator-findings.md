# Backward Pass Findings: Curator — 20260321-index-paths-and-bp-handoffs

**Date:** 2026-03-21
**Task Reference:** 20260321-index-paths-and-bp-handoffs
**Role:** Curator (Implementation & Registration)
**Depth:** Full

---

## Findings

### Conflicting Instructions
- None.

### Missing Information
- None.

### Unclear Instructions
- The proposal specified the backward pass handoff completeness guardrail should be added "at the end of the existing guardrails." At the time of the proposal, the final guardrail in the Guardrails section of `$GENERAL_IMPROVEMENT` was "Forward pass closure boundary." Implementation placed the new guardrail *before* "Forward pass closure boundary," not after it. The deviation was implicitly corrected in the update report's migration guidance ("Place it before the Forward pass closure boundary guardrail, consistent with the ordering in the updated general template"), and the Owner approved the report without flagging the discrepancy — so the current state is Owner-approved. However, the placement decision was never explicitly argued at the proposal stage. The semantic question: "Forward pass closure boundary" governs when to *enter* the backward pass (a gate); "handoff completeness" governs behavior *within* the backward pass. If the guardrails are read chronologically — first you confirm the gate, then you execute with proper handoffs — the current order (handoff completeness first, closure boundary second) inverts that sequence. Whether this matters is a question for synthesis.

### Redundant Information
- None.

### Scope Concerns
- The `$A_SOCIETY_INDEX` follow-on (A-Society's own index uses `/a-society/...` style paths, which are now inconsistent with the updated `$INSTRUCTION_INDEX` rule) was correctly flagged as out-of-scope in `04-owner-to-curator.md` and routed as a Next Priority after this flow closes. Implementation took no action on this. Confirming the routing is recorded here so synthesis can verify it reaches the priority list.

### Workflow Friction
- The Owner pre-specified the classification (Recommended for both changes) in the handoff to the update report phase. This prevented a potential classification dispute: Change 1 (path format rule) might reasonably have been classified as Breaking — the rule change directly affects every adopting project's index, and existing indexes with machine-specific absolute paths would need remediation. The Owner's front-loading removed ambiguity from what could have been a back-and-forth. Worth noting as a pattern that worked well: pre-specifying classification in the handoff to Phase 4 when the Owner has a clear view of the intended impact level.

---

## Top Findings (Ranked)

1. Guardrail placement contradicts proposal spec ("at the end" → placed before Forward pass closure boundary) — `$GENERAL_IMPROVEMENT`, `$A_SOCIETY_IMPROVEMENT` Guardrails section
2. `$A_SOCIETY_INDEX` follow-on (repo-relative path adoption) pending as Next Priority — `a-society/a-docs/indexes/main.md`
3. Classification pre-specification in update report handoff is a friction-reducing pattern worth noting for future update report flows — owner role template / update report protocol
