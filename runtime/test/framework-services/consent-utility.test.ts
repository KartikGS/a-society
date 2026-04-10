import assert from 'node:assert';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  createConsentFile,
  checkConsent,
  FEEDBACK_TYPES,
} from '../../src/framework-services/consent-utility.js';

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

// Set up a temp a-docs directory for this test run; clean up after
const TEMP_ADOCS = fs.mkdtempSync(path.join(tmpdir(), 'a-society-test-'));
function cleanup(): void { fs.rmSync(TEMP_ADOCS, { recursive: true, force: true }); }

console.log('\nconsent-utility');

// --- createConsentFile ---

test('creates a consent file at the correct path', () => {
  const result = createConsentFile(TEMP_ADOCS, 'onboarding', 'test-project', 'yes');
  assert.strictEqual(result.status, 'created');
  assert.ok(fs.existsSync(result.path));
  assert.ok(result.path.endsWith(path.join('feedback', 'onboarding', 'consent.md')));
});

test('creates parent directories if they do not exist', () => {
  const adocs = path.join(TEMP_ADOCS, 'new-project-adocs');
  const result = createConsentFile(adocs, 'migration', 'new-project', 'no');
  assert.strictEqual(result.status, 'created');
  assert.ok(fs.existsSync(result.path));
});

test('created file contains project name', () => {
  const result = createConsentFile(TEMP_ADOCS, 'curator-signal', 'my-project', 'pending');
  const content = fs.readFileSync(result.path, 'utf8');
  assert.ok(content.includes('my-project'), 'project name not found in consent file');
});

test('created file contains correct Consented value (yes)', () => {
  const adocs = path.join(TEMP_ADOCS, 'consent-yes');
  createConsentFile(adocs, 'onboarding', 'proj', 'yes');
  const content = fs.readFileSync(path.join(adocs, 'feedback', 'onboarding', 'consent.md'), 'utf8');
  assert.ok(content.match(/\*\*Consented:\*\*\s*Yes/), 'Consented: Yes not found');
});

test('created file contains correct Consented value (no)', () => {
  const adocs = path.join(TEMP_ADOCS, 'consent-no');
  createConsentFile(adocs, 'onboarding', 'proj', 'no');
  const content = fs.readFileSync(path.join(adocs, 'feedback', 'onboarding', 'consent.md'), 'utf8');
  assert.ok(content.match(/\*\*Consented:\*\*\s*No/), 'Consented: No not found');
});

test('created file contains correct Consented value (pending)', () => {
  const adocs = path.join(TEMP_ADOCS, 'consent-pending');
  createConsentFile(adocs, 'onboarding', 'proj', 'pending');
  const content = fs.readFileSync(path.join(adocs, 'feedback', 'onboarding', 'consent.md'), 'utf8');
  assert.ok(content.match(/\*\*Consented:\*\*\s*Pending/), 'Consented: Pending not found');
});

test('does not overwrite an existing file by default', () => {
  const adocs = path.join(TEMP_ADOCS, 'no-overwrite');
  createConsentFile(adocs, 'onboarding', 'proj', 'yes');
  const result = createConsentFile(adocs, 'onboarding', 'proj', 'no');
  assert.strictEqual(result.status, 'already-existed');
  // Verify original content is unchanged
  const content = fs.readFileSync(result.path, 'utf8');
  assert.ok(content.match(/\*\*Consented:\*\*\s*Yes/), 'original file should not be changed');
});

test('overwrites existing file when overwrite: true', () => {
  const adocs = path.join(TEMP_ADOCS, 'overwrite');
  createConsentFile(adocs, 'onboarding', 'proj', 'yes');
  const result = createConsentFile(adocs, 'onboarding', 'proj', 'no', { overwrite: true });
  assert.strictEqual(result.status, 'created');
  const content = fs.readFileSync(result.path, 'utf8');
  assert.ok(content.match(/\*\*Consented:\*\*\s*No/), 'file should be updated to No');
});

test('all three feedback types produce files at correct paths', () => {
  const adocs = path.join(TEMP_ADOCS, 'all-types');
  for (const type of Object.keys(FEEDBACK_TYPES)) {
    const result = createConsentFile(adocs, type, 'proj', 'pending');
    assert.strictEqual(result.status, 'created', `type ${type} failed: ${result.reason}`);
    assert.ok(fs.existsSync(result.path));
  }
});

test('throws on unknown feedback type', () => {
  assert.throws(
    () => createConsentFile(TEMP_ADOCS, 'unknown-type', 'proj', 'yes'),
    /Unknown feedback type/,
  );
});

test('throws on invalid consent value', () => {
  assert.throws(
    () => createConsentFile(TEMP_ADOCS, 'onboarding', 'proj', 'maybe'),
    /Invalid consent value/,
  );
});

test('throws when adocsPath is omitted', () => {
  assert.throws(
    // @ts-expect-error intentional wrong-type call to test runtime guard
    () => createConsentFile(undefined, 'onboarding', 'proj', 'yes'),
    /adocsPath is required/,
  );
});

// --- checkConsent ---

test('check: absent file returns file_status absent', () => {
  const adocs = path.join(TEMP_ADOCS, 'check-absent');
  const result = checkConsent(adocs, 'onboarding');
  assert.strictEqual(result.file_status, 'absent');
  assert.strictEqual(result.consented, 'unknown');
  assert.ok(result.path_checked.endsWith(path.join('feedback', 'onboarding', 'consent.md')));
});

test('check: present file with Consented: Yes returns yes', () => {
  const adocs = path.join(TEMP_ADOCS, 'check-yes');
  createConsentFile(adocs, 'onboarding', 'proj', 'yes');
  const result = checkConsent(adocs, 'onboarding');
  assert.strictEqual(result.file_status, 'present');
  assert.strictEqual(result.consented, 'yes');
});

test('check: present file with Consented: No returns no', () => {
  const adocs = path.join(TEMP_ADOCS, 'check-no');
  createConsentFile(adocs, 'migration', 'proj', 'no');
  const result = checkConsent(adocs, 'migration');
  assert.strictEqual(result.file_status, 'present');
  assert.strictEqual(result.consented, 'no');
});

test('check: present file with Consented: Pending returns pending', () => {
  const adocs = path.join(TEMP_ADOCS, 'check-pending');
  createConsentFile(adocs, 'curator-signal', 'proj', 'pending');
  const result = checkConsent(adocs, 'curator-signal');
  assert.strictEqual(result.file_status, 'present');
  assert.strictEqual(result.consented, 'pending');
});

test('check: path_checked is the resolved consent file path', () => {
  const adocs = path.join(TEMP_ADOCS, 'check-path');
  createConsentFile(adocs, 'migration', 'proj', 'yes');
  const result = checkConsent(adocs, 'migration');
  assert.ok(result.path_checked.includes('migration'));
  assert.ok(result.path_checked.endsWith('consent.md'));
});

test('check: throws on unknown feedback type', () => {
  assert.throws(
    () => checkConsent(TEMP_ADOCS, 'bad-type'),
    /Unknown feedback type/,
  );
});

// --- Cleanup ---

cleanup();

// --- Summary ---

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
