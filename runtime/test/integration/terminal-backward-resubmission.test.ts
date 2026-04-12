import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FlowOrchestrator } from '../../src/orchestrator.js';
import { SessionStore } from '../../src/store.js';

async function runTest() {
  console.log('Starting terminal-backward-resubmission integration test...');

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'terminal-backward-resubmission-test-'));
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
  name: terminal-backward-resubmission
  nodes:
    - id: proposal
      role: Curator
    - id: review
      role: Owner
  edges:
    - from: proposal
      to: review
---
`;
  fs.writeFileSync(path.join(recordPath, 'workflow.md'), workflowGraph);

  const proposalToReviewPath = path.join(recordPath, '02-proposal-to-review.md');
  const reviewFeedbackPath = path.join(recordPath, '03-review-feedback.md');
  fs.writeFileSync(proposalToReviewPath, 'Original proposal artifact for final review.');
  fs.writeFileSync(reviewFeedbackPath, 'Final reviewer requests resubmission.');

  const proposalToReviewRelPath = path.relative(workspaceRoot, proposalToReviewPath);
  const reviewFeedbackRelPath = path.relative(workspaceRoot, reviewFeedbackPath);

  SessionStore.init();
  SessionStore.saveFlowRun({
    flowId: 'terminal-backward-flow',
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordPath,
    activeNodes: ['review'],
    completedNodes: ['proposal'],
    completedEdgeArtifacts: {
      'proposal=>review': proposalToReviewRelPath,
    },
    pendingNodeArtifacts: {
      review: [proposalToReviewRelPath],
    },
    status: 'running',
    stateVersion: '5',
    roleContinuity: {
      Curator: {
        roleName: 'Curator',
        completedNodes: [{
          nodeId: 'proposal',
          outputArtifactPath: proposalToReviewRelPath,
          completedAt: '2026-04-12T00:00:00.000Z',
        }],
      },
    },
  });

  SessionStore.saveRoleSession({
    roleName: 'Curator',
    logicalSessionId: 'terminal-backward-flow__proposal',
    transcriptHistory: [{ role: 'user', content: 'stale proposal session' }],
    isActive: false,
  });

  const flowRun = SessionStore.loadFlowRun()!;
  const orchestrator = new FlowOrchestrator();

  await orchestrator.applyHandoffAndAdvance(flowRun, 'review', 'Owner', [
    { target_node_id: 'proposal', artifact_path: reviewFeedbackRelPath },
  ]);

  const updated = SessionStore.loadFlowRun()!;

  assert.ok(updated.activeNodes.includes('proposal'), 'proposal should reactivate after terminal-node backward handoff');
  assert.ok(!updated.activeNodes.includes('review'), 'terminal review node should stop being active after sending work back');
  assert.ok(!('proposal=>review' in updated.completedEdgeArtifacts), 'realized predecessor edge must be invalidated');
  assert.deepStrictEqual(
    updated.pendingNodeArtifacts.proposal,
    [proposalToReviewRelPath, reviewFeedbackRelPath],
    'reactivated predecessor should receive both the rejected artifact and the final feedback artifact'
  );
  assert.ok(!updated.completedNodes.includes('proposal'), 'reactivated predecessor should no longer be marked completed');
  assert.deepStrictEqual(
    updated.roleContinuity?.Curator?.completedNodes ?? [],
    [],
    'role continuity entry for the reopened predecessor should be cleared'
  );
  assert.strictEqual(
    SessionStore.loadRoleSession('terminal-backward-flow__proposal'),
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
