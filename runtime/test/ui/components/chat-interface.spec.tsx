// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChatInterface } from '../../../ui/src/components/ChatInterface';
import { CONSENT_RESPONSE_DECISION } from '../../../shared/protocol-constants.js';
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
