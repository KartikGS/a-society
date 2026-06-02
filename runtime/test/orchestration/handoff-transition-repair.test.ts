import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { HandoffParseError } from '../../src/orchestration/handoff.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import { SessionStore } from '../../src/orchestration/store.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import type { FlowRun } from '../../src/common/types.js';

import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

console.log('\nhandoff-transition-repair');

function scaffoldRole(workspaceRoot: string, projectNamespace: string, roleId: string): void {
  const roleDir = path.join(workspaceRoot, projectNamespace, 'a-docs', 'roles', roleId);
  fs.mkdirSync(roleDir, { recursive: true });
  fs.writeFileSync(path.join(roleDir, 'main.md'), `${roleId} role`);
  fs.writeFileSync(path.join(roleDir, 'ownership.yaml'), `role: ${roleId}\nsurfaces: []\n`);
  fs.writeFileSync(path.join(roleDir, 'required-readings.yaml'), `role: ${roleId}\nrequired_readings: []\n`);
}

await test('partial forward handoff is accepted and leaves remaining successors unresolved', async () => {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-handoff-transition-'));
  const projectNamespace = 'test-project';
  const flowId = 'test-flow';
  const recordFolderPath = getFlowRecordDir(workspaceRoot, { projectNamespace, flowId });
  fs.mkdirSync(recordFolderPath, { recursive: true });
  scaffoldRole(workspaceRoot, projectNamespace, 'owner');
  scaffoldRole(workspaceRoot, projectNamespace, 'curator');

  const artifactPath = path.join(recordFolderPath, '01-owner.md');
  fs.writeFileSync(artifactPath, 'owner artifact');
  fs.writeFileSync(path.join(recordFolderPath, 'workflow.yaml'), `workflow:
  name: test-flow
  nodes:
    - id: owner-intake
      role: owner
    - id: branch-a
      role: curator_1
    - id: branch-b
      role: curator_2
  edges:
    - from: owner-intake
      to: branch-a
    - from: owner-intake
      to: branch-b
`);

  const flowRun: FlowRun = {
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath,
    runningNodes: ['owner-intake'],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    visitedNodeIds: ['owner-intake'],
    completedHandoffs: [],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
  };

  const ref = { projectNamespace, flowId };
  SessionStore.saveFlowRun(flowRun, ref, workspaceRoot);

  const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
  await orchestrator.applyHandoffAndAdvance(flowRun, 'owner-intake', 'owner', [
    {
      target_node_id: 'branch-a',
      artifact_path: path.relative(workspaceRoot, artifactPath),
    },
  ]);

  const updated = SessionStore.loadFlowRun(ref, workspaceRoot)!;
  assert.deepStrictEqual(updated.receivingHandoff['owner-intake=>branch-a'], [path.relative(workspaceRoot, artifactPath)]);
  assert.ok(updated.completedHandoffs.includes('owner-intake=>branch-a'));
  assert.ok(!updated.completedHandoffs.includes('owner-intake=>branch-b'));

  fs.rmSync(workspaceRoot, { recursive: true, force: true });
});

await test('invalid target is reported before missing artifact', async () => {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-handoff-target-precedence-'));
  const projectNamespace = 'test-project';
  const flowId = 'test-flow';
  const recordFolderPath = getFlowRecordDir(workspaceRoot, { projectNamespace, flowId });
  fs.mkdirSync(recordFolderPath, { recursive: true });
  scaffoldRole(workspaceRoot, projectNamespace, 'owner');
  scaffoldRole(workspaceRoot, projectNamespace, 'curator');

  fs.writeFileSync(path.join(recordFolderPath, 'workflow.yaml'), `workflow:
  name: test-flow
  nodes:
    - id: owner-intake
      role: owner
    - id: branch-a
      role: curator_1
  edges:
    - from: owner-intake
      to: branch-a
`);

  const flowRun: FlowRun = {
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath,
    runningNodes: ['owner-intake'],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    visitedNodeIds: ['owner-intake'],
    completedHandoffs: [],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
  };

  const ref = { projectNamespace, flowId };
  SessionStore.saveFlowRun(flowRun, ref, workspaceRoot);

  const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
  await assert.rejects(
    () => orchestrator.applyHandoffAndAdvance(flowRun, 'owner-intake', 'owner', [
      {
        target_node_id: 'missing-target',
        artifact_path: 'missing-artifact.md',
      },
    ]),
    (error: any) => {
      assert.ok(error instanceof HandoffParseError);
      assert.strictEqual(error.details.code, 'invalid_transition');
      assert.ok(error.details.modelRepairMessage.includes("Target node 'missing-target' not found"));
      assert.ok(!error.details.modelRepairMessage.includes('missing-artifact.md'));
      return true;
    }
  );

  fs.rmSync(workspaceRoot, { recursive: true, force: true });
});

await test('mixed forward and backward handoffs are applied edge-by-edge', async () => {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-mixed-handoff-'));
  const projectNamespace = 'test-project';
  const flowId = 'test-flow';
  const recordFolderPath = getFlowRecordDir(workspaceRoot, { projectNamespace, flowId });
  fs.mkdirSync(recordFolderPath, { recursive: true });
  scaffoldRole(workspaceRoot, projectNamespace, 'owner');
  scaffoldRole(workspaceRoot, projectNamespace, 'curator');

  fs.writeFileSync(path.join(recordFolderPath, 'workflow.yaml'), `workflow:
  name: test-flow
  nodes:
    - id: source-a
      role: owner_1
    - id: source-b
      role: owner_2
    - id: current
      role: curator
    - id: sink
      role: owner_3
  edges:
    - from: source-a
      to: current
    - from: source-b
      to: current
    - from: current
      to: sink
`);

  const forwardArtifact = path.join(recordFolderPath, 'current-to-sink.md');
  const backwardArtifact = path.join(recordFolderPath, 'current-to-source-b.md');
  fs.writeFileSync(forwardArtifact, 'forward-ready output');
  fs.writeFileSync(backwardArtifact, 'source-b needs correction');

  const flowRun: FlowRun = {
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath,
    runningNodes: ['current'],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    visitedNodeIds: ['source-a', 'source-b', 'current'],
    completedHandoffs: ['source-a=>current', 'source-b=>current'],
    receivingHandoff: {},
    historyHandoff: {
      'source-a=>current': ['source-a.md'],
      'source-b=>current': ['source-b.md'],
    },
    awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
  };

  const ref = { projectNamespace, flowId };
  SessionStore.saveFlowRun(flowRun, ref, workspaceRoot);

  const sink = new RecordingOperatorSink();
  const orchestrator = new FlowOrchestrator(sink);
  await orchestrator.applyHandoffAndAdvance(flowRun, 'current', 'curator', [
    {
      target_node_id: 'sink',
      artifact_path: path.relative(workspaceRoot, forwardArtifact),
    },
    {
      target_node_id: 'source-b',
      artifact_path: path.relative(workspaceRoot, backwardArtifact),
    },
  ]);

  const updated = SessionStore.loadFlowRun(ref, workspaceRoot)!;
  assert.deepStrictEqual(updated.receivingHandoff['current=>sink'], [path.relative(workspaceRoot, forwardArtifact)]);
  assert.deepStrictEqual(updated.receivingHandoff['current=>source-b'], [path.relative(workspaceRoot, backwardArtifact)]);
  assert.ok(updated.completedHandoffs.includes('current=>sink'), 'forward edge should be realized');
  assert.ok(updated.completedHandoffs.includes('source-a=>current'), 'unrejected input edge should remain realized');
  assert.ok(!updated.completedHandoffs.includes('source-b=>current'), 'rejected input edge should be invalidated');
  assert.ok(updated.awaitingHandoff.includes('current'), 'current node should wait for corrected input');
  assert.ok(
    sink.events.some((event) =>
      event.kind === 'handoff.applied' &&
      event.targets.some((target) => target.nodeId === 'sink') &&
      event.targets.some((target) => target.nodeId === 'source-b')
    ),
    'operator event should include both forward and backward targets'
  );

  fs.rmSync(workspaceRoot, { recursive: true, force: true });
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
