import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SessionStore } from '../src/store.js';
import type { FlowRun, OperatorFeedMessage, RoleSession } from '../src/types.js';

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

test('operator feed persists separately from role transcript history', () => {
  const feed: OperatorFeedMessage[] = [
    { type: 'operator_event', event: { kind: 'role.active', nodeId: 'owner-intake', role: 'Owner', artifactCount: 0 } },
    { type: 'output_text', text: 'Visible assistant text.' },
    { type: 'input_text', role: 'Owner', text: 'Visible operator reply.' },
  ];
  const roleSession: RoleSession = {
    roleName: 'Owner',
    logicalSessionId: `${flowId}__owner`,
    transcriptHistory: [{ role: 'user', content: 'Model-only node packet.' }],
    isActive: true,
    currentNodeId: 'owner-intake',
  };

  SessionStore.saveOperatorFeed(feed, ref, tmpDir);
  SessionStore.saveRoleSession(roleSession, ref, tmpDir);

  assert.deepStrictEqual(SessionStore.loadOperatorFeed(ref, tmpDir), feed);
  assert.deepStrictEqual(
    SessionStore.loadRoleSession(roleSession.logicalSessionId, ref, tmpDir)?.transcriptHistory,
    roleSession.transcriptHistory
  );
});

test('operator feed append retains the configured message limit', () => {
  SessionStore.saveOperatorFeed([], ref, tmpDir);

  SessionStore.appendOperatorFeedMessage({ type: 'output_text', text: 'one' }, ref, tmpDir, 2);
  SessionStore.appendOperatorFeedMessage({ type: 'output_text', text: 'two' }, ref, tmpDir, 2);
  SessionStore.appendOperatorFeedMessage({ type: 'output_text', text: 'three' }, ref, tmpDir, 2);

  assert.deepStrictEqual(SessionStore.loadOperatorFeed(ref, tmpDir), [
    { type: 'output_text', text: 'two' },
    { type: 'output_text', text: 'three' },
  ]);
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
