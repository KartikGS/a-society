import {
  normalizeFeedSettings,
  normalizeMcpServerConfig,
  normalizeMcpServerSummaries,
  normalizeMcpServerSummary,
  normalizeModelConfig,
  normalizeModelConfigs,
  normalizeSettingsStatus,
  normalizeSkillLoadResults,
  normalizeToolSettings,
  type McpServerConfig,
} from '../model-config';
import type { FlowRef, FlowRun, FlowSummary } from '../../../shared/types.js';
import type {
  AutomationSettings,
  FeedSettings,
  InputModality,
  McpServerSummary,
  ModelConfig,
  ProviderType,
  SelectionMode,
  SettingsStatus,
  ToolSettings,
} from '../../../shared/settings.js';
import type { ModelReasoningConfig } from '../../../shared/model-reasoning.js';
import type { PromptCacheTtl } from '../../../shared/prompt-cache.js';
import type { FlowCreationMode, ProjectDiscovery, ProjectSummary } from '../../../shared/projects.js';
import type { ProjectSettings } from '../../../shared/project-settings.js';
import { normalizeProjectSettings } from '../../../shared/project-settings.js';
import type { SkillLoadResult } from '../../../shared/skills.js';
import type { WorkflowDefinition } from '../../../shared/workflow-graph.js';

export class IncompatibleFlowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IncompatibleFlowError';
  }
}

async function responseText(response: Response): Promise<string> {
  const text = await response.text();
  if (text) {
    try {
      const payload = JSON.parse(text) as { message?: unknown };
      if (typeof payload.message === 'string') return payload.message;
    } catch {
      // Fall through to the raw response body below.
    }
  }
  return text || response.statusText;
}

export async function fetchSettingsStatus(): Promise<SettingsStatus> {
  const response = await fetch('/api/settings/status');
  if (!response.ok) {
    throw new Error(await responseText(response));
  }

  const status = normalizeSettingsStatus(await response.json());
  if (!status) {
    throw new Error('Invalid settings status response.');
  }

  return status;
}

export async function fetchModels(): Promise<ModelConfig[]> {
  const response = await fetch('/api/settings/models');
  if (!response.ok) {
    throw new Error(await responseText(response));
  }

  return normalizeModelConfigs(await response.json());
}

export async function fetchSkills(): Promise<SkillLoadResult[]> {
  const response = await fetch('/api/settings/skills');
  if (!response.ok) {
    throw new Error(await responseText(response));
  }

  return normalizeSkillLoadResults(await response.json());
}

export async function fetchMcpServers(): Promise<McpServerSummary[]> {
  const response = await fetch('/api/settings/mcp');
  if (!response.ok) {
    throw new Error(await responseText(response));
  }

  return normalizeMcpServerSummaries(await response.json());
}

export async function fetchActiveModelContextWindow(): Promise<number | null> {
  const response = await fetch('/api/settings/active-model/context-window');
  if (!response.ok) {
    throw new Error(await responseText(response));
  }

  const data = await response.json() as { contextWindow: number | null };
  return data.contextWindow ?? null;
}

export async function fetchProjectFlows(projectNamespace: string): Promise<FlowSummary[]> {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectNamespace)}/flows`);
  if (!response.ok) {
    throw new Error(await responseText(response));
  }

  return await response.json() as FlowSummary[];
}

export async function createFlow(projectNamespace: string, mode: FlowCreationMode): Promise<FlowRef> {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectNamespace)}/flows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
  const payload = await response.json() as { flowRef: FlowRef };
  return payload.flowRef;
}

export async function fetchProjects(): Promise<ProjectDiscovery> {
  const response = await fetch('/api/projects');
  if (!response.ok) {
    throw new Error(await responseText(response));
  }

  return await response.json() as ProjectDiscovery;
}

export async function fetchFlowState(ref: FlowRef): Promise<FlowRun | null> {
  const response = await fetch(
    `/api/flows/${encodeURIComponent(ref.projectNamespace)}/${encodeURIComponent(ref.flowId)}/state`
  );

  if (!response.ok) {
    if (response.status === 409) {
      const payload = await response.json().catch(() => null) as { message?: string } | null;
      throw new IncompatibleFlowError(payload?.message ?? 'This flow is incompatible with the current runtime.');
    }

    throw new Error(await responseText(response));
  }

  return await response.json() as FlowRun | null;
}

export async function fetchWorkflowGraph(ref: FlowRef, mode: 'flow' | 'improvement'): Promise<WorkflowDefinition> {
  const endpoint = mode === 'improvement' ? 'improvement-workflow' : 'workflow';
  const response = await fetch(
    `/api/flows/${encodeURIComponent(ref.projectNamespace)}/${encodeURIComponent(ref.flowId)}/${endpoint}`
  );
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
  return await response.json() as WorkflowDefinition;
}

export async function deleteFlow(flow: FlowSummary): Promise<void> {
  const response = await fetch(
    `/api/flows/${encodeURIComponent(flow.projectNamespace)}/${encodeURIComponent(flow.flowId)}`,
    { method: 'DELETE' },
  );

  if (!response.ok) {
    throw new Error(await responseText(response));
  }
}

export async function fetchProjectRoles(projectNamespace: string): Promise<string[]> {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectNamespace)}/roles`);
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
  return await response.json() as string[];
}

export async function fetchProjectSettings(projectNamespace: string): Promise<ProjectSettings> {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectNamespace)}/settings`);
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
  return normalizeProjectSettings(await response.json());
}

export async function saveProjectSettings(
  projectNamespace: string,
  settings: ProjectSettings,
): Promise<ProjectSettings> {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectNamespace)}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
  return normalizeProjectSettings(await response.json());
}

export async function fetchToolSettings(): Promise<ToolSettings> {
  const response = await fetch('/api/settings/tools');
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
  const settings = normalizeToolSettings(await response.json());
  if (!settings) {
    throw new Error('Invalid tool settings response.');
  }
  return settings;
}

export async function saveWebSearchSettings(input: { enabled: boolean; apiKey: string }): Promise<ToolSettings> {
  const response = await fetch('/api/settings/tools/web-search', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
  const settings = normalizeToolSettings(await response.json());
  if (!settings) {
    throw new Error('Invalid tool settings response.');
  }
  return settings;
}

export async function fetchFeedSettings(): Promise<FeedSettings> {
  const response = await fetch('/api/settings/feed');
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
  const settings = normalizeFeedSettings(await response.json());
  if (!settings) {
    throw new Error('Invalid feed settings response.');
  }
  return settings;
}

export async function saveFeedSettings(historyLimit: number): Promise<FeedSettings> {
  const response = await fetch('/api/settings/feed', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ historyLimit }),
  });
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
  const settings = normalizeFeedSettings(await response.json());
  if (!settings) {
    throw new Error('Invalid feed settings response.');
  }
  return settings;
}

function normalizeAutomationSettings(value: unknown): AutomationSettings {
  const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const mode = (entry: unknown): SelectionMode => (entry === 'auto' ? 'auto' : 'manual');
  return { models: mode(raw.models), skills: mode(raw.skills), mcpServers: mode(raw.mcpServers) };
}

export async function fetchAutomationSettings(): Promise<AutomationSettings> {
  const response = await fetch('/api/settings/automation');
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
  return normalizeAutomationSettings(await response.json());
}

export async function updateAutomationSettings(patch: Partial<AutomationSettings>): Promise<AutomationSettings> {
  const response = await fetch('/api/settings/automation', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
  return normalizeAutomationSettings(await response.json());
}

export interface SaveModelPayload {
  displayName: string;
  providerType: ProviderType;
  providerBaseUrl: string;
  modelId: string;
  apiKey: string;
  contextWindow: number;
  maxOutputTokens: number;
  reasoning: ModelReasoningConfig;
  cacheTtl: PromptCacheTtl;
  supportedInputTypes: InputModality[];
}

export async function saveModel(payload: SaveModelPayload, editingModelId: string | null): Promise<ModelConfig> {
  const response = await fetch(
    editingModelId ? `/api/settings/models/${encodeURIComponent(editingModelId)}` : '/api/settings/models',
    {
      method: editingModelId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
  const saved = normalizeModelConfig(await response.json());
  if (!saved) {
    throw new Error('Server returned an invalid model configuration.');
  }
  return saved;
}

export async function activateModel(id: string): Promise<void> {
  const response = await fetch(`/api/settings/models/${encodeURIComponent(id)}/activate`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
}

export async function deleteModel(id: string): Promise<void> {
  const response = await fetch(`/api/settings/models/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
}

/** Imports a skill folder; resolves with the server's optional notice text. */
export async function importSkill(path: string): Promise<string | null> {
  const response = await fetch('/api/settings/skills/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  });
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
  const body = await response.json().catch(() => null) as { notice?: string | null } | null;
  return body?.notice ?? null;
}

export async function deleteSkill(name: string): Promise<void> {
  const response = await fetch(`/api/settings/skills/${encodeURIComponent(name)}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
}

export async function fetchMcpServer(id: string): Promise<McpServerConfig> {
  const response = await fetch(`/api/settings/mcp/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
  const server = normalizeMcpServerConfig(await response.json());
  if (!server) {
    throw new Error('Server returned an invalid MCP configuration.');
  }
  return server;
}

export interface SaveMcpServerPayload {
  name: string;
  transport: 'stdio' | 'http';
  command: string;
  args: string[];
  env: Record<string, string>;
  url: string;
  headers: Record<string, string>;
}

/** Resolves with the saved summary, or null when the server omits one. */
export async function saveMcpServer(payload: SaveMcpServerPayload, editingId: string | null): Promise<McpServerSummary | null> {
  const response = await fetch(
    editingId ? `/api/settings/mcp/${encodeURIComponent(editingId)}` : '/api/settings/mcp',
    {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
  return normalizeMcpServerSummary(await response.json().catch(() => null));
}

export async function deleteMcpServer(id: string): Promise<void> {
  const response = await fetch(`/api/settings/mcp/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await responseText(response));
  }
}

export async function deleteProject(project: ProjectSummary): Promise<ProjectDiscovery> {
  const response = await fetch(
    `/api/projects/${encodeURIComponent(project.folderName)}`,
    { method: 'DELETE' },
  );

  if (!response.ok) {
    throw new Error(await responseText(response));
  }

  const payload = await response.json() as { projects?: ProjectDiscovery };
  if (!payload.projects) {
    return await fetchProjects();
  }
  return payload.projects;
}
