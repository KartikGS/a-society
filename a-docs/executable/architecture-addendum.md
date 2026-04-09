# A-Society: Executable Architecture Addendum

This document records the standing governance rules for A-Society's unified executable layer.

---

## Placement Rules

- `runtime/` is the standing executable root
- new permanent executable placements must target `runtime/`, not `tooling/`
- `tooling/` may remain only as an approved transitional legacy implementation location during migration
- standing executable design and coupling references live under `a-docs/executable/`

---

## Ownership Rules

- Framework Services Developer owns deterministic executable framework services
- Orchestration Developer owns orchestration behavior and `$A_SOCIETY_RUNTIME_INVOCATION`
- Curator owns standing executable docs, indexes, update-report publication, and operator-surface verification
- Technical Architect owns executable design proposals and boundary decisions
- Owner holds executable approval gates and forward-pass closure

---

## Registration Rules

When an executable flow changes a standing executable surface, registration must consider:

1. `$A_SOCIETY_INDEX`
2. `$A_SOCIETY_PUBLIC_INDEX`
3. `$A_SOCIETY_AGENT_DOCS_GUIDE`
4. `$A_SOCIETY_EXECUTABLE_COUPLING_MAP`
5. `$A_SOCIETY_RUNTIME_INVOCATION`, when the operator-facing executable surface changed
6. `$A_SOCIETY_UPDATES_PROTOCOL` and `$A_SOCIETY_VERSION`, when the flow qualifies for a framework update report

`$A_SOCIETY_LOG` lifecycle sections remain Owner-owned at closure.

---

## Extension Rules

When a flow adds a new standing executable capability or changes the executable role split:

- the TA must define or confirm the executable boundary
- the relevant role docs must be updated or confirmed
- the coupling map must be updated for new or changed stable dependencies
- any new operator-facing reference must be explicitly Owner-approved; it does not appear by default

---

## Migration Rule

During executable-layer unification, some framework-service code and historical references may still point into `tooling/`. Treat those paths as legacy compatibility surfaces, not as evidence of a surviving standalone tooling layer. New work must not recreate that split.
