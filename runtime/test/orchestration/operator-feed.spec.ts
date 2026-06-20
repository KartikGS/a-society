import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FlowOrchestrator } from '../../src/orchestration/orchestrator.js';
import * as SessionStore from '../../src/orchestration/store.js';
import { getFlowRecordDir } from '../../src/orchestration/state-paths.js';
import { getOperatorFeedRoleKey, isTransientOperatorEvent, projectMessageToFeedItem } from '../../src/server/role-feed.js';
import { rememberMessage } from '../../src/server/runtime-session/feed.js';
import { updateFeedSettings } from '../../src/settings/settings-store.js';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
import type { FeedItem, FlowRef, FlowRun, GatewayTurnResult, OperatorEvent, RoleSession } from '../../src/common/types.js';
import { LLMGateway } from '../../src/providers/llm.js';
import type { ActiveSession } from '../../src/server/runtime-session/types.js';
import { seedTestModelSettings } from '../integration/settings-test-utils.js';
import { runStoredFlowUntil } from '../integration/orchestrator-test-utils.js';

const tempDirs = new Set<string>();

function createTempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tempDirs.add(dir);
  return dir;
}

function createFixture(flowId = 'test-flow'): { tmpDir: string; ref: FlowRef } {
  const tmpDir = createTempDir('a-society-operator-feed-');
  setWorkspaceRoot(tmpDir);
  const projectNamespace = 'test-project';
  const ref = { projectNamespace, flowId };
  const recordFolderPath = getFlowRecordDir(tmpDir, ref);
  fs.mkdirSync(recordFolderPath, { recursive: true });

  const flowRun: FlowRun = {
    flowId,
    workspaceRoot: tmpDir,
    projectNamespace,
    recordFolderPath,
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    pendingHandoffApprovals: {},
    visitedNodeIds: [],
    completedHandoffs: [],
    receivingHandoff: {},
    historyHandoff: {},
    awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
  };

  SessionStore.saveFlowRun(flowRun, ref);
  return { tmpDir, ref };
}

function createActiveSession(flowRef: FlowRef): ActiveSession {
  return {
    flowRef,
    roleFeedHistory: new Map<string, FeedItem[]>(),
    roleFeedSequence: new Map<string, number>(),
  } as ActiveSession;
}

function scaffoldRole(workspaceRoot: string, projectNamespace: string, roleId: string): void {
  const roleDir = path.join(workspaceRoot, projectNamespace, 'a-docs', 'roles', roleId);
  fs.mkdirSync(roleDir, { recursive: true });
  fs.writeFileSync(path.join(roleDir, 'main.md'), `${roleId} role`);
  fs.writeFileSync(path.join(roleDir, 'ownership.yaml'), `role: ${roleId}\nsurfaces: []\n`);
  fs.writeFileSync(path.join(roleDir, 'required-readings.yaml'), `role: ${roleId}\nrequired_readings: []\n`);
}

describe('operator-feed', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearWorkspaceRoot();
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
  });

  it('persists FeedItem entries separately from role transcript history', () => {
    const { ref } = createFixture();
    const roleFeed: FeedItem[] = [
      { id: 'owner_0', type: 'assistant', label: 'Assistant', text: 'Visible assistant text.' },
      { id: 'owner_1', type: 'user', label: 'You', text: 'Visible operator reply.' },
    ];
    const roleSession: RoleSession = {
      roleName: 'owner',
      logicalSessionId: `${ref.flowId}__owner`,
      transcriptHistory: [{ role: 'user', content: 'Model-only node packet.' }],
      isActive: true,
      currentNodeId: 'owner-intake',
    };

    SessionStore.saveRoleFeed(roleFeed, ref, 'owner');
    SessionStore.saveRoleSession(roleSession, ref);

    expect(SessionStore.loadRoleFeed(ref, 'owner')).toEqual(roleFeed);
    expect(SessionStore.loadRoleSession('owner', ref)?.transcriptHistory).toEqual(roleSession.transcriptHistory);
  });

  it('loads all role feeds keyed by role', () => {
    const { ref } = createFixture();
    const roleFeed: FeedItem[] = [
      { id: 'owner_0', type: 'assistant', label: 'Assistant', text: 'Visible assistant text.' },
      { id: 'owner_1', type: 'user', label: 'You', text: 'Visible operator reply.' },
    ];

    SessionStore.saveRoleFeed(roleFeed, ref, 'owner');

    const allFeeds = SessionStore.loadAllRoleFeeds(ref);
    expect(allFeeds.has('owner')).toBe(true);
    expect(allFeeds.get('owner')).toHaveLength(2);
  });

  it('round-trips FeedItem arrays through saveRoleFeed and loadRoleFeed', () => {
    const { ref } = createFixture();
    const items: FeedItem[] = [
      { id: 'curator_1_0', type: 'assistant', label: 'Assistant', text: 'hello' },
      { id: 'curator_1_1', type: 'user', label: 'You', text: 'user reply' },
    ];

    SessionStore.saveRoleFeed(items, ref, 'curator_1');

    expect(SessionStore.loadRoleFeed(ref, 'curator_1')).toEqual(items);
  });

  it('treats repair requested events with a role as role-feed historical events', () => {
    const event: OperatorEvent = {
      kind: 'repair.requested',
      scope: 'node',
      code: 'missing_block',
      summary: 'Malformed handoff block',
      role: 'owner',
      nodeId: 'owner-intake',
    };

    expect(isTransientOperatorEvent(event)).toBe(false);
    expect(getOperatorFeedRoleKey({ type: 'operator_event', event })).toBe('owner');
  });

  it('projects output_text messages into assistant FeedItems', () => {
    expect(projectMessageToFeedItem(
      { type: 'output_text', role: 'owner', text: 'hi' },
      'owner_0'
    )).toEqual({
      id: 'owner_0',
      type: 'assistant',
      label: 'Assistant',
      text: 'hi',
    });
  });

  it('skips the awaiting prompt and appends the role configuration result', () => {
    const { ref } = createFixture();
    const activeSession = createActiveSession(ref);

    rememberMessage(activeSession, {
      type: 'operator_event',
      event: {
        kind: 'human.awaiting_input',
        nodeId: 'owner-intake',
        role: 'owner',
        reason: 'role-configuration',
      },
    });
    rememberMessage(activeSession, {
      type: 'operator_event',
      event: {
        kind: 'role.configured',
        nodeId: 'owner-intake',
        role: 'owner',
        modelDisplayName: 'Claude Sonnet',
        skillNames: ['review-writing', 'doc-editing'],
        mcpServerNames: [],
      },
    });

    // The awaiting prompt projects no feed item; only the result bubble is appended.
    const feed = activeSession.roleFeedHistory.get('owner') ?? [];
    expect(feed).toHaveLength(1);
    expect(feed[0]).toMatchObject({
      type: 'event',
      label: 'Role Configuration',
      text: 'Model: Claude Sonnet\nSkills: review-writing, doc-editing\nMCP servers: none',
    });
    expect(SessionStore.loadRoleFeed(ref, 'owner')).toEqual(feed);
  });

  it('keeps the auto-selection strip status-only and resolves it to success', () => {
    const { ref } = createFixture();
    const activeSession = createActiveSession(ref);

    rememberMessage(activeSession, {
      type: 'operator_event',
      event: { kind: 'role.auto_selection_started', nodeId: 'owner-intake', role: 'owner' },
    });
    rememberMessage(activeSession, {
      type: 'operator_event',
      event: { kind: 'role.auto_configured', nodeId: 'owner-intake', role: 'owner' },
    });

    const feed = activeSession.roleFeedHistory.get('owner') ?? [];
    expect(feed).toHaveLength(1);
    expect(feed[0]).toMatchObject({
      type: 'tool-success',
      label: 'Role Configuration',
      text: 'Configured automatically.',
    });
  });

  it('marks the auto-selection strip as failed when it falls back', () => {
    const { ref } = createFixture();
    const activeSession = createActiveSession(ref);

    rememberMessage(activeSession, {
      type: 'operator_event',
      event: { kind: 'role.auto_selection_started', nodeId: 'owner-intake', role: 'owner' },
    });
    rememberMessage(activeSession, {
      type: 'operator_event',
      event: { kind: 'role.auto_selection_fell_back', nodeId: 'owner-intake', role: 'owner', dimensions: ['skills'], reason: 'network down' },
    });

    const feed = activeSession.roleFeedHistory.get('owner') ?? [];
    expect(feed).toHaveLength(1);
    expect(feed[0]).toMatchObject({ type: 'tool-error', label: 'Role Configuration' });
  });

  it('projects activity.tool_call events with a role into tool FeedItems', () => {
    expect(projectMessageToFeedItem(
      {
        type: 'operator_event',
        event: { kind: 'activity.tool_call', role: 'owner', toolName: 'write_file', path: 'a.md' },
      },
      'owner_3'
    )).toEqual({ id: 'owner_3', type: 'tool', label: 'Tool Call', text: 'write_file a.md' });
  });

  it('keeps activity.tool_call out of the transient set so it reaches historical persistence', () => {
    const event: OperatorEvent = { kind: 'activity.tool_call', role: 'owner', toolName: 'read' };

    expect(isTransientOperatorEvent(event)).toBe(false);
    expect(getOperatorFeedRoleKey({ type: 'operator_event', event })).toBe('owner');
  });

  it('projects skipped MCP tool notices into role feed items', () => {
    const event: OperatorEvent = {
      kind: 'mcp.tool_unavailable',
      role: 'owner',
      nodeId: 'owner-intake',
      serverName: 'github',
      toolName: 'x'.repeat(80),
      reason: 'MCP tool name is too long.',
    };

    expect(isTransientOperatorEvent(event)).toBe(false);
    expect(getOperatorFeedRoleKey({ type: 'operator_event', event })).toBe('owner');
    expect(projectMessageToFeedItem({ type: 'operator_event', event }, 'owner_4')).toEqual({
      id: 'owner_4',
      type: 'tool-error',
      label: 'MCP',
      text: `${event.serverName}.${event.toolName} skipped: ${event.reason}`,
    });
  });

  it('projects compaction started events into pending role feed items', () => {
    const event: OperatorEvent = { kind: 'session.compaction_started', role: 'owner', trigger: 'manual' };

    expect(isTransientOperatorEvent(event)).toBe(false);
    expect(getOperatorFeedRoleKey({ type: 'operator_event', event })).toBe('owner');
    expect(projectMessageToFeedItem({ type: 'operator_event', event }, 'owner_4')).toEqual({
      id: 'owner_4',
      type: 'tool',
      label: 'Compaction',
      text: 'Compacting context (manual).',
    });
  });

  it('resolves a persisted pending compaction item on completion', () => {
    const { ref } = createFixture();
    const activeSession = createActiveSession(ref);

    rememberMessage(activeSession, {
      type: 'operator_event',
      event: { kind: 'session.compaction_started', role: 'owner', trigger: 'manual' },
    });
    rememberMessage(activeSession, {
      type: 'operator_event',
      event: { kind: 'session.compacted', role: 'owner', nodeId: 'owner-intake', trigger: 'manual', archiveId: 'archive-1' },
    });

    const feed = activeSession.roleFeedHistory.get('owner') ?? [];
    expect(feed).toHaveLength(1);
    expect(feed[0]).toMatchObject({
      type: 'tool-success',
      label: 'Compaction',
      text: 'owner-intake context compacted (manual).',
    });
    expect(SessionStore.loadRoleFeed(ref, 'owner')).toEqual(feed);
  });

  it('resolves a persisted pending compaction item as an error on failure', () => {
    const { ref } = createFixture();
    const activeSession = createActiveSession(ref);

    rememberMessage(activeSession, {
      type: 'operator_event',
      event: { kind: 'session.compaction_started', role: 'owner', trigger: 'auto' },
    });
    rememberMessage(activeSession, {
      type: 'operator_event',
      event: { kind: 'session.compaction_failed', role: 'owner', trigger: 'auto', reason: 'Context compaction aborted by operator.' },
    });

    const feed = activeSession.roleFeedHistory.get('owner') ?? [];
    expect(feed).toHaveLength(1);
    expect(feed[0]).toMatchObject({
      type: 'tool-error',
      label: 'Compaction',
      text: 'Context compaction failed (auto): Context compaction aborted by operator.',
    });
  });

  it('does not store compaction failure events without a pending item', () => {
    const { ref } = createFixture();
    const activeSession = createActiveSession(ref);

    rememberMessage(activeSession, {
      type: 'operator_event',
      event: {
        kind: 'session.compaction_failed',
        role: 'reviewer',
        trigger: 'manual',
        reason: 'Context cannot be compacted while that role is actively receiving a model response.',
      },
    });

    expect(activeSession.roleFeedHistory.has('reviewer')).toBe(false);
  });

  it('projects provider reasoning traces into reasoning FeedItems', () => {
    const event: OperatorEvent = {
      kind: 'provider.reasoning_trace',
      role: 'owner',
      label: 'Provider reasoning trace',
      text: 'Reasoning detail.',
      display: 'collapsed',
    };

    expect(projectMessageToFeedItem({ type: 'operator_event', event }, 'owner_6')).toEqual({
      id: 'owner_6',
      type: 'reasoning',
      label: 'Provider reasoning trace',
      text: 'Reasoning detail.',
      reasoningDisplay: 'collapsed',
    });
  });

  it('creates a separate reasoning feed item after assistant text', () => {
    const { ref } = createFixture();
    const activeSession = createActiveSession(ref);

    rememberMessage(activeSession, {
      type: 'output_text',
      role: 'owner',
      text: 'Visible answer.',
    });
    rememberMessage(activeSession, {
      type: 'operator_event',
      event: {
        kind: 'provider.reasoning_trace',
        role: 'owner',
        label: 'Provider reasoning trace',
        text: 'Reasoning detail.',
        display: 'collapsed',
      },
    });

    const feed = activeSession.roleFeedHistory.get('owner') ?? [];
    expect(feed).toHaveLength(2);
    expect(feed[0].text).toBe('Visible answer.');
    expect(feed[1]).toEqual({
      id: 'owner_1',
      type: 'reasoning',
      label: 'Provider reasoning trace',
      text: 'Reasoning detail.',
      reasoningDisplay: 'collapsed',
    });
  });

  it('creates a reasoning feed item when no assistant text exists', () => {
    const { ref } = createFixture();
    const activeSession = createActiveSession(ref);

    rememberMessage(activeSession, {
      type: 'operator_event',
      event: {
        kind: 'provider.reasoning_trace',
        role: 'owner_2',
        label: 'Provider reasoning trace',
        text: 'Only reasoning detail.',
        display: 'collapsed',
      },
    });

    expect(activeSession.roleFeedHistory.get('owner_2') ?? []).toEqual([{
      id: 'owner_2_0',
      type: 'reasoning',
      label: 'Provider reasoning trace',
      text: 'Only reasoning detail.',
      reasoningDisplay: 'collapsed',
    }]);
  });

  it('starts a new reasoning feed item after a user message', () => {
    const { ref } = createFixture();
    const activeSession = createActiveSession(ref);

    rememberMessage(activeSession, {
      type: 'output_text',
      role: 'owner_3',
      text: 'Previous answer.',
    });
    rememberMessage(activeSession, {
      type: 'input_text',
      role: 'owner_3',
      text: 'Next prompt.',
    });
    rememberMessage(activeSession, {
      type: 'operator_event',
      event: {
        kind: 'provider.reasoning_trace',
        role: 'owner_3',
        label: 'Provider reasoning trace',
        text: 'New turn reasoning.',
        display: 'collapsed',
      },
    });

    const feed = activeSession.roleFeedHistory.get('owner_3') ?? [];
    expect(feed.map((item) => item.type)).toEqual(['assistant', 'user', 'reasoning']);
    expect(feed[2]).toEqual({
      id: 'owner_3_2',
      type: 'reasoning',
      label: 'Provider reasoning trace',
      text: 'New turn reasoning.',
      reasoningDisplay: 'collapsed',
    });
  });

  it('appends provider reasoning trace text to the latest reasoning feed item', () => {
    const { ref } = createFixture();
    const activeSession = createActiveSession(ref);

    rememberMessage(activeSession, {
      type: 'operator_event',
      event: {
        kind: 'provider.reasoning_trace',
        role: 'owner_4',
        label: 'Provider reasoning trace',
        text: 'Reasoning A. ',
        display: 'collapsed',
      },
    });
    rememberMessage(activeSession, {
      type: 'operator_event',
      event: {
        kind: 'provider.reasoning_trace',
        role: 'owner_4',
        label: 'Provider reasoning trace',
        text: 'Reasoning B.',
        display: 'collapsed',
      },
    });

    expect(activeSession.roleFeedHistory.get('owner_4') ?? []).toEqual([{
      id: 'owner_4_0',
      type: 'reasoning',
      label: 'Provider reasoning trace',
      text: 'Reasoning A. Reasoning B.',
      reasoningDisplay: 'collapsed',
    }]);
  });

  it('preserves chronological feed item order around assistant text and reasoning traces', () => {
    const { ref } = createFixture();
    const activeSession = createActiveSession(ref);

    rememberMessage(activeSession, {
      type: 'output_text',
      role: 'owner_6',
      text: 'Assistant text A. ',
    });
    rememberMessage(activeSession, {
      type: 'operator_event',
      event: {
        kind: 'provider.reasoning_trace',
        role: 'owner_6',
        label: 'Provider reasoning trace',
        text: 'Reasoning R1. ',
        display: 'collapsed',
      },
    });
    rememberMessage(activeSession, {
      type: 'output_text',
      role: 'owner_6',
      text: 'Assistant text B. ',
    });
    rememberMessage(activeSession, {
      type: 'operator_event',
      event: {
        kind: 'provider.reasoning_trace',
        role: 'owner_6',
        label: 'Provider reasoning trace',
        text: 'Reasoning R2. ',
        display: 'collapsed',
      },
    });
    rememberMessage(activeSession, {
      type: 'output_text',
      role: 'owner_6',
      text: 'Assistant text C.',
    });

    const feed = activeSession.roleFeedHistory.get('owner_6') ?? [];
    expect(feed.map((item) => item.type)).toEqual([
      'assistant',
      'reasoning',
      'assistant',
      'reasoning',
      'assistant',
    ]);
    expect(feed.map((item) => item.text)).toEqual([
      'Assistant text A. ',
      'Reasoning R1. ',
      'Assistant text B. ',
      'Reasoning R2. ',
      'Assistant text C.',
    ]);
  });

  it('prunes role feed history using configured feed settings', () => {
    const { ref } = createFixture();
    const settingsDir = createTempDir('a-society-feed-settings-');
    setWorkspaceRoot(settingsDir);
    updateFeedSettings({ historyLimit: 50 });
    const activeSession = createActiveSession(ref);

    for (let i = 0; i < 55; i++) {
      rememberMessage(activeSession, {
        type: 'input_text',
        role: 'owner_5',
        text: `message ${i}`,
      });
    }

    const feed = activeSession.roleFeedHistory.get('owner_5') ?? [];
    expect(feed).toHaveLength(50);
    expect(feed[0].text).toBe('message 5');
    expect(feed[49].text).toBe('message 54');
  });

  it('projects role.active events into role feed activation items', () => {
    const event: OperatorEvent = {
      kind: 'role.active',
      nodeId: 'owner-gate',
      role: 'owner',
    };

    expect(isTransientOperatorEvent(event)).toBe(false);
    expect(getOperatorFeedRoleKey({ type: 'operator_event', event })).toBe('owner');
    expect(projectMessageToFeedItem({ type: 'operator_event', event }, 'owner_4')).toEqual({
      id: 'owner_4',
      type: 'activation',
      label: 'Activation',
      text: 'owner-gate (owner) is active.',
    });
  });

  it('projects role.resumed events into visible role feed boundaries', () => {
    const event: OperatorEvent = {
      kind: 'role.resumed',
      nodeId: 'owner-intake',
      role: 'owner',
      reason: 'interrupted-turn',
    };

    expect(isTransientOperatorEvent(event)).toBe(false);
    expect(getOperatorFeedRoleKey({ type: 'operator_event', event })).toBe('owner');
    expect(projectMessageToFeedItem({ type: 'operator_event', event }, 'owner_5')).toEqual({
      id: 'owner_5',
      type: 'resume',
      label: 'Resume',
      text: 'owner-intake (owner) resumed after an interrupted response.',
    });
  });

  it('returns null for messages that do not become feed items', () => {
    expect(projectMessageToFeedItem({ type: 'error', message: 'boom' }, 'x')).toBeNull();
  });

  it('emits usage after an accepted handoff response and before the handoff notice', async () => {
    const { tmpDir, ref } = createFixture('accepted-handoff-flow');
    seedTestModelSettings(path.join(tmpDir, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
    scaffoldRole(tmpDir, ref.projectNamespace, 'curator');
    scaffoldRole(tmpDir, ref.projectNamespace, 'owner');

    const recordDir = getFlowRecordDir(tmpDir, ref);
    fs.writeFileSync(
      path.join(recordDir, 'workflow.yaml'),
      'workflow:\n  name: Accepted Handoff Test\n  nodes:\n    - id: start\n      role: curator\n    - id: next\n      role: owner\n  edges:\n    - from: start\n      to: next\n'
    );
    fs.writeFileSync(path.join(tmpDir, 'accepted-output.md'), 'Accepted artifact content.');

    const flowRun: FlowRun = {
      flowId: ref.flowId,
      workspaceRoot: tmpDir,
      projectNamespace: ref.projectNamespace,
      recordFolderPath: recordDir,
      runningNodes: ['start'],
      awaitingHumanNodes: {},
      pendingHumanInputs: {},
      pendingHandoffApprovals: {},
      visitedNodeIds: [],
      completedHandoffs: [],
      receivingHandoff: {},
      historyHandoff: {},
      awaitingHandoff: [],
      status: 'running',
      stateVersion: CURRENT_FLOW_STATE_VERSION,
    };
    SessionStore.saveFlowRun(flowRun, ref);

    vi.spyOn(LLMGateway.prototype, 'executeTurn')
      .mockResolvedValueOnce({
        text: "Accepted. ```handoff\ntarget_node_id: 'next'\nartifact_path: 'accepted-output.md'\n```",
        contextUsage: 68,
      } satisfies GatewayTurnResult)
      .mockResolvedValue({
        text: "Ready for review. ```handoff\ntype: prompt-human\n```",
        contextUsage: 10,
      } satisfies GatewayTurnResult);

    const events: OperatorEvent[] = [];
    const renderer = {
      emit(event: OperatorEvent) {
        events.push(event);
      },
      requestSent() {},
      receivingResponse() {},
      responseEnd() {},
      sendError() {},
    };

    SessionStore.init();
    const orchestrator = new FlowOrchestrator(renderer);
    await runStoredFlowUntil(
      orchestrator, tmpDir, ref.projectNamespace, ref.flowId,
      () => !!SessionStore.loadFlowRun(ref)?.awaitingHumanNodes['next']
    );

    expect(events.slice(0, 3).map(event => event.kind)).toEqual([
      'role.active',
      'usage.turn_summary',
      'handoff.applied',
    ]);
    expect(events[1]).toEqual({
      kind: 'usage.turn_summary',
      role: 'curator',
      contextUsage: 68,
    });
    expect(SessionStore.loadRoleSession('curator', ref)?.latestContextUsage).toBe(68);
  });
});
