import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initializeDraftFlow, repairMovedRecordFolder, resolveProjectRecordsRoot } from '../src/draft-flow.js';
import { readRecordMetadata, syncRecordMetadataFromWorkflow } from '../src/record-metadata.js';
import { SessionStore } from '../src/store.js';
import { parseWorkflowFile } from '../src/workflow-file.js';

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
  const flow = initializeDraftFlow(workspaceRoot, projectNamespace, 'Owner');

  assert.ok(flow.recordFolderPath.startsWith(path.join(projectRoot, 'a-docs', 'records')));
  assert.strictEqual(path.basename(flow.recordFolderPath), flow.flowId);
  assert.deepStrictEqual(flow.activeNodes, ['owner-intake']);
  assert.strictEqual(flow.status, 'running');

  const metadata = readRecordMetadata(flow.recordFolderPath);
  assert.ok(metadata, 'record metadata should exist');
  assert.strictEqual(metadata?.id, flow.flowId);
  assert.strictEqual(metadata?.name, undefined);
  assert.strictEqual(metadata?.summary, undefined);

  const workflowPath = path.join(flow.recordFolderPath, 'workflow.yaml');
  assert.ok(fs.existsSync(workflowPath), 'default workflow.yaml should exist');

  const workflowDoc = parseWorkflowFile(workflowPath) as any;
  assert.strictEqual(workflowDoc.workflow.nodes.length, 1);
  assert.strictEqual(workflowDoc.workflow.nodes[0].id, 'owner-intake');
  assert.strictEqual(workflowDoc.workflow.nodes[0].role, 'Owner');
});

test('syncRecordMetadataFromWorkflow seeds name and summary once from workflow.yaml', () => {
  const flow = initializeDraftFlow(workspaceRoot, projectNamespace, 'Owner');
  const workflowPath = path.join(flow.recordFolderPath, 'workflow.yaml');

  fs.writeFileSync(workflowPath, `workflow:
  name: Record Metadata Sync
  summary: Capture a durable title and summary from workflow.yaml.
  nodes:
    - id: owner-intake
      role: Owner
  edges: []
`, 'utf8');

  const firstSync = syncRecordMetadataFromWorkflow(flow.recordFolderPath, flow.flowId);
  assert.strictEqual(firstSync.name, 'Record Metadata Sync');
  assert.strictEqual(firstSync.summary, 'Capture a durable title and summary from workflow.yaml.');

  fs.writeFileSync(workflowPath, `workflow:
  name: Different Name
  summary: Different summary.
  nodes:
    - id: owner-intake
      role: Owner
  edges: []
`, 'utf8');

  const secondSync = syncRecordMetadataFromWorkflow(flow.recordFolderPath, flow.flowId);
  assert.strictEqual(secondSync.name, 'Record Metadata Sync');
  assert.strictEqual(secondSync.summary, 'Capture a durable title and summary from workflow.yaml.');
});

test('resolveProjectRecordsRoot falls back to legacy records/ when present and a-docs/records is absent', () => {
  const legacyNamespace = 'legacy-project';
  const legacyRoot = path.join(workspaceRoot, legacyNamespace);
  fs.mkdirSync(path.join(legacyRoot, 'records'), { recursive: true });

  assert.strictEqual(
    resolveProjectRecordsRoot(workspaceRoot, legacyNamespace),
    path.join(legacyRoot, 'records')
  );
});

test('repairMovedRecordFolder and SessionStore.loadFlowRun recover after the record folder is renamed', () => {
  const flow = initializeDraftFlow(workspaceRoot, projectNamespace, 'Owner');
  SessionStore.saveFlowRun(flow);

  const renamedPath = path.join(path.dirname(flow.recordFolderPath), `${path.basename(flow.recordFolderPath)}-renamed`);
  fs.renameSync(flow.recordFolderPath, renamedPath);

  assert.strictEqual(repairMovedRecordFolder(flow), renamedPath);

  const loaded = SessionStore.loadFlowRun();
  assert.ok(loaded, 'flow should load after record-folder rename');
  assert.strictEqual(loaded!.recordFolderPath, renamedPath);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);

fs.rmSync(tmpDir, { recursive: true, force: true });
delete process.env.A_SOCIETY_STATE_DIR;

if (failed > 0) {
  process.exit(1);
}
