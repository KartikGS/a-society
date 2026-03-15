# A-Society Tooling — Invocation Reference

This document describes how agents and humans invoke each tooling component.
All components are Node.js modules. Runtime requirement: **Node ≥ 16**.

---

## Quick start

```bash
cd a-society/tooling
npm install        # installs js-yaml (only external dependency)
npm test           # runs the full test suite
```

---

## Component 1 — Scaffolding System

**File:** `src/scaffolding-system.js`

Creates the `a-docs/` folder structure and stub files for a new project.
Consent files are routed through the Consent Utility automatically.

### Primary entry point: `scaffoldFromManifestFile`

```js
const { scaffoldFromManifestFile } = require('./src/scaffolding-system');

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
const { scaffold } = require('./src/scaffolding-system');

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

**File:** `src/consent-utility.js`

Two operations: create a consent file from template, and check whether consent has been given.

### Create

```js
const { createConsentFile } = require('./src/consent-utility');

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
const { checkConsent } = require('./src/consent-utility');

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

**Files:** `src/workflow-graph-validator.js`, `src/backward-pass-orderer.js`

Component 3 validates YAML frontmatter in a `workflow/main.md` file.
Component 4 consumes a validated graph to produce backward pass order.

### Validate a workflow file

```js
const { validateWorkflowFile } = require('./src/workflow-graph-validator');

const { valid, errors } = validateWorkflowFile('/path/to/workflow/main.md');
// valid: boolean
// errors: string[] — empty when valid
```

### Compute backward pass order

```js
const { orderFromFile } = require('./src/backward-pass-orderer');

// Full workflow — all nodes
const order = orderFromFile('/path/to/workflow/main.md');

// Filtered — only nodes that fired in this instance
const order = orderFromFile('/path/to/workflow/main.md', ['node-id-1', 'node-id-2']);

// order: Array<{
//   backward_pass_position: number,  // 1-based
//   role: string,
//   node_ids: string[],
//   is_synthesis: boolean
// }>
```

**Algorithm:** Non-synthesis roles are sorted by `first_occurrence_position` ascending, then reversed. The synthesis role is appended last regardless of its position value. If the synthesis role also has non-synthesis nodes in the graph (e.g. A-Society's Curator), it appears twice — once at its reversed findings position, once as the final synthesis entry.

### Lower-level: `orderFromGraph`

For callers that have already parsed the YAML:

```js
const { orderFromGraph } = require('./src/backward-pass-orderer');
const order = orderFromGraph(parsedGraphDoc, optionalFiredNodeIds);
```

### Workflow graph YAML frontmatter schema

```yaml
---
workflow:
  name: "Workflow Name"
  phases:
    - id: phase-1
      name: Phase One
  nodes:
    - id: owner-phase-1
      role: Owner
      phase: phase-1
      first_occurrence_position: 1   # 1-based; 1 = first to fire in forward pass
      is_synthesis_role: false
    - id: curator-phase-1-synthesis
      role: Curator
      phase: phase-1
      first_occurrence_position: 2
      is_synthesis_role: true        # exactly one node per graph must be true
  edges:
    - from: owner-phase-1
      to: curator-phase-1-synthesis
      artifact: "Handoff brief"      # optional
---
```

---

## Component 5 — Path Validator

**File:** `src/path-validator.js`

Checks whether every path registered in an index table resolves to an existing file.

```js
const { validatePaths } = require('./src/path-validator');

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

**File:** `src/version-comparator.js`

Identifies which framework update reports an adopting project has not yet applied.

```js
const { compareVersions } = require('./src/version-comparator');

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
| `test/path-validator.test.js` | Unit — Component 5 |
| `test/version-comparator.test.js` | Unit — Component 6 |
| `test/consent-utility.test.js` | Unit — Component 2 |
| `test/workflow-graph-validator.test.js` | Unit — Component 3 |
| `test/backward-pass-orderer.test.js` | Unit — Component 4 |
| `test/scaffolding-system.test.js` | Unit — Component 1 |
| `test/integration.test.js` | Integration — all components composing |

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
