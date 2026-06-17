import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { SessionStore } from '../../src/orchestration/store.js';
import { runStoredFlowUntil } from './orchestrator-test-utils.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import type { OperatorEvent } from '../../src/common/types.js';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { expect, it } from 'vitest';
import { listenOnLocalhost, seedTestModelSettings } from './settings-test-utils.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';

import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
async function runTest() {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Test server catch-all.' } }] })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  });

  const port = await listenOnLocalhost(server);

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'missing-artifact-handoff-test-'));
  const workspaceRoot = tmpBase;
  const projectNamespace = 'test-project';
  const testDir = path.join(workspaceRoot, projectNamespace);
  const testStateDir = path.join(tmpBase, '.a-society', 'state');
  const testSettingsDir = path.join(tmpBase, '.a-society');
  fs.mkdirSync(testDir);
  fs.mkdirSync(testStateDir, { recursive: true });
  seedTestModelSettings(testSettingsDir, { providerBaseUrl: `http://127.0.0.1:${port}/v1` });

  const flowId = 'test-missing-artifact-flow-id';
  const recordPath = getFlowRecordDir(workspaceRoot, { projectNamespace, flowId });
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
  fs.writeFileSync(path.join(projectADocsPath, 'indexes', 'main.md'), `| \`$A_SOCIETY_AGENTS\` | \`a-docs/agents.md\` |
| \`$TEST_PROJECT_START_ROLE\` | \`a-docs/roles/start/main.md\` |
| \`$TEST_PROJECT_NEXT_ROLE\` | \`a-docs/roles/next/main.md\` |
`);
  fs.writeFileSync(path.join(rolesDir, 'start', 'main.md'), 'Start Role Doc');
  fs.writeFileSync(path.join(rolesDir, 'next', 'main.md'), 'Next Role Doc');
  fs.writeFileSync(path.join(rolesDir, 'start', 'ownership.yaml'), 'role: start\nsurfaces: []\n');
  fs.writeFileSync(path.join(rolesDir, 'next', 'ownership.yaml'), 'role: next\nsurfaces: []\n');

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
    visitedNodeIds: [],
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
      const handoffBlock = "```handoff\ntarget_node_id: 'next'\nartifact_path: 'missing-output.md'\n```";
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Attempting handoff. " + handoffBlock } }] })}\n\n`);
    } else if (serverTurn === 2) {
      fs.writeFileSync(path.join(workspaceRoot, 'valid-output.md'), 'Valid artifact content.');
      const handoffBlock = "```handoff\ntarget_node_id: 'next'\nartifact_path: 'valid-output.md'\n```";
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Retrying with saved artifact. " + handoffBlock } }] })}\n\n`);
    } else {
      // 'next' node: block immediately so runStoredFlow can be terminated
      const content = "Ready for review. ```handoff\ntype: prompt-human\n```";
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  });

  try {
    await runStoredFlowUntil(
      orchestrator, workspaceRoot, projectNamespace, flowId,
      () => !!SessionStore.loadFlowRun({ projectNamespace, flowId }, workspaceRoot)?.awaitingHumanNodes['next']
    );

    const updatedFlow = SessionStore.loadFlowRun({ projectNamespace, flowId }, workspaceRoot)!;
    const repairNotice = sink.events.find(
      (e): e is Extract<OperatorEvent, { kind: 'repair.requested' }> => e.kind === 'repair.requested' && e.scope === 'node'
    );
    expect(updatedFlow.completedHandoffs.includes('start=>next')).toBeTruthy();
    expect(updatedFlow.historyHandoff['start=>next']).toEqual(['valid-output.md']);
    expect(repairNotice).toBeTruthy();
    expect(repairNotice?.role).toBe('start');
    expect(repairNotice?.nodeId).toBe('start');
  } finally {
    server.close();
    fs.rmSync(tmpBase, { recursive: true, force: true });
  }
}

it('requests repair when a handoff references a missing artifact and accepts the retry', async () => {
  await runTest();
});
