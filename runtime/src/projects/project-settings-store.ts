import fs from 'node:fs';
import path from 'node:path';
import { getProjectStateDir } from '../orchestration/state-paths.js';
import { defaultConsentState } from '../common/types.js';
import type { ConsentState } from '../common/types.js';
import { CONSENT_MODE } from '../../shared/protocol-constants.js';
import type { ProtocolConsentMode } from '../../shared/protocol-constants.js';
import {
  defaultProjectSettings,
  normalizeProjectSettings,
  type ProjectRoleSettings,
  type ProjectSettings,
} from '../../shared/project-settings.js';

export type {
  ProjectPermissionSettings,
  ProjectRoleSettings,
  ProjectSettings,
} from '../../shared/project-settings.js';

function projectSettingsPath(projectNamespace: string): string {
  return path.join(getProjectStateDir(projectNamespace), 'settings.json');
}

export function loadProjectSettings(projectNamespace: string): ProjectSettings {
  // An unsafe namespace is a programmer/security error and is allowed to throw
  // (matching saveProjectSettings); only a missing or corrupt file degrades to defaults.
  const settingsPath = projectSettingsPath(projectNamespace);
  if (!fs.existsSync(settingsPath)) return defaultProjectSettings();
  try {
    return normalizeProjectSettings(JSON.parse(fs.readFileSync(settingsPath, 'utf8')));
  } catch {
    return defaultProjectSettings();
  }
}

export function saveProjectSettings(projectNamespace: string, settings: ProjectSettings): ProjectSettings {
  const normalized = normalizeProjectSettings(settings);
  const dir = getProjectStateDir(projectNamespace);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(projectSettingsPath(projectNamespace), JSON.stringify(normalized, null, 2), 'utf8');
  return normalized;
}

export function isProjectSettingsEnabled(projectNamespace: string): boolean {
  return loadProjectSettings(projectNamespace).enabled;
}

/** Load project settings only when the feature is enabled; null otherwise. */
function loadEnabledProjectSettings(projectNamespace: string): ProjectSettings | null {
  const settings = loadProjectSettings(projectNamespace);
  return settings.enabled ? settings : null;
}

/**
 * Per-role project defaults for the given base role, or null when project
 * settings are disabled or the role has no configured defaults.
 */
export function getProjectRoleDefaults(
  projectNamespace: string,
  baseRoleId: string
): ProjectRoleSettings | null {
  return loadEnabledProjectSettings(projectNamespace)?.roles[baseRoleId] ?? null;
}

/**
 * Initial consent state seeded from project permission settings, or undefined
 * when project settings are disabled (the flow then uses the no-access default).
 */
export function buildSeededConsentState(projectNamespace: string): ConsentState | undefined {
  const settings = loadEnabledProjectSettings(projectNamespace);
  if (!settings) return undefined;

  const seededAt = new Date(0).toISOString();
  const state = defaultConsentState();
  state.mode = settings.permission.mode;
  for (const command of settings.permission.allowedCommands) {
    const key = command.trim();
    if (key) state.bash.allowedCommands[key] = { command: key, grantedAt: seededAt };
  }
  for (const toolName of settings.permission.allowedTools) {
    if (toolName) state.mcp.allowedTools[toolName] = { toolName, grantedAt: seededAt };
  }
  return state;
}

/** Persist a project-level permission mode change (no-op when disabled). */
export function setProjectPermissionMode(projectNamespace: string, mode: ProtocolConsentMode): void {
  const settings = loadEnabledProjectSettings(projectNamespace);
  if (!settings) return;
  if (settings.permission.mode === mode) return;
  settings.permission.mode = mode;
  saveProjectSettings(projectNamespace, settings);
}

/**
 * Record a project-level "allow for this project" grant (no-op when disabled).
 * Mirrors the flow consent gate: a bash command or MCP tool is added to the
 * project allowlist and the project mode is lifted to partial-access.
 */
export function recordProjectConsentGrant(
  projectNamespace: string,
  grant: { command?: string; toolName?: string }
): void {
  const settings = loadEnabledProjectSettings(projectNamespace);
  if (!settings) return;

  let changed = false;
  const command = grant.command?.trim();
  if (command && !settings.permission.allowedCommands.includes(command)) {
    settings.permission.allowedCommands.push(command);
    changed = true;
  }
  const toolName = grant.toolName?.trim();
  if (toolName && !settings.permission.allowedTools.includes(toolName)) {
    settings.permission.allowedTools.push(toolName);
    changed = true;
  }
  if (settings.permission.mode === CONSENT_MODE.NO_ACCESS) {
    settings.permission.mode = CONSENT_MODE.PARTIAL_ACCESS;
    changed = true;
  }
  if (changed) saveProjectSettings(projectNamespace, settings);
}
