import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { AWAITING_HUMAN_REASON, IMPROVEMENT_CHOICE_MODE } from '../../shared/protocol-constants.js';
import { CURRENT_FLOW_STATE_VERSION, type FlowRef, type FlowRun } from '../../src/common/types.js';
import { readCapabilitySelection, saveCapabilityDimension } from '../../src/orchestration/capability-selection.js';
import { readRoleModelSelection } from '../../src/orchestration/role-model.js';
import { SessionStore } from '../../src/orchestration/store.js';
import { createRuntimeSessionCommands } from '../../src/server/runtime-session/commands.js';
import { configureSettingsStore } from '../../src/settings/settings-store.js';
import { seedTestModelSettings, seedTestMultiModelSettings } from '../integration/settings-test-utils.js';

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
    pendingHandoffApprovals: {},
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
  const historicalEvents: Array<{ kind: string; role?: string; nodeId?: string; modelDisplayName?: string }> = [];
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
      if (message.type === 'operator_event') historicalEvents.push(message.event as any);
    },
    emitFlowState: () => {},
    broadcastToFlow: (_ref, message) => {
      if (message.type === 'error') errors.push(message.message);
    },
    missingModelError: (ref) => ({ type: 'error', flowRef: ref, message: 'missing model' }),
    consent: {} as any,
  });

  return { commands, errors, historicalMessages, historicalEvents };
}

function writeSkill(workspaceRoot: string, name: string): void {
  const dir = path.join(workspaceRoot, '.a-society', 'skills', name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'SKILL.md'), `---
name: ${name}
description: ${name} description.
---

Body.
`, 'utf8');
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

  it('persists role configuration for an awaiting node and marks it in the role feed', () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-model-selection-'));
    try {
      configureSettingsStore(workspaceRoot);
      seedTestMultiModelSettings(path.join(workspaceRoot, '.a-society'), [
        { id: 'model-a', providerBaseUrl: 'http://127.0.0.1:1/v1', active: true },
        { id: 'model-b', providerBaseUrl: 'http://127.0.0.1:1/v1', displayName: 'Model B' },
      ]);
      SessionStore.init(workspaceRoot);

      const ref = { projectNamespace: 'test-project', flowId: 'test-flow' };
      const flow = makeFlowRun(workspaceRoot, {
        awaitingHumanNodes: {
          plan: { role: 'planner', reason: AWAITING_HUMAN_REASON.ROLE_CONFIGURATION },
        },
      });
      SessionStore.saveFlowRun(flow, ref, workspaceRoot);

      const { commands, errors, historicalMessages, historicalEvents } = createCommands(workspaceRoot, () => flow);
      commands.handleRoleConfiguration(ref, 'plan', { modelConfigId: 'model-b', skills: [], mcpServers: [] });

      expect(errors).toEqual([]);
      expect(readRoleModelSelection(workspaceRoot, ref, 'planner')?.modelConfigId).toBe('model-b');
      expect(historicalMessages).toEqual([]);
      expect(historicalEvents).toEqual([{
        kind: 'role.configured',
        nodeId: 'plan',
        role: 'planner',
        modelDisplayName: 'Model B',
      }]);
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('shows the full effective configuration in the result bubble, including auto-decided skills', () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-mixed-config-'));
    try {
      configureSettingsStore(workspaceRoot);
      seedTestMultiModelSettings(path.join(workspaceRoot, '.a-society'), [
        { id: 'model-a', providerBaseUrl: 'http://127.0.0.1:1/v1', active: true },
        { id: 'model-b', providerBaseUrl: 'http://127.0.0.1:1/v1', displayName: 'Model B' },
      ]);
      writeSkill(workspaceRoot, 'review-writing');
      SessionStore.init(workspaceRoot);

      const ref = { projectNamespace: 'test-project', flowId: 'test-flow' };
      // Skills were already decided automatically; only the model stays manual.
      saveCapabilityDimension(workspaceRoot, ref, 'planner', 'skills', ['review-writing']);
      const flow = makeFlowRun(workspaceRoot, {
        awaitingHumanNodes: {
          plan: { role: 'planner', reason: AWAITING_HUMAN_REASON.ROLE_CONFIGURATION },
        },
      });
      SessionStore.saveFlowRun(flow, ref, workspaceRoot);

      const { commands, errors, historicalEvents } = createCommands(workspaceRoot, () => flow);
      commands.handleRoleConfiguration(ref, 'plan', { modelConfigId: 'model-b', skills: [], mcpServers: [] });

      expect(errors).toEqual([]);
      // The bubble carries the complete config: the just-selected model plus the auto skills.
      expect(historicalEvents).toEqual([expect.objectContaining({
        kind: 'role.configured',
        nodeId: 'plan',
        role: 'planner',
        modelDisplayName: 'Model B',
        skillNames: ['review-writing'],
      })]);
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('rejects role configuration for a node that is not awaiting it', () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-model-selection-stale-'));
    try {
      configureSettingsStore(workspaceRoot);
      seedTestMultiModelSettings(path.join(workspaceRoot, '.a-society'), [
        { id: 'model-a', providerBaseUrl: 'http://127.0.0.1:1/v1', active: true },
        { id: 'model-b', providerBaseUrl: 'http://127.0.0.1:1/v1' },
      ]);
      SessionStore.init(workspaceRoot);

      const ref = { projectNamespace: 'test-project', flowId: 'test-flow' };
      const flow = makeFlowRun(workspaceRoot, {
        awaitingHumanNodes: {
          plan: { role: 'planner', reason: AWAITING_HUMAN_REASON.PROMPT_HUMAN },
        },
      });
      SessionStore.saveFlowRun(flow, ref, workspaceRoot);

      const { commands, errors } = createCommands(workspaceRoot, () => flow);
      commands.handleRoleConfiguration(ref, 'plan', { modelConfigId: 'model-b', skills: [], mcpServers: [] });

      expect(errors).toEqual(["Node 'plan' is not awaiting role configuration."]);
      expect(readRoleModelSelection(workspaceRoot, ref, 'planner')).toBeNull();
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('rejects role configuration that references an unknown model', () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-model-selection-unknown-'));
    try {
      configureSettingsStore(workspaceRoot);
      seedTestMultiModelSettings(path.join(workspaceRoot, '.a-society'), [
        { id: 'model-a', providerBaseUrl: 'http://127.0.0.1:1/v1', active: true },
        { id: 'model-b', providerBaseUrl: 'http://127.0.0.1:1/v1' },
      ]);
      SessionStore.init(workspaceRoot);

      const ref = { projectNamespace: 'test-project', flowId: 'test-flow' };
      const flow = makeFlowRun(workspaceRoot, {
        awaitingHumanNodes: {
          plan: { role: 'planner', reason: AWAITING_HUMAN_REASON.ROLE_CONFIGURATION },
        },
      });
      SessionStore.saveFlowRun(flow, ref, workspaceRoot);

      const { commands, errors } = createCommands(workspaceRoot, () => flow);
      commands.handleRoleConfiguration(ref, 'plan', { modelConfigId: 'missing-model', skills: [], mcpServers: [] });

      expect(errors).toEqual(['The selected model is not usable. Complete its configuration in Settings and select it again.']);
      expect(readRoleModelSelection(workspaceRoot, ref, 'planner')).toBeNull();
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('persists selected skills and clears the pre-selection system prompt', () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-role-config-skills-'));
    try {
      configureSettingsStore(workspaceRoot);
      seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
      writeSkill(workspaceRoot, 'review-writing');
      SessionStore.init(workspaceRoot);

      const ref = { projectNamespace: 'test-project', flowId: 'test-flow' };
      const flow = makeFlowRun(workspaceRoot, {
        awaitingHumanNodes: {
          plan: { role: 'planner', reason: AWAITING_HUMAN_REASON.ROLE_CONFIGURATION },
        },
      });
      SessionStore.saveFlowRun(flow, ref, workspaceRoot);
      SessionStore.saveRoleSession({
        roleName: 'planner',
        logicalSessionId: 'test-flow__planner',
        transcriptHistory: [{ role: 'user', content: 'Node entry.' }],
        isActive: true,
        currentNodeId: 'plan',
        systemPrompt: 'Pre-selection prompt without skills.',
      }, ref, workspaceRoot);

      const { commands, errors, historicalEvents } = createCommands(workspaceRoot, () => flow);
      commands.handleRoleConfiguration(ref, 'plan', {
        skills: ['review-writing'],
        mcpServers: [],
      });

      expect(errors).toEqual([]);
      expect(readCapabilitySelection(workspaceRoot, ref, 'planner')?.skills).toEqual(['review-writing']);
      expect(SessionStore.loadRoleSession('planner', ref, workspaceRoot)?.systemPrompt).toBeUndefined();
      expect(historicalEvents).toEqual([expect.objectContaining({
        kind: 'role.configured',
        nodeId: 'plan',
        role: 'planner',
        skillNames: ['review-writing'],
      })]);
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('rejects role configuration with an unknown skill', () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-role-config-unknown-skill-'));
    try {
      configureSettingsStore(workspaceRoot);
      seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
      writeSkill(workspaceRoot, 'review-writing');
      SessionStore.init(workspaceRoot);

      const ref = { projectNamespace: 'test-project', flowId: 'test-flow' };
      const flow = makeFlowRun(workspaceRoot, {
        awaitingHumanNodes: {
          plan: { role: 'planner', reason: AWAITING_HUMAN_REASON.ROLE_CONFIGURATION },
        },
      });
      SessionStore.saveFlowRun(flow, ref, workspaceRoot);

      const { commands, errors } = createCommands(workspaceRoot, () => flow);
      commands.handleRoleConfiguration(ref, 'plan', {
        modelConfigId: 'test-model',
        skills: ['missing-skill'],
        mcpServers: [],
      });

      expect(errors).toEqual(['Unknown skill "missing-skill". Refresh Settings and try again.']);
      expect(readCapabilitySelection(workspaceRoot, ref, 'planner')).toBeNull();
      expect(readRoleModelSelection(workspaceRoot, ref, 'planner')).toBeNull();
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('refuses a text reply targeted at a node awaiting role configuration', async () => {
    const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-model-selection-text-'));
    try {
      configureSettingsStore(workspaceRoot);
      seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
      SessionStore.init(workspaceRoot);

      const ref = { projectNamespace: 'test-project', flowId: 'test-flow' };
      const flow = makeFlowRun(workspaceRoot, {
        awaitingHumanNodes: {
          plan: { role: 'planner', reason: AWAITING_HUMAN_REASON.ROLE_CONFIGURATION },
          review: { role: 'owner', reason: AWAITING_HUMAN_REASON.PROMPT_HUMAN },
        },
      });
      SessionStore.saveFlowRun(flow, ref, workspaceRoot);

      const { commands, errors } = createCommands(workspaceRoot, () => flow);
      await commands.handleHumanInput(ref, 'use the cheap one', { nodeId: 'plan' });

      const latest = SessionStore.loadFlowRun(ref, workspaceRoot)!;
      expect(latest.pendingHumanInputs).toEqual({});
      expect(errors).toEqual(["Node 'plan' is awaiting role configuration, not a text reply."]);
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });
});
