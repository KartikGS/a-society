import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GatewayTurnResult, OperatorEvent, OperatorRenderSink, RuntimeMessageParam } from '../../src/common/types.js';
import { autoResolveRoleConfiguration } from '../../src/orchestration/auto-capability-selection.js';
import { readCapabilitySelection, resolveCapabilityGate } from '../../src/orchestration/capability-selection.js';
import { readRoleModelSelection } from '../../src/orchestration/role-model.js';
import { createMcpServer, updateAutomationSettings } from '../../src/settings/settings-store.js';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { LLMGateway } from '../../src/providers/llm.js';
import { seedTestModelSettings, seedTestMultiModelSettings } from '../integration/settings-test-utils.js';

const REF = { projectNamespace: 'project', flowId: 'flow' };
const tempDirs = new Set<string>();

function makeWorkspace(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'auto-capability-'));
  tempDirs.add(dir);
  return dir;
}

function writeSkill(workspaceRoot: string, name: string, description: string): void {
  const dir = path.join(workspaceRoot, '.a-society', 'skills', name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\nname: ${name}\ndescription: ${description}\n---\n\nBody.\n`, 'utf8');
}

function recordingRenderer(events: OperatorEvent[]): OperatorRenderSink {
  return {
    emit(event) { events.push(event); },
    requestSent() {},
    receivingResponse() {},
    responseEnd() {},
    sendError() {},
  };
}

function mockTurn(text: string): void {
  vi.spyOn(LLMGateway.prototype, 'executeTurn').mockImplementation(async (): Promise<GatewayTurnResult> => ({ text }));
}

function baseOptions(events: OperatorEvent[], role = 'owner') {
  return {
    ref: REF,
    roleInstanceId: role,
    nodeId: 'owner-review',
    workflowNodes: [],
    renderer: recordingRenderer(events),
    signal: new AbortController().signal,
  };
}

describe('auto capability selection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    for (const dir of tempDirs) fs.rmSync(dir, { recursive: true, force: true });
    tempDirs.clear();
    clearWorkspaceRoot();
  });

  it('skips the turn entirely when no dimension is in auto mode', async () => {
    const workspaceRoot = makeWorkspace();
    seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
    writeSkill(workspaceRoot, 'review-writing', 'Write reviews.');
    setWorkspaceRoot(workspaceRoot);
    const turnSpy = vi.spyOn(LLMGateway.prototype, 'executeTurn');
    const events: OperatorEvent[] = [];

    const result = await autoResolveRoleConfiguration(baseOptions(events));

    expect(result).toEqual({ ran: false, fellBackDimensions: [], skillsResolved: false });
    expect(turnSpy).not.toHaveBeenCalled();
    expect(readCapabilitySelection(REF, 'owner')).toBeNull();
    expect(events).toEqual([]);
  });

  it('auto-selects skills and persists them as decided', async () => {
    const workspaceRoot = makeWorkspace();
    seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
    writeSkill(workspaceRoot, 'review-writing', 'Write reviews.');
    writeSkill(workspaceRoot, 'doc-editing', 'Edit docs.');
    setWorkspaceRoot(workspaceRoot);
    updateAutomationSettings({ skills: 'auto' });
    mockTurn(JSON.stringify({ skills: ['review-writing'] }));
    const events: OperatorEvent[] = [];

    const result = await autoResolveRoleConfiguration(baseOptions(events));

    expect(result).toEqual({ ran: true, fellBackDimensions: [], skillsResolved: true });
    const selection = readCapabilitySelection(REF, 'owner');
    expect(selection?.skills).toEqual(['review-writing']);
    expect(selection?.skillsDecided).toBe(true);
    expect(selection?.mcpDecided).toBe(false);
    // Pure-auto: status-only strip plus a final-config bubble carrying the selections.
    expect(events.map((event) => event.kind)).toEqual(['role.auto_selection_started', 'role.auto_configured', 'role.configured']);
    expect(events.find((event) => event.kind === 'role.configured')).toMatchObject({ skillNames: ['review-writing'] });
  });

  it('briefs the selector with the workflow nodes assigned to the role', async () => {
    const workspaceRoot = makeWorkspace();
    seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
    writeSkill(workspaceRoot, 'review-writing', 'Write reviews.');
    setWorkspaceRoot(workspaceRoot);
    updateAutomationSettings({ skills: 'auto' });

    let userPrompt = '';
    vi.spyOn(LLMGateway.prototype, 'executeTurn').mockImplementation(async (
      _systemPrompt: string,
      messages: RuntimeMessageParam[]
    ): Promise<GatewayTurnResult> => {
      userPrompt = (messages[0] as { content: string }).content;
      return { text: JSON.stringify({ skills: ['review-writing'] }) };
    });

    const workflowNodes = [
      { id: 'owner-intake', role: 'owner', work: ['Draft the intake brief'] },
      { id: 'reviewer-pass', role: 'reviewer', work: ['Review the brief'] },
    ];
    await autoResolveRoleConfiguration({ ...baseOptions([], 'owner'), workflowNodes });

    expect(userPrompt).toContain('owner-intake');
    expect(userPrompt).toContain('Draft the intake brief');
    // Nodes belonging to other roles are not included.
    expect(userPrompt).not.toContain('reviewer-pass');
  });

  it('auto-selects the model when more than one is configured', async () => {
    const workspaceRoot = makeWorkspace();
    seedTestMultiModelSettings(path.join(workspaceRoot, '.a-society'), [
      { id: 'model-a', displayName: 'Model A', providerBaseUrl: 'http://127.0.0.1:1/v1', active: true },
      { id: 'model-b', displayName: 'Model B', providerBaseUrl: 'http://127.0.0.1:1/v1' },
    ]);
    setWorkspaceRoot(workspaceRoot);
    updateAutomationSettings({ models: 'auto' });
    mockTurn(JSON.stringify({ modelConfigId: 'model-b' }));

    const result = await autoResolveRoleConfiguration(baseOptions([]));

    expect(result.ran).toBe(true);
    expect(result.skillsResolved).toBe(false);
    expect(readRoleModelSelection(REF, 'owner')?.modelConfigId).toBe('model-b');
  });

  it('re-prompts to correct malformed output, then succeeds', async () => {
    const workspaceRoot = makeWorkspace();
    seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
    writeSkill(workspaceRoot, 'review-writing', 'Write reviews.');
    setWorkspaceRoot(workspaceRoot);
    updateAutomationSettings({ skills: 'auto' });

    let attempt = 0;
    vi.spyOn(LLMGateway.prototype, 'executeTurn').mockImplementation(async (
      _systemPrompt: string,
      messages: RuntimeMessageParam[]
    ): Promise<GatewayTurnResult> => {
      attempt += 1;
      if (attempt === 1) return { text: 'sorry, no JSON here' };
      // The correction round must include the prior reply plus a correction message.
      expect(messages.length).toBeGreaterThanOrEqual(3);
      return { text: JSON.stringify({ skills: ['review-writing'] }) };
    });

    const result = await autoResolveRoleConfiguration(baseOptions([]));

    expect(attempt).toBe(2);
    expect(result.fellBackDimensions).toEqual([]);
    expect(readCapabilitySelection(REF, 'owner')?.skills).toEqual(['review-writing']);
  });

  it('falls back to manual on a transport error, leaving the dimension undecided', async () => {
    const workspaceRoot = makeWorkspace();
    seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
    writeSkill(workspaceRoot, 'review-writing', 'Write reviews.');
    setWorkspaceRoot(workspaceRoot);
    updateAutomationSettings({ skills: 'auto' });
    vi.spyOn(LLMGateway.prototype, 'executeTurn').mockRejectedValue(new Error('network down'));
    const events: OperatorEvent[] = [];

    const result = await autoResolveRoleConfiguration(baseOptions(events));

    expect(result.fellBackDimensions).toEqual(['skills']);
    expect(result.skillsResolved).toBe(false);
    expect(readCapabilitySelection(REF, 'owner')).toBeNull();
    expect(events.some((event) => event.kind === 'role.auto_selection_fell_back')).toBe(true);
  });

  it('drops unknown skills the model returns', async () => {
    const workspaceRoot = makeWorkspace();
    seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
    writeSkill(workspaceRoot, 'review-writing', 'Write reviews.');
    setWorkspaceRoot(workspaceRoot);
    updateAutomationSettings({ skills: 'auto' });
    mockTurn(JSON.stringify({ skills: ['review-writing', 'does-not-exist'] }));

    await autoResolveRoleConfiguration(baseOptions([]));

    expect(readCapabilitySelection(REF, 'owner')?.skills).toEqual(['review-writing']);
  });

  it('resolves only the auto dimension in mixed mode, leaving the manual one pending', async () => {
    const workspaceRoot = makeWorkspace();
    seedTestModelSettings(path.join(workspaceRoot, '.a-society'), { providerBaseUrl: 'http://127.0.0.1:1/v1' });
    writeSkill(workspaceRoot, 'review-writing', 'Write reviews.');
    setWorkspaceRoot(workspaceRoot);
    createMcpServer({ name: 'my-server', transport: 'http', url: 'http://127.0.0.1:1/mcp', toolNames: ['do_thing'] });
    updateAutomationSettings({ skills: 'auto', mcpServers: 'manual' });
    mockTurn(JSON.stringify({ skills: ['review-writing'] }));
    const events: OperatorEvent[] = [];

    const result = await autoResolveRoleConfiguration(baseOptions(events));

    expect(result.skillsResolved).toBe(true);
    const selection = readCapabilitySelection(REF, 'owner');
    expect(selection?.skillsDecided).toBe(true);
    expect(selection?.mcpDecided).toBe(false);

    const gate = resolveCapabilityGate(REF, 'owner');
    expect(gate.kind).toBe('selection-required');
    if (gate.kind === 'selection-required') {
      expect(gate.pendingSkills).toBe(false);
      expect(gate.pendingMcp).toBe(true);
    }

    // A manual selection (MCP) still follows, so the auto strip carries no details —
    // the full configuration appears in the post-selection result bubble instead.
    expect(events.find((event) => event.kind === 'role.auto_configured'))
      .toEqual({ kind: 'role.auto_configured', nodeId: 'owner-review', role: 'owner' });
  });
});
