import { normalizeSettingsStatus } from '../model-config';
import type { FlowRef, FlowRun, FlowSummary, ProjectDiscovery, ProjectSummary, SettingsStatus } from '../types';

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

export async function deleteFlow(flow: FlowSummary): Promise<void> {
  const response = await fetch(
    `/api/flows/${encodeURIComponent(flow.projectNamespace)}/${encodeURIComponent(flow.flowId)}`,
    { method: 'DELETE' },
  );

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
