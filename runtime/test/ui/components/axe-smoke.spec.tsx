// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import * as matchers from 'vitest-axe/matchers';
import { ChatInterface } from '../../../ui/src/components/ChatInterface';
import { ConfirmDialog } from '../../../ui/src/components/ConfirmDialog';
import { ProjectSelector } from '../../../ui/src/components/ProjectSelector';
import { AgentModePanel } from '../../../ui/src/components/settings/AgentModePanel';
import { fetchAgentMode, probeHostAgent } from '../../../ui/src/app/runtime-api';
import { ensureDialogSupport, ensureMatchMediaSupport } from './setup-dom';
import type { HostAgentSummary } from '../../../shared/settings.js';
import type { FeedItem } from '../../../shared/types.js';

const CLAUDE_HOST: HostAgentSummary = {
  id: 'claude-code',
  displayName: 'Claude Code',
  supportedVersions: { min: '2.1.304', maxExclusive: '2.2.0' },
  models: [{ id: 'opus', displayName: 'Opus' }, { id: 'sonnet', displayName: 'Sonnet' }],
  effortLevels: ['low', 'medium', 'high', 'xhigh', 'max'],
};

vi.mock('../../../ui/src/app/runtime-api', () => ({
  fetchAgentMode: vi.fn(),
  probeHostAgent: vi.fn(),
  saveAgentMode: vi.fn(),
}));

expect.extend(matchers);

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- augmentation must mirror vitest's generic signature
  interface Assertion<T = any> {
    toHaveNoViolations(): void;
  }
}

beforeAll(() => {
  ensureDialogSupport();
  ensureMatchMediaSupport();
});
afterEach(cleanup);

// Color-contrast needs a real rendering engine; region checks need page-level
// landmarks that a mounted fragment cannot provide.
const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
    region: { enabled: false },
  },
};

describe('axe smoke checks', () => {
  it('ChatInterface has no detectable a11y violations', async () => {
    const messages: FeedItem[] = [
      { id: '1', type: 'assistant', label: 'Owner', text: 'Hello **operator**.' },
      { id: '2', type: 'user', label: 'You', text: 'Hi.' },
      { id: '3', type: 'tool', label: 'Tool', text: 'run_command: ls' },
    ];
    const { container } = render(
      <ChatInterface
        subtitle="Select a role."
        messages={messages}
        waitingLabel={null}
        inputValue=""
        inputDisabled={false}
        placeholder="Send a message"
        showComposer={true}
        roles={['owner', 'curator']}
        selectedRole="owner"
        onInputChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations();
  });

  it('ProjectSelector has no detectable a11y violations', async () => {
    const { container } = render(
      <ProjectSelector
        projectsWithADocs={[{ folderName: 'demo', displayName: 'Demo' } as never]}
        projectsWithoutADocs={[]}
        selectedProject={null}
        selectedFlowId={null}
        projectFlows={[]}
        newProjectName=""
        errorMessage={null}
        disabled={false}
        canStartFlows={true}
        settingsReady={true}
        settingsConfigured={true}
        onSelectInitialized={vi.fn()}
        onInitializeExisting={vi.fn()}
        onOpenFlow={vi.fn()}
        onNewFlow={vi.fn()}
        onDeleteFlow={vi.fn()}
        onDeleteProject={vi.fn()}
        onUpdateProject={vi.fn()}
        onOpenProjectSettings={vi.fn()}
        onNewProjectNameChange={vi.fn()}
        onCreateNew={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    );
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations();
  });

  it('ConfirmDialog has no detectable a11y violations', async () => {
    const { baseElement } = render(
      <ConfirmDialog
        title="Delete project?"
        body="This cannot be undone."
        typeToConfirm="demo"
        onResolve={vi.fn()}
      />,
    );
    expect(await axe(baseElement, AXE_OPTIONS)).toHaveNoViolations();
  });

  it('AgentModePanel (host mode, checked) has no detectable a11y violations', async () => {
    vi.mocked(fetchAgentMode).mockResolvedValue({
      settings: { mode: 'host', hostAgentId: 'claude-code', executablePath: null },
      hosts: [CLAUDE_HOST],
    });
    vi.mocked(probeHostAgent).mockResolvedValue({
      hostAgentId: 'claude-code',
      displayName: 'Claude Code',
      installed: true,
      executablePath: '/usr/local/bin/claude',
      version: '2.1.309',
      supportedVersions: { min: '2.1.304', maxExclusive: '2.2.0' },
      versionSupported: true,
      loggedIn: true,
      authMethod: 'claude.ai',
      subscriptionType: 'pro',
      checkedAt: '2026-10-28T00:00:00.000Z',
    });
    const { container } = render(<AgentModePanel onSaved={vi.fn()} onError={vi.fn()} onSuccess={vi.fn()} />);
    await screen.findByRole('status');
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations();
  });

  it('ChatInterface host role-configuration banner has no detectable a11y violations', async () => {
    const { container } = render(
      <ChatInterface
        subtitle="Select a role."
        messages={[]}
        waitingLabel={null}
        inputValue=""
        inputDisabled={true}
        placeholder="Configure this role to continue."
        showComposer={true}
        roleConfiguration={{
          nodeId: 'owner-intake',
          models: [],
          skills: [],
          mcpServers: [],
          pendingModel: true,
          pendingSkills: false,
          pendingMcp: false,
          hostAgent: CLAUDE_HOST,
        }}
        onInputChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations();
  });

  it('assistant inline HTML renders without new a11y violations', async () => {
    const messages: FeedItem[] = [{
      id: 'h1',
      type: 'assistant',
      label: 'Owner',
      text: 'Press <kbd>Ctrl</kbd>, see <mark>this</mark>, H<sub>2</sub>O, x<sup>2</sup>.\n\n<details><summary>More</summary>Hidden <span style="color: red">detail</span></details>',
    }];
    const { container } = render(
      <ChatInterface
        subtitle="Select a role."
        messages={messages}
        waitingLabel={null}
        inputValue=""
        inputDisabled={false}
        placeholder="Send a message"
        showComposer={false}
        onInputChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations();
  });
});
