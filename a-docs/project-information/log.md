# A-Society: Project Log

## Scope Tags

| Tag | Meaning |
|---|---|
| `[S]` | Small — single-session maintenance change (one to two files) |
| `[M]` | Medium — multi-step change within a single phase |
| `[L]` | Large — multi-phase or multi-file strategic change |
| `[LIB]` | Library — creates or modifies `general/` content; requires Owner approval; may require a framework update report |
| `[MAINT]` | Maintenance — a-docs change within Curator authority; no Owner proposal needed |
| `[ADR]` | Direction decision involved; requires Owner-level scope |

Tags may be combined: `[M][LIB]`, `[S][MAINT]`, `[L][LIB][ADR]`.

---

## Entry Lifecycle

- **Recent Focus** — the most recently completed flow. Exactly one entry.
- **Previous** — up to three prior completed flows.
- When a fourth `Previous` entry would be added, the oldest moves to `$A_SOCIETY_LOG_ARCHIVE`.
- Entries are added when a flow closes (Owner signs off, or Curator completes Curator-authority work). Entries are not modified after archival.

---

## Current State

**Status:** Framework active at v20.0. Backward pass pending for `workflow-obligation-consolidation`, `backward-pass-quality-principles`, `log-restructure`, `general-lib-sync-bundle`, `graph-validator-human-collaborative`, `next-priorities-bundle`, and `workflow-mechanics-corrections`.

**Recent Focus**

`[S][LIB][MAINT]` — **workflow-path-completeness** (2026-03-22): Tier 2 Framework Dev flow closed. Two additive changes to Owner role files: *(1)* `$A_SOCIETY_OWNER_ROLE` (MAINT): new bullet in Post-Confirmation Protocol — `[LIB]` scope flows must include the registration loop (Curator publishes update report → version incremented → Owner acknowledgment) as a distinct step in `workflow.md` at intake; *(2)* `$GENERAL_OWNER_ROLE` (LIB): record-folder bullet extended with conditional `workflow.md` Phase 0 co-output obligation (2a); new standalone bullet added requiring inclusion of predictable post-implementation steps in path at intake (2b). Framework update report published: `2026-03-22-workflow-path-completeness.md` (v19.1 → v20.0, Breaking × 2). `$A_SOCIETY_VERSION` updated to v20.0. Backward pass complete (Curator synthesis, 2026-03-22). Synthesis: no new items. Record: `a-society/a-docs/records/20260322-workflow-path-completeness/`.

**Previous**

`[S][LIB][MAINT]` — **brief-proposal-quality** (2026-03-22): Tier 2 Framework Dev flow closed. Five behavioral guidance additions to Owner and Curator role files: *(1)* `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE` (Brief-Writing Quality): authority designation, topology-based obligation, and behavioral property consistency paragraphs added; *(2)* `$GENERAL_CURATOR_ROLE`: Approval Invariant topology check bullet added to Hard Rules; new Implementation Practices section added after Hard Rules; *(3)* `$A_SOCIETY_CURATOR_ROLE`: topology waiver bullet added to Hard Rules. Deferred component4-design-advisory update report obligation closed: `2026-03-22-backward-pass-orderer-signature.md` published (v18.1 → v19.0, Breaking + Recommended) and `2026-03-22-brief-writing-quality.md` published (v19.0 → v19.1, 5 Recommended). `$A_SOCIETY_VERSION` updated to v19.1. Backward pass complete (Curator synthesis, 2026-03-22). Synthesis MAINT: *(1)* `workflow.md` creation added to Phase 0 output and Handoffs table (`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`); *(2)* same obligation added to Post-Confirmation Protocol (`$A_SOCIETY_OWNER_ROLE`); *(3)* new "Review Artifact Quality" section added to `$A_SOCIETY_OWNER_ROLE` — Owner must re-read before issuing file-state claims in decision artifacts; *(4)* deferred-report sequencing guidance added to `$A_SOCIETY_UPDATES_PROTOCOL`. Next Priority updated: workflow.md creation obligation merged into existing workflow.md path completeness item. Record: `a-society/a-docs/records/20260322-brief-proposal-quality/`.

`[M][LIB][MAINT]` — **component4-design-advisory** (2026-03-22): Tier 2 Tooling Dev flow closed. Component 4 redesign — three changes: *(1)* existing-session (meta-analysis) prompts switched from orientation preamble to three-field format (`Next action:` / `Read:` / `Expected response:`); *(2)* `Read:` lines embed `### Meta-Analysis Phase` and `### Synthesis Phase` references from `$GENERAL_IMPROVEMENT`; *(3)* `synthesis_role` removed from record-folder `workflow.md` schema; `orderWithPromptsFromFile` takes `synthesisRole` as required second parameter; backward-compat: old `synthesis_role` field silently ignored. `$A_SOCIETY_TOOLING_INVOCATION`, `$A_SOCIETY_RECORDS`, `$A_SOCIETY_TOOLING_PROPOSAL`, `$A_SOCIETY_IMPROVEMENT`, `$GENERAL_IMPROVEMENT` (LIB), `$A_SOCIETY_TOOLING_COUPLING_MAP` (MAINT): updated. Update report assessment not completed in Phase 7 — surfaced as backward pass finding; filed to Next Priorities. Backward pass complete (Curator synthesis, 2026-03-22). Record: `a-society/a-docs/records/20260322-component4-design-advisory/`.

`[S][LIB][MAINT]` — **bp-meta-synthesis-separation** (2026-03-22): Tier 2 Framework Dev flow closed. `$GENERAL_IMPROVEMENT` (LIB): `### How It Works` dissolved; content redistributed to `### Meta-Analysis Phase` (Steps 1–3 + reflection subsections promoted to `####`) and `### Synthesis Phase` (Steps 4–5 renumbered 1–2); `[CUSTOMIZE]` preamble updated to reference new heading. `$A_SOCIETY_IMPROVEMENT` (MAINT): same restructuring echoed. Framework update report published at v18.1 (`2026-03-22-improvement-bp-phase-separation.md`), 1 Recommended. Backward pass complete (Curator synthesis, 2026-03-22). Synthesis: no new items filed; workflow.md path completeness Next Priority corroborated (source added). Record: `a-society/a-docs/records/20260322-bp-meta-synthesis-separation/`.

---

## Next Priorities

`[S]` — **Integration test assertion depth: Scenario 5 synthesisRole value check** — `test/integration.test.ts` Scenario 5 currently asserts result structure only; `synthesisRole` was `undefined` during a passing test run. Fix: add assertion verifying the `synthesisRole` value in the computed backward pass plan. Requires Tooling Developer. Source: `a-society/a-docs/records/20260322-component4-design-advisory/09-developer-findings.md` (Finding 1); `a-society/a-docs/records/20260322-component4-design-advisory/11-owner-findings.md` (Finding 2).

---

Archived flows are recorded in `$A_SOCIETY_LOG_ARCHIVE`. One entry per flow. Entries are immutable once written. Most recent at top.
