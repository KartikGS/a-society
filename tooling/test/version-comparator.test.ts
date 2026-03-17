import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareVersions, parseVersion, isGreaterThan } from '../src/version-comparator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const FRAMEWORK_VERSION = path.join(REPO_ROOT, 'a-society', 'VERSION.md');
const UPDATES_DIR = path.join(REPO_ROOT, 'a-society', 'updates');
const FIXTURES = path.join(__dirname, 'fixtures');

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

console.log('\nversion-comparator');

// --- parseVersion ---

test('parseVersion: valid version', () => {
  const v = parseVersion('v9.0');
  assert.deepStrictEqual(v, { major: 9, minor: 0 });
});

test('parseVersion: minor > 0', () => {
  const v = parseVersion('v4.1');
  assert.deepStrictEqual(v, { major: 4, minor: 1 });
});

test('parseVersion: throws on invalid format', () => {
  assert.throws(() => parseVersion('9.0'), /Invalid version format/);
  assert.throws(() => parseVersion('v9'), /Invalid version format/);
  assert.throws(() => parseVersion(''), /Invalid version format/);
});

// --- isGreaterThan ---

test('isGreaterThan: major wins', () => {
  assert.ok(isGreaterThan({ major: 9, minor: 0 }, { major: 8, minor: 5 }));
  assert.ok(!isGreaterThan({ major: 8, minor: 5 }, { major: 9, minor: 0 }));
});

test('isGreaterThan: minor when majors equal', () => {
  assert.ok(isGreaterThan({ major: 4, minor: 1 }, { major: 4, minor: 0 }));
  assert.ok(!isGreaterThan({ major: 4, minor: 0 }, { major: 4, minor: 1 }));
});

test('isGreaterThan: equal versions return false', () => {
  assert.ok(!isGreaterThan({ major: 5, minor: 0 }, { major: 5, minor: 0 }));
});

// --- compareVersions: project up to date ---

test('project at current version: no unapplied reports', () => {
  const result = compareVersions(
    path.join(FIXTURES, 'version-record-current.md'),
    FRAMEWORK_VERSION,
    UPDATES_DIR,
  );
  assert.strictEqual(result.projectVersion, 'v11.1');
  assert.strictEqual(result.currentVersion, 'v11.1');
  assert.strictEqual(result.unappliedReports.length, 0);
});

// --- compareVersions: project behind ---

test('project behind current version: returns unapplied reports', () => {
  const result = compareVersions(
    path.join(FIXTURES, 'version-record-behind.md'),
    FRAMEWORK_VERSION,
    UPDATES_DIR,
  );
  assert.strictEqual(result.projectVersion, 'v4.1');
  assert.strictEqual(result.currentVersion, 'v11.1');
  assert.ok(result.unappliedReports.length > 0, 'expected unapplied reports');
});

test('project behind: unapplied reports are in ascending version order', () => {
  const result = compareVersions(
    path.join(FIXTURES, 'version-record-behind.md'),
    FRAMEWORK_VERSION,
    UPDATES_DIR,
  );
  const versions = result.unappliedReports.map(r => parseVersion(r.version));
  for (let i = 1; i < versions.length; i++) {
    const prev = versions[i - 1];
    const curr = versions[i];
    assert.ok(
      isGreaterThan(curr, prev) || (curr.major === prev.major && curr.minor === prev.minor),
      `expected ascending order at index ${i}: v${prev.major}.${prev.minor} then v${curr.major}.${curr.minor}`,
    );
  }
});

test('project behind: unapplied reports have filename and version fields', () => {
  const result = compareVersions(
    path.join(FIXTURES, 'version-record-behind.md'),
    FRAMEWORK_VERSION,
    UPDATES_DIR,
  );
  for (const r of result.unappliedReports) {
    assert.ok(typeof r.filename === 'string' && r.filename.endsWith('.md'), `filename: ${r.filename}`);
    assert.ok(r.version.match(/^v\d+\.\d+$/), `version: ${r.version}`);
  }
});

test('project behind: v5.0 report is in unapplied list', () => {
  const result = compareVersions(
    path.join(FIXTURES, 'version-record-behind.md'),
    FRAMEWORK_VERSION,
    UPDATES_DIR,
  );
  const filenames = result.unappliedReports.map(r => r.filename);
  assert.ok(
    filenames.includes('2026-03-12-handoff-copyable-inputs.md'),
    `expected 2026-03-12-handoff-copyable-inputs.md in ${JSON.stringify(filenames)}`,
  );
});

// --- compareVersions: baseline with no updates applied ---

test('project initialized at current version: no unapplied reports', () => {
  const result = compareVersions(
    path.join(FIXTURES, 'version-record-no-updates.md'),
    FRAMEWORK_VERSION,
    UPDATES_DIR,
  );
  assert.strictEqual(result.projectVersion, 'v11.1');
  assert.strictEqual(result.unappliedReports.length, 0);
});

// --- Error handling ---

test('throws on unreadable project version file', () => {
  assert.throws(
    () => compareVersions('/nonexistent/version.md', FRAMEWORK_VERSION, UPDATES_DIR),
    /Cannot read project version file/,
  );
});

test('throws on unreadable framework version file', () => {
  assert.throws(
    () => compareVersions(
      path.join(FIXTURES, 'version-record-current.md'),
      '/nonexistent/VERSION.md',
      UPDATES_DIR,
    ),
    /Cannot read VERSION\.md/,
  );
});

// --- Summary ---

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
