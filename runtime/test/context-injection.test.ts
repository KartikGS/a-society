import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ContextInjectionService } from '../src/injection.js';

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

console.log('\ncontext-injection');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-context-injection-'));
const projectDir = path.join(tmpDir, 'a-society');
fs.mkdirSync(path.join(projectDir, 'a-docs', 'roles'), { recursive: true });
fs.mkdirSync(path.join(projectDir, 'a-docs', 'indexes'), { recursive: true });

fs.writeFileSync(
  path.join(projectDir, 'a-docs', 'roles', 'required-readings.yaml'),
  `universal:\n  - $TEST_AGENTS\n  - $A_SOCIETY_RUNTIME_HANDOFF_CONTRACT\nroles:\n  owner:\n    - $TEST_OWNER_ROLE\n`
);
fs.writeFileSync(
  path.join(projectDir, 'a-docs', 'indexes', 'main.md'),
  `| \`$TEST_AGENTS\` | \`a-society/a-docs/agents.md\` |\n| \`$TEST_OWNER_ROLE\` | \`a-society/a-docs/roles/owner.md\` |\n`
);
fs.writeFileSync(path.join(projectDir, 'a-docs', 'agents.md'), 'Agent orientation');
fs.writeFileSync(path.join(projectDir, 'a-docs', 'roles', 'owner.md'), 'Owner role doc');
fs.writeFileSync(path.join(projectDir, 'artifact.md'), 'Artifact body');

test('buildContextBundle: contains role announcement, date, handoff contract, and required-reading files', () => {
  const bundle = ContextInjectionService.buildContextBundle(
    'a-society__Owner',
    tmpDir
  );

  assert.ok(bundle.bundleContent.includes('You are the Owner agent for a-society.'));
  assert.ok(bundle.bundleContent.includes("Today's date is"));
  assert.ok(bundle.bundleContent.includes('A-Society Runtime Handoff Contract'));
  assert.ok(bundle.bundleContent.includes('Agent orientation'));
  assert.ok(bundle.bundleContent.includes('Owner role doc'));
});

test('buildContextBundle: uses RUNTIME-LOADED REQUIRED READING heading and already-loaded statement', () => {
  const bundle = ContextInjectionService.buildContextBundle(
    'a-society__Owner',
    tmpDir
  );

  assert.ok(bundle.bundleContent.includes('--- RUNTIME-LOADED REQUIRED READING FOR a-society__Owner ---'));
  assert.ok(bundle.bundleContent.includes('These files are already loaded into this session by the runtime.'));
  assert.ok(!bundle.bundleContent.includes('--- MANDATORY CONTEXT LOADING FOR'));
});

test('buildContextBundle: does not include active artifact content', () => {
  const bundle = ContextInjectionService.buildContextBundle(
    'a-society__Owner',
    tmpDir
  );

  assert.ok(!bundle.bundleContent.includes('Artifact body'));
  assert.ok(!bundle.bundleContent.includes('[FILE: a-society/artifact.md]'));
  assert.ok(!bundle.bundleContent.includes('ACTIVE WORKSPACE ARTIFACT'));
});

test('buildContextBundle: runtime handoff contract is injected once even if runtime variable appears in required readings', () => {
  const bundle = ContextInjectionService.buildContextBundle(
    'a-society__Owner',
    tmpDir
  );

  const matches = bundle.bundleContent.match(/A-Society Runtime Handoff Contract/g) || [];
  assert.strictEqual(matches.length, 1);
  assert.ok(!bundle.bundleContent.includes('FILE ERROR: Could not resolve or read $A_SOCIETY_RUNTIME_HANDOFF_CONTRACT'));
});

test('buildContextBundle: does not inject runtime directives', () => {
  const bundle = ContextInjectionService.buildContextBundle(
    'a-society__Owner',
    tmpDir
  );

  assert.ok(!bundle.bundleContent.includes('--- RUNTIME DIRECTIVE ---'));
  assert.ok(!bundle.bundleContent.includes('You are beginning an intake session.'));
  assert.ok(!bundle.bundleContent.includes('When your work for this phase is complete'));
  assert.ok(!bundle.bundleContent.includes('Do NOT emit a handoff block yet.'));
});

test('buildContextBundle: produces a deterministic hash', () => {
  const bundle1 = ContextInjectionService.buildContextBundle('a-society__Owner', tmpDir);
  const bundle2 = ContextInjectionService.buildContextBundle('a-society__Owner', tmpDir);

  assert.strictEqual(bundle1.contextHash, bundle2.contextHash);
  assert.ok(bundle1.contextHash.length > 0);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);

fs.rmSync(tmpDir, { recursive: true, force: true });

if (failed > 0) process.exit(1);
