import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bootstrapInitializationFlow } from '../../src/projects/initialization-bootstrap.js';
import { readRecordMetadata } from '../../src/projects/record-metadata.js';
import { parseWorkflowFile } from '../../src/context/workflow-file.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';

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
  assert.deepStrictEqual(result.flowRun.runningNodes, ['owner-intake']);
  assert.strictEqual(result.flowRun.status, 'running');
  assert.strictEqual(result.flowRun.recordFolderPath, getFlowRecordDir(tmpDir, { projectNamespace: projectName, flowId: result.flowRun.flowId }));
  assert.strictEqual(path.basename(result.flowRun.recordFolderPath), 'record');

  const workflowPath = path.join(result.flowRun.recordFolderPath, 'workflow.yaml');
  const workflowDoc = parseWorkflowFile(workflowPath) as any;
  assert.strictEqual(workflowDoc.workflow.nodes.length, 1);
  assert.strictEqual(workflowDoc.workflow.nodes[0].id, 'owner-intake');
  assert.strictEqual(workflowDoc.workflow.nodes[0].role, 'owner');
  assert.ok(
    workflowDoc.workflow.nodes[0].guidance.some((entry: string) => entry.includes('# Runtime Project Initialization')),
    'initialization guide should be embedded in the node guidance'
  );
  assert.ok(
    workflowDoc.workflow.nodes[0].guidance.some((entry: string) => entry.includes('# Runtime Initialization Brief')),
    'initialization brief should be embedded in the node guidance'
  );
  assert.ok(
    workflowDoc.workflow.nodes[0].guidance.some((entry: string) => entry.includes('workflow.yaml')),
    'workflow contract trigger should be present in initialization node guidance'
  );
  const generalIndexGuidance = workflowDoc.workflow.nodes[0].guidance.find((entry: string) =>
    entry.includes('A-Society general index:')
  );
  assert.ok(generalIndexGuidance, 'A-Society general index should be embedded in the node guidance');
  assert.ok(generalIndexGuidance.includes('$GENERAL_OWNER_ROLE'));
  assert.ok(generalIndexGuidance.includes('a-society/general/roles/owner/main.md'));

  const metadata = readRecordMetadata(result.flowRun.recordFolderPath);
  assert.ok(metadata, 'record metadata should exist');
  assert.strictEqual(metadata?.name, undefined);
  assert.strictEqual(metadata?.summary, undefined);
  const metadataContent = fs.readFileSync(path.join(result.flowRun.recordFolderPath, 'record.yaml'), 'utf8');
  assert.ok(!metadataContent.includes('id:'), 'record metadata should not duplicate the flow id');

  const indexContent = fs.readFileSync(path.join(projectRoot, 'a-docs', 'indexes', 'main.md'), 'utf8');
  assert.ok(indexContent.includes('$GREENFIELD_PROJECT_INDEX'));
  assert.ok(indexContent.includes('$GREENFIELD_PROJECT_OWNER_ROLE'));

  const requiredReadings = fs.readFileSync(
    path.join(projectRoot, 'a-docs', 'roles', 'owner', 'required-readings.yaml'),
    'utf8'
  );
  assert.ok(requiredReadings.includes('$GREENFIELD_PROJECT_INDEX'));
  assert.ok(requiredReadings.includes('$GREENFIELD_PROJECT_OWNER_ROLE'));

  const briefContent = workflowDoc.workflow.nodes[0].guidance.find((entry: string) =>
    entry.includes('# Runtime Initialization Brief')
  );
  assert.ok(!fs.existsSync(path.join(result.flowRun.recordFolderPath, '00-runtime-initialization-brief.md')));
  assert.ok(briefContent.includes('Mode: greenfield'));
  assert.ok(!briefContent.includes('## Runtime intent'));
  assert.ok(briefContent.includes('## Mode-specific guidance'));
  assert.ok(briefContent.includes('Gather the minimum project truth interactively.'));
  assert.ok(!briefContent.includes('Inspect existing non-`a-docs/` project files before asking questions.'));
  assert.ok(!briefContent.includes('## Scaffold summary'));
  assert.ok(!briefContent.includes('## Injected A-Society general index'));
  assert.ok(!briefContent.includes('## Required outcomes for this initialization flow'));

  assert.strictEqual(workflowDoc.workflow.nodes[0].inputs, undefined);
  assert.strictEqual(workflowDoc.workflow.nodes[0].work, undefined);
  assert.strictEqual(workflowDoc.workflow.nodes[0].outputs, undefined);
  assert.strictEqual(workflowDoc.workflow.nodes[0].notes, undefined);
});

test('bootstrapInitializationFlow: takeover mode scaffolds an existing project and embeds a takeover brief', () => {
  const projectName = 'takeover-project';
  const projectRoot = path.join(tmpDir, projectName);
  fs.mkdirSync(projectRoot, { recursive: true });
  fs.writeFileSync(path.join(projectRoot, 'README.md'), '# Existing project\n');

  const result = bootstrapInitializationFlow(tmpDir, projectName, 'takeover');

  assert.ok(fs.existsSync(path.join(projectRoot, 'a-docs', 'agents.md')), 'agents.md should be scaffolded');
  assert.ok(result.scaffoldResult.created.length > 0, 'scaffold should create required files for takeover');

  const workflowPath = path.join(result.flowRun.recordFolderPath, 'workflow.yaml');
  const workflowDoc = parseWorkflowFile(workflowPath) as any;
  const briefContent = workflowDoc.workflow.nodes[0].guidance.find((entry: string) =>
    entry.includes('# Runtime Initialization Brief')
  );
  assert.ok(!fs.existsSync(path.join(result.flowRun.recordFolderPath, '00-runtime-initialization-brief.md')));
  assert.ok(briefContent.includes('Mode: takeover'));
  assert.ok(!briefContent.includes('## Runtime intent'));
  assert.ok(briefContent.includes('## Mode-specific guidance'));
  assert.ok(briefContent.includes('Inspect existing non-`a-docs/` project files before asking questions.'));
  assert.ok(!briefContent.includes('Gather the minimum project truth interactively.'));
  assert.ok(!briefContent.includes('## Existing top-level project entries'));
  assert.ok(!briefContent.includes('README.md'));
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
