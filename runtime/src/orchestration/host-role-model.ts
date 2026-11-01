import fs from 'node:fs';
import path from 'node:path';
import type { FlowRef } from '../common/types.js';
import { isHostAgentId, type HostAgentId, type HostModelChoice, type HostModelOption } from '../../shared/settings.js';
import { parseRoleIdentity } from '../../shared/role-id.js';
import { getProjectRoleDefaults } from '../projects/project-settings-store.js';
import { getAutomationSettings } from '../settings/settings-store.js';
import { getHostAgent } from '../providers/host-agents/registry.js';
import type { HostAgentAdapter } from '../providers/host-agents/types.js';
import { getRoleStateFilePath } from './state-paths.js';

/**
 * Agent-mode model/effort per role instance. The single home of the resolution rule:
 * project role default → per-flow selection → (automation auto ⇒ host default) → operator gate.
 */

export interface HostModelSelection extends HostModelChoice {
  hostAgentId: HostAgentId;
  selectedAt: string;
}

export type HostModelGate =
  | { kind: 'ready'; choice: HostModelChoice }
  | { kind: 'selection-required'; models: HostModelOption[]; effortLevels: string[] };

const HOST_DEFAULT_CHOICE: HostModelChoice = { model: null, effort: null };

function hostModelSelectionPath(ref: FlowRef, roleInstanceId: string): string {
  return getRoleStateFilePath(ref, roleInstanceId, 'host-model.json');
}

function nullableString(value: unknown): string | null | undefined {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

export function readHostModelSelection(ref: FlowRef, roleInstanceId: string): HostModelSelection | null {
  const selectionPath = hostModelSelectionPath(ref, roleInstanceId);
  if (!fs.existsSync(selectionPath)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(selectionPath, 'utf8')) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== 'object' || !isHostAgentId(parsed.hostAgentId)) return null;
    const model = nullableString(parsed.model);
    const effort = nullableString(parsed.effort);
    if (model === undefined || effort === undefined) return null;
    return {
      hostAgentId: parsed.hostAgentId,
      model,
      effort,
      selectedAt: typeof parsed.selectedAt === 'string' ? parsed.selectedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveHostModelSelection(ref: FlowRef, roleInstanceId: string, selection: HostModelSelection): void {
  const selectionPath = hostModelSelectionPath(ref, roleInstanceId);
  fs.mkdirSync(path.dirname(selectionPath), { recursive: true });
  fs.writeFileSync(selectionPath, JSON.stringify(selection, null, 2));
}

/** Model null or declared by the adapter; effort null or declared by the adapter. */
export function isValidHostChoice(adapter: HostAgentAdapter, choice: HostModelChoice): boolean {
  const modelOk = choice.model === null || adapter.models.some((option) => option.id === choice.model);
  const effortOk = choice.effort === null || adapter.effortLevels.includes(choice.effort);
  return modelOk && effortOk;
}

function validSelection(ref: FlowRef, roleInstanceId: string, adapter: HostAgentAdapter): HostModelChoice | null {
  const selection = readHostModelSelection(ref, roleInstanceId);
  if (!selection || selection.hostAgentId !== adapter.id) return null;
  const choice = { model: selection.model, effort: selection.effort };
  return isValidHostChoice(adapter, choice) ? choice : null;
}

/**
 * Activation gate for a role instance on a host flow. A stale selection (another host,
 * or a model/effort the adapter no longer declares) re-enters the gate. A host with
 * nothing to choose never gates.
 */
export function resolveHostModelGate(ref: FlowRef, roleInstanceId: string, agentId: HostAgentId): HostModelGate {
  const adapter = getHostAgent(agentId);
  const selected = validSelection(ref, roleInstanceId, adapter);
  if (selected) return { kind: 'ready', choice: selected };
  if (adapter.models.length === 0 && adapter.effortLevels.length === 0) {
    return { kind: 'ready', choice: { ...HOST_DEFAULT_CHOICE } };
  }
  return { kind: 'selection-required', models: [...adapter.models], effortLevels: [...adapter.effortLevels] };
}

/** Non-gating resolution for turns that must proceed regardless of gate state (backward pass, feedback). */
export function resolveHostRoleModel(ref: FlowRef, roleInstanceId: string, agentId: HostAgentId): HostModelChoice {
  return validSelection(ref, roleInstanceId, getHostAgent(agentId)) ?? { ...HOST_DEFAULT_CHOICE };
}

/**
 * Applies the resolution order before the gate runs:
 *   1. a valid project role default wins and is persisted, even over an earlier per-flow selection;
 *   2. otherwise a valid per-flow selection stands;
 *   3. otherwise model automation `auto` persists the host default;
 *   4. otherwise nothing is persisted, so the gate prompts.
 * An invalid project value (unknown model or effort) is ignored and resolution falls through.
 */
export function applyHostRoleDefaults(
  projectNamespace: string,
  ref: FlowRef,
  roleInstanceId: string,
  agentId: HostAgentId
): void {
  const adapter = getHostAgent(agentId);
  const save = (choice: HostModelChoice): void => {
    saveHostModelSelection(ref, roleInstanceId, { hostAgentId: agentId, ...choice, selectedAt: new Date().toISOString() });
  };

  const baseRoleId = parseRoleIdentity(roleInstanceId).baseRoleId;
  const projectChoice = getProjectRoleDefaults(projectNamespace, baseRoleId)?.hostModels?.[agentId];
  const existing = validSelection(ref, roleInstanceId, adapter);
  if (projectChoice && isValidHostChoice(adapter, projectChoice)) {
    if (existing?.model !== projectChoice.model || existing?.effort !== projectChoice.effort) {
      save({ model: projectChoice.model, effort: projectChoice.effort });
    }
    return;
  }
  if (existing) return;

  // The API auto-selection turn needs an API model, which agent mode does not require,
  // so `auto` resolves deterministically to the host default.
  if (getAutomationSettings().models === 'auto') {
    save({ ...HOST_DEFAULT_CHOICE });
  }
}

/** `<model display> · effort <level>`; the effort part is omitted when effort is the host default. */
export function formatHostModelLabel(adapter: Pick<HostAgentAdapter, 'models'>, choice: HostModelChoice): string {
  const option = choice.model === null ? undefined : adapter.models.find((candidate) => candidate.id === choice.model);
  const modelDisplay = choice.model === null ? 'host default' : option?.displayName ?? choice.model;
  return choice.effort ? `${modelDisplay} · effort ${choice.effort}` : modelDisplay;
}
