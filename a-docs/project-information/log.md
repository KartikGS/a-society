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

**Status:** Framework active — core infrastructure complete, next priorities are targeted refinements.

**Recent Focus**

`[S]` — **A-docs-guide rename** (2026-03-08): Renamed `agent-docs-guide.md` → `a-docs-guide.md` to align with A-Society's established naming convention. Updated all references and index variable. Backward pass surfaced four findings: two handled inline (stale agent-docs-guide entry, CUSTOMIZE banner gap), two escalated as proposed flows (Flow A and Flow B — see Next Priorities). Record: `$A_SOCIETY_RECORDS/20260308-a-docs-guide-rename/`.

**Previous**

- `[M]` — **Records infrastructure** (2026-03-08): Established flow-level artifact tracking under `a-docs/records/`. Defined identifier format (`YYYYMMDD-slug`), artifact sequence, and placement rules. Retired `improvement/reports/` folder and four associated index variables. Backward pass surfaced variable retirement protocol gap and retirement-scope-in-briefings gap (see Next Priorities). Record: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/`.
- `[M][LIB]` — **Owner as universal session entry point** (2026-03-08): Added workflow routing responsibility and post-confirmation protocol to the Owner role in `$GENERAL_OWNER_ROLE` and `$A_SOCIETY_OWNER_ROLE`. Establishes the Owner as the default entry point for all project sessions. Framework update report: Recommended.
- `[L][LIB]` — **Graph-based workflow model** (2026-03-07): Extended the framework's single-thread workflow assumption to a full graph model supporting nodes, edges, instances, branching, and multi-graph projects. Six files updated in `general/instructions/`. Backwards compatible — single-thread projects unchanged. Framework update report: Recommended.

---

## Next Priorities

1. `[M][LIB]` — **Flow A: Workflow as default in Owner role** — Update the Owner Post-Confirmation Protocol so that routing into the workflow is the default behavior for all work. The human can choose to work freeform, but the Owner does not make that choice for them. Remove or reframe any language presenting the workflow as one option among several. Targets: `$A_SOCIETY_OWNER_ROLE`, `$GENERAL_OWNER_ROLE`. Severity: High. Source: `$A_SOCIETY_RECORDS/20260308-a-docs-guide-rename/06-curator-synthesis.md`, Flow A. *Requires Owner briefing to enter Phase 1.*

2. `[S][LIB]` — **Flow B: Session-routing guidance at handoffs** — Add concrete session-routing language to Owner handoff instructions: at each pause point, the Owner states whether the human should start a new conversation or resume an existing one, and what the receiving agent needs to read. Targets: `$A_SOCIETY_WORKFLOW` and/or `$A_SOCIETY_OWNER_ROLE`; placement determined during briefing. Severity: Medium. Source: same. *Requires Owner briefing; placement resolved in briefing.*

3. `[M][LIB]` — **Variable retirement protocol** — Add a "Variable Retirement" section to `$INSTRUCTION_INDEX`: the inverse of Index-Before-Reference — grep all consumers first, update or remove each reference, then remove the variable from the index. Structural gap affecting any flow that retires content. Source: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/04-curator-findings.md` (Finding 2) and `05-owner-findings.md` (Finding 3). *Requires Owner briefing to enter Phase 1.*

4. `[S]` — **Retirement scope in briefings** — When a briefing includes "retire a folder," scope should automatically include verifying and cleaning stale entries in `$A_SOCIETY_AGENT_DOCS_GUIDE`. Target: `$A_SOCIETY_WORKFLOW` Phase 4 or `$INSTRUCTION_AGENT_DOCS_GUIDE`; may fold into Priority 3 flow. Source: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/05-owner-findings.md` (Finding 2). *Requires Owner briefing; may fold into Priority 3.*

5. `[S][MAINT]` — **Curator maintenance bundle** — (a) Fix `$A_SOCIETY_AGENT_DOCS_GUIDE` workflow entry: correct "six-phase" to five phases, fix phase names. (b) Update `[CUSTOMIZE]` banner in `$GENERAL_IMPROVEMENT_PROTOCOL`: add two-path output location decision point. Both within Curator authority. Source: `$A_SOCIETY_RECORDS/20260308-records-infrastructure/04-curator-findings.md` (Findings 3 and 4). *No flow needed — Curator executes directly.*

---

## Archive

*(No entries. Completed flows enter archive when the Previous window reaches capacity.)*
