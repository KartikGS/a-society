import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { HandoffParseError } from '../../src/orchestration/handoff.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import { SessionStore } from '../../src/orchestration/store.js';
import type { FlowRun } from '../../src/common/types.js';

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

await test('incomplete forward handoff is modeled as repairable handoff parse state', async () => {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-handoff-transition-'));
  const projectNamespace = 'test-project';
  const flowId = 'test-flow';
  const recordFolderPath = path.join(workspaceRoot, projectNamespace, 'a-docs', 'records', flowId);
  fs.mkdirSync(recordFolderPath, { recursive: true });
  scaffoldRole(workspaceRoot, projectNamespace, 'owner');
  scaffoldRole(workspaceRoot, projectNamespace, 'curator');

  const artifactPath = path.join(recordFolderPath, '01-owner.md');
  fs.writeFileSync(artifactPath, 'owner artifact');
  fs.writeFileSync(path.join(recordFolderPath, 'workflow.yaml'), `workflow:
  name: test-flow
  nodes:
    - id: owner-intake
      role: Owner
    - id: branch-a
      role: Curator_1
    - id: branch-b
      role: Curator_2
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
    readyNodes: [],
    runningNodes: ['owner-intake'],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    completedNodes: [],
    visitedNodeIds: ['owner-intake'],
    completedHandoffs: [],
    pendingNodeArtifacts: {}, receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: '9',
  };

  const ref = { projectNamespace, flowId };
  SessionStore.saveFlowRun(flowRun, ref, workspaceRoot);

  const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
  await assert.rejects(
    () => orchestrator.applyHandoffAndAdvance(flowRun, 'owner-intake', 'Owner', [
      {
        target_node_id: 'branch-a',
        artifact_path: path.relative(workspaceRoot, artifactPath),
      },
    ]),
    (error: any) => {
      assert.ok(error instanceof HandoffParseError);
      assert.strictEqual(error.details.code, 'invalid_transition');
      assert.strictEqual(error.details.operatorSummary, 'Handoff target mismatch');
      assert.ok(error.details.modelRepairMessage.includes('branch-a, branch-b'));
      return true;
    }
  );

  fs.rmSync(workspaceRoot, { recursive: true, force: true });
});

await test('invalid target is reported before missing artifact', async () => {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-handoff-target-precedence-'));
  const projectNamespace = 'test-project';
  const flowId = 'test-flow';
  const recordFolderPath = path.join(workspaceRoot, projectNamespace, 'a-docs', 'records', flowId);
  fs.mkdirSync(recordFolderPath, { recursive: true });
  scaffoldRole(workspaceRoot, projectNamespace, 'owner');
  scaffoldRole(workspaceRoot, projectNamespace, 'curator');

  fs.writeFileSync(path.join(recordFolderPath, 'workflow.yaml'), `workflow:
  name: test-flow
  nodes:
    - id: owner-intake
      role: Owner
    - id: branch-a
      role: Curator_1
  edges:
    - from: owner-intake
      to: branch-a
`);

  const flowRun: FlowRun = {
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath,
    readyNodes: [],
    runningNodes: ['owner-intake'],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    completedNodes: [],
    visitedNodeIds: ['owner-intake'],
    completedHandoffs: [],
    pendingNodeArtifacts: {}, receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: '9',
  };

  const ref = { projectNamespace, flowId };
  SessionStore.saveFlowRun(flowRun, ref, workspaceRoot);

  const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());
  await assert.rejects(
    () => orchestrator.applyHandoffAndAdvance(flowRun, 'owner-intake', 'Owner', [
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

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
