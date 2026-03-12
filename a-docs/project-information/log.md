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
- When a fourth `Previous` entry would be added, the oldest moves to `## Archive`.
- Entries are added when a flow closes (Owner signs off, or Curator completes Curator-authority work). Entries are not modified after archival.

---

## Current State

**Status:** Framework active at v4.1. Initializer output hardened: two absolute-path self-review checks added to Phase 4 (role table paths and Phase 5 agents.md pointer); Phase 5 step 1 duplicate statement removed; relative path reminder added to step 2; adversity log filing instruction added inside `Consented: Yes` block; `$ONBOARDING_SIGNAL_TEMPLATE` Patterns Observed contradiction guard added. Variable retirement protocol added to `$INSTRUCTION_INDEX` — five-step sequence covering consumer grep, reference cleanup, guide-doc check, index-row removal, and post-removal prose scan (Recommended, v4.1). thinking/ folder required initialization artifact (Breaking, v4.0). Classification pre-specification prohibition added to Owner role and briefing template. Template header omit-instruction and Curator cross-layer consistency check added (Curator-authority MAINT).

**Recent Focus**

`[S]` — **Initializer output hardening** (2026-03-12): Three priorities closed (2, 3, and 4). Phase 4 self-review extended with two absolute-path checks (role table paths and Phase 5 agents.md pointer). Phase 5 step 1 duplicate completion statement removed; step 2 relative path reminder added. Adversity log filing instruction added inside the `Consented: Yes` block. `$ONBOARDING_SIGNAL_TEMPLATE` Patterns Observed section hardened with contradiction guard. No update report — all changes internal to `$A_SOCIETY_INITIALIZER_ROLE` and `$ONBOARDING_SIGNAL_TEMPLATE`. Record: `$A_SOCIETY_RECORDS/20260312-initializer-output-hardening/`.

**Previous**

`[M][LIB]` — **Variable retirement protocol + retirement scope in briefings** (2026-03-11): Two priorities closed (1 and 2). Variable Retirement section added to `$INSTRUCTION_INDEX`: five-step sequence (consumer grep → reference cleanup → guide-doc check → index-row removal → post-removal prose scan). Invariant 4 in `$A_SOCIETY_WORKFLOW` updated to name the retirement protocol as Invariant 4's counterpart. Recommended update report published at v4.1. Priority 2 (retirement scope in briefings) resolved cleanly as Step 3 of the sequence — no separate flow needed. Record: `$A_SOCIETY_RECORDS/20260311-variable-retirement-protocol/`.

- `[S][MAINT]` — **Curator maintenance bundle — template headers and cross-layer check** (2026-03-11): Two Curator-authority items closed. *(1) Template header scope* — Added "omit this header when instantiating" instruction to all three conversation templates. The brief template fix reads "omit all header blocks above the first `---`." No update report — a-docs/-only change. *(2) Self-consistency Curator practice* — Added "Standing Checks" section to `$A_SOCIETY_CURATOR_ROLE`: cross-layer consistency check requiring the Curator to verify `general/instructions/` and corresponding `a-docs/` artifacts align whenever working in either layer. No update report — a-docs/-only change. Record: `$A_SOCIETY_RECORDS/20260311-curator-maint-template-and-crosslayer/`.
- `[M][LIB][MAINT]` — **thinking/ required + classification prohibition** (2026-03-11): Two flows. *(1) thinking/ folder required at initialization* `[M][LIB]` — `$INSTRUCTION_THINKING` deferral path removed; thinking/ inserted as step 5 in Initializer Phase 3; Handoff Criteria updated; thinking/ rationale entry added to `$A_SOCIETY_AGENT_DOCS_GUIDE`. Breaking update report published at v4.0. Record: `$A_SOCIETY_RECORDS/20260311-thinking-folder-required/`. *(2) Classification pre-specification prohibition* `[S][MAINT]` — Owner role Brief-Writing Quality section extended: prohibition on pre-specifying update report classification in briefs or approval rationale. Reinforcing note added to `$A_SOCIETY_COMM_TEMPLATE_BRIEF`. No update report — a-docs/-only change. Record: `$A_SOCIETY_RECORDS/20260311-classification-prespec-prohibition/`.

---

## Next Priorities

1. `[S]` — **No-update-report convention** — The decision template's Follow-Up Actions section prompts update report assessment but gives no convention for when the answer is "no" (create a submission artifact to record the determination, or note in backward pass only). Deferred pending pattern confirmation across more flows. Source: `$A_SOCIETY_RECORDS/20260311-decision-template-improvements/`.

2. `[S][ADR]` — **Streamlined backward-pass entry path** — When Owner findings in a completed flow name the target file(s) and fix type, and Curator findings are aligned, the brief step adds no information. Formalize a four-condition exception in `$A_SOCIETY_WORKFLOW`. Condition gate specified in `$A_SOCIETY_RECORDS/20260311-classification-prespec-prohibition/04-owner-findings.md`. Source: `$A_SOCIETY_RECORDS/20260311-classification-prespec-prohibition/`. *Requires Owner briefing to enter Phase 1.*

3. `[S][ADR]` — **Project log write responsibility undeclared** — Neither the Owner role nor the Curator role specifies who writes to the log. Direction decision needed: options are Curator-maintains / Owner-authorizes-priorities, or one role owns outright. Source: `$A_SOCIETY_RECORDS/20260311-classification-prespec-prohibition/`. *Requires Owner briefing to enter Phase 1.*

---

## Archive

- `[M][LIB][MAINT]` — **Initializer hardening — Phase 5 consent + quality gaps** (2026-03-11): Two flows from a test run of the Initializer against a seed-file project. (1) Phase 5 consent protocol hardening `[MAINT]` — Closed the consent bypass vulnerability: sequencing header added at the top of the Feedback Consent block; per-block wait pre-conditions added to all three consent conversations; report filing gate added to the onboarding signal block; "Consent verified" in Handoff Criteria redefined to require in-session human response (not file existence). No update report — Initializer behavior fix does not create gaps in existing a-docs. Record: `$A_SOCIETY_RECORDS/20260311-initializer-phase5-consent/`. (2) Initializer quality hardening `[M][LIB]` — Four gaps fixed across `$A_SOCIETY_INITIALIZER_ROLE` and `$INSTRUCTION_AGENTS`. Hard Rules: shell and version control prohibition added. Phase 2: scope boundary clarified. Phase 4: design-decision disclosure check added. `$INSTRUCTION_AGENTS`: reading order corrected; authority hierarchy specified. Framework update report: Breaking + Recommended → v3.0. Record: `$A_SOCIETY_RECORDS/20260311-initializer-quality-hardening/`.
- `[L][LIB][MAINT]` — **Feedback consent infrastructure + session improvements** (2026-03-11): Four flows across one session. (1) Feedback consent infrastructure wired end-to-end at v2.0; curator-signal template added; public index consolidated; Initializer Phase 5 restructured; update reports at v2.0 and v2.1. (2) Protocol and template improvements: five backward-pass learnings codified; Breaking classification extended; brief template hardened. (3) Decision template and Owner role: Follow-Up Actions section and Brief-Writing Quality section added. Records: `$A_SOCIETY_RECORDS/20260311-feedback-consent-infrastructure/`, `$A_SOCIETY_RECORDS/20260311-initializer-consent-registration/`, `$A_SOCIETY_RECORDS/20260311-protocol-and-template-improvements/`, `$A_SOCIETY_RECORDS/20260311-decision-template-improvements/`.
- `[S][MAINT]` — **Retire `todo/` folder — superseded by project log** (2026-03-10): Removed `a-docs/todo/` and its two completed artifacts, deleted both retired index variables from `$A_SOCIETY_INDEX`, removed the retired `todo/` rationale section from `$A_SOCIETY_AGENT_DOCS_GUIDE`, and cleared the remaining stale prose reference to `todo files` from the log rationale entry in the same guide. Backward pass reinforced Priority 1 (Variable retirement protocol): retirements need an active-docs scan for both `$VARIABLE` and prose references to the retired concept. Record: `$A_SOCIETY_RECORDS/20260310-retire-todo-folder/`.
- `[M][MAINT]` — **Briefing pre-approval language and Approval Invariant timing** (2026-03-10): Closed the gap that allowed a briefing to be read as implementation authorization. Four targeted changes: extended Approval Invariant 2 in `$A_SOCIETY_WORKFLOW` with timing and artifact-form requirement; added Phase 1 Input clarification that a briefing establishes scope/direction only; added authorization-scope note block to `$A_SOCIETY_COMM_TEMPLATE_BRIEF`; added implementation-authorization limit to the Owner → Curator section of `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`. Record: `$A_SOCIETY_RECORDS/20260310-briefing-preapproval/`.
- `[S][MAINT]` — **Curator maintenance bundle** (2026-03-10): Closed three Curator-authority items. (1) Priority 6 — fixes already applied in a prior session; log entry closed. (2) Flow B — added Submission Requirements section to `$A_SOCIETY_UPDATES_PROTOCOL`; added Implementation Status section to `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`; updated mandatory field list in `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`. (3) Flow C — added explicit within-flow sequencing rule to `$A_SOCIETY_RECORDS` and `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`.
- `[L][LIB]` — **Handoff protocol and workflow-default routing** (2026-03-08): Made workflow routing the default Owner entry path, added mandatory `Handoff Output` guidance to the role-document standard, updated the Owner and Curator role implementations, clarified A-Society's session model, and published the Breaking framework update report `2026-03-08-handoff-protocol-routing.md`. Record: `$A_SOCIETY_RECORDS/20260308-handoff-protocol/`.
- `[S]` — **A-docs-guide rename** (2026-03-08): Renamed `agent-docs-guide.md` → `a-docs-guide.md` to align with A-Society's established naming convention. Updated all references and index variable. Record: `$A_SOCIETY_RECORDS/20260308-a-docs-guide-rename/`.
- `[M]` — **Records infrastructure** (2026-03-08): Established flow-level artifact tracking under `a-docs/records/`. Defined identifier format (`YYYYMMDD-slug`), artifact sequence, and placement rules. Retired `improvement/reports/` folder and four associated index variables. Record: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/`.
- `[M][LIB]` — **Owner as universal session entry point** (2026-03-08): Added workflow routing responsibility and post-confirmation protocol to the Owner role in `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE`. Establishes the Owner as the default entry point for all project sessions. Framework update report: Recommended.
- `[L][LIB]` — **Graph-based workflow model** (2026-03-07): Extended the framework's single-thread workflow assumption to a full graph model supporting nodes, edges, instances, branching, and multi-graph projects. Six files updated in `general/instructions/`. Backwards compatible — single-thread projects unchanged. Framework update report: Recommended.
