import assert from 'node:assert';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { SessionStore } from '../../src/orchestration/store.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { PassThrough } from 'node:stream';
import { seedTestModelSettings } from './settings-test-utils.js';

/**
 * Correction 3 verification: a full linear orchestration run emits exactly one
 * role.active notice for the successor node when it is claimed.
 *
 * Handoff makes the successor ready; advanceFlow emits role.active when the
 * scheduler or direct caller actually claims and enters that node.
 */
async function runTest() {
  console.log("Starting linear-role-active integration test...");

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "placeholder" } }] })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  });

  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as any).port;

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'linear-role-active-test-'));
  const workspaceRoot = tmpBase;
  const projectNamespace = 'test-project';
  const testDir = path.join(workspaceRoot, projectNamespace);
  const testStateDir = path.join(tmpBase, '.state');
  const testSettingsDir = path.join(tmpBase, '.settings');
  fs.mkdirSync(testDir);
  fs.mkdirSync(testStateDir);
  process.env.A_SOCIETY_STATE_DIR = testStateDir;
  process.env.A_SOCIETY_SETTINGS_DIR = testSettingsDir;
  seedTestModelSettings(testSettingsDir, { providerBaseUrl: `http://127.0.0.1:${port}/v1` });

  const recordPath = path.join(testDir, 'records', 'test-flow');
  fs.mkdirSync(recordPath, { recursive: true });
  const projectADocsPath = path.join(testDir, 'a-docs');
  const rolesDir = path.join(projectADocsPath, 'roles');
  fs.mkdirSync(rolesDir, { recursive: true });
  fs.mkdirSync(path.join(projectADocsPath, 'indexes'), { recursive: true });
  fs.mkdirSync(path.join(rolesDir, 'start'), { recursive: true });
  fs.mkdirSync(path.join(rolesDir, 'next'), { recursive: true });
  fs.mkdirSync(path.join(rolesDir, 'end'), { recursive: true });
  fs.writeFileSync(path.join(rolesDir, 'start', 'required-readings.yaml'), 'role: start\nrequired_readings:\n  - $A_SOCIETY_AGENTS\n  - $TEST_PROJECT_START_ROLE\n');
  fs.writeFileSync(path.join(rolesDir, 'next', 'required-readings.yaml'), 'role: next\nrequired_readings:\n  - $A_SOCIETY_AGENTS\n  - $TEST_PROJECT_NEXT_ROLE\n');
  fs.writeFileSync(path.join(rolesDir, 'end', 'required-readings.yaml'), 'role: end\nrequired_readings:\n  - $A_SOCIETY_AGENTS\n  - $TEST_PROJECT_END_ROLE\n');
  fs.writeFileSync(path.join(projectADocsPath, 'agents.md'), "Hello Agents");
  fs.writeFileSync(path.join(projectADocsPath, 'indexes', 'main.md'),
    `| \`$A_SOCIETY_AGENTS\` | \`test-project/a-docs/agents.md\` |\n` +
    `| \`$TEST_PROJECT_START_ROLE\` | \`test-project/a-docs/roles/start/main.md\` |\n` +
    `| \`$TEST_PROJECT_NEXT_ROLE\` | \`test-project/a-docs/roles/next/main.md\` |\n` +
    `| \`$TEST_PROJECT_END_ROLE\` | \`test-project/a-docs/roles/end/main.md\` |\n`
  );
  fs.writeFileSync(path.join(rolesDir, 'start', 'main.md'), "Start Role Doc");
  fs.writeFileSync(path.join(rolesDir, 'next', 'main.md'), "Next Role Doc");
  fs.writeFileSync(path.join(rolesDir, 'end', 'main.md'), "End Role Doc");

  const workflowGraph = `workflow:
  name: test-flow
  nodes:
    - id: start
      role: 'start'
    - id: next
      role: 'next'
    - id: end
      role: 'end'
  edges:
    - from: start
      to: next
    - from: next
      to: end
`;
  fs.writeFileSync(path.join(recordPath, 'workflow.yaml'), workflowGraph);

  SessionStore.init();
  SessionStore.saveFlowRun({
    flowId: 'test-linear-flow-id',
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordPath,
    readyNodes: ['start'],
    runningNodes: [],
    awaitingHumanNodes: {},
    completedNodes: [],
    completedEdgeArtifacts: {},
    pendingNodeArtifacts: { 'start': [] },
    status: 'running',
    stateVersion: '7'
  });

  const sink = new RecordingOperatorSink();
  const orchestrator = new FlowOrchestrator(sink);

  const inputStream = new PassThrough();
  const outputStream = new PassThrough();

  let serverTurn = 0;
  server.removeAllListeners('request');
  server.on('request', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    serverTurn++;

    if (serverTurn === 1) {
      // Turn 1: 'start' node produces a valid handoff to 'next'
      fs.writeFileSync(path.join(workspaceRoot, 'start-output.md'), 'Start output artifact.');
      const handoffBlock = "```handoff\ntarget_node_id: 'next'\nartifact_path: 'start-output.md'\n```";
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Work done. " + handoffBlock } }] })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    } else if (serverTurn === 2) {
      // Turn 2: 'next' node produces a valid handoff to 'end'
      fs.writeFileSync(path.join(workspaceRoot, 'next-output.md'), 'Next output artifact.');
      const handoffBlock = "```handoff\ntarget_node_id: 'end'\nartifact_path: 'next-output.md'\n```";
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "All done. " + handoffBlock } }] })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    } else {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Done." } }] })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  });

  try {
    const flowRun = SessionStore.loadFlowRun();
    if (!flowRun) throw new Error("flowRun not loaded");

    console.log("\n--- Advancing 'start' node ---");
    await orchestrator.advanceFlow(flowRun, 'start', undefined, undefined, inputStream, outputStream);

    const flowAfterStart = SessionStore.loadFlowRun()!;
    assert.ok(flowAfterStart.completedNodes.includes('start'), "Expected 'start' to be completed.");
    assert.ok(flowAfterStart.readyNodes.includes('next'), "Expected 'next' to be ready.");

    console.log("\n--- Advancing 'next' node ---");
    await orchestrator.advanceFlow(flowAfterStart, 'next', undefined, undefined, inputStream, outputStream);

    const nextRoleActiveCount = sink.events.filter(
      e => e.kind === 'role.active' && e.nodeId === 'next'
    ).length;

    console.log("Validation:");
    console.log(`- role.active events for 'next': ${nextRoleActiveCount} (expected: 1)`);

    assert.strictEqual(
      nextRoleActiveCount,
      1,
      `Expected exactly one role.active event for successor node 'next', got ${nextRoleActiveCount}`
    );
    const flowAfterNext = SessionStore.loadFlowRun()!;
    assert.ok(flowAfterNext.completedNodes.includes('next'), "Expected node 'next' to be completed.");
    assert.ok(flowAfterNext.readyNodes.includes('end'), "Expected successor node 'end' to be ready.");

    console.log("Linear-role-active test PASSED.");
  } catch (e: any) {
    console.error("Test execution failed:", e.stack);
    process.exitCode = 1;
  } finally {
    server.close();
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
