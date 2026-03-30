**Subject:** registry-frontmatter-reader — TA integration review
**Status:** APPROVED WITH ONE WATCH ITEM
**Date:** 2026-03-30
**Spec reference:** `03-ta-advisory.md`

---

## Verdict

Implementation is approved. All spec requirements are met across all four modified files. One watch item is noted; it does not block approval.

---

## File-by-File Findings

### `runtime/src/registry.ts`

**`RoleContextEntry`:** `namespace` removed, `requiredReadingVariables: string[]` retained. ✓

**New imports:** `fs` (node:fs), `path` (node:path), `yaml` (js-yaml), `resolveVariableFromIndex` (./paths.js) — all present. ✓

**`roleKeyToIndexVariable`:**
- Splits on `__`; returns null if parts.length !== 2. ✓
- Namespace transform: `replace(/-/g, '_').toUpperCase()`. ✓
- Role name transform: `split(' ').map(w => w.toUpperCase()).join('_')`. ✓
- Constructs `$NAMESPACE_ROLENAME_ROLE`. ✓
- Not exported. ✓

**`extractFrontmatter`:**
- Checks first line is `---`, finds closing `---`, extracts content between. ✓
- Parses with `yaml.load()`. ✓
- Single catch handles both read errors and YAML parse errors; returns null with console.error. ✓

**`buildRoleContext`:**
- Case 1 (agents.md not found/unreadable): `!agentsPath || !fs.existsSync(agentsPath)` → console.error → null. ✓
- Case 2 (universal_required_reading absent): `!agentsFrontmatter || !Array.isArray(...)` → console.error → null. ✓
- Case 3a (roleKey derivation fails): `!roleVar` → console.error → null. ✓
- Case 3a (role file not found): `!rolePath || !fs.existsSync(rolePath)` → console.error → null. ✓
- Case 3b (role frontmatter absent): `!roleFrontmatter` → console.error → null. ✓
- Case 3c (required_reading key absent): `roleReading = []`, no error, proceeds to return. ✓
- Case 4 (YAML parse failure): caught inside `extractFrontmatter`; null propagates to cases 2 or 3b. ✓
- Merge with dedup: `[...new Set([...universalReading, ...roleReading])]`. ✓
- Doc comment names both fields read (`universal_required_reading` from agents.md, `required_reading` from role file). ✓
- Convention warning present: "The roleKey format 'namespace__RoleName' is load-bearing". ✓

**Watch item — duplicate log on read error/YAML parse failure:**

When `extractFrontmatter` catches a read error or YAML parse error, it logs: `Error reading or parsing frontmatter in ${filePath}: ${error.message}`. It then returns null. `buildRoleContext` receives null and logs a second message — either "missing valid 'universal_required_reading' frontmatter" or "missing valid frontmatter" — depending on which file failed. The second message implies malformed frontmatter when the actual cause was unreadable file or parse error.

Behavior is correct (null returned, session aborted). Both messages name the file path. A developer diagnosing the failure sees two lines: the first accurate, the second misleading. This is a minor log quality issue, not a correctness deviation. No action required before deployment.

---

### `runtime/src/injection.ts`

- Import swapped from `roleContextRegistry` to `buildRoleContext`. ✓
- Line 26: `const roleEntry = buildRoleContext(roleKey, projectRoot)`. ✓ Both parameters in scope.
- `if (roleEntry)` check unchanged — handles null correctly. ✓
- Else branch updated: "No required reading available." (was "No required reading registered."). ✓

No deviations.

---

### `runtime/src/orient.ts`

- Import swapped from `roleContextRegistry` to `buildRoleContext`. ✓
- `const orientRoleEntry = buildRoleContext(roleKey, workspaceRoot)` assigned before the null check. ✓ Both parameters in scope.
- Null check: `if (!orientRoleEntry)` → console.error → process.exit(1). ✓
- Error message: `"Could not load role context for '${roleKey}'. Check that the role file exists and contains valid frontmatter."` ✓
- Rest of function unchanged. ✓

No deviations.

---

### `runtime/src/paths.ts`

Developer-reported deviation: regex bug fix. The previous pattern `[\$A_Z_0-9]` matched only `$`, `A`, `_`, `Z`, and `0-9` — not the full uppercase alphabet — because `A_Z` is three individual characters, not a range. Variables with letters B–Y in their names would fail to resolve.

New pattern: `\$[\w-]+` — matches `$` followed by one or more word characters or hyphens. Covers all `$A_SOCIETY_*` and `$GENERAL_*` style variables. The removal of the trailing `\s*\|` anchor is correct: path extraction relies on the closing backtick to terminate the `(.*?)` group, not on a trailing pipe.

This was listed as "no change" in the spec. The Developer discovered the bug during implementation and fixed it in-scope. The fix is correct. Classifying as a legitimate in-scope correction, not a spec deviation requiring follow-up.

---

### `runtime/INVOCATION.md`

Not modified. Spec confirmed no external interface change. ✓

---

## Summary

| File | Status |
|---|---|
| `runtime/src/registry.ts` | Approved — all spec requirements met; one watch item (duplicate log, non-blocking) |
| `runtime/src/injection.ts` | Approved — no deviations |
| `runtime/src/orient.ts` | Approved — no deviations |
| `runtime/src/paths.ts` | Approved — in-scope bug fix, correct implementation |
| `runtime/INVOCATION.md` | No change, confirmed |

Implementation is ready for Owner gate review.

Artifact path: `a-society/a-docs/records/20260330-registry-frontmatter-reader/06-ta-integration-review.md`
