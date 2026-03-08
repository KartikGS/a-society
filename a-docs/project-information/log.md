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

**Status:** Framework active — handoff and session-routing structure established; next priorities focus on approval semantics, submission completeness, and records clarity.

**Recent Focus**

`[L][LIB]` — **Handoff protocol and workflow-default routing** (2026-03-08): Made workflow routing the default Owner entry path, added mandatory `Handoff Output` guidance to the role-document standard, updated the Owner and Curator role implementations, clarified A-Society's session model, and published the Breaking framework update report `2026-03-08-handoff-protocol-routing.md`. Backward pass surfaced three follow-up flows: briefing pre-approval vs. Phase 2 approval timing, implementation status in update report submissions, and explicit within-flow sequencing for extra submissions. Record: `$A_SOCIETY_RECORDS/20260308-handoff-protocol/`.

**Previous**

- `[S]` — **A-docs-guide rename** (2026-03-08): Renamed `agent-docs-guide.md` → `a-docs-guide.md` to align with A-Society's established naming convention. Updated all references and index variable. Backward pass surfaced four findings: two handled inline (stale agent-docs-guide entry, CUSTOMIZE banner gap), two escalated as proposed flows (Flow A and Flow B — see Next Priorities). Record: `$A_SOCIETY_RECORDS/20260308-a-docs-guide-rename/`.
- `[M]` — **Records infrastructure** (2026-03-08): Established flow-level artifact tracking under `a-docs/records/`. Defined identifier format (`YYYYMMDD-slug`), artifact sequence, and placement rules. Retired `improvement/reports/` folder and four associated index variables. Backward pass surfaced variable retirement protocol gap and retirement-scope-in-briefings gap (see Next Priorities). Record: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/`.
- `[M][LIB]` — **Owner as universal session entry point** (2026-03-08): Added workflow routing responsibility and post-confirmation protocol to the Owner role in `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE`. Establishes the Owner as the default entry point for all project sessions. Framework update report: Recommended.

---

## Next Priorities

1. `[M][MAINT]` — **Flow A: Briefing pre-approval language and Approval Invariant timing** — Clarify that a briefing establishes scope/direction alignment only; a separate Phase 2 Owner decision artifact is still required before implementation. Remove or constrain briefing wording that can be misread as implementation authorization. Targets: `$A_SOCIETY_WORKFLOW`, `$A_SOCIETY_COMM_TEMPLATE_BRIEF`, `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`. Severity: High. Source: `$A_SOCIETY_RECORDS/20260308-handoff-protocol/08-curator-synthesis.md`, Flow A. *Owner briefing recommended before entry because Approval Invariant wording changes.*

2. `[S][MAINT]` — **Flow B: Implementation status in update report submissions** — Require update report submissions to declare whether implementation is complete, which files were changed, and whether any publication condition remains outstanding. Keep the publication gate; improve submission completeness. Targets: `$A_SOCIETY_UPDATES_PROTOCOL`, `$A_SOCIETY_COMM_TEMPLATE_CURATOR_TO_OWNER`. Severity: Medium. Source: `$A_SOCIETY_RECORDS/20260308-handoff-protocol/08-curator-synthesis.md`, Flow B. *Curator authority.*

3. `[S][MAINT]` — **Flow C: Explicit within-flow sequencing for additional submissions** — Document that extra Curator → Owner submissions within one flow (for example, an update report draft after the main decision artifact) take the next sequence slot before backward-pass findings. Targets: `$A_SOCIETY_RECORDS`, `$A_SOCIETY_COMM_HANDOFF_PROTOCOL`. Severity: Low. Source: `$A_SOCIETY_RECORDS/20260308-handoff-protocol/08-curator-synthesis.md`, Flow C. *Curator authority. May fold into Flow B if handled together.*

4. `[M][LIB]` — **Variable retirement protocol** — Add a "Variable Retirement" section to `$INSTRUCTION_INDEX`: the inverse of Index-Before-Reference — grep all consumers first, update or remove each reference, then remove the variable from the index. Structural gap affecting any flow that retires content. Source: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/04-curator-findings.md` (Finding 2) and `05-owner-findings.md` (Finding 3). *Requires Owner briefing to enter Phase 1.*

5. `[S]` — **Retirement scope in briefings** — When a briefing includes "retire a folder," scope should automatically include verifying and cleaning stale entries in `$A_SOCIETY_AGENT_DOCS_GUIDE`. Target: `$A_SOCIETY_WORKFLOW` Phase 4 or `$INSTRUCTION_AGENT_DOCS_GUIDE`; may fold into Priority 4 flow. Source: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/05-owner-findings.md` (Finding 2). *Requires Owner briefing; may fold into Priority 4.*

6. `[S][MAINT]` — **Curator maintenance bundle** — (a) Fix `$A_SOCIETY_AGENT_DOCS_GUIDE` workflow entry: correct "six-phase" to five phases, fix phase names. (b) Update `[CUSTOMIZE]` banner in `$GENERAL_IMPROVEMENT_PROTOCOL`: add two-path output location decision point. Both within Curator authority. Source: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/04-curator-findings.md` (Findings 3 and 4). *No flow needed — Curator executes directly.*

---

## Archive

- `[L][LIB]` — **Graph-based workflow model** (2026-03-07): Extended the framework's single-thread workflow assumption to a full graph model supporting nodes, edges, instances, branching, and multi-graph projects. Six files updated in `general/instructions/`. Backwards compatible — single-thread projects unchanged. Framework update report: Recommended.
