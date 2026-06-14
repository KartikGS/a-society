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
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Test server catch-all." } }] })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  });

  const port = await listenOnLocalhost(server);

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'unified-routing-test-'));
  const workspaceRoot = tmpBase;
  const projectNamespace = 'test-project';
  const testDir = path.join(workspaceRoot, projectNamespace);
  const testStateDir = path.join(tmpBase, '.a-society', 'state');
  const testSettingsDir = path.join(tmpBase, '.a-society');
  fs.mkdirSync(testDir);
  fs.mkdirSync(testStateDir, { recursive: true });
  seedTestModelSettings(testSettingsDir, { providerBaseUrl: `http://127.0.0.1:${port}/v1` });

  const flowId = 'test-flow-id';
  const recordPath = getFlowRecordDir(workspaceRoot, { projectNamespace, flowId });
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
  fs.writeFileSync(path.join(rolesDir, 'start', 'ownership.yaml'), 'role: start\nsurfaces: []\n');
  fs.writeFileSync(path.join(rolesDir, 'next', 'ownership.yaml'), 'role: next\nsurfaces: []\n');
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

  const originalCwd = process.cwd();
  try {
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
      } else if (serverTurn === 3) {
        // 'next' node: block immediately so runStoredFlow can be terminated
        const content = "Ready for review. ```handoff\ntype: prompt-human\n```";
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        res.end();
      } else {
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Done." } }] })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        res.end();
      }
    });

    await runStoredFlowUntil(
      orchestrator, workspaceRoot, projectNamespace, flowId,
      () => !!SessionStore.loadFlowRun({ projectNamespace, flowId }, workspaceRoot)?.awaitingHumanNodes['next']
    );

    const updatedFlow = SessionStore.loadFlowRun({ projectNamespace, flowId }, workspaceRoot)!;
    const session = SessionStore.loadRoleSession('start');
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

    const hasHandoffNotice = sink.events.some(e => e.kind === 'handoff.applied');
    const hasRoleActiveNotice = sink.events.some(e => e.kind === 'role.active');
    const repairNotice = sink.events.find(
      (e): e is Extract<OperatorEvent, { kind: 'repair.requested' }> => e.kind === 'repair.requested'
    );
    const hasRepairNotice = repairNotice !== undefined;

    expect(updatedFlow.completedHandoffs.includes('start=>next')).toBeTruthy();
    expect(updatedFlow.historyHandoff['start=>next']).toEqual(['mock.md']);
    expect(repairInjected).toBeTruthy();
    expect(canonicalGuidanceInjected).toBeTruthy();
    expect(hasHandoffNotice).toBeTruthy();
    expect(hasRoleActiveNotice).toBeTruthy();
    expect(hasRepairNotice).toBeTruthy();
    expect(repairNotice?.role).toBe('start');
    expect(repairNotice?.nodeId).toBe('start');
  } finally {
    process.chdir(originalCwd);
    server.close();
    fs.rmSync(tmpBase, { recursive: true, force: true });
  }
}

it('repairs malformed handoffs while preserving canonical workflow guidance', async () => {
  await runTest();
});
