**Subject:** Runtime development structural setup — Runtime Developer role and Runtime Development workflow (2 new files)
**Status:** BRIEFED
**Date:** 2026-03-27

---

## Agreed Change

**Files Changed:**

| Target | Action |
|---|---|
| `a-society/a-docs/roles/runtime-developer.md` | additive (new file) |
| `a-society/a-docs/workflow/runtime-development.md` | additive (new file) |
| `$A_SOCIETY_INDEX` | additive (two new rows) |
| `$A_SOCIETY_WORKFLOW` | additive (new entry in Available Workflows section) |
| `$A_SOCIETY_AGENT_DOCS_GUIDE` | additive (two new entries) |

**Context:** The Runtime orchestrator MVP (`[L][ADR]`, Next Priorities) failed structural routability at intake: no role has authority to implement `runtime/`, and no workflow covers runtime development. This brief initiates the structural setup. The MVP flow re-enters intake as a new flow once both documents are created, reviewed, and registered.

**Human direction:** Option B for both gaps — a new Runtime Developer role (not an extension of the Tooling Developer) and a new Runtime Development workflow (not an extension of the Tooling Dev workflow).

---

### Item 1 — Runtime Developer role document [Requires Owner approval]

**File:** `a-society/a-docs/roles/runtime-developer.md`

Create a new role document for the Runtime Developer. The role is structurally analogous to the Tooling Developer but scoped to `runtime/` and with a different implementation character (LLM API caller, session supervisor, own interface — not a deterministic agent-invoked utility).

The role document must specify:

**Who this is:** Implements A-Society's runtime layer — the programmatic orchestration layer that manages agent sessions end-to-end: context injection, handoff routing, session management, and automated process triggers. Works from an approved TA architecture design as a binding specification.

**Primary focus:** Implement the runtime in TypeScript/Node.js, following the approved architecture design. Pure execution role at implementation time — architecture is given, not open for reinterpretation.

**Authority scope — owns:**
- All implementation choices within an approved design: library selection, internal code structure, test harness design, error message text, file naming within `runtime/`
- Raising deviations: when the approved design cannot be implemented as specified, the Developer surfaces this to the TA immediately and does not implement a workaround unilaterally

**Authority scope — does NOT own:**
- Architecture decisions of any kind
- Component interface changes — inputs, outputs, and behaviour are defined in the approved design
- Additions not in the approved design
- Any content in `a-docs/`, `general/`, or `tooling/` — those belong to the Curator and Tooling Developer respectively

**Escalation path:** Design deviation → TA. If TA determines the deviation requires a design change → Owner. Developer does not implement until resolution is approved.

**Writes to:** `runtime/` only.

**Placement rationale:** The Runtime Developer is an A-Society internal role — it implements A-Society's own runtime layer, not something other projects run themselves. Belongs in `a-docs/roles/`, not `general/roles/`. (Same rationale as the Tooling Developer.)

The Curator should model the document structure on `$A_SOCIETY_TOOLING_DEVELOPER_ROLE`, adapting content for the runtime layer character.

---

### Item 2 — Runtime Development workflow document [Requires Owner approval]

**File:** `a-society/a-docs/workflow/runtime-development.md`

Create a new workflow document for runtime development work. This workflow covers the process by which A-Society's runtime layer is designed, implemented, validated, registered, and closed.

The workflow is structurally analogous to the Tooling Development workflow but must include an explicit architecture design phase (Phase 0 of the Tooling Dev workflow assumed an already-approved architecture proposal; the runtime has no such pre-existing design). The TA enters in design mode here, not advisory mode.

**Required structural elements:**

1. **YAML frontmatter graph** — include a machine-readable graph block using the same schema as `$A_SOCIETY_WORKFLOW_TOOLING_DEV`. Because implementation phase nodes are not yet specified, the graph should cover the known outer structure only (Phase 0 gate, integration validation gate, registration, forward pass closure). Intermediate implementation phase nodes are deferred — mark this explicitly in the document with a note that the full graph will be completed after Phase 0 produces the TA architecture design.

2. **Phase 0 — Architecture Design Gate:** The TA produces a runtime architecture design document. Owner reviews and approves before any implementation begins. This gate must be fully specified — it is the one phase the MVP flow can define before the TA engagement. It is the structural prerequisite for all subsequent phases. Include:
   - TA produces: architecture document covering runtime component decomposition, session management model, LLM API integration approach, interface design, and relationship to existing tooling components
   - Owner reviews: against the vision (`$A_SOCIETY_VISION`) and architecture (`$A_SOCIETY_ARCHITECTURE`) for consistency; confirms the design is compatible with the tooling layer
   - Gate condition: Owner explicit approval required before any implementation begins

3. **Implementation phases (placeholder):** State explicitly that implementation phases are defined by the Phase 0 architecture document output. Name the pattern (e.g., "phases TBD after Phase 0; structure analogous to Tooling Dev Phases 1–5") rather than leaving it blank. The workflow document must acknowledge this is structurally incomplete pending Phase 0.

4. **Integration validation gate:** Analogous to Tooling Dev Phase 6 — Developer + TA review + Owner gate. Specify the gate clearly even if the input conditions reference "implementation phases TBD."

5. **Registration phase:** Curator registers all `runtime/` paths in `$A_SOCIETY_PUBLIC_INDEX` (runtime is work product, accessible to external agents via the public index), `a-docs/` artifacts in `$A_SOCIETY_INDEX`, and updates `$A_SOCIETY_AGENT_DOCS_GUIDE`.

6. **Forward pass closure:** Owner acknowledges forward-pass completion and initiates backward pass.

7. **Roles table:** Include the four roles (Owner, Technical Architect, Runtime Developer, Curator) with their function in this workflow.

8. **Session model:** The human orchestrates three standing sessions (Owner, Curator, Runtime Developer) plus on-demand TA sessions — the same model as the Tooling Dev workflow.

**No framework update report** is expected for this setup flow — both outputs are `a-docs/` additions only. Verify against `$A_SOCIETY_UPDATES_PROTOCOL` to confirm.

---

## Scope

**In scope:**
- `a-society/a-docs/roles/runtime-developer.md` — new Runtime Developer role document
- `a-society/a-docs/workflow/runtime-development.md` — new Runtime Development workflow document
- `$A_SOCIETY_INDEX` — two new rows (one per new file); propose variable names for Owner approval
- `$A_SOCIETY_WORKFLOW` — new entry in the Available Workflows section
- `$A_SOCIETY_AGENT_DOCS_GUIDE` — two new entries (one per new file)

**Out of scope:**
- Any `general/` additions — the Runtime Developer role is an internal A-Society role, not a general template
- Modification of the Tooling Developer role or Tooling Development workflow
- The runtime architecture itself — that is Phase 0 of the MVP flow

---

## Likely Target

- Role doc: `a-society/a-docs/roles/` — consistent with Tooling Developer and Technical Architect placement
- Workflow doc: `a-society/a-docs/workflow/` — consistent with existing workflow document placement
- Index registrations: `$A_SOCIETY_INDEX` for both new `a-docs/` files; variable names to be proposed by Curator following the `$A_SOCIETY_[ROLE]_ROLE` and `$A_SOCIETY_WORKFLOW_[NAME]` naming patterns

---

## Open Questions for the Curator

1. **Variable names:** Propose variable names for both new files in the proposal submission (following established patterns: `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` and `$A_SOCIETY_WORKFLOW_RUNTIME_DEV` are the natural choices — confirm or propose alternatives). Owner approves at review.

2. **Runtime Development workflow — implementation phase placeholder depth:** The brief directs a placeholder for implementation phases. Propose the exact wording and scope of this placeholder in the proposal. The key question: should the placeholder name an expected phase count/structure (e.g., "analogous to Tooling Dev Phases 1–5") or leave structure entirely open pending Phase 0? Owner adjudicates at review.

---

## Curator Confirmation Required

Before beginning Phase 1, the Curator must acknowledge this briefing in the session:

> "Briefing acknowledged. Beginning proposal for Runtime development structural setup — Runtime Developer role and Runtime Development workflow."

The Curator does not begin drafting until they have read this brief in full and confirmed acknowledgment.
