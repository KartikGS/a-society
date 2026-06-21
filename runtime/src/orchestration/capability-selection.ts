import fs from 'node:fs';
import path from 'node:path';
import type { FlowRef } from '../common/types.js';
import { listSkills } from '../framework-services/skills.js';
import { listMcpServerSummaries } from '../settings/settings-store.js';
import { getRoleStateFilePath } from './state-paths.js';
import type { SkillSummary } from '../../shared/skills.js';
import type { McpServerSummary } from '../../shared/settings.js';

export type { McpServerSummary } from '../../shared/settings.js';

export interface CapabilitySelection {
  skills: string[];
  mcpServers: string[];
  /** Whether the skills dimension has been resolved (auto or manual) for this flow. */
  skillsDecided: boolean;
  /** Whether the MCP-servers dimension has been resolved (auto or manual) for this flow. */
  mcpDecided: boolean;
  selectedAt: string;
}

export type CapabilityDimension = 'skills' | 'mcpServers';

/** Resolved capabilities a role actually runs with (no provenance flags). */
export interface EffectiveCapabilities {
  skills: string[];
  mcpServers: string[];
  selectedAt: string;
}

export type CapabilityGate =
  | { kind: 'ready' }
  | {
      kind: 'selection-required';
      skills: SkillSummary[];
      mcpServers: McpServerSummary[];
      /** A configured-but-undecided dimension that still needs a selection. */
      pendingSkills: boolean;
      pendingMcp: boolean;
    };

function capabilitySelectionPath(ref: FlowRef, roleInstanceId: string): string {
  return getRoleStateFilePath(ref, roleInstanceId, 'capabilities.json');
}

export function listMcpServers(): McpServerSummary[] {
  return listMcpServerSummaries();
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '')
    .map((entry) => entry.trim())
    .filter((entry, index, entries) => entries.indexOf(entry) === index);
}

export function readCapabilitySelection(
  ref: FlowRef,
  roleInstanceId: string
): CapabilitySelection | null {
  const selectionPath = capabilitySelectionPath(ref, roleInstanceId);
  if (!fs.existsSync(selectionPath)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(selectionPath, 'utf8')) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      skills: normalizeStringArray(parsed.skills),
      mcpServers: normalizeStringArray(parsed.mcpServers),
      skillsDecided: parsed.skillsDecided === true,
      mcpDecided: parsed.mcpDecided === true,
      selectedAt: typeof parsed.selectedAt === 'string' ? parsed.selectedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

function writeCapabilitySelection(
  ref: FlowRef,
  roleInstanceId: string,
  selection: CapabilitySelection
): void {
  const selectionPath = capabilitySelectionPath(ref, roleInstanceId);
  fs.mkdirSync(path.dirname(selectionPath), { recursive: true });
  fs.writeFileSync(selectionPath, JSON.stringify({
    skills: normalizeStringArray(selection.skills).sort((a, b) => a.localeCompare(b)),
    mcpServers: normalizeStringArray(selection.mcpServers).sort((a, b) => a.localeCompare(b)),
    skillsDecided: selection.skillsDecided,
    mcpDecided: selection.mcpDecided,
    selectedAt: selection.selectedAt,
  }, null, 2));
}

/**
 * Persist a complete capability selection with both dimensions decided at once.
 */
export function saveCapabilitySelection(
  ref: FlowRef,
  roleInstanceId: string,
  selection: { skills: string[]; mcpServers: string[]; selectedAt: string }
): void {
  writeCapabilitySelection(ref, roleInstanceId, {
    skills: selection.skills,
    mcpServers: selection.mcpServers,
    skillsDecided: true,
    mcpDecided: true,
    selectedAt: selection.selectedAt,
  });
}

/**
 * Persist a single capability dimension, merging into any existing selection so
 * the other dimension's values and decided state are preserved. Marks the
 * written dimension as decided — used by auto-resolution and partial (mixed-mode)
 * manual submits.
 */
export function saveCapabilityDimension(
  ref: FlowRef,
  roleInstanceId: string,
  dimension: CapabilityDimension,
  values: string[],
  selectedAt: string = new Date().toISOString()
): void {
  const existing = readCapabilitySelection(ref, roleInstanceId);
  const base: CapabilitySelection = existing ?? {
    skills: [],
    mcpServers: [],
    skillsDecided: false,
    mcpDecided: false,
    selectedAt,
  };
  const next: CapabilitySelection = dimension === 'skills'
    ? { ...base, skills: values, skillsDecided: true, selectedAt }
    : { ...base, mcpServers: values, mcpDecided: true, selectedAt };
  writeCapabilitySelection(ref, roleInstanceId, next);
}

/**
 * Activation gate for skills + MCP servers, evaluated per dimension. A dimension
 * is satisfied when it has no configured candidates or has been decided (auto or
 * manual). The gate is `selection-required` only while a configured dimension is
 * still undecided, and reports which dimensions remain pending so the operator is
 * prompted for those alone (auto-resolved dimensions run before this gate).
 */
export function resolveCapabilityGate(ref: FlowRef, roleInstanceId: string): CapabilityGate {
  const skills = listSkills();
  const mcpServers = listMcpServers();
  const selection = readCapabilitySelection(ref, roleInstanceId);

  const pendingSkills = skills.length > 0 && !(selection?.skillsDecided ?? false);
  const pendingMcp = mcpServers.length > 0 && !(selection?.mcpDecided ?? false);

  if (pendingSkills || pendingMcp) {
    return { kind: 'selection-required', skills, mcpServers, pendingSkills, pendingMcp };
  }

  return { kind: 'ready' };
}

export function resolveEffectiveCapabilities(
  ref: FlowRef,
  roleInstanceId: string
): EffectiveCapabilities {
  const selection = readCapabilitySelection(ref, roleInstanceId);
  const validSkillNames = new Set(listSkills().map((skill) => skill.name));
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
