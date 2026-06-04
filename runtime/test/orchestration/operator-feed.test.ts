import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SessionStore } from '../../src/orchestration/store.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import { getOperatorFeedRoleKey, isTransientOperatorEvent, projectMessageToFeedItem } from '../../src/server/role-feed.js';
import { rememberMessage } from '../../src/server/runtime-session/feed.js';
import { configureSettingsStore, updateFeedSettings } from '../../src/settings/settings-store.js';
import type { FeedItem, FlowRun, OperatorEvent, RoleSession } from '../../src/common/types.js';

import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
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
const recordFolderPath = getFlowRecordDir(tmpDir, { projectNamespace, flowId });
fs.mkdirSync(recordFolderPath, { recursive: true });

const flowRun: FlowRun = {
  flowId,
  workspaceRoot: tmpDir,
  projectNamespace,
  recordFolderPath,
  runningNodes: [],
  awaitingHumanNodes: {},
  pendingHumanInputs: {},
  visitedNodeIds: [],
  completedHandoffs: [],
    receivingHandoff: {}, historyHandoff: {}, awaitingHandoff: [],
  status: 'running',
  stateVersion: CURRENT_FLOW_STATE_VERSION,
};

SessionStore.saveFlowRun(flowRun, ref, tmpDir);

test('role feed persists FeedItem entries separately from role transcript history', () => {
  const roleFeed: FeedItem[] = [
    { id: 'owner_0', type: 'assistant', label: 'Assistant', text: 'Visible assistant text.' },
    { id: 'owner_1', type: 'user', label: 'You', text: 'Visible operator reply.' },
  ];
  const roleSession: RoleSession = {
    roleName: 'owner',
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
    role: 'owner',
    nodeId: 'owner-intake',
  };

  assert.strictEqual(isTransientOperatorEvent(event), false);
  assert.strictEqual(getOperatorFeedRoleKey({ type: 'operator_event', event }), 'owner');
});

test('projectMessageToFeedItem produces the expected FeedItem shape for output_text', () => {
  const item = projectMessageToFeedItem(
    { type: 'output_text', role: 'owner', text: 'hi' },
    'owner_0'
  );
  assert.deepStrictEqual(item, {
    id: 'owner_0',
    type: 'assistant',
    label: 'Assistant',
    text: 'hi',
    segments: [{ type: 'text', text: 'hi' }],
  });
});

test('projectMessageToFeedItem returns a tool FeedItem for activity.tool_call with role', () => {
  const item = projectMessageToFeedItem(
    {
      type: 'operator_event',
      event: { kind: 'activity.tool_call', role: 'owner', toolName: 'write_file', path: 'a.md' },
    },
    'owner_3'
  );
  assert.deepStrictEqual(item, { id: 'owner_3', type: 'tool', label: 'Tool Call', text: 'write_file a.md' });
});

test('activity.tool_call is no longer in the transient set so it reaches historical persistence', () => {
  const event: OperatorEvent = { kind: 'activity.tool_call', role: 'owner', toolName: 'read' };
  assert.strictEqual(isTransientOperatorEvent(event), false);
  assert.strictEqual(getOperatorFeedRoleKey({ type: 'operator_event', event }), 'owner');
});

test('compaction started becomes a pending role feed item', () => {
  const event: OperatorEvent = { kind: 'session.compaction_started', role: 'owner', trigger: 'manual' };

  assert.strictEqual(isTransientOperatorEvent(event), false);
  assert.strictEqual(getOperatorFeedRoleKey({ type: 'operator_event', event }), 'owner');
  assert.deepStrictEqual(projectMessageToFeedItem({ type: 'operator_event', event }, 'owner_4'), {
    id: 'owner_4',
    type: 'tool',
    label: 'Compaction',
    text: 'Compacting context (manual).',
  });
});

test('compaction completion resolves the persisted pending feed item', () => {
  const activeSession = {
    flowRef: ref,
    roleFeedHistory: new Map<string, FeedItem[]>(),
    roleFeedSequence: new Map<string, number>(),
  };

  rememberMessage(activeSession as any, {
    type: 'operator_event',
    event: { kind: 'session.compaction_started', role: 'owner', trigger: 'manual' },
  }, tmpDir);
  rememberMessage(activeSession as any, {
    type: 'operator_event',
    event: { kind: 'session.compacted', role: 'owner', nodeId: 'owner-intake', trigger: 'manual', archiveId: 'archive-1' },
  }, tmpDir);

  const feed = activeSession.roleFeedHistory.get('owner') ?? [];
  assert.strictEqual(feed.length, 1);
  assert.strictEqual(feed[0].type, 'tool-success');
  assert.strictEqual(feed[0].label, 'Compaction');
  assert.strictEqual(feed[0].text, 'owner-intake context compacted (manual).');
  assert.deepStrictEqual(SessionStore.loadRoleFeed(ref, 'owner', tmpDir), feed);
});

test('compaction failure resolves the persisted pending feed item as an error', () => {
  const activeSession = {
    flowRef: ref,
    roleFeedHistory: new Map<string, FeedItem[]>(),
    roleFeedSequence: new Map<string, number>(),
  };

  rememberMessage(activeSession as any, {
    type: 'operator_event',
    event: { kind: 'session.compaction_started', role: 'owner', trigger: 'auto' },
  }, tmpDir);
  rememberMessage(activeSession as any, {
    type: 'operator_event',
    event: { kind: 'session.compaction_failed', role: 'owner', trigger: 'auto', reason: 'Context compaction aborted by operator.' },
  }, tmpDir);

  const feed = activeSession.roleFeedHistory.get('owner') ?? [];
  assert.strictEqual(feed.length, 1);
  assert.strictEqual(feed[0].type, 'tool-error');
  assert.strictEqual(feed[0].label, 'Compaction');
  assert.strictEqual(feed[0].text, 'Context compaction failed (auto): Context compaction aborted by operator.');
});

test('compaction failure without a pending item is not stored in the feed', () => {
  const activeSession = {
    flowRef: ref,
    roleFeedHistory: new Map<string, FeedItem[]>(),
    roleFeedSequence: new Map<string, number>(),
  };

  rememberMessage(activeSession as any, {
    type: 'operator_event',
    event: {
      kind: 'session.compaction_failed',
      role: 'reviewer',
      trigger: 'manual',
      reason: 'Context cannot be compacted while that role is actively receiving a model response.',
    },
  }, tmpDir);

  assert.strictEqual(activeSession.roleFeedHistory.has('reviewer'), false);
});

test('provider reasoning trace attaches to the latest assistant feed item', () => {
  const activeSession = {
    flowRef: ref,
    roleFeedHistory: new Map<string, FeedItem[]>(),
    roleFeedSequence: new Map<string, number>(),
  };

  rememberMessage(activeSession as any, {
    type: 'output_text',
    role: 'owner',
    text: 'Visible answer.',
  }, tmpDir);
  rememberMessage(activeSession as any, {
    type: 'operator_event',
    event: {
      kind: 'provider.reasoning_trace',
      role: 'owner',
      label: 'Provider reasoning trace',
      text: 'Reasoning detail.',
      display: 'collapsed',
    },
  }, tmpDir);

  const feed = activeSession.roleFeedHistory.get('owner') ?? [];
  assert.strictEqual(feed.length, 1);
  assert.strictEqual(feed[0].text, 'Visible answer.');
  assert.deepStrictEqual(feed[0].segments, [
    { type: 'text', text: 'Visible answer.' },
    { type: 'reasoning', label: 'Provider reasoning trace', text: 'Reasoning detail.', display: 'collapsed' },
  ]);
});

test('provider reasoning trace creates an assistant feed item when no assistant text exists', () => {
  const activeSession = {
    flowRef: ref,
    roleFeedHistory: new Map<string, FeedItem[]>(),
    roleFeedSequence: new Map<string, number>(),
  };

  rememberMessage(activeSession as any, {
    type: 'operator_event',
    event: {
      kind: 'provider.reasoning_trace',
      role: 'owner_2',
      label: 'Provider reasoning trace',
      text: 'Only reasoning detail.',
      display: 'collapsed',
    },
  }, tmpDir);

  const feed = activeSession.roleFeedHistory.get('owner_2') ?? [];
  assert.strictEqual(feed.length, 1);
  assert.strictEqual(feed[0].type, 'assistant');
  assert.strictEqual(feed[0].text, '');
  assert.deepStrictEqual(feed[0].segments, [
    { type: 'reasoning', label: 'Provider reasoning trace', text: 'Only reasoning detail.', display: 'collapsed' },
  ]);
});

test('provider reasoning trace starts a new assistant feed item after a user message', () => {
  const activeSession = {
    flowRef: ref,
    roleFeedHistory: new Map<string, FeedItem[]>(),
    roleFeedSequence: new Map<string, number>(),
  };

  rememberMessage(activeSession as any, {
    type: 'output_text',
    role: 'owner_3',
    text: 'Previous answer.',
  }, tmpDir);
  rememberMessage(activeSession as any, {
    type: 'input_text',
    role: 'owner_3',
    text: 'Next prompt.',
  }, tmpDir);
  rememberMessage(activeSession as any, {
    type: 'operator_event',
    event: {
      kind: 'provider.reasoning_trace',
      role: 'owner_3',
      label: 'Provider reasoning trace',
      text: 'New turn reasoning.',
      display: 'collapsed',
    },
  }, tmpDir);

  const feed = activeSession.roleFeedHistory.get('owner_3') ?? [];
  assert.strictEqual(feed.length, 3);
  assert.strictEqual(feed[0].type, 'assistant');
  assert.deepStrictEqual(feed[0].segments, [{ type: 'text', text: 'Previous answer.' }]);
  assert.strictEqual(feed[1].type, 'user');
  assert.strictEqual(feed[2].type, 'assistant');
  assert.strictEqual(feed[2].text, '');
  assert.deepStrictEqual(feed[2].segments, [
    { type: 'reasoning', label: 'Provider reasoning trace', text: 'New turn reasoning.', display: 'collapsed' },
  ]);
});

test('provider reasoning trace preserves interleaving around assistant text', () => {
  const activeSession = {
    flowRef: ref,
    roleFeedHistory: new Map<string, FeedItem[]>(),
    roleFeedSequence: new Map<string, number>(),
  };

  rememberMessage(activeSession as any, {
    type: 'output_text',
    role: 'owner_4',
    text: 'Assistant text A. ',
  }, tmpDir);
  rememberMessage(activeSession as any, {
    type: 'operator_event',
    event: {
      kind: 'provider.reasoning_trace',
      role: 'owner_4',
      label: 'Provider reasoning trace',
      text: 'Reasoning R1. ',
      display: 'collapsed',
    },
  }, tmpDir);
  rememberMessage(activeSession as any, {
    type: 'output_text',
    role: 'owner_4',
    text: 'Assistant text B. ',
  }, tmpDir);
  rememberMessage(activeSession as any, {
    type: 'operator_event',
    event: {
      kind: 'provider.reasoning_trace',
      role: 'owner_4',
      label: 'Provider reasoning trace',
      text: 'Reasoning R2. ',
      display: 'collapsed',
    },
  }, tmpDir);
  rememberMessage(activeSession as any, {
    type: 'output_text',
    role: 'owner_4',
    text: 'Assistant text C.',
  }, tmpDir);

  const feed = activeSession.roleFeedHistory.get('owner_4') ?? [];
  assert.strictEqual(feed.length, 1);
  assert.strictEqual(feed[0].type, 'assistant');
  assert.strictEqual(feed[0].text, 'Assistant text A. Assistant text B. Assistant text C.');
  assert.deepStrictEqual(feed[0].segments, [
    { type: 'text', text: 'Assistant text A. ' },
    { type: 'reasoning', label: 'Provider reasoning trace', text: 'Reasoning R1. ', display: 'collapsed' },
    { type: 'text', text: 'Assistant text B. ' },
    { type: 'reasoning', label: 'Provider reasoning trace', text: 'Reasoning R2. ', display: 'collapsed' },
    { type: 'text', text: 'Assistant text C.' },
  ]);
});

test('rememberMessage prunes role feed history using configured feed settings', () => {
  const settingsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-feed-settings-'));
  const originalSettingsDir = process.env.A_SOCIETY_SETTINGS_DIR;
  try {
    process.env.A_SOCIETY_SETTINGS_DIR = settingsDir;
    configureSettingsStore(settingsDir);
    updateFeedSettings({ historyLimit: 50 });

    const activeSession = {
      flowRef: ref,
      roleFeedHistory: new Map<string, FeedItem[]>(),
      roleFeedSequence: new Map<string, number>(),
    };

    for (let i = 0; i < 55; i++) {
      rememberMessage(activeSession as any, {
        type: 'input_text',
        role: 'owner_5',
        text: `message ${i}`,
      }, tmpDir);
    }

    const feed = activeSession.roleFeedHistory.get('owner_5') ?? [];
    assert.strictEqual(feed.length, 50);
    assert.strictEqual(feed[0].text, 'message 5');
    assert.strictEqual(feed[49].text, 'message 54');
  } finally {
    if (originalSettingsDir === undefined) {
      delete process.env.A_SOCIETY_SETTINGS_DIR;
    } else {
      process.env.A_SOCIETY_SETTINGS_DIR = originalSettingsDir;
    }
    configureSettingsStore(process.cwd());
    fs.rmSync(settingsDir, { recursive: true, force: true });
  }
});

test('role.active becomes a role feed activation item', () => {
  const event: OperatorEvent = {
    kind: 'role.active',
    nodeId: 'owner-gate',
    role: 'owner',
  };

  assert.strictEqual(isTransientOperatorEvent(event), false);
  assert.strictEqual(getOperatorFeedRoleKey({ type: 'operator_event', event }), 'owner');
  assert.deepStrictEqual(projectMessageToFeedItem({ type: 'operator_event', event }, 'owner_4'), {
    id: 'owner_4',
    type: 'activation',
    label: 'Activation',
    text: 'owner-gate (owner) is active.',
  });
});

test('role.resumed becomes a visible role feed boundary', () => {
  const event: OperatorEvent = {
    kind: 'role.resumed',
    nodeId: 'owner-intake',
    role: 'owner',
    reason: 'interrupted-turn',
  };

  assert.strictEqual(isTransientOperatorEvent(event), false);
  assert.strictEqual(getOperatorFeedRoleKey({ type: 'operator_event', event }), 'owner');
  assert.deepStrictEqual(projectMessageToFeedItem({ type: 'operator_event', event }, 'owner_5'), {
    id: 'owner_5',
    type: 'resume',
    label: 'Resume',
    text: 'owner-intake (owner) resumed after an interrupted response.',
  });
});

test('projectMessageToFeedItem returns null for events that do not become feed items', () => {
  assert.strictEqual(
    projectMessageToFeedItem({ type: 'error', message: 'boom' }, 'x'),
    null
  );
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
