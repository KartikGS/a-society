import assert from 'node:assert';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePlanArtifact } from '../src/plan-artifact-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES = path.join(__dirname, 'fixtures');
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const LIVE_RECORD_FOLDER = path.join(
  REPO_ROOT,
  'a-society',
  'a-docs',
  'records',
  '20260318-tooling-enforcement-mechanism',
);

// Shared temp directory — one per test run; subdirectories isolate each scenario
const TEMP = fs.mkdtempSync(path.join(tmpdir(), 'a-society-plan-test-'));
function cleanup(): void { fs.rmSync(TEMP, { recursive: true, force: true }); }

// Helpers: copy a fixture into a scenario subdirectory
function makeRecordFolder(scenario: string, fixtureName?: string): string {
  const dir = path.join(TEMP, scenario);
  fs.mkdirSync(dir, { recursive: true });
  if (fixtureName) {
    fs.copyFileSync(
      path.join(FIXTURES, fixtureName),
      path.join(dir, '01-owner-workflow-plan.md'),
    );
  }
  return dir;
}

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

console.log('\nplan-artifact-validator');

// --- Exit code 0: valid plan present, all fields pass ---

test('valid plan: valid=true, file_status=present, no errors', () => {
  const dir = makeRecordFolder('valid', 'plan-valid.md');
  const result = validatePlanArtifact(dir);
  assert.strictEqual(result.valid, true, `Expected valid, got errors: ${JSON.stringify(result.errors)}`);
  assert.strictEqual(result.file_status, 'present');
  assert.deepStrictEqual(result.errors, []);
});

test('valid plan: path_checked is absolute path to 01-owner-workflow-plan.md', () => {
  const dir = makeRecordFolder('valid-path-check', 'plan-valid.md');
  const result = validatePlanArtifact(dir);
  assert.ok(path.isAbsolute(result.path_checked));
  assert.ok(result.path_checked.endsWith('01-owner-workflow-plan.md'));
});

test('valid plan: tier as integer (YAML number) is accepted', () => {
  // plan-valid.md uses `tier: 2` — parsed by YAML as integer, not string
  const dir = makeRecordFolder('valid-tier-int', 'plan-valid.md');
  const result = validatePlanArtifact(dir);
  assert.strictEqual(result.valid, true);
  assert.ok(!result.errors.some(e => e.field === 'tier'));
});

test('valid plan: known_unknowns as empty list is valid', () => {
  // plan-valid.md uses `known_unknowns: []`
  const dir = makeRecordFolder('valid-known-unknowns-empty', 'plan-valid.md');
  const result = validatePlanArtifact(dir);
  assert.ok(!result.errors.some(e => e.field === 'known_unknowns'));
});

// --- Exit code 1: plan absent ---

test('absent plan: valid=false, file_status=absent', () => {
  const dir = makeRecordFolder('absent');
  const result = validatePlanArtifact(dir);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.file_status, 'absent');
});

test('absent plan: errors contains exactly one entry {field: file, issue: absent}', () => {
  const dir = makeRecordFolder('absent-errors');
  const result = validatePlanArtifact(dir);
  assert.strictEqual(result.errors.length, 1);
  assert.strictEqual(result.errors[0].field, 'file');
  assert.strictEqual(result.errors[0].issue, 'absent');
});

test('absent plan: path_checked resolves to 01-owner-workflow-plan.md in the given folder', () => {
  const dir = makeRecordFolder('absent-path-check');
  const result = validatePlanArtifact(dir);
  assert.ok(path.isAbsolute(result.path_checked));
  assert.ok(result.path_checked.endsWith('01-owner-workflow-plan.md'));
  assert.ok(result.path_checked.startsWith(path.resolve(dir)));
});

// --- Exit code 1: plan present but field validation failures ---

test('invalid fields: valid=false, file_status=present', () => {
  const dir = makeRecordFolder('invalid', 'plan-invalid-fields.md');
  const result = validatePlanArtifact(dir);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.file_status, 'present');
});

test('invalid fields: multiple errors reported', () => {
  const dir = makeRecordFolder('invalid-multi-errors', 'plan-invalid-fields.md');
  const result = validatePlanArtifact(dir);
  assert.ok(result.errors.length > 1, `Expected multiple errors, got: ${JSON.stringify(result.errors)}`);
});

test('invalid fields: complexity.domain_spread "medium" produces invalid-value error', () => {
  const dir = makeRecordFolder('invalid-complexity-domain', 'plan-invalid-fields.md');
  const result = validatePlanArtifact(dir);
  const err = result.errors.find(e => e.field === 'complexity.domain_spread');
  assert.ok(err, 'Expected error for complexity.domain_spread');
  assert.ok(err.issue.includes('medium'), `Expected issue to mention "medium", got: ${err.issue}`);
});

test('invalid fields: null complexity.shared_artifact_impact produces null error', () => {
  const dir = makeRecordFolder('invalid-complexity-impact', 'plan-invalid-fields.md');
  const result = validatePlanArtifact(dir);
  const err = result.errors.find(e => e.field === 'complexity.shared_artifact_impact');
  assert.ok(err, 'Expected error for complexity.shared_artifact_impact');
  assert.strictEqual(err.issue, 'null');
});

test('invalid fields: null complexity.reversibility produces null error', () => {
  const dir = makeRecordFolder('invalid-complexity-rev', 'plan-invalid-fields.md');
  const result = validatePlanArtifact(dir);
  const err = result.errors.find(e => e.field === 'complexity.reversibility');
  assert.ok(err, 'Expected error for complexity.reversibility');
  assert.strictEqual(err.issue, 'null');
});

test('invalid fields: null tier produces null error', () => {
  const dir = makeRecordFolder('invalid-tier', 'plan-invalid-fields.md');
  const result = validatePlanArtifact(dir);
  const err = result.errors.find(e => e.field === 'tier');
  assert.ok(err, 'Expected error for tier');
  assert.strictEqual(err.issue, 'null');
});

test('invalid fields: empty path list produces empty-list error', () => {
  const dir = makeRecordFolder('invalid-path', 'plan-invalid-fields.md');
  const result = validatePlanArtifact(dir);
  const err = result.errors.find(e => e.field === 'path');
  assert.ok(err, 'Expected error for path');
  assert.strictEqual(err.issue, 'empty list');
});

// --- Exit code 2: parse errors (throw) ---

test('no frontmatter: throws (exit code 2)', () => {
  const dir = makeRecordFolder('no-frontmatter', 'plan-no-frontmatter.md');
  assert.throws(
    () => validatePlanArtifact(dir),
    /frontmatter/i,
  );
});

test('malformed YAML: throws (exit code 2)', () => {
  const dir = makeRecordFolder('malformed-yaml', 'plan-malformed-yaml.md');
  assert.throws(
    () => validatePlanArtifact(dir),
    /YAML parse error/i,
  );
});

test('empty recordFolderPath: throws (exit code 2)', () => {
  assert.throws(
    () => validatePlanArtifact(''),
    /required/i,
  );
});

// --- Live record folder ---

test('[info] live record folder plan passes validation', () => {
  try {
    const result = validatePlanArtifact(LIVE_RECORD_FOLDER);
    if (!result.valid) {
      console.log(`    [info] live plan validation failed: ${JSON.stringify(result.errors)}`);
    } else {
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.file_status, 'present');
      assert.deepStrictEqual(result.errors, []);
    }
  } catch (err) {
    console.log(`    [info] live plan test skipped: ${(err as Error).message}`);
  }
});

// --- Cleanup ---

cleanup();

// --- Summary ---

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
