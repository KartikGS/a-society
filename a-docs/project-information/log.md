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

**Status:** Framework active at v22.0.

**Recent Focus**

`[S][LIB][MAINT]` — **doc-maintenance-bundle** (2026-03-25): Tier 2 Framework Dev flow closed. Nine changes across four `general/` and five `a-docs/` files (Priorities 2–5 bundled): *(1)* `$GENERAL_CURATOR_ROLE` (LIB): Handoff Output opened with pre-handoff `workflow.md` verification step; *(2)* `$GENERAL_OWNER_ROLE` (LIB): prose insertions guidance added to Brief-Writing Quality; concurrent-workflow routing rule added to Workflow Routing; *(3)* `$INSTRUCTION_LOG` (LIB): third merge assessment criterion ("same workflow type and role path") added; *(4)* `$GENERAL_IMPROVEMENT` (LIB): Component 4 mandate sentences removed from Tooling paragraph; *(5)* `$A_SOCIETY_OWNER_ROLE` (MAINT): prose insertions para, parallel flows rule, and merge assessment third criterion added; *(6)* `$A_SOCIETY_WORKFLOW` (MAINT): Multiple concurrent workflows rule added to Session Routing Rules; *(7)* `$A_SOCIETY_LOG` (MAINT): stale "backward pass pending" clause removed from status line; *(8)* `$A_SOCIETY_IMPROVEMENT` (MAINT): Component 4 heading renamed ("mandate" → "invocation") + mandate sentences removed; *(9)* `$A_SOCIETY_WORKFLOW_TOOLING_DEV` (MAINT): Component 4 invocation mandate added to Phase 8 Work. Framework update report published: `2026-03-25-doc-maintenance-bundle.md` (v21.0 → v22.0, Breaking × 3, Recommended × 2). `$A_SOCIETY_VERSION` updated to v22.0. Backward pass complete (Curator synthesis, 2026-03-25). Synthesis MAINT: `$A_SOCIETY_CURATOR_ROLE` Handoff Output — Expected response scope rule added. Record: `a-society/a-docs/records/20260324-doc-maintenance-bundle/`.

**Previous**

`[S]` — **component4-synthesis-fixes** (2026-03-24): Tier 1 Tooling Dev flow closed. Two Component 4 gaps fixed: *(1)* `createSynthesisPrompt` threads `recordFolderPath` when provided (optional parameter on `computeBackwardPassOrder`, defaults to `'the record folder'`); *(2)* Scenario 5 integration test adds `synthesisRole` value assertion (`last.role === 'Curator'`). Backward pass complete (Curator synthesis, 2026-03-25; Developer session lost to platform failure). Record: `a-society/a-docs/records/20260324-component4-synthesis-fixes/`.

`[M][LIB][MAINT]` — **structural-readiness-intake** (2026-03-23): Tier 2 Framework Dev flow closed. Structural Readiness Assessment added as mandatory intake gate before complexity analysis: *(1)* `$INSTRUCTION_WORKFLOW_COMPLEXITY` (LIB): new **Structural Readiness Assessment** section inserted before Complexity Axes — three sequential checks (Feasibility, Structural Routability, Frequency Assessment), Handling by Outcome table, and Structural Gap Protocol; *(2)* `$GENERAL_OWNER_ROLE` (LIB): Workflow Routing bullet extended with structural readiness obligation and Structural Gap Protocol reference; *(3)* `$A_SOCIETY_OWNER_ROLE` (MAINT): same Workflow Routing update. Framework update report published: `2026-03-23-structural-readiness-assessment.md` (v20.0 → v21.0, Breaking × 1). `$A_SOCIETY_VERSION` updated to v21.0. Backward pass complete (Curator synthesis, 2026-03-23). Synthesis MAINT: `$A_SOCIETY_CURATOR_ROLE` Handoff Output — pre-handoff workflow.md verification step added. Record: `a-society/a-docs/records/20260323-structural-readiness-intake/`.

`[S][LIB][MAINT]` — **workflow-path-completeness** (2026-03-22): Tier 2 Framework Dev flow closed. Two additive changes to Owner role files: *(1)* `$A_SOCIETY_OWNER_ROLE` (MAINT): new bullet in Post-Confirmation Protocol — `[LIB]` scope flows must include the registration loop (Curator publishes update report → version incremented → Owner acknowledgment) as a distinct step in `workflow.md` at intake; *(2)* `$GENERAL_OWNER_ROLE` (LIB): record-folder bullet extended with conditional `workflow.md` Phase 0 co-output obligation (2a); new standalone bullet added requiring inclusion of predictable post-implementation steps in path at intake (2b). Framework update report published: `2026-03-22-workflow-path-completeness.md` (v19.1 → v20.0, Breaking × 2). `$A_SOCIETY_VERSION` updated to v20.0. Backward pass complete (Curator synthesis, 2026-03-22). Synthesis: no new items. Record: `a-society/a-docs/records/20260322-workflow-path-completeness/`.

---

## Next Priorities

`[S][LIB][MAINT]` — **Merge assessment: third criterion missing from Synthesis Phase** — `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` Synthesis Phase sections reference only two merge assessment criteria ("same target files/design area" and "compatible authority level") — the third criterion ("same workflow type and role path") added to `$INSTRUCTION_LOG` and `$A_SOCIETY_OWNER_ROLE` in doc-maintenance-bundle is not yet reflected there. Fix: update both Synthesis Phase merge assessment references to include the third criterion. Source: `a-society/a-docs/records/20260324-doc-maintenance-bundle/04-curator-to-owner.md` (Out-of-Scope Drift Flagged).

`[S][LIB][MAINT]` — **Role guidance quality: shared list construct search + Expected response scope** — Two `general/roles/` improvements from doc-maintenance-bundle backward pass: *(1)* `$GENERAL_OWNER_ROLE` Brief-Writing Quality: new "Shared list constructs" paragraph — when a brief adds to an ordered criteria or conditions list, enumerate all documents containing that list before finalizing scope; *(2)* `$GENERAL_CURATOR_ROLE` Handoff Output: clarifying rule — `Expected response` names only the immediate next artifact from the receiving role; artifacts produced only after intermediate steps by another role are not in scope for this handoff. Source: `a-society/a-docs/records/20260324-doc-maintenance-bundle/07-curator-findings.md` (Finding 1); `a-society/a-docs/records/20260324-doc-maintenance-bundle/08-owner-findings.md` (Findings 1 and 2).

---

Archived flows are recorded in `$A_SOCIETY_LOG_ARCHIVE`. One entry per flow. Entries are immutable once written. Most recent at top.
