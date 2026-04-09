# A-Society: Executable Architecture Proposal

This document is the standing design reference for A-Society's unified executable layer.

---

## Standing Model

- `runtime/` is the standing executable root
- `runtime/INVOCATION.md` is the sole default operator-facing executable reference
- `tooling/` is a transitional legacy implementation location, not a standing peer layer
- The executable layer has two standing capability families:
  - deterministic framework services
  - orchestration and operator-facing runtime behavior

---

## Role Split

| Role | Owns |
|---|---|
| Framework Services Developer | Deterministic executable framework services and their internal implementation details |
| Orchestration Developer | Session lifecycle, context injection, handoff routing, provider integration, CLI/operator behavior, observability, and `$A_SOCIETY_RUNTIME_INVOCATION` |
| Curator | Standing executable docs, coupling references, indexes, update reports, and verification of operator-facing references |

---

## Deterministic Framework Services

| Capability | Responsibility |
|---|---|
| Scaffolding | Create a project's `a-docs/` structure from the standing manifest |
| Consent handling | Create and check consent files |
| Workflow graph validation | Validate workflow graph structure and schema constraints |
| Backward-pass planning | Compute backward-pass traversal order and findings-location data from `workflow.md` |
| Path validation | Check that indexed paths resolve to existing files |
| Update comparison | Determine which framework update reports an adopting project still needs to apply |

These capabilities may still have legacy implementation roots under `tooling/` during migration. Their standing architectural home is the executable layer rooted in `runtime/`.

---

## Orchestration Capabilities

| Capability | Responsibility |
|---|---|
| Operator interface | CLI entry points and operator-facing flow controls |
| Flow orchestration | Forward-pass routing, pause handling, trigger execution, and terminal-state handling |
| Context injection | Required-reading resolution and turn-context assembly |
| Session store | Durable runtime state, session persistence, and status tracking |
| Provider gateway | Direct LLM-provider interaction and error normalization |
| Handoff interpretation | Parsing and validating machine-readable handoff blocks |
| Observability | Telemetry, runtime metrics, and diagnostics for executable behavior |

---

## Surviving Operator-Surface Rule

The standing operator-surface rule is:

- `$A_SOCIETY_RUNTIME_INVOCATION` is the sole default operator-facing executable reference
- it is authored and updated by the Orchestration Developer as an implementation deliverable
- it is registered and verified by the Curator
- no separate tooling invocation reference survives by default
- Framework Services Developer does not own a standing operator-facing reference unless a future Owner-approved design explicitly creates one

---

## Co-Maintenance Dependencies

The executable layer depends on stable contracts in both `general/` and `a-docs/`. Standing dependencies include:

- index table format used by path validation
- `VERSION.md` and `a-society-version.md` format used by update comparison
- consent template and feedback type identifiers used by consent handling
- workflow graph schema used by workflow graph validation
- record-folder `workflow.md` schema used by backward-pass planning
- `required-readings.yaml` schema used by runtime context injection
- machine-readable handoff schema used by runtime handoff interpretation

These dependencies are tracked and maintained via `$A_SOCIETY_EXECUTABLE_COUPLING_MAP`.

---

## Legacy Assessment Carry-Forward

Two legacy framework-service deviation rulings remain load-bearing in the unified executable layer:

- update comparison uses `VERSION.md` history as the authoritative published-report ledger
- consent creation renders the consent-file structure programmatically rather than reading the template file at runtime

The authoritative record for those rulings is `$A_SOCIETY_EXECUTABLE_LEGACY_TA_ASSESSMENT_PHASE1_2`.
