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

**Status:** Framework active at v18.1. Backward pass pending for `workflow-obligation-consolidation`, `backward-pass-quality-principles`, `log-restructure`, `general-lib-sync-bundle`, `graph-validator-human-collaborative`, `next-priorities-bundle`, and `workflow-mechanics-corrections`.

**Recent Focus**

`[M][LIB][MAINT]` — **component4-design-advisory** (2026-03-22): Tier 2 Tooling Dev flow closed. Component 4 redesign — three changes: *(1)* existing-session (meta-analysis) prompts switched from orientation preamble to three-field format (`Next action:` / `Read:` / `Expected response:`); *(2)* `Read:` lines embed `### Meta-Analysis Phase` and `### Synthesis Phase` references from `$GENERAL_IMPROVEMENT`; *(3)* `synthesis_role` removed from record-folder `workflow.md` schema; `orderWithPromptsFromFile` takes `synthesisRole` as required second parameter; backward-compat: old `synthesis_role` field silently ignored. `$A_SOCIETY_TOOLING_INVOCATION`, `$A_SOCIETY_RECORDS`, `$A_SOCIETY_TOOLING_PROPOSAL`, `$A_SOCIETY_IMPROVEMENT`, `$GENERAL_IMPROVEMENT` (LIB), `$A_SOCIETY_TOOLING_COUPLING_MAP` (MAINT): updated. Update report assessment not completed in Phase 7 — surfaced as backward pass finding; filed to Next Priorities. Backward pass complete (Curator synthesis, 2026-03-22). Record: `a-society/a-docs/records/20260322-component4-design-advisory/`.

**Previous**

`[S][LIB][MAINT]` — **bp-meta-synthesis-separation** (2026-03-22): Tier 2 Framework Dev flow closed. `$GENERAL_IMPROVEMENT` (LIB): `### How It Works` dissolved; content redistributed to `### Meta-Analysis Phase` (Steps 1–3 + reflection subsections promoted to `####`) and `### Synthesis Phase` (Steps 4–5 renumbered 1–2); `[CUSTOMIZE]` preamble updated to reference new heading. `$A_SOCIETY_IMPROVEMENT` (MAINT): same restructuring echoed. Framework update report published at v18.1 (`2026-03-22-improvement-bp-phase-separation.md`), 1 Recommended. Backward pass complete (Curator synthesis, 2026-03-22). Synthesis: no new items filed; workflow.md path completeness Next Priority corroborated (source added). Record: `a-society/a-docs/records/20260322-bp-meta-synthesis-separation/`.

`[S][LIB][MAINT]` — **workflow-obligation-consolidation** (2026-03-22): Tier 2 Framework Dev flow closed. *(1)* `$A_SOCIETY_WORKFLOW` (MAINT): new "Forward Pass Closure" universal section — current-flow scoping and synthesis-is-terminal rules now live once in the routing index, not per-workflow. *(2)* `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` (MAINT): synthesis conditional removed from Session Model Step 6; replaced with synthesis-closes-unconditionally statement. *(3)* `$INSTRUCTION_WORKFLOW` (LIB): new mandatory "### 6. Forward Pass Closure" in "What Belongs in a Workflow Document"; new Step 7 in "How to Write One"; Backward Pass renumbered to § 7; Steps 7–9 renumbered to 8–10. Framework update report published at v18.0 (`2026-03-22-workflow-forward-pass-closure-instruction.md`), 1 Breaking. Backward pass complete (Curator synthesis, 2026-03-22). Synthesis MAINT: Phase 5 Component 4 invocation obligation added (`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`); artifact sequence table replaced with type-based guidance (`$A_SOCIETY_RECORDS`). `synthesis_role` design problem filed to Next Priorities. Record: `a-society/a-docs/records/20260322-workflow-obligation-consolidation/`.

`[S][LIB][MAINT]` — **backward-pass-quality-principles** (2026-03-22): Tier 2 Framework Dev flow closed. `$GENERAL_IMPROVEMENT` (LIB): new "Analysis Quality" subsection added to Backward Pass Protocol after "What to Reflect On" — two principles: *(1)* externally-caught errors are higher priority, not lower — backward pass must ask "why wasn't this caught by me?"; "the rule was documented" is the start of the analysis, not the end; *(2)* artifact production vs. genuine analysis — a finding that could have been written without tracing the error has not been analyzed; a genuine finding names a specific root cause. `$A_SOCIETY_IMPROVEMENT` (MAINT): same subsection echoed after "Reflection Categories". Framework update report published at v17.6 (`2026-03-22-backward-pass-analysis-quality.md`), 1 Recommended. Backward pass pending. Record: `a-society/a-docs/records/20260322-backward-pass-quality-principles/`.

---

## Next Priorities

`[S][LIB][MAINT]` — **Brief-writing and proposal quality: behavioral property consistency, write authority label, and topology waiver** — *(1)* `$GENERAL_OWNER_ROLE` Brief-Writing Quality (LIB): *(a)* add note that `[Curator authority — implement directly]` can designate write authority outside the receiving role's default scope when the Owner explicitly scopes it in the brief; the brief is the correct home for explicit designation; *(b)* add behavioral property consistency check — when specifying behavioral properties (ordering, mutability, timing), verify they are internally consistent before sending; a brief that seeds contradictory properties will have those contradictions reproduced downstream; *(c)* when a flow has no Proposal phase, the brief must explicitly state that no proposal artifact is required before implementation begins. Echo all three to `$A_SOCIETY_OWNER_ROLE` (MAINT). *(2)* `$GENERAL_CURATOR_ROLE` (LIB): *(a)* add proposal quality check — before submitting a proposal, verify that proposed output language does not contain contradictory behavioral properties; *(b)* add Approval Invariant topology check — if the workflow plan shows no Proposal node, the brief constitutes authorization; no proposal artifact is required. Echo both to `$A_SOCIETY_CURATOR_ROLE` (MAINT). Sources: `$A_SOCIETY_RECORDS/20260322-general-lib-sync-bundle/07-curator-synthesis.md` (item 1a); `$A_SOCIETY_RECORDS/20260322-log-restructure/06-owner-findings.md` (items 1b, 2); `$A_SOCIETY_RECORDS/20260322-backward-pass-quality-principles/06-owner-findings.md` (findings 1/3, 3).

`[S][LIB][MAINT]` — **workflow.md path completeness: LIB flows must include Registration step at intake** — `$A_SOCIETY_OWNER_ROLE` intake guidance (MAINT): add note that `[LIB]` flows have a predictable registration step (Curator → update report + version increment → Owner review) that must be included in `workflow.md` at intake; the LIB scope tag is the signal to add this loop. `$GENERAL_OWNER_ROLE` (LIB): if the general Owner role has equivalent intake guidance, add the same note in domain-agnostic form — any flow with a known post-implementation publication or registration step should include it in the path at intake. Sources: `$A_SOCIETY_RECORDS/20260322-backward-pass-quality-principles/06-owner-findings.md` (workflow.md omission finding); `$A_SOCIETY_RECORDS/20260322-bp-meta-synthesis-separation/09-owner-findings.md` (Finding 1, same gap re-instantiated).

`[S][MAINT]` — **Update report assessment for component4-design-advisory** — Curator to assess `$A_SOCIETY_UPDATES_PROTOCOL` for two changes from this flow: *(1)* `orderWithPromptsFromFile` signature change (one required parameter → two); *(2)* `$GENERAL_IMPROVEMENT` LIB update (phase-instruction embedding addition). Signature change is a breaking API change for any caller using the old single-parameter signature. Draft and publish update report to `$A_SOCIETY_UPDATES_DIR` if triggered. Source: `a-society/a-docs/records/20260322-component4-design-advisory/11-owner-findings.md` (Finding 1).

`[S]` — **Integration test assertion depth: Scenario 5 synthesisRole value check** — `test/integration.test.ts` Scenario 5 currently asserts result structure only; `synthesisRole` was `undefined` during a passing test run. Fix: add assertion verifying the `synthesisRole` value in the computed backward pass plan. Requires Tooling Developer. Source: `a-society/a-docs/records/20260322-component4-design-advisory/09-developer-findings.md` (Finding 1); `a-society/a-docs/records/20260322-component4-design-advisory/11-owner-findings.md` (Finding 2).

---

Archived flows are recorded in `$A_SOCIETY_LOG_ARCHIVE`. One entry per flow. Entries are immutable once written. Most recent at top.
