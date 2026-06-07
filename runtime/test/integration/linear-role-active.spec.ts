import assert from 'node:assert';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { SessionStore } from '../../src/orchestration/store.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { it } from 'vitest';
import { listenOnLocalhost, seedTestModelSettings } from './settings-test-utils.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';

import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
/**
 * Correction 3 verification: a full linear orchestration run emits exactly one
 * role.active notice for the successor node when it is claimed.
 *
 * Handoff makes the successor ready; advanceFlow emits role.active when the
 * scheduler or direct caller actually claims and enters that node.
 */
async function runTest() {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "placeholder" } }] })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  });

  const port = await listenOnLocalhost(server);

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'linear-role-active-test-'));
  const workspaceRoot = tmpBase;
  const projectNamespace = 'test-project';
  const testDir = path.join(workspaceRoot, projectNamespace);
  const testStateDir = path.join(tmpBase, '.a-society', 'state');
  const testSettingsDir = path.join(tmpBase, '.a-society');
  fs.mkdirSync(testDir);
  fs.mkdirSync(testStateDir, { recursive: true });
  seedTestModelSettings(testSettingsDir, { providerBaseUrl: `http://127.0.0.1:${port}/v1` });

  const flowId = 'test-linear-flow-id';
  const recordPath = getFlowRecordDir(workspaceRoot, { projectNamespace, flowId });
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
  fs.writeFileSync(path.join(rolesDir, 'start', 'ownership.yaml'), 'role: start\nsurfaces: []\n');
  fs.writeFileSync(path.join(rolesDir, 'next', 'ownership.yaml'), 'role: next\nsurfaces: []\n');
  fs.writeFileSync(path.join(rolesDir, 'end', 'ownership.yaml'), 'role: end\nsurfaces: []\n');

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

  SessionStore.init(workspaceRoot);
  SessionStore.saveFlowRun({
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordPath,
    runningNodes: ['start'],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    completedHandoffs: [],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION
  });

  const sink = new RecordingOperatorSink();
  const orchestrator = new FlowOrchestrator(sink);

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

    await orchestrator.advanceFlow(flowRun, 'start');

    const flowAfterStart = SessionStore.loadFlowRun()!;
    assert.ok(flowAfterStart.completedHandoffs.includes('start=>next'), "Expected 'start' handoff to be completed.");
    assert.deepStrictEqual(flowAfterStart.receivingHandoff['start=>next'], ['start-output.md'], "Expected 'next' to receive the handoff.");

    await orchestrator.advanceFlow(flowAfterStart, 'next');

    const nextRoleActiveCount = sink.events.filter(
      e => e.kind === 'role.active' && e.nodeId === 'next'
    ).length;

    assert.strictEqual(
      nextRoleActiveCount,
      1,
      `Expected exactly one role.active event for successor node 'next', got ${nextRoleActiveCount}`
    );
    const flowAfterNext = SessionStore.loadFlowRun()!;
    assert.ok(flowAfterNext.completedHandoffs.includes('next=>end'), "Expected node 'next' handoff to be completed.");
    assert.deepStrictEqual(flowAfterNext.receivingHandoff['next=>end'], ['next-output.md'], "Expected successor node 'end' to receive the handoff.");
  } finally {
    server.close();
    fs.rmSync(tmpBase, { recursive: true, force: true });
  }
}

it('emits exactly one role.active notice when a linear successor is claimed', async () => {
  await runTest();
});
