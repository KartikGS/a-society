import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { clearWorkspaceRoot, setWorkspaceRoot } from '../../src/common/workspace.js';
import { CONSENT_MODE, IMPROVEMENT_CHOICE_MODE } from '../../shared/protocol-constants.js';
import {
  buildSeededConsentState,
  getProjectRoleDefaults,
  isProjectSettingsEnabled,
  loadProjectSettings,
  recordProjectConsentGrant,
  saveProjectSettings,
  setProjectPermissionMode,
} from '../../src/projects/project-settings-store.js';
import { defaultProjectSettings } from '../../shared/project-settings.js';

const tempDirs = new Set<string>();

function makeWorkspace(): string {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'a-society-project-settings-'));
  tempDirs.add(workspaceRoot);
  setWorkspaceRoot(workspaceRoot);
  return workspaceRoot;
}

describe('project-settings-store', () => {
  afterEach(() => {
    for (const dir of tempDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    tempDirs.clear();
    clearWorkspaceRoot();
  });

  it('returns disabled defaults when no settings file exists', () => {
    makeWorkspace();
    expect(loadProjectSettings('demo')).toEqual(defaultProjectSettings());
    expect(isProjectSettingsEnabled('demo')).toBe(false);
  });

  it('round-trips a saved configuration through normalization', () => {
    makeWorkspace();
    const saved = saveProjectSettings('demo', {
      ...defaultProjectSettings(),
      enabled: true,
      roles: { owner: { modelConfigId: 'm1', skills: ['code-review'], mcpServers: [] } },
      permission: { mode: CONSENT_MODE.PARTIAL_ACCESS, allowedCommands: ['npm test'], allowedTools: [] },
      improvement: IMPROVEMENT_CHOICE_MODE.GRAPH_BASED,
      feedback: false,
    });

    expect(saved.enabled).toBe(true);
    expect(getProjectRoleDefaults('demo', 'owner')).toEqual({ modelConfigId: 'm1', skills: ['code-review'], mcpServers: [] });
    // Reload from disk to confirm persistence.
    const reloaded = loadProjectSettings('demo');
    expect(reloaded.improvement).toBe(IMPROVEMENT_CHOICE_MODE.GRAPH_BASED);
    expect(reloaded.feedback).toBe(false);
    expect(reloaded.permission.allowedCommands).toEqual(['npm test']);
  });

  it('does not surface role defaults while disabled', () => {
    makeWorkspace();
    saveProjectSettings('demo', {
      ...defaultProjectSettings(),
      enabled: false,
      roles: { owner: { modelConfigId: 'm1' } },
    });
    expect(getProjectRoleDefaults('demo', 'owner')).toBeNull();
  });

  it('seeds consent state from permission settings only when enabled', () => {
    makeWorkspace();
    saveProjectSettings('demo', {
      ...defaultProjectSettings(),
      enabled: true,
      permission: { mode: CONSENT_MODE.PARTIAL_ACCESS, allowedCommands: ['git status'], allowedTools: ['mcp__svc__do'] },
    });

    const seeded = buildSeededConsentState('demo');
    expect(seeded?.mode).toBe(CONSENT_MODE.PARTIAL_ACCESS);
    expect(seeded?.bash.allowedCommands['git status']?.command).toBe('git status');
    expect(seeded?.mcp.allowedTools['mcp__svc__do']?.toolName).toBe('mcp__svc__do');

    saveProjectSettings('demo', { ...loadProjectSettings('demo'), enabled: false });
    expect(buildSeededConsentState('demo')).toBeUndefined();
  });

  it('writes back consent grants and mode changes only when enabled', () => {
    makeWorkspace();
    saveProjectSettings('demo', { ...defaultProjectSettings(), enabled: true });

    recordProjectConsentGrant('demo', { command: 'npm run build' });
    const afterGrant = loadProjectSettings('demo');
    expect(afterGrant.permission.allowedCommands).toContain('npm run build');
    expect(afterGrant.permission.mode).toBe(CONSENT_MODE.PARTIAL_ACCESS);

    setProjectPermissionMode('demo', CONSENT_MODE.FULL_ACCESS);
    expect(loadProjectSettings('demo').permission.mode).toBe(CONSENT_MODE.FULL_ACCESS);
  });

  it('ignores write-backs while disabled', () => {
    makeWorkspace();
    recordProjectConsentGrant('demo', { command: 'rm -rf /' });
    setProjectPermissionMode('demo', CONSENT_MODE.FULL_ACCESS);
    const settings = loadProjectSettings('demo');
    expect(settings.permission.allowedCommands).toEqual([]);
    expect(settings.permission.mode).toBe(CONSENT_MODE.NO_ACCESS);
  });
});
