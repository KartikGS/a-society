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

**Status:** Framework active at v17.5. `log-restructure` (Tier 2) split the archive out of the main log and added a Next Priorities merge assessment rule. Archive now lives in `$A_SOCIETY_LOG_ARCHIVE`; main log bounded to rolling window. Merge scan required before filing any Next Priorities item. Framework update report published at v17.5 (4 Recommended). Backward pass pending for `workflow-mechanics-corrections`, `next-priorities-bundle`, `graph-validator-human-collaborative`, `general-lib-sync-bundle`, and `log-restructure`.

**Recent Focus**

`[S][LIB][MAINT]` — **log-restructure** (2026-03-22): Tier 2 Framework Dev flow closed. Two structural improvements implemented. *(1) Archive split*: `$A_SOCIETY_LOG` archive section removed; companion `$A_SOCIETY_LOG_ARCHIVE` created at `a-society/a-docs/project-information/log-archive.md` with one-liner-per-flow format (immutable, most recent at top); registered in `$A_SOCIETY_INDEX`; `$A_SOCIETY_AGENT_DOCS_GUIDE` updated (log.md ownership line corrected; new log-archive.md entry added); `$INSTRUCTION_LOG` updated with two-file model, archive format spec, and archive-file creation step (LIB). *(2) Next Priorities merge assessment*: scan-before-file rule added — same target files/design area and compatible authority level triggers merge of existing item(s) into one; added to `$INSTRUCTION_LOG` (LIB), `$GENERAL_IMPROVEMENT` (LIB), `$GENERAL_OWNER_ROLE` (LIB), `$A_SOCIETY_IMPROVEMENT` (MAINT), and `$A_SOCIETY_OWNER_ROLE` (MAINT). Framework update report published at v17.5 (`2026-03-22-log-restructure.md`), 4 Recommended. Backward pass pending. Record: `a-society/a-docs/records/20260322-log-restructure/`.

**Previous**

`[S][LIB][MAINT]` — **general-lib-sync-bundle** (2026-03-22): Tier 2 Framework Dev flow closed. Six Next Priority items implemented. *(1)* `$INSTRUCTION_WORKFLOW_GRAPH` updated with `human-collaborative` optional node field in schema block and Field Definitions — closes instruction/tool parity gap with Component 3 (LIB). *(2)* `$INSTRUCTION_RECORDS` inspected for post-decision submission model parallel language — none found; item closes with no change. *(3)* Component 3 live-workflow compatibility test target corrected from `a-society/a-docs/workflow/main.md` (routing file, no frontmatter) to `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` (MAINT direct). *(4)* `$GENERAL_IMPROVEMENT` Guardrails updated: "approval is not completion" clarification appended to Forward pass closure boundary guardrail (LIB). *(5)* `$GENERAL_OWNER_ROLE` Brief-Writing Quality updated: obsoletes check paragraph added after output-format change requirements (LIB). *(6)* `$GENERAL_IMPROVEMENT` How It Works updated: synthesis closure statement added at end of step 5 (LIB). `$A_SOCIETY_TOOLING_COUPLING_MAP` Component 3 row updated to reflect instruction-parity gap closed (MAINT). Framework update report published at v17.4 (`2026-03-22-general-lib-sync-bundle.md`), 4 Recommended. Backward pass pending. Record: `$A_SOCIETY_RECORDS/20260322-general-lib-sync-bundle/`.

`[M][LIB][MAINT]` — **workflow-mechanics-corrections** (2026-03-21): Tier 2 Framework Dev flow closed. Four systemic mechanics fixes implemented. *(1) Log update timing*: full log write authority consolidated to Owner at Forward Pass Closure; Curator lifecycle-section authority removed from `$A_SOCIETY_CURATOR_ROLE`; `$A_SOCIETY_OWNER_ROLE` updated to name all log sections; `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phase 5 Work updated. *(2) Synthesis routing simplified*: `$A_SOCIETY_IMPROVEMENT` and `$A_SOCIETY_CURATOR_ROLE` updated — structural rule replaces split-authority model (a-docs/ → implement directly; outside a-docs/ → Next Priorities entry); `$GENERAL_IMPROVEMENT` updated as LIB (domain-agnostic formulation). *(3) Tool mandate strengthened*: explicit prohibition on manual backward pass ordering when Component 4 available added to `$A_SOCIETY_IMPROVEMENT` (MAINT) and `$GENERAL_IMPROVEMENT` (LIB). *(4) Update report integrated into proposal/implementation cycle*: `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phases 1–5 updated; `$A_SOCIETY_CURATOR_ROLE` update report bullet updated; `$A_SOCIETY_RECORDS` update-report-specific example and naming references removed; `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` restructured (new Update Report Draft section; Update Report Submission type removed; Implementation Status section removed). Framework update report published at v17.3 (`2026-03-21-workflow-mechanics-corrections.md`), 2 Recommended. Backward pass pending. Record: `$A_SOCIETY_RECORDS/20260321-workflow-mechanics-corrections/`.

`[S][MAINT]` — **graph-validator-human-collaborative** (2026-03-21): Tier 2 Tooling Dev flow closed. Added optional `human-collaborative` field to Component 3 (Workflow Graph Schema Validator): open-vocabulary non-empty string when present; five new tests added (14 passed, 1 pre-existing failure on incorrect test target). Registration: `$A_SOCIETY_TOOLING_INVOCATION` schema snippet updated; `$A_SOCIETY_TOOLING_COUPLING_MAP` Component 3 row expanded with validation behavior and instruction-parity follow-on noted. No framework update report (tooling and internal a-docs only). Two follow-on Next Priorities added: `$INSTRUCTION_WORKFLOW_GRAPH` sync gap `[S][LIB]`; Component 3 live-workflow test target fix `[S][MAINT]`. Backward pass: parallel-flow session tracking error flagged (Owner applied global role-resume rule instead of per-flow tracking — routed to synthesis); TA advisory confirmed model-level quality (positive); TA implementation review did not flag pre-existing incorrect test file target (scope item for synthesis). Record: `$A_SOCIETY_RECORDS/20260321-graph-validator-human-collaborative/`.

---

## Next Priorities

`[S][LIB][MAINT]` — **Brief-writing and proposal quality: behavioral property consistency and write authority label** — *(1)* `$GENERAL_OWNER_ROLE` Brief-Writing Quality (LIB): *(a)* add note that `[Curator authority — implement directly]` can designate write authority outside the receiving role's default scope when the Owner explicitly scopes it in the brief; the brief is the correct home for explicit designation; *(b)* add behavioral property consistency check — when specifying behavioral properties (ordering, mutability, timing), verify they are internally consistent before sending; a brief that seeds contradictory properties will have those contradictions reproduced downstream. Echo both to `$A_SOCIETY_OWNER_ROLE` (MAINT). *(2)* `$GENERAL_CURATOR_ROLE` (LIB): add proposal quality check — before submitting a proposal, verify that proposed output language does not contain contradictory behavioral properties. Sources: `$A_SOCIETY_RECORDS/20260322-general-lib-sync-bundle/07-curator-synthesis.md` (item 1a); `$A_SOCIETY_RECORDS/20260322-log-restructure/06-owner-findings.md` (items 1b, 2).

`[S][LIB][MAINT]` — **Workflow obligation consolidation: forward pass closure, synthesis closure rule, and current-flow scoping** — *(1)* `$A_SOCIETY_WORKFLOW` (MAINT): add forward pass closure as a distinct, explicit step consolidating all closure obligations (log update, Component 4 invocation) before the backward pass begins. `$INSTRUCTION_WORKFLOW` (LIB): same principle in domain-agnostic form. *(2)* `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Step 6 (MAINT): remove the conditional "or whether another Owner session is required" — synthesis always closes the flow; anything requiring Owner follow-up goes to Next Priorities, not back into the current flow. `$INSTRUCTION_WORKFLOW` (LIB): add same principle in domain-agnostic form. *(3)* `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` forward pass closure step (MAINT): add explicit rule — at forward pass closure, backward pass initiation is scoped to the current flow only; other flows' backward pass status is not referenced. `$INSTRUCTION_WORKFLOW` (LIB): add same rule in domain-agnostic form. Sources: `$A_SOCIETY_RECORDS/20260322-general-lib-sync-bundle/07-curator-synthesis.md` (items 1, 2); `$A_SOCIETY_RECORDS/20260322-log-restructure/06-owner-findings.md` (item 3).

`[S][LIB][MAINT]` — **Backward pass quality: externally-caught errors and artifact vs. genuine analysis** — `$GENERAL_IMPROVEMENT` (LIB): add two principles: *(1)* externally-caught errors are higher priority — "the rule was documented" is the start of the analysis, not the end; *(2)* artifact production vs. genuine analysis — a finding that could have been written without tracing the error has not been analyzed. Echo both to `$A_SOCIETY_IMPROVEMENT` (MAINT). Source: `$A_SOCIETY_RECORDS/20260322-general-lib-sync-bundle/07-curator-synthesis.md`

`[M][LIB][MAINT]` — **Backward pass instructions delivered by Component 4, not pre-loaded; separate meta-analysis from synthesis** — *(1)* Remove backward pass instructions from required reading — agents doing forward pass work should not carry this context. Backward pass instructions should be delivered just-in-time via Component 4 trigger prompts: meta-analysis instructions in findings-role prompts, synthesis instructions in the Curator synthesis prompt. *(2)* Separate meta-analysis instructions from synthesis instructions in `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` — they are distinct operations currently conflated in one document. *(3)* Update Component 4 prompt generation to carry the relevant instruction set per role. *(4)* Update Curator required reading to remove `$A_SOCIETY_IMPROVEMENT` as an upfront load. Scoping for Component 4 changes requires TA input. Source: post-synthesis observation, 2026-03-22 `general-lib-sync-bundle` session.

---

Archived flows are recorded in `$A_SOCIETY_LOG_ARCHIVE`. One entry per flow. Entries are immutable once written. Most recent at top.
