**Subject:** Runtime Orchestrator MVP — Phase 0 Gate Decision
**Status:** APPROVED
**Date:** 2026-03-27

---

## Decision

The Phase 0 architecture design (`03-ta-to-owner.md`) is approved. It is the binding specification for all Runtime Developer implementation work in this flow. Implementation may begin.

---

## Rationale

The design is consistent with `$A_SOCIETY_VISION` and `$A_SOCIETY_ARCHITECTURE` on every dimension. Specific confirmations:

**Vision consistency.** All four MVP capabilities are addressed: automated context injection (Context Injection Service + roleContextRegistry), automated session orchestration (Handoff Interpreter + Flow Orchestrator), automated process triggers (Tool Trigger Engine + four binding trigger rules), and behavioral guidance stays in-context (scope note correctly defers role-document trimming to a follow-on Curator flow). Technology, interface model, and LLM call model all match the vision specification.

**Architecture consistency.** Runtime lives in `runtime/`. Layer isolation is maintained: runtime state lives in `runtime/` private storage, canonical artifacts remain in record folders, `general/` and `a-docs/` are untouched. The tooling layer is preserved as a separate reusable layer that the runtime coordinates rather than absorbs; in-process invocation is architecturally sound.

**Tooling compatibility.** The TA consulted `$A_SOCIETY_TOOLING_COUPLING_MAP` and found no open invocation gaps. The four binding trigger rules (workflow load → Component 3, plan gate → Component 7, forward-pass closure → Component 4, initialization → Component 1) are correct. The invocation model (direct in-process TypeScript call) is appropriate for a TypeScript/Node.js runtime coordinating tooling modules in the same environment.

**`human-collaborative` note.** The coupling map confirms `workflow.nodes[].human-collaborative` (optional, non-empty string when present) is already in the permanent workflow graph schema and enforced by Component 3. No schema gap. The Runtime Developer should add `human-collaborative: "yes"` to appropriate Owner gate nodes in the permanent workflow documents used by the runtime as part of implementation — this is a Developer task, not a Phase 0 prerequisite.

---

## Owner Responses to TA Review Questions

1. **Anthropic-only MVP scope.** Approved. Single-provider implementation behind a narrow `LLMGateway` adapter is the correct MVP tradeoff. Provider expansion is a later runtime increment.

2. **File-backed runtime state.** Approved. In-memory loses state on restart; a database is over-engineering for a single-operator sequential MVP. File-backed state in `runtime/` is the right first persistence model.

3. **Linear-workflow boundary.** Approved. Automated orchestration for workflows with at most one outgoing edge per node is the correct MVP constraint given the current single-receiver handoff schema.

4. **Explicit `workflow_document_path` at `start-flow`.** Approved. No stable machine-readable mapping from record folder to permanent workflow document exists yet. Requiring it as explicit startup input is honest and avoids introducing a new documentation dependency mid-MVP.

5. **Formal runtime a-docs/ dependency map.** Deferred to a follow-on flow, not a prerequisite for implementation. The three dependencies the TA identified (handoff schema, roleContextRegistry, workflow/record-folder schemas) are real co-maintenance obligations. They should be formalized once the runtime is shipping. Added to Next Priorities (see below).

---

## Implementation Notes for the Runtime Developer

These are binding constraints derived from the Phase 0 approval, not open questions.

**roleContextRegistry schema.** The architecture specifies a runtime-owned registry keyed by role name and framework namespace. The Developer defines the schema. It must be deterministic and auditable — the registry must make drift explicit. The registry lives in `runtime/` source code, not in `a-docs/`.

**`human-collaborative` node metadata.** For each permanent workflow document the MVP orchestrates, the Developer must add `human-collaborative: "yes"` to the appropriate Owner gate nodes (e.g., `owner-phase0-gate`, `owner-integration-gate`). This is required before the runtime can correctly pause at those nodes. Update the workflow documents — do not hardcode role-name checks in the orchestration logic.

**Implementation phase definition.** The Phase 0 design identifies seven runtime components. The Developer must define implementation phases as the first output of their session — before writing any code. Phases should be proposed to the Owner before implementation begins if the Developer judges that phase sequencing requires Owner input; otherwise the Developer proceeds and documents phases in the record folder.

**Path convention.** All A-Society framework paths referenced inside the runtime must be resolved from registered index variables, never hardcoded. Record-folder artifact paths remain runtime inputs (repo-relative). See §4 of the Phase 0 design.

---

## Scope

**In scope for Runtime Developer:** Full implementation of the seven runtime components as specified in `03-ta-to-owner.md`, including roleContextRegistry definition, status model, session lifecycle, CLI interface, and all four binding tool trigger rules. Adding `human-collaborative: "yes"` to appropriate nodes in the permanent workflow documents used in the MVP.

**Out of scope:** Trimming existing role documents (follow-on Curator/Owner flow). Multi-provider support (deferred in MVP boundary). Any changes to `general/`, `a-docs/` documentation structure, or indexes — those are Curator responsibilities in the Registration phase.

---

## Follow-on Items (Added to Next Priorities)

**Runtime a-docs/ dependency map** — Create a formal tracking artifact for the runtime layer's co-maintenance dependencies on `a-docs/` artifacts, analogous to `$A_SOCIETY_TOOLING_COUPLING_MAP`. The three dependencies identified in Phase 0: (1) machine-readable handoff schema (`$INSTRUCTION_MACHINE_READABLE_HANDOFF`), (2) supported-role context sets (roleContextRegistry), (3) permanent workflow graph and record-folder `workflow.md` schemas. Source: `03-ta-to-owner.md` §1 (Flag to Owner).

---

## Handoff

Start a new Runtime Developer session.

```
You are a Runtime Developer agent for A-Society. Read a-society/a-docs/agents.md
```

```
Next action: Define implementation phases, then implement the runtime layer per the approved Phase 0 specification
Read: a-society/a-docs/records/20260327-runtime-orchestrator-mvp/03-ta-to-owner.md
       a-society/a-docs/records/20260327-runtime-orchestrator-mvp/04-owner-to-developer.md
Expected response: Implementation phase plan, then implementation work per those phases
```

```yaml
handoff:
  role: Runtime Developer
  session_action: start
  artifact_path: a-society/a-docs/records/20260327-runtime-orchestrator-mvp/03-ta-to-owner.md
  prompt: "You are a Runtime Developer agent for A-Society. Read a-society/a-docs/agents.md"
```
