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

## Component 3 — Workflow Graph Validator

**File:** `src/workflow-graph-validator.ts`

Component 3 validates YAML frontmatter in a permanent workflow document such as `a-docs/workflow/main.md`.

### Validate a workflow file

```js
import { validateWorkflowFile } from './src/workflow-graph-validator.ts';

const { valid, errors } = validateWorkflowFile('/path/to/workflow/main.md');
// valid: boolean
// errors: string[] — empty when valid

// Optional second argument enables strict mode (see structural checks below)
const { valid: strictOk, errors: strictErrors } = validateWorkflowFile(
  '/path/to/workflow/main.md',
  true
);
```

**Structural checks (always applied):** After schema validation, Component 3 rejects any edge whose `from` and `to` nodes share the same `role` (no neighboring same-role handoffs).

**Strict mode** (`strict === true`): Additionally requires that every **start** node (no incoming edges) and every **end** node (no outgoing edges) has `role: Owner`. If the graph has exactly one node, that node must be `Owner`. Use strict mode for per-flow record-folder `workflow.md` graphs where Owner bookends are required; omit `strict` (or pass `false`) for permanent workflow documents such as `a-docs/workflow/main.md` where those invariants do not apply.

### Workflow graph YAML frontmatter schema

```yaml
---
workflow:
  name: "Workflow Name"
  nodes:
    - id: owner-intake
      role: Owner
      human-collaborative: "direction"   # optional; if present, must be a non-empty string
    - id: curator-proposal
      role: Curator
  edges:
    - from: owner-intake
      to: curator-proposal
      artifact: "Handoff brief"      # optional
---
```

**Validation rule note:** `workflow.nodes[].human-collaborative` is optional. When present, Component 3 requires it to be a string and rejects empty or whitespace-only values.

**Implementation note:** The example above reflects the approved framework schema in `$INSTRUCTION_WORKFLOW_GRAPH`, with an additive validator-level acceptance for optional node metadata. Component 3 validates this permanent workflow format only.

## Component 4 — Backward Pass Orderer

**File:** `src/backward-pass-orderer.ts`

Component 4 reads `workflow.md` from a record folder (YAML frontmatter with a `workflow` object using **`nodes` and `edges`**) and returns an enriched backward pass plan with prompts.

### Primary entry point: `orderWithPromptsFromFile`

```ts
import { orderWithPromptsFromFile } from './src/backward-pass-orderer.ts';

const plan = orderWithPromptsFromFile(
  '/path/to/a-docs/records/20260320-some-flow',
  'Curator'   // synthesisRole is required
);

// plan: BackwardPassPlan = BackwardPassEntry[][]
// Outer array: sequential steps (run in order)
// Inner array: concurrent group (entries may run in parallel)
```

### Lower-level entry point: `computeBackwardPassOrder`

For unit tests or callers that already have parsed `workflow.nodes` and `workflow.edges`:

```ts
import { computeBackwardPassOrder } from './src/backward-pass-orderer.ts';

const plan = computeBackwardPassOrder(
  nodes,        // WorkflowNode[]
  edges,        // WorkflowEdge[]
  'Curator',    // synthesisRole
  '/path/to/record/folder' // optional; used in synthesis prompt paths
);
```

**Algorithm:** The orderer uses a graph-based topological algorithm (**Type C**). It computes the "reverse distance from terminal" for each node using BFS through predecessor links. Nodes at the same distance form a concurrent group. Roles are deduplicated across groups (first occurrence wins, in backward-pass order). One final **synthesis** step is appended for the provided `synthesisRole`.

### Record-folder `workflow.md` schema

```yaml
---
workflow:
  name: "Example flow"
  nodes:
    - id: owner-intake
      role: Owner
    - id: curator-proposal
      role: Curator
    - id: owner-review
      role: Owner
  edges:
    - from: owner-intake
      to: curator-proposal
    - from: curator-proposal
      to: owner-review
---
```

**Notes:**
- **Legacy `path[]`:** If `workflow.path` is present, Component 4 **throws** with a migration message.
- **Concurrent Groups:** When an inner array in the plan contains multiple entries, the meta-analysis prompts include a note directing agents to use sub-labeled finding filenames (e.g., `05a-`, `05b-`) to avoid collisions.
- **Linear Compatibility:** For linear graphs, every inner array has exactly one entry, and the output is functionally identical to original versions (regression protection).
- Both prompt types embed a `Read:` reference to the relevant section in `$GENERAL_IMPROVEMENT` (`### Meta-Analysis Phase` or `### Synthesis Phase`).

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
