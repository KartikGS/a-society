import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildRuntimeHealthRepairGuidance,
  runRuntimeHealthChecks
} from '../../src/framework-services/runtime-health-checks.js';

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

function makeProjectFixture(): { tmpRoot: string; workspaceRoot: string; projectNamespace: string; projectRoot: string } {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-health-'));
  const workspaceRoot = tmpRoot;
  const projectNamespace = 'test-project';
  const projectRoot = path.join(workspaceRoot, projectNamespace);
  const aDocsRoot = path.join(projectRoot, 'a-docs');
  const rolesRoot = path.join(aDocsRoot, 'roles', 'owner');
  const workflowRoot = path.join(aDocsRoot, 'workflow');
  const improvementRoot = path.join(aDocsRoot, 'improvement');
  const recordsRoot = path.join(aDocsRoot, 'records');
  const indexesRoot = path.join(aDocsRoot, 'indexes');

  fs.mkdirSync(rolesRoot, { recursive: true });
  fs.mkdirSync(workflowRoot, { recursive: true });
  fs.mkdirSync(improvementRoot, { recursive: true });
  fs.mkdirSync(recordsRoot, { recursive: true });
  fs.mkdirSync(indexesRoot, { recursive: true });

  fs.writeFileSync(path.join(aDocsRoot, 'agents.md'), '# Agents\n', 'utf8');
  fs.writeFileSync(path.join(rolesRoot, 'main.md'), '# Owner\n', 'utf8');
  fs.writeFileSync(path.join(rolesRoot, 'ownership.yaml'), 'role: owner\nsurfaces: []\n', 'utf8');
  fs.writeFileSync(
    path.join(rolesRoot, 'required-readings.yaml'),
    'role: owner\nrequired_readings:\n  - $TEST_PROJECT_AGENTS\n',
    'utf8'
  );
  fs.writeFileSync(
    path.join(indexesRoot, 'main.md'),
    '| `$TEST_PROJECT_AGENTS` | `test-project/a-docs/agents.md` | Agents entry |\n',
    'utf8'
  );
  fs.writeFileSync(
    path.join(workflowRoot, 'main.yaml'),
    [
      'workflow:',
      '  name: Test Workflow',
      '  companion_docs:',
      '    - $TEST_PROJECT_AGENTS',
      '  nodes:',
      '    - id: owner-intake',
      '      role: Owner',
      '      required_readings:',
      '        - $TEST_PROJECT_AGENTS',
      '  edges: []',
      ''
    ].join('\n'),
    'utf8'
  );
  fs.writeFileSync(path.join(improvementRoot, 'meta-analysis.md'), '# Meta Analysis\n', 'utf8');
  fs.writeFileSync(path.join(improvementRoot, 'feedback.md'), '# Feedback\n', 'utf8');

  return { tmpRoot, workspaceRoot, projectNamespace, projectRoot };
}

function cleanup(tmpRoot: string): void {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

console.log('\nruntime-health-checks');

test('passes for a minimal healthy runtime fixture', () => {
  const fixture = makeProjectFixture();
  try {
    const result = runRuntimeHealthChecks(fixture.workspaceRoot, fixture.projectNamespace);
    assert.strictEqual(result.ok, true, `expected healthy fixture, got errors: ${result.errors.join('; ')}`);
    assert.deepStrictEqual(result.errors, []);
  } finally {
    cleanup(fixture.tmpRoot);
  }
});

test('fails when a role folder is missing ownership.yaml', () => {
  const fixture = makeProjectFixture();
  try {
    fs.rmSync(
      path.join(fixture.projectRoot, 'a-docs', 'roles', 'owner', 'ownership.yaml'),
      { force: true }
    );
    const result = runRuntimeHealthChecks(fixture.workspaceRoot, fixture.projectNamespace);
    assert.strictEqual(result.ok, false);
    assert.ok(
      result.errors.some((error) => error.includes('Role owner ownership file is missing')),
      `expected missing ownership error, got: ${result.errors.join('; ')}`
    );
  } finally {
    cleanup(fixture.tmpRoot);
  }
});

test('fails when required readings reference an unregistered variable', () => {
  const fixture = makeProjectFixture();
  try {
    fs.writeFileSync(
      path.join(fixture.projectRoot, 'a-docs', 'roles', 'owner', 'required-readings.yaml'),
      'role: owner\nrequired_readings:\n  - $MISSING_VAR\n',
      'utf8'
    );
    const result = runRuntimeHealthChecks(fixture.workspaceRoot, fixture.projectNamespace);
    assert.strictEqual(result.ok, false);
    assert.ok(
      result.errors.some((error) => error.includes('references $MISSING_VAR')),
      `expected missing variable error, got: ${result.errors.join('; ')}`
    );
  } finally {
    cleanup(fixture.tmpRoot);
  }
});

test('fails when the index points to a missing path', () => {
  const fixture = makeProjectFixture();
  try {
    fs.rmSync(path.join(fixture.projectRoot, 'a-docs', 'agents.md'), { force: true });
    const result = runRuntimeHealthChecks(fixture.workspaceRoot, fixture.projectNamespace);
    assert.strictEqual(result.ok, false);
    assert.ok(
      result.errors.some((error) => error.includes('registers $TEST_PROJECT_AGENTS -> test-project/a-docs/agents.md, but that path is missing')),
      `expected missing index target error, got: ${result.errors.join('; ')}`
    );
  } finally {
    cleanup(fixture.tmpRoot);
  }
});

test('repair guidance names the completion signal that must be retried', () => {
  const guidance = buildRuntimeHealthRepairGuidance(
    ['Required workflow definition is missing at test-project/a-docs/workflow/main.yaml'],
    'backward-pass-complete'
  );
  assert.strictEqual(guidance.operatorSummary, 'A-docs runtime health checks failed');
  assert.ok(guidance.modelRepairMessage.includes('type: backward-pass-complete'));
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
