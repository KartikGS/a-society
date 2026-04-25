import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FlowOrchestrator } from '../../src/orchestrator.js';
import { SessionStore } from '../../src/store.js';

async function runTest() {
  console.log('Starting edge-artifact-routing integration test...');

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-artifact-routing-test-'));
  const workspaceRoot = tmpBase;
  const projectNamespace = 'test-project';
  const testDir = path.join(workspaceRoot, projectNamespace);
  const recordPath = path.join(testDir, 'records', 'test-flow');
  const stateDir = path.join(tmpBase, '.state');

  fs.mkdirSync(recordPath, { recursive: true });
  fs.mkdirSync(stateDir, { recursive: true });
  process.env.A_SOCIETY_STATE_DIR = stateDir;
  const workspaceArtifactDir = path.join(workspaceRoot, 'records', 'test-flow');
  fs.mkdirSync(workspaceArtifactDir, { recursive: true });
  fs.writeFileSync(path.join(workspaceArtifactDir, '02-producer-to-a.md'), 'Producer artifact for A');
  fs.writeFileSync(path.join(workspaceArtifactDir, '02-producer-to-b.md'), 'Producer artifact for B');
  fs.writeFileSync(path.join(workspaceArtifactDir, '03-c-to-b.md'), 'Branch C artifact for B');

  const workflowGraph = `workflow:
  name: edge-artifact-routing
  nodes:
    - id: producer
      role: Owner
    - id: branch-a
      role: Curator
    - id: branch-c
      role: Technical Architect
    - id: branch-b
      role: Framework Services Developer
  edges:
    - from: producer
      to: branch-a
    - from: producer
      to: branch-b
    - from: branch-c
      to: branch-b
`;
  fs.writeFileSync(path.join(recordPath, 'workflow.yaml'), workflowGraph);

  SessionStore.init();
  const flowRun = {
    flowId: 'edge-artifact-flow',
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordPath,
    readyNodes: ['producer', 'branch-c'],
    runningNodes: [],
    awaitingHumanNodes: {},
    completedNodes: [],
    completedEdgeArtifacts: {},
    pendingNodeArtifacts: {
      producer: ['records/test-flow/01-owner-brief.md'],
      'branch-c': ['records/test-flow/01-ta-brief.md'],
    },
    status: 'running' as const,
    stateVersion: '7'
  };
  SessionStore.saveFlowRun(flowRun);

  const orchestrator = new FlowOrchestrator();

  await Promise.all([
    orchestrator.applyHandoffAndAdvance(flowRun, 'producer', 'Owner', [
      { target_node_id: 'branch-a', artifact_path: 'records/test-flow/02-producer-to-a.md' },
      { target_node_id: 'branch-b', artifact_path: 'records/test-flow/02-producer-to-b.md' },
    ]),
    orchestrator.applyHandoffAndAdvance(flowRun, 'branch-c', 'Technical Architect', [
      { target_node_id: 'branch-b', artifact_path: 'records/test-flow/03-c-to-b.md' },
    ])
  ]);

  const updated = SessionStore.loadFlowRun()!;
  assert.deepStrictEqual(
    updated.completedEdgeArtifacts,
    {
      'producer=>branch-a': 'records/test-flow/02-producer-to-a.md',
      'producer=>branch-b': 'records/test-flow/02-producer-to-b.md',
      'branch-c=>branch-b': 'records/test-flow/03-c-to-b.md',
    },
    'concurrent handoffs should persist all artifacts by edge'
  );
  assert.deepStrictEqual(
    updated.pendingNodeArtifacts['branch-a'],
    ['records/test-flow/02-producer-to-a.md'],
    'branch-a should receive only its own edge artifact'
  );
  assert.ok(
    updated.readyNodes.includes('branch-b'),
    'branch-b should activate once both concurrent predecessors complete'
  );
  assert.deepStrictEqual(
    updated.pendingNodeArtifacts['branch-b'],
    ['records/test-flow/02-producer-to-b.md', 'records/test-flow/03-c-to-b.md'],
    'join activation must use the edge-specific artifact for producer=>branch-b, not producer=>branch-a'
  );

  console.log('Integration test PASSED.');

  fs.rmSync(tmpBase, { recursive: true, force: true });
  delete process.env.A_SOCIETY_STATE_DIR;
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
