import fs from 'node:fs';
import path from 'node:path';
import type { FlowRef } from '../common/types.js';
import {
  configureSettingsStore,
  getActiveModelWithKey,
  getModelWithKey,
  isUsableModelConfig,
  listModels,
  type ModelConfig,
  type ModelConfigWithKey,
} from '../settings/settings-store.js';
import { getRoleStateFilePath } from './state-paths.js';

export interface RoleModelSelection {
  modelConfigId: string;
  displayName: string;
  modelId: string;
  selectedAt: string;
}

export type RoleModelGate =
  | { kind: 'ready'; model: ModelConfigWithKey | null }
  | { kind: 'selection-required'; options: ModelConfig[] };

function roleModelSelectionPath(workspaceRoot: string, ref: FlowRef, roleInstanceId: string): string {
  return getRoleStateFilePath(workspaceRoot, ref, roleInstanceId, 'model.json');
}

export function readRoleModelSelection(
  workspaceRoot: string,
  ref: FlowRef,
  roleInstanceId: string
): RoleModelSelection | null {
  const selectionPath = roleModelSelectionPath(workspaceRoot, ref, roleInstanceId);
  if (!fs.existsSync(selectionPath)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(selectionPath, 'utf8')) as Partial<RoleModelSelection> | null;
    if (!parsed || typeof parsed.modelConfigId !== 'string' || parsed.modelConfigId.trim() === '') return null;
    return {
      modelConfigId: parsed.modelConfigId,
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : '',
      modelId: typeof parsed.modelId === 'string' ? parsed.modelId : '',
      selectedAt: typeof parsed.selectedAt === 'string' ? parsed.selectedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveRoleModelSelection(
  workspaceRoot: string,
  ref: FlowRef,
  roleInstanceId: string,
  selection: RoleModelSelection
): void {
  const selectionPath = roleModelSelectionPath(workspaceRoot, ref, roleInstanceId);
  fs.mkdirSync(path.dirname(selectionPath), { recursive: true });
  fs.writeFileSync(selectionPath, JSON.stringify(selection, null, 2));
}

function selectedUsableModel(workspaceRoot: string, ref: FlowRef, roleInstanceId: string): ModelConfigWithKey | null {
  const selection = readRoleModelSelection(workspaceRoot, ref, roleInstanceId);
  if (!selection) return null;
  const model = getModelWithKey(selection.modelConfigId);
  return isUsableModelConfig(model) ? model : null;
}

/**
 * Activation gate for a role instance. A selection is required only while the
 * operator has more than one configured model and this role instance has no
 * usable persisted selection for the flow. A stale selection (model deleted or
 * no longer usable) re-enters the gate instead of silently falling back.
 */
export function resolveRoleModelGate(workspaceRoot: string, ref: FlowRef, roleInstanceId: string): RoleModelGate {
  configureSettingsStore(workspaceRoot);
  const selected = selectedUsableModel(workspaceRoot, ref, roleInstanceId);
  if (selected) return { kind: 'ready', model: selected };

  const configuredModels = listModels();
  if (configuredModels.length > 1) {
    return { kind: 'selection-required', options: configuredModels };
  }
  return { kind: 'ready', model: getActiveModelWithKey() };
}

/**
 * Non-gating resolution for turns that must proceed regardless of selection
 * state (improvement phase, compaction): the role's selected model when
 * usable, otherwise the active model.
 */
export function resolveRoleModel(workspaceRoot: string, ref: FlowRef, roleInstanceId: string): ModelConfigWithKey | null {
  configureSettingsStore(workspaceRoot);
  return selectedUsableModel(workspaceRoot, ref, roleInstanceId) ?? getActiveModelWithKey();
}
