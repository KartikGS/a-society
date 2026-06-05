import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Writable } from 'node:stream';
import {
  FEEDBACK_CONSENT_STATUS,
  IMPROVEMENT_CHOICE_MODE,
} from '../../src/common/protocol-constants.js';
import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
import type {
  FlowRun,
  GatewayTurnResult,
  OperatorEvent,
  RuntimeMessageParam,
  TurnOptions,
} from '../../src/common/types.js';
import { deterministicFindingsFilePath } from '../../src/framework-services/backward-pass-orderer.js';
import { ImprovementOrchestrator } from '../../src/improvement/improvement.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import { SessionStore } from '../../src/orchestration/store.js';
import { LLMGateway } from '../../src/providers/llm.js';
import { seedTestModelSettings } from '../integration/settings-test-utils.js';

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

console.log('\nimprovement-streams');

await test('feedback repair status is emitted as an event, not role output stream text', async () => {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-improvement-streams-'));
  const settingsDir = path.join(workspaceRoot, '.a-society');
  seedTestModelSettings(settingsDir, { providerBaseUrl: 'http://127.0.0.1:1/v1' });
  const projectNamespace = 'demo-project';
  const flowId = 'repair-flow';
  const recordFolderPath = getFlowRecordDir(workspaceRoot, { projectNamespace, flowId });
  const feedbackArtifactPath = 'a-society/feedback/demo-project-flow-repair-flow.md';
  const feedbackArtifactFilePath = path.join(workspaceRoot, feedbackArtifactPath);

  fs.mkdirSync(path.join(workspaceRoot, 'a-society', 'runtime', 'contracts'), { recursive: true });
  fs.writeFileSync(
    path.join(workspaceRoot, 'a-society', 'runtime', 'contracts', 'feedback.md'),
    'Runtime feedback instructions'
  );
  fs.mkdirSync(recordFolderPath, { recursive: true });
  fs.writeFileSync(
    path.join(recordFolderPath, 'workflow.yaml'),
    'workflow:\n  name: Test Workflow\n  nodes:\n    - id: curator\n      role: curator\n  edges: []\n'
  );
  const findingsPath = deterministicFindingsFilePath(recordFolderPath, 'curator');
  fs.mkdirSync(path.dirname(findingsPath), { recursive: true });
  fs.writeFileSync(findingsPath, 'Curator findings');

  const flowRun: FlowRun = {
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath,
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    visitedNodeIds: [],
    completedHandoffs: [],
    receivingHandoff: {},
    historyHandoff: {},
    awaitingHandoff: [],
    status: 'awaiting_feedback_consent',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
    improvementPhase: {
      status: 'awaiting_feedback_consent',
      mode: IMPROVEMENT_CHOICE_MODE.GRAPH_BASED,
      completedRoles: ['curator'],
      runningRoles: [],
      awaitingHumanRoles: {},
      pendingHumanInputs: {},
      findingsProduced: {
        curator: path.relative(workspaceRoot, findingsPath),
      },
      feedbackArtifactPath,
      feedbackConsent: FEEDBACK_CONSENT_STATUS.PENDING,
    },
  };

  const flowRef = SessionStore.flowRef(flowRun);
  SessionStore.saveFlowRun(flowRun, flowRef, workspaceRoot);

  const invalidHandoffText = 'Feedback malformed. ```handoff\n - target_node_id: feedback\n  - artifact_path: broken.md\n```';
  const validHandoffText = `Feedback complete. \`\`\`handoff\ntype: backward-pass-complete\nartifact_path: ${feedbackArtifactPath}\n\`\`\``;
  const responses = [invalidHandoffText, validHandoffText];

  const originalExecuteTurn = LLMGateway.prototype.executeTurn;
  LLMGateway.prototype.executeTurn = async function(
    _systemPrompt: string,
    _messageHistory: RuntimeMessageParam[],
    options?: TurnOptions
  ): Promise<GatewayTurnResult> {
    const text = responses.shift();
    if (!text) throw new Error('No mock response available.');
    options?.outputStream?.write(text);
    options?.onAssistantTextDelta?.(text);
    if (text === validHandoffText) {
      fs.mkdirSync(path.dirname(feedbackArtifactFilePath), { recursive: true });
      fs.writeFileSync(feedbackArtifactFilePath, 'Generated feedback');
    }
    return { text };
  };

  const roleOutput: Record<string, string> = {};
  let finalFlowRun: FlowRun | null = null;
  const roleOutputFactory = (roleInstanceId: string) => new Writable({
    write(chunk, _encoding, callback) {
      roleOutput[roleInstanceId] = (roleOutput[roleInstanceId] ?? '') + chunk.toString();
      callback();
    }
  });
  const repairEvents: OperatorEvent[] = [];
  const renderer = {
    emit(event: OperatorEvent) {
      if (event.kind === 'repair.requested') repairEvents.push(event);
    },
    requestSent() {},
    receivingResponse() {},
    responseEnd() {},
    sendError() {},
  };

  try {
    await new ImprovementOrchestrator().runFeedback(
      flowRun,
      renderer,
      roleOutputFactory
    );
    finalFlowRun = SessionStore.loadFlowRun(flowRef, workspaceRoot);
  } finally {
    LLMGateway.prototype.executeTurn = originalExecuteTurn;
    fs.rmSync(workspaceRoot, { recursive: true, force: true });
  }

  assert.ok(repairEvents.some(
    event => event.kind === 'repair.requested' &&
      event.scope === 'improvement' &&
      event.role === 'a-society-feedback'
  ));
  assert.ok(roleOutput['a-society-feedback']?.includes('Feedback malformed.'));
  assert.ok(roleOutput['a-society-feedback']?.includes('Feedback complete.'));
  assert.ok(!roleOutput['a-society-feedback']?.includes('[improvement] a-society-feedback emitted an invalid handoff block'));
  assert.deepStrictEqual(finalFlowRun?.improvementPhase?.completedRoles, ['curator', 'a-society-feedback']);
  assert.deepStrictEqual(finalFlowRun?.improvementPhase?.findingsProduced, {
    curator: path.relative(workspaceRoot, findingsPath),
  });
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
