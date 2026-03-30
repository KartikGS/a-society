**Subject:** registry-frontmatter-reader — Phase 0 advisory
**Status:** PENDING OWNER REVIEW
**Date:** 2026-03-30

---

## §1 — Function Signature

**Chosen option: A — Replace export with a synchronous function.**

`registry.ts` exports a single function:

```typescript
export function buildRoleContext(roleKey: string, projectRoot: string): RoleContextEntry | null
```

**Rationale for Option A over B and C:**
- Option C requires `projectRoot` at module init time. The runtime passes `projectRoot` as a call parameter throughout — it is not available as a module-level value without restructuring callers. Not viable.
- Option B adds per-role cache state. Within a single session, `buildRoleContext` is called at most twice for the same role (once in `orient.ts` for the null check, once in `injection.ts` inside `buildContextBundle`). Two filesystem reads at session start does not warrant cache complexity. Option B is available as a future optimization if session profiling reveals a problem.
- Option A is synchronous (consistent with `resolveVariableFromIndex` and all fs usage in the runtime), stateless, and requires minimal caller changes.

**`RoleContextEntry` interface after change:**

```typescript
export interface RoleContextEntry {
  requiredReadingVariables: string[];
}
```

The `namespace` field is removed. It was never consumed by any caller — `injection.ts` accesses only `requiredReadingVariables`; `orient.ts` only checks existence. With the dynamic approach, the role file path is derived from the roleKey (see §2) rather than from a stored namespace prefix. Removing `namespace` eliminates a now-unused field.

**New imports required in `registry.ts`:**

```typescript
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { resolveVariableFromIndex } from './paths.js';
```

`js-yaml` is already in `runtime/package.json` (`^4.1.0`). No new packages.

---

## §2 — Path Resolution Spec

### Locating `agents.md`

Resolve via `resolveVariableFromIndex('$A_SOCIETY_AGENTS', projectRoot)`. No direct path convention. This follows the constraint that all path lookups must use `resolveVariableFromIndex`.

### Locating the role file

The roleKey format is `namespace__RoleName` (e.g., `a-society__Owner`, `a-society__Runtime Developer`). The index variable for the role file is derived from the roleKey using a deterministic two-part transformation:

**Derivation rule — `roleKeyToIndexVariable(roleKey: string): string | null`:**

1. Split on `__` → `[namespacePart, roleNamePart]`. If either part is missing, return `null`.
2. Transform namespace: replace `-` with `_`, uppercase → e.g., `a-society` → `A_SOCIETY`
3. Transform role name: split on spaces, uppercase each word, join with `_` → e.g., `Owner` → `OWNER`, `Runtime Developer` → `RUNTIME_DEVELOPER`, `Technical Architect` → `TECHNICAL_ARCHITECT`
4. Construct: `$` + transformed namespace + `_` + transformed role name + `_ROLE`

Verification against all current roleKeys:
| roleKey | Derived variable | Index entry |
|---|---|---|
| `a-society__Owner` | `$A_SOCIETY_OWNER_ROLE` | ✓ present |
| `a-society__Curator` | `$A_SOCIETY_CURATOR_ROLE` | ✓ present |
| `a-society__Runtime Developer` | `$A_SOCIETY_RUNTIME_DEVELOPER_ROLE` | ✓ present |
| `a-society__Technical Architect` | `$A_SOCIETY_TECHNICAL_ARCHITECT_ROLE` | ✓ present |
| `a-society__Tooling Developer` | `$A_SOCIETY_TOOLING_DEVELOPER_ROLE` | ✓ present |

`roleKeyToIndexVariable` is a private helper within `registry.ts` — not exported.

### `namespace` field

Removed from `RoleContextEntry` (see §1). No mapping between roleKey and a stored namespace prefix is needed; derivation replaces it.

### Frontmatter extraction

Both `agents.md` and the role file use the standard `---`-delimited YAML frontmatter block at the top of the file. Extraction: read file content, find the opening `---` on the first line, find the closing `---`, extract the content between them, parse with `yaml.load()`. The `$`-prefixed list values are valid YAML strings.

The parsed object from `agents.md` is expected to have `universal_required_reading: string[]`. The parsed object from the role file is expected to have `required_reading: string[]`.

---

## §3 — Error Handling Spec

**Failure model:** All failure cases return `null` from `buildRoleContext`. No exceptions are thrown. Each failure case emits a specific `console.error` message before returning. The `null` return is the error signal to callers.

**Rationale for null-over-throw:** Consistent with `resolveVariableFromIndex` (which returns `null` on failure). Both callers already have null-check branches (see §4). Throwing would require callers to add try/catch, diverging from the existing error handling pattern.

| Case | Behavior |
|---|---|
| 1. `agents.md` not found or unreadable | `console.error` naming the resolved path (or the unresolvable variable if resolution failed). Return `null`. |
| 2. `agents.md` frontmatter absent or `universal_required_reading` key missing | `console.error` stating which file and which field is missing. Return `null`. Universal required reading is a required contract — its absence indicates a malformed `agents.md`, not a legitimate empty set. |
| 3a. Role file cannot be located (roleKey derivation fails or `resolveVariableFromIndex` returns null) | `console.error` stating the roleKey and the derived variable that could not be resolved. Return `null`. |
| 3b. Role file found; frontmatter absent | `console.error` stating the role file path and that frontmatter is missing. Return `null`. Frontmatter absence is a schema violation, not a legitimate "no required reading" state. |
| 3c. Role file found; frontmatter present; `required_reading` key absent | Return `RoleContextEntry` with `requiredReadingVariables` equal to the universal list only. No error. A role with no role-specific required reading beyond the universal set is valid. |
| 4. `yaml.load()` throws for either file | Catch the YAML exception. `console.error` naming the file and the parse error message. Return `null`. |

**Caller behavior on `null`:** See §4.

**Error messages — delegation to Developer:** The Developer is responsible for the exact wording of each `console.error` call. Required content per message: (a) which file triggered the failure, (b) which failure case occurred. Follow the language pattern of the existing error log in `orient.ts` line 10: concise, specific, operator-facing.

---

## §4 — Caller Update Spec

### `injection.ts`

**Current (line 4):**
```typescript
import { roleContextRegistry } from './registry.js';
```

**Replace with:**
```typescript
import { buildRoleContext } from './registry.js';
```

`RoleContextEntry` is not explicitly imported in `injection.ts`; no import addition needed for the type.

**Current (line 26):**
```typescript
const roleEntry = roleContextRegistry[roleKey];
```

**Replace with:**
```typescript
const roleEntry = buildRoleContext(roleKey, projectRoot);
```

`projectRoot` is already in scope as the second parameter of `buildContextBundle`. No parameter threading required.

**Current (line 28, else branch message):**
```typescript
bundle += `--- UNKNOWN ROLE: ${roleKey}. No required reading registered. ---\n\n`;
```

**Replace with:**
```typescript
bundle += `--- UNKNOWN ROLE: ${roleKey}. No required reading available. ---\n\n`;
```

The `if (roleEntry)` check at line 27 is unchanged — it already handles `null` correctly.

**Full threading path:** `buildContextBundle(roleKey, projectRoot, ...)` → `buildRoleContext(roleKey, projectRoot)`. Both parameters are already present at the call site. No additional threading.

---

### `orient.ts`

**Current (line 6):**
```typescript
import { roleContextRegistry } from './registry.js';
```

**Replace with:**
```typescript
import { buildRoleContext } from './registry.js';
```

**Current (lines 9–12):**
```typescript
if (!roleContextRegistry[roleKey]) {
  console.error("This project's Owner role is not registered in the runtime.\nOnly registered projects support orient sessions.");
  process.exit(1);
}
```

**Replace with:**
```typescript
const orientRoleEntry = buildRoleContext(roleKey, workspaceRoot);
if (!orientRoleEntry) {
  console.error(`Could not load role context for '${roleKey}'. Check that the role file exists and contains valid frontmatter.`);
  process.exit(1);
}
```

`orientRoleEntry` is assigned for the null check only. It is not passed to `buildContextBundle` — `buildContextBundle` calls `buildRoleContext` internally via `injection.ts` and obtains its own entry. This is the double-read noted in §6; it is acceptable.

`workspaceRoot` is already in scope as the first parameter of `runOrientSession`.

**Full threading path:** `runOrientSession(workspaceRoot, roleKey)` → `buildRoleContext(roleKey, workspaceRoot)`. Both parameters already in scope. No additional threading.

---

## §5 — Files Changed

| File | Action | Changes |
|---|---|---|
| `runtime/src/registry.ts` | Modify | Remove `roleContextRegistry` export and static registry entries. Modify `RoleContextEntry`: remove `namespace` field, keep `requiredReadingVariables`. Add private `roleKeyToIndexVariable(roleKey): string \| null` helper. Add `buildRoleContext(roleKey, projectRoot): RoleContextEntry \| null` export. Add imports: `fs` (node:fs), `path` (node:path), `yaml` (js-yaml), `resolveVariableFromIndex` (./paths.js). Behaviors: (1) derives index variable via `roleKeyToIndexVariable`; (2) resolves `$A_SOCIETY_AGENTS` and the role file path via `resolveVariableFromIndex`; (3) extracts and parses YAML frontmatter from each file; (4) returns null with `console.error` for cases 1, 2, 3a, 3b, 4; (5) returns `RoleContextEntry` with universal + role-specific lists merged for the success case; (6) returns `RoleContextEntry` with universal list only (no error) for case 3c. |
| `runtime/src/injection.ts` | Modify | Replace `roleContextRegistry` import with `buildRoleContext`. Replace `roleContextRegistry[roleKey]` lookup with `buildRoleContext(roleKey, projectRoot)`. Update else-branch string from "No required reading registered" to "No required reading available". |
| `runtime/src/orient.ts` | Modify | Replace `roleContextRegistry` import with `buildRoleContext`. Replace `roleContextRegistry[roleKey]` existence check with `buildRoleContext(roleKey, workspaceRoot)` null check; assign result to `orientRoleEntry`. Update error message per §4. |
| `runtime/src/paths.ts` | No change | `resolveVariableFromIndex` is consumed but not modified. |
| `runtime/INVOCATION.md` | No change | CLI commands and environment variables are unaffected. No external interface change. |

---

## §6 — Flags to Owner

**Flag 1 — Double filesystem read at orient session start (watch item, not a blocker)**

When `runOrientSession` calls `buildRoleContext` for the null check, and then `buildContextBundle` calls it again internally, `agents.md` and the role file are read twice in sequence. For session-start initialization this is acceptable — both reads happen before any LLM call and the total data volume is small. If session profiling later identifies this as a concern, Option B (caching) in §1 is the upgrade path. No action required now.

**Flag 2 — roleKey naming convention is now load-bearing (structural, Owner awareness)**

The derivation in `roleKeyToIndexVariable` encodes a convention: roleKeys must follow `namespace__RoleName` where the namespace maps to an index variable prefix and the role name maps to a variable suffix via word-splitting and uppercasing. Any future role added to the framework must follow this convention for auto-discovery to work. A roleKey that does not follow the convention will yield a derivation that resolves to nothing, and `buildRoleContext` returns `null`.

This constraint should be noted in `registry.ts` as a code comment. It is also worth noting to any future Tooling Developer or Curator adding a new role: the roleKey format is not arbitrary — it must be derivable to the index variable.

**Flag 3 — `a-docs/` format dependency; coupling map taxonomy does not apply**

`buildRoleContext` reads two `a-docs/` files at runtime: `agents.md` (for `universal_required_reading`) and the role file (for `required_reading`). These are `a-docs/` format dependencies, not `general/` format dependencies. The coupling map's Type A–F taxonomy does not cover `a-docs/` format dependencies.

Co-maintenance obligation created: if the frontmatter key names (`universal_required_reading` in `agents.md`, `required_reading` in role files) change, `registry.ts` must be updated in the same change. This obligation is not visible to future Curators editing role files unless it is declared in the component design.

The coupling map table already tracks `a-docs/` dependencies with a `[a-docs]` annotation (e.g., the workflow graph frontmatter schema, the plan artifact validator). Recommend the Owner add a row for this new dependency at Phase 7 after implementation, following that precedent. No open invocation gaps to report for any existing component.

**Flag 4 — Static registry comment was accurate; its removal is a semantic change (informational)**

The current `registry.ts` comment says: "This explicitly declares the co-maintenance obligation between the runtime and the framework's documentation layer." After this change, the co-maintenance obligation is implicit in the dynamic read — the runtime follows whatever frontmatter it finds. This is strictly better (no duplication), but the comment's intent — making the dependency visible — should migrate into `buildRoleContext`'s doc comment and into Flag 3's coupling map row. The Developer should include a doc comment on `buildRoleContext` stating which fields it reads from which files.

---

Advisory ready for Owner review.

Artifact path: `a-society/a-docs/records/20260330-registry-frontmatter-reader/03-ta-advisory.md`

Owner evaluation needed:
1. Approve or revise the chosen option (A — synchronous function) and the `RoleContextEntry` interface change (remove `namespace`)
2. Approve or revise the `roleKeyToIndexVariable` derivation rule as the mechanism for locating role files
3. Approve or revise the error handling model (null-return for all hard failures; empty role-specific list for absent `required_reading` key)
4. Decide on Flag 3: whether to add a coupling map row for the `a-docs/` frontmatter dependency, or treat the code comment as sufficient

No open questions require Owner resolution before implementation can begin, contingent on approval of the above. If the Owner approves all four points above, the Developer may proceed.
