import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SessionStore } from '../../src/orchestration/store.js';
import { getOperatorFeedRoleKey, isTransientOperatorEvent, projectMessageToFeedItem } from '../../src/server/role-feed.js';
import type { FeedItem, FlowRun, OperatorEvent, RoleSession } from '../../src/common/types.js';

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

test('role feed persists FeedItem entries separately from role transcript history', () => {
  const roleFeed: FeedItem[] = [
    { id: 'owner_0', type: 'assistant', label: 'Assistant', text: 'Visible assistant text.' },
    { id: 'owner_1', type: 'user', label: 'You', text: 'Visible operator reply.' },
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

test('saveRoleFeed and loadRoleFeed round-trip FeedItem arrays', () => {
  const items: FeedItem[] = [
    { id: 'curator_1_0', type: 'assistant', label: 'Assistant', text: 'hello' },
    { id: 'curator_1_1', type: 'user', label: 'You', text: 'user reply' },
  ];
  SessionStore.saveRoleFeed(items, ref, 'curator_1', tmpDir);
  assert.deepStrictEqual(SessionStore.loadRoleFeed(ref, 'curator_1', tmpDir), items);
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

test('projectMessageToFeedItem produces the expected FeedItem shape for output_text', () => {
  const item = projectMessageToFeedItem(
    { type: 'output_text', role: 'Owner', text: 'hi' },
    'owner_0'
  );
  assert.deepStrictEqual(item, { id: 'owner_0', type: 'assistant', label: 'Assistant', text: 'hi' });
});

test('projectMessageToFeedItem returns a tool FeedItem for activity.tool_call with role', () => {
  const item = projectMessageToFeedItem(
    {
      type: 'operator_event',
      event: { kind: 'activity.tool_call', role: 'Owner', toolName: 'write_file', path: 'a.md' },
    },
    'owner_3'
  );
  assert.deepStrictEqual(item, { id: 'owner_3', type: 'tool', label: 'Tool Call', text: 'write_file a.md' });
});

test('activity.tool_call is no longer in the transient set so it reaches historical persistence', () => {
  const event: OperatorEvent = { kind: 'activity.tool_call', role: 'Owner', toolName: 'read' };
  assert.strictEqual(isTransientOperatorEvent(event), false);
  assert.strictEqual(getOperatorFeedRoleKey({ type: 'operator_event', event }), 'owner');
});

test('projectMessageToFeedItem returns null for events that do not become feed items', () => {
  assert.strictEqual(
    projectMessageToFeedItem({ type: 'operator_event', event: { kind: 'flow.resumed', flowId: 'x', activeNodeCount: 1 } }, 'x'),
    null
  );
  assert.strictEqual(
    projectMessageToFeedItem({ type: 'error', message: 'boom' }, 'x'),
    null
  );
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
