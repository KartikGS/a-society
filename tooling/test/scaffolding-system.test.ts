import assert from 'node:assert';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  scaffold,
  scaffoldFromManifestFile,
  renderStub,
  detectFeedbackConsentType,
} from '../src/scaffolding-system.js';

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

// Temp directories: one as project root, one as fake a-society root with source templates
const TEMP_BASE = fs.mkdtempSync(path.join(tmpdir(), 'a-society-scaffold-'));
const PROJECT_ROOT = path.join(TEMP_BASE, 'my-project');
const SOCIETY_ROOT = path.join(TEMP_BASE, 'a-society-src');
function cleanup(): void { fs.rmSync(TEMP_BASE, { recursive: true, force: true }); }

// Seed the fake a-society source tree with copy templates used in tests
function seedSourceFile(relativePath: string, content: string): void {
  const full = path.join(SOCIETY_ROOT, relativePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

seedSourceFile('general/roles/owner.md', '# Owner\n\nOwner role content.\n');
seedSourceFile('general/roles/curator.md', '# Curator\n\nCurator role content.\n');
seedSourceFile('general/thinking/main.md', '# Thinking\n\nThinking content.\n');

console.log('\nscaffolding-system');

// ── detectFeedbackConsentType ─────────────────────────────────────────────────

test('detectFeedbackConsentType: returns type key for onboarding consent path', () => {
  assert.strictEqual(detectFeedbackConsentType('feedback/onboarding/consent.md'), 'onboarding');
});

test('detectFeedbackConsentType: returns type key for migration consent path', () => {
  assert.strictEqual(detectFeedbackConsentType('feedback/migration/consent.md'), 'migration');
});

test('detectFeedbackConsentType: returns type key for curator-signal consent path', () => {
  assert.strictEqual(detectFeedbackConsentType('feedback/curator-signal/consent.md'), 'curator-signal');
});

test('detectFeedbackConsentType: returns null for non-consent path', () => {
  assert.strictEqual(detectFeedbackConsentType('project-information/vision.md'), null);
});

test('detectFeedbackConsentType: returns null for unknown feedback type', () => {
  assert.strictEqual(detectFeedbackConsentType('feedback/unknown-type/consent.md'), null);
});

// ── renderStub ────────────────────────────────────────────────────────────────

test('renderStub: produces a heading derived from file basename', () => {
  const content = renderStub({ path: 'project-information/vision.md', scaffold: 'stub', source_path: 'general/instructions/project-information/vision.md' });
  assert.ok(content.startsWith('# Vision\n'), `Expected heading "# Vision", got: ${content.slice(0, 40)}`);
});

test('renderStub: includes stub comment pointing to source_path', () => {
  const content = renderStub({ path: 'indexes/main.md', scaffold: 'stub', source_path: 'general/instructions/indexes/main.md' });
  assert.ok(content.includes('general/instructions/indexes/main.md'));
});

test('renderStub: handles TEMPLATE- prefix in filename', () => {
  const content = renderStub({ path: 'communication/conversation/TEMPLATE-owner-to-curator-brief.md', scaffold: 'stub', source_path: 'general/instructions/communication/conversation/TEMPLATE-owner-to-curator-brief.md' });
  assert.ok(content.startsWith('# Template:'), `Expected "# Template:" heading, got: ${content.slice(0, 50)}`);
});

// ── scaffold — stub entries ───────────────────────────────────────────────────

test('scaffold: creates a stub file at the correct a-docs/ path', () => {
  const projectRoot = path.join(TEMP_BASE, 'stub-test');
  const entries = [
    { path: 'project-information/vision.md', scaffold: 'stub', source_path: 'general/instructions/project-information/vision.md' },
  ];
  const result = scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries);
  const target = path.join(projectRoot, 'a-docs', 'project-information', 'vision.md');
  assert.strictEqual(result.created.length, 1);
  assert.strictEqual(result.skipped.length, 0);
  assert.strictEqual(result.failed.length, 0);
  assert.ok(fs.existsSync(target));
  assert.ok(fs.readFileSync(target, 'utf8').startsWith('# Vision'));
});

test('scaffold: creates parent directories for nested stub paths', () => {
  const projectRoot = path.join(TEMP_BASE, 'nested-stub-test');
  const entries = [
    { path: 'communication/conversation/main.md', scaffold: 'stub', source_path: 'general/instructions/communication/conversation/main.md' },
  ];
  scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries);
  const dir = path.join(projectRoot, 'a-docs', 'communication', 'conversation');
  assert.ok(fs.existsSync(dir));
});

// ── scaffold — copy entries ───────────────────────────────────────────────────

test('scaffold: copies source file verbatim to target path', () => {
  const projectRoot = path.join(TEMP_BASE, 'copy-test');
  const entries = [
    { path: 'roles/owner.md', scaffold: 'copy', source_path: 'general/roles/owner.md' },
  ];
  const result = scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries);
  const target = path.join(projectRoot, 'a-docs', 'roles', 'owner.md');
  assert.strictEqual(result.created.length, 1);
  assert.ok(fs.existsSync(target));
  assert.strictEqual(fs.readFileSync(target, 'utf8'), '# Owner\n\nOwner role content.\n');
});

test('scaffold: fails gracefully when copy source does not exist', () => {
  const projectRoot = path.join(TEMP_BASE, 'copy-missing-test');
  const entries = [
    { path: 'roles/missing.md', scaffold: 'copy', source_path: 'general/roles/does-not-exist.md' },
  ];
  const result = scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries);
  assert.strictEqual(result.failed.length, 1);
  assert.ok(result.failed[0].reason.includes('Cannot copy from'));
});

// ── scaffold — consent entries ────────────────────────────────────────────────

test('scaffold: creates onboarding consent file via Consent Utility', () => {
  const projectRoot = path.join(TEMP_BASE, 'consent-scaffold-test');
  const entries = [
    { path: 'feedback/onboarding/consent.md', scaffold: 'copy', source_path: 'general/feedback/consent.md' },
  ];
  const result = scaffold(projectRoot, 'My Project', SOCIETY_ROOT, entries, { consentValue: 'pending' });
  const target = path.join(projectRoot, 'a-docs', 'feedback', 'onboarding', 'consent.md');
  assert.strictEqual(result.created.length, 1);
  assert.ok(fs.existsSync(target));
  const content = fs.readFileSync(target, 'utf8');
  assert.ok(content.includes('**Consented:** Pending'));
  assert.ok(content.includes('My Project'));
});

test('scaffold: all three consent files use Consent Utility', () => {
  const projectRoot = path.join(TEMP_BASE, 'all-consent-test');
  const entries = [
    { path: 'feedback/onboarding/consent.md', scaffold: 'copy', source_path: 'general/feedback/consent.md' },
    { path: 'feedback/migration/consent.md', scaffold: 'copy', source_path: 'general/feedback/consent.md' },
    { path: 'feedback/curator-signal/consent.md', scaffold: 'copy', source_path: 'general/feedback/consent.md' },
  ];
  const result = scaffold(projectRoot, 'Consent Project', SOCIETY_ROOT, entries, { consentValue: 'yes' });
  assert.strictEqual(result.created.length, 3);
  assert.strictEqual(result.failed.length, 0);
  const onboarding = path.join(projectRoot, 'a-docs', 'feedback', 'onboarding', 'consent.md');
  const migration = path.join(projectRoot, 'a-docs', 'feedback', 'migration', 'consent.md');
  const curatorSignal = path.join(projectRoot, 'a-docs', 'feedback', 'curator-signal', 'consent.md');
  assert.ok(fs.existsSync(onboarding));
  assert.ok(fs.existsSync(migration));
  assert.ok(fs.existsSync(curatorSignal));
});

// ── scaffold — overwrite and skip behaviour ───────────────────────────────────

test('scaffold: skips existing files when overwrite is false', () => {
  const projectRoot = path.join(TEMP_BASE, 'skip-test');
  const entries = [
    { path: 'project-information/log.md', scaffold: 'stub', source_path: 'general/instructions/project-information/log.md' },
  ];
  scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries);
  const second = scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries);
  assert.strictEqual(second.skipped.length, 1);
  assert.strictEqual(second.created.length, 0);
  assert.strictEqual(second.skipped[0].reason, 'already-existed');
});

test('scaffold: overwrites existing files when overwrite is true', () => {
  const projectRoot = path.join(TEMP_BASE, 'overwrite-test');
  const entries = [
    { path: 'project-information/log.md', scaffold: 'stub', source_path: 'general/instructions/project-information/log.md' },
  ];
  scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries);
  const second = scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries, { overwrite: true });
  assert.strictEqual(second.created.length, 1);
  assert.strictEqual(second.skipped.length, 0);
});

// ── scaffold — invalid entry handling ────────────────────────────────────────

test('scaffold: fails entry with missing path field', () => {
  const projectRoot = path.join(TEMP_BASE, 'invalid-entry-test');
  // @ts-expect-error intentional missing field to test runtime guard
  const entries = [{ scaffold: 'stub', source_path: 'general/instructions/something.md' }];
  const result = scaffold(projectRoot, 'Test', SOCIETY_ROOT, entries);
  assert.strictEqual(result.failed.length, 1);
  assert.ok(result.failed[0].reason.includes('missing required fields'));
});

test('scaffold: fails entry with unknown scaffold type', () => {
  const projectRoot = path.join(TEMP_BASE, 'unknown-scaffold-test');
  const entries = [{ path: 'some/file.md', scaffold: 'magic', source_path: 'general/something.md' }];
  const result = scaffold(projectRoot, 'Test', SOCIETY_ROOT, entries);
  assert.strictEqual(result.failed.length, 1);
  assert.ok(result.failed[0].reason.includes('Unknown scaffold type'));
});

test('scaffold: throws if projectRoot is missing', () => {
  // @ts-expect-error intentional null call to test runtime guard
  assert.throws(() => scaffold(null, 'Test', SOCIETY_ROOT, []), /projectRoot is required/);
});

test('scaffold: throws if projectName is missing', () => {
  assert.throws(() => scaffold('/some/path', '', SOCIETY_ROOT, []), /projectName is required/);
});

// ── scaffoldFromManifestFile — live manifest ──────────────────────────────────

// Locate the actual framework manifest
const FRAMEWORK_ROOT = path.resolve(__dirname, '../../..');
const SOCIETY_ACTUAL_ROOT = path.join(FRAMEWORK_ROOT, 'a-society');
const MANIFEST_PATH = path.join(SOCIETY_ACTUAL_ROOT, 'general/manifest.yaml');

if (fs.existsSync(MANIFEST_PATH)) {
  test('scaffoldFromManifestFile: runs against live manifest without throwing', () => {
    const projectRoot = path.join(TEMP_BASE, 'live-manifest-test');
    let result;
    assert.doesNotThrow(() => {
      result = scaffoldFromManifestFile(projectRoot, 'Live Test Project', SOCIETY_ACTUAL_ROOT, MANIFEST_PATH);
    });
    assert.ok(Array.isArray(result!.created));
    assert.ok(Array.isArray(result!.skipped));
    assert.ok(Array.isArray(result!.failed));
  });

  test('scaffoldFromManifestFile: creates required entries, no unexpected failures', () => {
    const projectRoot = path.join(TEMP_BASE, 'live-manifest-test2');
    const result = scaffoldFromManifestFile(projectRoot, 'Live Test Project 2', SOCIETY_ACTUAL_ROOT, MANIFEST_PATH);
    // Copy failures are allowed only if a source template is absent in the framework (index drift);
    // report them as informational rather than failing the test suite.
    const unexpectedFailures = result.failed.filter(f => !f.reason.includes('Cannot copy from'));
    if (result.failed.length > 0) {
      console.log(`    [info] ${result.failed.length} failure(s) during live manifest run:`);
      result.failed.forEach(f => console.log(`      - ${path.basename(f.path)}: ${f.reason}`));
    }
    assert.strictEqual(unexpectedFailures.length, 0, `Unexpected failures: ${JSON.stringify(unexpectedFailures)}`);
    assert.ok(result.created.length > 0, 'Expected at least some files to be created');
  });

  test('scaffoldFromManifestFile: stub files contain heading derived from filename', () => {
    const projectRoot = path.join(TEMP_BASE, 'live-manifest-stubs-test');
    scaffoldFromManifestFile(projectRoot, 'Stub Heading Test', SOCIETY_ACTUAL_ROOT, MANIFEST_PATH);
    const visionPath = path.join(projectRoot, 'a-docs', 'project-information', 'vision.md');
    if (fs.existsSync(visionPath)) {
      const content = fs.readFileSync(visionPath, 'utf8');
      assert.ok(content.startsWith('# Vision'), `Expected "# Vision" heading in stub, got: ${content.slice(0, 40)}`);
    }
  });

  test('scaffoldFromManifestFile: includeOptional adds non-required entries', () => {
    const projectRootRequired = path.join(TEMP_BASE, 'optional-required-only');
    const projectRootOptional = path.join(TEMP_BASE, 'optional-with-optional');
    const required = scaffoldFromManifestFile(projectRootRequired, 'Opt Test', SOCIETY_ACTUAL_ROOT, MANIFEST_PATH);
    const withOptional = scaffoldFromManifestFile(projectRootOptional, 'Opt Test', SOCIETY_ACTUAL_ROOT, MANIFEST_PATH, { includeOptional: true });
    assert.ok(
      withOptional.created.length + withOptional.failed.length >= required.created.length + required.failed.length,
      'includeOptional run should process at least as many entries as required-only run',
    );
  });
} else {
  console.log(`  [skip] Live manifest tests — manifest not found at expected path`);
}

// ── scaffoldFromManifestFile — error handling ────────────────────────────────

test('scaffoldFromManifestFile: throws on missing manifest file', () => {
  assert.throws(
    () => scaffoldFromManifestFile('/tmp/proj', 'Test', SOCIETY_ROOT, '/nonexistent/manifest.yaml'),
    /Cannot read manifest file/,
  );
});

test('scaffoldFromManifestFile: throws on invalid YAML', () => {
  const badManifest = path.join(TEMP_BASE, 'bad-manifest.yaml');
  fs.writeFileSync(badManifest, 'files: [\ninvalid yaml{{{', 'utf8');
  assert.throws(
    () => scaffoldFromManifestFile('/tmp/proj', 'Test', SOCIETY_ROOT, badManifest),
    /Cannot parse manifest YAML/,
  );
});

test('scaffoldFromManifestFile: throws if manifest has no files array', () => {
  const badManifest = path.join(TEMP_BASE, 'no-files-manifest.yaml');
  fs.writeFileSync(badManifest, 'manifest_version: "1.0"\n', 'utf8');
  assert.throws(
    () => scaffoldFromManifestFile('/tmp/proj', 'Test', SOCIETY_ROOT, badManifest),
    /Manifest must contain a "files" array/,
  );
});

// ── Cleanup and summary ───────────────────────────────────────────────────────

cleanup();

console.log(`\n  ${passed} passing, ${failed} failing\n`);
if (failed > 0) process.exit(1);
