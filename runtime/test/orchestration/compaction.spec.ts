import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CURRENT_FLOW_STATE_VERSION } from '../../src/common/types.js';
import { runRoleTurn } from '../../src/common/role-turn.js';
import type { FlowRun, GatewayTurnResult, OperatorRenderSink, RoleSession, RuntimeMessageParam } from '../../src/common/types.js';
import { compactRoleSession, shouldAutoCompact } from '../../src/orchestration/compaction.js';
import { LLMGateway } from '../../src/providers/llm.js';
import { seedTestModelSettings } from '../integration/settings-test-utils.js';

const tempDirs = new Set<string>();

function createTempWorkspace(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-compaction-'));
  tempDirs.add(dir);
  seedTestModelSettings(path.join(dir, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
  return dir;
}

function createSilentRenderer(): OperatorRenderSink {
  return {
    emit() {},
    requestSent() {},
    receivingResponse() {},
    responseEnd() {},
    sendError() {},
  };
}

function createFlowRun(workspaceRoot: string, overrides: Partial<FlowRun> = {}): FlowRun {
  return {
    flowId: 'flow',
    workspaceRoot,
    projectNamespace: 'project',
    recordFolderPath: path.join(workspaceRoot, '.a-society', 'state', 'project', 'flow', 'record'),
    runningNodes: ['owner-review'],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    completedHandoffs: [],
    visitedNodeIds: [],
    receivingHandoff: {},
    historyHandoff: {},
    awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
    ...overrides,
  };
}

function createOwnerSession(history: RuntimeMessageParam[]): RoleSession {
  return {
    roleName: 'owner',
    logicalSessionId: 'flow__owner',
    transcriptHistory: [...history],
    currentNodeContext: {
      nodeId: 'owner-review',
      exchanges: [...history],
    },
    isActive: true,
    currentNodeId: 'owner-review',
  };
}

function messageContent(message: unknown): string {
  expect(message).toEqual(expect.objectContaining({ content: expect.any(String) }));
  return (message as { content: string }).content;
}

describe('context-compaction', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
  });

  it('uses 80 percent of the raw context window for auto-compaction', () => {
    expect(shouldAutoCompact(79, 100)).toBe(false);
    expect(shouldAutoCompact(80, 100)).toBe(true);
    expect(shouldAutoCompact(81, 100)).toBe(true);
    expect(shouldAutoCompact(undefined, 100)).toBe(false);
    expect(shouldAutoCompact(100, 0)).toBe(false);
  });

  it('archives raw history and replaces active history with a restoration message', async () => {
    const workspaceRoot = createTempWorkspace();
    const history: RuntimeMessageParam[] = [
      { role: 'user', content: 'Node entry' },
      { role: 'assistant', content: 'I found a malformed handoff.' },
      { role: 'user', content: 'Runtime repair prompt' },
    ];
    const session = createOwnerSession(history);
    const flowRun = createFlowRun(workspaceRoot, {
      completedHandoffs: ['owner-intake=>owner-review'],
    });

    vi.spyOn(LLMGateway.prototype, 'executeTurn').mockImplementation(async (
      _systemPrompt: string,
      messages: RuntimeMessageParam[]
    ): Promise<GatewayTurnResult> => {
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({ role: 'user' });
      expect(messageContent(messages[0])).toContain('Summarize the current workflow node conversation');
      expect(messageContent(messages[0])).toContain('Runtime repair prompt');
      return { text: 'Summary of current-node decisions and unresolved repair.' };
    });

    const result = await compactRoleSession({
      session,
      flowRun,
      roleName: 'owner',
      trigger: 'manual',
      signal: new AbortController().signal,
      operatorRenderer: createSilentRenderer(),
      nodeId: 'owner-review',
      exchanges: history,
    });

    expect(result.compacted).toBe(true);
    expect(session.transcriptHistory).toHaveLength(1);
    expect(session.currentNodeContext?.exchanges).toHaveLength(1);
    expect(session.compactionArchives).toHaveLength(1);
    expect(session.compactionArchives?.[0].archivedTranscriptHistory).toEqual(history);
    expect(session.compactionArchives?.[0].replacementMessage).toBe(session.transcriptHistory[0]);

    const replacement = session.transcriptHistory[0];
    expect(replacement).toMatchObject({ role: 'user' });
    expect(messageContent(replacement)).toContain('Runtime Context Restoration');
    expect(messageContent(replacement)).toContain('Summary of current-node decisions and unresolved repair.');
    expect(messageContent(replacement)).toContain('owner-intake=>owner-review');
    expect(messageContent(replacement)).toContain('Runtime repair prompt');
    expect(session.latestContextUsage).toBe(0);
  });

  it('passes abort and renderer metadata through the compaction turn', async () => {
    const workspaceRoot = createTempWorkspace();
    const controller = new AbortController();
    const responseEnds: string[] = [];
    const renderer: OperatorRenderSink = {
      emit() {},
      requestSent() {},
      receivingResponse() {},
      responseEnd(role: string) {
        responseEnds.push(role);
      },
      sendError() {},
    };
    const history: RuntimeMessageParam[] = [{ role: 'user', content: 'Node entry' }];
    const session = createOwnerSession(history);
    const flowRun = createFlowRun(workspaceRoot);

    vi.spyOn(LLMGateway.prototype, 'executeTurn').mockImplementation(async (
      _systemPrompt: string,
      _messages: RuntimeMessageParam[],
      options?: Parameters<LLMGateway['executeTurn']>[2]
    ): Promise<GatewayTurnResult> => {
      expect(options?.signal).toBe(controller.signal);
      expect(options?.operatorRenderer).toBe(renderer);
      expect(options?.roleInstanceId).toBe('owner');
      expect(options?.nodeId).toBe('owner-review');
      return { text: 'Summary with lifecycle metadata.' };
    });

    const result = await compactRoleSession({
      session,
      flowRun,
      roleName: 'owner',
      trigger: 'manual',
      signal: controller.signal,
      operatorRenderer: renderer,
      nodeId: 'owner-review',
      exchanges: session.currentNodeContext!.exchanges as RuntimeMessageParam[],
    });

    expect(result.compacted).toBe(true);
    expect(responseEnds).toEqual(['owner']);
  });

  it('auto-compacts role history before the model turn', async () => {
    const workspaceRoot = createTempWorkspace();
    seedTestModelSettings(path.join(workspaceRoot, '.a-society'), {
      providerBaseUrl: 'http://127.0.0.1:1/v1',
      contextWindow: 100,
    });
    const callKinds: string[] = [];
    vi.spyOn(LLMGateway.prototype, 'executeTurn').mockImplementation(async (
      systemPrompt: string,
      messages: RuntimeMessageParam[]
    ): Promise<GatewayTurnResult> => {
      if (systemPrompt.includes('runtime context compactor')) {
        callKinds.push('compaction');
        expect(messages).toHaveLength(1);
        expect(messages[0]).toMatchObject({ role: 'user' });
        expect(messageContent(messages[0])).toContain('Earlier role context');
        return { text: 'Compacted role context summary.' };
      }

      callKinds.push('role-turn');
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({ role: 'user' });
      expect(messageContent(messages[0])).toContain('Runtime Context Restoration');
      expect(messageContent(messages[0])).toContain('Compacted role context summary.');
      return { text: '```handoff\ntype: prompt-human\n```', contextUsage: 12 };
    });

    const history: RuntimeMessageParam[] = [
      { role: 'user', content: 'Earlier role context' },
      { role: 'assistant', content: 'Prior response' },
      { role: 'user', content: 'Current role turn input' },
    ];
    const session: RoleSession = {
      ...createOwnerSession(history),
      latestContextUsage: 80,
    };
    const flowRun = createFlowRun(workspaceRoot);
    let saveCount = 0;

    const result = await runRoleTurn({
      workspaceRoot,
      roleInstanceId: 'owner',
      providedSystemPrompt: 'Role system prompt',
      flowRef: { projectNamespace: 'project', flowId: 'flow' },
      providedHistory: history,
      externalSignal: new AbortController().signal,
      operatorRenderer: createSilentRenderer(),
      nodeId: 'owner-review',
      compaction: {
        session,
        flowRun,
        saveSession: () => {
          saveCount++;
        },
        nodeId: 'owner-review',
      },
    });

    expect(result?.handoff.kind).toBe('awaiting_human');
    expect(callKinds).toEqual(['compaction', 'role-turn']);
    expect(saveCount).toBe(1);
    expect(history).toHaveLength(1);
    expect(session.transcriptHistory).toBe(history);
  });

  it('reports no-op when there is no current node', async () => {
    const session: RoleSession = {
      roleName: 'owner',
      logicalSessionId: 'flow__owner',
      transcriptHistory: [{ role: 'user', content: 'No node yet' }],
      isActive: false,
    };
    const flowRun = createFlowRun('.', {
      recordFolderPath: '.a-society/state/project/flow/record',
      runningNodes: [],
    });

    const result = await compactRoleSession({
      session,
      flowRun,
      roleName: 'owner',
      trigger: 'manual',
      signal: new AbortController().signal,
      operatorRenderer: createSilentRenderer(),
      nodeId: '',
      exchanges: session.transcriptHistory as RuntimeMessageParam[],
    });

    expect(result.compacted).toBe(false);
    expect(result.reason ?? '').toMatch(/current node/i);
  });
});
