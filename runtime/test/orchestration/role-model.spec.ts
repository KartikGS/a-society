import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  readRoleModelSelection,
  resolveRoleModel,
  resolveRoleModelGate,
  saveRoleModelSelection,
} from '../../src/orchestration/role-model.js';
import { getFlowDir } from '../../src/orchestration/state-paths.js';
import { configureSettingsStore } from '../../src/settings/settings-store.js';
import { seedTestMultiModelSettings } from '../integration/settings-test-utils.js';

const REF = { projectNamespace: 'test-project', flowId: 'test-flow' };

function makeWorkspace(prefix: string): string {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  configureSettingsStore(workspaceRoot);
  return workspaceRoot;
}

function settingsDir(workspaceRoot: string): string {
  return path.join(workspaceRoot, '.a-society');
}

function selection(modelConfigId: string) {
  return {
    modelConfigId,
    displayName: modelConfigId,
    modelId: modelConfigId,
    selectedAt: new Date().toISOString(),
  };
}

describe('role model selection store', () => {
  afterEach(() => {
    configureSettingsStore(process.cwd());
  });

  it('round-trips a selection in the role state folder for the flow', () => {
    const workspaceRoot = makeWorkspace('role-model-roundtrip-');
    try {
      saveRoleModelSelection(workspaceRoot, REF, 'owner_2', selection('model-b'));

      const selectionPath = path.join(getFlowDir(workspaceRoot, REF), 'roles', 'owner_2', 'model.json');
      expect(fs.existsSync(selectionPath)).toBe(true);
      expect(readRoleModelSelection(workspaceRoot, REF, 'owner_2')?.modelConfigId).toBe('model-b');
      expect(readRoleModelSelection(workspaceRoot, REF, 'owner')).toBeNull();
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('returns null for a malformed selection file', () => {
    const workspaceRoot = makeWorkspace('role-model-malformed-');
    try {
      const roleDir = path.join(getFlowDir(workspaceRoot, REF), 'roles', 'owner');
      fs.mkdirSync(roleDir, { recursive: true });
      fs.writeFileSync(path.join(roleDir, 'model.json'), 'not json');

      expect(readRoleModelSelection(workspaceRoot, REF, 'owner')).toBeNull();
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('requires a selection when more than one model is configured and none is selected', () => {
    const workspaceRoot = makeWorkspace('role-model-gate-');
    try {
      seedTestMultiModelSettings(settingsDir(workspaceRoot), [
        { id: 'model-a', providerBaseUrl: 'http://127.0.0.1:1/v1', active: true },
        { id: 'model-b', providerBaseUrl: 'http://127.0.0.1:1/v1' },
      ]);

      const gate = resolveRoleModelGate(workspaceRoot, REF, 'owner');
      expect(gate.kind).toBe('selection-required');
      if (gate.kind === 'selection-required') {
        expect(gate.options.map((option) => option.id)).toEqual(['model-a', 'model-b']);
      }
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('is ready with the active model when only one model is configured', () => {
    const workspaceRoot = makeWorkspace('role-model-single-');
    try {
      seedTestMultiModelSettings(settingsDir(workspaceRoot), [
        { id: 'model-a', providerBaseUrl: 'http://127.0.0.1:1/v1', active: true },
      ]);

      const gate = resolveRoleModelGate(workspaceRoot, REF, 'owner');
      expect(gate.kind).toBe('ready');
      if (gate.kind === 'ready') {
        expect(gate.model?.id).toBe('model-a');
      }
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('is ready with the selected model once a usable selection exists', () => {
    const workspaceRoot = makeWorkspace('role-model-selected-');
    try {
      seedTestMultiModelSettings(settingsDir(workspaceRoot), [
        { id: 'model-a', providerBaseUrl: 'http://127.0.0.1:1/v1', active: true },
        { id: 'model-b', providerBaseUrl: 'http://127.0.0.1:1/v1', apiKey: 'model-b-key' },
      ]);
      saveRoleModelSelection(workspaceRoot, REF, 'owner', selection('model-b'));

      const gate = resolveRoleModelGate(workspaceRoot, REF, 'owner');
      expect(gate.kind).toBe('ready');
      if (gate.kind === 'ready') {
        expect(gate.model?.id).toBe('model-b');
        expect(gate.model?.apiKey).toBe('model-b-key');
      }
      expect(resolveRoleModel(workspaceRoot, REF, 'owner')?.id).toBe('model-b');
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('re-enters the gate when the selected model was deleted', () => {
    const workspaceRoot = makeWorkspace('role-model-stale-');
    try {
      seedTestMultiModelSettings(settingsDir(workspaceRoot), [
        { id: 'model-a', providerBaseUrl: 'http://127.0.0.1:1/v1', active: true },
        { id: 'model-b', providerBaseUrl: 'http://127.0.0.1:1/v1' },
      ]);
      saveRoleModelSelection(workspaceRoot, REF, 'owner', selection('model-deleted'));

      expect(resolveRoleModelGate(workspaceRoot, REF, 'owner').kind).toBe('selection-required');
      expect(resolveRoleModel(workspaceRoot, REF, 'owner')?.id).toBe('model-a');
    } finally {
      fs.rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });
});
