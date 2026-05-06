import assert from 'node:assert';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { SessionStore } from '../../src/orchestration/store.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { PassThrough } from 'node:stream';
import { seedTestModelSettings } from './settings-test-utils.js';

/**
 * Verification: resumed multi-node flows emit flow.resumed with open-node count.
 *
 * Pre-saves a flow with two active nodes and status='awaiting_human'.
 * Calls runStoredFlow, which takes the resume path and skips
 * the while loop (status !== 'running').
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

  const sink = new RecordingOperatorSink();
  const orchestrator = new FlowOrchestrator(sink);

  const inputStream = new PassThrough();
  const outputStream = new PassThrough();

  try {
    await orchestrator.runStoredFlow(workspaceRoot, projectNamespace, 'Owner', inputStream, outputStream);

    const resumeEvent = sink.events.find(e => e.kind === 'flow.resumed');

    const hasResumedNotice = resumeEvent !== undefined;

    console.log("Validation:");
    console.log(`- Sink has flow.resumed event: ${hasResumedNotice ? "Yes" : "No"}`);
    console.log(`- flow.resumed active node count: ${resumeEvent?.kind === 'flow.resumed' ? resumeEvent.activeNodeCount : 'n/a'}`);

    assert.ok(hasResumedNotice, "Expected sink to contain flow.resumed event.");
    assert.strictEqual(resumeEvent?.kind === 'flow.resumed' ? resumeEvent.activeNodeCount : 0, 2);
    assert.deepStrictEqual(sink.events.map(e => e.kind), ['flow.resumed']);

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
