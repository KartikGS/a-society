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

`[M][ADR]` — **runtime-dev-setup** (2026-03-27): Tier 2 Framework Dev flow closed. Structural prerequisites for the Runtime orchestrator MVP established: *(1)* `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` (new): Runtime Developer role document — execution scope, hard rules (write to `runtime/` only, record-folder exception, never-hardcode path, Phase 0 gate conditions), escalation triggers, Handoff Output with completion report requirement, and context loading; *(2)* `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` (new): Runtime Development workflow — Phase 0 TA architecture design gate (fully specified), placeholder implementation phases (open pending Phase 0 output), integration validation gate, registration, and forward pass closure; YAML graph for known structural nodes. Both registered in `$A_SOCIETY_INDEX` and `$A_SOCIETY_AGENT_DOCS_GUIDE`; Runtime Development entry added to `$A_SOCIETY_WORKFLOW`. No framework update report (a-docs/ only). Backward pass complete (Curator synthesis, 2026-03-27). Record: `a-society/a-docs/records/20260327-runtime-dev-setup/`.

**Previous**

`[S][ADR]` — **runtime-layer-vision** (2026-03-26): Tier 2 Framework Dev flow closed. Vision and architecture updated to acknowledge the runtime layer — A-Society's planned programmatic orchestration system for agent session management, context injection, and handoff routing: *(1)* `$A_SOCIETY_VISION` (MAINT): "What A-Society Is" updated from "two" to "four work product layers" with new runtime layer subsection; runtime workflow-compliance paragraph added to "Why Roles and Workflows Exist"; *(2)* `$A_SOCIETY_ARCHITECTURE` (MAINT): opening paragraph reframed from "documentation framework, not a software application" to "framework for making projects agentic-friendly"; `runtime/` added as fifth top-level folder (planned, not yet implemented); Layer Isolation invariant updated to include `runtime/` in all work-product enumerations. No framework update report (a-docs/ only). Backward pass complete (Curator synthesis, 2026-03-26). Synthesis MAINT: stale partial summary line removed from `$A_SOCIETY_VISION` "What A-Society Is" section ("The library defines what good looks like. The active agents produce it." was superseded by the four-layer evolution framing at the end of the runtime layer paragraph). Record: `a-society/a-docs/records/20260326-runtime-layer-vision/`.

`[M][LIB][ADR]` — **machine-readable-handoff** (2026-03-25): Tier 2 Framework Dev flow closed. New `general/` instruction defines a machine-readable handoff block — four-field YAML schema (`role`, `session_action`, `artifact_path`, `prompt`) emitted at every session pause point alongside natural-language prose: *(1)* `$INSTRUCTION_MACHINE_READABLE_HANDOFF` (LIB): new instruction `general/instructions/communication/coordination/machine-readable-handoff.md` — schema, field definitions, conditional constraint table, worked examples (resume and start-new cases), and adoption steps; *(2)* `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` (MAINT): Machine-Readable Handoff Block subsection added to Handoff Format Requirements. Framework update report published: `2026-03-25-machine-readable-handoff.md` (v22.0 → v22.1, Recommended × 1). `$A_SOCIETY_VERSION` updated to v22.1. Backward pass complete (Curator synthesis, 2026-03-25). Synthesis MAINT: `$A_SOCIETY_WORKFLOW_FRAMEWORK_DEV` Phase 4 output now explicitly requires the sequenced `curator-to-owner` handoff artifact; `$A_SOCIETY_OWNER_ROLE` now clarifies `[LIB]` workflow.md representation and the brief trigger for update report drafts. Record: `a-society/a-docs/records/20260325-machine-readable-handoff/`.

`[S][LIB][MAINT]` — **doc-maintenance-bundle** (2026-03-25): Tier 2 Framework Dev flow closed. Nine changes across four `general/` and five `a-docs/` files (Priorities 2–5 bundled): *(1)* `$GENERAL_CURATOR_ROLE` (LIB): Handoff Output opened with pre-handoff `workflow.md` verification step; *(2)* `$GENERAL_OWNER_ROLE` (LIB): prose insertions guidance added to Brief-Writing Quality; concurrent-workflow routing rule added to Workflow Routing; *(3)* `$INSTRUCTION_LOG` (LIB): third merge assessment criterion ("same workflow type and role path") added; *(4)* `$GENERAL_IMPROVEMENT` (LIB): Component 4 mandate sentences removed from Tooling paragraph; *(5)* `$A_SOCIETY_OWNER_ROLE` (MAINT): prose insertions para, parallel flows rule, and merge assessment third criterion added; *(6)* `$A_SOCIETY_WORKFLOW` (MAINT): Multiple concurrent workflows rule added to Session Routing Rules; *(7)* `$A_SOCIETY_LOG` (MAINT): stale "backward pass pending" clause removed from status line; *(8)* `$A_SOCIETY_IMPROVEMENT` (MAINT): Component 4 heading renamed ("mandate" → "invocation") + mandate sentences removed; *(9)* `$A_SOCIETY_WORKFLOW_TOOLING_DEV` (MAINT): Component 4 invocation mandate added to Phase 8 Work. Framework update report published: `2026-03-25-doc-maintenance-bundle.md` (v21.0 → v22.0, Breaking × 3, Recommended × 2). `$A_SOCIETY_VERSION` updated to v22.0. Backward pass complete (Curator synthesis, 2026-03-25). Synthesis MAINT: `$A_SOCIETY_CURATOR_ROLE` Handoff Output — Expected response scope rule added. Record: `a-society/a-docs/records/20260324-doc-maintenance-bundle/`.

---

## Next Priorities

`[S][LIB][MAINT]` — **Merge assessment: third criterion missing from Synthesis Phase** — `$GENERAL_IMPROVEMENT` and `$A_SOCIETY_IMPROVEMENT` Synthesis Phase sections reference only two merge assessment criteria ("same target files/design area" and "compatible authority level") — the third criterion ("same workflow type and role path") added to `$INSTRUCTION_LOG` and `$A_SOCIETY_OWNER_ROLE` in doc-maintenance-bundle is not yet reflected there. Fix: update both Synthesis Phase merge assessment references to include the third criterion. Source: `a-society/a-docs/records/20260324-doc-maintenance-bundle/04-curator-to-owner.md` (Out-of-Scope Drift Flagged).

`[S][LIB][MAINT]` — **Role guidance quality: shared list search, Expected response scope, and `[LIB]` flow clarity** — Four `general/roles/` improvements bundled into one Framework Dev flow: *(1)* `$GENERAL_OWNER_ROLE` Brief-Writing Quality: new "Shared list constructs" paragraph — when a brief adds to an ordered criteria or conditions list, enumerate all documents containing that list before finalizing scope; *(2)* `$GENERAL_CURATOR_ROLE` Handoff Output: clarifying rule — `Expected response` names only the immediate next artifact from the receiving role; artifacts produced only after intermediate steps by another role are not in scope for this handoff; *(3)* `$GENERAL_OWNER_ROLE` Post-Confirmation Protocol: clarify that `[LIB]` registration obligations are represented within existing workflow phases, not by adding extra `workflow.md` path nodes; *(4)* `$GENERAL_OWNER_ROLE` Brief-Writing Quality: for `[LIB]` flows likely to qualify for a framework update report, the brief must explicitly instruct the Curator to include the update report draft as a named section in the proposal submission. Source: `a-society/a-docs/records/20260324-doc-maintenance-bundle/07-curator-findings.md` (Finding 1); `a-society/a-docs/records/20260324-doc-maintenance-bundle/08-owner-findings.md` (Findings 1 and 2); `a-society/a-docs/records/20260325-machine-readable-handoff/07-owner-findings.md` (Findings 1 and 2).

`[S][LIB]` — **Machine-readable handoff: phase-closure `artifact_path` semantics + completion examples** — `$INSTRUCTION_MACHINE_READABLE_HANDOFF` needs guidance for phase-closure handoffs where the receiving role verifies completion rather than reading a new proposal/decision artifact. Add worked examples covering completion/registration handoffs and clarify what `artifact_path` should point to in that pattern; assess whether synthesis/flow-closure needs a distinct documented convention as well. Source: `a-society/a-docs/records/20260325-machine-readable-handoff/06-curator-findings.md` (Findings 2 and 3); `a-society/a-docs/records/20260325-machine-readable-handoff/07-owner-findings.md` (Finding 3).

`[M]` — **Machine-readable handoff validator (Component 8)** — New tooling component: extracts the `handoff` fenced block from agent pause-point output, parses the YAML, and validates field types, enum constraints, and the `prompt` conditional against `session_action`. Structurally analogous to Component 7 (Plan Artifact Validator) — same deterministic, rule-derived pattern, different input source. Follows standard Tooling Dev flow. Source: `a-society/a-docs/records/20260325-machine-readable-handoff/03-curator-to-owner.md` (Tooling Validator Assessment).

`[L][ADR]` — **Runtime orchestrator MVP** — Build the first version of A-Society's runtime layer: a TypeScript/Node.js application that manages agent sessions end-to-end, replacing the human's manual session-switching and prompt-pasting orchestration loop. The runtime calls LLM APIs directly and provides its own interface (not a plugin for existing editors). Core capabilities for the MVP: *(1)* automated context injection — when a session starts for a role, the system loads required documents programmatically (the agent does not read a list and confirm); *(2)* automated session orchestration — when an agent produces a machine-readable handoff block, the system parses it and sets up the next session with the correct role context; *(3)* automated process triggers — backward pass tool invocation at forward pass closure, validation when artifacts are produced, scaffolding at initialization — without agents invoking tools for formality; *(4)* behavioral guidance stays in-context — role documents are trimmed to judgment and quality standards only, with all process choreography handled by the runtime. Source: Owner-human strategic discussion in runtime-layer-vision flow (2026-03-26); direction agreed; `a-society/a-docs/records/20260326-runtime-layer-vision/`. Structural setup complete (`20260327-runtime-dev-setup`, 2026-03-27) — ready to re-enter intake as a new flow.

---

Archived flows are recorded in `$A_SOCIETY_LOG_ARCHIVE`. One entry per flow. Entries are immutable once written. Most recent at top.
