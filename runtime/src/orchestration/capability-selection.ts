import fs from 'node:fs';
import path from 'node:path';
import type { FlowRef } from '../common/types.js';
import { parseRoleIdentity } from '../common/role-id.js';
import { listSkills, type SkillSummary } from '../framework-services/skills.js';
import { getFlowDir } from './state-paths.js';

export interface CapabilitySelection {
  skills: string[];
  mcpServers: string[];
  selectedAt: string;
}

export interface McpServerSummary {
  id: string;
  displayName: string;
  description?: string;
}

export type CapabilityGate =
  | { kind: 'ready' }
  | { kind: 'selection-required'; skills: SkillSummary[]; mcpServers: McpServerSummary[] };

function capabilitySelectionPath(workspaceRoot: string, ref: FlowRef, roleInstanceId: string): string {
  const roleKey = parseRoleIdentity(roleInstanceId).instanceRoleId;
  return path.join(getFlowDir(workspaceRoot, ref), 'roles', roleKey, 'capabilities.json');
}

function capabilitySelectionExists(workspaceRoot: string, ref: FlowRef, roleInstanceId: string): boolean {
  return fs.existsSync(capabilitySelectionPath(workspaceRoot, ref, roleInstanceId));
}

export function listMcpServers(): McpServerSummary[] {
  return [];
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '')
    .map((entry) => entry.trim())
    .filter((entry, index, entries) => entries.indexOf(entry) === index);
}

export function readCapabilitySelection(
  workspaceRoot: string,
  ref: FlowRef,
  roleInstanceId: string
): CapabilitySelection | null {
  const selectionPath = capabilitySelectionPath(workspaceRoot, ref, roleInstanceId);
  if (!fs.existsSync(selectionPath)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(selectionPath, 'utf8')) as Partial<CapabilitySelection> | null;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      skills: normalizeStringArray(parsed.skills),
      mcpServers: normalizeStringArray(parsed.mcpServers),
      selectedAt: typeof parsed.selectedAt === 'string' ? parsed.selectedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveCapabilitySelection(
  workspaceRoot: string,
  ref: FlowRef,
  roleInstanceId: string,
  selection: CapabilitySelection
): void {
  const selectionPath = capabilitySelectionPath(workspaceRoot, ref, roleInstanceId);
  fs.mkdirSync(path.dirname(selectionPath), { recursive: true });
  fs.writeFileSync(selectionPath, JSON.stringify({
    skills: normalizeStringArray(selection.skills).sort((a, b) => a.localeCompare(b)),
    mcpServers: normalizeStringArray(selection.mcpServers).sort((a, b) => a.localeCompare(b)),
    selectedAt: selection.selectedAt,
  }, null, 2));
}

export function resolveCapabilityGate(workspaceRoot: string, ref: FlowRef, roleInstanceId: string): CapabilityGate {
  if (capabilitySelectionExists(workspaceRoot, ref, roleInstanceId)) {
    return { kind: 'ready' };
  }

  const skills = listSkills(workspaceRoot);
  const mcpServers = listMcpServers();
  if (skills.length > 0 || mcpServers.length > 0) {
    return { kind: 'selection-required', skills, mcpServers };
  }

  return { kind: 'ready' };
}

export function resolveEffectiveCapabilities(
  workspaceRoot: string,
  ref: FlowRef,
  roleInstanceId: string
): CapabilitySelection {
  const selection = readCapabilitySelection(workspaceRoot, ref, roleInstanceId);
  const validSkillNames = new Set(listSkills(workspaceRoot).map((skill) => skill.name));
  const validMcpServerIds = new Set(listMcpServers().map((server) => server.id));

  return {
    skills: (selection?.skills ?? [])
      .filter((name) => validSkillNames.has(name))
      .sort((a, b) => a.localeCompare(b)),
    mcpServers: (selection?.mcpServers ?? [])
      .filter((id) => validMcpServerIds.has(id))
      .sort((a, b) => a.localeCompare(b)),
    selectedAt: selection?.selectedAt ?? new Date(0).toISOString(),
  };
}

