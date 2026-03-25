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

**Status:** Framework active at v22.1.

**Recent Focus**

`[M][LIB][ADR]` — **machine-readable-handoff** (2026-03-25): Tier 2 Framework Dev flow closed. New `general/` instruction defines a machine-readable handoff block — four-field YAML schema (`role`, `session_action`, `artifact_path`, `prompt`) emitted at every session pause point alongside natural-language prose: *(1)* `$INSTRUCTION_MACHINE_READABLE_HANDOFF` (LIB): new instruction `general/instructions/communication/coordination/machine-readable-handoff.md` — schema, field definitions, conditional constraint table, worked examples (resume and start-new cases), and adoption steps; *(2)* `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` (MAINT): Machine-Readable Handoff Block subsection added to Handoff Format Requirements. Framework update report published: `2026-03-25-machine-readable-handoff.md` (v22.0 → v22.1, Recommended × 1). `$A_SOCIETY_VERSION` updated to v22.1. Backward pass complete (Curator synthesis, 2026-03-25). Synthesis MAINT: `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phase 4 output now explicitly requires the sequenced `curator-to-owner` handoff artifact; `$A_SOCIETY_OWNER_ROLE` now clarifies `[LIB]` workflow.md representation and the brief trigger for update report drafts. Record: `a-society/a-docs/records/20260325-machine-readable-handoff/`.

**Previous**

`[S][LIB][MAINT]` — **doc-maintenance-bundle** (2026-03-25): Tier 2 Framework Dev flow closed. Nine changes across four `general/` and five `a-docs/` files (Priorities 2–5 bundled): *(1)* `$GENERAL_CURATOR_ROLE` (LIB): Handoff Output opened with pre-handoff `workflow.md` verification step; *(2)* `$GENERAL_OWNER_ROLE` (LIB): prose insertions guidance added to Brief-Writing Quality; concurrent-workflow routing rule added to Workflow Routing; *(3)* `$INSTRUCTION_LOG` (LIB): third merge assessment criterion ("same workflow type and role path") added; *(4)* `$GENERAL_IMPROVEMENT` (LIB): Component 4 mandate sentences removed from Tooling paragraph; *(5)* `$A_SOCIETY_OWNER_ROLE` (MAINT): prose insertions para, parallel flows rule, and merge assessment third criterion added; *(6)* `$A_SOCIETY_WORKFLOW` (MAINT): Multiple concurrent workflows rule added to Session Routing Rules; *(7)* `$A_SOCIETY_LOG` (MAINT): stale "backward pass pending" clause removed from status line; *(8)* `$A_SOCIETY_IMPROVEMENT` (MAINT): Component 4 heading renamed ("mandate" → "invocation") + mandate sentences removed; *(9)* `$A_SOCIETY_WORKFLOW_TOOLING_DEV` (MAINT): Component 4 invocation mandate added to Phase 8 Work. Framework update report published: `2026-03-25-doc-maintenance-bundle.md` (v21.0 → v22.0, Breaking × 3, Recommended × 2). `$A_SOCIETY_VERSION` updated to v22.0. Backward pass complete (Curator synthesis, 2026-03-25). Synthesis MAINT: `$A_SOCIETY_CURATOR_ROLE` Handoff Output — Expected response scope rule added. Record: `a-society/a-docs/records/20260324-doc-maintenance-bundle/`.

`[S]` — **component4-synthesis-fixes** (2026-03-24): Tier 1 Tooling Dev flow closed. Two Component 4 gaps fixed: *(1)* `createSynthesisPrompt` threads `recordFolderPath` when provided (optional parameter on `computeBackwardPassOrder`, defaults to `'the record folder'`); *(2)* Scenario 5 integration test adds `synthesisRole` value assertion (`last.role === 'Curator'`). Backward pass complete (Curator synthesis, 2026-03-25; Developer session lost to platform failure). Record: `a-society/a-docs/records/20260324-component4-synthesis-fixes/`.

`[M][LIB][MAINT]` — **structural-readiness-intake** (2026-03-23): Tier 2 Framework Dev flow closed. Structural Readiness Assessment added as mandatory intake gate before complexity analysis: *(1)* `$INSTRUCTION_WORKFLOW_COMPLEXITY` (LIB): new **Structural Readiness Assessment** section inserted before Complexity Axes — three sequential checks (Feasibility, Structural Routability, Frequency Assessment), Handling by Outcome table, and Structural Gap Protocol; *(2)* `$GENERAL_OWNER_ROLE` (LIB): Workflow Routing bullet extended with structural readiness obligation and Structural Gap Protocol reference; *(3)* `$A_SOCIETY_OWNER_ROLE` (MAINT): same Workflow Routing update. Framework update report published: `2026-03-23-structural-readiness-assessment.md` (v20.0 → v21.0, Breaking × 1). `$A_SOCIETY_VERSION` updated to v21.0. Backward pass complete (Curator synthesis, 2026-03-23). Synthesis MAINT: `$A_SOCIETY_CURATOR_ROLE` Handoff Output — pre-handoff workflow.md verification step added. Record: `a-society/a-docs/records/20260323-structural-readiness-intake/`.

---

## Next Priorities

`[S][LIB][MAINT]` — **Merge assessment: third criterion missing from Synthesis Phase** — `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` Synthesis Phase sections reference only two merge assessment criteria ("same target files/design area" and "compatible authority level") — the third criterion ("same workflow type and role path") added to `$INSTRUCTION_LOG` and `$A_SOCIETY_OWNER_ROLE` in doc-maintenance-bundle is not yet reflected there. Fix: update both Synthesis Phase merge assessment references to include the third criterion. Source: `a-society/a-docs/records/20260324-doc-maintenance-bundle/04-curator-to-owner.md` (Out-of-Scope Drift Flagged).

`[S][LIB][MAINT]` — **Role guidance quality: shared list search, Expected response scope, and `[LIB]` flow clarity** — Four `general/roles/` improvements bundled into one Framework Dev flow: *(1)* `$GENERAL_OWNER_ROLE` Brief-Writing Quality: new "Shared list constructs" paragraph — when a brief adds to an ordered criteria or conditions list, enumerate all documents containing that list before finalizing scope; *(2)* `$GENERAL_CURATOR_ROLE` Handoff Output: clarifying rule — `Expected response` names only the immediate next artifact from the receiving role; artifacts produced only after intermediate steps by another role are not in scope for this handoff; *(3)* `$GENERAL_OWNER_ROLE` Post-Confirmation Protocol: clarify that `[LIB]` registration obligations are represented within existing workflow phases, not by adding extra `workflow.md` path nodes; *(4)* `$GENERAL_OWNER_ROLE` Brief-Writing Quality: for `[LIB]` flows likely to qualify for a framework update report, the brief must explicitly instruct the Curator to include the update report draft as a named section in the proposal submission. Source: `a-society/a-docs/records/20260324-doc-maintenance-bundle/07-curator-findings.md` (Finding 1); `a-society/a-docs/records/20260324-doc-maintenance-bundle/08-owner-findings.md` (Findings 1 and 2); `a-society/a-docs/records/20260325-machine-readable-handoff/07-owner-findings.md` (Findings 1 and 2).

`[S][LIB]` — **Machine-readable handoff: phase-closure `artifact_path` semantics + completion examples** — `$INSTRUCTION_MACHINE_READABLE_HANDOFF` needs guidance for phase-closure handoffs where the receiving role verifies completion rather than reading a new proposal/decision artifact. Add worked examples covering completion/registration handoffs and clarify what `artifact_path` should point to in that pattern; assess whether synthesis/flow-closure needs a distinct documented convention as well. Source: `a-society/a-docs/records/20260325-machine-readable-handoff/06-curator-findings.md` (Findings 2 and 3); `a-society/a-docs/records/20260325-machine-readable-handoff/07-owner-findings.md` (Finding 3).

`[M]` — **Machine-readable handoff validator (Component 8)** — New tooling component: extracts the `handoff` fenced block from agent pause-point output, parses the YAML, and validates field types, enum constraints, and the `prompt` conditional against `session_action`. Structurally analogous to Component 7 (Plan Artifact Validator) — same deterministic, rule-derived pattern, different input source. Follows standard Tooling Dev flow. Source: `a-society/a-docs/records/20260325-machine-readable-handoff/03-curator-to-owner.md` (Tooling Validator Assessment).

---

Archived flows are recorded in `$A_SOCIETY_LOG_ARCHIVE`. One entry per flow. Entries are immutable once written. Most recent at top.
