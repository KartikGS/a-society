// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectSettingsModal } from '../../../ui/src/components/ProjectSettingsModal';
import {
  fetchAgentMode,
  fetchMcpServers,
  fetchModels,
  fetchProjectRoles,
  fetchProjectSettings,
  fetchSkills,
  saveProjectSettings,
} from '../../../ui/src/app/runtime-api';
import { ensureDialogSupport } from './setup-dom';
import { defaultProjectPermissionSettings } from '../../../shared/project-settings.js';
import type { ProjectSettings } from '../../../shared/project-settings.js';
import type { AgentModeResponse } from '../../../shared/settings.js';

vi.mock('../../../ui/src/app/runtime-api', () => ({
  fetchAgentMode: vi.fn(),
  fetchMcpServers: vi.fn(),
  fetchModels: vi.fn(),
  fetchProjectRoles: vi.fn(),
  fetchProjectSettings: vi.fn(),
  fetchSkills: vi.fn(),
  saveProjectSettings: vi.fn(),
}));

const AGENT_MODE: AgentModeResponse = {
  settings: { mode: 'host', hostAgentId: 'claude-code', executablePath: null },
  hosts: [{
    id: 'claude-code',
    displayName: 'Claude Code',
    supportedVersions: { min: '2.1.304', maxExclusive: '2.2.0' },
    models: [{ id: 'opus', displayName: 'Opus' }, { id: 'sonnet', displayName: 'Sonnet' }],
    effortLevels: ['low', 'medium', 'high', 'xhigh', 'max'],
  }],
};

function projectSettings(roles: ProjectSettings['roles']): ProjectSettings {
  return {
    enabled: true,
    roles,
    permission: defaultProjectPermissionSettings(),
  };
}

function lastSaved(): ProjectSettings {
  const calls = vi.mocked(saveProjectSettings).mock.calls;
  return calls[calls.length - 1][1];
}

function renderModal(agentModeActive = true) {
  render(
    <ProjectSettingsModal
      projectNamespace="demo"
      displayName="Demo"
      agentModeActive={agentModeActive}
      onClose={vi.fn()}
      onError={vi.fn()}
      onDeleteProject={vi.fn()}
    />,
  );
}

beforeAll(() => {
  ensureDialogSupport();
});

beforeEach(() => {
  vi.mocked(fetchAgentMode).mockResolvedValue(AGENT_MODE);
  vi.mocked(fetchMcpServers).mockResolvedValue([]);
  vi.mocked(fetchModels).mockResolvedValue([]);
  vi.mocked(fetchProjectRoles).mockResolvedValue(['owner']);
  vi.mocked(fetchSkills).mockResolvedValue([]);
  vi.mocked(saveProjectSettings).mockImplementation(async (_ns, settings) => settings);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('ProjectSettingsModal host model defaults', () => {
  it('saves a host model and effort while keeping the API modelConfigId and other entries', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchProjectSettings).mockResolvedValue(projectSettings({
      owner: { modelConfigId: 'api-model-1', skills: ['review'] },
    }));
    renderModal();

    await user.click(await screen.findByRole('button', { name: /Opus/ }));
    expect(lastSaved().roles.owner).toEqual({
      modelConfigId: 'api-model-1',
      skills: ['review'],
      hostModels: { 'claude-code': { model: 'opus', effort: null } },
    });

    await user.selectOptions(screen.getByLabelText('Effort'), 'xhigh');
    expect(lastSaved().roles.owner).toEqual({
      modelConfigId: 'api-model-1',
      skills: ['review'],
      hostModels: { 'claude-code': { model: 'opus', effort: 'xhigh' } },
    });
  });

  it('offers host default and removes the entry when switched back to per-flow', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchProjectSettings).mockResolvedValue(projectSettings({
      owner: { modelConfigId: 'api-model-1', hostModels: { 'claude-code': { model: 'sonnet', effort: 'low' } } },
    }));
    renderModal();

    expect(await screen.findByRole('button', { name: /Sonnet/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Effort')).toHaveValue('low');

    await user.click(screen.getByRole('button', { name: /Host default/ }));
    expect(lastSaved().roles.owner.hostModels).toEqual({ 'claude-code': { model: null, effort: 'low' } });

    await user.click(screen.getByRole('button', { name: /Use per-flow default/ }));
    await waitFor(() => expect(lastSaved().roles.owner).toEqual({ modelConfigId: 'api-model-1' }));
    expect(screen.queryByLabelText('Effort')).not.toBeInTheDocument();
  });

  it('keeps the API model picker when agent mode is off', async () => {
    vi.mocked(fetchProjectSettings).mockResolvedValue(projectSettings({}));
    renderModal(false);
    expect(await screen.findByRole('region', { name: 'Model' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Host model' })).not.toBeInTheDocument();
  });
});
