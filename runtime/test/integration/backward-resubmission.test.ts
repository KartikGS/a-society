import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import { SessionStore } from '../../src/orchestration/store.js';

import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';

function scaffoldRole(workspaceRoot: string, projectNamespace: string, roleId: string): void {
  const roleDir = path.join(workspaceRoot, projectNamespace, 'a-docs', 'roles', roleId);
  fs.mkdirSync(roleDir, { recursive: true });
  fs.writeFileSync(path.join(roleDir, 'main.md'), `${roleId} role`);
  fs.writeFileSync(path.join(roleDir, 'ownership.yaml'), `role: ${roleId}\nsurfaces: []\n`);
  fs.writeFileSync(path.join(roleDir, 'required-readings.yaml'), `role: ${roleId}\nrequired_readings: []\n`);
}

async function runTest() {
  console.log('Starting backward-resubmission integration test...');

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'backward-resubmission-test-'));
  const workspaceRoot = tmpBase;
  const projectNamespace = 'test-project';
  const testDir = path.join(workspaceRoot, projectNamespace);
  const recordPath = path.join(testDir, 'records', 'test-flow');
  const stateDir = path.join(tmpBase, '.state');

  fs.mkdirSync(recordPath, { recursive: true });
  fs.mkdirSync(stateDir, { recursive: true });
  scaffoldRole(workspaceRoot, projectNamespace, 'curator');
  scaffoldRole(workspaceRoot, projectNamespace, 'owner');
  scaffoldRole(workspaceRoot, projectNamespace, 'developer');
  scaffoldRole(workspaceRoot, projectNamespace, 'archivist');
  process.env.A_SOCIETY_STATE_DIR = stateDir;

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
  const flowRef = { projectNamespace, flowId: 'backward-flow' };

  SessionStore.init();
  SessionStore.saveFlowRun({
    flowId: flowRef.flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordPath,
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    completedNodes: ['proposal'],
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

  assert.deepStrictEqual(updated.receivingHandoff['review=>proposal'], [reviewFeedbackRel], 'proposal should receive the backward handoff');
  assert.ok(updated.awaitingHandoff.includes('review'), 'review should suspend after sending work back');
  assert.ok(!updated.completedHandoffs.includes('proposal=>review'), 'rejected edge must be invalidated');
  assert.ok(updated.completedHandoffs.includes('proposal=>audit'), 'sibling completed edge must remain intact');
  assert.ok(!updated.completedNodes.includes('proposal'), 'reactivated predecessor should be removed from completedNodes');
  const reopenedSession = SessionStore.loadRoleSession('curator', flowRef, workspaceRoot);
  assert.ok(reopenedSession, 'role-scoped predecessor session should be preserved for re-entry');
  assert.strictEqual(reopenedSession!.currentNodeId, 'proposal');
  assert.strictEqual((reopenedSession!.transcriptHistory[0] as any).content, 'stale proposal session');

  console.log('Integration test PASSED.');

  fs.rmSync(tmpBase, { recursive: true, force: true });
  delete process.env.A_SOCIETY_STATE_DIR;
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
