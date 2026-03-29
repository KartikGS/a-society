---
type: owner-workflow-plan
date: "2026-03-29"
complexity:
  domain_spread: high
  shared_artifact_impact: high
  step_dependency: elevated
  reversibility: moderate
  scope_size: high
tier: 3
path:
  - Technical Architect — Design advisory (Component 4 + runtime implementation tracks)
  - Owner — Advisory review
  - "[Parallel A] Tooling Developer — Implement Component 4 nodes/edges schema"
  - "[Parallel B] Runtime Developer — Drop workflowDocumentPath from FlowRun and CLI"
  - "[Parallel C] Curator — Draft multi-domain workflow proposal (general/ + a-docs/)"
  - Owner — Approve Curator proposal (embedded checkpoint for general/ changes)
  - "[Parallel C] Curator — Implement general/ + a-docs/ workflow docs + publish update reports"
  - Technical Architect — Integration review (Tracks A + B)
  - Owner — Integration gate
  - Curator — Phase 7 Registration (coupling map, INVOCATION.md, index updates)
  - Owner — Forward pass closure
known_unknowns:
  - "Component 4 traversal algorithm: whether node list order is sufficient for first-occurrence role derivation, or topological sort over edges is required. TA to specify."
  - "Disposition of computeBackwardPassOrder public API: updated signature or retirement. TA to specify."
  - "FlowRun.workflowDocumentPath removal strategy: clean break (remove field) or retain as derived field. TA to specify stored-state impact."
  - "Insertion point for multi-domain flow pattern in general/instructions/workflow/main.md, and whether a new a-docs/workflow/multi-domain-development.md file is warranted or whether additions to existing docs suffice. Curator to propose."
---

**Subject:** Workflow Schema Unification (Component 4 + Runtime) + Multi-Domain Flow Documentation
**Type:** Owner Workflow Plan
**Date:** 2026-03-29

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Three implementation domains (tooling, runtime, general/ library) plus a-docs/ documentation; five distinct roles across three parallel tracks | high |
| **2. Shared artifact impact** | `general/` changes affect all adopting projects; `INVOCATION.md` and coupling map are shared references consumed by multiple roles and agents; `start-flow` CLI signature change is breaking | high |
| **3. Step dependency** | TA advisory gates implementation tracks; Owner approval gates Curator general/ implementation (embedded checkpoint); all three parallel tracks must close before final registration | elevated |
| **4. Reversibility** | Code changes reversible via source control; `general/roles/owner.md` change (Breaking) already implemented in this session — update report pending | moderate |
| **5. Scope size** | 7+ files (`backward-pass-orderer.ts`, test fixtures, `types.ts`, `orchestrator.ts`, `cli.ts`, `general/instructions/workflow/main.md`, `a-docs/workflow/`); five roles; three parallel tracks converging at registration | large |

**Verdict:** Tier 3 — full role sequence with TA design advisory prerequisite and embedded Owner approval checkpoint in the Curator track.

---

## Routing Decision

Tier 3 via a single multi-domain flow. Three parallel tracks converge at registration:

- **Track A (Tooling Dev):** Component 4 (`backward-pass-orderer.ts`) updated to parse `nodes/edges` schema. Closes the Framework Dev phase gap established in `20260329-workflow-schema-unification/`. Also closes the `[S][MAINT]` gap: Component 7 INVOCATION entry missing from `tooling/INVOCATION.md`.
- **Track B (Runtime Dev):** `workflowDocumentPath` removed from `FlowRun`, `startFlow` signature updated, `advanceFlow` call site updated, `flowStatus()` updated. `$A_SOCIETY_RUNTIME_INVOCATION` updated for new `start-flow` signature.
- **Track C (Framework Dev via Curator, parallel with embedded approval):** Multi-domain flow pattern added to `general/instructions/workflow/main.md`; corresponding workflow documentation added to `a-docs/workflow/`. Framework update report published for the `general/roles/owner.md` Breaking change (removing "separate flows" rule) already implemented in this session.

The Curator track requires an embedded Owner approval checkpoint before implementing `general/` changes. This is the pattern for flows where parallel Framework Dev work touches `general/` — the Curator drafts the proposal while Tracks A and B run, gets Owner approval, then implements before all tracks converge at registration.

---

## Path Definition

1. **Technical Architect** — Design advisory covering both implementation tracks: Component 4 type interfaces, traversal algorithm, API disposition, validation rules; and runtime `FlowRun` type, `startFlow` signature, `ToolTriggerEngine` START payload, `advanceFlow` call site, `flowStatus()` output
2. **Owner** — Review and approve TA advisory; open Tracks A, B, and C in parallel
3. **[Track A] Tooling Developer** — Update `backward-pass-orderer.ts` and test fixtures per approved TA spec
4. **[Track B] Runtime Developer** — Update `types.ts`, `orchestrator.ts`, `cli.ts` per approved TA spec
5. **[Track C] Curator** — Draft proposal: multi-domain flow pattern for `general/instructions/workflow/main.md`; new or updated workflow docs in `a-docs/workflow/`; framework update report classification for `general/roles/owner.md` Breaking change
6. **Owner** — Review and approve Curator proposal (embedded checkpoint)
7. **[Track C] Curator** — Implement: write `general/` additions; create/update `a-docs/workflow/` docs; publish framework update reports
8. **Technical Architect** — Integration review (Tracks A + B)
9. **Owner** — Integration gate; confirm all three tracks complete
10. **Curator** — Phase 7 Registration: resolve coupling map "Tooling Dev pending" note; update `tooling/INVOCATION.md` Component 4 section (nodes/edges schema, algorithm); add Component 7 entry to `tooling/INVOCATION.md`; update `$A_SOCIETY_RUNTIME_INVOCATION` for new `start-flow` signature; update index entries as needed
11. **Owner** — Forward pass closure

---

## Known Unknowns

1. **Component 4 traversal algorithm:** Whether node list order is sufficient for first-occurrence role derivation (nodes declared in forward-pass order in existing documents), or whether a topological sort over edges is required for correctness. TA to specify with justification.

2. **`computeBackwardPassOrder` API disposition:** Whether the public lower-level entry point requires a signature update (new node/edge types) or should be retired, with `orderWithPromptsFromFile` as the sole entry point. TA to specify; test suite update scope follows from this decision.

3. **`FlowRun.workflowDocumentPath` strategy:** Whether to remove the field entirely from the type (clean break; compute at each call site) or retain it as a derived field set once at `startFlow`. TA to assess stored-state impact and recommend. Given active development with no production deployments, clean break is preferred.

4. **Multi-domain documentation scope:** Whether the multi-domain flow pattern warrants a new `a-docs/workflow/multi-domain-development.md` file or additions to existing workflow docs; and which section of `general/instructions/workflow/main.md` is the correct insertion point. Curator to propose in Track C.
