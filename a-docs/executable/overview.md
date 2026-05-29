# A-Society: Executable Overview

## System Overview

A-Society's standing executable layer is rooted in `runtime/`. It complements the documentation layer by turning a small set of framework operations into deterministic executable capabilities while keeping project direction, workflow policy, and role contracts in `a-docs/` and `general/`.

The executable layer has two standing subdomains:

- **Framework services** — deterministic helpers that operate on stable framework formats and rules
- **Orchestration** — session lifecycle, context injection, handoff routing, observability, and the operator-facing runtime surface

Implementation lives under `runtime/`. Standing executable design and coupling references live under `$A_SOCIETY_EXECUTABLE`.

## Standing Capabilities

| Capability | What it does |
|---|---|
| Scaffolding | Creates the folder structure and stub files for a new project's `a-docs/` |
| Workflow graph validation | Validates approved workflow graph representations and related schema constraints |
| Backward-pass planning | Computes backward-pass traversal order and related findings-location data from `workflow.yaml` in the active record folder |
| Path validation | Checks that every path registered in an index table resolves to an existing file |
| Orchestration | Manages agent sessions end to end: context injection, handoff routing, improvement/feedback gating, observability, and operator-facing runtime behavior |

## Runtime Server Shape

The browser backend lives under `runtime/src/server/`.

- `server.ts` is the composition layer: it initializes stores, builds the HTTP and WebSocket server, registers routes, parses socket messages, and delegates runtime behavior.
- Standalone route and transport helpers remain direct `server/` modules when they are small and bounded.
- WebSocket-backed flow session behavior lives under `runtime/src/server/runtime-session/`. That subdomain owns session lifecycle, operator commands, runtime event routing, consent state transitions, feed replay, flow-state projection, human-input target resolution, stale-consent repair, and shared session types.

## Standing Ownership Boundary

- `runtime/` is the sole standing executable implementation root
- Framework Services Developer and Orchestration Developer implement within the executable layer under approved Technical Architect design authority
- The Technical Architect owns standing executable design documentation, while the Curator maintains index and guide registrations for those surfaces
- Historical assessment context may still refer to retired `tooling/` paths, but the standing executable implementation root is `runtime/` alone

## Standing References

- `$A_SOCIETY_EXECUTABLE_PROPOSAL` — standing executable design reference
- `$A_SOCIETY_EXECUTABLE_ADDENDUM` — executable governance and maintenance rules
- `$A_SOCIETY_EXECUTABLE_COUPLING_MAP` — maintained executable/documentation coupling surface
- `$A_SOCIETY_RUNTIME_INVOCATION` — operator-facing runtime behavior reference
- `$A_SOCIETY_RUNTIME_WORKFLOW_CONTRACT` — runtime-owned workflow YAML schema and node-entry injection contract
- `$A_SOCIETY_RUNTIME_RECORDS_CONTRACT` — runtime-owned flow record placement, metadata, and writable scope contract
- `$A_SOCIETY_RUNTIME_ADOCS_MANIFEST` — runtime-owned a-docs scaffold and health-check contract
