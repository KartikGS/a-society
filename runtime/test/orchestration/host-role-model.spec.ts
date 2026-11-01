import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  applyHostRoleDefaults,
  formatHostModelLabel,
  readHostModelSelection,
  resolveHostModelGate,
  resolveHostRoleModel,
  saveHostModelSelection,
} from '../../src/orchestration/host-role-model.js';
import { getFlowDir } from '../../src/orchestration/state-paths.js';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { updateAutomationSettings } from '../../src/settings/settings-store.js';
import { saveProjectSettings } from '../../src/projects/project-settings-store.js';
import { getHostAgent } from '../../src/providers/host-agents/registry.js';
import { defaultProjectSettings, normalizeProjectRoleSettings } from '../../shared/project-settings.js';
import type { HostModelChoice } from '../../shared/settings.js';

const REF = { projectNamespace: 'host-model-project', flowId: 'host-model-flow' };
const AGENT = 'claude-code' as const;

let workspaceRoot: string;

function select(role: string, choice: HostModelChoice): void {
  saveHostModelSelection(REF, role, { hostAgentId: AGENT, ...choice, selectedAt: new Date().toISOString() });
}

function projectDefault(role: string, choice: HostModelChoice | undefined, enabled = true): void {
  saveProjectSettings(REF.projectNamespace, {
    ...defaultProjectSettings(),
    enabled,
    roles: choice ? { [role]: { hostModels: { [AGENT]: choice } } } : {},
  });
}

beforeEach(() => {
  workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'host-role-model-'));
  setWorkspaceRoot(workspaceRoot);
  updateAutomationSettings({ models: 'manual' });
});

afterEach(() => {
  clearWorkspaceRoot();
  fs.rmSync(workspaceRoot, { recursive: true, force: true });
});

describe('host model selection store', () => {
  it('round-trips a selection in the role state folder', () => {
    select('owner_2', { model: 'sonnet', effort: 'high' });
    expect(fs.existsSync(path.join(getFlowDir(REF), 'roles', 'owner_2', 'host-model.json'))).toBe(true);
    expect(readHostModelSelection(REF, 'owner_2')).toMatchObject({ hostAgentId: AGENT, model: 'sonnet', effort: 'high' });
    expect(readHostModelSelection(REF, 'owner')).toBeNull();
  });
});

describe('resolveHostModelGate', () => {
  it('requires a selection when nothing is persisted, offering the adapter models and effort levels', () => {
    const gate = resolveHostModelGate(REF, 'owner', AGENT);
    expect(gate).toEqual({
      kind: 'selection-required',
      models: [...getHostAgent(AGENT).models],
      effortLevels: [...getHostAgent(AGENT).effortLevels],
    });
  });

  it('is ready with a valid persisted selection, including host default', () => {
    select('owner', { model: null, effort: null });
    expect(resolveHostModelGate(REF, 'owner', AGENT)).toEqual({ kind: 'ready', choice: { model: null, effort: null } });
    select('owner', { model: null, effort: 'low' });
    expect(resolveHostModelGate(REF, 'owner', AGENT)).toEqual({ kind: 'ready', choice: { model: null, effort: 'low' } });
  });

  it('re-enters the gate for a stale selection', () => {
    select('owner', { model: 'gpt-9', effort: null });
    expect(resolveHostModelGate(REF, 'owner', AGENT).kind).toBe('selection-required');
    select('owner', { model: 'opus', effort: 'ludicrous' });
    expect(resolveHostModelGate(REF, 'owner', AGENT).kind).toBe('selection-required');
  });
});

describe('applyHostRoleDefaults resolution order', () => {
  it('a project default wins over a per-flow selection', () => {
    select('owner', { model: 'sonnet', effort: null });
    projectDefault('owner', { model: 'opus', effort: 'max' });
    applyHostRoleDefaults(REF.projectNamespace, REF, 'owner', AGENT);
    expect(resolveHostModelGate(REF, 'owner', AGENT)).toEqual({ kind: 'ready', choice: { model: 'opus', effort: 'max' } });
  });

  it('keeps the per-flow selection when project settings are disabled', () => {
    select('owner', { model: 'sonnet', effort: null });
    projectDefault('owner', { model: 'opus', effort: 'max' }, false);
    applyHostRoleDefaults(REF.projectNamespace, REF, 'owner', AGENT);
    expect(resolveHostModelGate(REF, 'owner', AGENT)).toEqual({ kind: 'ready', choice: { model: 'sonnet', effort: null } });
  });

  it('applies the project default to an instance role through its base role', () => {
    projectDefault('owner', { model: 'haiku', effort: null });
    applyHostRoleDefaults(REF.projectNamespace, REF, 'owner_2', AGENT);
    expect(resolveHostRoleModel(REF, 'owner_2', AGENT)).toEqual({ model: 'haiku', effort: null });
  });

  it('leaves the gate to prompt when project settings are disabled and automation is manual', () => {
    projectDefault('owner', { model: 'opus', effort: null }, false);
    applyHostRoleDefaults(REF.projectNamespace, REF, 'owner', AGENT);
    expect(resolveHostModelGate(REF, 'owner', AGENT).kind).toBe('selection-required');
  });

  it('resolves automation auto to the host default', () => {
    updateAutomationSettings({ models: 'auto' });
    applyHostRoleDefaults(REF.projectNamespace, REF, 'owner', AGENT);
    expect(resolveHostModelGate(REF, 'owner', AGENT)).toEqual({ kind: 'ready', choice: { model: null, effort: null } });
  });

  it('ignores an unknown project model and falls through', () => {
    projectDefault('owner', { model: 'gpt-9', effort: null });
    applyHostRoleDefaults(REF.projectNamespace, REF, 'owner', AGENT);
    expect(resolveHostModelGate(REF, 'owner', AGENT).kind).toBe('selection-required');

    updateAutomationSettings({ models: 'auto' });
    applyHostRoleDefaults(REF.projectNamespace, REF, 'owner', AGENT);
    expect(resolveHostRoleModel(REF, 'owner', AGENT)).toEqual({ model: null, effort: null });
  });

  it('does not overwrite a valid per-flow selection with the automation default', () => {
    updateAutomationSettings({ models: 'auto' });
    select('owner', { model: 'sonnet', effort: 'low' });
    applyHostRoleDefaults(REF.projectNamespace, REF, 'owner', AGENT);
    expect(resolveHostRoleModel(REF, 'owner', AGENT)).toEqual({ model: 'sonnet', effort: 'low' });
  });
});

describe('resolveHostRoleModel', () => {
  it('falls back to the host default without a valid selection', () => {
    expect(resolveHostRoleModel(REF, 'owner', AGENT)).toEqual({ model: null, effort: null });
    select('owner', { model: 'gpt-9', effort: null });
    expect(resolveHostRoleModel(REF, 'owner', AGENT)).toEqual({ model: null, effort: null });
  });
});

describe('formatHostModelLabel', () => {
  const adapter = getHostAgent(AGENT);
  it('uses the display name and appends the effort when set', () => {
    expect(formatHostModelLabel(adapter, { model: null, effort: null })).toBe('host default');
    expect(formatHostModelLabel(adapter, { model: 'opus', effort: null })).toBe('Opus');
    expect(formatHostModelLabel(adapter, { model: 'sonnet', effort: 'high' })).toBe('Sonnet · effort high');
    expect(formatHostModelLabel(adapter, { model: null, effort: 'low' })).toBe('host default · effort low');
  });
});

describe('normalizeProjectRoleSettings hostModels', () => {
  it('keeps valid host ids, normalizes a missing effort to null, and preserves modelConfigId', () => {
    expect(normalizeProjectRoleSettings({
      modelConfigId: 'api-model',
      hostModels: { 'claude-code': { model: ' opus ' }, codex: { model: 'x', effort: null } },
    })).toEqual({ modelConfigId: 'api-model', hostModels: { 'claude-code': { model: 'opus', effort: null } } });
  });

  it('omits hostModels when no valid entry remains', () => {
    expect(normalizeProjectRoleSettings({ hostModels: { codex: { model: 'x' } } })).toEqual({});
    expect(normalizeProjectRoleSettings({ hostModels: { 'claude-code': { model: 42 } } })).toEqual({});
    expect(normalizeProjectRoleSettings({ hostModels: [] })).toEqual({});
  });

  it('keeps an explicit host default', () => {
    expect(normalizeProjectRoleSettings({ hostModels: { 'claude-code': { model: null, effort: 'high' } } }))
      .toEqual({ hostModels: { 'claude-code': { model: null, effort: 'high' } } });
  });
});
