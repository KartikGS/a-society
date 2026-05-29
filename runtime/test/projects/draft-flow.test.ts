import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initializeDraftFlow } from '../../src/projects/draft-flow.js';
import { readRecordMetadata, syncRecordMetadataFromWorkflow } from '../../src/projects/record-metadata.js';
import { SessionStore } from '../../src/orchestration/store.js';
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

console.log('\ndraft-flow');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-draft-flow-'));
const workspaceRoot = tmpDir;
const projectNamespace = 'test-project';
const projectRoot = path.join(workspaceRoot, projectNamespace);
const stateDir = path.join(tmpDir, '.state');

fs.mkdirSync(path.join(projectRoot, 'a-docs', 'roles', 'owner'), { recursive: true });
fs.mkdirSync(path.join(projectRoot, 'a-docs', 'indexes'), { recursive: true });
fs.writeFileSync(path.join(projectRoot, 'a-docs', 'roles', 'owner', 'required-readings.yaml'), 'role: owner\nrequired_readings: []\n');
fs.writeFileSync(path.join(projectRoot, 'a-docs', 'indexes', 'main.md'), '');

process.env.A_SOCIETY_STATE_DIR = stateDir;
SessionStore.init();

test('initializeDraftFlow creates an opaque-id record folder, record metadata, and single Owner node workflow', () => {
  const flow = initializeDraftFlow(workspaceRoot, projectNamespace, 'owner');

  assert.strictEqual(flow.recordFolderPath, getFlowRecordDir(workspaceRoot, { projectNamespace, flowId: flow.flowId }));
  assert.strictEqual(path.basename(flow.recordFolderPath), 'record');
  assert.strictEqual(path.basename(path.dirname(flow.recordFolderPath)), flow.flowId);
  assert.deepStrictEqual(flow.runningNodes, ['owner-intake']);
  assert.strictEqual(flow.status, 'running');

  const metadata = readRecordMetadata(flow.recordFolderPath);
  assert.ok(metadata, 'record metadata should exist');
  assert.strictEqual(metadata?.name, undefined);
  assert.strictEqual(metadata?.summary, undefined);
  const metadataContent = fs.readFileSync(path.join(flow.recordFolderPath, 'record.yaml'), 'utf8');
  assert.ok(!metadataContent.includes('id:'), 'record metadata should not duplicate the flow id');

  const workflowPath = path.join(flow.recordFolderPath, 'workflow.yaml');
  assert.ok(fs.existsSync(workflowPath), 'default workflow.yaml should exist');

  const workflowDoc = parseWorkflowFile(workflowPath) as any;
  assert.strictEqual(workflowDoc.workflow.nodes.length, 1);
  assert.strictEqual(workflowDoc.workflow.nodes[0].id, 'owner-intake');
  assert.strictEqual(workflowDoc.workflow.nodes[0].role, 'owner');
});

test('syncRecordMetadataFromWorkflow seeds name and summary once from workflow.yaml', () => {
  const flow = initializeDraftFlow(workspaceRoot, projectNamespace, 'owner');
  const workflowPath = path.join(flow.recordFolderPath, 'workflow.yaml');

  fs.writeFileSync(workflowPath, `workflow:
  name: Record Metadata Sync
  summary: Capture a durable title and summary from workflow.yaml.
  nodes:
    - id: owner-intake
      role: owner
  edges: []
`, 'utf8');

  const firstSync = syncRecordMetadataFromWorkflow(flow.recordFolderPath);
  assert.strictEqual(firstSync.name, 'Record Metadata Sync');
  assert.strictEqual(firstSync.summary, 'Capture a durable title and summary from workflow.yaml.');

  fs.writeFileSync(workflowPath, `workflow:
  name: Different Name
  summary: Different summary.
  nodes:
    - id: owner-intake
      role: owner
  edges: []
`, 'utf8');

  const secondSync = syncRecordMetadataFromWorkflow(flow.recordFolderPath);
  assert.strictEqual(secondSync.name, 'Record Metadata Sync');
  assert.strictEqual(secondSync.summary, 'Capture a durable title and summary from workflow.yaml.');
});

test('SessionStore.loadFlowRun keeps the canonical state record folder', () => {
  const flow = initializeDraftFlow(workspaceRoot, projectNamespace, 'owner');
  SessionStore.saveFlowRun(flow);

  const loaded = SessionStore.loadFlowRun();
  assert.ok(loaded, 'flow should load from state');
  assert.strictEqual(loaded!.recordFolderPath, flow.recordFolderPath);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);

fs.rmSync(tmpDir, { recursive: true, force: true });
delete process.env.A_SOCIETY_STATE_DIR;

if (failed > 0) {
  process.exit(1);
}
