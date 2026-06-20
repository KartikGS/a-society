import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import * as SessionStore from '../../src/orchestration/store.js';
import { setWorkspaceRoot } from '../../src/common/workspace.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';

import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';

function scaffoldRole(workspaceRoot: string, projectNamespace: string, roleId: string): void {
  const roleDir = path.join(workspaceRoot, projectNamespace, 'a-docs', 'roles', roleId);
  fs.mkdirSync(roleDir, { recursive: true });
  fs.writeFileSync(path.join(roleDir, 'main.md'), `${roleId} role`);
  fs.writeFileSync(path.join(roleDir, 'ownership.yaml'), `role: ${roleId}\nsurfaces: []\n`);
  fs.writeFileSync(path.join(roleDir, 'required-readings.yaml'), `role: ${roleId}\nrequired_readings: []\n`);
}

async function runTest() {
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-artifact-routing-test-'));
  const workspaceRoot = tmpBase;
  const projectNamespace = 'test-project';
  const stateDir = path.join(tmpBase, '.a-society', 'state');
  const flowId = 'edge-artifact-flow';
  const recordPath = getFlowRecordDir(workspaceRoot, { projectNamespace, flowId });

  fs.mkdirSync(recordPath, { recursive: true });
  fs.mkdirSync(stateDir, { recursive: true });
  scaffoldRole(workspaceRoot, projectNamespace, 'owner');
  scaffoldRole(workspaceRoot, projectNamespace, 'curator');
  scaffoldRole(workspaceRoot, projectNamespace, 'technical-architect');
  scaffoldRole(workspaceRoot, projectNamespace, 'framework-services-developer');
  const producerToARel = path.relative(workspaceRoot, path.join(recordPath, '02-producer-to-a.md'));
  const producerToBRel = path.relative(workspaceRoot, path.join(recordPath, '02-producer-to-b.md'));
  const cToBRel = path.relative(workspaceRoot, path.join(recordPath, '03-c-to-b.md'));
  fs.writeFileSync(path.join(recordPath, '02-producer-to-a.md'), 'Producer artifact for A');
  fs.writeFileSync(path.join(recordPath, '02-producer-to-b.md'), 'Producer artifact for B');
  fs.writeFileSync(path.join(recordPath, '03-c-to-b.md'), 'Branch C artifact for B');

  const workflowGraph = `workflow:
  name: edge-artifact-routing
  nodes:
    - id: producer
      role: owner
    - id: branch-a
      role: curator
    - id: branch-c
      role: technical-architect
    - id: branch-b
      role: framework-services-developer
  edges:
    - from: producer
      to: branch-a
    - from: producer
      to: branch-b
    - from: branch-c
      to: branch-b
`;
  fs.writeFileSync(path.join(recordPath, 'workflow.yaml'), workflowGraph);

  setWorkspaceRoot(workspaceRoot);
  SessionStore.init();
  const flowRun = {
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordPath,
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    pendingHandoffApprovals: {},
    completedHandoffs: [],
    visitedNodeIds: [],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running' as const,
    stateVersion: CURRENT_FLOW_STATE_VERSION
  };
  SessionStore.saveFlowRun(flowRun);

  const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());

  await Promise.all([
    orchestrator.applyHandoffAndAdvance(flowRun, 'producer', 'owner', [
      { target_node_id: 'branch-a', artifact_path: producerToARel },
      { target_node_id: 'branch-b', artifact_path: producerToBRel },
    ]),
    orchestrator.applyHandoffAndAdvance(flowRun, 'branch-c', 'technical-architect', [
      { target_node_id: 'branch-b', artifact_path: cToBRel },
    ])
  ]);

  const updated = SessionStore.loadFlowRun(SessionStore.flowRef(flowRun))!;
  expect(['producer=>branch-a', 'producer=>branch-b', 'branch-c=>branch-b'].every(k => updated.completedHandoffs.includes(k))).toBeTruthy();
  expect(updated.receivingHandoff['producer=>branch-a']).toEqual([producerToARel]);
  expect(
    updated.receivingHandoff['producer=>branch-b'] && updated.receivingHandoff['branch-c=>branch-b'],
    'branch-b should receive both concurrent predecessor handoffs'
  ).toBeTruthy();

  fs.rmSync(tmpBase, { recursive: true, force: true });
}

it('records concurrent edge-specific artifact routing without losing inbound handoffs', async () => {
  await runTest();
});
