import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import * as SessionStore from '../../src/orchestration/store.js';
import { RecordingOperatorSink } from '../recording-operator-sink.js';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { PassThrough } from 'node:stream';
import { expect, it } from 'vitest';
import { listenOnLocalhost, seedTestModelSettings } from './settings-test-utils.js';
import { setWorkspaceRoot } from '../../src/common/workspace.js';
import { scaffoldFromManifestFile } from '../../src/framework-services/scaffolding-system.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';

import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frameworkRoot = path.resolve(__dirname, '../../..');

/**
 * Correction 4 verification: a real forward-pass-closed signal drives through
 * the orchestrator, emits the approved operator notice, and persists an
 * awaiting_improvement_choice state.
 *
 * The mock server returns a forward-pass-closed handoff on turn 1. The test
 * asserts the operator stream contains the notice and flow.json pauses before
 * the improvement phase runs.
 */
async function runTest() {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "placeholder" } }] })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  });

  const port = await listenOnLocalhost(server);

  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'forward-pass-closure-test-'));
  const workspaceRoot = tmpBase;
  setWorkspaceRoot(workspaceRoot);
  const projectNamespace = 'test-project';
  const testDir = path.join(workspaceRoot, projectNamespace);
  const testStateDir = path.join(tmpBase, '.a-society', 'state');
  const testSettingsDir = path.join(tmpBase, '.a-society');
  fs.mkdirSync(testDir);
  fs.mkdirSync(testStateDir, { recursive: true });
  const aSocietyRoot = path.join(workspaceRoot, 'a-society');
  fs.symlinkSync(frameworkRoot, aSocietyRoot, 'dir');
  const scaffoldResult = scaffoldFromManifestFile(
    testDir,
    projectNamespace,
    aSocietyRoot,
    path.join(aSocietyRoot, 'runtime', 'contracts', 'a-docs-manifest.yaml')
  );
  if (scaffoldResult.failed.length > 0) {
    throw new Error(`Failed to scaffold fixture a-docs: ${scaffoldResult.failed.map((item) => `${item.path}: ${item.reason}`).join('; ')}`);
  }
  seedTestModelSettings(testSettingsDir, { providerBaseUrl: `http://127.0.0.1:${port}/v1` });

  const flowId = 'test-fpc-flow-id';
  const recordPath = getFlowRecordDir({ projectNamespace, flowId });
  fs.mkdirSync(recordPath, { recursive: true });
  const projectADocsPath = path.join(testDir, 'a-docs');
  const rolesDir = path.join(projectADocsPath, 'roles');
  fs.mkdirSync(rolesDir, { recursive: true });
  fs.mkdirSync(path.join(projectADocsPath, 'indexes'), { recursive: true });
  fs.mkdirSync(path.join(projectADocsPath, 'workflow'), { recursive: true });
  fs.mkdirSync(path.join(projectADocsPath, 'improvement'), { recursive: true });
  fs.mkdirSync(path.join(rolesDir, 'owner'), { recursive: true });
  fs.writeFileSync(path.join(rolesDir, 'owner', 'required-readings.yaml'), 'role: owner\nrequired_readings:\n  - $A_SOCIETY_AGENTS\n  - $TEST_PROJECT_OWNER_ROLE\n');
  fs.writeFileSync(path.join(projectADocsPath, 'agents.md'), "Hello Agents");
  fs.writeFileSync(path.join(projectADocsPath, 'indexes', 'main.md'),
    `| \`$A_SOCIETY_AGENTS\` | \`a-docs/agents.md\` |\n` +
    `| \`$TEST_PROJECT_OWNER_ROLE\` | \`a-docs/roles/owner/main.md\` |\n`
  );
  fs.writeFileSync(path.join(projectADocsPath, 'a-society-version.md'), '---\na_society_version: "0.2.0"\n---\n# A-Society Version Record\n');
  const workflowGraph = `workflow:
  name: test-flow
  nodes:
    - id: start
      role: 'owner'
  edges: []
`;
  fs.writeFileSync(path.join(rolesDir, 'owner', 'main.md'), "Owner Role Doc");
  fs.writeFileSync(path.join(rolesDir, 'owner', 'ownership.yaml'), 'role: owner\nsurfaces: []\n');
  fs.writeFileSync(path.join(projectADocsPath, 'workflow', 'main.yaml'), workflowGraph);
  fs.writeFileSync(path.join(projectADocsPath, 'improvement', 'meta-analysis.md'), 'Meta-analysis instructions');
  fs.writeFileSync(path.join(projectADocsPath, 'improvement', 'feedback.md'), 'Feedback instructions');
  fs.writeFileSync(path.join(recordPath, 'workflow.yaml'), workflowGraph);

  // The closure signal no longer carries artifact metadata; this file simply mirrors
  // the kind of record content a real closure node may still produce.
  const closureArtifactPath = path.join(recordPath, 'closure-artifact.md');
  fs.writeFileSync(closureArtifactPath, "Forward pass closure artifact.");

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
    stateVersion: CURRENT_FLOW_STATE_VERSION
  });

  const sink = new RecordingOperatorSink();
  const orchestrator = new FlowOrchestrator(sink);

  // Role output stream captures assistant text.
  const outputStream = new PassThrough();
  const outputChunks: string[] = [];
  outputStream.on('data', (chunk: Buffer) => {
    outputChunks.push(chunk.toString());
  });

  server.removeAllListeners('request');
  server.on('request', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    // Turn 1: return a forward-pass-closed handoff block
    const handoffBlock =
      "```handoff\n" +
      "type: forward-pass-closed\n" +
      "```";
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Forward pass done. " + handoffBlock } }] })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  });

  try {
    await orchestrator.runStoredFlow(projectNamespace, flowId, () => outputStream);

    const assistantOut = outputChunks.join('');

    const hasForwardPassNotice = sink.events.some(
      e => e.kind === 'flow.forward_pass_closed'
    );

    expect(hasForwardPassNotice).toBeTruthy();

    expect(assistantOut.includes('Enter 1, 2, or 3:')).toBeFalsy();

    const finalFlow = SessionStore.loadFlowRun({ projectNamespace, flowId })!;
    expect(finalFlow.status).toBe('awaiting_improvement_choice');
    expect(finalFlow.improvementPhase?.status).toBe('awaiting_choice');
    expect(finalFlow.improvementPhase && !('forwardPassClosure' in finalFlow.improvementPhase)).toBeTruthy();
  } finally {
    server.close();
    outputStream.destroy();
    fs.rmSync(tmpBase, { recursive: true, force: true });
  }
}

it('pauses for improvement choice after a forward-pass-closed signal', async () => {
  await runTest();
});
