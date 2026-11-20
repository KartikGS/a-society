// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChatInterface } from '../../../ui/src/components/ChatInterface';
import { CONSENT_RESPONSE_DECISION, HANDOFF_APPROVAL_DECISION } from '../../../shared/protocol-constants.js';
import type { ConsentRequest, FeedItem } from '../../../shared/types.js';

function baseProps() {
  return {
    subtitle: 'Select a role to view its conversation.',
    messages: [] as FeedItem[],
    waitingLabel: null,
    inputValue: '',
    inputDisabled: false,
    placeholder: 'Send a message',
    showComposer: true,
    onInputChange: vi.fn(),
    onSubmit: vi.fn(),
  };
}

afterEach(cleanup);

describe('ChatInterface feed rendering', () => {
  it('renders GFM tables inside a horizontal-scroll wrapper', () => {
    const messages: FeedItem[] = [{
      id: 'a1',
      type: 'assistant',
      label: 'Owner',
      text: '| Col A | Col B |\n| --- | --- |\n| one | two |',
    }];
    const { container } = render(<ChatInterface {...baseProps()} messages={messages} />);

    const wrap = container.querySelector('.feed-table-wrap');
    expect(wrap).not.toBeNull();
    expect(wrap!.querySelector('table')).not.toBeNull();
    expect(screen.getByText('one')).toBeInTheDocument();
  });

  it('opens assistant links in a new tab with rel protection', () => {
    const messages: FeedItem[] = [{
      id: 'a2',
      type: 'assistant',
      label: 'Owner',
      text: 'See [the docs](https://example.com/docs).',
    }];
    render(<ChatInterface {...baseProps()} messages={messages} />);

    const link = screen.getByRole('link', { name: 'the docs' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('renders compact tool lines with label and text', () => {
    const messages: FeedItem[] = [{
      id: 't1',
      type: 'tool',
      label: 'Tool',
      text: 'run_command: npm test',
    }];
    const { container } = render(<ChatInterface {...baseProps()} messages={messages} />);

    const line = container.querySelector('.feed-compact-tool');
    expect(line).not.toBeNull();
    expect(line).toHaveTextContent('Tool');
    expect(line).toHaveTextContent('run_command: npm test');
  });

  it('exposes the feed as a polite live region', () => {
    render(<ChatInterface {...baseProps()} />);
    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-live', 'polite');
  });
});

describe('ChatInterface consent banner', () => {
  const request: ConsentRequest = {
    kind: 'bash-command',
    toolName: 'run_command',
    command: 'npm test',
    nodeId: 'node-1',
    role: 'owner',
  };

  it('sends the chosen consent decision', () => {
    const onConsentResponse = vi.fn();
    render(
      <ChatInterface
        {...baseProps()}
        consentRequest={request}
        onConsentResponse={onConsentResponse}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Allow this command' }));
    expect(onConsentResponse).toHaveBeenLastCalledWith(CONSENT_RESPONSE_DECISION.ALLOW_ONCE);

    fireEvent.click(screen.getByRole('button', { name: 'Allow this command for this flow' }));
    expect(onConsentResponse).toHaveBeenLastCalledWith(CONSENT_RESPONSE_DECISION.ALLOW_FLOW);

    fireEvent.click(screen.getByRole('button', { name: 'Deny' }));
    expect(onConsentResponse).toHaveBeenLastCalledWith(CONSENT_RESPONSE_DECISION.DENY);
  });
});

describe('ChatInterface composer', () => {
  it('submits on Enter but not on Shift+Enter or during IME composition', () => {
    const onSubmit = vi.fn();
    render(<ChatInterface {...baseProps()} inputValue="hello" onSubmit={onSubmit} />);
    const textarea = screen.getByRole('textbox', { name: 'Message to the active role' });

    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.keyDown(textarea, { key: 'Enter', isComposing: true });
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not submit when the input is empty', () => {
    const onSubmit = vi.fn();
    render(<ChatInterface {...baseProps()} inputValue="   " onSubmit={onSubmit} />);
    const textarea = screen.getByRole('textbox', { name: 'Message to the active role' });

    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('ChatInterface permission control', () => {
  function renderComposer(hostPermissionLabel: string | null) {
    render(
      <ChatInterface
        subtitle="Owner"
        messages={[]}
        waitingLabel={null}
        inputValue=""
        inputDisabled={false}
        placeholder="Send a message"
        showComposer={true}
        hostPermissionLabel={hostPermissionLabel}
        onInputChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
  }

  it('shows the permission dropdown for consent-level flows', () => {
    renderComposer(null);
    expect(screen.getByRole('combobox', { name: 'Tool permission mode for this flow' })).toBeInTheDocument();
  });

  it('replaces the dropdown with a label when the agent decides permissions', () => {
    renderComposer('Auto (agent decides)');
    expect(screen.queryByRole('combobox', { name: 'Tool permission mode for this flow' })).not.toBeInTheDocument();
    expect(screen.getByText('Auto (agent decides)')).toBeInTheDocument();
  });
});

describe('ChatInterface document links', () => {
  const fileWrite: ConsentRequest = {
    kind: 'file-write',
    toolName: 'write_file',
    path: 'a-docs/notes.md',
    nodeId: 'node-1',
    role: 'owner',
    preview: { id: 'preview-1', changeKind: 'modify', origin: 'runtime-write' },
  };

  it('shows View change only for file writes with a preview, and opens the change', () => {
    const onOpenDocument = vi.fn();
    const { rerender } = render(
      <ChatInterface {...baseProps()} consentRequest={fileWrite} onOpenDocument={onOpenDocument} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'View proposed change to a-docs/notes.md' }));
    expect(onOpenDocument).toHaveBeenCalledWith({ kind: 'change-preview', previewId: 'preview-1', path: 'a-docs/notes.md' });

    const { preview: _preview, ...withoutPreview } = fileWrite as Extract<ConsentRequest, { kind: 'file-write' }>;
    rerender(<ChatInterface {...baseProps()} consentRequest={withoutPreview} onOpenDocument={onOpenDocument} />);
    expect(screen.queryByRole('button', { name: /View proposed change/ })).not.toBeInTheDocument();

    rerender(
      <ChatInterface
        {...baseProps()}
        consentRequest={{ kind: 'bash-command', toolName: 'run_command', command: 'ls', nodeId: 'n', role: 'owner' }}
        onOpenDocument={onOpenDocument}
      />,
    );
    expect(screen.queryByText('View change')).not.toBeInTheDocument();
  });

  it('answers the consent prompt without opening the view', () => {
    const onConsentResponse = vi.fn();
    const onOpenDocument = vi.fn();
    render(
      <ChatInterface
        {...baseProps()}
        consentRequest={fileWrite}
        onConsentResponse={onConsentResponse}
        onOpenDocument={onOpenDocument}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Allow' }));
    expect(onConsentResponse).toHaveBeenLastCalledWith(CONSENT_RESPONSE_DECISION.ALLOW_ONCE);
    fireEvent.click(screen.getByRole('button', { name: 'Deny' }));
    expect(onConsentResponse).toHaveBeenLastCalledWith(CONSENT_RESPONSE_DECISION.DENY);
    expect(onOpenDocument).not.toHaveBeenCalled();
  });

  it('renders one artifact link per handoff target with a path', () => {
    const onOpenDocument = vi.fn();
    render(
      <ChatInterface
        {...baseProps()}
        handoffApproval={{
          nodeId: 'owner-intake',
          targets: [
            { target_node_id: 'ta-design', artifact_path: '.a-society/state/p/f/record/brief.md' },
            { target_node_id: 'curator', artifact_path: null },
          ],
        }}
        onOpenDocument={onOpenDocument}
      />,
    );
    const link = screen.getByRole('button', { name: 'Open artifact for ta-design' });
    expect(link).toHaveTextContent('ta-design: brief.md');
    expect(screen.queryByRole('button', { name: 'Open artifact for curator' })).not.toBeInTheDocument();
    fireEvent.click(link);
    expect(onOpenDocument).toHaveBeenCalledWith({
      kind: 'file',
      path: '.a-society/state/p/f/record/brief.md',
      label: 'Handoff to ta-design',
    });
  });

  it('renders the closure approval banner and sends decisions for the closure node', () => {
    const onHandoffApproval = vi.fn();
    const onOpenDocument = vi.fn();
    const { rerender } = render(
      <ChatInterface
        {...baseProps()}
        closureApproval={{ nodeId: 'owner-closure', artifactPath: 'record\\closure.md' }}
        onHandoffApproval={onHandoffApproval}
        onOpenDocument={onOpenDocument}
      />,
    );
    expect(screen.getByText('Close the forward pass?')).toBeInTheDocument();
    const link = screen.getByRole('button', { name: 'Open closure artifact' });
    expect(link).toHaveTextContent('Closure artifact: closure.md');
    fireEvent.click(link);
    expect(onOpenDocument).toHaveBeenCalledWith({ kind: 'file', path: 'record\\closure.md', label: 'Closure artifact' });

    fireEvent.click(screen.getByRole('button', { name: 'Approve closure' }));
    expect(onHandoffApproval).toHaveBeenLastCalledWith('owner-closure', HANDOFF_APPROVAL_DECISION.APPROVE);
    fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
    expect(onHandoffApproval).toHaveBeenLastCalledWith('owner-closure', HANDOFF_APPROVAL_DECISION.DECLINE);

    rerender(
      <ChatInterface
        {...baseProps()}
        closureApproval={{ nodeId: 'owner-closure', artifactPath: null }}
        onHandoffApproval={onHandoffApproval}
      />,
    );
    expect(screen.getByText('The Owner did not name a closure artifact.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open closure artifact' })).not.toBeInTheDocument();
  });
});
