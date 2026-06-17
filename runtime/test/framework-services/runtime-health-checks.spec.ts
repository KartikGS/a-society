import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import {
  buildRuntimeHealthRepairGuidance,
  runRuntimeHealthChecks
} from '../../src/framework-services/runtime-health-checks.js';
import { scaffoldFromManifestFile } from '../../src/framework-services/scaffolding-system.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frameworkRoot = path.resolve(__dirname, '../../..');

function makeProjectFixture(): { tmpRoot: string; workspaceRoot: string; projectNamespace: string; projectRoot: string } {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-health-'));
  const workspaceRoot = tmpRoot;
  const projectNamespace = 'test-project';
  const projectRoot = path.join(workspaceRoot, projectNamespace);
  const aSocietyRoot = path.join(workspaceRoot, 'a-society');
  const manifestPath = path.join(aSocietyRoot, 'runtime', 'contracts', 'a-docs-manifest.yaml');
  const aDocsRoot = path.join(projectRoot, 'a-docs');
  const rolesRoot = path.join(aDocsRoot, 'roles', 'owner');
  const workflowRoot = path.join(aDocsRoot, 'workflow');
  const improvementRoot = path.join(aDocsRoot, 'improvement');
  const indexesRoot = path.join(aDocsRoot, 'indexes');

  fs.symlinkSync(frameworkRoot, aSocietyRoot, 'dir');
  fs.mkdirSync(projectRoot, { recursive: true });
  scaffoldFromManifestFile(projectRoot, projectNamespace, aSocietyRoot, manifestPath);

  fs.mkdirSync(rolesRoot, { recursive: true });
  fs.mkdirSync(workflowRoot, { recursive: true });
  fs.mkdirSync(improvementRoot, { recursive: true });
  fs.mkdirSync(indexesRoot, { recursive: true });

  fs.writeFileSync(path.join(aDocsRoot, 'agents.md'), '# Agents\n', 'utf8');
  fs.writeFileSync(path.join(rolesRoot, 'main.md'), '# Owner\n', 'utf8');
  fs.writeFileSync(
    path.join(rolesRoot, 'ownership.yaml'),
    'role: owner\nsurfaces:\n  - path: a-docs/\n    scope: Project documentation\n',
    'utf8'
  );
  fs.writeFileSync(
    path.join(rolesRoot, 'required-readings.yaml'),
    'role: owner\nrequired_readings:\n  - $TEST_PROJECT_AGENTS\n',
    'utf8'
  );
  fs.writeFileSync(
    path.join(indexesRoot, 'main.md'),
    '| `$TEST_PROJECT_AGENTS` | `a-docs/agents.md` | Agents entry |\n',
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
      '      role: owner',
      '  edges: []',
      ''
    ].join('\n'),
    'utf8'
  );
  fs.writeFileSync(path.join(improvementRoot, 'meta-analysis.md'), '# Meta Analysis\n', 'utf8');
  fs.writeFileSync(
    path.join(aDocsRoot, 'a-society-version.md'),
    '---\na_society_version: "0.2.0"\n---\n# A-Society Version Record\n',
    'utf8'
  );

  return { tmpRoot, workspaceRoot, projectNamespace, projectRoot };
}

function cleanup(tmpRoot: string): void {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

it('passes for a minimal healthy runtime fixture', () => {
  const fixture = makeProjectFixture();
  try {
    const result = runRuntimeHealthChecks(fixture.workspaceRoot, fixture.projectNamespace);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  } finally {
    cleanup(fixture.tmpRoot);
  }
});

it('fails when the version record has no parseable a_society_version', () => {
  const fixture = makeProjectFixture();
  try {
    fs.writeFileSync(
      path.join(fixture.projectRoot, 'a-docs', 'a-society-version.md'),
      '# A-Society Version Record\n\nNo frontmatter.\n',
      'utf8'
    );
    const result = runRuntimeHealthChecks(fixture.workspaceRoot, fixture.projectNamespace);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('a_society_version'))).toBe(true);
  } finally {
    cleanup(fixture.tmpRoot);
  }
});

it('passes when workflow uses a numbered role instance backed by the base role folder', () => {
  const fixture = makeProjectFixture();
  try {
    fs.writeFileSync(
      path.join(fixture.projectRoot, 'a-docs', 'workflow', 'main.yaml'),
      [
        'workflow:',
        '  name: Test Workflow',
        '  nodes:',
        '    - id: owner-one',
        '      role: owner_1',
        '  edges: []',
        ''
      ].join('\n'),
      'utf8'
    );

    const result = runRuntimeHealthChecks(fixture.workspaceRoot, fixture.projectNamespace);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  } finally {
    cleanup(fixture.tmpRoot);
  }
});

it('fails when a role folder is missing ownership.yaml', () => {
  const fixture = makeProjectFixture();
  try {
    fs.rmSync(
      path.join(fixture.projectRoot, 'a-docs', 'roles', 'owner', 'ownership.yaml'),
      { force: true }
    );
    const result = runRuntimeHealthChecks(fixture.workspaceRoot, fixture.projectNamespace);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('Role owner ownership.yaml is missing'))).toBe(true);
  } finally {
    cleanup(fixture.tmpRoot);
  }
});

it('fails when required readings reference an unregistered variable', () => {
  const fixture = makeProjectFixture();
  try {
    fs.writeFileSync(
      path.join(fixture.projectRoot, 'a-docs', 'roles', 'owner', 'required-readings.yaml'),
      'role: owner\nrequired_readings:\n  - $MISSING_VAR\n',
      'utf8'
    );
    const result = runRuntimeHealthChecks(fixture.workspaceRoot, fixture.projectNamespace);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('references $MISSING_VAR'))).toBe(true);
  } finally {
    cleanup(fixture.tmpRoot);
  }
});

it('fails when the index points to a missing path', () => {
  const fixture = makeProjectFixture();
  try {
    fs.rmSync(path.join(fixture.projectRoot, 'a-docs', 'agents.md'), { force: true });
    const result = runRuntimeHealthChecks(fixture.workspaceRoot, fixture.projectNamespace);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('registers $TEST_PROJECT_AGENTS -> a-docs/agents.md, but that path is missing'))).toBe(true);
  } finally {
    cleanup(fixture.tmpRoot);
  }
});

it('fails when a workflow node required reading duplicates startup role reading', () => {
  const fixture = makeProjectFixture();
  try {
    fs.writeFileSync(
      path.join(fixture.projectRoot, 'a-docs', 'workflow', 'main.yaml'),
      [
        'workflow:',
        '  name: Test Workflow',
        '  nodes:',
        '    - id: owner-intake',
        '      role: owner',
        '      required_readings:',
        '        - $TEST_PROJECT_AGENTS',
        '  edges: []',
        ''
      ].join('\n'),
      'utf8'
    );
    const result = runRuntimeHealthChecks(fixture.workspaceRoot, fixture.projectNamespace);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('repeats $TEST_PROJECT_AGENTS in required_readings'))).toBe(true);
  } finally {
    cleanup(fixture.tmpRoot);
  }
});

it('fails when a project file is not covered by any ownership surface', () => {
  const fixture = makeProjectFixture();
  try {
    fs.writeFileSync(path.join(fixture.projectRoot, 'LICENSE'), 'Test license\n', 'utf8');
    const result = runRuntimeHealthChecks(fixture.workspaceRoot, fixture.projectNamespace);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.includes('Project file LICENSE is not covered by any ownership.yaml surface'))).toBe(true);
  } finally {
    cleanup(fixture.tmpRoot);
  }
});

it('repair guidance names the completion signal that must be retried', () => {
  const guidance = buildRuntimeHealthRepairGuidance(
    ['Required workflow definition is missing at a-docs/workflow/main.yaml'],
    'meta-analysis-complete'
  );
  expect(guidance.operatorSummary).toBe('A-docs runtime health checks failed');
  expect(guidance.modelRepairMessage.includes('type: meta-analysis-complete')).toBeTruthy();
});
