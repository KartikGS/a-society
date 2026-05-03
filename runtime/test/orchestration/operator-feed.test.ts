import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SessionStore } from '../../src/orchestration/store.js';
import { getOperatorFeedRoleKey, isTransientOperatorEvent } from '../../src/server/role-feed.js';
import type { FlowRun, OperatorEvent, OperatorFeedMessage, RoleSession } from '../../src/common/types.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
    failed++;
  }
}

console.log('\noperator-feed');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-operator-feed-'));
const projectNamespace = 'test-project';
const flowId = 'test-flow';
const ref = { projectNamespace, flowId };
const recordFolderPath = path.join(tmpDir, projectNamespace, 'a-docs', 'records', flowId);
fs.mkdirSync(recordFolderPath, { recursive: true });

const flowRun: FlowRun = {
  flowId,
  workspaceRoot: tmpDir,
  projectNamespace,
  recordFolderPath,
  readyNodes: [],
  runningNodes: [],
  awaitingHumanNodes: {},
  completedNodes: [],
  visitedNodeIds: [],
  completedEdgeArtifacts: {},
  pendingNodeArtifacts: {},
  status: 'running',
  stateVersion: '7',
};

SessionStore.saveFlowRun(flowRun, ref, tmpDir);

test('role feed persists separately from role transcript history', () => {
  const roleFeed: OperatorFeedMessage[] = [
    { type: 'output_text', role: 'Owner', text: 'Visible assistant text.' },
    { type: 'input_text', role: 'Owner', text: 'Visible operator reply.' },
  ];
  const roleSession: RoleSession = {
    roleName: 'Owner',
    logicalSessionId: `${flowId}__owner`,
    transcriptHistory: [{ role: 'user', content: 'Model-only node packet.' }],
    isActive: true,
    currentNodeId: 'owner-intake',
  };

  SessionStore.saveRoleFeed(roleFeed, ref, 'owner', tmpDir);
  SessionStore.saveRoleSession(roleSession, ref, tmpDir);

  assert.deepStrictEqual(SessionStore.loadRoleFeed(ref, 'owner', tmpDir), roleFeed);
  assert.deepStrictEqual(
    SessionStore.loadRoleSession('owner', ref, tmpDir)?.transcriptHistory,
    roleSession.transcriptHistory
  );
});

test('loadAllRoleFeeds returns all role feeds keyed by role', () => {
  const allFeeds = SessionStore.loadAllRoleFeeds(ref, tmpDir);
  assert.ok(allFeeds.has('owner'), 'should have owner feed');
  assert.strictEqual(allFeeds.get('owner')?.length, 2);
});

test('saveRoleFeed and loadRoleFeed round-trip correctly', () => {
  const messages: OperatorFeedMessage[] = [
    { type: 'output_text', role: 'Curator_1', text: 'hello' },
    { type: 'input_text', role: 'Curator_1', text: 'user reply' },
  ];
  SessionStore.saveRoleFeed(messages, ref, 'curator_1', tmpDir);
  assert.deepStrictEqual(SessionStore.loadRoleFeed(ref, 'curator_1', tmpDir), messages);
});

test('repair requested events are role-feed historical events when role is present', () => {
  const event: OperatorEvent = {
    kind: 'repair.requested',
    scope: 'node',
    code: 'missing_block',
    summary: 'Malformed handoff block',
    role: 'Owner',
    nodeId: 'owner-intake',
  };

  assert.strictEqual(isTransientOperatorEvent(event), false);
  assert.strictEqual(getOperatorFeedRoleKey({ type: 'operator_event', event }), 'owner');
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
