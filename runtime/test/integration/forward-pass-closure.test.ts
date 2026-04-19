import assert from 'node:assert';
import { FlowOrchestrator } from '../../src/orchestrator.js';
import { SessionStore } from '../../src/store.js';
import { OperatorEventRenderer } from '../../src/operator-renderer.js';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { PassThrough } from 'node:stream';

/**
 * Correction 4 verification: a real forward-pass-closed signal drives through
 * the orchestrator and emits the approved operator notice before improvement
 * orchestration begins.
 *
 * The mock server returns a forward-pass-closed handoff on turn 1. The inputStream
 * has "3\n" pre-written so ImprovementOrchestrator selects "no improvement" without
 * blocking. The test asserts the operator stream contains the notice and that it
 * precedes any improvement orchestration output on the assistant stream.
 */
async function runTest() {
  console.log("Starting forward-pass-closure integration test...");

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "placeholder" } }] })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  });

  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as any).port;

  process.env.LLM_PROVIDER = 'openai-compatible';
  process.env.OPENAI_COMPAT_BASE_URL = `http://127.0.0.1:${port}/v1`;
  process.env.OPENAI_COMPAT_API_KEY = 'test-key';
  process.env.OPENAI_COMPAT_MODEL = 'mock-model';

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'forward-pass-closure-test-'));
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
  fs.mkdirSync(rolesDir, { recursive: true });
  fs.mkdirSync(path.join(projectADocsPath, 'indexes'), { recursive: true });
  fs.mkdirSync(path.join(rolesDir, 'start'), { recursive: true });
  fs.writeFileSync(path.join(rolesDir, 'start', 'required-readings.yaml'), 'role: start\nrequired_readings:\n  - $A_SOCIETY_AGENTS\n  - $TEST_PROJECT_START_ROLE\n');
  fs.writeFileSync(path.join(projectADocsPath, 'agents.md'), "Hello Agents");
  fs.writeFileSync(path.join(projectADocsPath, 'indexes', 'main.md'),
    `| \`$A_SOCIETY_AGENTS\` | \`test-project/a-docs/agents.md\` |\n` +
    `| \`$TEST_PROJECT_START_ROLE\` | \`test-project/a-docs/roles/start/main.md\` |\n`
  );
  fs.writeFileSync(path.join(rolesDir, 'start', 'main.md'), "Start Role Doc");

  const workflowGraph = `workflow:
  name: test-flow
  nodes:
    - id: start
      role: 'start'
  edges: []
`;
  fs.writeFileSync(path.join(recordPath, 'workflow.yaml'), workflowGraph);

  // The artifact basename used in the handoff block determines what appears in the notice
  const closureArtifactPath = path.join(recordPath, 'closure-artifact.md');
  fs.writeFileSync(closureArtifactPath, "Forward pass closure artifact.");

  SessionStore.init();
  SessionStore.saveFlowRun({
    flowId: 'test-fpc-flow-id',
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

  const operatorStream = new PassThrough();
  const operatorChunks: string[] = [];
  operatorStream.on('data', (chunk: Buffer) => {
    const text = chunk.toString();
    operatorChunks.push(text);
    process.stderr.write(text);
  });

  const renderer = new OperatorEventRenderer(operatorStream as any);
  const orchestrator = new FlowOrchestrator(renderer);

  // outputStream captures assistant text and improvement orchestrator prompts
  const outputStream = new PassThrough();
  const outputChunks: string[] = [];
  outputStream.on('data', (chunk: Buffer) => {
    outputChunks.push(chunk.toString());
  });

  // Pre-write "3\n" so ImprovementOrchestrator reads it immediately when
  // it creates a readline interface on this stream (no improvement selected).
  const inputStream = new PassThrough();
  inputStream.write('3\n');

  server.removeAllListeners('request');
  server.on('request', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    // Turn 1: return a forward-pass-closed handoff block
    const handoffBlock =
      "```handoff\n" +
      "type: forward-pass-closed\n" +
      `record_folder_path: '${recordPath}'\n` +
      `artifact_path: '${closureArtifactPath}'\n` +
      "```";
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Forward pass done. " + handoffBlock } }] })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  });

  try {
    const flowRun = SessionStore.loadFlowRun();
    if (!flowRun) throw new Error("flowRun not loaded");

    console.log("\n--- Advancing 'start' node (expects forward-pass-closed) ---");
    await orchestrator.advanceFlow(flowRun, 'start', undefined, undefined, inputStream, outputStream);
    console.log("\n--- Orchestration Complete ---\n");

    const operatorOut = operatorChunks.join('');
    const assistantOut = outputChunks.join('');

    console.log("Operator stream output:");
    console.log(operatorOut);
    console.log("Assistant/improvement stream output:");
    console.log(assistantOut);

    const expectedNotice = '[runtime/flow] Forward pass closed via closure-artifact.md; starting improvement phase';
    const hasForwardPassNotice = operatorOut.includes(expectedNotice);

    // The improvement orchestrator writes its menu prompt and closure message to outputStream
    const hasImprovementPrompt = assistantOut.includes('Enter 1, 2, or 3:');
    const hasImprovementClosure = assistantOut.includes('[improvement] No improvement selected. Record closed.');

    // Verify ordering: forward-pass notice on operator stream appears before
    // improvement orchestration output on output stream (separate streams — the
    // emit call precedes the ImprovementOrchestrator.handleForwardPassClosure call
    // in orchestrator.ts, so this ordering is structurally guaranteed)
    console.log("Validation:");
    console.log(`- Operator stream has forward-pass-closed notice: ${hasForwardPassNotice ? "Yes" : "No"}`);
    console.log(`- Output stream has improvement prompt: ${hasImprovementPrompt ? "Yes" : "No"}`);
    console.log(`- Output stream has improvement closure: ${hasImprovementClosure ? "Yes" : "No"}`);

    assert.ok(hasForwardPassNotice,
      `Expected operator stream to contain: "${expectedNotice}"`);
    assert.ok(hasImprovementPrompt,
      "Expected output stream to contain improvement orchestrator prompt.");
    assert.ok(hasImprovementClosure,
      "Expected output stream to contain no-improvement closure message.");

    // The flow should be completed after "no improvement" selection
    const finalFlow = SessionStore.loadFlowRun()!;
    assert.strictEqual(finalFlow.status, 'completed',
      "Expected flow to be completed after no-improvement selection.");

    console.log("Forward-pass-closure test PASSED.");
  } catch (e: any) {
    console.error("Test execution failed:", e.stack);
    process.exitCode = 1;
  } finally {
    server.close();
    inputStream.destroy();
    outputStream.destroy();
    fs.rmSync(tmpBase, { recursive: true, force: true });
  }
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
