---
type: owner-workflow-plan
date: "2026-04-16"
complexity:
  domain_spread: high
  shared_artifact_impact: high
  step_dependency: high
  reversibility: high
  scope_size: elevated
tier: 3
path:
  - Owner — Intake & TA Brief
  - Technical Architect — Executable Design
  - Owner — Phase 0 Gate
  - Orchestration Developer — Implementation
  - Technical Architect — Integration Review
  - Owner — Integration Gate
  - Curator — Registration
  - Owner — Forward Pass Closure
known_unknowns:
  - Whether the UI package lives within runtime/ or as a sibling — TA determines the repo structure
  - HTTP library, WebSocket vs SSE, frontend framework, and graph library — TA has design authority
  - Whether INVOCATION.md is updated in-place or replaced with a new operator-surface doc — TA and Curator determine
  - Whether a framework update report is required — Curator determines per $A_SOCIETY_UPDATES_PROTOCOL post-implementation
---

**Subject:** CLI-to-UI migration — replace CLI operator surface with local web server + browser UI
**Type:** Owner Workflow Plan
**Date:** 2026-04-16

---

## Complexity Assessment

| Axis | Signal | Level |
|---|---|---|
| **1. Domain spread** | Touches `runtime/` (server, WebSocket renderer, UI, CLI deletion), `a-docs/project-information/architecture.md`, `runtime/INVOCATION.md`, `$A_SOCIETY_AGENT_DOCS_GUIDE`, and the internal index | high |
| **2. Shared artifact impact** | `runtime/INVOCATION.md` — the sole operator-facing executable reference — is being fundamentally replaced; `$A_SOCIETY_ARCHITECTURE` needs updating; a new operator entry point is introduced | high |
| **3. Step dependency** | TA design must precede OD implementation; TA integration review must precede Owner gate; Owner gate must precede Curator registration. All steps have hard sequential dependencies | high |
| **4. Reversibility** | CLI entry files are deleted outright; the operator surface changes. Not easily undone once landed | high |
| **5. Scope size** | New frontend codebase (React + Vite or equivalent), new server layer, deleted CLI files, updated operator docs and indexes. Large but bounded — core orchestration logic is untouched | elevated |

**Verdict:** Tier 3 — Executable design authority (TA), single implementation track (OD), Curator registration. Multiple hard sequential dependencies and an irreversible CLI removal require the full Executable Dev path.

---

## Routing Decision

Routes through `$A_SOCIETY_WORKFLOW_EXECUTABLE_DEV`. The work changes the operator-facing executable surface (`runtime/INVOCATION.md`), introduces a new standing executable entry point (web server), and removes the existing CLI entry. No `general/` changes are expected — this is A-Society-internal tooling, not distributable library content. The Curator role in this flow is registration-only, not a proposal/review round.

Only the Orchestration Developer track is in scope — no Framework Services Developer work is required. The deterministic framework services (`src/framework-services/`) are untouched.

---

## Path Definition

1. Owner — Intake & TA Brief (this artifact + `02-owner-to-ta-brief.md`)
2. Technical Architect — Executable Design (server/WebSocket architecture, UI component contract, file-level change map)
3. Owner — Phase 0 Gate (approve TA design, authorize OD track)
4. Orchestration Developer — Implementation (server layer, WebSocket/SSE renderer, frontend UI, CLI removal)
5. Technical Architect — Integration Review (verify implementation against approved design; assess `INVOCATION.md` against implemented surface)
6. Owner — Integration Gate (approve integrated result for registration)
7. Curator — Registration (update `$A_SOCIETY_RUNTIME_INVOCATION`, `$A_SOCIETY_INDEX`, `$A_SOCIETY_AGENT_DOCS_GUIDE`, `$A_SOCIETY_ARCHITECTURE` as needed; version and update report per `$A_SOCIETY_UPDATES_PROTOCOL`)
8. Owner — Forward Pass Closure

---

## Known Unknowns

1. Whether the UI package lives within `runtime/` or as a sibling package — TA determines the repo structure that best fits the build and serving model
2. HTTP library, WebSocket vs SSE choice, frontend framework, and graph library — TA has full design authority; Owner has stated preferences (React + Vite, React Flow, WebSocket for bidirectionality) but these are not constraints
3. Whether `INVOCATION.md` is updated in-place or whether the new operator surface warrants a structural rework — TA should flag this in the design artifact; Curator implements whatever the approved scope requires
4. Whether a framework update report is required — Curator determines per `$A_SOCIETY_UPDATES_PROTOCOL` after implementation; likely not, since the CLI operator surface is A-Society-internal, but the Curator should verify
