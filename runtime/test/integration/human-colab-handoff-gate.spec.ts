import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import * as SessionStore from '../../src/orchestration/store.js';
import { setWorkspaceRoot } from '../../src/common/workspace.js';
import { runStoredFlowUntil } from './orchestrator-test-utils.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { expect, it } from 'vitest';
import { listenOnLocalhost, seedTestModelSettings } from './settings-test-utils.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import { AWAITING_HUMAN_REASON } from '../../shared/protocol-constants.js';
import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';

/**
 * A node flagged `human-colab: true` must not commit its forward handoff directly.
 * The runtime stages the emitted target(s), suspends the node awaiting operator
 * approval, and only commits once the operator approves.
 */
async function setupFixture(port: number) {
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'human-colab-gate-test-'));
  const workspaceRoot = tmpBase;
  setWorkspaceRoot(workspaceRoot);
  const projectNamespace = 'test-project';
  const testDir = path.join(workspaceRoot, projectNamespace);
  const testStateDir = path.join(tmpBase, '.a-society', 'state');
  const testSettingsDir = path.join(tmpBase, '.a-society');
  fs.mkdirSync(testDir);
  fs.mkdirSync(testStateDir, { recursive: true });
  seedTestModelSettings(testSettingsDir, { providerBaseUrl: `http://127.0.0.1:${port}/v1` });

  const flowId = 'human-colab-gate-flow';
  const recordPath = getFlowRecordDir({ projectNamespace, flowId });
  fs.mkdirSync(recordPath, { recursive: true });
  const projectADocsPath = path.join(testDir, 'a-docs');
  const rolesDir = path.join(projectADocsPath, 'roles');
  fs.mkdirSync(path.join(projectADocsPath, 'indexes'), { recursive: true });
  for (const role of ['start', 'end']) {
    fs.mkdirSync(path.join(rolesDir, role), { recursive: true });
    fs.writeFileSync(path.join(rolesDir, role, 'required-readings.yaml'), `role: ${role}\nrequired_readings:\n  - $A_SOCIETY_AGENTS\n`);
    fs.writeFileSync(path.join(rolesDir, role, 'main.md'), `${role} Role Doc`);
    fs.writeFileSync(path.join(rolesDir, role, 'ownership.yaml'), `role: ${role}\nsurfaces: []\n`);
  }
  fs.writeFileSync(path.join(projectADocsPath, 'agents.md'), 'Hello Agents');
  fs.writeFileSync(path.join(projectADocsPath, 'indexes', 'main.md'), `| \`$A_SOCIETY_AGENTS\` | \`a-docs/agents.md\` |\n`);

  fs.writeFileSync(path.join(recordPath, 'workflow.yaml'), `workflow:
  name: human-colab-flow
  nodes:
    - id: start
      role: 'start'
      human-colab: true
    - id: end
      role: 'end'
  edges:
    - from: start
      to: end
`);

  setWorkspaceRoot(workspaceRoot);
  SessionStore.init();
  SessionStore.saveFlowRun({
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordPath,
    runningNodes: ['start'],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    pendingHandoffApprovals: {},
    completedHandoffs: [],
    visitedNodeIds: [],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
  });

  return { tmpBase, workspaceRoot, projectNamespace, flowId };
}

it('gates a human-colab node forward handoff and commits it on approval', async () => {
  const server = http.createServer(() => {});
  const port = await listenOnLocalhost(server);
  const { tmpBase, workspaceRoot, projectNamespace, flowId } = await setupFixture(port);

  server.removeAllListeners('request');
  server.on('request', (_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    // 'start' emits a forward handoff to 'end' — which the human-colab gate must stage.
    fs.writeFileSync(path.join(workspaceRoot, 'start-output.md'), 'Start output artifact.');
    const handoffBlock = "```handoff\ntarget_node_id: 'end'\nartifact_path: 'start-output.md'\n```";
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Work done. ' + handoffBlock } }] })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  });

  const sink = new RecordingOperatorSink();
  const orchestrator = new FlowOrchestrator(sink);

  try {
    await runStoredFlowUntil(
      orchestrator, workspaceRoot, projectNamespace, flowId,
      () => SessionStore.loadFlowRun({ projectNamespace, flowId })
        ?.awaitingHumanNodes['start']?.reason === AWAITING_HUMAN_REASON.HANDOFF_APPROVAL
    );

    // Gated: handoff staged, not committed.
    const gated = SessionStore.loadFlowRun({ projectNamespace, flowId })!;
    expect(gated.awaitingHumanNodes['start']?.reason).toBe(AWAITING_HUMAN_REASON.HANDOFF_APPROVAL);
    expect(gated.pendingHandoffApprovals['start']).toEqual([
      { target_node_id: 'end', artifact_path: 'start-output.md' },
    ]);
    expect(gated.completedHandoffs).not.toContain('start=>end');
    expect(gated.visitedNodeIds).not.toContain('end');
    expect(sink.events.some(e => e.kind === 'human.awaiting_input' && e.reason === AWAITING_HUMAN_REASON.HANDOFF_APPROVAL)).toBe(true);

    // Approve: commit the staged handoff without re-running the role.
    const pending = gated.pendingHandoffApprovals['start'];
    await orchestrator.applyHandoffAndAdvance(gated, 'start', 'start', pending, { approved: true });

    const committed = SessionStore.loadFlowRun({ projectNamespace, flowId })!;
    expect(committed.completedHandoffs).toContain('start=>end');
    expect(committed.historyHandoff['start=>end']).toEqual(['start-output.md']);
    expect(committed.pendingHandoffApprovals['start']).toBeUndefined();
    expect(committed.awaitingHumanNodes['start']).toBeUndefined();
  } finally {
    server.close();
    fs.rmSync(tmpBase, { recursive: true, force: true });
  }
});
