import { FlowOrchestrator } from '../../src/orchestrator.js';
import { SessionStore } from '../../src/store.js';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { PassThrough } from 'node:stream';

async function runTest() {
  console.log("Starting unified-routing integration test...");
  
  let turnCount = 0;
  const server = http.createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    turnCount++;
    if (turnCount === 1) {
      const chunk = {
        choices: [{ delta: { content: "I am confused, please clarify what you want me to do next." } }]
      };
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    } else if (turnCount === 2) {
      const handoffBlock = "```yaml\nhandoff:\n  role: 'Next'\n  artifact_path: 'mock.md'\n```";
      const chunk = {
        choices: [{ delta: { content: "Okay, I am done.\n" + handoffBlock } }]
      };
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    } else {
      const chunk = {
        choices: [{ delta: { content: "Test server catch-all." } }]
      };
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  });

  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as any).port;

  process.env.LLM_PROVIDER = 'openai-compatible';
  process.env.OPENAI_COMPAT_BASE_URL = `http://127.0.0.1:${port}/v1`;
  process.env.OPENAI_COMPAT_API_KEY = 'test-key';
  process.env.OPENAI_COMPAT_MODEL = 'mock-model';

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'unified-routing-test-'));
  const testDir = path.join(tmpBase, 'test-project');
  const testStateDir = path.join(tmpBase, '.state');
  fs.mkdirSync(testDir);
  fs.mkdirSync(testStateDir);

  process.env.A_SOCIETY_STATE_DIR = testStateDir;

  const aSocietyPath = path.join(testDir, 'a-society');
  const aDocsPath = path.join(aSocietyPath, 'a-docs');
  const recordPath = path.join(aDocsPath, 'records', 'test-flow');
  fs.mkdirSync(recordPath, { recursive: true });
  fs.mkdirSync(path.join(aDocsPath, 'roles'), { recursive: true });
  fs.mkdirSync(path.join(aDocsPath, 'indexes'), { recursive: true });
  
  fs.writeFileSync(path.join(aDocsPath, 'agents.md'), "---\nuniversal_required_reading:\n  - []\n---\nHello");
  fs.writeFileSync(path.join(aDocsPath, 'indexes', 'main.md'), `| \`$A_SOCIETY_AGENTS\` | \`a-society/a-docs/agents.md\` |
| \`$TEST_PROJECT_START_ROLE\` | \`a-society/a-docs/roles/startrole.md\` |
| \`$TEST_PROJECT_NEXT_ROLE\` | \`a-society/a-docs/roles/nextrole.md\` |
`);
  fs.writeFileSync(path.join(aDocsPath, 'roles', 'startrole.md'), "---\nrequired_reading: []\n---\n");
  fs.writeFileSync(path.join(aDocsPath, 'roles', 'nextrole.md'), "---\nrequired_reading: []\n---\n");

  const workflowGraph = `---
workflow:
  nodes:
    - id: start
      role: 'Start'
    - id: next
      role: 'Next'
  edges:
    - from: start
      to: next
---
`;
  fs.writeFileSync(path.join(recordPath, 'workflow.md'), workflowGraph);

  SessionStore.init();
  SessionStore.saveFlowRun({
    flowId: 'test-flow-id',
    projectRoot: testDir,
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
    await orchestrator.advanceFlow(flowRun, 'start', undefined, undefined, inputStream, outputStream);
    console.log("\n--- Orchestration Complete ---\n");

    const updatedFlow = SessionStore.loadFlowRun()!;
    
    console.log("Validation:");
    const isCompletedStr = updatedFlow.completedNodes.includes('start') ? "Yes" : "No";
    console.log(`- Node 'start' completed: ${isCompletedStr}`);
    
    const isNextActiveStr = updatedFlow.activeNodes.includes('next') ? "Yes" : "No";
    console.log(`- Node 'next' is active: ${isNextActiveStr}`);
    
    if (updatedFlow.completedNodes.includes('start') && updatedFlow.activeNodes.includes('next')) {
       console.log("Integration test PASSED.");
    } else {
       console.log("Integration test FAILED.");
    }

  } catch (e: any) {
    console.log("Test execution failed:", e.stack);
  } finally {
    process.chdir(originalCwd);
    server.close();
    fs.rmSync(tmpBase, { recursive: true, force: true });
  }
}

runTest();
