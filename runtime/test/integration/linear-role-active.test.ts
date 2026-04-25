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
 * Correction 3 verification: a full linear orchestration run emits exactly one
 * role.active notice for the successor node, not two.
 *
 * applyHandoffAndAdvance emits role.active at the handoff boundary and tracks it
 * in pendingRoleActiveEmitted. When advanceFlow subsequently enters the same node,
 * it checks the set and suppresses the duplicate.
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

  process.env.LLM_PROVIDER = 'openai-compatible';
  process.env.OPENAI_COMPAT_BASE_URL = `http://127.0.0.1:${port}/v1`;
  process.env.OPENAI_COMPAT_API_KEY = 'test-key';
  process.env.OPENAI_COMPAT_MODEL = 'mock-model';

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'linear-role-active-test-'));
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
    assert.ok(flowAfterStart.readyNodes.includes('next'), "Expected 'next' to be active.");

    console.log("\n--- Advancing 'next' node ---");
    await orchestrator.advanceFlow(flowAfterStart, 'next', undefined, undefined, inputStream, outputStream);

    const operatorOut = operatorChunks.join('');
    console.log("\nOperator stream output:");
    console.log(operatorOut);

    // Count how many times 'next' receives a role.active notice
    const nextRoleActiveMatches = operatorOut.match(/\[runtime\/role\] Active: next/g) || [];
    const nextRoleActiveCount = nextRoleActiveMatches.length;

    console.log("Validation:");
    console.log(`- role.active notices for 'next': ${nextRoleActiveCount} (expected: 1)`);

    assert.strictEqual(
      nextRoleActiveCount,
      1,
      `Expected exactly one role.active notice for successor node 'next', got ${nextRoleActiveCount}`
    );
    const flowAfterNext = SessionStore.loadFlowRun()!;
    assert.ok(flowAfterNext.completedNodes.includes('next'), "Expected node 'next' to be completed.");
    assert.ok(flowAfterNext.readyNodes.includes('end'), "Expected successor node 'end' to be active.");

    console.log("Linear-role-active test PASSED.");
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
