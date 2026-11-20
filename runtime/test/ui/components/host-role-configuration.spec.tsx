// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChatInterface, type RoleConfigurationPrompt } from '../../../ui/src/components/ChatInterface';
import type { HostAgentSummary } from '../../../shared/settings.js';

const CLAUDE_HOST: HostAgentSummary = {
  id: 'claude-code',
  displayName: 'Claude Code',
  supportedVersions: { min: '2.1.304', maxExclusive: '2.2.0' },
  models: [{ id: 'opus', displayName: 'Opus' }, { id: 'sonnet', displayName: 'Sonnet' }],
  effortLevels: ['low', 'medium', 'high', 'xhigh', 'max'],
};

function prompt(hostAgent: HostAgentSummary | null): RoleConfigurationPrompt {
  return {
    nodeId: 'owner-intake',
    models: [],
    skills: [],
    mcpServers: [],
    pendingModel: true,
    pendingSkills: false,
    pendingMcp: false,
    hostAgent,
  };
}

function renderBanner(hostAgent: HostAgentSummary | null) {
  const onRoleConfigure = vi.fn();
  render(
    <ChatInterface
      subtitle="Owner"
      messages={[]}
      waitingLabel={null}
      inputValue=""
      inputDisabled={true}
      placeholder="Configure this role to continue."
      showComposer={true}
      roleConfiguration={prompt(hostAgent)}
      onRoleConfigure={onRoleConfigure}
      onInputChange={vi.fn()}
      onSubmit={vi.fn()}
    />,
  );
  return onRoleConfigure;
}

afterEach(cleanup);

describe('host role-configuration banner', () => {
  it('requires a model choice and submits the host default as model null', async () => {
    const user = userEvent.setup();
    const onRoleConfigure = renderBanner(CLAUDE_HOST);

    const continueBtn = screen.getByRole('button', { name: 'Continue' });
    expect(continueBtn).toBeDisabled();
    expect(screen.queryByRole('region', { name: 'Skills' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Host default/ }));
    await user.click(continueBtn);

    expect(onRoleConfigure).toHaveBeenCalledWith('owner-intake', {
      hostModel: { model: null, effort: null },
      skills: [],
      mcpServers: [],
    });
  });

  it('submits a declared model alias with an effort level', async () => {
    const user = userEvent.setup();
    const onRoleConfigure = renderBanner(CLAUDE_HOST);

    await user.click(screen.getByRole('button', { name: /Opus/ }));
    await user.selectOptions(screen.getByLabelText('Effort'), 'high');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onRoleConfigure).toHaveBeenCalledWith('owner-intake', {
      hostModel: { model: 'opus', effort: 'high' },
      skills: [],
      mcpServers: [],
    });
  });

  it('hides the effort select when the host declares no effort levels', () => {
    renderBanner({ ...CLAUDE_HOST, effortLevels: [] });
    expect(screen.queryByLabelText('Effort')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sonnet/ })).toBeInTheDocument();
  });

  it('shows a loading state and blocks submission until the host list arrives', () => {
    renderBanner(null);
    expect(screen.getByText(/Loading the coding agent/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });
});
