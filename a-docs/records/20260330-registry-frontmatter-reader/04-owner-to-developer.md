**Subject:** registry-frontmatter-reader — Phase 0 Gate: TA advisory approved
**Status:** APPROVED
**Date:** 2026-03-30

---

## Phase 0 Gate Decision

The TA advisory (`03-ta-advisory.md`) is approved. All four design points are accepted:

1. **Option A (synchronous function) and `RoleContextEntry` interface change** — Approved. `namespace` field removed; `requiredReadingVariables` retained. Rationale is sound: Option C unviable, Option B not warranted for two reads at session start.

2. **`roleKeyToIndexVariable` derivation rule** — Approved. All five current roleKeys verify against the index. The convention constraint (roleKeys must follow `namespace__RoleName`) is load-bearing and must be documented in `registry.ts` as a code comment per Flag 2.

3. **Error handling model (null-return for all hard failures; universal-only result for absent `required_reading` key)** — Approved. Consistent with `resolveVariableFromIndex` behavior. Case 3c correctly treats absent `required_reading` as a valid empty role-specific set.

4. **Flag 3 (coupling map)** — **No coupling map row.** The coupling map's declared scope is `tooling/`↔`general/` (including `[a-docs]` format deps for tooling components specifically). `registry.ts` is a runtime implementation file, not a tooling component. Adding a runtime format dependency to the coupling map would expand its scope beyond its declared boundary. The co-maintenance obligation for `registry.ts`'s reads of `agents.md` and role file frontmatter is adequately documented via the `buildRoleContext` doc comment (per Flag 4 in the advisory). No Phase 7 coupling map update is required for this flow.

---

## Implementation Authorization

The Runtime Developer is authorized to implement per `03-ta-advisory.md` §1–§4 in full. Key obligations:

- `buildRoleContext` must carry a doc comment stating which fields it reads from which files (`universal_required_reading` from `agents.md`; `required_reading` from the role file)
- `registry.ts` must carry a code comment stating that the roleKey format `namespace__RoleName` is load-bearing — roleKeys that do not follow this convention will not resolve
- `console.error` messages for failure cases must name (a) which file triggered the failure and (b) which failure case occurred, per §3
- Do not add `coupling-map.md` updates to the implementation scope for this flow

**No proposal artifact is required before implementation begins** (no Proposal phase in this workflow's path).

---

## Files Changed (from TA §5)

| File | Action |
|---|---|
| `runtime/src/registry.ts` | Modify — replace static registry with `buildRoleContext` function |
| `runtime/src/injection.ts` | Modify — caller update per §4 |
| `runtime/src/orient.ts` | Modify — caller update per §4 |
| `runtime/src/paths.ts` | No change |
| `runtime/INVOCATION.md` | No change |

---

## Next Step

Runtime Developer: implement against `03-ta-advisory.md`. When implementation and integration validation are complete, return to the Owner with the integration test record.
