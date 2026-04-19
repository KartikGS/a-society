import assert from 'node:assert';
import { FlowOrchestrator } from '../../src/orchestrator.js';
import { SessionStore } from '../../src/store.js';
import { OperatorEventRenderer } from '../../src/operator-renderer.js';
import http from 'node:http';

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { PassThrough } from 'node:stream';

async function runTest() {
  console.log("Starting unified-routing integration test...");

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Test server catch-all." } }] })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  });

  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as any).port;

  process.env.LLM_PROVIDER = 'openai-compatible';
  process.env.OPENAI_COMPAT_BASE_URL = `http://127.0.0.1:${port}/v1`;
  process.env.OPENAI_COMPAT_API_KEY = 'test-key';
  process.env.OPENAI_COMPAT_MODEL = 'mock-model';

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'unified-routing-test-'));
  const workspaceRoot = tmpBase;
  const projectNamespace = 'test-project';
  const testDir = path.join(workspaceRoot, projectNamespace);
  const testStateDir = path.join(tmpBase, '.state');
  fs.mkdirSync(testDir);
  fs.mkdirSync(testStateDir);

  process.env.A_SOCIETY_STATE_DIR = testStateDir;

  const recordPath = path.join(testDir, 'records', 'test-flow');
  fs.mkdirSync(recordPath, { recursive: true });
  const projectADocsPath = path.join(testDir, 'a-docs');
  const rolesDir = path.join(projectADocsPath, 'roles');
  const workflowDir = path.join(projectADocsPath, 'workflow');
  fs.mkdirSync(rolesDir, { recursive: true });
  fs.mkdirSync(workflowDir, { recursive: true });
  fs.mkdirSync(path.join(projectADocsPath, 'indexes'), { recursive: true });
  fs.mkdirSync(path.join(rolesDir, 'start'), { recursive: true });
  fs.mkdirSync(path.join(rolesDir, 'next'), { recursive: true });
  fs.writeFileSync(path.join(rolesDir, 'start', 'required-readings.yaml'), 'role: start\nrequired_readings:\n  - $A_SOCIETY_AGENTS\n  - $TEST_PROJECT_START_ROLE\n');
  fs.writeFileSync(path.join(rolesDir, 'next', 'required-readings.yaml'), 'role: next\nrequired_readings:\n  - $A_SOCIETY_AGENTS\n  - $TEST_PROJECT_NEXT_ROLE\n');

  fs.writeFileSync(path.join(projectADocsPath, 'agents.md'), "Hello Agents");
  fs.writeFileSync(path.join(projectADocsPath, 'indexes', 'main.md'), `| \`$A_SOCIETY_AGENTS\` | \`test-project/a-docs/agents.md\` |
| \`$TEST_PROJECT_START_ROLE\` | \`test-project/a-docs/roles/start/main.md\` |
| \`$TEST_PROJECT_NEXT_ROLE\` | \`test-project/a-docs/roles/next/main.md\` |
`);
  fs.writeFileSync(path.join(rolesDir, 'start', 'main.md'), "Start Role Doc");
  fs.writeFileSync(path.join(rolesDir, 'next', 'main.md'), "Next Role Doc");
  fs.writeFileSync(path.join(workflowDir, 'main.yaml'), `workflow:
  name: canonical-test-flow
  nodes:
    - id: start
      role: 'start'
      guidance:
        - Use the canonical workflow contract.
    - id: next
      role: 'next'
  edges:
    - from: start
      to: next
`);

  const workflowGraph = `workflow:
  name: test-flow
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
    flowId: 'test-flow-id',
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordPath,
    activeNodes: ['start'],
    completedNodes: [],
    completedEdgeArtifacts: {},
    pendingNodeArtifacts: { 'start': [] },
    status: 'running',
    stateVersion: '6'
  });

  // Capture operator (stderr) and assistant (stdout) streams separately
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
  const assistantChunks: string[] = [];
  outputStream.on('data', (chunk: Buffer) => {
    assistantChunks.push(chunk.toString());
  });

  const originalCwd = process.cwd();
  try {
    const flowRun = SessionStore.loadFlowRun();
    if (!flowRun) throw new Error("flowRun not loaded");

    console.log("\n--- Starting Orchestration Run ---");
    let serverTurn = 0;
    server.removeAllListeners('request');
    server.on('request', (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      serverTurn++;

      if (serverTurn === 1) {
        // Send malformed handoff to trigger repair loop
        const content = "Here is a broken handoff: ```handoff\ntarget_node_id:\n```";
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        res.end();
      } else if (serverTurn === 2) {
        // Model should have received the repair message; now send a valid handoff
        fs.writeFileSync(path.join(workspaceRoot, 'mock.md'), 'Mock artifact content.');
        const handoffBlock = "```handoff\ntarget_node_id: 'next'\nartifact_path: 'mock.md'\n```";
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Fixed: " + handoffBlock } }] })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        res.end();
      } else {
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Done." } }] })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        res.end();
      }
    });

    await orchestrator.advanceFlow(flowRun, 'start', undefined, undefined, inputStream, outputStream);
    console.log("\n--- Orchestration Complete ---\n");

    const updatedFlow = SessionStore.loadFlowRun()!;
    const session = SessionStore.loadRoleSession(`${flowRun.flowId}__start`);
    const history = session?.transcriptHistory as any[];

    // The repair message injected into history is the model-facing repair message
    const repairInjected = history.some(m =>
      m.role === 'user' && (
        m.content.includes('target_node_id') ||
        m.content.includes('artifact_path') ||
        m.content.includes('No handoff block found')
      )
    );
    const canonicalGuidanceInjected = history.some(m =>
      m.role === 'user' &&
      m.content.includes('Use the canonical workflow contract.')
    );

    const operatorOut = operatorChunks.join('');
    const assistantOut = assistantChunks.join('');

    // Verify operator stream contains the handoff notice and role.active notice
    const hasHandoffNotice = operatorOut.includes('[runtime/handoff]');
    const hasRoleActiveNotice = operatorOut.includes('[runtime/role]');
    // Verify operator stream contains repair notice
    const hasRepairNotice = operatorOut.includes('[runtime/repair]');
    // Verify assistant text does not appear in operator stream
    const assistantTextInOperator = operatorOut.includes('Here is a broken handoff');

    console.log("Validation:");
    console.log(`- Node 'start' completed: ${updatedFlow.completedNodes.includes('start') ? "Yes" : "No"}`);
    console.log(`- Node 'next' is active: ${updatedFlow.activeNodes.includes('next') ? "Yes" : "No"}`);
    console.log(`- Repair message injected into history: ${repairInjected ? "Yes" : "No"}`);
    console.log(`- Canonical node guidance injected from main workflow: ${canonicalGuidanceInjected ? "Yes" : "No"}`);
    console.log(`- Operator stream has handoff notice: ${hasHandoffNotice ? "Yes" : "No"}`);
    console.log(`- Operator stream has role.active notice: ${hasRoleActiveNotice ? "Yes" : "No"}`);
    console.log(`- Operator stream has repair notice: ${hasRepairNotice ? "Yes" : "No"}`);
    console.log(`- Assistant text leaked into operator stream: ${assistantTextInOperator ? "Yes (FAIL)" : "No"}`);

    assert.ok(updatedFlow.completedNodes.includes('start'), "Expected node 'start' to be completed.");
    assert.ok(updatedFlow.activeNodes.includes('next'), "Expected node 'next' to be active.");
    assert.ok(repairInjected, "Expected model-facing repair message to be injected into session history.");
    assert.ok(canonicalGuidanceInjected, "Expected node contract guidance to be resolved from a-docs/workflow/main.yaml.");
    assert.ok(hasHandoffNotice, "Expected operator stream to contain a handoff notice.");
    assert.ok(hasRoleActiveNotice, "Expected operator stream to contain a role.active notice.");
    assert.ok(hasRepairNotice, "Expected operator stream to contain a repair notice.");
    assert.ok(!assistantTextInOperator, "Assistant text must not leak into the operator stream.");

    console.log("Integration test PASSED.");

  } catch (e: any) {
    console.error("Test execution failed:", e.stack);
    process.exitCode = 1;
  } finally {
    process.chdir(originalCwd);
    server.close();
    fs.rmSync(tmpBase, { recursive: true, force: true });
  }
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
