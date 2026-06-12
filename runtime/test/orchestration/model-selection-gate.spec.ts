import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';
import { AWAITING_HUMAN_REASON } from '../../src/common/protocol-constants.js';
import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import { saveRoleModelSelection } from '../../src/orchestration/role-model.js';
import { getFlowDir, getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import { SessionStore } from '../../src/orchestration/store.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import { listenOnLocalhost, seedTestMultiModelSettings } from '../integration/settings-test-utils.js';

async function waitUntil(predicate: () => boolean, timeoutMs = 5_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error('Timed out waiting for orchestrator state.');
    await new Promise<void>((resolve) => setTimeout(resolve, 5));
  }
}

function scaffoldProjectDocs(workspaceRoot: string, projectNamespace: string, roles: string[]): void {
  const projectADocsPath = path.join(workspaceRoot, projectNamespace, 'a-docs');
  const rolesDir = path.join(projectADocsPath, 'roles');
  fs.mkdirSync(path.join(projectADocsPath, 'indexes'), { recursive: true });
  fs.writeFileSync(path.join(projectADocsPath, 'agents.md'), 'Hello Agents');

  const indexRows = [`| \`$A_SOCIETY_AGENTS\` | \`${projectNamespace}/a-docs/agents.md\` |`];
  for (const role of roles) {
    const roleVar = `$TEST_${role.toUpperCase()}_ROLE`;
    fs.mkdirSync(path.join(rolesDir, role), { recursive: true });
    fs.writeFileSync(
      path.join(rolesDir, role, 'required-readings.yaml'),
      `role: ${role}\nrequired_readings:\n  - $A_SOCIETY_AGENTS\n  - ${roleVar}\n`
    );
    fs.writeFileSync(path.join(rolesDir, role, 'main.md'), `${role} role doc`);
    fs.writeFileSync(path.join(rolesDir, role, 'ownership.yaml'), `role: ${role}\nsurfaces: []\n`);
    indexRows.push(`| \`${roleVar}\` | \`${projectNamespace}/a-docs/roles/${role}/main.md\` |`);
  }
  fs.writeFileSync(path.join(projectADocsPath, 'indexes', 'main.md'), indexRows.join('\n') + '\n');
}

function writeWorkflow(recordPath: string): void {
  fs.writeFileSync(path.join(recordPath, 'workflow.yaml'), `workflow:
  name: model-selection-flow
  nodes:
    - id: start
      role: 'start'
    - id: next
      role: 'next'
  edges:
    - from: start
      to: next
`);
}

it('suspends first role activation for model selection and resumes each role on its own model', async () => {
  const requests: Array<{ model: string }> = [];
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as { model: string };
      requests.push({ model: body.model });
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });

      if (requests.length === 1) {
        fs.writeFileSync(path.join(workspaceRoot, 'start-output.md'), 'Start output artifact.');
        const handoffBlock = "```handoff\ntarget_node_id: 'next'\nartifact_path: 'start-output.md'\n```";
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Done. ' + handoffBlock } }] })}\n\n`);
      } else {
        const content = 'Need input. ```handoff\ntype: prompt-human\n```';
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    });
  });
  const port = await listenOnLocalhost(server);

  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'model-selection-gate-'));
  const projectNamespace = 'test-project';
  const flowId = 'model-selection-flow';
  const flowRef = { projectNamespace, flowId };

  seedTestMultiModelSettings(path.join(workspaceRoot, '.a-society'), [
    { id: 'model-a', providerBaseUrl: `http://127.0.0.1:${port}/v1`, active: true },
    { id: 'model-b', providerBaseUrl: `http://127.0.0.1:${port}/v1` },
  ]);
  scaffoldProjectDocs(workspaceRoot, projectNamespace, ['start', 'next']);

  const recordPath = getFlowRecordDir(workspaceRoot, flowRef);
  fs.mkdirSync(recordPath, { recursive: true });
  writeWorkflow(recordPath);

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
  const loadFlow = () => SessionStore.loadFlowRun(flowRef, workspaceRoot)!;

  const runPromise = orchestrator.runStoredFlow(workspaceRoot, projectNamespace, flowId);
  try {
    await waitUntil(() => loadFlow().awaitingHumanNodes['start']?.reason === AWAITING_HUMAN_REASON.MODEL_SELECTION);

    expect(requests).toHaveLength(0);
    expect(loadFlow().awaitingHumanNodes['start']).toEqual({
      role: 'start',
      reason: AWAITING_HUMAN_REASON.MODEL_SELECTION,
    });
    expect(sink.events.filter((e) => e.kind === 'role.active' && e.nodeId === 'start')).toHaveLength(1);
    expect(sink.events).toContainEqual({
      kind: 'human.awaiting_input',
      nodeId: 'start',
      role: 'start',
      reason: AWAITING_HUMAN_REASON.MODEL_SELECTION,
    });

    saveRoleModelSelection(workspaceRoot, flowRef, 'start', {
      modelConfigId: 'model-b',
      displayName: 'model-b',
      modelId: 'model-b',
      selectedAt: new Date().toISOString(),
    });
    orchestrator.wake();

    await waitUntil(() => loadFlow().awaitingHumanNodes['next']?.reason === AWAITING_HUMAN_REASON.MODEL_SELECTION);

    expect(requests.map((request) => request.model)).toEqual(['model-b']);
    expect(loadFlow().awaitingHumanNodes['start']).toBeUndefined();
    expect(fs.existsSync(path.join(getFlowDir(workspaceRoot, flowRef), 'roles', 'start', 'model.json'))).toBe(true);
    expect(sink.events.filter((e) => e.kind === 'role.active' && e.nodeId === 'next')).toHaveLength(1);

    saveRoleModelSelection(workspaceRoot, flowRef, 'next', {
      modelConfigId: 'model-a',
      displayName: 'model-a',
      modelId: 'model-a',
      selectedAt: new Date().toISOString(),
    });
    orchestrator.wake();

    await waitUntil(() => loadFlow().awaitingHumanNodes['next']?.reason === AWAITING_HUMAN_REASON.PROMPT_HUMAN);

    expect(requests.map((request) => request.model)).toEqual(['model-b', 'model-a']);
  } finally {
    await SessionStore.updateFlowRun((flow) => {
      flow.status = 'completed';
    }, flowRef, workspaceRoot);
    orchestrator.wake();
    await runPromise;
    server.close();
    fs.rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

it('claims a persisted model-selection wait on cold resume once a selection exists', async () => {
  const requests: Array<{ model: string }> = [];
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as { model: string };
      requests.push({ model: body.model });
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      const content = 'Need input. ```handoff\ntype: prompt-human\n```';
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    });
  });
  const port = await listenOnLocalhost(server);

  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'model-selection-resume-'));
  const projectNamespace = 'test-project';
  const flowId = 'model-selection-resume-flow';
  const flowRef = { projectNamespace, flowId };

  seedTestMultiModelSettings(path.join(workspaceRoot, '.a-society'), [
    { id: 'model-a', providerBaseUrl: `http://127.0.0.1:${port}/v1`, active: true },
    { id: 'model-b', providerBaseUrl: `http://127.0.0.1:${port}/v1` },
  ]);

  const recordPath = getFlowRecordDir(workspaceRoot, flowRef);
  fs.mkdirSync(recordPath, { recursive: true });
  writeWorkflow(recordPath);

  SessionStore.init(workspaceRoot);
  // Persisted shape left behind by a suspension: node already visited and
  // entered (session exists), no running claim, awaiting model selection.
  SessionStore.saveFlowRun({
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath: recordPath,
    runningNodes: [],
    awaitingHumanNodes: { start: { role: 'start', reason: AWAITING_HUMAN_REASON.MODEL_SELECTION } },
    pendingHumanInputs: {},
    completedHandoffs: [],
    visitedNodeIds: ['start'],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION
  });
  SessionStore.saveRoleSession({
    roleName: 'start',
    logicalSessionId: `${flowId}__start`,
    transcriptHistory: [{ role: 'user', content: 'Node entry message.' }],
    isActive: true,
    currentNodeId: 'start',
    systemPrompt: 'Test system prompt.',
  }, flowRef, workspaceRoot);
  saveRoleModelSelection(workspaceRoot, flowRef, 'start', {
    modelConfigId: 'model-b',
    displayName: 'model-b',
    modelId: 'model-b',
    selectedAt: new Date().toISOString(),
  });

  const sink = new RecordingOperatorSink();
  const orchestrator = new FlowOrchestrator(sink);
  const loadFlow = () => SessionStore.loadFlowRun(flowRef, workspaceRoot)!;

  const runPromise = orchestrator.runStoredFlow(workspaceRoot, projectNamespace, flowId);
  try {
    await waitUntil(() => loadFlow().awaitingHumanNodes['start']?.reason === AWAITING_HUMAN_REASON.PROMPT_HUMAN);

    expect(requests.map((request) => request.model)).toEqual(['model-b']);
  } finally {
    await SessionStore.updateFlowRun((flow) => {
      flow.status = 'completed';
    }, flowRef, workspaceRoot);
    orchestrator.wake();
    await runPromise;
    server.close();
    fs.rmSync(workspaceRoot, { recursive: true, force: true });
  }
});
