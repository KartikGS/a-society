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
  console.log('Starting bootstrap-join-deferral integration test...');

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Test server catch-all.' } }] })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  });

  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as any).port;

  process.env.LLM_PROVIDER = 'openai-compatible';
  process.env.OPENAI_COMPAT_BASE_URL = `http://127.0.0.1:${port}/v1`;
  process.env.OPENAI_COMPAT_API_KEY = 'test-key';
  process.env.OPENAI_COMPAT_MODEL = 'mock-model';

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-join-deferral-test-'));
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
  owner:
    - $TEST_PROJECT_OWNER_ROLE
  curator:
    - $TEST_PROJECT_CURATOR_ROLE
  technical-architect:
    - $TEST_PROJECT_TA_ROLE
`);

  fs.writeFileSync(path.join(projectADocsPath, 'agents.md'), 'Hello Agents');
  fs.writeFileSync(path.join(projectADocsPath, 'indexes', 'main.md'), `| \`$A_SOCIETY_AGENTS\` | \`test-project/a-docs/agents.md\` |
| \`$TEST_PROJECT_OWNER_ROLE\` | \`test-project/a-docs/roles/owner.md\` |
| \`$TEST_PROJECT_CURATOR_ROLE\` | \`test-project/a-docs/roles/curator.md\` |
| \`$TEST_PROJECT_TA_ROLE\` | \`test-project/a-docs/roles/technical-architect.md\` |
`);
  fs.writeFileSync(path.join(projectADocsPath, 'roles', 'owner.md'), 'Owner Role Doc');
  fs.writeFileSync(path.join(projectADocsPath, 'roles', 'curator.md'), 'Curator Role Doc');
  fs.writeFileSync(path.join(projectADocsPath, 'roles', 'technical-architect.md'), 'TA Role Doc');

  const workflowGraph = `---
workflow:
  name: bootstrap-join-deferral
  nodes:
    - id: owner-intake
      role: 'Owner'
    - id: ta
      role: 'Technical Architect'
    - id: curator
      role: 'Curator'
    - id: owner-close
      role: 'Owner'
  edges:
    - from: owner-intake
      to: ta
    - from: owner-intake
      to: curator
    - from: ta
      to: curator
    - from: curator
      to: owner-close
---
`;
  fs.writeFileSync(path.join(recordPath, 'workflow.md'), workflowGraph);

  const inputStream = new PassThrough();
  let bootstrapAnswered = false;
  let inputClosed = false;
  let waitingForInputCount = 0;

  const operatorStream = new PassThrough();
  const operatorChunks: string[] = [];
  operatorStream.on('data', (chunk: Buffer) => {
    const text = chunk.toString();
    operatorChunks.push(text);
    process.stderr.write(text);

    const waitMatches = text.match(/\[runtime\/human\] Waiting for operator input/g);
    if (waitMatches) {
      waitingForInputCount += waitMatches.length;
    }
    if (waitingForInputCount >= 1 && !bootstrapAnswered) {
      bootstrapAnswered = true;
      inputStream.write('Route this flow.\n');
    }
    if (waitingForInputCount >= 2 && !inputClosed) {
      inputClosed = true;
      inputStream.end();
    }
  });

  const renderer = new OperatorEventRenderer(operatorStream as any);
  const orchestrator = new FlowOrchestrator(renderer);

  const outputStream = new PassThrough();
  const assistantChunks: string[] = [];
  outputStream.on('data', (chunk: Buffer) => {
    assistantChunks.push(chunk.toString());
  });

  let serverTurn = 0;
  server.removeAllListeners('request');
  server.on('request', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    serverTurn++;

    if (serverTurn === 1) {
      const promptHuman = 'What should we work on? ```handoff\ntype: prompt-human\n```';
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: promptHuman } }] })}\n\n`);
    } else if (serverTurn === 2) {
      fs.writeFileSync(path.join(recordPath, '01-owner-to-curator.md'), 'Owner brief for Curator.');
      fs.writeFileSync(path.join(recordPath, '01-owner-to-ta.md'), 'Owner brief for TA.');
      const handoffBlock = `Bootstrap routing. \`\`\`handoff
- role: 'Curator'
  artifact_path: 'test-project/records/test-flow/01-owner-to-curator.md'
- role: 'Technical Architect'
  artifact_path: 'test-project/records/test-flow/01-owner-to-ta.md'
\`\`\``;
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: handoffBlock } }] })}\n\n`);
    } else {
      const taPromptHuman = 'Need clarification. ```handoff\ntype: prompt-human\n```';
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: taPromptHuman } }] })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  });

  try {
    await orchestrator.startUnifiedOrchestration(workspaceRoot, projectNamespace, 'Owner', inputStream, outputStream);

    const flowRun = SessionStore.loadFlowRun()!;
    const operatorOut = operatorChunks.join('');

    assert.ok(flowRun.completedNodes.includes('owner-intake'), 'bootstrap should complete the real Owner start node');
    assert.ok(flowRun.activeNodes.includes('ta'), 'TA should be active after bootstrap handoff');
    assert.ok(!flowRun.activeNodes.includes('curator'), 'Curator join node must remain deferred until TA completes');
    assert.deepStrictEqual(
      flowRun.completedEdgeArtifacts,
      {
        'owner-intake=>curator': 'test-project/records/test-flow/01-owner-to-curator.md',
        'owner-intake=>ta': 'test-project/records/test-flow/01-owner-to-ta.md',
      },
      'bootstrap handoff should persist edge-scoped artifacts'
    );
    assert.ok(
      operatorOut.includes('Join pending: curator (Curator) waiting for ta'),
      'bootstrap routing should emit join waiting when one branch is deferred'
    );
  } finally {
    server.close();
    fs.rmSync(tmpBase, { recursive: true, force: true });
    delete process.env.A_SOCIETY_STATE_DIR;
  }

  console.log('Integration test PASSED.');
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
