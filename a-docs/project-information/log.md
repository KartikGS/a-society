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

**Status:** Framework active at v3.0. Initializer hardened — Phase 5 consent protocol closed and quality gaps fixed. Framework update report published: agents.md reading order (Breaking) and authority hierarchy (Recommended).

**Recent Focus**

`[M][LIB][MAINT]` — **Initializer hardening — Phase 5 consent + quality gaps** (2026-03-11): Two flows from a test run of the Initializer against a seed-file project.

*(1) Phase 5 consent protocol hardening* `[MAINT]` — Closed the consent bypass vulnerability: sequencing header added at the top of the Feedback Consent block; per-block wait pre-conditions added to all three consent conversations; report filing gate added to the onboarding signal block; "Consent verified" in Handoff Criteria redefined to require in-session human response (not file existence). No update report — Initializer behavior fix does not create gaps in existing a-docs. Record: `$A_SOCIETY_RECORDS/20260311-initializer-phase5-consent/`.

*(2) Initializer quality hardening* `[M][LIB]` — Four gaps fixed across `$A_SOCIETY_INITIALIZER_ROLE` and `$INSTRUCTION_AGENTS`. Hard Rules: shell and version control prohibition added. Phase 2: scope boundary clarified — questions are for understanding human intent, not offering design decisions. Phase 4: design-decision disclosure check added to self-review. `$INSTRUCTION_AGENTS`: reading order corrected (index second, before vision and structure); authority hierarchy now specified (vision → structure → role → agents.md). Framework update report: Breaking (reading order) + Recommended (authority hierarchy) → v3.0. Record: `$A_SOCIETY_RECORDS/20260311-initializer-quality-hardening/`.

**Previous**

- `[L][LIB][MAINT]` — **Feedback consent infrastructure + session improvements** (2026-03-11): Four flows across one session. (1) Feedback consent infrastructure wired end-to-end at v2.0; curator-signal template added; public index consolidated; Initializer Phase 5 restructured; update reports at v2.0 and v2.1. (2) Protocol and template improvements: five backward-pass learnings codified; Breaking classification extended; brief template hardened. (3) Decision template and Owner role: Follow-Up Actions section and Brief-Writing Quality section added. Records: `$A_SOCIETY_RECORDS/20260311-feedback-consent-infrastructure/`, `$A_SOCIETY_RECORDS/20260311-initializer-consent-registration/`, `$A_SOCIETY_RECORDS/20260311-protocol-and-template-improvements/`, `$A_SOCIETY_RECORDS/20260311-decision-template-improvements/`.
- `[S][MAINT]` — **Retire `todo/` folder — superseded by project log** (2026-03-10): Removed `a-docs/todo/` and its two completed artifacts, deleted both retired index variables from `$A_SOCIETY_INDEX`, removed the retired `todo/` rationale section from `$A_SOCIETY_AGENT_DOCS_GUIDE`, and cleared the remaining stale prose reference to `todo files` from the log rationale entry in the same guide. Backward pass reinforced Priority 1 (Variable retirement protocol): retirements need an active-docs scan for both `$VARIABLE` and prose references to the retired concept. Record: `$A_SOCIETY_RECORDS/20260310-retire-todo-folder/`.
- `[M][MAINT]` — **Briefing pre-approval language and Approval Invariant timing** (2026-03-10): Closed the gap that allowed a briefing to be read as implementation authorization. Four targeted changes: extended Approval Invariant 2 in `$A_SOCIETY_WORKFLOW` with timing and artifact-form requirement; added Phase 1 Input clarification that a briefing establishes scope/direction only; added authorization-scope note block to `$A_SOCIETY_COMM_TEMPLATE_BRIEF`; added implementation-authorization limit to the Owner → Curator section of `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`. Record: `$A_SOCIETY_RECORDS/20260310-briefing-preapproval/`.

---

## Next Priorities

1. `[M][LIB]` — **Variable retirement protocol** — Add a "Variable Retirement" section to `$INSTRUCTION_INDEX`: the inverse of Index-Before-Reference — grep all consumers first, update or remove each reference, then remove the variable from the index. The protocol should also require a post-removal scan of active docs for both the retired `$VARIABLE` and prose references to the retired concept name. Structural gap affecting any flow that retires content. Source: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/`, `$A_SOCIETY_RECORDS/20260310-retire-todo-folder/`. *Requires Owner briefing to enter Phase 1.*

2. `[S]` — **Retirement scope in briefings** — When a briefing includes "retire a folder," scope should automatically include verifying and cleaning stale entries in `$A_SOCIETY_AGENT_DOCS_GUIDE`. May fold into Priority 1. Source: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/`, `$A_SOCIETY_RECORDS/20260310-retire-todo-folder/`. *Requires Owner briefing; may fold into Priority 1.*

3. `[S][MAINT]` — **Template header scope** — `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` header says "do not modify this file" but doesn't say "omit from instantiated artifacts." One-line fix. Batch-eligible with any next minor template change. Source: `$A_SOCIETY_RECORDS/20260311-decision-template-improvements/`.

4. `[S]` — **No-update-report convention** — The decision template's Follow-Up Actions section prompts update report assessment but gives no convention for when the answer is "no" (create a submission artifact to record the determination, or note in backward pass only). Deferred pending pattern confirmation across more flows. Source: `$A_SOCIETY_RECORDS/20260311-decision-template-improvements/`.

5. `[S][MAINT]` — **Self-consistency Curator practice** — Add a standing check to the Curator role document: when working in `general/instructions/`, verify the corresponding A-Society `a-docs/` artifact aligns, and vice versa. Surfaced from backward pass finding that `$INSTRUCTION_AGENTS` specified the wrong reading order while A-Society's own `agents.md` had the correct one. Source: `$A_SOCIETY_RECORDS/20260311-initializer-quality-hardening/`. *Curator-authority; no Owner briefing needed.*

6. `[S]` — **Hardcoded paths in Initializer output** — Phase 4 self-review check ("Are all cross-references using `$VARIABLE_NAME`?") does not catch: (a) absolute paths in the roles table of agents.md — role file paths should use `$VAR` references, not hardcoded filesystem paths; (b) the absolute path used in the Phase 5 onboarding prompt — the agents.md pointer should be a relative path, not machine-specific. Needs explicit guidance in Phase 4 self-review covering role table paths, and a note in Phase 5 to use a relative path for the agents.md pointer. Batch-eligible with item 7. Source: promo-agency test run (second). *Requires Owner briefing.*

7. `[S]` — **Onboarding signal report quality gaps** — Two gaps in how the report is produced: (1) Phase 4 invented design decisions are not prompted as adversity log entries — the Initializer surfaced these correctly in the Phase 4 review but did not carry them into the adversity log, which is exactly where they belong; (2) the patterns section has no guard against "None observed" entries that immediately contain an observation — the format allows self-contradictory entries. Either the report template or Initializer Phase 5 guidance needs strengthening on both points. Batch-eligible with item 6. Source: promo-agency test run (second). *Requires Owner briefing.*

8. `[S]` — **Duplicate completion statement in Phase 5** — "Initialization complete. This project's `a-docs/` is live." is stated at the start of Phase 5 (step 1) and again at the end (Handoff Criteria). Both are specified in the protocol, but they stack as a confusing repeat for real users. The two statements serve different purposes (orientation vs. formal close) but should be consolidated or sequenced so the fuller Handoff Criteria statement appears only once, at the end. Source: promo-agency test run (second). *Requires Owner briefing.*

---

## Archive

- `[S][MAINT]` — **Curator maintenance bundle** (2026-03-10): Closed three Curator-authority items. (1) Priority 6 — fixes already applied in a prior session; log entry closed. (2) Flow B — added Submission Requirements section to `$A_SOCIETY_UPDATES_PROTOCOL`; added Implementation Status section to `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`; updated mandatory field list in `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`. (3) Flow C — added explicit within-flow sequencing rule to `$A_SOCIETY_RECORDS` and `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`.
- `[L][LIB]` — **Handoff protocol and workflow-default routing** (2026-03-08): Made workflow routing the default Owner entry path, added mandatory `Handoff Output` guidance to the role-document standard, updated the Owner and Curator role implementations, clarified A-Society's session model, and published the Breaking framework update report `2026-03-08-handoff-protocol-routing.md`. Record: `$A_SOCIETY_RECORDS/20260308-handoff-protocol/`.
- `[S]` — **A-docs-guide rename** (2026-03-08): Renamed `agent-docs-guide.md` → `a-docs-guide.md` to align with A-Society's established naming convention. Updated all references and index variable. Record: `$A_SOCIETY_RECORDS/20260308-a-docs-guide-rename/`.
- `[M]` — **Records infrastructure** (2026-03-08): Established flow-level artifact tracking under `a-docs/records/`. Defined identifier format (`YYYYMMDD-slug`), artifact sequence, and placement rules. Retired `improvement/reports/` folder and four associated index variables. Record: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/`.
- `[M][LIB]` — **Owner as universal session entry point** (2026-03-08): Added workflow routing responsibility and post-confirmation protocol to the Owner role in `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE`. Establishes the Owner as the default entry point for all project sessions. Framework update report: Recommended.
- `[L][LIB]` — **Graph-based workflow model** (2026-03-07): Extended the framework's single-thread workflow assumption to a full graph model supporting nodes, edges, instances, branching, and multi-graph projects. Six files updated in `general/instructions/`. Backwards compatible — single-thread projects unchanged. Framework update report: Recommended.
