# Curator → Owner: Proposal

**Subject:** Create A-Society project log
**Status:** PENDING_REVIEW
**Type:** Proposal
**Date:** 2026-03-08

---

## Trigger

Owner briefing (`01-owner-to-curator-brief.md`, 2026-03-08): A-Society has the general instruction for a project log (`$INSTRUCTION_LOG`) but no log of its own. Without one, the Owner must reconstruct current state from record folders and todo files at every session start.

---

## Open Question Resolutions

### OQ1 — Scope tag set

**Proposed set:**

| Tag | Meaning |
|---|---|
| `[S]` | Small — single-session maintenance change (one to two files) |
| `[M]` | Medium — multi-step change within a single phase |
| `[L]` | Large — multi-phase or multi-file strategic change |
| `[LIB]` | Library — creates or modifies `general/` content; requires Owner approval; may require a framework update report |
| `[MAINT]` | Maintenance — a-docs change within Curator authority; no Owner proposal needed |
| `[ADR]` | Direction decision involved; requires Owner-level scope |

Tags may be combined: `[M][LIB]`, `[S][MAINT]`, `[L][LIB][ADR]`.

**Rationale:** `[TEST]` is dropped — A-Society has no tests. `[DOC]` is dropped — all A-Society work is documentation; it does not discriminate. The `[LIB]` / `[MAINT]` split maps directly to the framework's key authority boundary (Curator cannot write to `general/` without Owner approval). `[ADR]` captures direction decisions that originate with the Owner or human. This is six tags, at the top of the `$INSTRUCTION_LOG` recommended range — justified because `[LIB]` and `[MAINT]` encode a structural constraint worth making visible in the log itself.

---

### OQ2 — Who reads the log

The log is read by:
- **Owner** — at every session start, to know current state and which next priority to present to the human
- **Curator** — at the start of any maintenance session, to pick up the current next priorities

It is not universal required reading for all agents (Initializer, for example, does not need it). Per Principle 1 (Context Is a Scarce Resource), it is loaded on-demand by the roles that need it.

**Proposed scope addition:** Add `$A_SOCIETY_LOG` to the Owner's context loading list in `a-docs/roles/owner.md` (a-docs maintenance, within Curator authority). This is not in `general/roles/owner.md` — that would require a separate proposal. Raising here for Owner to confirm or defer.

---

### OQ3 — Entry lifecycle window

**Recommendation: keep the default (one Recent Focus + up to three Previous).**

Rationale: Four entries in view (1+3) precisely covers the current completed work. A-Society's flow cadence is measured — framework-level changes are not rapid. The window is unlikely to be too narrow in practice. If it becomes insufficient as the project matures, the log can be updated then. No adjustment now.

---

## Where Observed

A-Society — internal. The gap is that A-Society applies the general instruction to other projects but has not applied it to itself.

---

## Target Location

1. `a-docs/project-information/log.md` — **new file**
2. `a-docs/indexes/main.md` — **update** (add `$A_SOCIETY_LOG` row)
3. `a-docs/a-docs-guide.md` — **update** (add rationale entry for `log.md`)
4. `a-docs/roles/owner.md` — **update** (add `$A_SOCIETY_LOG` to context loading) — *pending Owner confirmation that this is in scope*

---

## Draft Content

### Item 1 — New: `a-docs/project-information/log.md`

```markdown
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
```

---

### Item 2 — Update: `a-docs/indexes/main.md`

Add one row (placement: after the `$A_SOCIETY_ARCHITECTURE` row, with other `project-information/` entries):

```
| `$A_SOCIETY_LOG` | `/a-society/a-docs/project-information/log.md` | A-Society project log — current state and next priorities for agents orienting at session start |
```

---

### Item 3 — Update: `a-docs/a-docs-guide.md`

Add the following entry to the `project-information/` section, after the `principles.md` entry:

```markdown
### `project-information/log.md` — `$A_SOCIETY_LOG`

**Why it exists:** Without a project log, the Owner must reconstruct current state at every session start by scanning record folders, todo files, and backward pass findings. The log surfaces current status, recently completed flows, and ordered next priorities in one read. It is the answer to "where did we leave off?" and "what should I work on next?"

**What it owns:** Current project status label, the rolling window of completed flows (one Recent Focus, up to three Previous), the ordered next priorities list with scope tags and source references, and the archive of older completed entries.

**What breaks without it:** The Owner reconstructs state from scattered artifacts every session — slow, error-prone, and inconsistent. Next priorities buried in backward pass findings are easy to miss or re-discover as new.

**Who reads it:** The Owner loads it at every session start. The Curator loads it at the start of maintenance sessions. Not universal required reading for all roles.

**Do not consolidate with:** `project-information/vision.md` — the vision describes what A-Society is and its strategic direction; the log describes current execution state and next concrete steps. Do not consolidate with `a-docs/records/` — records contain the full artifact history of completed flows; the log is a current-state summary for orientation.
```

---

### Item 4 — Update: `a-docs/roles/owner.md` (pending Owner confirmation)

Add `$A_SOCIETY_LOG` to the Owner's context loading list, after `$A_SOCIETY_PRINCIPLES`:

```
4. [`$A_SOCIETY_LOG`] — current project state and next priorities
```

Renumber subsequent items accordingly.

This is a-docs maintenance (Curator authority). Raising here because it extends the required reading list — confirming Owner wants this in scope before implementing.

---

## Owner Confirmation Required

The Owner must respond in the active record folder as `03-owner-to-curator.md` (from `$A_SOCIETY_COMM_TEMPLATE_OWNER_TO_CURATOR`) with one of:
- **APPROVED** — with any implementation constraints or clarifications on Item 4 scope
- **REVISE** — with specific changes required before resubmission
- **REJECTED** — with rationale

The Curator does not begin implementation until `03-owner-to-curator.md` shows APPROVED status.
