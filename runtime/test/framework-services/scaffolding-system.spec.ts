import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, expect, it } from 'vitest';
import {
  scaffold,
  scaffoldFromManifestFile,
  renderStub,
} from '../../src/framework-services/scaffolding-system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Temp directories: one as project root, one as fake a-society root with source templates
const TEMP_BASE = fs.mkdtempSync(path.join(tmpdir(), 'a-society-scaffold-'));
const SOCIETY_ROOT = path.join(TEMP_BASE, 'a-society-src');
function cleanup(): void { fs.rmSync(TEMP_BASE, { recursive: true, force: true }); }
afterAll(cleanup);

// Seed the fake a-society source tree with copy templates used in tests
function seedSourceFile(relativePath: string, content: string): void {
  const full = path.join(SOCIETY_ROOT, relativePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

seedSourceFile('general/roles/owner/main.md', '# Owner\n\nOwner role content.\n');

// ── renderStub ────────────────────────────────────────────────────────────────

it('renderStub: produces a heading derived from file basename', () => {
  const content = renderStub({ path: 'project-information/vision.md', scaffold: 'stub', source_path: 'general/instructions/project-information/vision.md' });
  expect(content.startsWith('# Vision\n')).toBeTruthy();
});

it('renderStub: includes stub comment pointing to source_path', () => {
  const content = renderStub({ path: 'indexes/main.md', scaffold: 'stub', source_path: 'general/instructions/indexes/main.md' });
  expect(content.includes('general/instructions/indexes/main.md')).toBeTruthy();
});

it('renderStub: handles TEMPLATE- prefix in filename', () => {
  const content = renderStub({ path: 'communication/conversation/TEMPLATE-owner-workflow-plan.md', scaffold: 'stub', source_path: 'general/instructions/communication/conversation/TEMPLATE-owner-workflow-plan.md' });
  expect(content.startsWith('# Template:')).toBeTruthy();
});

it('renderStub: creates role required-readings YAML stub', () => {
  const content = renderStub({
    path: 'roles/owner/required-readings.yaml',
    scaffold: 'stub',
    source_path: 'general/instructions/roles/required-readings.md',
  });
  expect(content).toBe('# Stub — fill in per general/instructions/roles/required-readings.md\nrole: owner\nrequired_readings: []\n');
});

it('renderStub: creates workflow YAML stub', () => {
  const content = renderStub({
    path: 'workflow/main.yaml',
    scaffold: 'stub',
    source_path: 'general/instructions/workflow/main.md',
  });
  expect(content).toBe('# Stub — fill in per general/instructions/workflow/main.md\nworkflow:\n  name: <project workflow>\n  summary: <one-line workflow summary>\n  nodes: []\n  edges: []\n');
});

// ── scaffold — stub entries ───────────────────────────────────────────────────

it('scaffold: creates a stub file at the correct a-docs/ path', () => {
  const projectRoot = path.join(TEMP_BASE, 'stub-test');
  const entries = [
    { path: 'project-information/vision.md', scaffold: 'stub', source_path: 'general/instructions/project-information/vision.md' },
  ];
  const result = scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries);
  const target = path.join(projectRoot, 'a-docs', 'project-information', 'vision.md');
  expect(result.created.length).toBe(1);
  expect(result.skipped.length).toBe(0);
  expect(result.failed.length).toBe(0);
  expect(fs.existsSync(target)).toBeTruthy();
  expect(fs.readFileSync(target, 'utf8').startsWith('# Vision')).toBeTruthy();
});

it('scaffold: creates parent directories for nested stub paths', () => {
  const projectRoot = path.join(TEMP_BASE, 'nested-stub-test');
  const entries = [
    { path: 'communication/conversation/main.md', scaffold: 'stub', source_path: 'general/instructions/communication/conversation/main.md' },
  ];
  scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries);
  const dir = path.join(projectRoot, 'a-docs', 'communication', 'conversation');
  expect(fs.existsSync(dir)).toBeTruthy();
});

// ── scaffold — copy entries ───────────────────────────────────────────────────

it('scaffold: copies source file verbatim to target path', () => {
  const projectRoot = path.join(TEMP_BASE, 'copy-test');
  const entries = [
    { path: 'roles/owner/main.md', scaffold: 'copy', source_path: 'general/roles/owner/main.md' },
  ];
  const result = scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries);
  const target = path.join(projectRoot, 'a-docs', 'roles', 'owner', 'main.md');
  expect(result.created.length).toBe(1);
  expect(fs.existsSync(target)).toBeTruthy();
  expect(fs.readFileSync(target, 'utf8')).toBe('# Owner\n\nOwner role content.\n');
});

it('scaffold: fails gracefully when copy source does not exist', () => {
  const projectRoot = path.join(TEMP_BASE, 'copy-missing-test');
  const entries = [
    { path: 'roles/missing/main.md', scaffold: 'copy', source_path: 'general/roles/does-not-exist/main.md' },
  ];
  const result = scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries);
  expect(result.failed.length).toBe(1);
  expect(result.failed[0].reason.includes('Cannot copy from')).toBeTruthy();
});

// ── scaffold — overwrite and skip behaviour ───────────────────────────────────

it('scaffold: skips existing files when overwrite is false', () => {
  const projectRoot = path.join(TEMP_BASE, 'skip-test');
  const entries = [
    { path: 'project-information/log.md', scaffold: 'stub', source_path: 'general/instructions/project-information/log.md' },
  ];
  scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries);
  const second = scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries);
  expect(second.skipped.length).toBe(1);
  expect(second.created.length).toBe(0);
  expect(second.skipped[0].reason).toBe('already-existed');
});

it('scaffold: overwrites existing files when overwrite is true', () => {
  const projectRoot = path.join(TEMP_BASE, 'overwrite-test');
  const entries = [
    { path: 'project-information/log.md', scaffold: 'stub', source_path: 'general/instructions/project-information/log.md' },
  ];
  scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries);
  const second = scaffold(projectRoot, 'Test Project', SOCIETY_ROOT, entries, { overwrite: true });
  expect(second.created.length).toBe(1);
  expect(second.skipped.length).toBe(0);
});

// ── scaffold — invalid entry handling ────────────────────────────────────────

it('scaffold: fails entry with missing path field', () => {
  const projectRoot = path.join(TEMP_BASE, 'invalid-entry-test');
  const entries = [{ scaffold: 'stub', source_path: 'general/instructions/something.md' }] as any;
  const result = scaffold(projectRoot, 'Test', SOCIETY_ROOT, entries);
  expect(result.failed.length).toBe(1);
  expect(result.failed[0].reason.includes('missing required fields')).toBeTruthy();
});

it('scaffold: fails entry with unknown scaffold type', () => {
  const projectRoot = path.join(TEMP_BASE, 'unknown-scaffold-test');
  const entries = [{ path: 'some/file.md', scaffold: 'magic', source_path: 'general/something.md' }];
  const result = scaffold(projectRoot, 'Test', SOCIETY_ROOT, entries);
  expect(result.failed.length).toBe(1);
  expect(result.failed[0].reason.includes('Unknown scaffold type')).toBeTruthy();
});

it('scaffold: throws if projectRoot is missing', () => {
  // @ts-expect-error intentional null call to test runtime guard
  expect(() => scaffold(null, 'Test', SOCIETY_ROOT, [])).toThrow(/projectRoot is required/);
});

it('scaffold: throws if projectName is missing', () => {
  expect(() => scaffold('/some/path', '', SOCIETY_ROOT, [])).toThrow(/projectName is required/);
});

// ── scaffoldFromManifestFile — live runtime a-docs manifest ───────────────────

// Locate the actual runtime a-docs manifest
const SOCIETY_ACTUAL_ROOT = path.resolve(__dirname, '../../..');
const MANIFEST_PATH = path.join(SOCIETY_ACTUAL_ROOT, 'runtime/contracts/a-docs-manifest.yaml');

if (fs.existsSync(MANIFEST_PATH)) {
  it('scaffoldFromManifestFile: runs against live runtime a-docs manifest without throwing', () => {
    const projectRoot = path.join(TEMP_BASE, 'live-manifest-test');
    let result;
    expect(() => {
      result = scaffoldFromManifestFile(projectRoot, 'Live Test Project', SOCIETY_ACTUAL_ROOT, MANIFEST_PATH);
    }).not.toThrow();
    expect(Array.isArray(result!.created)).toBeTruthy();
    expect(Array.isArray(result!.skipped)).toBeTruthy();
    expect(Array.isArray(result!.failed)).toBeTruthy();
  });

  it('scaffoldFromManifestFile: creates manifest entries, no unexpected failures', () => {
    const projectRoot = path.join(TEMP_BASE, 'live-manifest-test2');
    const result = scaffoldFromManifestFile(projectRoot, 'Live Test Project 2', SOCIETY_ACTUAL_ROOT, MANIFEST_PATH);
    // Copy failures are allowed only if a source template is absent in the framework (index drift);
    // report them as informational rather than failing the test suite.
    const unexpectedFailures = result.failed.filter(f => !f.reason.includes('Cannot copy from'));
    if (result.failed.length > 0) {
      console.log(`    [info] ${result.failed.length} failure(s) during live manifest run:`);
      result.failed.forEach(f => console.log(`      - ${path.basename(f.path)}: ${f.reason}`));
    }
    expect(unexpectedFailures.length).toBe(0);
    expect(result.created.length > 0).toBeTruthy();
  });

  it('scaffoldFromManifestFile: stub files contain heading derived from filename', () => {
    const projectRoot = path.join(TEMP_BASE, 'live-manifest-stubs-test');
    scaffoldFromManifestFile(projectRoot, 'Stub Heading Test', SOCIETY_ACTUAL_ROOT, MANIFEST_PATH);
    const visionPath = path.join(projectRoot, 'a-docs', 'project-information', 'vision.md');
    if (fs.existsSync(visionPath)) {
      const content = fs.readFileSync(visionPath, 'utf8');
      expect(content.startsWith('# Vision')).toBeTruthy();
    }
  });

  it('scaffoldFromManifestFile: live runtime manifest has no optional required flag', () => {
    const content = fs.readFileSync(MANIFEST_PATH, 'utf8');
    expect(content.includes('required:')).toBeFalsy();
  });
} else {
  console.log(`  [skip] Live manifest tests — runtime a-docs manifest not found at expected path`);
}

// ── scaffoldFromManifestFile — error handling ────────────────────────────────

it('scaffoldFromManifestFile: throws on missing manifest file', () => {
  expect(() => scaffoldFromManifestFile('/tmp/proj', 'Test', SOCIETY_ROOT, '/nonexistent/manifest.yaml'))
    .toThrow(/Cannot read manifest file/);
});

it('scaffoldFromManifestFile: throws on invalid YAML', () => {
  const badManifest = path.join(TEMP_BASE, 'bad-manifest.yaml');
  fs.writeFileSync(badManifest, 'files: [\ninvalid yaml{{{', 'utf8');
  expect(() => scaffoldFromManifestFile('/tmp/proj', 'Test', SOCIETY_ROOT, badManifest))
    .toThrow(/Cannot parse manifest YAML/);
});

it('scaffoldFromManifestFile: throws if manifest has no files array', () => {
  const badManifest = path.join(TEMP_BASE, 'no-files-manifest.yaml');
  fs.writeFileSync(badManifest, 'manifest_version: "1.0"\n', 'utf8');
  expect(() => scaffoldFromManifestFile('/tmp/proj', 'Test', SOCIETY_ROOT, badManifest))
    .toThrow(/Manifest must contain a "files" array/);
});
