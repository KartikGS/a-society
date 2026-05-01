import assert from 'node:assert';
import { FlowOrchestrator } from '../../src/orchestrator.js';
import { SessionStore } from '../../src/store.js';
import { OperatorEventRenderer } from '../../src/operator-renderer.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { PassThrough } from 'node:stream';
import { seedTestModelSettings } from './settings-test-utils.js';

/**
 * Correction 1 verification: resumed multi-node flows emit parallel.active_set.
 *
 * Pre-saves a flow with two active nodes and status='awaiting_human'.
 * Calls runStoredFlow, which takes the resume path and skips
 * the while loop (status !== 'running'). Asserts that both flow.resumed
 * and parallel.active_set are emitted in order.
 */
async function runTest() {
  console.log("Starting resume-parallel integration test...");

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'resume-parallel-test-'));
  const workspaceRoot = tmpBase;
  const projectNamespace = 'test-project';
  const testDir = path.join(workspaceRoot, projectNamespace);
  const testStateDir = path.join(tmpBase, '.state');
  const testSettingsDir = path.join(tmpBase, '.settings');
  fs.mkdirSync(testDir);
  fs.mkdirSync(testStateDir);
  process.env.A_SOCIETY_STATE_DIR = testStateDir;
  process.env.A_SOCIETY_SETTINGS_DIR = testSettingsDir;
  seedTestModelSettings(testSettingsDir, { providerBaseUrl: 'http://127.0.0.1:1/v1' });

  const recordPath = path.join(testDir, 'records', 'test-flow');
  fs.mkdirSync(recordPath, { recursive: true });

  // Workflow: fork-gate forks to branch-a and branch-b (both terminal)
  const workflowGraph = `workflow:
  name: test-flow
  nodes:
    - id: fork-gate
      role: 'Owner'
    - id: branch-a
      role: 'Developer'
    - id: branch-b
      role: 'Reviewer'
  edges:
    - from: fork-gate
      to: branch-a
    - from: fork-gate
      to: branch-b
`;
  fs.writeFileSync(path.join(recordPath, 'workflow.yaml'), workflowGraph);

  // Pre-save a flow in awaiting_human state with two suspended fork branches.
  // No nodes are ready, so no LLM calls are made — this test only exercises
  // the resume emit path for a multi-node open set.
  SessionStore.init();
  SessionStore.saveFlowRun({
    flowId: 'test-resume-flow-id',
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordPath,
    readyNodes: [],
    runningNodes: [],
    awaitingHumanNodes: {
      'branch-a': { role: 'Developer', reason: 'prompt-human' },
      'branch-b': { role: 'Reviewer', reason: 'prompt-human' }
    },
    completedNodes: ['fork-gate'],
    completedEdgeArtifacts: {
      'fork-gate=>branch-a': 'art-a.md',
      'fork-gate=>branch-b': 'art-b.md'
    },
    pendingNodeArtifacts: { 'branch-a': ['art-a.md'], 'branch-b': ['art-b.md'] },
    status: 'awaiting_human',
    stateVersion: '7'
  });

  const operatorStream = new PassThrough();
  const operatorChunks: string[] = [];
  operatorStream.on('data', (chunk: Buffer) => {
    const text = chunk.toString();
    operatorChunks.push(text);
    process.stderr.write(text);
  });

  const renderer = new OperatorEventRenderer(operatorStream as any);
  const orchestrator = new FlowOrchestrator(renderer);

  const inputStream = new PassThrough();
  const outputStream = new PassThrough();

  try {
    await orchestrator.runStoredFlow(workspaceRoot, projectNamespace, 'Owner', inputStream, outputStream);

    const operatorOut = operatorChunks.join('');
    console.log("\nOperator stream output:");
    console.log(operatorOut);

    const hasResumedNotice = operatorOut.includes('[runtime/flow] Resuming flow');
    const hasParallelActiveSet = operatorOut.includes('[runtime/parallel] Active nodes:');
    const hasNodeBranchA = operatorOut.includes('branch-a');
    const hasNodeBranchB = operatorOut.includes('branch-b');

    console.log("Validation:");
    console.log(`- Operator stream has resume notice: ${hasResumedNotice ? "Yes" : "No"}`);
    console.log(`- Operator stream has parallel.active_set: ${hasParallelActiveSet ? "Yes" : "No"}`);
    console.log(`- parallel.active_set includes branch-a: ${hasNodeBranchA ? "Yes" : "No"}`);
    console.log(`- parallel.active_set includes branch-b: ${hasNodeBranchB ? "Yes" : "No"}`);

    assert.ok(hasResumedNotice, "Expected operator stream to contain flow.resumed notice.");
    assert.ok(hasParallelActiveSet, "Expected operator stream to contain parallel.active_set notice for resumed multi-node flow.");
    assert.ok(hasNodeBranchA, "Expected parallel.active_set to include branch-a.");
    assert.ok(hasNodeBranchB, "Expected parallel.active_set to include branch-b.");

    // Verify ordering: resume notice precedes parallel.active_set
    const resumeIdx = operatorOut.indexOf('[runtime/flow] Resuming flow');
    const parallelIdx = operatorOut.indexOf('[runtime/parallel] Active nodes:');
    assert.ok(resumeIdx < parallelIdx, "Expected flow.resumed notice to precede parallel.active_set notice.");

    console.log("Resume-parallel test PASSED.");
  } catch (e: any) {
    console.error("Test execution failed:", e.stack);
    process.exitCode = 1;
  } finally {
    inputStream.destroy();
    outputStream.destroy();
    fs.rmSync(tmpBase, { recursive: true, force: true });
    delete process.env.A_SOCIETY_STATE_DIR;
    delete process.env.A_SOCIETY_SETTINGS_DIR;
  }
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
