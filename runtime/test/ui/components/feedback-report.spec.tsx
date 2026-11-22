// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ChatInterface } from '../../../ui/src/components/ChatInterface';
import { FeedbackConsentModal } from '../../../ui/src/components/FeedbackConsentModal';
import { A_SOCIETY_FEEDBACK_SUBMIT_URL } from '../../../ui/src/app/constants';
import { ensureDialogSupport } from './setup-dom';

const REPORT = { path: '.a-society/feedback/demo-flow-1.md', absolutePath: '/ws/.a-society/feedback/demo-flow-1.md' };

function renderChat(feedbackReport: typeof REPORT | null) {
  return render(
    <ChatInterface
      subtitle="s"
      messages={[]}
      waitingLabel={null}
      inputValue=""
      inputDisabled={true}
      placeholder="p"
      showComposer={true}
      feedbackReport={feedbackReport}
      onInputChange={vi.fn()}
      onSubmit={vi.fn()}
    />,
  );
}

beforeAll(ensureDialogSupport);
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('FeedbackReportBanner', () => {
  it('shows the absolute path and the submission link', () => {
    renderChat(REPORT);
    expect(screen.getByText('Feedback report saved')).toBeInTheDocument();
    expect(screen.getByText(REPORT.absolutePath).tagName).toBe('CODE');
    const link = screen.getByRole('link', { name: 'How to submit a feedback report' });
    expect(link).toHaveAttribute('href', A_SOCIETY_FEEDBACK_SUBMIT_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('copies the absolute path and reads Copied for 2 s', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderChat(REPORT);
    const button = screen.getByRole('button', { name: 'Copy path' });
    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });
    expect(writeText).toHaveBeenCalledWith(REPORT.absolutePath);
    expect(button).toHaveTextContent('Copied');
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(button).toHaveTextContent('Copy path');
  });

  it('keeps the label when the clipboard write fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    renderChat(REPORT);
    const button = screen.getByRole('button', { name: 'Copy path' });
    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });
    expect(button).toHaveTextContent('Copy path');
  });

  it('does nothing when the clipboard API is unavailable', () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    renderChat(REPORT);
    const button = screen.getByRole('button', { name: 'Copy path' });
    expect(() => fireEvent.click(button)).not.toThrow();
    expect(button).toHaveTextContent('Copy path');
  });

  it('is absent without a report', () => {
    renderChat(null);
    expect(screen.queryByText('Feedback report saved')).not.toBeInTheDocument();
  });
});

describe('FeedbackConsentModal', () => {
  it('names the workspace feedback folder in a code element', () => {
    render(<FeedbackConsentModal title="t" body="b" details="d" onChoice={vi.fn()} />);
    expect(screen.getByText('.a-society/feedback/').tagName).toBe('CODE');
  });
});
