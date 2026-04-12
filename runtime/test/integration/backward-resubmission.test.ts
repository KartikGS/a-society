import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FlowOrchestrator } from '../../src/orchestrator.js';
import { SessionStore } from '../../src/store.js';

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
  process.env.A_SOCIETY_STATE_DIR = stateDir;

  const workflowGraph = `---
workflow:
  name: backward-resubmission
  nodes:
    - id: proposal
      role: Curator
    - id: review
      role: Owner
    - id: implementation
      role: Developer
    - id: audit
      role: Archivist
  edges:
    - from: proposal
      to: review
    - from: review
      to: implementation
    - from: proposal
      to: audit
---
`;
  fs.writeFileSync(path.join(recordPath, 'workflow.md'), workflowGraph);

  const proposalToReviewPath = path.join(recordPath, '02-proposal-to-review.md');
  const proposalToAuditPath = path.join(recordPath, '02-proposal-to-audit.md');
  const reviewFeedbackPath = path.join(recordPath, '03-review-feedback.md');
  fs.writeFileSync(proposalToReviewPath, 'Original proposal artifact for review.');
  fs.writeFileSync(proposalToAuditPath, 'Sibling artifact that should remain valid.');
  fs.writeFileSync(reviewFeedbackPath, 'Please revise the proposal with these changes.');

  const proposalToReviewRel = path.relative(workspaceRoot, proposalToReviewPath);
  const proposalToAuditRel = path.relative(workspaceRoot, proposalToAuditPath);
  const reviewFeedbackRel = path.relative(workspaceRoot, reviewFeedbackPath);

  SessionStore.init();
  SessionStore.saveFlowRun({
    flowId: 'backward-flow',
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordPath,
    activeNodes: ['review'],
    completedNodes: ['proposal'],
    completedEdgeArtifacts: {
      'proposal=>review': proposalToReviewRel,
      'proposal=>audit': proposalToAuditRel,
    },
    pendingNodeArtifacts: {
      review: [proposalToReviewRel],
    },
    status: 'running',
    stateVersion: '5',
    roleContinuity: {
      Curator: {
        roleName: 'Curator',
        completedNodes: [{
          nodeId: 'proposal',
          outputArtifactPath: proposalToReviewRel,
          completedAt: '2026-04-12T00:00:00.000Z',
        }],
      },
    },
  });

  SessionStore.saveRoleSession({
    roleName: 'Curator',
    logicalSessionId: 'backward-flow__proposal',
    transcriptHistory: [{ role: 'user', content: 'stale proposal session' }],
    isActive: false,
  });

  const flowRun = SessionStore.loadFlowRun()!;
  const orchestrator = new FlowOrchestrator();

  await orchestrator.applyHandoffAndAdvance(flowRun, 'review', 'Owner', [
    { target_node_id: 'proposal', artifact_path: reviewFeedbackRel },
  ]);

  const updated = SessionStore.loadFlowRun()!;

  assert.ok(updated.activeNodes.includes('proposal'), 'proposal should reactivate after backward handoff');
  assert.ok(!updated.activeNodes.includes('review'), 'review should no longer be active after sending work back');
  assert.ok(!('proposal=>review' in updated.completedEdgeArtifacts), 'rejected edge must be invalidated');
  assert.strictEqual(
    updated.completedEdgeArtifacts['proposal=>audit'],
    proposalToAuditRel,
    'sibling completed edge must remain intact'
  );
  assert.deepStrictEqual(
    updated.pendingNodeArtifacts.proposal,
    [proposalToReviewRel, reviewFeedbackRel],
    'reactivated predecessor should receive the rejected artifact plus current feedback'
  );
  assert.ok(!updated.completedNodes.includes('proposal'), 'reactivated predecessor should be removed from completedNodes');
  assert.deepStrictEqual(
    updated.roleContinuity?.Curator?.completedNodes ?? [],
    [],
    'role continuity entry for the reopened node should be cleared'
  );
  assert.strictEqual(
    SessionStore.loadRoleSession('backward-flow__proposal'),
    null,
    'stale predecessor session should be cleared before re-entry'
  );

  console.log('Integration test PASSED.');

  fs.rmSync(tmpBase, { recursive: true, force: true });
  delete process.env.A_SOCIETY_STATE_DIR;
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
