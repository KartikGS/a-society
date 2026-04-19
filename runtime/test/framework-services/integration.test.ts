/**
 * Integration test — Phase 6
 *
 * Exercises the deterministic framework services against the live A-Society
 * framework state. Validates that component interfaces compose correctly:
 *
 *   Scaffold  →  Consent Utility   (scaffold calls consent utility for consent files)
 *   Scaffold  →  Path Validator    (path validator can be run against index files)
 *   Workflow Graph Validator        (validates live permanent workflow definitions)
 *   Backward Pass Orderer           (reads record-folder workflow.yaml input)
 *   Version Comparator              (standalone, fixture-based for hermeticity)
 *
 * Framework state failures (missing files in indexes, etc.) are printed as
 * informational warnings and do not fail the suite, consistent with prior phases.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  scaffold,
  scaffoldFromManifestFile,
} from '../../src/framework-services/scaffolding-system.js';
import { checkConsent } from '../../src/framework-services/consent-utility.js';
import { validatePaths } from '../../src/framework-services/path-validator.js';
import { validateWorkflowFile } from '../../src/framework-services/workflow-graph-validator.js';
import { computeBackwardPassPlan } from '../../src/framework-services/backward-pass-orderer.js';
import { compareVersions } from '../../src/framework-services/version-comparator.js';
import type {
  BackwardPassEntry,
  BackwardPassPlan,
} from '../../src/framework-services/backward-pass-orderer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

// ── Path resolution ───────────────────────────────────────────────────────────

const REPO_ROOT         = path.resolve(__dirname, '../../..', '..');
const SOCIETY_ROOT      = path.join(REPO_ROOT, 'a-society');
const MANIFEST_PATH     = path.join(SOCIETY_ROOT, 'general/manifest.yaml');
const PUBLIC_INDEX      = path.join(SOCIETY_ROOT, 'index.md');
const INTERNAL_INDEX    = path.join(SOCIETY_ROOT, 'a-docs/indexes/main.md');
const WORKFLOW_FILE     = path.join(SOCIETY_ROOT, 'a-docs/workflow/main.yaml');
const FRAMEWORK_VERSION_FIXTURE = path.join(__dirname, 'fixtures', 'framework-version-sample.md');
const VERSION_RECORD_FIXTURE = path.join(__dirname, 'fixtures', 'version-record-current.md');

// Temp directory for the simulated project
const TEMP_BASE     = fs.mkdtempSync(path.join(tmpdir(), 'a-society-integration-'));
const PROJECT_ROOT  = path.join(TEMP_BASE, 'test-project');
const ADOCS_ROOT    = path.join(PROJECT_ROOT, 'a-docs');
const RECORD_FOLDER = path.join(TEMP_BASE, 'record-folder');
const RECORD_WORKFLOW = path.join(RECORD_FOLDER, 'workflow.yaml');

function cleanup(): void { fs.rmSync(TEMP_BASE, { recursive: true, force: true }); }

console.log('\nintegration');

fs.mkdirSync(RECORD_FOLDER, { recursive: true });
fs.writeFileSync(
  RECORD_WORKFLOW,
  `workflow:
  nodes:
    - id: '1'
      role: Owner
    - id: '2'
      role: Curator
    - id: '3'
      role: Owner
  edges:
    - from: '1'
      to: '2'
    - from: '2'
      to: '3'
`,
  'utf8',
);

// ── Scenario 1: Full project initialization ───────────────────────────────────
// Scaffold → Consent Utility chain: scaffoldFromManifestFile creates consent
// files via the Consent Utility; checkConsent then reads each of the three back.

import type { ScaffoldResult } from '../../src/framework-services/scaffolding-system.js';
let scaffoldResult: ScaffoldResult | undefined;

test('Scenario 1 — scaffold runs against live manifest without throwing', () => {
  assert.doesNotThrow(() => {
    scaffoldResult = scaffoldFromManifestFile(
      PROJECT_ROOT,
      'Integration Test Project',
      SOCIETY_ROOT,
      MANIFEST_PATH,
      { consentValue: 'pending', consentRecordedBy: 'Integration Test' },
    );
  });
});

test('Scenario 1 — scaffold reports created and skipped arrays (no unexpected failures)', () => {
  if (!scaffoldResult) return; // prior test failed
  // Copy failures allowed only if source is absent in framework (index drift)
  const unexpected = scaffoldResult.failed.filter(f => !f.reason.includes('Cannot copy from'));
  if (scaffoldResult.failed.length > 0) {
    console.log(`    [info] ${scaffoldResult.failed.length} scaffold failure(s) — source templates absent in framework:`);
    scaffoldResult.failed.forEach(f => console.log(`      - ${path.basename(f.path)}: ${f.reason}`));
  }
  assert.strictEqual(unexpected.length, 0, `Unexpected scaffold failures: ${JSON.stringify(unexpected)}`);
  assert.ok(scaffoldResult.created.length > 0, 'Expected at least some files created');
});

test('Scenario 1 — a-docs/ directory tree was created', () => {
  assert.ok(fs.existsSync(ADOCS_ROOT), 'a-docs/ does not exist');
  assert.ok(fs.existsSync(path.join(ADOCS_ROOT, 'feedback')), 'feedback/ subdir missing');
  assert.ok(fs.existsSync(path.join(ADOCS_ROOT, 'roles')), 'roles/ subdir missing');
  assert.ok(fs.existsSync(path.join(ADOCS_ROOT, 'thinking')), 'thinking/ subdir missing');
  assert.ok(fs.existsSync(path.join(ADOCS_ROOT, 'improvement')), 'improvement/ subdir missing');
});

// ── Scenario 2: Scaffold → Consent Utility ────────────────────────────────────
// Consent files created by scaffold are readable by checkConsent.

test('Scenario 2 — onboarding consent file readable by checkConsent', () => {
  const result = checkConsent(ADOCS_ROOT, 'onboarding');
  assert.strictEqual(result.file_status, 'present');
  assert.strictEqual(result.consented, 'pending');
});

test('Scenario 2 — migration consent file readable by checkConsent', () => {
  const result = checkConsent(ADOCS_ROOT, 'migration');
  assert.strictEqual(result.file_status, 'present');
  assert.strictEqual(result.consented, 'pending');
});

test('Scenario 2 — curator-signal consent file readable by checkConsent', () => {
  const result = checkConsent(ADOCS_ROOT, 'curator-signal');
  assert.strictEqual(result.file_status, 'present');
  assert.strictEqual(result.consented, 'pending');
});

// ── Scenario 3: Scaffold idempotency ─────────────────────────────────────────
// A second scaffold run on the same project skips all existing files.

test('Scenario 3 — second scaffold run skips all existing files (no overwrites)', () => {
  const second = scaffoldFromManifestFile(
    PROJECT_ROOT,
    'Integration Test Project',
    SOCIETY_ROOT,
    MANIFEST_PATH,
  );
  assert.strictEqual(second.created.length, 0, `Expected 0 created, got ${second.created.length}`);
  assert.ok(second.skipped.length > 0, 'Expected some skipped entries');
});

// ── Scenario 4: Path Validator against live indexes ───────────────────────────

test('Scenario 4 — path validator runs against public index without throwing', () => {
  let results: any[] | undefined;
  assert.doesNotThrow(() => {
    results = validatePaths(PUBLIC_INDEX, REPO_ROOT);
  });
  assert.ok(Array.isArray(results));
  assert.ok(results!.length > 0);
});

test('Scenario 4 — public index: all results have required fields', () => {
  const results = validatePaths(PUBLIC_INDEX, REPO_ROOT);
  for (const r of results) {
    assert.ok('variable' in r, 'missing variable field');
    assert.ok('path' in r, 'missing path field');
    assert.ok('status' in r, 'missing status field');
    assert.ok(['ok', 'missing', 'parse-error'].includes(r.status), `unexpected status: ${r.status}`);
  }
});

test('Scenario 4 — path validator runs against internal index without throwing', () => {
  assert.doesNotThrow(() => validatePaths(INTERNAL_INDEX, REPO_ROOT));
});

test('Scenario 4 — internal index: any failures are framework drift, not tool errors', () => {
  const results = validatePaths(INTERNAL_INDEX, REPO_ROOT);
  const missing = results.filter(r => r.status === 'missing');
  const parseErrors = results.filter(r => r.status === 'parse-error');
  if (missing.length > 0) {
    console.log(`    [info] ${missing.length} missing path(s) in internal index (framework drift):`);
    missing.forEach(r => console.log(`      - ${r.variable}: ${r.path}`));
  }
  // parse-errors are tool errors; missing entries are framework drift — informational only
  assert.strictEqual(parseErrors.length, 0, `Path validator produced parse errors: ${JSON.stringify(parseErrors)}`);
});

// ── Scenario 5: Workflow Graph Validator + Backward Pass Orderer ──────────────

let backwardPlan: BackwardPassPlan | undefined;
let backwardOrder: BackwardPassEntry[] | undefined;

test('Scenario 5 — workflow graph validator runs on live workflow and reports framework drift without failing', () => {
  const result = validateWorkflowFile(WORKFLOW_FILE);
  assert.ok(typeof result.valid === 'boolean');
  assert.ok(Array.isArray(result.errors));
  if (!result.valid) {
    console.log(`    [info] live workflow validation failed (framework drift): ${result.errors.join('; ')}`);
  }
});

test('Scenario 5 — backward pass orderer runs on record-folder workflow.yaml without throwing', () => {
  assert.doesNotThrow(() => {
    backwardPlan = computeBackwardPassPlan(RECORD_FOLDER, 'Curator', 'graph-based');
    // Flatten 2D plan to flat array for downstream assertions
    backwardOrder = backwardPlan.flat();
  });
});

test('Scenario 5 — backward pass order has at least two entries', () => {
  if (!backwardOrder) return;
  assert.ok(backwardOrder.length >= 2, `Expected ≥ 2 entries, got ${backwardOrder.length}`);
});

test('Scenario 5 — backward pass last entry is synthesis role', () => {
  if (!backwardOrder) return;
  const last = backwardOrder[backwardOrder.length - 1];
  assert.strictEqual(last.stepType, 'synthesis', 'Last entry should be the synthesis role');
  assert.strictEqual(last.sessionInstruction, 'new-session', 'Synthesis step should open a new session');
  assert.strictEqual(last.role, 'Curator', 'synthesis entry role should equal synthesisRole argument');
});

test('Scenario 5 — meta-analysis entries reuse the existing session', () => {
  if (!backwardOrder) return;
  backwardOrder.slice(0, -1).forEach((entry) => {
    assert.strictEqual(entry.stepType, 'meta-analysis');
    assert.strictEqual(entry.sessionInstruction, 'existing-session');
  });
});

// ── Scenario 6: Version Comparator ────────────────────────────────────────────

test('Scenario 6 — version comparator runs against hermetic fixtures without throwing', () => {
  assert.doesNotThrow(() => compareVersions(VERSION_RECORD_FIXTURE, FRAMEWORK_VERSION_FIXTURE));
});

test('Scenario 6 — fixture project at current version has no unapplied reports', () => {
  const result = compareVersions(VERSION_RECORD_FIXTURE, FRAMEWORK_VERSION_FIXTURE);
  assert.strictEqual(result.projectVersion, 'v27.1');
  assert.strictEqual(result.currentVersion, 'v27.1');
  assert.deepStrictEqual(result.unappliedReports, []);
});

// ── Cleanup and summary ───────────────────────────────────────────────────────

cleanup();

console.log(`\n  ${passed} passing, ${failed} failing\n`);
if (failed > 0) process.exit(1);
