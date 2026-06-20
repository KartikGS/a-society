import { LLMGateway } from '../providers/llm.js';
import type { FlowRef, OperatorRenderSink, RuntimeMessageParam } from '../common/types.js';
import type { SkillSummary } from '../framework-services/skills.js';
import {
  getActiveModelWithKey,
  getAutomationSettings,
  getModelWithKey,
  isUsableModelConfig,
  type ModelConfig,
} from '../settings/settings-store.js';
import {
  resolveCapabilityGate,
  saveCapabilityDimension,
  type McpServerSummary,
} from './capability-selection.js';
import { resolveRoleModelGate, saveRoleModelSelection, type RoleModelSelection } from './role-model.js';
import { buildRoleConfigurationSummary } from './role-configuration-summary.js';
import type { WfNode } from '../../shared/workflow-graph.js';

/** Max attempts at the selection turn, including format-correction re-prompts. */
export const MAX_AUTO_SELECTION_ATTEMPTS = 3;

type AutoDimension = 'model' | 'skills' | 'mcp';

interface PendingDimensions {
  model: boolean;
  skills: boolean;
  mcp: boolean;
}

interface Candidates {
  models: ModelConfig[];
  skills: SkillSummary[];
  mcpServers: McpServerSummary[];
}

interface ParsedSelection {
  model?: Omit<RoleModelSelection, 'selectedAt'>;
  skills?: string[];
  mcpServers?: string[];
}

export interface AutoSelectionResult {
  /** True when a selection turn was performed (at least one auto dimension was pending). */
  ran: boolean;
  /** Dimensions left undecided because automation failed; the manual gate handles these. */
  fellBackDimensions: AutoDimension[];
  /**
   * True when skills were auto-decided this turn — the caller must rebuild the role's
   * system prompt so the chosen skills are injected before the role runs.
   */
  skillsResolved: boolean;
}

export interface AutoResolveOptions {
  ref: FlowRef;
  roleInstanceId: string;
  nodeId: string;
  /** All workflow-snapshot nodes; the role's own nodes are extracted to brief the selector. */
  workflowNodes: WfNode[];
  renderer: OperatorRenderSink;
  signal: AbortSignal;
}

interface RoleNodeContext {
  id: string;
  stepType?: string;
  work: string[];
  requiredReadings: string[];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

/** Workflow nodes assigned to this role instance (roleInstanceId === node.role), with their briefing metadata. */
function buildRoleNodeContexts(workflowNodes: WfNode[], roleInstanceId: string): RoleNodeContext[] {
  return workflowNodes
    .filter((node) => node.role === roleInstanceId)
    .map((node) => ({
      id: node.id,
      stepType: node.step_type,
      work: asStringArray(node.work),
      requiredReadings: asStringArray(node.required_readings),
    }));
}

function formatRoleNodes(roleNodes: RoleNodeContext[]): string[] {
  if (roleNodes.length === 0) return [];
  const lines = ['## What this role does in the workflow (its assigned nodes)'];
  for (const node of roleNodes) {
    lines.push(`### Node ${node.id}${node.stepType ? ` (${node.stepType})` : ''}`);
    if (node.work.length) lines.push(`Work: ${node.work.join('; ')}`);
    if (node.requiredReadings.length) lines.push(`Required readings: ${node.requiredReadings.join(', ')}`);
  }
  lines.push('');
  return lines;
}

function uniqueStrings(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
    .map((value) => value.trim())
    .filter((value, index, entries) => entries.indexOf(value) === index);
}

function listPendingDimensions(dims: PendingDimensions): AutoDimension[] {
  const pending: AutoDimension[] = [];
  if (dims.model) pending.push('model');
  if (dims.skills) pending.push('skills');
  if (dims.mcp) pending.push('mcp');
  return pending;
}

const SYSTEM_PROMPT = [
  'You are the A-Society runtime capability selector.',
  'A role instance is about to run in a workflow. Choose the most appropriate configuration for it',
  'from the options provided. You are only deciding the dimensions presented to you.',
  '',
  'Rules:',
  '- Select only from the options given. Do not invent ids or names.',
  '- For skills and MCP servers, selecting none is valid when nothing fits the role.',
  '- Match capabilities to what the role actually does; prefer fewer, well-matched tools over many.',
  '',
  'Reply with ONLY a single JSON object and no other text:',
  '{ "modelConfigId": "<id>", "skills": ["<skill-name>"], "mcpServers": ["<mcp-id>"] }',
  'Include a key only for a dimension you were asked to decide. Omit the others.',
].join('\n');

function buildUserPrompt(
  roleInstanceId: string,
  nodeId: string,
  pending: PendingDimensions,
  candidates: Candidates,
  roleNodes: RoleNodeContext[]
): string {
  const lines: string[] = [`Role: ${roleInstanceId}`, `Activating node: ${nodeId}`, '', ...formatRoleNodes(roleNodes)];

  if (pending.model) {
    lines.push('## Models — choose exactly one; reply with its id under "modelConfigId"');
    for (const model of candidates.models) {
      lines.push(`- id: ${model.id} | name: ${model.displayName} | model: ${model.modelId} | provider: ${model.providerType}`);
    }
    lines.push('');
  }

  if (pending.skills) {
    lines.push('## Skills — choose zero or more; reply with their names under "skills"');
    for (const skill of candidates.skills) {
      lines.push(`- name: ${skill.name} | description: ${skill.description}`);
    }
    lines.push('');
  }

  if (pending.mcp) {
    lines.push('## MCP servers — choose zero or more; reply with their ids under "mcpServers"');
    for (const server of candidates.mcpServers) {
      lines.push(`- id: ${server.id} | name: ${server.name} | tools: ${server.toolNames.join(', ') || '(none advertised)'}`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

function extractJsonObject(text: string): string | null {
  const trimmed = text.trim();
  // Strip a ```json fence if present.
  const fence = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(trimmed);
  const candidate = fence ? fence[1].trim() : trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  return candidate.slice(start, end + 1);
}

type ValidationOutcome =
  | { ok: true; selection: ParsedSelection }
  | { ok: false; reason: string };

function parseAndValidate(text: string, pending: PendingDimensions, candidates: Candidates): ValidationOutcome {
  const json = extractJsonObject(text);
  if (!json) return { ok: false, reason: 'the reply did not contain a JSON object' };

  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, reason: 'the reply was not valid JSON' };
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, reason: 'the reply was not a JSON object' };
  }
  const obj = raw as Record<string, unknown>;
  const selection: ParsedSelection = {};

  if (pending.model) {
    const id = typeof obj.modelConfigId === 'string' ? obj.modelConfigId.trim() : '';
    const match = candidates.models.find((model) => model.id === id);
    if (!match) {
      return {
        ok: false,
        reason: `"modelConfigId" must be one of the listed ids: ${candidates.models.map((model) => model.id).join(', ')}`,
      };
    }
    if (!isUsableModelConfig(getModelWithKey(match.id))) {
      return { ok: false, reason: `model "${match.displayName}" is not usable; choose a different one` };
    }
    selection.model = { modelConfigId: match.id, displayName: match.displayName, modelId: match.modelId };
  }

  if (pending.skills) {
    if (obj.skills !== undefined && !Array.isArray(obj.skills)) {
      return { ok: false, reason: '"skills" must be an array of skill names' };
    }
    const validSkillNames = new Set(candidates.skills.map((skill) => skill.name));
    selection.skills = uniqueStrings(obj.skills).filter((name) => validSkillNames.has(name));
  }

  if (pending.mcp) {
    if (obj.mcpServers !== undefined && !Array.isArray(obj.mcpServers)) {
      return { ok: false, reason: '"mcpServers" must be an array of MCP server ids' };
    }
    // Accept either id or name and normalize to id for persistence.
    const idByKey = new Map<string, string>();
    for (const server of candidates.mcpServers) {
      idByKey.set(server.id, server.id);
      idByKey.set(server.name, server.id);
    }
    selection.mcpServers = uniqueStrings(obj.mcpServers)
      .map((key) => idByKey.get(key))
      .filter((id): id is string => id !== undefined)
      .filter((id, index, ids) => ids.indexOf(id) === index);
  }

  return { ok: true, selection };
}

async function runSelectionTurn(options: {
  roleInstanceId: string;
  nodeId: string;
  renderer: OperatorRenderSink;
  signal: AbortSignal;
  pending: PendingDimensions;
  candidates: Candidates;
  roleNodes: RoleNodeContext[];
}): Promise<ParsedSelection | null> {
  const llm = new LLMGateway({
    mode: 'system',
    model: getActiveModelWithKey(),
  });

  const messages: RuntimeMessageParam[] = [
    { role: 'user', content: buildUserPrompt(options.roleInstanceId, options.nodeId, options.pending, options.candidates, options.roleNodes) },
  ];

  for (let attempt = 0; attempt < MAX_AUTO_SELECTION_ATTEMPTS; attempt++) {
    const result = await llm.executeTurn(SYSTEM_PROMPT, messages, {
      signal: options.signal,
      operatorRenderer: options.renderer,
      roleInstanceId: options.roleInstanceId,
      nodeId: options.nodeId,
    });

    const outcome = parseAndValidate(result.text, options.pending, options.candidates);
    if (outcome.ok) return outcome.selection;

    // Format-correction re-prompt: feed the invalid reply back and ask for a fix.
    messages.push({ role: 'assistant', content: result.text });
    messages.push({
      role: 'user',
      content: `That reply could not be used: ${outcome.reason}. Reply with ONLY the JSON object described earlier — no prose, no code fences.`,
    });
  }

  return null;
}

/**
 * Optionally auto-resolves a role instance's model / skills / MCP-server selection
 * before the activation gate is evaluated. For each dimension whose automation mode
 * is `auto` and that still needs a decision, this runs a single system-mode LLM turn
 * (on the active model) and persists the result, so the manual gate then sees those
 * dimensions as `ready`. Dimensions in `manual` mode, single-option dimensions, and
 * already-decided dimensions are left untouched.
 *
 * Failure is two-tier (matching operator guidance):
 * - malformed/invalid output → the turn re-prompts the model to correct the format,
 *   bounded by {@link MAX_AUTO_SELECTION_ATTEMPTS};
 * - transport errors (network/timeout) or exhausted retries → the affected dimensions
 *   are left undecided so the existing manual gate parks the node for the operator.
 */
export async function autoResolveRoleConfiguration(options: AutoResolveOptions): Promise<AutoSelectionResult> {
  const { ref, roleInstanceId, nodeId, renderer, signal } = options;
  const automation = getAutomationSettings();

  const modelGate = resolveRoleModelGate(ref, roleInstanceId);
  const capabilityGate = resolveCapabilityGate(ref, roleInstanceId);

  const pending: PendingDimensions = {
    model: automation.models === 'auto' && modelGate.kind === 'selection-required',
    skills: automation.skills === 'auto' && capabilityGate.kind === 'selection-required' && capabilityGate.pendingSkills,
    mcp: automation.mcpServers === 'auto' && capabilityGate.kind === 'selection-required' && capabilityGate.pendingMcp,
  };

  if (!pending.model && !pending.skills && !pending.mcp) {
    return { ran: false, fellBackDimensions: [], skillsResolved: false };
  }

  const candidates: Candidates = {
    models: modelGate.kind === 'selection-required' ? modelGate.options : [],
    skills: capabilityGate.kind === 'selection-required' ? capabilityGate.skills : [],
    mcpServers: capabilityGate.kind === 'selection-required' ? capabilityGate.mcpServers : [],
  };

  const roleNodes = buildRoleNodeContexts(options.workflowNodes, roleInstanceId);
  const pendingDimensions = listPendingDimensions(pending);
  renderer.emit({ kind: 'role.auto_selection_started', nodeId, role: roleInstanceId });

  try {
    const selection = await runSelectionTurn({ roleInstanceId, nodeId, renderer, signal, pending, candidates, roleNodes });

    if (!selection) {
      renderer.emit({
        kind: 'role.auto_selection_fell_back',
        nodeId,
        role: roleInstanceId,
        dimensions: pendingDimensions,
        reason: 'the model did not return a valid selection',
      });
      return { ran: true, fellBackDimensions: pendingDimensions, skillsResolved: false };
    }

    const selectedAt = new Date().toISOString();
    if (pending.model && selection.model) {
      saveRoleModelSelection(ref, roleInstanceId, { ...selection.model, selectedAt });
    }
    if (pending.skills) {
      saveCapabilityDimension(ref, roleInstanceId, 'skills', selection.skills ?? [], selectedAt);
    }
    if (pending.mcp) {
      saveCapabilityDimension(ref, roleInstanceId, 'mcpServers', selection.mcpServers ?? [], selectedAt);
    }

    // The strip is always status-only. When this is a pure-auto run (no manual
    // selection follows), emit the final-config bubble here; otherwise it is emitted
    // after the operator's manual submit so it reflects the complete configuration.
    renderer.emit({ kind: 'role.auto_configured', nodeId, role: roleInstanceId });

    const manualSelectionFollows =
      resolveRoleModelGate(ref, roleInstanceId).kind === 'selection-required' ||
      resolveCapabilityGate(ref, roleInstanceId).kind === 'selection-required';
    if (!manualSelectionFollows) {
      renderer.emit({
        kind: 'role.configured',
        nodeId,
        role: roleInstanceId,
        ...buildRoleConfigurationSummary(ref, roleInstanceId),
      });
    }

    return { ran: true, fellBackDimensions: [], skillsResolved: pending.skills };
  } catch (error) {
    // Operator abort: leave dimensions undecided; the node parks and shows the
    // normal manual prompt without a noisy failure notice.
    if (signal.aborted) {
      return { ran: true, fellBackDimensions: pendingDimensions, skillsResolved: false };
    }
    renderer.emit({
      kind: 'role.auto_selection_fell_back',
      nodeId,
      role: roleInstanceId,
      dimensions: pendingDimensions,
      reason: error instanceof Error ? error.message : String(error),
    });
    return { ran: true, fellBackDimensions: pendingDimensions, skillsResolved: false };
  } finally {
    renderer.responseEnd(roleInstanceId);
  }
}
