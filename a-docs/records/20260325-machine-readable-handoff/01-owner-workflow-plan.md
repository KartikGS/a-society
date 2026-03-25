---
type: owner-workflow-plan
date: "2026-03-25"
complexity:
  domain_spread: elevated
  shared_artifact_impact: elevated
  step_dependency: elevated
  reversibility: moderate
  scope_size: moderate
tier: 2
path:
  - Owner — Intake & Briefing
  - Curator — Proposal
  - Owner — Review
  - Curator — Implementation & Registration
  - Owner — Forward Pass Closure & Version Acknowledgment
known_unknowns:
  - "Serialization format (YAML vs JSON vs other) — Curator to propose with rationale, prioritizing framework consistency"
  - "Emission mode: inline fenced code block within handoff prose vs separate structure — Curator to propose"
  - "Whether the four starting fields (role, session_action, artifact_path, prompt) are sufficient or additional fields are needed"
  - "Whether existing coordination docs (handoff protocol) require a back-reference to the new instruction, and what form that takes"
  - "Whether a tooling validator component is warranted — Curator to assess and file as Next Priorities item if yes"
---

**Subject:** Machine-readable handoff format — new structured schema for agent session handoffs
**Type:** Owner Workflow Plan
**Date:** 2026-03-25

---

## Structural Readiness Assessment

**Check 1 — Feasibility:** Pass. Creating a new `general/` instruction for a machine-readable handoff schema is feasible within the framework. No invariant conflicts.

**Check 2 — Structural Routability:** Pass. Role authority: Owner holds direction and approval authority; Curator holds write authority over `general/`. Workflow routability: Framework Development workflow covers new library content. Both dimensions satisfied.

**Result:** Structurally ready. Proceed to complexity analysis.

*Note: Component 7 (Plan Artifact Validator) is not yet implemented — it does not appear in `INVOCATION.md`. Manual frontmatter verification applied: all five axes non-null, tier non-null, path non-empty, known_unknowns list present.*

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Primarily the communication/coordination layer (handoff format definition). A bounded tooling assessment dimension is present (whether a validator component is warranted), but this is scoped as an out-of-flow question — not a second domain being structurally modified. | elevated |
| **2. Shared artifact impact** | Creates a new public `general/` instruction consumed directly by adopting project agents; requires registration in both the internal and public indexes. | elevated |
| **3. Step dependency** | Schema field design must precede instruction drafting. The `[ADR]` tag in the Next Priorities entry confirms embedded direction decisions (format selection, field set, emission mode) that must be resolved in proposal before implementation can proceed. | elevated |
| **4. Reversibility** | A new instruction file is removable. However, as a format contract that propagates to adopting projects, future changes to the schema become breaking changes to downstream consumers — raising the reversal cost above a typical new file. | moderate |
| **5. Scope size** | Estimated 2–4 files: new instruction, internal and public index registration, possible back-reference in existing coordination doc. Two roles (Owner, Curator). | moderate |

**Verdict:** Tier 2 — Three axes elevated (domain spread, shared artifact impact, step dependency), two moderate. Clear sequence at intake; Curator judgment required for schema design and format selection. Not Tier 3: no structural change across multiple distinct domains, no high-reversibility concern, two roles.

---

## Routing Decision

Tier 2. The work is clearly more than Tier 1 — the `[ADR]` tag and the schema design requirement make a solo Owner implementation inappropriate; Curator proposal and Owner review are warranted. The work does not reach Tier 3: there is no high structural complexity (no changes to hard rules, no multi-domain structural modifications), and the path is clear at intake. The proposal phase will resolve the embedded design decisions (format, field set, emission mode) under Owner review before implementation begins.

---

## Path Definition

1. Owner — Intake & Briefing (Phase 0)
2. Curator — Proposal (Phase 1) — includes update report draft as named section
3. Owner — Review (Phase 2) — covers content change and update report draft together
4. Curator — Implementation & Registration (Phases 3–4) — includes publishing approved update report and incrementing version
5. Owner — Forward Pass Closure & Version Acknowledgment (Phase 5)

---

## Known Unknowns

1. **Serialization format** — YAML is the natural fit given the framework's existing use of YAML frontmatter in `workflow.md` and other records artifacts; however, JSON is more universally parseable by orchestration tools. Curator to propose with rationale.
2. **Emission mode** — whether the schema is emitted inline as a fenced code block within the natural-language handoff prose, or whether it constitutes a separate artifact per handoff. Inline is likely the practical path but Curator should confirm.
3. **Field completeness** — the Next Priorities entry names four fields: next role, session action, artifact path, prompt. Whether these four are sufficient or whether additional fields (e.g., expected_response, flow_id) are needed is a Curator judgment to surface in the proposal, evaluated against the minimum-necessary principle.
4. **Coordination doc coupling** — whether `$A_SOCIETY_COMM_HANDOFF_PROTOCOL` needs a back-reference to the new instruction, and what form that reference takes. Curator to assess during proposal.
5. **Tooling validator assessment** — the Next Priorities entry explicitly asks whether a tooling validator component is warranted. Curator to assess and, if warranted, file a new Next Priorities item for a separate Tooling Dev flow. This assessment is in scope for the proposal; implementation of any validator is not.
