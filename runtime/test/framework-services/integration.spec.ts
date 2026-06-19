/**
 * Integration test — Phase 6
 *
 * Exercises the deterministic framework services against the live A-Society
 * framework state. Validates that component interfaces compose correctly:
 *
 *   Scaffold  →  Path Validator    (path validator can be run against index files)
 *   Workflow Graph Validator        (validates live permanent workflow definitions)
 *   Backward Pass Orderer           (reads record-folder workflow.yaml input)
 *
 * Framework state failures (missing files in indexes, etc.) are printed as
 * informational warnings and do not fail the suite, consistent with prior phases.
 */

import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, expect, it } from 'vitest';

import { IMPROVEMENT_CHOICE_MODE } from '../../shared/protocol-constants.js';
import {
  scaffoldFromManifestFile,
} from '../../src/framework-services/scaffolding-system.js';
import { validatePaths } from '../../src/framework-services/path-validator.js';
import { validateWorkflowFile } from '../../src/framework-services/workflow-graph-validator.js';
import { computeBackwardPassPlan } from '../../src/framework-services/backward-pass-orderer.js';
import type {
  BackwardPassEntry,
  BackwardPassPlan,
} from '../../src/framework-services/backward-pass-orderer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Path resolution ───────────────────────────────────────────────────────────

const SOCIETY_ROOT      = path.resolve(__dirname, '../../..');
const MANIFEST_PATH     = path.join(SOCIETY_ROOT, 'runtime/contracts/a-docs-manifest.yaml');
const GENERAL_INDEX     = path.join(SOCIETY_ROOT, 'index.md');
const INTERNAL_INDEX    = path.join(SOCIETY_ROOT, 'a-docs/indexes/main.md');
const WORKFLOW_FILE     = path.join(SOCIETY_ROOT, 'a-docs/workflow/main.yaml');
// Temp directory for the simulated project
const TEMP_BASE     = fs.mkdtempSync(path.join(tmpdir(), 'a-society-integration-'));
const REPO_ROOT     = path.join(TEMP_BASE, 'repo-root');
const PROJECT_ROOT  = path.join(TEMP_BASE, 'test-project');
const ADOCS_ROOT    = path.join(PROJECT_ROOT, 'a-docs');
const RECORD_FOLDER = path.join(TEMP_BASE, 'record-folder');
const RECORD_WORKFLOW = path.join(RECORD_FOLDER, 'workflow.yaml');

function cleanup(): void { fs.rmSync(TEMP_BASE, { recursive: true, force: true }); }
afterAll(cleanup);

fs.mkdirSync(REPO_ROOT, { recursive: true });
fs.symlinkSync(SOCIETY_ROOT, path.join(REPO_ROOT, 'a-society'), 'dir');
fs.mkdirSync(RECORD_FOLDER, { recursive: true });
fs.writeFileSync(
  RECORD_WORKFLOW,
  `workflow:
  nodes:
    - id: '1'
      role: owner
    - id: '2'
      role: curator
    - id: '3'
      role: owner
  edges:
    - from: '1'
      to: '2'
    - from: '2'
      to: '3'
`,
  'utf8',
);

// ── Scenario 1: Full project initialization ───────────────────────────────────

import type { ScaffoldResult } from '../../src/framework-services/scaffolding-system.js';
let scaffoldResult: ScaffoldResult | undefined;

it('Scenario 1 — scaffold runs against live runtime a-docs manifest without throwing', () => {
  expect(() => {
    scaffoldResult = scaffoldFromManifestFile(
      PROJECT_ROOT,
      'Integration Test Project',
      SOCIETY_ROOT,
      MANIFEST_PATH,
    );
  }).not.toThrow();
});

it('Scenario 1 — scaffold reports created and skipped arrays (no unexpected failures)', () => {
  if (!scaffoldResult) return; // prior test failed
  // Copy failures allowed only if source is absent in framework (index drift)
  const unexpected = scaffoldResult.failed.filter(f => !f.reason.includes('Cannot copy from'));
  if (scaffoldResult.failed.length > 0) {
    console.log(`    [info] ${scaffoldResult.failed.length} scaffold failure(s) — source templates absent in framework:`);
    scaffoldResult.failed.forEach(f => console.log(`      - ${path.basename(f.path)}: ${f.reason}`));
  }
  expect(unexpected.length).toBe(0);
  expect(scaffoldResult.created.length > 0).toBeTruthy();
});

it('Scenario 1 — a-docs/ directory tree was created', () => {
  expect(fs.existsSync(ADOCS_ROOT)).toBeTruthy();
  expect(fs.existsSync(path.join(ADOCS_ROOT, 'roles'))).toBeTruthy();
  expect(fs.existsSync(path.join(ADOCS_ROOT, 'improvement'))).toBeTruthy();
  expect(fs.existsSync(path.join(ADOCS_ROOT, 'roles', 'owner'))).toBeTruthy();
  expect(fs.existsSync(path.join(ADOCS_ROOT, 'improvement', 'meta-analysis.md'))).toBeTruthy();
});

// ── Scenario 2: Scaffold idempotency ─────────────────────────────────────────
// A second scaffold run on the same project skips all existing files.

it('Scenario 2 — second scaffold run skips all existing files (no overwrites)', () => {
  const second = scaffoldFromManifestFile(
    PROJECT_ROOT,
    'Integration Test Project',
    SOCIETY_ROOT,
    MANIFEST_PATH,
  );
  expect(second.created.length).toBe(0);
  expect(second.skipped.length > 0).toBeTruthy();
});

// ── Scenario 3: Path Validator against live indexes ───────────────────────────

it('Scenario 3 — path validator runs against general index without throwing', () => {
  let results: any[] | undefined;
  expect(() => {
    results = validatePaths(GENERAL_INDEX, REPO_ROOT);
  }).not.toThrow();
  expect(Array.isArray(results)).toBeTruthy();
  expect(results!.length > 0).toBeTruthy();
});

it('Scenario 3 — general index: all results have required fields', () => {
  const results = validatePaths(GENERAL_INDEX, REPO_ROOT);
  for (const r of results) {
    expect('variable' in r).toBeTruthy();
    expect('path' in r).toBeTruthy();
    expect('status' in r).toBeTruthy();
    expect(['ok', 'missing', 'parse-error']).toContain(r.status);
  }
});

it('Scenario 3 — path validator runs against internal index without throwing', () => {
  expect(() => validatePaths(INTERNAL_INDEX, REPO_ROOT)).not.toThrow();
});

it('Scenario 3 — internal index: any failures are framework drift, not tool errors', () => {
  const results = validatePaths(INTERNAL_INDEX, REPO_ROOT);
  const missing = results.filter(r => r.status === 'missing');
  const parseErrors = results.filter(r => r.status === 'parse-error');
  if (missing.length > 0) {
    console.log(`    [info] ${missing.length} missing path(s) in internal index (framework drift):`);
    missing.forEach(r => console.log(`      - ${r.variable}: ${r.path}`));
  }
  // parse-errors are tool errors; missing entries are framework drift — informational only
  expect(parseErrors.length).toBe(0);
});

// ── Scenario 4: Workflow Graph Validator + Backward Pass Orderer ──────────────

let backwardPlan: BackwardPassPlan | undefined;
let backwardOrder: BackwardPassEntry[] | undefined;

it('Scenario 4 — workflow graph validator runs on live workflow and reports framework drift without failing', () => {
  const result = validateWorkflowFile(WORKFLOW_FILE);
  expect(typeof result.valid === 'boolean').toBeTruthy();
  expect(Array.isArray(result.errors)).toBeTruthy();
  if (!result.valid) {
    console.log(`    [info] live workflow validation failed (framework drift): ${result.errors.join('; ')}`);
  }
});

it('Scenario 4 — backward pass orderer runs on record-folder workflow.yaml without throwing', () => {
  expect(() => {
    backwardPlan = computeBackwardPassPlan(RECORD_FOLDER, 'a-society-feedback', IMPROVEMENT_CHOICE_MODE.GRAPH_BASED);
    backwardOrder = backwardPlan.entries;
  }).not.toThrow();
});

it('Scenario 4 — backward pass order has at least two entries', () => {
  if (!backwardOrder) return;
  expect(backwardOrder.length >= 2).toBeTruthy();
});

it('Scenario 4 — backward pass last entry is feedback role', () => {
  if (!backwardOrder) return;
  const last = backwardOrder[backwardOrder.length - 1];
  expect(last.stepType).toBe('feedback');
  expect(last.sessionInstruction).toBe('new-session');
  expect(last.role).toBe('a-society-feedback');
});

it('Scenario 5 — meta-analysis entries reuse the existing session', () => {
  if (!backwardOrder) return;
  backwardOrder.slice(0, -1).forEach((entry) => {
    expect(entry.stepType).toBe('meta-analysis');
    expect(entry.sessionInstruction).toBe('existing-session');
  });
});
