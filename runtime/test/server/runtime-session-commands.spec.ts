import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { AWAITING_HUMAN_REASON, IMPROVEMENT_CHOICE_MODE } from '../../src/common/protocol-constants.js';
import { CURRENT_FLOW_STATE_VERSION, type FlowRef, type FlowRun } from '../../src/common/types.js';
import { SessionStore } from '../../src/orchestration/store.js';
import { createRuntimeSessionCommands } from '../../src/server/runtime-session/commands.js';
import { configureSettingsStore } from '../../src/settings/settings-store.js';
import { seedTestModelSettings } from '../integration/settings-test-utils.js';

function makeFlowRun(workspaceRoot: string, overrides: Partial<FlowRun> = {}): FlowRun {
  const flowId = overrides.flowId ?? 'test-flow';
  const projectNamespace = overrides.projectNamespace ?? 'test-project';
  return {
    flowId,
    workspaceRoot,
    projectNamespace,
    recordFolderPath: path.join(workspaceRoot, '.a-society', 'state', projectNamespace, flowId, 'record'),
    runningNodes: [],
    awaitingHumanNodes: {},
    pendingHumanInputs: {},
    visitedNodeIds: [],
    completedHandoffs: [],
    receivingHandoff: {},
    historyHandoff: {},
    awaitingHandoff: [],
    status: 'running',
    stateVersion: CURRENT_FLOW_STATE_VERSION,
    ...overrides,
  };
}

function createCommands(
  workspaceRoot: string,
  readFlowRun: (ref: FlowRef) => FlowRun | null,
  workflow: unknown = null
) {
  const errors: string[] = [];
  const historicalMessages: Array<{ role?: string; text: string }> = [];
  const activeSessions = new Map<string, any>();
  const commands = createRuntimeSessionCommands({
    workspaceRoot,
    activeSessions,
    readFlowRun,
    resolveWorkflow: () => workflow,
    createSession: (ref) => {
      const session = {
        flowRef: ref,
        finished: false,
        orchestrator: { wake: () => {} },
      };
      activeSessions.set(`${ref.projectNamespace}/${ref.flowId}`, session);
      return session as any;
    },
    startFlowRunner: () => {},
    attachSessionTask: async () => {},
    emitHistoricalMessage: (_session, message) => {
      if (message.type === 'input_text') historicalMessages.push({ role: message.role, text: message.text });
    },
    emitFlowState: () => {},
    broadcastToFlow: (_ref, message) => {
      if (message.type === 'error') errors.push(message.message);
    },
    missingModelError: (ref) => ({ type: 'error', flowRef: ref, message: 'missing model' }),
    consent: {} as any,
  });

  return { commands, errors, historicalMessages };
}

describe('runtime session human input commands', () => {
  afterEach(() => {
    configureSettingsStore(process.cwd());
  });

  it('does not queue forward human input when the latest flow no longer has an awaiting node', async () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-human-input-'));
    try {
      configureSettingsStore(workspaceRoot);
      seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
      SessionStore.init(workspaceRoot);

      const ref = { projectNamespace: 'test-project', flowId: 'test-flow' };
      const staleFlow = makeFlowRun(workspaceRoot, {
        awaitingHumanNodes: {
          owner: { role: 'owner', reason: AWAITING_HUMAN_REASON.PROMPT_HUMAN },
        },
      });
      SessionStore.saveFlowRun(makeFlowRun(workspaceRoot), ref, workspaceRoot);

      const { commands, errors } = createCommands(workspaceRoot, () => staleFlow);
      await commands.handleHumanInput(ref, 'stale human reply', { nodeId: 'owner' });

      const latest = SessionStore.loadFlowRun(ref, workspaceRoot)!;
      expect(latest.pendingHumanInputs).toEqual({});
      expect(errors).toEqual(["Node 'owner' is not accepting human input."]);
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('queues human input for an awaiting-handoff node resolved by role', async () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-await-handoff-input-'));
    try {
      configureSettingsStore(workspaceRoot);
      seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
      SessionStore.init(workspaceRoot);

      const ref = { projectNamespace: 'test-project', flowId: 'test-flow' };
      SessionStore.saveFlowRun(makeFlowRun(workspaceRoot, {
        awaitingHandoff: ['owner-review'],
      }), ref, workspaceRoot);

      const workflow = {
        nodes: [{ id: 'owner-review', role: 'owner' }],
        edges: [],
      };
      const { commands, errors, historicalMessages } = createCommands(
        workspaceRoot,
        (flowRef) => SessionStore.loadFlowRun(flowRef, workspaceRoot),
        workflow
      );
      await commands.handleHumanInput(ref, 'continue without that handoff', { role: 'owner' });

      const latest = SessionStore.loadFlowRun(ref, workspaceRoot)!;
      expect(errors).toEqual([]);
      expect(latest.pendingHumanInputs['owner-review']?.text).toBe('continue without that handoff');
      expect(historicalMessages).toEqual([{ role: 'owner', text: 'continue without that handoff' }]);
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('does not queue awaiting-handoff human input when the latest flow no longer awaits handoff', async () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-stale-await-handoff-input-'));
    try {
      configureSettingsStore(workspaceRoot);
      seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
      SessionStore.init(workspaceRoot);

      const ref = { projectNamespace: 'test-project', flowId: 'test-flow' };
      const staleFlow = makeFlowRun(workspaceRoot, {
        awaitingHandoff: ['owner-review'],
      });
      SessionStore.saveFlowRun(makeFlowRun(workspaceRoot), ref, workspaceRoot);

      const workflow = {
        nodes: [{ id: 'owner-review', role: 'owner' }],
        edges: [],
      };
      const { commands, errors } = createCommands(workspaceRoot, () => staleFlow, workflow);
      await commands.handleHumanInput(ref, 'stale await-handoff reply', { role: 'owner' });

      const latest = SessionStore.loadFlowRun(ref, workspaceRoot)!;
      expect(latest.pendingHumanInputs).toEqual({});
      expect(errors).toEqual(["Role 'owner' is not accepting human input."]);
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('does not queue improvement human input when the latest role is no longer awaiting', async () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-improvement-input-'));
    try {
      SessionStore.init(workspaceRoot);

      const ref = { projectNamespace: 'test-project', flowId: 'test-flow' };
      const staleFlow = makeFlowRun(workspaceRoot, {
        improvementPhase: {
          status: 'running',
          mode: IMPROVEMENT_CHOICE_MODE.GRAPH_BASED,
          completedRoles: [],
          runningRoles: [],
          awaitingHumanRoles: {
            owner: { reason: AWAITING_HUMAN_REASON.PROMPT_HUMAN },
          },
          pendingHumanInputs: {},
          findingsProduced: {},
        },
      });
      SessionStore.saveFlowRun(makeFlowRun(workspaceRoot, {
        improvementPhase: {
          status: 'running',
          mode: IMPROVEMENT_CHOICE_MODE.GRAPH_BASED,
          completedRoles: [],
          runningRoles: [],
          awaitingHumanRoles: {},
          pendingHumanInputs: {},
          findingsProduced: {},
        },
      }), ref, workspaceRoot);

      const { commands, errors } = createCommands(workspaceRoot, () => staleFlow);
      await commands.handleImprovementHumanInput(ref, 'owner', 'stale improvement reply');

      const latest = SessionStore.loadFlowRun(ref, workspaceRoot)!;
      expect(latest.improvementPhase?.pendingHumanInputs).toEqual({});
      expect(errors).toEqual(['Role "owner" is no longer awaiting human input in the improvement phase.']);
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });
});
