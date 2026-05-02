import assert from 'node:assert';
import { FlowOrchestrator } from '../../src/orchestrator.js';
import { SessionStore } from '../../src/store.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { PassThrough } from 'node:stream';
import { seedTestModelSettings } from './settings-test-utils.js';

async function runTest() {
  console.log('Starting missing-artifact-handoff integration test...');

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Test server catch-all.' } }] })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  });

  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as any).port;

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'missing-artifact-handoff-test-'));
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
  fs.writeFileSync(path.join(rolesDir, 'start', 'required-readings.yaml'), 'role: start\nrequired_readings:\n  - $A_SOCIETY_AGENTS\n  - $TEST_PROJECT_START_ROLE\n');
  fs.writeFileSync(path.join(rolesDir, 'next', 'required-readings.yaml'), 'role: next\nrequired_readings:\n  - $A_SOCIETY_AGENTS\n  - $TEST_PROJECT_NEXT_ROLE\n');

  fs.writeFileSync(path.join(projectADocsPath, 'agents.md'), 'Hello Agents');
  fs.writeFileSync(path.join(projectADocsPath, 'indexes', 'main.md'), `| \`$A_SOCIETY_AGENTS\` | \`test-project/a-docs/agents.md\` |
| \`$TEST_PROJECT_START_ROLE\` | \`test-project/a-docs/roles/start/main.md\` |
| \`$TEST_PROJECT_NEXT_ROLE\` | \`test-project/a-docs/roles/next/main.md\` |
`);
  fs.writeFileSync(path.join(rolesDir, 'start', 'main.md'), 'Start Role Doc');
  fs.writeFileSync(path.join(rolesDir, 'next', 'main.md'), 'Next Role Doc');

  const workflowGraph = `workflow:
  name: missing-artifact-test-flow
  nodes:
    - id: start
      role: 'start'
    - id: next
      role: 'next'
  edges:
    - from: start
      to: next
`;
  fs.writeFileSync(path.join(recordPath, 'workflow.yaml'), workflowGraph);

  SessionStore.init();
  SessionStore.saveFlowRun({
    flowId: 'test-missing-artifact-flow-id',
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordPath,
    readyNodes: ['start'],
    runningNodes: [],
    awaitingHumanNodes: {},
    completedNodes: [],
    completedEdgeArtifacts: {},
    pendingNodeArtifacts: { start: [] },
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
      const handoffBlock = "```handoff\ntarget_node_id: 'next'\nartifact_path: 'missing-output.md'\n```";
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Attempting handoff. " + handoffBlock } }] })}\n\n`);
    } else {
      fs.writeFileSync(path.join(workspaceRoot, 'valid-output.md'), 'Valid artifact content.');
      const handoffBlock = "```handoff\ntarget_node_id: 'next'\nartifact_path: 'valid-output.md'\n```";
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Retrying with saved artifact. " + handoffBlock } }] })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  });

  try {
    const flowRun = SessionStore.loadFlowRun();
    if (!flowRun) throw new Error('flowRun not loaded');

    await orchestrator.advanceFlow(flowRun, 'start', undefined, undefined, inputStream, outputStream);

    const updatedFlow = SessionStore.loadFlowRun()!;
    assert.ok(updatedFlow.completedNodes.includes('start'), "Expected node 'start' to be completed after repaired handoff.");
    assert.ok(updatedFlow.readyNodes.includes('next'), "Expected node 'next' to activate after repaired handoff.");
    assert.ok(
      sink.events.some(e => e.kind === 'repair.requested' && e.scope === 'node'),
      'Expected sink to contain a repair.requested event with scope "node".'
    );
  } finally {
    server.close();
    inputStream.destroy();
    outputStream.destroy();
    fs.rmSync(tmpBase, { recursive: true, force: true });
    delete process.env.A_SOCIETY_STATE_DIR;
    delete process.env.A_SOCIETY_SETTINGS_DIR;
  }

  console.log('Integration test PASSED.');
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
