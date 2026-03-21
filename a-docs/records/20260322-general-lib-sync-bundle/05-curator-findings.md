# Backward Pass Findings: Curator — 20260322-general-lib-sync-bundle

**Date:** 2026-03-22
**Task Reference:** 20260322-general-lib-sync-bundle
**Role:** Curator
**Depth:** Lightweight

---

## Findings

### Conflicting Instructions
- None.

### Missing Information
- **`[Curator authority — implement directly]` label does not address write authority outside `a-docs/` and `general/`.** Item 3 directed the Curator to write to `a-society/tooling/test/`. The Curator role declares authority over `a-docs/` and `general/`; it does not mention `tooling/`. The Owner's explicit brief label and the MAINT exemption rule together made the authorization clear in context, but the role doc's silence on this pattern could cause a future Curator to pause. A note in the Curator role — or in the brief format guidance — clarifying that `[Curator authority — implement directly]` can scope outside normal write bounds when the Owner explicitly designates it would close this gap. The finding is minor: no friction occurred in this flow.

### Unclear Instructions
- None.

### Redundant Information
- None.

### Scope Concerns
- None.

### Workflow Friction
- **Item 2 conditional inspection pattern worked as designed.** The brief's conditional framing ("inspect during proposal formulation; if absent, confirm explicitly — Item 2 closes with no change") resolved a known unknown without generating a phantom scope item or requiring an Owner judgment call. Inspection took one file read; result was deterministic; no revision cycle. This is a positive pattern — noting it explicitly in case it is worth capturing as a general brief-writing practice.
- **Same-file constraint (Items 4 & 6) was caught and communicated at the right level.** Both items target `$GENERAL_IMPROVEMENT`. The Owner correctly flagged this as an implementation constraint in the decision ("implement both in a single edit pass") rather than expecting the Curator to discover it during implementation. The constraint was applied without friction. No further action needed.

---

## Top Findings (Ranked)

1. `[Curator authority — implement directly]` label does not address write authority outside `a-docs/` and `general/` — `a-society/a-docs/roles/curator.md`, Brief-Writing guidance
