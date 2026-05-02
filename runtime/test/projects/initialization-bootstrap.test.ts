import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bootstrapInitializationFlow } from '../../src/projects/initialization-bootstrap.js';
import { readRecordMetadata } from '../../src/projects/record-metadata.js';
import { parseWorkflowFile } from '../../src/context/workflow-file.js';

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

console.log('\ninitialization-bootstrap');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frameworkRoot = path.resolve(__dirname, '../../..');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-init-bootstrap-'));

fs.symlinkSync(frameworkRoot, path.join(tmpDir, 'a-society'), 'dir');

test('bootstrapInitializationFlow: greenfield mode creates the project, scaffolds compulsory files, and creates a single-node Owner flow', () => {
  const projectName = 'greenfield-project';
  const result = bootstrapInitializationFlow(tmpDir, projectName, 'greenfield');
  const projectRoot = path.join(tmpDir, projectName);

  assert.ok(fs.existsSync(projectRoot), 'project root should be created');
  assert.ok(fs.existsSync(path.join(projectRoot, 'a-docs', 'agents.md')), 'agents.md should be scaffolded');
  assert.ok(fs.existsSync(path.join(projectRoot, 'a-docs', 'roles', 'owner', 'main.md')), 'Owner role should be scaffolded');
  assert.ok(result.scaffoldResult.created.length > 0, 'scaffold should create required files');

  assert.strictEqual(result.flowRun.projectNamespace, projectName);
  assert.deepStrictEqual(result.flowRun.readyNodes, ['owner-intake']);
  assert.strictEqual(result.flowRun.status, 'running');
  assert.strictEqual(path.basename(result.flowRun.recordFolderPath), result.flowRun.flowId);

  const workflowPath = path.join(result.flowRun.recordFolderPath, 'workflow.yaml');
  const workflowDoc = parseWorkflowFile(workflowPath) as any;
  assert.strictEqual(workflowDoc.workflow.nodes.length, 1);
  assert.strictEqual(workflowDoc.workflow.nodes[0].id, 'owner-intake');
  assert.strictEqual(workflowDoc.workflow.nodes[0].role, 'Owner');

  const metadata = readRecordMetadata(result.flowRun.recordFolderPath);
  assert.ok(metadata, 'record metadata should exist');
  assert.strictEqual(metadata?.id, result.flowRun.flowId);
  assert.strictEqual(metadata?.name, undefined);
  assert.strictEqual(metadata?.summary, undefined);

  const pendingArtifacts = result.flowRun.pendingNodeArtifacts['owner-intake'] ?? [];
  assert.deepStrictEqual(
    pendingArtifacts.map((artifactPath) => path.basename(artifactPath)),
    ['initialization.md', '00-runtime-initialization-brief.md']
  );
  assert.ok(
    pendingArtifacts[0].endsWith(path.join('a-society', 'runtime', 'contracts', 'initialization.md')),
    'initialization instructions should come from the runtime contracts folder'
  );

  const indexContent = fs.readFileSync(path.join(projectRoot, 'a-docs', 'indexes', 'main.md'), 'utf8');
  assert.ok(indexContent.includes('$GREENFIELD_PROJECT_INDEX'));
  assert.ok(indexContent.includes('$GREENFIELD_PROJECT_OWNER_ROLE'));

  const requiredReadings = fs.readFileSync(
    path.join(projectRoot, 'a-docs', 'roles', 'owner', 'required-readings.yaml'),
    'utf8'
  );
  assert.ok(requiredReadings.includes('$GREENFIELD_PROJECT_INDEX'));
  assert.ok(requiredReadings.includes('$GREENFIELD_PROJECT_OWNER_ROLE'));

  const briefContent = fs.readFileSync(
    path.join(result.flowRun.recordFolderPath, '00-runtime-initialization-brief.md'),
    'utf8'
  );
  assert.ok(briefContent.includes('Mode: greenfield'));
  assert.ok(briefContent.includes('Required outcomes for this initialization flow'));
});

test('bootstrapInitializationFlow: takeover mode scaffolds an existing project and writes a takeover brief', () => {
  const projectName = 'takeover-project';
  const projectRoot = path.join(tmpDir, projectName);
  fs.mkdirSync(projectRoot, { recursive: true });
  fs.writeFileSync(path.join(projectRoot, 'README.md'), '# Existing project\n');

  const result = bootstrapInitializationFlow(tmpDir, projectName, 'takeover');

  assert.ok(fs.existsSync(path.join(projectRoot, 'a-docs', 'agents.md')), 'agents.md should be scaffolded');
  assert.ok(result.scaffoldResult.created.length > 0, 'scaffold should create required files for takeover');

  const briefContent = fs.readFileSync(
    path.join(result.flowRun.recordFolderPath, '00-runtime-initialization-brief.md'),
    'utf8'
  );
  assert.ok(briefContent.includes('Mode: takeover'));
  assert.ok(briefContent.includes('README.md'));
});

test('bootstrapInitializationFlow: rejects a greenfield project when the target folder already exists', () => {
  const projectName = 'existing-greenfield-project';
  fs.mkdirSync(path.join(tmpDir, projectName), { recursive: true });

  assert.throws(
    () => bootstrapInitializationFlow(tmpDir, projectName, 'greenfield'),
    /already exists in the workspace/
  );
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);

fs.rmSync(tmpDir, { recursive: true, force: true });

if (failed > 0) {
  process.exit(1);
}
