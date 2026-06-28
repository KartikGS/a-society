# A-Society: Executable Architecture

This document is the single standing design reference for A-Society's executable layer, rooted in `runtime/`. It defines the runtime's internal structure, TypeScript surfaces, capability inventory, role boundaries, and the governance rules for extending and maintaining it. Detailed executable/documentation coupling lives in `$A_SOCIETY_EXECUTABLE_COUPLING_MAP`.

---

## 1. Standing Model

- `runtime/` is the standing executable root. All standing executable implementation belongs under it.
- `runtime/INVOCATION.md` is the sole default operator-facing executable reference.
- The runtime calls LLM APIs directly and provides the operator-facing web server and browser UI.
- The executable layer has two standing capability families:
  - deterministic framework services
  - orchestration and operator-facing runtime behavior

---

## 2. Package & Runtime Topology

`runtime/` is a **single npm package** — one `package.json`, one TypeScript solution. The server and browser UI co-deploy and co-version; there is no workspace/monorepo split. Introducing workspaces, or adopting a meta-framework that replaces the runtime's own HTTP/WebSocket server, requires Owner approval justified by a need the current single-package model cannot meet (e.g., independent versioning or publishing). The default direction is to **extend** the existing React + Vite + `tsc` setup, not replace it.

`runtime/` has three peer implementation surfaces:

| Surface | Path | Contents |
|---|---|---|
| Server | `runtime/src/` | Node/server executable code, organized by capability folder |
| Browser UI | `runtime/ui/` | Operator-facing browser UI, Vite-bundled |
| Shared (isomorphic) | `runtime/shared/` | Browser-safe code imported by **both** server and UI |

Root-level files: `runtime/INVOCATION.md` (operator entry), package/build/environment files, and `runtime/contracts/` (runtime-injected contracts).

**Shared vs common — the placement rule:** isomorphic code used by both the server and the UI lives in `runtime/shared/`, a top-level peer — *not* nested under `runtime/src/` (the server tree) or `runtime/ui/` (the browser tree). Server-internal cross-cutting code that the UI does not use stays under `runtime/src/common/`. The distinction is exact:

- `runtime/shared/` — shared across the **server and UI surfaces**.
- `runtime/src/common/` — common across **server subsystems** (may use Node APIs; never imported by the UI).

---

## 3. TypeScript Surfaces & Build/Typecheck Gates

Three compile surfaces are governed by a TypeScript **solution** file `runtime/tsconfig.json` (project references only):

| Project | Config | Resolution / libs | Includes |
|---|---|---|---|
| Server | `runtime/tsconfig.node.json` | NodeNext, Node globals | `src/`, `test/` |
| Browser UI | `runtime/tsconfig.app.json` | Bundler, `react-jsx`, DOM libs | `ui/src/` |
| Shared | `runtime/tsconfig.shared.json` | **pure ES2022 — no DOM, no Node types** | `shared/` |

The node and app projects both reference the shared project. Compiling `runtime/shared/` without DOM or Node libraries makes browser-safety **structural**: a `node:*` import or a `document` reference in shared code fails to compile, independent of any lint rule.

- `npm run check` runs `tsc -b`, so **all three surfaces are typecheck-gated**; `npm run build` typechecks before `vite build`.
- ESLint is **type-aware for both server and UI** — browser files reference `tsconfig.app.json` so type-aware rules (e.g., no-floating-promises) reach `ui/src/`.
- **Bundling never typechecks.** Vite (`root: ui`) bundles the UI via esbuild, which strips types. Type safety is the `tsc -b` gate's responsibility, never the bundler's.

---

## 4. Isomorphic-Import Boundary

Enforced jointly by the tsconfig include boundaries (§3) and an ESLint `no-restricted-imports` rule:

- `runtime/ui/` may import `runtime/ui/**` and `runtime/shared/**`. It may **not** import `runtime/src/**`.
- `runtime/src/` may import `runtime/src/**` and `runtime/shared/**`.
- `runtime/shared/` may import only `runtime/shared/**` — no `node:*`, no server subsystems, no UI.

Server-contract and domain types shared with the UI are defined in `runtime/shared/` and consumed by both sides. The UI reflects server-authoritative state; it does not re-derive it (see the UI Developer implementation discipline).

---

## 5. Role Split

| Role | Owns |
|---|---|
| Framework Services Developer | Deterministic executable framework services and their internal implementation details |
| Orchestration Developer | Session lifecycle, context injection, handoff routing, provider integration, the operator-facing server surface (HTTP/WebSocket protocol and operator backend), project-level settings (per-project role/permission/improvement defaults), observability, and `$A_SOCIETY_RUNTIME_INVOCATION` |
| UI Developer | Operator-facing browser UI implementation under `runtime/ui/` (consumes the server/WebSocket contract; does not modify `runtime/src/`) |
| Curator | Standing executable docs, coupling references, indexes, and verification of operator-facing references |

---

## 6. Capability Inventory

### Deterministic Framework Services

| Capability | Responsibility |
|---|---|
| Scaffolding | Create a project's `a-docs/` structure from `$A_SOCIETY_RUNTIME_ADOCS_MANIFEST` |
| Workflow graph validation | Validate workflow graph structure and schema constraints |
| Backward-pass planning | Compute backward-pass traversal order and findings-location data from `workflow.yaml` |
| Path validation | Check that indexed paths resolve to existing files |

### Orchestration Capabilities

| Capability | Responsibility |
|---|---|
| Operator interface | Local runtime server startup, browser UI serving, WebSocket protocol, and operator-facing flow controls |
| Runtime session backend | Stored-flow lifecycle, WebSocket-backed session replay, operator commands, runtime event routing, consent transitions, and flow-state projection |
| Flow orchestration | Forward-pass routing, pause handling, trigger execution, and terminal-state handling |
| Context injection | Required-reading resolution and turn-context assembly |
| Session store | Durable runtime state, session persistence, and status tracking |
| Provider gateway | Direct LLM-provider interaction and error normalization |
| Handoff interpretation | Parsing and validating machine-readable handoff blocks |
| Observability | Telemetry, runtime metrics, and diagnostics for executable behavior |
| Project settings | Per-project defaults for role configuration (model/skills/MCP), tool-permission seeding, and improvement/feedback gate pre-decisions; applied with precedence over the per-flow gates, with consent write-back |

---

## 7. Runtime Server Shape

The browser backend lives under `runtime/src/server/`.

- `server.ts` is the composition layer: it initializes stores, builds the HTTP and WebSocket server, registers routes, parses socket messages, and delegates runtime behavior. It is **not** the home for all backend behavior.
- Standalone route and transport helpers remain direct `server/` modules when they are small and bounded.
- WebSocket-backed flow session behavior lives under `runtime/src/server/runtime-session/`. That subdomain owns session lifecycle, operator commands, runtime event routing, consent state transitions, feed replay, flow-state projection, human-input target resolution, stale-consent repair, and shared session types.

---

## 8. Styling Model

- UI styles live under `runtime/ui/src/styles/` as **area files** — `base.css` (design tokens + UI chrome) plus per-area files such as `chat.css`, `feed.css`, `composer.css`, `role-config.css`, `workspace.css`, `graph.css`, and `settings.css` — combined through a single `@import` entry. One cascade is preserved, specificity stays predictable, and an agent working a UI feature reads only the relevant area file rather than the full stylesheet.
- The authority for design tokens, palette, typography, class naming, radius/motion, and breakpoints is the UI Developer `style-guide.md`. The style guide governs *content*; this document governs *file organization* (area-split with a single import cascade).

---

## 9. Operator-Surface Rule

- `$A_SOCIETY_RUNTIME_INVOCATION` is the sole default operator-facing executable reference.
- It is authored and updated by the Orchestration Developer as an implementation deliverable.
- It is registered and verified by the Curator.
- No separate tooling invocation reference survives by default.
- The Framework Services Developer does not own a standing operator-facing reference unless a future Owner-approved design explicitly creates one.

---

## 10. Co-Maintenance Dependencies

The executable layer depends on stable contracts in both `general/` and `a-docs/`. Standing dependencies include:

- the index table format used by path validation
- the runtime workflow YAML contract used by workflow graph validation, node-entry injection, active-flow routing, and backward-pass planning
- the per-role `required-readings.yaml` schema used by runtime context injection
- the `a-docs/roles/<role-id>/` folder convention (a role is a directory containing `main.md`) used by project-settings role discovery

These dependencies and their guidance status are tracked in `$A_SOCIETY_EXECUTABLE_COUPLING_MAP`.

---

## 11. Placement Rules

- `runtime/` is the standing executable root; all standing executable implementation belongs under it.
- `runtime/` has three peer implementation surfaces: `runtime/src/` (server), `runtime/ui/` (browser UI), `runtime/shared/` (isomorphic, browser-safe, shared by both).
- Isomorphic code used by both server and UI belongs in `runtime/shared/`, not nested under `runtime/src/` or `runtime/ui/`. Server-internal cross-cutting code stays under `runtime/src/common/`.
- Standing executable design and coupling references live under `a-docs/executable/`.
- `runtime/INVOCATION.md` is the root operator-facing entry point; additional runtime-owned agent/session contracts belong under `runtime/contracts/`.
- `runtime/src/` is organized by executable capability, not a flat file list. Standard capability folders: `orchestration/`, `context/`, `framework-services/`, `improvement/`, `projects/`, `server/`, `providers/`, `tools/`, `observability/`, `settings/`, `common/`.
- Within `runtime/src/server/`, `server.ts` remains a composition layer for HTTP/WebSocket setup, route registration, socket-message parsing, and delegation. Do not re-accumulate runtime session lifecycle, command handling, event routing, or consent transitions in `server.ts`.
- Cohesive server subdomains may use nested folders under `runtime/src/server/`; the standing runtime-session subdomain belongs under `runtime/src/server/runtime-session/`.
- Source tests mirror capability folders when a capability has more than one test file.
- A new top-level folder under `runtime/` or `runtime/src/` requires a real capability boundary. `runtime/ui/` and `runtime/shared/` qualify as such boundaries; do not create folders for one-off naming preferences.
- Root contracts and flat `runtime/src/` files are not valid placement for new work; use the capability folders and `runtime/contracts/`.

---

## 12. Ownership Rules

- Framework Services Developer owns deterministic executable framework services.
- Orchestration Developer owns orchestration behavior, the operator-facing server surface, and `$A_SOCIETY_RUNTIME_INVOCATION`; `runtime/ui/` is owned by the UI Developer.
- UI Developer owns the operator-facing browser UI implementation under `runtime/ui/`.
- Curator owns standing executable docs, indexes, and operator-surface verification.
- Technical Architect owns executable design proposals and boundary decisions.
- Owner holds executable approval gates and forward-pass closure.

---

## 13. Registration Rules

When an executable flow changes a standing executable surface, registration must consider:

1. `$A_SOCIETY_INDEX`
2. Relevant role ownership files
3. `$A_SOCIETY_EXECUTABLE_COUPLING_MAP`
4. `$A_SOCIETY_RUNTIME_INVOCATION`, when the operator-facing executable surface changed

`$A_SOCIETY_LOG` lifecycle sections remain Owner-owned at closure.

---

## 14. Extension Rules

When a flow adds a new standing executable capability or changes the executable role split:

- the Technical Architect must define or confirm the executable boundary
- the relevant role docs must be updated or confirmed
- the coupling map must be updated for new or changed stable dependencies
- any new operator-facing reference must be explicitly Owner-approved; it does not appear by default

---

## Standing References

- `$A_SOCIETY_EXECUTABLE_COUPLING_MAP` — maintained executable/documentation coupling surface
- `$A_SOCIETY_RUNTIME_INVOCATION` — operator-facing runtime behavior reference
- `$A_SOCIETY_RUNTIME_WORKFLOW_CONTRACT` — runtime-owned workflow YAML schema and node-entry injection contract
- `$A_SOCIETY_RUNTIME_RECORDS_CONTRACT` — runtime-owned flow record placement, metadata, and writable-scope contract
- `$A_SOCIETY_RUNTIME_ADOCS_MANIFEST` — runtime-owned a-docs scaffold and health-check contract
