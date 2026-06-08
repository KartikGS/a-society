import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, expect, it } from 'vitest';
import { validatePaths } from '../../src/framework-services/path-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOCIETY_ROOT = path.resolve(__dirname, '..', '..', '..');
const REPO_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'path-validator-root-'));
fs.symlinkSync(SOCIETY_ROOT, path.join(REPO_ROOT, 'a-society'), 'dir');
const INTERNAL_INDEX = path.join(SOCIETY_ROOT, 'a-docs', 'indexes', 'main.md');
const GENERAL_INDEX = path.join(SOCIETY_ROOT, 'index.md');
const FIXTURE_INDEX = path.join(__dirname, 'fixtures', 'index-sample.md');
afterAll(() => fs.rmSync(REPO_ROOT, { recursive: true, force: true }));

// --- Core behavior (fixture-based) ---

it('returns array of results', () => {
  const results = validatePaths(FIXTURE_INDEX, REPO_ROOT);
  expect(Array.isArray(results)).toBeTruthy();
  expect(results.length).toBe(3);
});

it('all results have variable, path, and status fields', () => {
  const results = validatePaths(FIXTURE_INDEX, REPO_ROOT);
  for (const r of results) {
    expect(typeof r.variable === 'string').toBeTruthy();
    expect(typeof r.path === 'string').toBeTruthy();
    expect(['ok', 'missing', 'parse-error']).toContain(r.status);
  }
});

it('variables start with $', () => {
  const results = validatePaths(FIXTURE_INDEX, REPO_ROOT);
  for (const r of results) {
    expect(r.variable.startsWith('$')).toBeTruthy();
  }
});

it('marks existing paths as ok', () => {
  const results = validatePaths(FIXTURE_INDEX, REPO_ROOT);
  const existing = results.filter(r => r.variable === '$FIXTURE_PACKAGE_JSON');
  expect(existing.length).toBe(1);
  expect(existing[0].status).toBe('ok');
});

it('marks missing paths as missing', () => {
  const results = validatePaths(FIXTURE_INDEX, REPO_ROOT);
  const missing = results.filter(r => r.variable === '$FIXTURE_MISSING');
  expect(missing.length).toBe(1);
  expect(missing[0].status).toBe('missing');
});

it('skips section-header rows (no $ variable)', () => {
  // The general index has section headers like | **Instructions** | | |
  // They should not appear in results
  const results = validatePaths(GENERAL_INDEX, REPO_ROOT);
  const nonVar = results.filter(r => !r.variable.startsWith('$'));
  expect(nonVar.length).toBe(0);
});

it('strips backticks from path values', () => {
  // Paths in the index are formatted as `/path/to/file` with backticks — must be stripped
  const results = validatePaths(FIXTURE_INDEX, REPO_ROOT);
  for (const r of results) {
    expect(r.path.includes('`')).toBeFalsy();
  }
});

// --- Error handling ---

it('throws on unreadable index file', () => {
  expect(() => validatePaths('/nonexistent/path/index.md', REPO_ROOT)).toThrow(/Cannot read index file/);
});

it('throws when repoRoot is omitted', () => {
  expect(() =>
    // @ts-expect-error intentional wrong-arity call to test runtime guard
    validatePaths(FIXTURE_INDEX)
  ).toThrow(/repoRoot is required/);
});

// --- Framework state (informational - failures indicate index drift, not tool bugs) ---

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

it('reports framework index resolution state without failing on drift', () => {
  report('internal index', INTERNAL_INDEX);
  report('general index', GENERAL_INDEX);
});
