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

**Status:** Framework active at v2.1. Feedback consent infrastructure fully wired. Four flows completed 2026-03-11; two small backlog items pending.

**Recent Focus**

`[L][LIB][MAINT]` — **Feedback consent infrastructure + session improvements** (2026-03-11): Four flows across one session.

*(1) Feedback consent infrastructure* `[L][LIB]` — Wired end-to-end at v2.0. New curator-signal feedback template (`$GENERAL_FEEDBACK_CURATOR_SIGNAL_TEMPLATE`). Public index: fixed stale `$ONBOARDING_SIGNAL_TEMPLATE` path, registered all feedback variables. Curator template: migration feedback step added to Version-Aware Migration (step 6), curator-signal feedback step added to Pattern Distillation. Initializer Phase 5 restructured: owns all three consent conversations with educational context; consent files now registered in project index (v2.1 fix). `$INSTRUCTION_CONSENT` table corrected to Initializer ownership. Update reports: v2.0 (Breaking), v2.1 (Recommended). Records: `$A_SOCIETY_RECORDS/20260311-feedback-consent-infrastructure/`, `$A_SOCIETY_RECORDS/20260311-initializer-consent-registration/`.

*(2) Protocol and template improvements* `[MAINT]` — Five backward-pass learnings codified. Breaking classification in `$A_SOCIETY_UPDATES_PROTOCOL` extended with additive-gap example. `$A_SOCIETY_COMM_TEMPLATE_BRIEF` hardened: ownership-transfer callout and "None" signal note added. Records convention pre-check added. Public index "Onboarding Signal" section consolidated into Feedback. No update report (all `a-docs/`-internal). Record: `$A_SOCIETY_RECORDS/20260311-protocol-and-template-improvements/`.

*(3) Decision template and Owner role* `[MAINT]` — Decision template gains "If APPROVED — Follow-Up Actions" section (update report assessment, backward pass, version increment). Owner role gains "Brief-Writing Quality" section (fully-specified brief technique). No update report. Record: `$A_SOCIETY_RECORDS/20260311-decision-template-improvements/`.

**Previous**

- `[S][MAINT]` — **Retire `todo/` folder — superseded by project log** (2026-03-10): Removed `a-docs/todo/` and its two completed artifacts, deleted both retired index variables from `$A_SOCIETY_INDEX`, removed the retired `todo/` rationale section from `$A_SOCIETY_AGENT_DOCS_GUIDE`, and cleared the remaining stale prose reference to `todo files` from the log rationale entry in the same guide. Backward pass reinforced Priority 1 (Variable retirement protocol): retirements need an active-docs scan for both `$VARIABLE` and prose references to the retired concept. Record: `$A_SOCIETY_RECORDS/20260310-retire-todo-folder/`.
- `[M][MAINT]` — **Briefing pre-approval language and Approval Invariant timing** (2026-03-10): Closed the gap that allowed a briefing to be read as implementation authorization. Four targeted changes: extended Approval Invariant 2 in `$A_SOCIETY_WORKFLOW` with timing and artifact-form requirement; added Phase 1 Input clarification that a briefing establishes scope/direction only; added authorization-scope note block to `$A_SOCIETY_COMM_TEMPLATE_BRIEF`; added implementation-authorization limit to the Owner → Curator section of `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`. Record: `$A_SOCIETY_RECORDS/20260310-briefing-preapproval/`.
- `[S][MAINT]` — **Curator maintenance bundle** (2026-03-10): Closed three Curator-authority items. (1) Priority 6 — fixes already applied in a prior session; log entry closed. (2) Flow B — added Submission Requirements section to `$A_SOCIETY_UPDATES_PROTOCOL`; added Implementation Status section to `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`; updated mandatory field list in `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`. (3) Flow C — added explicit within-flow sequencing rule to `$A_SOCIETY_RECORDS` and `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`.

---

## Next Priorities

1. `[M][LIB]` — **Variable retirement protocol** — Add a "Variable Retirement" section to `$INSTRUCTION_INDEX`: the inverse of Index-Before-Reference — grep all consumers first, update or remove each reference, then remove the variable from the index. The protocol should also require a post-removal scan of active docs for both the retired `$VARIABLE` and prose references to the retired concept name. Structural gap affecting any flow that retires content. Source: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/`, `$A_SOCIETY_RECORDS/20260310-retire-todo-folder/`. *Requires Owner briefing to enter Phase 1.*

2. `[S]` — **Retirement scope in briefings** — When a briefing includes "retire a folder," scope should automatically include verifying and cleaning stale entries in `$A_SOCIETY_AGENT_DOCS_GUIDE`. May fold into Priority 1. Source: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/`, `$A_SOCIETY_RECORDS/20260310-retire-todo-folder/`. *Requires Owner briefing; may fold into Priority 1.*

3. `[S][MAINT]` — **Template header scope** — `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER` header says "do not modify this file" but doesn't say "omit from instantiated artifacts." One-line fix. Batch-eligible with any next minor template change. Source: `$A_SOCIETY_RECORDS/20260311-decision-template-improvements/`.

4. `[S]` — **No-update-report convention** — The decision template's Follow-Up Actions section prompts update report assessment but gives no convention for when the answer is "no" (create a submission artifact to record the determination, or note in backward pass only). Deferred pending pattern confirmation across more flows. Source: `$A_SOCIETY_RECORDS/20260311-decision-template-improvements/`.

---

## Archive

- `[L][LIB]` — **Handoff protocol and workflow-default routing** (2026-03-08): Made workflow routing the default Owner entry path, added mandatory `Handoff Output` guidance to the role-document standard, updated the Owner and Curator role implementations, clarified A-Society's session model, and published the Breaking framework update report `2026-03-08-handoff-protocol-routing.md`. Record: `$A_SOCIETY_RECORDS/20260308-handoff-protocol/`.
- `[S]` — **A-docs-guide rename** (2026-03-08): Renamed `agent-docs-guide.md` → `a-docs-guide.md` to align with A-Society's established naming convention. Updated all references and index variable. Record: `$A_SOCIETY_RECORDS/20260308-a-docs-guide-rename/`.
- `[M]` — **Records infrastructure** (2026-03-08): Established flow-level artifact tracking under `a-docs/records/`. Defined identifier format (`YYYYMMDD-slug`), artifact sequence, and placement rules. Retired `improvement/reports/` folder and four associated index variables. Record: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/`.
- `[M][LIB]` — **Owner as universal session entry point** (2026-03-08): Added workflow routing responsibility and post-confirmation protocol to the Owner role in `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE`. Establishes the Owner as the default entry point for all project sessions. Framework update report: Recommended.
- `[L][LIB]` — **Graph-based workflow model** (2026-03-07): Extended the framework's single-thread workflow assumption to a full graph model supporting nodes, edges, instances, branching, and multi-graph projects. Six files updated in `general/instructions/`. Backwards compatible — single-thread projects unchanged. Framework update report: Recommended.
