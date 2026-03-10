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

**Status:** Framework active — all Curator-authority maintenance complete; two remaining priorities require Owner briefing.

**Recent Focus**

`[M][MAINT]` — **Briefing pre-approval language and Approval Invariant timing** (2026-03-10): Closed the gap that allowed a briefing to be read as implementation authorization. Four targeted changes: extended Approval Invariant 2 in `$A_SOCIETY_WORKFLOW` with timing and artifact-form requirement; added Phase 1 Input clarification that a briefing establishes scope/direction only; added authorization-scope note block to `$A_SOCIETY_COMM_TEMPLATE_BRIEF`; added implementation-authorization limit to the Owner → Curator section of `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`. Backward pass surfaced one deferred observation (authorization-scope note absent from instances — verify at next briefing use). Record: `$A_SOCIETY_RECORDS/20260310-briefing-preapproval/`.

**Previous**

- `[S][MAINT]` — **Curator maintenance bundle** (2026-03-10): Closed three Curator-authority items. (1) Priority 6 — both `$A_SOCIETY_AGENT_DOCS_GUIDE` and `$GENERAL_IMPROVEMENT_PROTOCOL` fixes already applied in a prior session; log entry closed. (2) Flow B — added Submission Requirements section to `$A_SOCIETY_UPDATES_PROTOCOL`; added Implementation Status section to `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`; updated mandatory field list in `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`. (3) Flow C — added explicit within-flow sequencing rule for additional submissions to `$A_SOCIETY_RECORDS` and `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`.
- `[L][LIB]` — **Handoff protocol and workflow-default routing** (2026-03-08): Made workflow routing the default Owner entry path, added mandatory `Handoff Output` guidance to the role-document standard, updated the Owner and Curator role implementations, clarified A-Society's session model, and published the Breaking framework update report `2026-03-08-handoff-protocol-routing.md`. Backward pass surfaced three follow-up flows: briefing pre-approval vs. Phase 2 approval timing, implementation status in update report submissions, and explicit within-flow sequencing for extra submissions. Record: `$A_SOCIETY_RECORDS/20260308-handoff-protocol/`.
- `[S]` — **A-docs-guide rename** (2026-03-08): Renamed `agent-docs-guide.md` → `a-docs-guide.md` to align with A-Society's established naming convention. Updated all references and index variable. Backward pass surfaced four findings: two handled inline (stale agent-docs-guide entry, CUSTOMIZE banner gap), two escalated as proposed flows (Flow A and Flow B — see Next Priorities). Record: `$A_SOCIETY_RECORDS/20260308-a-docs-guide-rename/`.

---

## Next Priorities

1. `[M][LIB]` — **Variable retirement protocol** — Add a "Variable Retirement" section to `$INSTRUCTION_INDEX`: the inverse of Index-Before-Reference — grep all consumers first, update or remove each reference, then remove the variable from the index. Structural gap affecting any flow that retires content. Source: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/04-curator-findings.md` (Finding 2) and `05-owner-findings.md` (Finding 3). *Requires Owner briefing to enter Phase 1.*

2. `[S]` — **Retirement scope in briefings** — When a briefing includes "retire a folder," scope should automatically include verifying and cleaning stale entries in `$A_SOCIETY_AGENT_DOCS_GUIDE`. Target: `$A_SOCIETY_WORKFLOW` Phase 4 or `$INSTRUCTION_AGENT_DOCS_GUIDE`; may fold into Priority 1 flow. Source: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/05-owner-findings.md` (Finding 2). *Requires Owner briefing; may fold into Priority 1.*

---

## Archive

- `[M]` — **Records infrastructure** (2026-03-08): Established flow-level artifact tracking under `a-docs/records/`. Defined identifier format (`YYYYMMDD-slug`), artifact sequence, and placement rules. Retired `improvement/reports/` folder and four associated index variables. Backward pass surfaced variable retirement protocol gap and retirement-scope-in-briefings gap (see Next Priorities). Record: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/`.
- `[M][LIB]` — **Owner as universal session entry point** (2026-03-08): Added workflow routing responsibility and post-confirmation protocol to the Owner role in `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE`. Establishes the Owner as the default entry point for all project sessions. Framework update report: Recommended.
- `[L][LIB]` — **Graph-based workflow model** (2026-03-07): Extended the framework's single-thread workflow assumption to a full graph model supporting nodes, edges, instances, branching, and multi-graph projects. Six files updated in `general/instructions/`. Backwards compatible — single-thread projects unchanged. Framework update report: Recommended.
