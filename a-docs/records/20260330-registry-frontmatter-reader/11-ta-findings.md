# Backward Pass Findings: Technical Architect — registry-frontmatter-reader

**Date:** 2026-03-30
**Task Reference:** registry-frontmatter-reader
**Role:** Technical Architect
**Depth:** Full

---

## Findings

### Conflicting Instructions
- **None.**

### Missing Information
- **Utility verification was outside spec scope but was load-bearing.** The brief stated that `resolveVariableFromIndex()` in `paths.ts` was "already available and working." The TA advisory standards require verifying file-existence claims before asserting them, but do not explicitly require verifying the correctness of a utility the brief declares operational. The advisory was written on the assumption that a declared dependency was functional. It was not — the regex was broken for most variable names. The TA read `paths.ts` during advisory production and could have caught this; the brief's "working" characterization created a reason not to look closely. The gap: when an advisory takes a functional dependency on a utility, correctness of that utility is as load-bearing as its existence. No advisory standard currently requires this check.

### Unclear Instructions
- **None.**

### Redundant Information
- **The double-log pattern was a design choice, not an accident.** The advisory specified that `extractFrontmatter` logs on error and returns null, and that `buildRoleContext` also logs before returning null. Both logging sites were independently specced. The integration review correctly flagged the resulting double-log as a watch item. The root cause is that the §3 error handling spec assigned logging responsibility to both layers without specifying which layer owns the operator-facing message. The ambiguity was not caught at review because both layers individually followed the spec. A cleaner spec would have stated: `extractFrontmatter` logs the technical detail (file path + error message); `buildRoleContext` does not log on cases that propagate from `extractFrontmatter`, since the technical detail is already present. This would have eliminated the watch item before implementation.

### Scope Concerns
- **None.**

### Workflow Friction
- **The roleKey naming convention became a structural constraint through the advisory, with no home in the documentation layer.** The derivation rule in `roleKeyToIndexVariable` — `namespace__RoleName` maps to `$NAMESPACE_ROLENAME_ROLE` — is now load-bearing for any role added to the framework. The advisory flagged this in §6 and noted the Developer should add a code comment. But a code comment is local to one file. If a future Tooling Developer, Curator, or Owner proposes a role with a non-conforming key format, there is no place in `a-docs/` where they would learn this constraint before the runtime silently fails to resolve the role. The convention should be stated wherever roleKey format is defined — presumably in `a-docs/` runtime developer documentation or role creation guidance. No such location was identified or proposed in the advisory.

---

## Top Findings (Ranked)

1. **Utility correctness assumption** — The advisory accepted a brief's "working" characterization of a dependency without reading the implementation. The `paths.ts` regex was silently broken and the failure mode was a hard blocker at runtime. Advisory standards require verifying existence claims; an analogous standard for correctness of declared-operational utilities does not exist and should.
2. **Double-log design gap** — §3 error handling spec assigned logging to both `extractFrontmatter` and `buildRoleContext` without specifying ownership of the operator-facing message. Resulted in an integration watch item that was an upstream spec gap. The fix is a single sentence in §3 clarifying which layer owns the actionable log line.
3. **Load-bearing convention with no documentation home** — `roleKeyToIndexVariable`'s derivation rule is now a structural constraint for all future role additions, but the advisory proposed only a code comment as its documentation. A code comment is not discoverable to non-Developer roles. The constraint warrants a location in `a-docs/` that role-creation guidance can reference.

---

Next action: Meta-analysis (backward pass step 4 of 5)
Read: `11-ta-findings.md`, then `### Meta-Analysis Phase` in `$GENERAL_IMPROVEMENT`
Expected response: Findings artifact (`12-owner-findings.md`)
