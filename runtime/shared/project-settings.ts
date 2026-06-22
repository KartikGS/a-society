import {
  CONSENT_MODE,
  CONSENT_MODES,
  IMPROVEMENT_CHOICE_MODES,
} from './protocol-constants.js';
import type {
  ProtocolConsentMode,
  ProtocolImprovementChoiceMode,
} from './protocol-constants.js';
import { normalizeStringList } from './strings.js';

/**
 * Per-role project defaults. A field is present only when the operator has
 * configured a project-level default for that dimension; an absent field means
 * "decide per flow" and falls back to the existing automation/manual gate.
 */
export interface ProjectRoleSettings {
  /** Global model config id; absent = use the per-flow model gate. */
  modelConfigId?: string;
  /** Skill names; absent = decide per flow. An empty array means "no skills". */
  skills?: string[];
  /** MCP server ids; absent = decide per flow. An empty array means "no MCP servers". */
  mcpServers?: string[];
}

export interface ProjectPermissionSettings {
  mode: ProtocolConsentMode;
  /** Bash command strings pre-approved for the project (operator-editable). */
  allowedCommands: string[];
  /** MCP tool names pre-approved for the project (maintained by consent write-back). */
  allowedTools: string[];
}

export interface ProjectSettings {
  /** Master switch: when false, the project behaves exactly as the per-flow defaults. */
  enabled: boolean;
  /** Per-role defaults keyed by base role id (e.g. "owner", "technical-architect"). */
  roles: Record<string, ProjectRoleSettings>;
  permission: ProjectPermissionSettings;
  /** Pre-decided improvement mode; absent = use the per-flow improvement-choice gate. */
  improvement?: ProtocolImprovementChoiceMode;
  /** Pre-decided feedback consent; absent = use the per-flow feedback-consent gate. */
  feedback?: boolean;
}

export function defaultProjectPermissionSettings(): ProjectPermissionSettings {
  return { mode: CONSENT_MODE.NO_ACCESS, allowedCommands: [], allowedTools: [] };
}

export function defaultProjectSettings(): ProjectSettings {
  return {
    enabled: false,
    roles: {},
    permission: defaultProjectPermissionSettings(),
  };
}

function isConsentMode(value: unknown): value is ProtocolConsentMode {
  return typeof value === 'string' && (CONSENT_MODES as readonly string[]).includes(value);
}

function isImprovementMode(value: unknown): value is ProtocolImprovementChoiceMode {
  return typeof value === 'string' && (IMPROVEMENT_CHOICE_MODES as readonly string[]).includes(value);
}

export function normalizeProjectRoleSettings(value: unknown): ProjectRoleSettings {
  const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const result: ProjectRoleSettings = {};
  if (typeof raw.modelConfigId === 'string' && raw.modelConfigId.trim() !== '') {
    result.modelConfigId = raw.modelConfigId.trim();
  }
  // A present (even empty) array means "configured"; absence means "decide per flow".
  if (Array.isArray(raw.skills)) {
    result.skills = normalizeStringList(raw.skills);
  }
  if (Array.isArray(raw.mcpServers)) {
    result.mcpServers = normalizeStringList(raw.mcpServers);
  }
  return result;
}

export function normalizeProjectSettings(raw: unknown): ProjectSettings {
  if (!raw || typeof raw !== 'object') return defaultProjectSettings();
  const source = raw as Record<string, unknown>;

  const roles: Record<string, ProjectRoleSettings> = {};
  if (source.roles && typeof source.roles === 'object') {
    for (const [roleId, value] of Object.entries(source.roles as Record<string, unknown>)) {
      const trimmedRoleId = roleId.trim();
      if (!trimmedRoleId) continue;
      roles[trimmedRoleId] = normalizeProjectRoleSettings(value);
    }
  }

  const permission = source.permission && typeof source.permission === 'object'
    ? source.permission as Record<string, unknown>
    : {};

  return {
    enabled: source.enabled === true,
    roles,
    permission: {
      mode: isConsentMode(permission.mode) ? permission.mode : CONSENT_MODE.NO_ACCESS,
      allowedCommands: normalizeStringList(permission.allowedCommands),
      allowedTools: normalizeStringList(permission.allowedTools),
    },
    ...(isImprovementMode(source.improvement) ? { improvement: source.improvement } : {}),
    ...(typeof source.feedback === 'boolean' ? { feedback: source.feedback } : {}),
  };
}
