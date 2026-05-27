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

await test('feedback repair status is written to status stream, not role output stream', async () => {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-improvement-streams-'));
  const previousSettingsDir = process.env.A_SOCIETY_SETTINGS_DIR;
  const settingsDir = path.join(workspaceRoot, '.settings');
  process.env.A_SOCIETY_SETTINGS_DIR = settingsDir;
  seedTestModelSettings(settingsDir, { providerBaseUrl: 'http://127.0.0.1:1/v1' });
  const projectNamespace = 'demo-project';
  const flowId = 'repair-flow';
  const projectRoot = path.join(workspaceRoot, projectNamespace);
  const recordFolderPath = path.join(projectRoot, 'a-docs', 'records', flowId);
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
    'workflow:\n  name: Test Workflow\n  nodes:\n    - id: curator\n      role: Curator\n  edges: []\n'
  );
  const findingsPath = deterministicFindingsFilePath(recordFolderPath, 'Curator');
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
    completedNodes: [],
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
      currentStep: 1,
      completedRoles: ['Curator'],
      runningRoles: [],
      awaitingHumanRoles: {},
      pendingHumanInputs: {},
      findingsProduced: {
        Curator: path.relative(workspaceRoot, findingsPath),
      },
      activeNodeIds: [],
      completedNodeIds: ['curator-meta-analysis'],
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

  let statusOutput = '';
  const roleOutput: Record<string, string> = {};
  const statusStream = new Writable({
    write(chunk, _encoding, callback) {
      statusOutput += chunk.toString();
      callback();
    }
  });
  const roleOutputFactory = (roleName: string) => new Writable({
    write(chunk, _encoding, callback) {
      roleOutput[roleName] = (roleOutput[roleName] ?? '') + chunk.toString();
      callback();
    }
  });
  const renderer = {
    emit(_event: OperatorEvent) {},
    requestSent() {},
    receivingResponse() {},
    responseEnd() {},
    sendError() {},
  };

  try {
    await new ImprovementOrchestrator().runFeedback(
      flowRun,
      statusStream,
      renderer,
      roleOutputFactory
    );
  } finally {
    LLMGateway.prototype.executeTurn = originalExecuteTurn;
    if (previousSettingsDir === undefined) {
      delete process.env.A_SOCIETY_SETTINGS_DIR;
    } else {
      process.env.A_SOCIETY_SETTINGS_DIR = previousSettingsDir;
    }
    fs.rmSync(workspaceRoot, { recursive: true, force: true });
  }

  assert.ok(statusOutput.includes('[improvement] A-Society Feedback emitted an invalid handoff block during backward pass feedback. Requesting repair.'));
  assert.ok(roleOutput['A-Society Feedback']?.includes('Feedback malformed.'));
  assert.ok(roleOutput['A-Society Feedback']?.includes('Feedback complete.'));
  assert.ok(!roleOutput['A-Society Feedback']?.includes('[improvement] A-Society Feedback emitted an invalid handoff block'));
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
