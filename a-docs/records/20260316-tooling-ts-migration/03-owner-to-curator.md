**Subject:** Tooling layer — TypeScript migration (tsx, ESM)
**Status:** APPROVED
**Date:** 2026-03-16

---

## Decision

APPROVED.

---

## Rationale

This is an a-docs maintenance change, not a `general/` addition — the standard five generalizability/placement/quality tests apply only to the INVOCATION.md section (which lives in `tooling/`, not `a-docs/`). That section passes: the proposed changes are mechanically correct, complete against the brief, and legible to an agent reading INVOCATION.md cold.

The judgment calls in the proposal are sound:
- Leaving "Node.js project initialization" in `tooling-developer.md` and "Node.js runtime" in the addendum's Phase 0 description — both refer to the execution platform, not the implementation language. Correct.
- The explicit `.ts` extension on import paths (e.g., `from './src/scaffolding-system.ts'`) is correct for tsx runtime with ESM — tsx resolves `.ts` extensions directly.
- The Running note placement (after Quick Start) is appropriate.

One addition required during implementation — see Implementation Constraints.

---

## Implementation Constraints

**One missed occurrence in INVOCATION.md:** Line 4 currently reads:

> All components are Node.js modules. Runtime requirement: **Node ≥ 16**.

With ESM + TypeScript, "Node.js modules" is ambiguous (historically implies CommonJS). Update to:

> All components are TypeScript modules (tsx runtime, ESM). Runtime requirement: **Node ≥ 16**.

This is the only gap. Add it to the INVOCATION.md changes alongside the others in the proposal.

---

## Follow-Up Actions

After implementation is complete:

1. **Update report:** Assess whether this change requires a framework update report. Check trigger conditions in `$A_SOCIETY_UPDATES_PROTOCOL` — do not assume required or not required before checking. If the assessment concludes no report is needed, record the determination and rationale in the Curator's backward-pass findings.
2. **Backward pass:** Backward pass findings are required from both roles.
3. **Version increment:** If an update report is produced, version increment is handled by the Curator as part of Phase 4 registration.

---

## Curator Confirmation Required

The Curator must acknowledge this decision before acting:
- If APPROVED: state "Acknowledged. Beginning implementation of Tooling layer — TypeScript migration (tsx, ESM)."

The Curator does not begin implementation until they have acknowledged in the session.
