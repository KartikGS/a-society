import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import { SessionStore } from '../../src/orchestration/store.js';
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
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'backward-resubmission-test-'));
  const workspaceRoot = tmpBase;
  const projectNamespace = 'test-project';
  const stateDir = path.join(tmpBase, '.a-society', 'state');
  const flowId = 'backward-flow';
  const recordPath = getFlowRecordDir(workspaceRoot, { projectNamespace, flowId });

  fs.mkdirSync(recordPath, { recursive: true });
  fs.mkdirSync(stateDir, { recursive: true });
  scaffoldRole(workspaceRoot, projectNamespace, 'curator');
  scaffoldRole(workspaceRoot, projectNamespace, 'owner');
  scaffoldRole(workspaceRoot, projectNamespace, 'developer');
  scaffoldRole(workspaceRoot, projectNamespace, 'archivist');

  const workflowGraph = `workflow:
  name: backward-resubmission
  nodes:
    - id: proposal
      role: curator
    - id: review
      role: owner
    - id: implementation
      role: developer
    - id: audit
      role: archivist
  edges:
    - from: proposal
      to: review
    - from: review
      to: implementation
    - from: proposal
      to: audit
`;
  fs.writeFileSync(path.join(recordPath, 'workflow.yaml'), workflowGraph);

  const proposalToReviewPath = path.join(recordPath, '02-proposal-to-review.md');
  const proposalToAuditPath = path.join(recordPath, '02-proposal-to-audit.md');
  const reviewFeedbackPath = path.join(recordPath, '03-review-feedback.md');
  fs.writeFileSync(proposalToReviewPath, 'Original proposal artifact for review.');
  fs.writeFileSync(proposalToAuditPath, 'Sibling artifact that should remain valid.');
  fs.writeFileSync(reviewFeedbackPath, 'Please revise the proposal with these changes.');

  const reviewFeedbackRel = path.relative(workspaceRoot, reviewFeedbackPath);
  const flowRef = { projectNamespace, flowId };

  SessionStore.init(workspaceRoot);
  SessionStore.saveFlowRun({
    flowId: flowRef.flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordPath,
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    completedHandoffs: ['proposal=>review', 'proposal=>audit'],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
  }, flowRef, workspaceRoot);

  SessionStore.saveRoleSession({
    roleName: 'curator',
    logicalSessionId: `${flowRef.flowId}__curator`,
    transcriptHistory: [{ role: 'user', content: 'stale proposal session' }],
    isActive: false,
    currentNodeId: 'proposal',
  }, flowRef, workspaceRoot);

  const flowRun = SessionStore.loadFlowRun(flowRef, workspaceRoot)!;
  const orchestrator = new FlowOrchestrator(new RecordingOperatorSink());

  await orchestrator.applyHandoffAndAdvance(flowRun, 'review', 'owner', [
    { target_node_id: 'proposal', artifact_path: reviewFeedbackRel },
  ]);

  const updated = SessionStore.loadFlowRun(flowRef, workspaceRoot)!;

  expect(updated.receivingHandoff['review=>proposal']).toEqual([reviewFeedbackRel]);
  expect(updated.awaitingHandoff.includes('review')).toBeTruthy();
  expect(updated.completedHandoffs.includes('proposal=>review')).toBeFalsy();
  expect(updated.completedHandoffs.includes('proposal=>audit')).toBeTruthy();
  const reopenedSession = SessionStore.loadRoleSession('curator', flowRef, workspaceRoot);
  expect(reopenedSession).toBeTruthy();
  expect(reopenedSession!.currentNodeId).toBe('proposal');
  expect((reopenedSession!.transcriptHistory[0] as any).content).toBe('stale proposal session');

  fs.rmSync(tmpBase, { recursive: true, force: true });
}

it('routes a terminal reviewer handoff back to a predecessor and invalidates only that edge', async () => {
  await runTest();
});
