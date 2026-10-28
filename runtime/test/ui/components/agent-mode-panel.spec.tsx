// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentModePanel } from '../../../ui/src/components/settings/AgentModePanel';
import { fetchAgentMode, probeHostAgent, saveAgentMode } from '../../../ui/src/app/runtime-api';
import type { AgentModeResponse, HostProbeSummary } from '../../../shared/settings.js';

vi.mock('../../../ui/src/app/runtime-api', () => ({
  fetchAgentMode: vi.fn(),
  probeHostAgent: vi.fn(),
  saveAgentMode: vi.fn(),
}));

const CLAUDE = { id: 'claude-code' as const, displayName: 'Claude Code', supportedVersions: { min: '2.1.304', maxExclusive: '2.2.0' } };

function response(settings: Partial<AgentModeResponse['settings']> = {}): AgentModeResponse {
  return { settings: { mode: 'api', hostAgentId: null, executablePath: null, ...settings }, hosts: [CLAUDE] };
}

function probe(overrides: Partial<HostProbeSummary> = {}): HostProbeSummary {
  return {
    hostAgentId: 'claude-code',
    displayName: 'Claude Code',
    installed: true,
    executablePath: '/usr/local/bin/claude',
    version: '2.1.309',
    supportedVersions: CLAUDE.supportedVersions,
    versionSupported: true,
    loggedIn: true,
    authMethod: 'claude.ai',
    subscriptionType: 'pro',
    checkedAt: '2026-10-28T00:00:00.000Z',
    ...overrides,
  };
}

function renderPanel() {
  const handlers = { onSaved: vi.fn(), onError: vi.fn(), onSuccess: vi.fn() };
  render(<AgentModePanel {...handlers} />);
  return handlers;
}

beforeEach(() => {
  vi.mocked(fetchAgentMode).mockReset();
  vi.mocked(probeHostAgent).mockReset();
  vi.mocked(saveAgentMode).mockReset();
});
afterEach(cleanup);

describe('AgentModePanel', () => {
  it('switches to a coding agent, checks it, and saves the selection', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchAgentMode).mockResolvedValue(response());
    vi.mocked(probeHostAgent).mockResolvedValue(probe());
    vi.mocked(saveAgentMode).mockResolvedValue(response({ mode: 'host', hostAgentId: 'claude-code' }));
    const handlers = renderPanel();

    const apiOption = await screen.findByRole('radio', { name: 'API models configured under Models' });
    expect(apiOption).toBeChecked();
    expect(screen.queryByLabelText('Coding agent')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'A coding agent installed on this machine' }));
    expect(screen.getByLabelText('Coding agent')).toHaveValue('claude-code');

    await user.click(screen.getByRole('button', { name: 'Check agent' }));
    expect(probeHostAgent).toHaveBeenCalledWith('claude-code', null);
    expect(await screen.findByRole('status')).toHaveTextContent('Ready');
    expect(screen.getByText('claude.ai, pro plan')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save Agent Mode' }));
    expect(saveAgentMode).toHaveBeenCalledWith({ mode: 'host', hostAgentId: 'claude-code', executablePath: null });
    await waitFor(() => expect(handlers.onSaved).toHaveBeenCalled());
    expect(handlers.onSuccess).toHaveBeenCalledWith('New flows will run on Claude Code.');
  });

  it('checks a saved host on open and explains an unsupported version', async () => {
    vi.mocked(fetchAgentMode).mockResolvedValue(response({ mode: 'host', hostAgentId: 'claude-code', executablePath: '/opt/claude' }));
    vi.mocked(probeHostAgent).mockResolvedValue(probe({ version: '2.2.1', versionSupported: false }));
    renderPanel();

    expect(await screen.findByRole('status')).toHaveTextContent('Not ready');
    expect(probeHostAgent).toHaveBeenCalledWith('claude-code', '/opt/claude');
    expect(screen.getByText('2.2.1 (supported: 2.1.304 up to (not including) 2.2.0)')).toBeInTheDocument();
    expect(screen.getByLabelText('Executable path (optional)')).toHaveValue('/opt/claude');
  });

  it('clears a stale check when the path changes and reports save errors', async () => {
    const user = userEvent.setup();
    vi.mocked(fetchAgentMode).mockResolvedValue(response({ mode: 'host', hostAgentId: 'claude-code' }));
    vi.mocked(probeHostAgent).mockResolvedValue(probe({ installed: false, version: null, versionSupported: false, loggedIn: null }));
    vi.mocked(saveAgentMode).mockRejectedValue(new Error('Executable path must be absolute.'));
    const handlers = renderPanel();

    expect(await screen.findByRole('status')).toHaveTextContent('Not ready');
    await user.type(screen.getByLabelText('Executable path (optional)'), 'bin/claude');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save Agent Mode' }));
    await waitFor(() => expect(handlers.onError).toHaveBeenCalledWith('Executable path must be absolute.'));
    expect(handlers.onSaved).not.toHaveBeenCalled();
  });
});
