# A-Society Tooling — Invocation Reference

This document describes how agents and humans invoke each tooling component.
All components are TypeScript modules (tsx runtime, ESM). Runtime requirement: **Node ≥ 16**.

---

## Quick start

```bash
cd a-society/tooling
npm install        # installs js-yaml, tsx, and TypeScript
npm test           # runs the full test suite
```

> **Running note:** All scripts that invoke the tooling must be run with `tsx` (e.g., `tsx your-script.ts`). There is no compiled output — source files are `.ts` and executed directly at runtime.

---

## Component 1 — Scaffolding System

**File:** `src/scaffolding-system.ts`

Creates the `a-docs/` folder structure and stub files for a new project.
Consent files are routed through the Consent Utility automatically.

### Primary entry point: `scaffoldFromManifestFile`

```js
import { scaffoldFromManifestFile } from './src/scaffolding-system.ts';

const result = scaffoldFromManifestFile(
  '/absolute/path/to/my-project',          // project root — a-docs/ is created here
  'My Project Name',                        // project name (used in consent files)
  '/absolute/path/to/a-society',            // a-society/ root (template source)
  '/absolute/path/to/a-society/general/manifest.yaml',
  {
    includeOptional: false,    // default: required entries only
    overwrite: false,          // default: skip existing files
    consentValue: 'pending',   // 'yes' | 'no' | 'pending' (default: 'pending')
    consentRecordedBy: 'Initializer Agent',  // optional label in consent files
  }
);

// result: { created: [...], skipped: [...], failed: [...] }
// Each entry: { path: '/absolute/path', scaffold: 'stub'|'copy'|'consent', source: '...' }
```

### Lower-level entry point: `scaffold`

For callers that construct their own entry list (e.g. a subset of manifest entries):

```js
import { scaffold } from './src/scaffolding-system.ts';

const entries = [
  { path: 'project-information/vision.md', scaffold: 'stub',
    source_path: 'general/instructions/project-information/vision.md' },
  { path: 'roles/owner.md', scaffold: 'copy',
    source_path: 'general/roles/owner.md' },
  { path: 'feedback/onboarding/consent.md', scaffold: 'copy',
    source_path: 'general/feedback/consent.md' },
];

const result = scaffold(projectRoot, projectName, aSocietyRoot, entries, options);
```

**Notes:**
- Consent files (`feedback/*/consent.md`) are always routed through the Consent Utility regardless of `scaffold` value.
- Does not overwrite existing files unless `options.overwrite: true`.
- `failed` entries whose reason contains `"Cannot copy from"` indicate missing source templates in `general/` — framework drift, not a tool bug.

---

## Component 2 — Consent Utility

**File:** `src/consent-utility.ts`

Two operations: create a consent file from template, and check whether consent has been given.

### Create

```js
import { createConsentFile } from './src/consent-utility.ts';

const result = createConsentFile(
  '/path/to/project/a-docs',   // a-docs/ root of the target project
  'onboarding',                 // 'onboarding' | 'migration' | 'curator-signal'
  'My Project',                 // project name
  'pending',                    // 'yes' | 'no' | 'pending'
  { overwrite: false, recordedBy: 'Initializer Agent' }  // optional
);

// result: { status: 'created'|'already-existed'|'failed', path: '...', reason?: '...' }
```

### Check

```js
import { checkConsent } from './src/consent-utility.ts';

const result = checkConsent(
  '/path/to/project/a-docs',
  'curator-signal'
);

// result: { consented: 'yes'|'no'|'pending'|'unknown',
//           file_status: 'present'|'absent',
//           path_checked: '...' }
```

**Notes:**
- Valid feedback types are enumerated in `FEEDBACK_TYPES` (exported). Adding a type requires updating the source.
- The rendered file format is maintained in `renderConsentFile()`. When `general/feedback/consent.md` changes, update `renderConsentFile()` to match.

---

## Component 3 + 4 — Workflow Graph Validator and Backward Pass Orderer

**Files:** `src/workflow-graph-validator.ts`, `src/backward-pass-orderer.ts`

Component 3 validates YAML frontmatter in a `workflow/main.md` file.
Component 4 consumes a validated graph to produce backward pass order.

### Validate a workflow file

```js
import { validateWorkflowFile } from './src/workflow-graph-validator.ts';

const { valid, errors } = validateWorkflowFile('/path/to/workflow/main.md');
// valid: boolean
// errors: string[] — empty when valid
```

### Compute backward pass order

```ts
import { backwardPassOrderer } from './src/backward-pass-orderer.ts';

// graph must be previously read and validated (e.g. via Component 3)
const order = backwardPassOrderer.computeBackwardPassOrder(graph);

// order: string[] (array of roles in deterministic backward pass order)
```

**Algorithm:** The algorithm uses node-list position derivation. Roles are recorded at their first appearance in the forward-pass array, and the resulting list is sorted descending by their first occurrence index (equivalent to reversing the array of first-occurrences).

### Generate trigger prompts

```ts
import { backwardPassOrderer } from './src/backward-pass-orderer.ts';

// Generate literal trigger prompts for the backward pass protocol
const prompts = backwardPassOrderer.generateTriggerPrompts(graph);

// Provide `synthesisRole` if the workflow uses a synthesis aggregation step
const promptsWithSynthesis = backwardPassOrderer.generateTriggerPrompts(graph, 'Curator');

// prompts: Record<string, string>
// e.g. { 'Owner': 'You are the Owner agent...', 'Curator': '...' }
```

**Implementation note:** The `synthesisRole` parameter identifies which role receives terminal synthesis instructions instead of standard findings handoff instructions. If omitted, all roles receive standard handoff instructions. This logic is decoupled from the workflow graph structure itself.

### Workflow graph YAML frontmatter schema

```yaml
---
workflow:
  name: "Workflow Name"
  nodes:
    - id: owner-intake
      role: Owner
    - id: curator-proposal
      role: Curator
  edges:
    - from: owner-intake
      to: curator-proposal
      artifact: "Handoff brief"      # optional
---
```

**Implementation note:** The example above reflects the approved framework schema in `$INSTRUCTION_WORKFLOW_GRAPH`. Component 3 and 4 implementation alignment is tracked separately in `$A_SOCIETY_TOOLING_COUPLING_MAP`.

---

## Component 5 — Path Validator

**File:** `src/path-validator.ts`

Checks whether every path registered in an index table resolves to an existing file.

```js
import { validatePaths } from './src/path-validator.ts';

const results = validatePaths(
  '/path/to/index.md',          // index file with Variable | Path | Description table
  '/path/to/repo/root'          // paths in the table resolve relative to this root
);

// results: Array<{ variable: string, path: string, status: 'ok'|'missing'|'parse-error' }>
```

**Common invocations:**

```js
// Public index
validatePaths('/a-society/index.md', '/repo/root');

// Internal index
validatePaths('/a-society/a-docs/indexes/main.md', '/repo/root');
```

**Notes:**
- Rows without a `$VARIABLE` in column 1 are skipped (section headers, separators).
- Path cells with backtick wrapping (`` `/path/to/file` ``) are stripped automatically.
- `missing` status = file does not exist on disk. This is framework drift, not a tool error.

---

## Component 6 — Version Comparator

**File:** `src/version-comparator.ts`

Identifies which framework update reports an adopting project has not yet applied.

```js
import { compareVersions } from './src/version-comparator.ts';

const result = compareVersions(
  '/path/to/project/a-docs/a-society-version.md',  // project's version record
  '/path/to/a-society/VERSION.md',                  // framework VERSION.md
  null                                              // updates dir — accepted but unused
);

// result: {
//   projectVersion: { major: 4, minor: 1 },
//   currentVersion: { major: 9, minor: 0 },
//   unappliedReports: [
//     { filename: '2025-01-15-v5.0-...md', version: { major: 5, minor: 0 } },
//     ...
//   ]
// }
```

**Notes:**
- `unappliedReports` are in ascending version order (oldest first).
- Reports are sourced from VERSION.md's history table — not from scanning the `updates/` directory.
- An update report not recorded in VERSION.md's history table will not appear in results. See the Updates Protocol (`$A_SOCIETY_UPDATES_PROTOCOL`) for the co-maintenance contract.

---

## Running the test suite

```bash
cd a-society/tooling
npm test
```

Tests are in `test/`. Each component has a dedicated unit test file plus a shared integration test:

| File | What it covers |
|---|---|
| `test/path-validator.test.ts` | Unit — Component 5 |
| `test/version-comparator.test.ts` | Unit — Component 6 |
| `test/consent-utility.test.ts` | Unit — Component 2 |
| `test/workflow-graph-validator.test.ts` | Unit — Component 3 |
| `test/backward-pass-orderer.test.ts` | Unit — Component 4 |
| `test/scaffolding-system.test.ts` | Unit — Component 1 |
| `test/integration.test.ts` | Integration — all components composing |

Tests use Node's built-in `assert` module — no test framework required. Framework state failures (index drift, missing source files) are printed as `[info]` warnings and do not fail the suite.

---

## Error conventions

All components follow the same error model:

| Condition | Behaviour |
|---|---|
| Invalid arguments (missing required param, unknown type) | Throws `Error` synchronously |
| File not readable (bad path, permissions) | Throws `Error` (validators) or returns `failed` entry (scaffold) |
| File exists and `overwrite` is false | Returns `skipped` entry (scaffold/consent utility) |
| Framework state gaps (missing files in index, drift) | Returns `missing` status or `failed` entry — not a throw |
