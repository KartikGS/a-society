import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePaths } from '../../src/framework-services/path-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const INTERNAL_INDEX = path.join(REPO_ROOT, 'a-society', 'a-docs', 'indexes', 'main.md');
const PUBLIC_INDEX = path.join(REPO_ROOT, 'a-society', 'index.md');
const FIXTURE_INDEX = path.join(__dirname, 'fixtures', 'index-sample.md');

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

console.log('\npath-validator');

// --- Core behavior (fixture-based) ---

test('returns array of results', () => {
  const results = validatePaths(FIXTURE_INDEX, REPO_ROOT);
  assert.ok(Array.isArray(results));
  assert.strictEqual(results.length, 3);
});

test('all results have variable, path, and status fields', () => {
  const results = validatePaths(FIXTURE_INDEX, REPO_ROOT);
  for (const r of results) {
    assert.ok(typeof r.variable === 'string');
    assert.ok(typeof r.path === 'string');
    assert.ok(['ok', 'missing', 'parse-error'].includes(r.status));
  }
});

test('variables start with $', () => {
  const results = validatePaths(FIXTURE_INDEX, REPO_ROOT);
  for (const r of results) {
    assert.ok(r.variable.startsWith('$'), `expected $ prefix: ${r.variable}`);
  }
});

test('marks existing paths as ok', () => {
  const results = validatePaths(FIXTURE_INDEX, REPO_ROOT);
  const existing = results.filter(r => r.variable === '$FIXTURE_PACKAGE_JSON');
  assert.strictEqual(existing.length, 1);
  assert.strictEqual(existing[0].status, 'ok');
});

test('marks missing paths as missing', () => {
  const results = validatePaths(FIXTURE_INDEX, REPO_ROOT);
  const missing = results.filter(r => r.variable === '$FIXTURE_MISSING');
  assert.strictEqual(missing.length, 1);
  assert.strictEqual(missing[0].status, 'missing');
});

test('skips section-header rows (no $ variable)', () => {
  // The public index has section headers like | **Agents** | | |
  // They should not appear in results
  const results = validatePaths(PUBLIC_INDEX, REPO_ROOT);
  const nonVar = results.filter(r => !r.variable.startsWith('$'));
  assert.strictEqual(nonVar.length, 0, `unexpected non-variable entries: ${JSON.stringify(nonVar)}`);
});

test('strips backticks from path values', () => {
  // Paths in the index are formatted as `/path/to/file` with backticks — must be stripped
  const results = validatePaths(FIXTURE_INDEX, REPO_ROOT);
  for (const r of results) {
    assert.ok(!r.path.includes('`'), `backtick found in path: ${r.path}`);
  }
});

// --- Error handling ---

test('throws on unreadable index file', () => {
  assert.throws(
    () => validatePaths('/nonexistent/path/index.md', REPO_ROOT),
    /Cannot read index file/,
  );
});

test('throws when repoRoot is omitted', () => {
  assert.throws(
    // @ts-expect-error intentional wrong-arity call to test runtime guard
    () => validatePaths(FIXTURE_INDEX),
    /repoRoot is required/,
  );
});

// --- Framework state (informational — failures indicate index drift, not tool bugs) ---

console.log('\n  Framework state (informational):');

function report(indexName: string, indexPath: string): void {
  let results;
  try {
    results = validatePaths(indexPath, REPO_ROOT);
  } catch (err) {
    console.error(`  ! ${indexName}: failed to parse — ${(err as Error).message}`);
    return;
  }
  const missing = results.filter(r => r.status !== 'ok');
  if (missing.length === 0) {
    console.log(`  ✓ ${indexName}: all ${results.length} entries resolve`);
  } else {
    console.warn(`  ! ${indexName}: ${missing.length} entry(s) do not resolve (index drift):`);
    for (const r of missing) {
      console.warn(`      ${r.variable}: ${r.path} [${r.status}]`);
    }
  }
}

report('internal index', INTERNAL_INDEX);
report('public index', PUBLIC_INDEX);

// --- Summary ---

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
