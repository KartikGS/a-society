import assert from 'node:assert';
import { FlowOrchestrator } from '../../src/orchestrator.js';
import { SessionStore } from '../../src/store.js';
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
  fs.mkdirSync(path.join(projectADocsPath, 'roles'), { recursive: true });
  fs.mkdirSync(path.join(projectADocsPath, 'indexes'), { recursive: true });
  
  fs.writeFileSync(path.join(projectADocsPath, 'roles', 'required-readings.yaml'), `
universal:
  - $A_SOCIETY_AGENTS
roles:
  start:
    - $TEST_PROJECT_START_ROLE
  next:
    - $TEST_PROJECT_NEXT_ROLE
`);
  
  fs.writeFileSync(path.join(projectADocsPath, 'agents.md'), "Hello Agents");
  fs.writeFileSync(path.join(projectADocsPath, 'indexes', 'main.md'), `| \`$A_SOCIETY_AGENTS\` | \`test-project/a-docs/agents.md\` |
| \`$TEST_PROJECT_START_ROLE\` | \`test-project/a-docs/roles/startrole.md\` |
| \`$TEST_PROJECT_NEXT_ROLE\` | \`test-project/a-docs/roles/nextrole.md\` |
`);
  fs.writeFileSync(path.join(projectADocsPath, 'roles', 'startrole.md'), "Start Role Doc");
  fs.writeFileSync(path.join(projectADocsPath, 'roles', 'nextrole.md'), "Next Role Doc");

  const workflowGraph = `---
workflow:
  nodes:
    - id: start
      role: 'start'
    - id: next
      role: 'next'
  edges:
    - from: start
      to: next
---
`;
  fs.writeFileSync(path.join(recordPath, 'workflow.md'), workflowGraph);

  SessionStore.init();
  SessionStore.saveFlowRun({
    flowId: 'test-flow-id',
    projectRoot: workspaceRoot,
    projectNamespace,
    recordFolderPath: recordPath,
    activeNodes: ['start'],
    completedNodes: [],
    completedNodeArtifacts: {},
    pendingNodeArtifacts: { 'start': [] },
    status: 'running',
    stateVersion: '2'
  });

  const orchestrator = new FlowOrchestrator();

  const inputStream = new PassThrough();
  const outputStream = new PassThrough();

  outputStream.on('data', chunk => {
    const text = chunk.toString();
    process.stdout.write(text);
    if (text.includes(">")) {
      console.log("\n[Test] Detected conversational suspension, simulating user input...");
      setTimeout(() => inputStream.write("Do the handoff.\n"), 50);
    }
  });

  const originalCwd = process.cwd();
  try {
    const flowRun = SessionStore.loadFlowRun();
    if (!flowRun) throw new Error("flowRun not loaded");

    console.log("\n--- Starting Orchestration Run ---");
    let serverTurn = 0;
    server.on('request', (_req, _res) => {
      // Listener reset below.
    });

    server.removeAllListeners('request');
    server.on('request', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        serverTurn++;
        
        if (serverTurn === 1) {
            // Send malformed handoff to trigger Change 4
            const content = "Here is a broken handoff: ```handoff\nrole: !!broken\n```";
            res.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
            res.write(`data: [DONE]\n\n`);
            res.end();
        } else if (serverTurn === 2) {
            // The model should have received the error, now send a valid one
            const handoffBlock = "```handoff\nrole: 'next'\nartifact_path: 'mock.md'\n```";
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
    const errorInHistory = history.some(m => m.role === 'user' && m.content.includes("Handoff block could not be parsed"));

    console.log("Validation:");
    console.log(`- Node 'start' completed: ${updatedFlow.completedNodes.includes('start') ? "Yes" : "No"}`);
    console.log(`- Node 'next' is active: ${updatedFlow.activeNodes.includes('next') ? "Yes" : "No"}`);
    console.log(`- Error feedback loop triggered: ${errorInHistory ? "Yes" : "No"}`);

    assert.ok(updatedFlow.completedNodes.includes('start'), "Expected node 'start' to be completed.");
    assert.ok(updatedFlow.activeNodes.includes('next'), "Expected node 'next' to be active.");
    assert.ok(errorInHistory, "Expected malformed handoff feedback to be injected into session history.");
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
