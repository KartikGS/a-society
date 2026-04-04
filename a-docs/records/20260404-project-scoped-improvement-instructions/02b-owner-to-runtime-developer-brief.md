**Subject:** Project-Scoped Improvement Session Instructions — Runtime Developer Brief
**Flow:** 20260404-project-scoped-improvement-instructions
**Artifact:** 02b-owner-to-runtime-developer-brief.md
**Date:** 2026-04-04

---

## Context

The prior flow (`programmatic-improvement-system`, 2026-04-03) introduced `ImprovementOrchestrator` in `runtime/src/improvement.ts`. Two module-level constants in that file are hardcoded to the framework library layer:

```typescript
const META_ANALYSIS_INSTRUCTION_PATH = 'a-society/general/improvement/meta-analysis.md';
const SYNTHESIS_INSTRUCTION_PATH = 'a-society/general/improvement/synthesis.md';
```

These are wrong on two dimensions (TA Top Finding 2; Owner Top Findings 1–2):

1. **Wrong layer:** `a-society/general/improvement/` is the framework template library — these files contain unresolved `[PROJECT_*]` placeholders. The correct injection targets are each project's own `a-docs/improvement/meta-analysis.md` and `a-docs/improvement/synthesis.md`.

2. **Wrong derivation:** The paths are hardcoded to match the A-Society project. The runtime is a multi-project host. The correct model is to derive paths from `flowRun.projectRoot` at the point of use.

The Curator receives a separate brief (`02a`) to create A-Society's project-specific phase files and update framework documentation.

---

## Scope

### Change 1 — Replace hardcoded constants in `runtime/src/improvement.ts`

Remove both module-level constants:

```typescript
const META_ANALYSIS_INSTRUCTION_PATH = 'a-society/general/improvement/meta-analysis.md';
const SYNTHESIS_INSTRUCTION_PATH = 'a-society/general/improvement/synthesis.md';
```

At each usage site, replace with a locally computed path derived from `flowRun.projectRoot`:

**In the `meta-analysis` branch** (currently: `[META_ANALYSIS_INSTRUCTION_PATH, ...findingsFilePaths]`):

```typescript
const metaAnalysisInstructionPath = path.join(flowRun.projectRoot, 'a-docs', 'improvement', 'meta-analysis.md');
```

Use `metaAnalysisInstructionPath` in place of `META_ANALYSIS_INSTRUCTION_PATH`.

**In the `synthesis` branch** (currently: `[SYNTHESIS_INSTRUCTION_PATH, ...allFindingsFiles]`):

```typescript
const synthesisInstructionPath = path.join(flowRun.projectRoot, 'a-docs', 'improvement', 'synthesis.md');
```

Use `synthesisInstructionPath` in place of `SYNTHESIS_INSTRUCTION_PATH`.

The `path` import (`import path from 'node:path'`) is already present. No new imports are required.

**JSDoc / comments:** Remove the co-maintenance JSDoc comments that referenced `$GENERAL_IMPROVEMENT_META_ANALYSIS` and `$GENERAL_IMPROVEMENT_SYNTHESIS`. Add an inline comment at each computed path declaration naming the index variable convention:

```typescript
// $[PROJECT]_IMPROVEMENT_META_ANALYSIS: project root + a-docs/improvement/meta-analysis.md
const metaAnalysisInstructionPath = path.join(flowRun.projectRoot, 'a-docs', 'improvement', 'meta-analysis.md');
```

```typescript
// $[PROJECT]_IMPROVEMENT_SYNTHESIS: project root + a-docs/improvement/synthesis.md
const synthesisInstructionPath = path.join(flowRun.projectRoot, 'a-docs', 'improvement', 'synthesis.md');
```

### Change 2 — Tests

Review `runtime/test/` for any test that references:
- `META_ANALYSIS_INSTRUCTION_PATH`
- `SYNTHESIS_INSTRUCTION_PATH`
- The hardcoded string `'a-society/general/improvement/meta-analysis.md'`
- The hardcoded string `'a-society/general/improvement/synthesis.md'`

Update any such tests to reflect the project-scoped derivation. If a test requires a `flowRun.projectRoot` value to verify the computed path, use a deterministic fixture value.

---

## Output

Produce `03b-runtime-developer-completion.md` in the record folder. The completion report must cover:

1. **Change implemented:** confirm that module-level constants are removed and path derivation is computed from `flowRun.projectRoot` at each usage site
2. **Tests:** confirm whether any tests referenced the removed constants or hardcoded paths, and what was updated (or that none existed)
3. **Verification:** confirm the module compiles and tests pass
4. **Deviations:** any deviation from this spec, with rationale

---

## Files Changed

| File | Action |
|---|---|
| `runtime/src/improvement.ts` | Replace: remove two module-level constants; add `flowRun.projectRoot`-derived paths at each usage site; update comments |
| `runtime/test/improvement.test.ts` (if present) | Update: remove references to removed constants or hardcoded path strings |

---

## Open Questions

None.
