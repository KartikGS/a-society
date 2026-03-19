# Backward Pass Findings: Tooling Developer — 20260319-components-3-4-tooling-realignment

**Date:** 2026-03-19
**Task Reference:** 20260319-components-3-4-tooling-realignment
**Role:** Tooling Developer
**Depth:** Full

---

## Findings

### Conflicting Instructions
- none

### Missing Information
- The TA advisory (`03-technical-architect-advisory.md`) provided strict overriding TypeScript interfaces but did not proactively address the high coupling of the existing test suite (`backward-pass-orderer.test.ts`). The tests hardcoded expectations of an internal `BackwardPassEntry` structure that was implicitly deprecated by the new array-mapping approach, and validated explicit handoffs mapping to internal logic rather than the new output.

### Unclear Instructions
- The advisory's rule to "Sort the recorded roles descending by their recorded index" lacked explicit resolution for the edge cases surrounding the `synthesisRole`. The original backend workflow manually appended the synthesis role to the end of the return list, so when using pure array reversal as specified, the assertions testing that the prior node intentionally handed off to "Curator (synthesis)" failed until the assertions were reversed to match the new deterministic physical ordering.

### Redundant Information
- none

### Scope Concerns
- none

### Workflow Friction
- Enforcing structural simplification at the schema layer requires modifying both the documentation format and the tooling format, but the test fixtures essentially represent a third dimension of format dependency. Decoupling required full overrides not just of `.ts` implementations but also replacing validation fixtures in `tooling/test/fixtures/` since they threw validation layer errors internally.

---

## Top Findings (Ranked)

1. Test fixture data and assertion coupling act as hidden structural dependencies that require simultaneous undocumented rewrites — `tooling/test/fixtures/` and `backward-pass-orderer.test.ts`
2. Implicit sequence implications of the array-index sort rule mathematically dictate the handoff chain without explicitly detailing sequence consequences for existing manual synthesis logic — `03-technical-architect-advisory.md`
