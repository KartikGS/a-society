import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { compactRoleSession, shouldAutoCompact } from '../../src/orchestration/compaction.js';
import { LLMGateway } from '../../src/providers/llm.js';
import type { FlowRun, GatewayTurnResult, RoleSession, RuntimeMessageParam } from '../../src/common/types.js';
import { seedTestModelSettings } from '../integration/settings-test-utils.js';

import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
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

console.log('\ncontext-compaction');

await test('shouldAutoCompact uses 80 percent of the raw context window', () => {
  assert.strictEqual(shouldAutoCompact(79, 100), false);
  assert.strictEqual(shouldAutoCompact(80, 100), true);
  assert.strictEqual(shouldAutoCompact(81, 100), true);
  assert.strictEqual(shouldAutoCompact(undefined, 100), false);
  assert.strictEqual(shouldAutoCompact(100, 0), false);
});

await test('compactRoleSession archives raw history and replaces active history with a restoration message', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-compaction-'));
  const settingsDir = path.join(tmpDir, '.settings');
  process.env.A_SOCIETY_SETTINGS_DIR = settingsDir;
  seedTestModelSettings(settingsDir, { providerBaseUrl: 'http://127.0.0.1:1/v1' });

  const originalExecuteTurn = LLMGateway.prototype.executeTurn;
  LLMGateway.prototype.executeTurn = async function(
    _systemPrompt: string,
    messages: RuntimeMessageParam[]
  ): Promise<GatewayTurnResult> {
    assert.strictEqual(messages.length, 1);
    assert.strictEqual(messages[0].role, 'user');
    assert.ok(messages[0].content.includes('Summarize the current workflow node conversation'));
    assert.ok(messages[0].content.includes('Runtime repair prompt'));
    return { text: 'Summary of current-node decisions and unresolved repair.' };
  };

  const history: RuntimeMessageParam[] = [
    { role: 'user', content: 'Node entry' },
    { role: 'assistant', content: 'I found a malformed handoff.' },
    { role: 'user', content: 'Runtime repair prompt' }
  ];

  const session: RoleSession = {
    roleName: 'owner',
    logicalSessionId: 'flow__owner',
    transcriptHistory: [...history],
    currentNodeContext: {
      nodeId: 'owner-review',
      exchanges: [...history]
    },
    isActive: true,
    currentNodeId: 'owner-review'
  };

  const flowRun: FlowRun = {
    flowId: 'flow',
    workspaceRoot: tmpDir,
    projectNamespace: 'project',
    recordFolderPath: path.join(tmpDir, '.a-society', 'state', 'project', 'flow', 'record'),
    runningNodes: ['owner-review'],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    completedNodes: ['owner-intake'],
    completedHandoffs: ['owner-intake=>owner-review'],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION
  };

  try {
    const result = await compactRoleSession({
      session,
      flowRun,
      roleName: 'owner',
      trigger: 'manual'
    });

    assert.strictEqual(result.compacted, true);
    assert.strictEqual(session.transcriptHistory.length, 1);
    assert.strictEqual(session.currentNodeContext?.exchanges.length, 1);
    assert.strictEqual(session.compactionArchives?.length, 1);
    assert.deepStrictEqual(session.compactionArchives?.[0].archivedTranscriptHistory, history);
    assert.strictEqual(session.compactionArchives?.[0].replacementMessage, session.transcriptHistory[0]);

    const replacement = session.transcriptHistory[0] as RuntimeMessageParam;
    assert.strictEqual(replacement.role, 'user');
    assert.ok(replacement.content.includes('Runtime Context Restoration'));
    assert.ok(replacement.content.includes('Summary of current-node decisions and unresolved repair.'));
    assert.ok(replacement.content.includes('owner-intake=>owner-review'));
    assert.ok(replacement.content.includes('Runtime repair prompt'));
    assert.strictEqual(session.latestContextUsage, 0);
  } finally {
    LLMGateway.prototype.executeTurn = originalExecuteTurn;
    fs.rmSync(tmpDir, { recursive: true, force: true });
    delete process.env.A_SOCIETY_SETTINGS_DIR;
  }
});

await test('compactRoleSession reports no-op when there is no current node', async () => {
  const session: RoleSession = {
    roleName: 'owner',
    logicalSessionId: 'flow__owner',
    transcriptHistory: [{ role: 'user', content: 'No node yet' }],
    isActive: false
  };
  const flowRun: FlowRun = {
    flowId: 'flow',
    workspaceRoot: '.',
    projectNamespace: 'project',
    recordFolderPath: '.a-society/state/project/flow/record',
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    completedNodes: [],
    completedHandoffs: [],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION
  };

  const result = await compactRoleSession({
    session,
    flowRun,
    roleName: 'owner',
    trigger: 'manual'
  });

  assert.strictEqual(result.compacted, false);
  assert.match(result.reason ?? '', /current node/i);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
