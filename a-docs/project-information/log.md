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

`[S][LIB][MAINT]` — **bp-meta-synthesis-separation** (2026-03-22): Tier 2 Framework Dev flow closed. `$GENERAL_IMPROVEMENT` (LIB): `### How It Works` dissolved; content redistributed to `### Meta-Analysis Phase` (Steps 1–3 + reflection subsections promoted to `####`) and `### Synthesis Phase` (Steps 4–5 renumbered 1–2); `[CUSTOMIZE]` preamble updated to reference new heading. `$A_SOCIETY_IMPROVEMENT` (MAINT): same restructuring echoed. Framework update report published at v18.1 (`2026-03-22-improvement-bp-phase-separation.md`), 1 Recommended. Backward pass complete (Curator synthesis, 2026-03-22). Synthesis: no new items filed; workflow.md path completeness Next Priority corroborated (source added). Record: `a-society/a-docs/records/20260322-bp-meta-synthesis-separation/`.

**Previous**

`[S][LIB][MAINT]` — **workflow-obligation-consolidation** (2026-03-22): Tier 2 Framework Dev flow closed. *(1)* `$A_SOCIETY_WORKFLOW` (MAINT): new "Forward Pass Closure" universal section — current-flow scoping and synthesis-is-terminal rules now live once in the routing index, not per-workflow. *(2)* `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` (MAINT): synthesis conditional removed from Session Model Step 6; replaced with synthesis-closes-unconditionally statement. *(3)* `$INSTRUCTION_WORKFLOW` (LIB): new mandatory "### 6. Forward Pass Closure" in "What Belongs in a Workflow Document"; new Step 7 in "How to Write One"; Backward Pass renumbered to § 7; Steps 7–9 renumbered to 8–10. Framework update report published at v18.0 (`2026-03-22-workflow-forward-pass-closure-instruction.md`), 1 Breaking. Backward pass complete (Curator synthesis, 2026-03-22). Synthesis MAINT: Phase 5 Component 4 invocation obligation added (`$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV`); artifact sequence table replaced with type-based guidance (`$A_SOCIETY_RECORDS`). `synthesis_role` design problem filed to Next Priorities. Record: `a-society/a-docs/records/20260322-workflow-obligation-consolidation/`.

`[S][LIB][MAINT]` — **backward-pass-quality-principles** (2026-03-22): Tier 2 Framework Dev flow closed. `$GENERAL_IMPROVEMENT` (LIB): new "Analysis Quality" subsection added to Backward Pass Protocol after "What to Reflect On" — two principles: *(1)* externally-caught errors are higher priority, not lower — backward pass must ask "why wasn't this caught by me?"; "the rule was documented" is the start of the analysis, not the end; *(2)* artifact production vs. genuine analysis — a finding that could have been written without tracing the error has not been analyzed; a genuine finding names a specific root cause. `$A_SOCIETY_IMPROVEMENT` (MAINT): same subsection echoed after "Reflection Categories". Framework update report published at v17.6 (`2026-03-22-backward-pass-analysis-quality.md`), 1 Recommended. Backward pass pending. Record: `a-society/a-docs/records/20260322-backward-pass-quality-principles/`.

`[S][LIB][MAINT]` — **log-restructure** (2026-03-22): Tier 2 Framework Dev flow closed. Two structural improvements implemented. *(1) Archive split*: `$A_SOCIETY_LOG` archive section removed; companion `$A_SOCIETY_LOG_ARCHIVE` created at `a-society/a-docs/project-information/log-archive.md` with one-liner-per-flow format (immutable, most recent at top); registered in `$A_SOCIETY_INDEX`; `$A_SOCIETY_AGENT_DOCS_GUIDE` updated (log.md ownership line corrected; new log-archive.md entry added); `$INSTRUCTION_LOG` updated with two-file model, archive format spec, and archive-file creation step (LIB). *(2) Next Priorities merge assessment*: scan-before-file rule added — same target files/design area and compatible authority level triggers merge of existing item(s) into one; added to `$INSTRUCTION_LOG` (LIB), `$GENERAL_IMPROVEMENT` (LIB), `$GENERAL_OWNER_ROLE` (LIB), `$A_SOCIETY_IMPROVEMENT` (MAINT), and `$A_SOCIETY_OWNER_ROLE` (MAINT). Framework update report published at v17.5 (`2026-03-22-log-restructure.md`), 4 Recommended. Backward pass pending. Record: `a-society/a-docs/records/20260322-log-restructure/`.

---

## Next Priorities

`[S][LIB][MAINT]` — **Brief-writing and proposal quality: behavioral property consistency, write authority label, and topology waiver** — *(1)* `$GENERAL_OWNER_ROLE` Brief-Writing Quality (LIB): *(a)* add note that `[Curator authority — implement directly]` can designate write authority outside the receiving role's default scope when the Owner explicitly scopes it in the brief; the brief is the correct home for explicit designation; *(b)* add behavioral property consistency check — when specifying behavioral properties (ordering, mutability, timing), verify they are internally consistent before sending; a brief that seeds contradictory properties will have those contradictions reproduced downstream; *(c)* when a flow has no Proposal phase, the brief must explicitly state that no proposal artifact is required before implementation begins. Echo all three to `$A_SOCIETY_OWNER_ROLE` (MAINT). *(2)* `$GENERAL_CURATOR_ROLE` (LIB): *(a)* add proposal quality check — before submitting a proposal, verify that proposed output language does not contain contradictory behavioral properties; *(b)* add Approval Invariant topology check — if the workflow plan shows no Proposal node, the brief constitutes authorization; no proposal artifact is required. Echo both to `$A_SOCIETY_CURATOR_ROLE` (MAINT). Sources: `$A_SOCIETY_RECORDS/20260322-general-lib-sync-bundle/07-curator-synthesis.md` (item 1a); `$A_SOCIETY_RECORDS/20260322-log-restructure/06-owner-findings.md` (items 1b, 2); `$A_SOCIETY_RECORDS/20260322-backward-pass-quality-principles/06-owner-findings.md` (findings 1/3, 3).

`[M][MAINT]` — **Component 4 design advisory: prompt embedding and synthesis_role schema** — Two TA-scoped design problems to address in a combined advisory session. *(1) Prompt embedding*: scope Component 4 changes to embed role-specific instruction sets in generated prompts — meta-analysis instructions in findings-role prompts (referencing `### Meta-Analysis Phase` in `$GENERAL_IMPROVEMENT`), synthesis instructions in synthesis prompt (referencing `### Synthesis Phase`). After Component 4 update ships: remove any directive to load improvement docs upfront; update Curator required reading if applicable. Part 2 (documentation separation) completed in `bp-meta-synthesis-separation`. Source: post-synthesis observation, 2026-03-22 `general-lib-sync-bundle` session. *(2) Synthesis_role schema*: `synthesis_role` is a backward pass concept embedded in `workflow.md`, which is a forward pass path record. Fixing this requires: removing `synthesis_role` from the `workflow.md` schema, redesigning how Component 4 determines the synthesis role (e.g., derivation from the path itself, or a separate backward-pass descriptor), and updating `$A_SOCIETY_RECORDS`, `$A_SOCIETY_TOOLING_PROPOSAL`, and `$A_SOCIETY_TOOLING_INVOCATION`. Source: `a-society/a-docs/records/20260322-workflow-obligation-consolidation/07-owner-findings.md` (Finding 2). The two problems are related: how Component 4 identifies the synthesis role may constrain how synthesis-phase instructions are embedded. TA scoping required before either problem can be acted on.

`[S][LIB][MAINT]` — **workflow.md path completeness: LIB flows must include Registration step at intake** — `$A_SOCIETY_OWNER_ROLE` intake guidance (MAINT): add note that `[LIB]` flows have a predictable registration step (Curator → update report + version increment → Owner review) that must be included in `workflow.md` at intake; the LIB scope tag is the signal to add this loop. `$GENERAL_OWNER_ROLE` (LIB): if the general Owner role has equivalent intake guidance, add the same note in domain-agnostic form — any flow with a known post-implementation publication or registration step should include it in the path at intake. Sources: `$A_SOCIETY_RECORDS/20260322-backward-pass-quality-principles/06-owner-findings.md` (workflow.md omission finding); `$A_SOCIETY_RECORDS/20260322-bp-meta-synthesis-separation/09-owner-findings.md` (Finding 1, same gap re-instantiated).

---

Archived flows are recorded in `$A_SOCIETY_LOG_ARCHIVE`. One entry per flow. Entries are immutable once written. Most recent at top.
