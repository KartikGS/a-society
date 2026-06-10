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
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'terminal-backward-resubmission-test-'));
  const workspaceRoot = tmpBase;
  const projectNamespace = 'test-project';
  const stateDir = path.join(tmpBase, '.a-society', 'state');
  const flowId = 'terminal-backward-flow';
  const recordPath = getFlowRecordDir(workspaceRoot, { projectNamespace, flowId });

  fs.mkdirSync(recordPath, { recursive: true });
  fs.mkdirSync(stateDir, { recursive: true });
  scaffoldRole(workspaceRoot, projectNamespace, 'curator');
  scaffoldRole(workspaceRoot, projectNamespace, 'owner');

  const workflowGraph = `workflow:
  name: terminal-backward-resubmission
  nodes:
    - id: proposal
      role: curator
    - id: review
      role: owner
  edges:
    - from: proposal
      to: review
`;
  fs.writeFileSync(path.join(recordPath, 'workflow.yaml'), workflowGraph);

  const proposalToReviewPath = path.join(recordPath, '02-proposal-to-review.md');
  const reviewFeedbackPath = path.join(recordPath, '03-review-feedback.md');
  fs.writeFileSync(proposalToReviewPath, 'Original proposal artifact for final review.');
  fs.writeFileSync(reviewFeedbackPath, 'Final reviewer requests resubmission.');

  const reviewFeedbackRelPath = path.relative(workspaceRoot, reviewFeedbackPath);
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
    completedHandoffs: ['proposal=>review'],
    visitedNodeIds: [],
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
    { target_node_id: 'proposal', artifact_path: reviewFeedbackRelPath },
  ]);

  const updated = SessionStore.loadFlowRun(flowRef, workspaceRoot)!;

  expect(updated.receivingHandoff['review=>proposal']).toEqual([reviewFeedbackRelPath]);
  expect(updated.awaitingHandoff.includes('review')).toBeTruthy();
  expect(updated.completedHandoffs.includes('proposal=>review')).toBeFalsy();
  const reopenedSession = SessionStore.loadRoleSession('curator', flowRef, workspaceRoot);
  expect(reopenedSession).toBeTruthy();
  expect(reopenedSession!.currentNodeId).toBe('proposal');
  expect((reopenedSession!.transcriptHistory[0] as any).content).toBe('stale proposal session');

  fs.rmSync(tmpBase, { recursive: true, force: true });
}

it('keeps terminal review suspended when it resubmits work backward', async () => {
  await runTest();
});
