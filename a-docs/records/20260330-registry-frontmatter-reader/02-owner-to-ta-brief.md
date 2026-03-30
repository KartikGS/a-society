**Subject:** registry-frontmatter-reader — Phase 0 advisory: replace static roleContextRegistry with dynamic frontmatter reader
**Status:** BRIEFED
**Date:** 2026-03-30

---

## Context

The flow `20260329-agent-context-frontmatter` added YAML frontmatter to `agents.md` and all role files in `a-society/a-docs/roles/`, establishing frontmatter as the single source of truth for required reading:

- `agents.md` carries `universal_required_reading` — a list of `$VAR` names every agent must load regardless of role
- Each role file carries `required_reading` — a list of `$VAR` names specific to that role

The runtime's `registry.ts` currently maintains a static `roleContextRegistry` object that hardcodes these same variable lists per role key. This is a co-maintenance gap: any change to the frontmatter in `agents.md` or a role file must also be manually mirrored in `registry.ts`. Now that frontmatter is the single source of truth, the registry is the remaining duplication.

**The goal:** Replace `roleContextRegistry` with a function (or equivalent) that reads `universal_required_reading` from `agents.md` and `required_reading` from the role file at session start, using the existing `resolveVariableFromIndex()` in `paths.ts` to resolve `$VAR` references to absolute file paths.

---

## Current State

**`runtime/src/registry.ts`** — exports `roleContextRegistry: Record<string, RoleContextEntry>` and `RoleContextEntry` interface. The registry has three entries (`a-society__Owner`, `a-society__Curator`, `a-society__Runtime Developer`), each with a `namespace` field and `requiredReadingVariables: string[]`.

**`runtime/src/injection.ts`** — imports `roleContextRegistry` and accesses `roleContextRegistry[roleKey]` to get the `requiredReadingVariables` list, then resolves and injects each variable's file content into the context bundle.

**`runtime/src/orient.ts`** — imports `roleContextRegistry` and calls `roleContextRegistry[roleKey]` to check whether the roleKey is registered before starting an orient session. If not found, it exits with an error.

**`runtime/src/paths.ts`** — exports `resolveVariableFromIndex(variable: string, projectRoot: string): string | null`. Resolves a `$VAR` name by scanning both the internal index (`a-society/a-docs/indexes/main.md`) and the public index (`a-society/index.md`). Already available and working.

**`runtime/package.json`** — `js-yaml` is already a dependency (`^4.1.0`). No new dependencies are needed for frontmatter parsing.

**YAML frontmatter already in place:**

`a-society/a-docs/agents.md` frontmatter:
```yaml
universal_required_reading:
  - $A_SOCIETY_AGENTS
  - $A_SOCIETY_INDEX
  - $INSTRUCTION_MACHINE_READABLE_HANDOFF
```

`a-society/a-docs/roles/owner.md` frontmatter:
```yaml
required_reading:
  - $A_SOCIETY_VISION
  - $A_SOCIETY_STRUCTURE
  - $A_SOCIETY_ARCHITECTURE
  - $A_SOCIETY_PRINCIPLES
  - $A_SOCIETY_LOG
  - $A_SOCIETY_WORKFLOW
```

The same pattern holds for Curator, Technical Architect, Tooling Developer, and Runtime Developer role files.

---

## Scope

Single item. No sub-items. The design decision is the replacement pattern itself.

### What the advisory must resolve

**Design question 1 — Function signature and export shape**

How should `registry.ts` be restructured? Options include:

| Option | Description | Trade-offs |
|---|---|---|
| A — Replace export with a function | Export `buildRoleContext(roleKey, projectRoot): RoleContextEntry \| null` that reads frontmatter on each call | Simple; no state; callers change minimally |
| B — Replace export with a cached loader | Export `loadRoleContext(roleKey, projectRoot): RoleContextEntry \| null` that parses and caches on first call per role | Avoids repeated filesystem reads within a session; adds cache state |
| C — Keep export shape, populate dynamically at module init | Call a loader at module load time and populate a registry object | Maintains caller compatibility; `projectRoot` would need to be available at module init (e.g., via env var), which is awkward |

The TA must choose an option (or propose a variant) and specify the exact export shape, including what happens to `RoleContextEntry` and whether it remains as-is or changes.

**Design question 2 — agents.md path resolution**

`agents.md` is the source of `universal_required_reading`. Its path is `$A_SOCIETY_AGENTS`, resolvable via `resolveVariableFromIndex()`. However, `resolveVariableFromIndex()` takes `projectRoot` as a parameter. The role file path is derived from the roleKey — but the current registry encodes `namespace` (e.g., `a-society/a-docs`) to support this.

The TA must specify:
- How the function locates `agents.md` — via `resolveVariableFromIndex('$A_SOCIETY_AGENTS', projectRoot)` or via a direct path convention
- How it locates the role file — the role key format is `namespace__RoleName` (e.g., `a-society__Owner`). Does `resolveVariableFromIndex` cover this (e.g., `$A_SOCIETY_OWNER_ROLE`), or does the function need a mapping from roleKey to index variable?
- Whether the `namespace` field in `RoleContextEntry` is still needed after the change

**Design question 3 — Error handling**

Three failure cases must be specified:

1. `agents.md` not found or unreadable
2. `agents.md` has no `universal_required_reading` frontmatter field (or frontmatter is absent entirely)
3. The role file has no `required_reading` frontmatter field (or frontmatter is absent)
4. YAML parse failure for either file

For each: should the runtime throw (abort session start), return `null` with a logged warning, or return an empty required-reading set? The TA must specify the error surface and what callers should do in each case.

**Design question 4 — Caller update pattern**

Both `injection.ts` and `orient.ts` currently do a direct lookup on the registry object. The TA must specify exactly what changes in each caller:

- `injection.ts:26` — `const roleEntry = roleContextRegistry[roleKey];`
- `orient.ts:9` — `if (!roleContextRegistry[roleKey]) { ... }`

The caller update pattern must be fully specified so the Developer does not need to infer threading or error-propagation behavior independently.

---

## What the TA Advisory Must Produce

§1 — **Function signature** — chosen option with rationale; exact TypeScript signature for the new export(s) in `registry.ts`

§2 — **Path resolution spec** — how `agents.md` and the role file are located; whether `namespace` field survives; whether any mapping from roleKey to index variable is needed

§3 — **Error handling spec** — behavior for each of the four failure cases; what callers do when the function signals failure

§4 — **Caller update spec** — exact changes required in `injection.ts` and `orient.ts`; complete implementation path so the Developer does not infer threading

§5 — **Files Changed table** — all affected files with expected action (modify / extend / no change)

§6 — **Flags to Owner** — any structural concerns, edge cases, or risks not raised above

---

## Constraints

- **No new dependencies** — `js-yaml` is already available in `runtime/package.json`. Use it for frontmatter parsing. Do not add new packages.
- **Path convention** — All path lookups must use `resolveVariableFromIndex()`. Do not hardcode paths to `agents.md` or role files.
- **No interface surface change** — `INVOCATION.md` is not expected to change. The external CLI commands and environment variables are unaffected. If the TA identifies any surface change, flag it explicitly.
- **`RoleContextEntry` type** — May be modified if the dynamic approach makes fields obsolete (e.g., `namespace`). Specify changes explicitly.

---

## Gate Condition

Return the advisory to the Owner for Phase 0 gate review. The Developer does not begin implementation until the Owner explicitly approves the advisory.

---

## TA Confirmation Required

Before beginning the advisory, the TA must acknowledge:

> "Briefing acknowledged. Beginning Phase 0 advisory for registry-frontmatter-reader."
